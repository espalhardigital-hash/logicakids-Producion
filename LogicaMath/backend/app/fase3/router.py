"""
Router FastAPI — Fase 3: Problemas de Texto y Sistemas Simples
==============================================================
Prefijo: /fase3
Tags:    fase3

Responsabilidades:
  - Dashboard con los 4 módulos (13 niveles de práctica libre y 12 desafíos, total 25 niveles).
  - Contenido de teoría dinámico.
  - Obtener preguntas (Bucle Espejo en Práctica, aleatorio en Desafíos).
  - Validar respuestas y administrar ProgresoMaestria.
"""

import random
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from ..db.session import get_db
from ..auth import get_current_user, get_current_student
from ..models.sql_models import (
    Alumno, Fase, Pregunta, ConfiguracionProgreso,
    ProgresoMaestria, Intento,
    StatusEnum, EstadoProgresoEnum, PlatformSettings
)
from ..utils.math_utils import normalize_response
# Reutilizamos modelos y schemas base (o los de fase2 adaptados si es necesario)
from ..fase2.models import NivelTeoria
from ..fase2.schemas import (
    Fase2Dashboard as Fase3Dashboard, Fase2ModuloInfo as Fase3ModuloInfo,
    Fase2NivelInfo as Fase3NivelInfo, Fase2DesafioInfo as Fase3DesafioInfo,
    Fase2PreguntaParaAlumno as Fase3PreguntaParaAlumno, Fase2AlternativaOut as Fase3AlternativaOut,
    Fase2ResponderPregunta as Fase3ResponderPregunta, Fase2ResultadoRespuesta as Fase3ResultadoRespuesta,
    Fase2ContenidoLectura as Fase3ContenidoLectura
)

router = APIRouter(prefix="/fase3", tags=["fase3"])

FASE3_ID = 3
MAX_ESPEJO = 3  # Intentos máximos en Bucle Espejo

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTES DE MÓDULOS Y NIVELES FASE 3
# ─────────────────────────────────────────────────────────────────────────────

MODULOS_META = {
    1: {
        "nombre": "El Escáner de la Verdad",
        "descripcion": "Traducción y filtro de datos irrelevantes.",
        "icono": "search",
        "color": "#F97316" # Naranja neón
    },
    2: {
        "nombre": "La Máquina del Tiempo",
        "descripcion": "Secuencia temporal, operaciones inversas y aceleración.",
        "icono": "clock",
        "color": "#EAB308" # Amarillo
    },
    3: {
        "nombre": "El Ojo del Comerciante",
        "descripcion": "Deducción de precios y sistemas de ecuaciones camuflados.",
        "icono": "shopping-cart",
        "color": "#3B82F6" # Azul
    },
    4: {
        "nombre": "El Maestro del Empaque",
        "descripcion": "Reparto equitativo y predicción de residuos.",
        "icono": "package",
        "color": "#A855F7" # Púrpura
    },
}

