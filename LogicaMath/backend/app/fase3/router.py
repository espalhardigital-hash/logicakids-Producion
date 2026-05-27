"""
Router FastAPI — Fase 3: Problemas de Texto y Sistemas Simples (Refactorizado)
==============================================================================
Prefijo: /fase3
Tags:    fase3

Responsabilidades:
  - Dashboard con los 5 módulos (15 niveles de práctica libre y 15 desafíos, total 30 niveles).
  - Contenido de teoría dinámico desde la tabla NivelTeoria.
  - Obtener preguntas (desde BD para práctica libre y desafíos).
  - Validar respuestas:
    - Bucle Espejo (Mirror Loop) en modo Práctica Libre (1-3).
    - Salida Temprana (Early Exit) en modo Desafío (11-13) con reinicio de progreso.
  - Graduación a Fase 4 (requiere 30 niveles dominados).
"""

import random
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, delete
from sqlalchemy.orm import selectinload

from ..db.session import get_db
from ..auth import get_current_user, get_current_student
from ..models.sql_models import (
    Alumno, Fase, Pregunta, ConfiguracionProgreso,
    ProgresoMaestria, Intento, PoolAsignadoAlumno,
    StatusEnum, EstadoProgresoEnum, Alternativa,
    OperacionEnum, TipoPreguntaEnum, TipoErrorEnum,
    PlatformSettings, User,
)
from ..utils.math_utils import normalize_response
from ..fase2.models import NivelTeoria
from ..fase2.schemas import (
    Fase2Dashboard as Fase3Dashboard, Fase2ModuloInfo as Fase3ModuloInfo,
    Fase2NivelInfo as Fase3NivelInfo, Fase2DesafioInfo as Fase3DesafioInfo,
    Fase2PreguntaParaAlumno as Fase3PreguntaParaAlumno, Fase2AlternativaOut as Fase3AlternativaOut,
    Fase2ResponderPregunta as Fase3ResponderPregunta, Fase2ResultadoRespuesta as Fase3ResultadoRespuesta,
    Fase2ContenidoLectura as Fase3ContenidoLectura, Fase2CerrarRescate as Fase3CerrarRescate
)

router = APIRouter(prefix="/fase3", tags=["fase3"])

FASE3_ID = 3
MAX_ESPEJO = 3  # Intentos máximos en Bucle Espejo

# ─────────────────────────────────────────────────────────────────────────────
# HELPER DE SINCRONIZACIÓN CON CONFIGURACIONES HEREDADAS (unlockedLevels)
# ─────────────────────────────────────────────────────────────────────────────
async def _sync_unlocked_levels(db: AsyncSession, alumno_id: int, operacion: str):
    from sqlalchemy.orm.attributes import flag_modified
    result_alumno = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result_alumno.scalar_one_or_none()
    if alumno:
        result_user = await db.execute(select(User).where(User.id == alumno.user_id))
        user = result_user.scalar_one_or_none()
        if user:
            settings = user.settings or {}
            if "unlockedLevels" not in settings:
                settings["unlockedLevels"] = {}
            
            # Sincronización namespaced para Fase 3 para evitar colisiones
            if "fase3" not in settings["unlockedLevels"]:
                settings["unlockedLevels"]["fase3"] = {}
                
            cat_map = {
                "suma": "addition",
                "resta": "subtraction",
                "multiplicacion": "multiplication",
                "division": "division",
                "mixta": "challenge"
            }
            cat = cat_map.get(operacion, "challenge")
            settings["unlockedLevels"]["fase3"][cat] = 6
            user.settings = settings
            flag_modified(user, "settings")
            await db.flush()

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTES DE MÓDULOS Y NIVELES FASE 3
# ─────────────────────────────────────────────────────────────────────────────

MODULOS_META = {
    1: {
        "nombre": "El Detective Literario",
        "descripcion": "Filtrado de datos basura, distractores y modelado del problema.",
        "icono": "search",
        "color": "#F97316" # Naranja neón
    },
    2: {
        "nombre": "Secuencia Temporal",
        "descripcion": "Cronología de eventos y análisis retrospectivo.",
        "icono": "clock",
        "color": "#EAB308" # Amarillo
    },
    3: {
        "nombre": "Deducción de Precios",
        "descripcion": "Introducción intuitiva a sistemas de ecuaciones.",
        "icono": "shopping-cart",
        "color": "#3B82F6" # Azul
    },
    4: {
        "nombre": "Reparto y Residuos",
        "descripcion": "Algoritmo de la división, agrupamiento y patrones modulares.",
        "icono": "package",
        "color": "#A855F7" # Púrpura
    },
    5: {
        "nombre": "Ciclos y Agrupaciones Máximas",
        "descripcion": "Múltiplos, divisores y aplicaciones narrativas (MCM y MCD).",
        "icono": "refresh-cw",
        "color": "#10B981" # Verde esmeralda
    }
}

NIVELES_META = {
    (1, 1): {"nombre": "Aislamiento de Variables Críticas", "descripcion": "Resaltador lógico sobre textos densos, marcar solo lo operable."},
    (1, 2): {"nombre": "Datos Útiles vs. Datos Basura", "descripcion": "Tachar información irrelevante como fechas o edades que no afectan el cálculo."},
    (1, 3): {"nombre": "Descarte por Incongruencia", "descripcion": "Identificar magnitudes que no se pueden mezclar, ej. sumar años con litros."},
    (2, 1): {"nombre": "Operaciones Cronológicas", "descripcion": "Operaciones aditivas acumulativas en riguroso orden cronológico."},
    (2, 2): {"nombre": "Álgebra Retrospectiva", "descripcion": "Reconstrucción hacia atrás para hallar el inicio."},
    (2, 3): {"nombre": "Mutaciones Sucesivas", "descripcion": "Resolución de textos complejos con 3 o más mutaciones sucesivas."},
    (3, 1): {"nombre": "Comparación de Carritos", "descripcion": "Deducción de valores unitarios por diferencia visual de grupos."},
    (3, 2): {"nombre": "Grilla de Doble Entrada", "descripcion": "Completado analítico de tablas matriciales cruzando datos parciales."},
    (3, 3): {"nombre": "Álgebra Visual", "descripcion": "Sistemas simples de dos variables combinando sustitución e intuición."},
    (4, 1): {"nombre": "Agrupación Visual", "descripcion": "Cálculo de repartos exactos y cuotabilización en inventarios macro."},
    (4, 2): {"nombre": "Análisis de Resto", "descripcion": "Interpretación lógica del residuo: sobrantes y cajas incompletas."},
    (4, 3): {"nombre": "Sucesión Circular", "descripcion": "Patrones modulares y congruencias cíclicas basadas en el resto."},
    (5, 1): {"nombre": "Visualización de Saltos y Empaques", "descripcion": "Recta numérica interactiva y llenado de cajas exactas."},
    (5, 2): {"nombre": "Encuentros Periódicos - MCM", "descripcion": "Sincronización de eventos, ej. semáforos, planetas, salidas de autobuses."},
    (5, 3): {"nombre": "División Máxima Exacta - MCD", "descripcion": "Corte de listones o armado de kits idénticos sin sobrantes."},
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS DE NAVEGACIÓN Y ACCESO
# ─────────────────────────────────────────────────────────────────────────────

def _seccion_operacion(modulo_id: int, nivel_id: int) -> tuple:
    if modulo_id == 99 or nivel_id in (11, 12, 13):
        # Desafíos
        seccion = modulo_id * 1000 + nivel_id
        return seccion, "mixta"
    else:
        # Práctica libre
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
    """Verifica si un nivel de práctica libre está desbloqueado secuencialmente."""
    if modulo_id == 1 and nivel_id == 1:
        return True
    
    if nivel_id > 1:
        prev_seccion, prev_op = _seccion_operacion(modulo_id, nivel_id - 1)
        prev_prog = progresos.get((prev_seccion, prev_op))
        return prev_prog is not None and prev_prog.estado == EstadoProgresoEnum.APROBADO
    
    if nivel_id == 1 and modulo_id > 1:
        prev_mod_levels = 3 # Todos los módulos en Fase 3 tienen 3 niveles prácticos
        prev_seccion, prev_op = _seccion_operacion(modulo_id - 1, prev_mod_levels)
        prev_prog = progresos.get((prev_seccion, prev_op))
        return prev_prog is not None and prev_prog.estado == EstadoProgresoEnum.APROBADO
    
    return False


def _is_desafio_unlocked(progresos: dict, modulo_id: int, desafio_id: int, all_practice_approved: bool) -> bool:
    """Verifica si un desafío está desbloqueado basado en la maestría de práctica."""
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
# DASHBOARD (30 niveles totales)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=Fase3Dashboard)
async def get_fase3_dashboard(
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Devuelve el estado completo de los 5 módulos de Fase 3 para el alumno,
    incluyendo niveles de práctica libre y desafíos.
    """
    # Cargar progresos en Fase 3
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE3_ID,
        ))
    )
    progresos = {(p.seccion, p.operacion): p for p in result.scalars().all()}

    # Cargar configuraciones
    result = await db.execute(
        select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE3_ID)
    )
    configs = {(c.seccion, c.operacion): c for c in result.scalars().all()}

    global_cfg = await _get_global_config(db)
    pl_cfg = global_cfg.get("practica_libre", {})
    des_cfg = global_cfg.get("desafios", {})

    modulos = []
    
    # 5 módulos en total
    for mod_id in range(1, 6):
        meta = MODULOS_META[mod_id]
        niveles = []
        desafios = []
        mod_porcentaje_total = 0
        num_niveles = 3 # Todos los módulos tienen exactamente 3 niveles de práctica libre en Fase 3

        # 1. Cargar niveles de práctica libre
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

        # 2. Cargar desafíos (11, 12, 13)
        desafio_configs = {
            11: {"nombre": "Desafío 1", "dificultad": "estandar", "tiempo_limite": 25, "max_errores": 3},
            12: {"nombre": "Desafío 2", "dificultad": "avanzada", "tiempo_limite": 40, "max_errores": 3},
            13: {"nombre": "Desafío Final", "dificultad": "maestria", "tiempo_limite": 50, "max_errores": 2},
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
    
    # 30 niveles en total para la Fase 3 completa
    desafio_mixto_disponible = (total_niveles_aprobados >= 30)
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
    reload: bool = False,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Devuelve la siguiente pregunta para un módulo y nivel (o desafío) dados.
    Soporta Bucle Espejo en práctica libre y selección aleatoria en desafíos.
    """
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)

    # 1. MODO DESAFÍO (nivel_id en 11, 12, 13)
    if nivel_id in (11, 12, 13):
        progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)
        if reload:
            # Borrar los intentos de la tabla general `Intento` para esta sección
            await db.execute(
                delete(Intento).where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == FASE3_ID,
                    Intento.seccion == seccion
                ))
            )
            progreso.aciertos_acumulados = 0
            progreso.intentos_totales = 0
            progreso.porcentaje_actual = 0
            progreso.estado = EstadoProgresoEnum.EN_PROGRESO
            await db.commit()

        # Obtener preguntas del desafío que el alumno ya aprobó
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
        if pregunta_elex.tipo_pregunta.value == "multiple_opcion" or pregunta_elex.alternativas:
            alts_out = [
                Fase3AlternativaOut(id=alt.id, texto=alt.texto, orden=alt.orden)
                for alt in pregunta_elex.alternativas
            ]
            random.shuffle(alts_out)

        if config:
            tiene_crono = config.usa_cronometro
            tiempo_lim = config.tiempo_default_segundos if (config.tiempo_default_segundos is not None and config.tiempo_default_segundos > 0) else (25 if nivel_id == 11 else (40 if nivel_id == 12 else 50))
        else:
            global_cfg = await _get_global_config(db)
            des_cfg = global_cfg.get("desafios", {})
            tiene_crono = des_cfg.get("usa_cronometro", True)
            tiempo_key = f"tiempo_default_segundos_{nivel_id}"
            tiempo_lim = des_cfg.get(tiempo_key, 25 if nivel_id == 11 else (40 if nivel_id == 12 else 50))

        if not tiene_crono:
            tiempo_lim = None

        return Fase3PreguntaParaAlumno(
            id=pregunta_elex.id,
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=pregunta_elex.enunciado,
            tipo_pregunta=pregunta_elex.tipo_pregunta.value,
            tiene_cronometro=tiene_crono,
            tiempo_limite_segundos=tiempo_lim,
            alternativas=alts_out,
            datos_numericos=pregunta_elex.datos_numericos,
            aciertos_acumulados=progreso.aciertos_acumulados,
            intentos_totales=progreso.intentos_totales,
            porcentaje_actual=progreso.porcentaje_actual,
        )
        
    # 2. MODO PRÁCTICA LIBRE (1-3)
    else:
        progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)
        
        if reload:
            # Borrar los intentos de la tabla general `Intento` para esta sección
            await db.execute(
                delete(Intento).where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == FASE3_ID,
                    Intento.seccion == seccion
                ))
            )
            progreso.aciertos_acumulados = 0
            progreso.intentos_totales = 0
            progreso.porcentaje_actual = 0
            progreso.estado = EstadoProgresoEnum.EN_PROGRESO
            await db.commit()
            latest_attempt = None
        else:
            # Consultar el último intento en este nivel
            result = await db.execute(
                select(Intento)
                .where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == FASE3_ID,
                    Intento.seccion == seccion,
                ))
                .order_by(Intento.fecha.desc(), Intento.id.desc())
                .limit(1)
            )
            latest_attempt = result.scalar_one_or_none()

        espejo_pregunta = None
        
        # Bucle Espejo (solo si el último intento falló y no fue bypass)
        if latest_attempt and not latest_attempt.es_correcta and latest_attempt.respuesta_dada != "BYPASS_EXPLICACION":
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
                    .order_by(Intento.fecha.desc(), Intento.id.desc())
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

            originales = [q for q in preguntas if not q.datos_numericos or q.datos_numericos.get("es_espejo") is not True]
            if not originales:
                originales = preguntas

            res_solved = await db.execute(
                select(Pregunta.estructura_padre_id)
                .join(Intento, Intento.pregunta_id == Pregunta.id)
                .where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == FASE3_ID,
                    Intento.seccion == seccion,
                    or_(
                        Intento.es_correcta == True,
                        Intento.respuesta_dada == "BYPASS_EXPLICACION"
                    )
                ))
            )
            solved_families = set(res_solved.scalars().all())

            unsolv = [o for o in originales if o.estructura_padre_id not in solved_families]
            if not unsolv:
                unsolv = originales

            pregunta_elex = random.choice(unsolv)

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
            tipo_pregunta=pregunta_elex.tipo_pregunta.value,
            tiene_cronometro=tiene_crono,
            tiempo_limite_segundos=tiempo_lim,
            datos_numericos=pregunta_elex.datos_numericos,
            aciertos_acumulados=progreso.aciertos_acumulados,
            intentos_totales=progreso.intentos_totales,
            porcentaje_actual=progreso.porcentaje_actual,
        )