NIVELES_META = {
    (1, 1): {"nombre": "El Lápiz Mágico", "descripcion": "Enseña a leer la pregunta final antes de operar para filtrar distractores."},
    (1, 2): {"nombre": "El Escudo Anti-Basura", "descripcion": "Historias más largas con distractores numéricos engañosos."},
    (1, 3): {"nombre": "El Laberinto Numérico", "descripcion": "Problemas expertos donde todos los datos parecen importantes."},
    (2, 1): {"nombre": "El Reloj hacia Adelante", "descripcion": "Escribir la historia en estricto orden cronológico."},
    (2, 2): {"nombre": "El Reloj en Reversa", "descripcion": "Viajar al pasado usando operaciones inversas."},
    (2, 3): {"nombre": "El Tiempo Multiplicado", "descripcion": "Detección de aceleración (multiplicación) y partición (división)."},
    (2, 4): {"nombre": "El Laberinto del Tiempo", "descripcion": "Historias de tres o más pasos combinando las 4 operaciones."},
    (3, 1): {"nombre": "El Enigma de los Carritos", "descripcion": "Deducción de un precio oculto comparando inventarios casi idénticos."},
    (3, 2): {"nombre": "Cruce de Datos", "descripcion": "Reemplazo de un valor conocido en un segundo inventario."},
    (3, 3): {"nombre": "El Código Oculto", "descripcion": "Sistemas camuflados usando el método de La Balanza."},
    (4, 1): {"nombre": "El Reparto Perfecto", "descripcion": "División exacta empaquetando inventarios gigantes."},
    (4, 2): {"nombre": "Las Piezas Sobrantes", "descripcion": "Encontrar el residuo o elementos que no alcanzan a agruparse."},
    (4, 3): {"nombre": "El Ciclo Infinito", "descripcion": "Predecir qué pasará en un patrón circular repetitivo usando el residuo."},
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _seccion_operacion(modulo_id: int, nivel_id: int) -> tuple:
    if nivel_id in (11, 12, 13):
        seccion = modulo_id * 1000 + nivel_id
        return seccion, "mixta"
    else:
        seccion = modulo_id * 100 + nivel_id
        return seccion, "mixta"


async def _get_global_config(db: AsyncSession) -> dict:
    """Obtiene la configuración pedagógica global de la plataforma desde PlatformSettings."""
    result = await db.execute(
        select(PlatformSettings).where(PlatformSettings.key == "pedagogy_config")
    )
    settings = result.scalar_one_or_none()
    if not settings:
        return {
            "practica_libre": {
                "cantidad_requerida": 15,
                "porcentaje_aprobacion": 80,
                "usa_cronometro": False,
                "tiempo_default_segundos": 15,
                "tipo_feedback": "simple"
            },
            "desafios": {
                "cantidad_requerida": 20,
                "porcentaje_aprobacion": 90,
                "usa_cronometro": True,
                "tiempo_default_segundos_11": 25,
                "tiempo_default_segundos_12": 40,
                "tiempo_default_segundos_13": 50,
                "tipo_feedback": "simple"
            }
        }
    return settings.value


async def _get_config(db: AsyncSession, seccion: int, operacion: str) -> Optional[ConfiguracionProgreso]:
    result = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == FASE3_ID,
            ConfiguracionProgreso.seccion == seccion,
            ConfiguracionProgreso.operacion == operacion,
        ))
    )
    return result.scalar_one_or_none()

async def _get_or_create_progreso(
    db: AsyncSession, alumno_id: int, seccion: int, operacion: str
) -> ProgresoMaestria:
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno_id,
            ProgresoMaestria.fase_id == FASE3_ID,
            ProgresoMaestria.seccion == seccion,
            ProgresoMaestria.operacion == operacion,
        ))
    )
    progreso = result.scalar_one_or_none()
    if not progreso:
        progreso = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=FASE3_ID,
            seccion=seccion,
            operacion=operacion,
            estado=EstadoProgresoEnum.EN_PROGRESO,
            aciertos_acumulados=0,
            intentos_totales=0
        )
        db.add(progreso)
        await db.flush()
    return progreso

def _is_nivel_unlocked(progresos: dict, modulo_id: int, nivel_id: int) -> bool:
    if modulo_id == 1 and nivel_id == 1:
        return True
    if nivel_id > 1:
        prev_seccion, prev_op = _seccion_operacion(modulo_id, nivel_id - 1)
        prev_prog = progresos.get((prev_seccion, prev_op))
        return prev_prog is not None and prev_prog.estado == EstadoProgresoEnum.APROBADO
    if nivel_id == 1 and modulo_id > 1:
        prev_mod_levels = {1: 3, 2: 4, 3: 3, 4: 3}[modulo_id - 1]
        prev_seccion, prev_op = _seccion_operacion(modulo_id - 1, prev_mod_levels)
        prev_prog = progresos.get((prev_seccion, prev_op))
        return prev_prog is not None and prev_prog.estado == EstadoProgresoEnum.APROBADO
    return False

def _is_desafio_unlocked(progresos: dict, modulo_id: int, desafio_id: int, all_practice_approved: bool) -> bool:
    if not all_practice_approved:
        return False
    if desafio_id == 11:
        return True
    if desafio_id == 12:
        sec_d1, op_d1 = _seccion_operacion(modulo_id, 11)
        prog_d1 = progresos.get((sec_d1, op_d1))
        return prog_d1 is not None and prog_d1.estado == EstadoProgresoEnum.APROBADO
    if desafio_id == 13:
        sec_d2, op_d2 = _seccion_operacion(modulo_id, 12)
        prog_d2 = progresos.get((sec_d2, op_d2))
        return prog_d2 is not None and prog_d2.estado == EstadoProgresoEnum.APROBADO
    return False

# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=Fase3Dashboard)
async def get_fase3_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    alumno = await _get_alumno(db, current_user)

    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE3_ID,
        ))
    )
    progresos = {(p.seccion, p.operacion): p for p in result.scalars().all()}

    result = await db.execute(
        select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE3_ID)
    )
    configs = {(c.seccion, c.operacion): c for c in result.scalars().all()}

    global_cfg = await _get_global_config(db)
    pl_cfg = global_cfg.get("practica_libre", {})
    des_cfg = global_cfg.get("desafios", {})

    modulos = []
    modulo_niveles_map = {1: 3, 2: 4, 3: 3, 4: 3}
    
    for mod_id in range(1, 5):
        meta = MODULOS_META[mod_id]
        niveles = []
        desafios = []
        mod_porcentaje_total = 0
        num_niveles = modulo_niveles_map[mod_id]

        for niv_id in range(1, num_niveles + 1):
            seccion, operacion = _seccion_operacion(mod_id, niv_id)
            niv_meta = NIVELES_META.get((mod_id, niv_id), {"nombre": f"Nivel {niv_id}", "descripcion": ""})
            config = configs.get((seccion, operacion))
            progreso = progresos.get((seccion, operacion))

            if config is None:
                estado = "bloqueado"
                porcentaje = 0
                aciertos = 0
                requeridos = pl_cfg.get("cantidad_requerida", 15)
            elif progreso is None:
                estado = "en_progreso" if _is_nivel_unlocked(progresos, mod_id, niv_id) else "bloqueado"
                porcentaje = 0
                aciertos = 0
                requeridos = config.cantidad_requerida
            else:
                requeridos = config.cantidad_requerida
                aciertos = progreso.aciertos_acumulados
                porcentaje = min(100, progreso.porcentaje_actual)
                if progreso.estado == EstadoProgresoEnum.APROBADO:
                    estado = "dominado"
                elif progreso.estado == EstadoProgresoEnum.BLOQUEADO:
                    estado = "bloqueado"
                else:
                    estado = "en_progreso" if _is_nivel_unlocked(progresos, mod_id, niv_id) else "bloqueado"

            mod_porcentaje_total += porcentaje
            niveles.append(Fase3NivelInfo(
                nivel_id=niv_id,
                nombre=niv_meta["nombre"],
                descripcion=niv_meta["descripcion"],
                estado=estado,
                porcentaje=porcentaje,
                aciertos=aciertos,
                requeridos=requeridos,
                usa_cronometro=config.usa_cronometro if config else pl_cfg.get("usa_cronometro", False),
            ))

        all_practice_approved = all(n.estado == "dominado" for n in niveles)

        desafio_configs = {
            11: {"nombre": "Desafío 1: El Inspector", "dificultad": "estandar", "tiempo_limite": 60, "max_errores": 3},
            12: {"nombre": "Desafío 2: Distorsión", "dificultad": "avanzada", "tiempo_limite": 90, "max_errores": 3},
            13: {"nombre": "Desafío Final: Legendario", "dificultad": "maestria", "tiempo_limite": 120, "max_errores": 2},
        }

        for des_id in [11, 12, 13]:
            seccion, operacion = _seccion_operacion(mod_id, des_id)
            d_conf = desafio_configs[des_id]
            config = configs.get((seccion, operacion))
            progreso = progresos.get((seccion, operacion))

            if config is None:
                estado = "bloqueado"
                porcentaje = 0
                aciertos = 0
                requeridos = des_cfg.get("cantidad_requerida", 20 if des_id != 13 else 10)
            elif progreso is None:
                estado = "en_progreso" if _is_desafio_unlocked(progresos, mod_id, des_id, all_practice_approved) else "bloqueado"
                porcentaje = 0
                aciertos = 0
                requeridos = config.cantidad_requerida
            else:
                requeridos = config.cantidad_requerida
                aciertos = progreso.aciertos_acumulados
                porcentaje = min(100, progreso.porcentaje_actual)
                if progreso.estado == EstadoProgresoEnum.APROBADO:
                    estado = "dominado"
                elif progreso.estado == EstadoProgresoEnum.BLOQUEADO:
                    estado = "bloqueado"
                else:
                    estado = "en_progreso" if _is_desafio_unlocked(progresos, mod_id, des_id, all_practice_approved) else "bloqueado"

            if config:
                usa_crono = config.usa_cronometro
                tiempo_limite = config.tiempo_default_segundos if (config.tiempo_default_segundos is not None and config.tiempo_default_segundos > 0) else d_conf["tiempo_limite"]
            else:
                usa_crono = des_cfg.get("usa_cronometro", True)
                tiempo_key = f"tiempo_default_segundos_{des_id}"
                tiempo_limite = des_cfg.get(tiempo_key, d_conf["tiempo_limite"])

            if not usa_crono:
                tiempo_limite = 0

            mod_porcentaje_total += porcentaje
            desafios.append(Fase3DesafioInfo(
                desafio_id=des_id,
                nombre=d_conf["nombre"],
                dificultad=d_conf["dificultad"],
                estado=estado,
                porcentaje=porcentaje,
                aciertos=aciertos,
                requeridos=requeridos,
                tiempo_limite=tiempo_limite,
                max_errores=d_conf["max_errores"],
            ))

        mod_porcentaje = mod_porcentaje_total // (num_niveles + 3)
        
        if all(n.estado == "dominado" for n in niveles) and all(d.estado == "dominado" for d in desafios):
            estado_modulo = "dominado"
        elif all(n.estado == "bloqueado" for n in niveles):
            estado_modulo = "bloqueado"
        else:
            estado_modulo = "en_progreso"

        modulos.append(Fase3ModuloInfo(
            modulo_id=mod_id,
            nombre=meta["nombre"],
            descripcion=meta["descripcion"],
            icono=meta["icono"],
            color=meta["color"],
            estado=estado_modulo,
            porcentaje_global=mod_porcentaje,
            niveles=niveles,
            desafios=desafios,
        ))

    puntos = sum(p.aciertos_acumulados for p in progresos.values())
    total_niveles_aprobados = sum(
        1 for p in progresos.values() if p.estado == EstadoProgresoEnum.APROBADO
    )
    
    # 25 niveles en total (13 práctica + 12 desafíos)
    desafio_mixto_disponible = (total_niveles_aprobados >= 25)
    desafio_mixto_estado = "completado" if desafio_mixto_disponible else "bloqueado"

    return Fase3Dashboard(
        alumno_nombre=alumno.nombre,
        puntos_totales=puntos,
        modulos=modulos,
        desafio_mixto_disponible=desafio_mixto_disponible,
        desafio_mixto_estado=desafio_mixto_estado,
    )