# ─────────────────────────────────────────────────────────────────────────────
# RESPONDER Y VALIDAR
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/responder", response_model=Fase3ResultadoRespuesta)
async def responder_fase3(
    payload: Fase3ResponderPregunta,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
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
            es_correcta = False
            correct_alt = next((a for a in pregunta.alternativas if a.es_correcta), None)
            respuesta_correcta_str = correct_alt.texto if correct_alt else pregunta.respuesta_correcta
        else:
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
    
    # ── 1. MODO DESAFÍO ──────────────────────────────────────────────────────
    if nivel_id in (11, 12, 13):
        max_errores = 2 if nivel_id == 13 else 3
        
        result_att = await db.execute(
            select(Intento)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == FASE3_ID,
                Intento.seccion == seccion,
            ))
            .order_by(Intento.fecha.desc(), Intento.id.desc())
        )
        attempts = result_att.scalars().all()
        
        errores_sesion = 0
        if not es_correcta:
            errores_sesion = 1
            
        current_aciertos = progreso.aciertos_acumulados
        aciertos_found = 0
        
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
            
            if progreso.porcentaje_actual >= porc_aprobacion:
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
                if res_aprob.scalar() >= 30: # 30 niveles totales
                    fase_completada = True
                    
                await _sync_unlocked_levels(db, alumno.id, operacion)
                
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

    # ── 2. MODO PRÁCTICA LIBRE ───────────────────────────────────────────────
    else:
        es_variante_espejo = (pregunta.datos_numericos and pregunta.datos_numericos.get("es_espejo"))
        if not es_variante_espejo:
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
        else:
            global_cfg = await _get_global_config(db)
            pl_cfg = global_cfg.get("practica_libre", {})
            cantidad_req = pl_cfg.get("cantidad_requerida", 15)

        # Calcular completitud basándose en familias resueltas
        res_fam_resueltas = await db.execute(
            select(func.count(func.distinct(Pregunta.estructura_padre_id)))
            .join(Intento, Intento.pregunta_id == Pregunta.id)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == FASE3_ID,
                Intento.seccion == seccion,
                or_(
                    Intento.es_correcta == True,
                    Intento.respuesta_dada == "BYPASS_EXPLICACION"
                )
            ))
        )
        familias_resueltas = res_fam_resueltas.scalar() or 0
        
        progreso.porcentaje_actual = min(100, int((familias_resueltas / cantidad_req) * 100)) if cantidad_req > 0 else 0

        bloque_completado = False
        fase_completada = False

        if progreso.porcentaje_actual >= 100:
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
            if res_aprob.scalar() >= 30: # 30 niveles totales
                fase_completada = True

            await _sync_unlocked_levels(db, alumno.id, operacion)

        espejo = False
        intentos_espejo = 0
        soporte_avanzado = False

        if not es_correcta and pregunta.estructura_padre_id:
            res_fam = await db.execute(
                select(Intento)
                .join(Pregunta, Intento.pregunta_id == Pregunta.id)
                .where(and_(
                    Intento.alumno_id == alumno.id,
                    Pregunta.estructura_padre_id == pregunta.estructura_padre_id
                ))
                .order_by(Intento.fecha.desc(), Intento.id.desc())
            )
            family_attempts = res_fam.scalars().all()
            intentos_espejo = len(family_attempts)
            
            espejo = intentos_espejo > 0
            soporte_avanzado = intentos_espejo >= (MAX_ESPEJO + 1)

        await db.commit()

        return Fase3ResultadoRespuesta(
            es_correcta=es_correcta,
            respuesta_correcta=respuesta_correcta_str,
            explicacion=pregunta.explicacion_paso_a_paso if (not es_correcta and soporte_avanzado) else None,
            aciertos_acumulados=progreso.aciertos_acumulados,
            intentos_totales=progreso.intentos_totales,
            porcentaje_actual=progreso.porcentaje_actual,
            bloque_completado=bloque_completado,
            fase_completada=fase_completada,
            es_espejo=espejo,
            intentos_espejo_actuales=intentos_espejo,
            intentos_espejo_max=MAX_ESPEJO,
            soporte_avanzado=soporte_avanzado,
        )

# ─────────────────────────────────────────────────────────────────────────────
# CERRAR RESCATE (Bypass anti-spam)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/cerrar-rescate", response_model=Fase3ResultadoRespuesta)
async def cerrar_rescate_fase3(
    payload: Fase3CerrarRescate,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Cierra la explicación del bloque de rescate y registra un intento virtual 'BYPASS_EXPLICACION'.
    Esto incrementa la completitud del alumno y resetea el bucle espejo de forma fluida.
    """
    modulo_id = payload.modulo_id
    nivel_id = payload.nivel_id
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)
    progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)

    result_q = await db.execute(
        select(Pregunta).where(Pregunta.id == payload.pregunta_id)
    )
    pregunta = result_q.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada.")

    # Registrar el bypass como un intento fallido especial
    intento = Intento(
        alumno_id=alumno.id,
        pregunta_id=payload.pregunta_id,
        respuesta_dada="BYPASS_EXPLICACION",
        es_correcta=False,
        fase_id=FASE3_ID,
        seccion=seccion,
        operacion=operacion,
        tipo_error=TipoErrorEnum.CALCULO,
        feedback_mostrado="Bypass de Explicación",
        explicacion_mostrada=None,
        tiempo_respuesta_segundos=0.0,
    )
    db.add(intento)
    await db.flush()

    progreso.intentos_totales += 1

    if config:
        cantidad_req = config.cantidad_requerida
    else:
        global_cfg = await _get_global_config(db)
        pl_cfg = global_cfg.get("practica_libre", {})
        cantidad_req = pl_cfg.get("cantidad_requerida", 15)

    # Calcular progreso por completitud
    res_fam_resueltas = await db.execute(
        select(func.count(func.distinct(Pregunta.estructura_padre_id)))
        .join(Intento, Intento.pregunta_id == Pregunta.id)
        .where(and_(
            Intento.alumno_id == alumno.id,
            Intento.fase_id == FASE3_ID,
            Intento.seccion == seccion,
            or_(
                Intento.es_correcta == True,
                Intento.respuesta_dada == "BYPASS_EXPLICACION"
            )
        ))
    )
    familias_resueltas = res_fam_resueltas.scalar() or 0
    
    progreso.porcentaje_actual = min(100, int((familias_resueltas / cantidad_req) * 100)) if cantidad_req > 0 else 0

    bloque_completado = False
    fase_completada = False

    if progreso.porcentaje_actual >= 100:
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
        if res_aprob.scalar() >= 30: # 30 niveles totales
            fase_completada = True

        await _sync_unlocked_levels(db, alumno.id, operacion)

    await db.commit()

    return Fase3ResultadoRespuesta(
        es_correcta=False,
        respuesta_correcta=pregunta.respuesta_correcta,
        aciertos_acumulados=progreso.aciertos_acumulados,
        intentos_totales=progreso.intentos_totales,
        porcentaje_actual=progreso.porcentaje_actual,
        bloque_completado=bloque_completado,
        fase_completada=fase_completada,
        es_espejo=False,
        intentos_espejo_actuales=0,
        intentos_espejo_max=MAX_ESPEJO,
        soporte_avanzado=False,
    )

# ─────────────────────────────────────────────────────────────────────────────
# OBTENER TEORÍA/LECTURA
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/lectura/{modulo_id}/nivel/{nivel_id}", response_model=Fase3ContenidoLectura)
async def get_lectura_fase3(
    modulo_id: int,
    nivel_id: int,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
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
# GRADUACIÓN A FASE 4 (Exige 30 niveles aprobados)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/graduate")
async def graduate_fase3(
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Gradúa al alumno de Fase 3 a Fase 4 si todos los 30 niveles están dominados.
    """
    result = await db.execute(
        select(func.count(ProgresoMaestria.id)).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE3_ID,
            ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO,
        ))
    )
    aprobados = result.scalar()
    if aprobados < 30:
        raise HTTPException(
            status_code=400,
            detail=f"Debes dominar los 30 niveles de Fase 3 (15 de práctica y 15 desafíos). Llevas {aprobados}/30.",
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