# ─────────────────────────────────────────────────────────────────────────────
# OBTENER PREGUNTA
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/modulo/{modulo_id}/nivel/{nivel_id}/pregunta", response_model=Fase3PreguntaParaAlumno)
async def get_pregunta_fase3(
    modulo_id: int,
    nivel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    alumno = await _get_alumno(db, current_user)
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)

    if nivel_id in (11, 12, 13):
        result = await db.execute(
            select(Intento.pregunta_id)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == FASE3_ID,
                Intento.seccion == seccion,
                Intento.es_correcta == True
            ))
        )
        correct_pregunta_ids = set(result.scalars().all())

        result = await db.execute(
            select(Pregunta)
            .options(selectinload(Pregunta.alternativas))
            .where(and_(
                Pregunta.fase_id == FASE3_ID,
                Pregunta.seccion == seccion,
                Pregunta.estado == StatusEnum.ACTIVO
            ))
        )
        preguntas = result.scalars().all()
        if not preguntas:
            raise HTTPException(status_code=404, detail="No hay preguntas en el pool para este desafío.")

        uncompleted = [q for q in preguntas if q.id not in correct_pregunta_ids]
        if not uncompleted:
            uncompleted = preguntas

        pregunta_elex = random.choice(uncompleted)

        alts_out = None
        if nivel_id in (11, 12):
            alts_out = [
                Fase3AlternativaOut(id=alt.id, texto=alt.texto, orden=alt.orden)
                for alt in pregunta_elex.alternativas
            ]
            random.shuffle(alts_out)

        if config:
            tiene_crono = config.usa_cronometro
            tiempo_lim = config.tiempo_default_segundos if (config.tiempo_default_segundos is not None and config.tiempo_default_segundos > 0) else (60 if nivel_id == 11 else (90 if nivel_id == 12 else 120))
        else:
            global_cfg = await _get_global_config(db)
            des_cfg = global_cfg.get("desafios", {})
            tiene_crono = des_cfg.get("usa_cronometro", True)
            tiempo_key = f"tiempo_default_segundos_{nivel_id}"
            tiempo_lim = des_cfg.get(tiempo_key, 60 if nivel_id == 11 else (90 if nivel_id == 12 else 120))

        if not tiene_crono:
            tiempo_lim = None

        return Fase3PreguntaParaAlumno(
            id=pregunta_elex.id,
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=pregunta_elex.enunciado,
            tipo_pregunta="multiple_opcion" if nivel_id in (11, 12) else "respuesta_numerica",
            tiene_cronometro=tiene_crono,
            tiempo_limite_segundos=tiempo_lim,
            alternativas=alts_out,
            datos_numericos=pregunta_elex.datos_numericos,
        )
    else:
        result = await db.execute(
            select(Intento)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == FASE3_ID,
                Intento.seccion == seccion,
            ))
            .order_by(Intento.fecha.desc())
            .limit(1)
        )
        latest_attempt = result.scalar_one_or_none()

        espejo_pregunta = None
        
        if latest_attempt and not latest_attempt.es_correcta:
            result_q = await db.execute(select(Pregunta).where(Pregunta.id == latest_attempt.pregunta_id))
            failed_pregunta = result_q.scalar_one_or_none()
            
            if failed_pregunta and failed_pregunta.estructura_padre_id:
                res_fam = await db.execute(
                    select(Intento)
                    .join(Pregunta, Intento.pregunta_id == Pregunta.id)
                    .where(and_(
                        Intento.alumno_id == alumno.id,
                        Pregunta.estructura_padre_id == failed_pregunta.estructura_padre_id
                    ))
                    .order_by(Intento.fecha.desc())
                )
                family_attempts = res_fam.scalars().all()
                attempts_count = len(family_attempts)

                if attempts_count > 0 and not family_attempts[0].es_correcta and attempts_count < (MAX_ESPEJO + 1):
                    result_fam_qs = await db.execute(
                        select(Pregunta)
                        .where(and_(
                            Pregunta.estructura_padre_id == failed_pregunta.estructura_padre_id,
                            Pregunta.estado == StatusEnum.ACTIVO
                        ))
                    )
                    family_questions = result_fam_qs.scalars().all()
                    
                    attempted_ids = {a.pregunta_id for a in family_attempts}
                    unattempted_mirrors = [
                        q for q in family_questions
                        if q.id not in attempted_ids and q.datos_numericos and q.datos_numericos.get("es_espejo") is True
                    ]

                    if unattempted_mirrors:
                        espejo_pregunta = random.choice(unattempted_mirrors)

        if espejo_pregunta:
            pregunta_elex = espejo_pregunta
        else:
            result_qs = await db.execute(
                select(Pregunta)
                .where(and_(
                    Pregunta.fase_id == FASE3_ID,
                    Pregunta.seccion == seccion,
                    Pregunta.estado == StatusEnum.ACTIVO
                ))
            )
            preguntas = result_qs.scalars().all()
            if not preguntas:
                raise HTTPException(status_code=404, detail="No hay preguntas en el pool para este nivel.")

            originales = [q for q in preguntas if q.datos_numericos and q.datos_numericos.get("es_espejo") is False]
            if not originales:
                originales = preguntas

            res_solved = await db.execute(
                select(Pregunta.estructura_padre_id)
                .join(Intento, Intento.pregunta_id == Pregunta.id)
                .where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == FASE3_ID,
                    Intento.seccion == seccion,
                    Intento.es_correcta == True
                ))
            )
            solved_families = set(res_solved.scalars().all())

            unsolved_originales = [o for o in originales if o.estructura_padre_id not in solved_families]
            if not unsolved_originales:
                unsolved_originales = originales

            pregunta_elex = random.choice(unsolved_originales)

        if config:
            tiene_crono = config.usa_cronometro
            tiempo_lim = config.tiempo_default_segundos
        else:
            global_cfg = await _get_global_config(db)
            pl_cfg = global_cfg.get("practica_libre", {})
            tiene_crono = pl_cfg.get("usa_cronometro", False)
            tiempo_lim = pl_cfg.get("tiempo_default_segundos", 15)

        if not tiene_crono:
            tiempo_lim = None

        return Fase3PreguntaParaAlumno(
            id=pregunta_elex.id,
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=pregunta_elex.enunciado,
            tipo_pregunta="constructor_operaciones",
            tiene_cronometro=tiene_crono,
            tiempo_limite_segundos=tiempo_lim,
            datos_numericos=pregunta_elex.datos_numericos,
        )

# ─────────────────────────────────────────────────────────────────────────────
# RESPONDER Y VALIDAR
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/responder", response_model=Fase3ResultadoRespuesta)
async def responder_fase3(
    payload: Fase3ResponderPregunta,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    alumno = await _get_alumno(db, current_user)
    modulo_id = payload.modulo_id
    nivel_id = payload.nivel_id
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)
    progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)

    if not payload.pregunta_id:
        raise HTTPException(status_code=400, detail="pregunta_id es requerido.")

    result_q = await db.execute(
        select(Pregunta)
        .options(selectinload(Pregunta.alternativas))
        .where(Pregunta.id == payload.pregunta_id)
    )
    pregunta = result_q.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada.")

    es_correcta = False
    respuesta_correcta_str = pregunta.respuesta_correcta

    if nivel_id in (11, 12):
        if not payload.alternativa_id:
            raise HTTPException(status_code=400, detail="alternativa_id es requerido.")
        
        alternativa_elegida = next((a for a in pregunta.alternativas if a.id == payload.alternativa_id), None)
        if not alternativa_elegida:
            raise HTTPException(status_code=404, detail="Alternativa no encontrada.")
        
        es_correcta = alternativa_elegida.es_correcta
        correct_alt = next((a for a in pregunta.alternativas if a.es_correcta), None)
        respuesta_correcta_str = correct_alt.texto if correct_alt else pregunta.respuesta_correcta

    else:
        resp_dada = (payload.respuesta_dada or "").strip().lower().replace(",", ".").replace("r$ ", "")
        resp_corr = respuesta_correcta_str.strip().lower().replace(",", ".").replace("r$ ", "")
        es_correcta = resp_dada == resp_corr

    intento = Intento(
        alumno_id=alumno.id,
        pregunta_id=payload.pregunta_id,
        respuesta_dada=payload.respuesta_dada or (str(payload.alternativa_id) if payload.alternativa_id else ""),
        es_correcta=es_correcta,
        fase_id=FASE3_ID,
        seccion=seccion,
        operacion=operacion,
        tiempo_respuesta_segundos=payload.tiempo_respuesta_segundos,
    )
    db.add(intento)
    await db.flush()
    
    if nivel_id in (11, 12, 13):
        max_errores = 2 if nivel_id == 13 else 3
        
        result_att = await db.execute(
            select(Intento)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == FASE3_ID,
                Intento.seccion == seccion,
            ))
            .order_by(Intento.fecha.desc())
        )
        attempts = result_att.scalars().all()
        
        errores_sesion = 0
        if not es_correcta:
            errores_sesion = 1
            
        current_aciertos = progreso.aciertos_acumulados
        aciertos_found = 0
        
        if current_aciertos > 0:
            for att in attempts:
                if att.id == intento.id:
                    continue
                if att.es_correcta:
                    aciertos_found += 1
                    if aciertos_found > current_aciertos:
                        break
                else:
                    if aciertos_found <= current_aciertos:
                        errores_sesion += 1
        
        if errores_sesion >= max_errores:
            progreso.aciertos_acumulados = 0
            progreso.porcentaje_actual = 0
            progreso.intentos_totales = 0
            progreso.estado = EstadoProgresoEnum.EN_PROGRESO
            await db.commit()
            
            return Fase3ResultadoRespuesta(
                es_correcta=es_correcta,
                respuesta_correcta=respuesta_correcta_str,
                aciertos_acumulados=0,
                intentos_totales=0,
                porcentaje_actual=0,
                bloque_completado=False,
                early_exit=True,
                errores_sesion=errores_sesion,
                max_errores_tolerados=max_errores,
            )
        else:
            progreso.intentos_totales += 1
            ya_resuelta = False
            if es_correcta:
                result_previo = await db.execute(
                    select(Intento.id).where(and_(
                        Intento.alumno_id == alumno.id,
                        Intento.pregunta_id == pregunta.id,
                        Intento.es_correcta == True,
                        Intento.id != intento.id
                    ))
                )
                if result_previo.scalar_one_or_none():
                    ya_resuelta = True

            if es_correcta and not ya_resuelta:
                progreso.aciertos_acumulados += 1
                
            if config:
                cantidad_req = config.cantidad_requerida
                porc_aprobacion = config.porcentaje_aprobacion
            else:
                global_cfg = await _get_global_config(db)
                des_cfg = global_cfg.get("desafios", {})
                cantidad_req = des_cfg.get("cantidad_requerida", 10 if nivel_id == 13 else 20)
                porc_aprobacion = des_cfg.get("porcentaje_aprobacion", 90)

            progreso.porcentaje_actual = min(100, int((progreso.aciertos_acumulados / cantidad_req) * 100)) if cantidad_req > 0 else 0
            
            bloque_completado = False
            fase_completada = False
            
            if progreso.porcentaje_actual >= porc_aprobacion and progreso.aciertos_acumulados >= cantidad_req:
                if progreso.estado != EstadoProgresoEnum.APROBADO:
                    progreso.estado = EstadoProgresoEnum.APROBADO
                    progreso.fecha_aprobacion = datetime.utcnow()
                bloque_completado = True
                
                await db.flush()
                res_aprob = await db.execute(
                    select(func.count(ProgresoMaestria.id)).where(and_(
                        ProgresoMaestria.alumno_id == alumno.id,
                        ProgresoMaestria.fase_id == FASE3_ID,
                        ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
                    ))
                )
                if res_aprob.scalar() >= 25:
                    fase_completada = True
                
            await db.commit()
            
            return Fase3ResultadoRespuesta(
                es_correcta=es_correcta,
                respuesta_correcta=respuesta_correcta_str,
                aciertos_acumulados=progreso.aciertos_acumulados,
                intentos_totales=progreso.intentos_totales,
                porcentaje_actual=progreso.porcentaje_actual,
                bloque_completado=bloque_completado,
                fase_completada=fase_completada,
                early_exit=False,
                errores_sesion=errores_sesion,
                max_errores_tolerados=max_errores,
            )

    else:
        progreso.intentos_totales += 1
        ya_resuelta = False
        if es_correcta:
            result_previo = await db.execute(
                select(Intento.id).where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.pregunta_id == pregunta.id,
                    Intento.es_correcta == True,
                    Intento.id != intento.id
                ))
            )
            if result_previo.scalar_one_or_none():
                ya_resuelta = True

        if es_correcta and not ya_resuelta:
            progreso.aciertos_acumulados += 1

        if config:
            cantidad_req = config.cantidad_requerida
            porc_aprobacion = config.porcentaje_aprobacion
        else:
            global_cfg = await _get_global_config(db)
            pl_cfg = global_cfg.get("practica_libre", {})
            cantidad_req = pl_cfg.get("cantidad_requerida", 15)
            porc_aprobacion = pl_cfg.get("porcentaje_aprobacion", 80)

        progreso.porcentaje_actual = min(100, int((progreso.aciertos_acumulados / cantidad_req) * 100)) if cantidad_req > 0 else 0

        bloque_completado = False
        fase_completada = False

        if progreso.porcentaje_actual >= porc_aprobacion and progreso.aciertos_acumulados >= cantidad_req:
            if progreso.estado != EstadoProgresoEnum.APROBADO:
                progreso.estado = EstadoProgresoEnum.APROBADO
                progreso.fecha_aprobacion = datetime.utcnow()
            bloque_completado = True
            
            await db.flush()
            res_aprob = await db.execute(
                select(func.count(ProgresoMaestria.id)).where(and_(
                    ProgresoMaestria.alumno_id == alumno.id,
                    ProgresoMaestria.fase_id == FASE3_ID,
                    ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
                ))
            )
            if res_aprob.scalar() >= 25:
                fase_completada = True

        espejo = False
        intentos_espejo = 0

        if not es_correcta and pregunta.estructura_padre_id:
            res_fam = await db.execute(
                select(Intento)
                .join(Pregunta, Intento.pregunta_id == Pregunta.id)
                .where(and_(
                    Intento.alumno_id == alumno.id,
                    Pregunta.estructura_padre_id == pregunta.estructura_padre_id
                ))
                .order_by(Intento.fecha.desc())
            )
            family_attempts = res_fam.scalars().all()
            
            intentos_fallidos_consecutivos = 0
            for att in family_attempts:
                if not att.es_correcta:
                    intentos_fallidos_consecutivos += 1
                else:
                    break
            
            intentos_espejo = intentos_fallidos_consecutivos
            if intentos_espejo <= MAX_ESPEJO:
                espejo = True

        await db.commit()

        return Fase3ResultadoRespuesta(
            es_correcta=es_correcta,
            respuesta_correcta=respuesta_correcta_str,
            aciertos_acumulados=progreso.aciertos_acumulados,
            intentos_totales=progreso.intentos_totales,
            porcentaje_actual=progreso.porcentaje_actual,
            bloque_completado=bloque_completado,
            fase_completada=fase_completada,
            early_exit=False,
            es_espejo=espejo,
            intentos_espejo_actuales=intentos_espejo,
            intentos_espejo_max=MAX_ESPEJO,
            soporte_avanzado=(intentos_espejo == MAX_ESPEJO) if espejo else False,
        )

@router.get("/lectura/{modulo_id}/nivel/{nivel_id}", response_model=Fase3ContenidoLectura)
async def get_lectura_fase3(
    modulo_id: int,
    nivel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(NivelTeoria).where(and_(
            NivelTeoria.fase_id == FASE3_ID,
            NivelTeoria.modulo_id == modulo_id,
            NivelTeoria.nivel_id == nivel_id,
        ))
    )
    theory = result.scalar_one_or_none()
    
    if not theory:
        raise HTTPException(status_code=404, detail="Teoría no encontrada.")
    
    parrafos = [p.strip() for p in theory.texto_descubrimiento.split("\n") if p.strip()]
    
    return Fase3ContenidoLectura(
        modulo_id=modulo_id,
        nivel_id=nivel_id,
        titulo=theory.titulo,
        parrafos=parrafos,
        ejemplos=theory.ejemplos,
        tip_pedagogico=theory.advertencia,
        diccionario=getattr(theory, 'diccionario', None),
        interactivos=theory.interactivos,
    )


# ─────────────────────────────────────────────────────────────────────────────
# GRADUACIÓN A FASE 4 (Exige 25 niveles aprobados)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/graduate")
async def graduate_fase3(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Gradúa al alumno de Fase 3 a Fase 4 si todos los 25 niveles (13 práctica + 12 desafíos) están dominados.
    """
    alumno = await _get_alumno(db, current_user)

    result = await db.execute(
        select(func.count(ProgresoMaestria.id)).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE3_ID,
            ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO,
        ))
    )
    aprobados = result.scalar()
    if aprobados < 25:
        raise HTTPException(
            status_code=400,
            detail=f"Debes dominar los 25 niveles de Fase 3 (13 de práctica y 12 desafíos). Llevas {aprobados}/25.",
        )

    result = await db.execute(select(Fase).where(Fase.orden == 4))
    fase4 = result.scalar_one_or_none()
    if not fase4:
        raise HTTPException(status_code=500, detail="La Fase 4 aún no ha sido configurada.")

    alumno.fase_actual_id = fase4.id
    await db.commit()

    return {
        "message": "¡Felicitaciones! ¡Has dominado la Fase 3 y avanzas a la Fase 4!",
        "nueva_fase_id": fase4.id,
        "nueva_fase_nombre": fase4.nombre,
    }
