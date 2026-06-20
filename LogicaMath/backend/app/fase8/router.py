"""
Router FastAPI — Fase 2: Desarrollo Numérico y Razonamiento (Refactorizado)
=============================================================================
Prefijo: /fase8
Tags:    fase8

Responsabilidades:
  - Dashboard con los 4 módulos (niveles de práctica y de desafíos).
  - Contenido de teoría dinámico desde la tabla NivelTeoria.
  - Obtener preguntas (desde BD para práctica libre y desafíos).
  - Validar respuestas:
    - Bucle Espejo (Mirror Loop) en modo Práctica Libre.
    - Salida Temprana (Early Exit) en modo Desafío con reinicio de progreso.
  - Graduación a Fase 3 (requiere 26 niveles dominados).
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
from ..utils.math_utils import normalize_response, calcular_max_errores
from ..fase2.models import NivelTeoria, IntentoPregunta, IntentoPaso
from .schemas import (
    fase8Dashboard, fase8ModuloInfo, fase8NivelInfo,
    fase8PreguntaParaAlumno, fase8Token,
    fase8ResponderPregunta, fase8ResultadoRespuesta,
    fase8ContenidoLectura, fase8DesafioInfo,
    fase8AlternativaOut, fase8CerrarRescate,
)

router = APIRouter(prefix="/fase8", tags=["fase8"])

fase8_ID = 8
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
            cat_map = {
                "suma": "addition",
                "resta": "subtraction",
                "multiplicacion": "multiplication",
                "division": "division",
                "mixta": "challenge"
            }
            cat = cat_map.get(operacion)
            if cat:
                settings["unlockedLevels"][cat] = 6
                user.settings = settings
                flag_modified(user, "settings")
                await db.flush()

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTES DE MÓDULOS Y NIVELES
# ─────────────────────────────────────────────────────────────────────────────

MODULOS_META = {
    1: {"nombre": "Secuencias Lógicas", "descripcion": "Progresiones y patrones numéricos.", "icono": "bar-chart", "color": "#10B981"},
    2: {"nombre": "Combinatoria Visual", "descripcion": "Diagramas de árbol y multiplicativos.", "icono": "share-2", "color": "#8B5CF6"},
    3: {"nombre": "Probabilidad", "descripcion": "Espacios muestrales y fracciones.", "icono": "help-circle", "color": "#F59E0B"},
}

NIVELES_META = {
    (1, 1): {"nombre": "Progresiones Aritméticas", "descripcion": "Hallar patrón de suma/resta."},
    (1, 2): {"nombre": "Progresiones Compuestas", "descripcion": "Multiplicación e intercaladas."},
    (1, 3): {"nombre": "Interpolación", "descripcion": "Deducir término faltante."},
    (2, 1): {"nombre": "Diagramas de Árbol", "descripcion": "Combinaciones filas x columnas."},
    (2, 2): {"nombre": "Principio Multiplicativo", "descripcion": "Opciones sin repetición."},
    (2, 3): {"nombre": "Divisores Comunes", "descripcion": "Empacar grupos exactos."},
    (3, 1): {"nombre": "Clasificación Determinística", "descripcion": "Evento seguro, posible, imposible."},
    (3, 2): {"nombre": "Definición de Laplace", "descripcion": "Casos Favorables / Posibles."},
    (3, 3): {"nombre": "Análisis Probabilístico", "descripcion": "Fracciones comparativas."},
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS DE NAVEGACIÓN Y ACCESO
# ─────────────────────────────────────────────────────────────────────────────

def _seccion_operacion(modulo_id: int, nivel_id: int) -> tuple:
    """Mapea (módulo, nivel) → (sección, operación) para ConfiguracionProgreso."""
    if modulo_id == 99 or nivel_id in (11, 12, 13):
        # Desafíos
        seccion = modulo_id * 1000 + nivel_id
        return seccion, "mixta"
    else:
        # Práctica libre
        seccion = modulo_id * 100 + nivel_id
        operacion_map = {1: "suma", 2: "multiplicacion", 3: "mixta", 4: "mixta"}
        return seccion, operacion_map.get(modulo_id, "mixta")


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
    # 1. Intentar obtener configuración específica y activa del bloque/nivel
    result = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == fase8_ID,
            ConfiguracionProgreso.seccion == seccion,
            ConfiguracionProgreso.activo == True
        ))
    )
    config = result.scalar_one_or_none()
    if config:
        return config

    # 2. Fallback: intentar obtener configuración por defecto de la Fase 2 (seccion = 0, operacion = 'mixta')
    result_phase = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == fase8_ID,
            ConfiguracionProgreso.seccion == 0,
            ConfiguracionProgreso.operacion == "mixta",
            ConfiguracionProgreso.activo == True
        ))
    )
    return result_phase.scalar_one_or_none()


async def _get_or_create_progreso(
    db: AsyncSession, alumno_id: int, seccion: int, operacion: str
) -> ProgresoMaestria:
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno_id,
            ProgresoMaestria.fase_id == fase8_ID,
            ProgresoMaestria.seccion == seccion,
        ))
    )
    progreso = result.scalar_one_or_none()
    if not progreso:
        progreso = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=fase8_ID,
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
        prev_prog = progresos.get(prev_seccion)
        return prev_prog is not None and prev_prog.estado == EstadoProgresoEnum.APROBADO
    
    if nivel_id == 1 and modulo_id > 1:
        prev_mod = modulo_id - 1
        prev_mod_levels = {1: 3, 2: 4, 3: 4}[prev_mod]
        
        # Check all practice levels of previous module
        for p_level in range(1, prev_mod_levels + 1):
            p_sec, p_op = _seccion_operacion(prev_mod, p_level)
            p_prog = progresos.get(p_sec)
            if not p_prog or p_prog.estado != EstadoProgresoEnum.APROBADO:
                return False
                
        # Check all challenges of previous module
        for des_id in (11, 12, 13):
            c_sec, c_op = _seccion_operacion(prev_mod, des_id)
            c_prog = progresos.get(c_sec)
            if not c_prog or c_prog.estado != EstadoProgresoEnum.APROBADO:
                return False
                
        return True
    
    return False


def _is_desafio_unlocked(progresos: dict, modulo_id: int, desafio_id: int, all_practice_approved: bool) -> bool:
    """Verifica si un desafío está desbloqueado basado en la maestría de práctica."""
    if not all_practice_approved:
        return False
    if desafio_id == 11:
        return True
    if desafio_id == 12:
        sec_d1, op_d1 = _seccion_operacion(modulo_id, 11)
        prog_d1 = progresos.get(sec_d1)
        return prog_d1 is not None and prog_d1.estado == EstadoProgresoEnum.APROBADO
    if desafio_id == 13:
        sec_d2, op_d2 = _seccion_operacion(modulo_id, 12)
        prog_d2 = progresos.get(sec_d2)
        return prog_d2 is not None and prog_d2.estado == EstadoProgresoEnum.APROBADO
    return False


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 1 — Dashboard de la Fase 2 (26 niveles)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=fase8Dashboard)
async def get_fase8_dashboard(
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Devuelve el estado completo de los 4 módulos de Fase 2 para el alumno,
    incluyendo niveles de práctica libre y desafíos.
    """

    # Cargar progresos en Fase 2
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == fase8_ID,
        ))
    )
    progresos = {p.seccion: p for p in result.scalars().all()}

    # Cargar configuraciones
    result = await db.execute(
        select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == fase8_ID)
    )
    configs = {c.seccion: c for c in result.scalars().all()}

    global_cfg = await _get_global_config(db)
    pl_cfg = global_cfg.get("practica_libre", {})
    des_cfg = global_cfg.get("desafios", {})

    modulos = []
    modulo_niveles_map = {1: 3, 2: 3, 3: 3, 4: 3}
    
    for mod_id in range(1, 4):
        meta = MODULOS_META[mod_id]
        niveles = []
        desafios = []
        mod_porcentaje_total = 0
        num_niveles = 3

        # 1. Cargar niveles de práctica libre
        for niv_id in range(1, num_niveles + 1):
            seccion, operacion = _seccion_operacion(mod_id, niv_id)
            niv_meta = NIVELES_META.get((mod_id, niv_id), {"nombre": f"Nivel {niv_id}", "descripcion": ""})
            config = configs.get(seccion)
            progreso = progresos.get(seccion)

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
                    porcentaje = 100
                else:
                    estado = "en_progreso" if _is_nivel_unlocked(progresos, mod_id, niv_id) else "bloqueado"

            mod_porcentaje_total += porcentaje
            niveles.append(fase8NivelInfo(
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
            11: {"nombre": "Desafío 1", "dificultad": "estandar", "tiempo_limite": 30, "max_errores": 3},
            12: {"nombre": "Desafío 2", "dificultad": "avanzada", "tiempo_limite": 45, "max_errores": 3},
            13: {"nombre": "Desafío Final", "dificultad": "maestria", "tiempo_limite": 60, "max_errores": 2},
        }

        for des_id in [11, 12, 13]:
            seccion, operacion = _seccion_operacion(mod_id, des_id)
            d_conf = desafio_configs[des_id]
            config = configs.get(seccion)
            progreso = progresos.get(seccion)

            if config is None:
                estado = "bloqueado"
                porcentaje = 0
                aciertos = 0
                requeridos = des_cfg.get("cantidad_requerida", 25 if des_id != 13 else 10)
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
                    porcentaje = 100
                else:
                    estado = "en_progreso" if _is_desafio_unlocked(progresos, mod_id, des_id, all_practice_approved) else "bloqueado"
            if config:
                usa_crono = config.usa_cronometro
                tiempo_limite = config.tiempo_default_segundos if (config.tiempo_default_segundos is not None and config.tiempo_default_segundos > 0) else d_conf["tiempo_limite"]
                cantidad_req = config.cantidad_requerida
                porc_aprobacion = config.porcentaje_aprobacion
            else:
                usa_crono = des_cfg.get("usa_cronometro", True)
                tiempo_key = f"tiempo_default_segundos_{des_id}"
                tiempo_limite = des_cfg.get(tiempo_key, d_conf["tiempo_limite"])
                cantidad_req = des_cfg.get("cantidad_requerida", 25 if des_id != 13 else 10)
                porc_aprobacion = des_cfg.get("porcentaje_aprobacion", 90)

            if not usa_crono:
                tiempo_limite = 0

            max_errores_dinamico = calcular_max_errores(cantidad_req, porc_aprobacion)

            mod_porcentaje_total += porcentaje
            desafios.append(fase8DesafioInfo(
                desafio_id=des_id,
                nombre=d_conf["nombre"],
                dificultad=d_conf["dificultad"],
                estado=estado,
                porcentaje=porcentaje,
                aciertos=aciertos,
                requeridos=requeridos,
                tiempo_limite=tiempo_limite,
                max_errores=max_errores_dinamico,
            ))
        mod_porcentaje = mod_porcentaje_total // (num_niveles + 3)
        
        if all(n.estado == "dominado" for n in niveles) and all(d.estado == "dominado" for d in desafios):
            estado_modulo = "dominado"
        elif all(n.estado == "bloqueado" for n in niveles):
            estado_modulo = "bloqueado"
        else:
            estado_modulo = "en_progreso"

        modulos.append(fase8ModuloInfo(
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
    
    desafio_mixto_disponible = (total_niveles_aprobados >= 9)
    desafio_mixto_estado = "completado" if desafio_mixto_disponible else "bloqueado"

    return fase8Dashboard(
        alumno_nombre=alumno.nombre,
        puntos_totales=puntos,
        modulos=modulos,
        desafio_mixto_disponible=desafio_mixto_disponible,
        desafio_mixto_estado=desafio_mixto_estado,
    )


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 2 — Contenido de lectura / teoría dinámico
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/lectura/{modulo_id}/nivel/{nivel_id}", response_model=fase8ContenidoLectura)
async def get_lectura_fase8(
    modulo_id: int,
    nivel_id: int,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """Devuelve el contenido de lectura/teoría de un nivel específico desde la base de datos."""
    result = await db.execute(
        select(NivelTeoria).where(and_(
            NivelTeoria.fase_id == fase8_ID,
            NivelTeoria.modulo_id == modulo_id,
            NivelTeoria.nivel_id == nivel_id,
        ))
    )
    theory = result.scalar_one_or_none()
    
    if not theory:
        return fase8ContenidoLectura(
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            titulo="Teoría Próximamente",
            parrafos=["El contenido teórico de este nivel está en desarrollo."],
            ejemplos=[],
            tip_pedagogico="Observa cuidadosamente.",
            diccionario=None,
            interactivos=[],
        )
    
    parrafos = [p.strip() for p in theory.texto_descubrimiento.split("\n") if p.strip()]
    
    return fase8ContenidoLectura(
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
# ENDPOINT 3 — Obtener Pregunta (Práctica con Bucle Espejo y Desafíos aleatorios)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/modulo/{modulo_id}/nivel/{nivel_id}/pregunta", response_model=fase8PreguntaParaAlumno)
async def get_pregunta_fase8(
    modulo_id: int,
    nivel_id: int,
    reload: bool = False,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Devuelve la siguiente pregunta para un módulo y nivel (o desafío) dados.
    Cargado dinámicamente desde el pool pre-sembrado en la base de datos.
    Soporta Bucle Espejo en práctica libre y selección aleatoria en desafíos.
    """
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)

    # 1. MODO DESAFÍO (modulo_id == 99 o nivel_id en 11, 12, 13)
    if modulo_id == 99 or nivel_id in (11, 12, 13):
        progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)
        if reload:
            # Borrar los intentos de la tabla general `Intento` para esta sección de desafío
            await db.execute(
                delete(Intento).where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == fase8_ID,
                    Intento.seccion == seccion
                ))
            )
            
            # Borrar los intentos de la tabla `IntentoPregunta` si aplica
            result_q_ids = await db.execute(
                select(Pregunta.id).where(and_(
                    Pregunta.fase_id == fase8_ID,
                    Pregunta.seccion == seccion
                ))
            )
            q_ids = result_q_ids.scalars().all()
            if q_ids:
                await db.execute(
                    delete(IntentoPregunta).where(and_(
                        IntentoPregunta.alumno_id == alumno.id,
                        IntentoPregunta.pregunta_id.in_(q_ids)
                    ))
                )
            
            # Restablecer el progreso de maestría a 0%
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
                Intento.fase_id == fase8_ID,
                Intento.seccion == seccion,
                Intento.es_correcta == True
            ))
        )
        correct_pregunta_ids = set(result.scalars().all())

        # Si modulo_id == 99, traer preguntas de toda la fase 2 (preferiblemente de nivel 13)
        query = select(Pregunta).options(selectinload(Pregunta.alternativas)).where(and_(
            Pregunta.fase_id == fase8_ID,
            Pregunta.estado == StatusEnum.ACTIVO
        ))
        
        if modulo_id == 99:
            # Filtrar solo preguntas de nivel de maestría (Desafío Final: secciones 1013, 2013, 3013, 4013)
            # Las secciones de desafíos se calculan como módulo*1000+nivel (ej: 1*1000+13=1013)
            query = query.where(func.mod(Pregunta.seccion, 1000) == 13)
        else:
            query = query.where(Pregunta.seccion == seccion)

        result = await db.execute(query)
        preguntas = result.scalars().all()
        if not preguntas:
            raise HTTPException(status_code=404, detail="No hay preguntas en el pool para este desafío.")

        # Filtrar preguntas no aprobadas
        uncompleted = [q for q in preguntas if q.id not in correct_pregunta_ids]
        if not uncompleted:
            uncompleted = preguntas  # Si aprobó todas, permitir repetir

        pregunta_elex = random.choice(uncompleted)

        alts_out = None
        if pregunta_elex.tipo_pregunta.value == "multiple_opcion" or pregunta_elex.alternativas:
            alts_out = [
                fase8AlternativaOut(id=alt.id, texto=alt.texto, orden=alt.orden)
                for alt in pregunta_elex.alternativas
            ]
            random.shuffle(alts_out)

        if config:
            tiene_crono = config.usa_cronometro
            if modulo_id == 99:
                tiempo_lim = config.tiempo_default_segundos if (config.tiempo_default_segundos is not None and config.tiempo_default_segundos > 0) else 90
            elif modulo_id in (3, 4):
                tiempo_lim = config.tiempo_default_segundos if (config.tiempo_default_segundos is not None and config.tiempo_default_segundos > 0) else (30 if nivel_id == 11 else (45 if nivel_id == 12 else 60))
            else:
                tiempo_lim = config.tiempo_default_segundos if (config.tiempo_default_segundos is not None and config.tiempo_default_segundos > 0) else (25 if nivel_id == 11 else (40 if nivel_id == 12 else 50))
        else:
            global_cfg = await _get_global_config(db)
            des_cfg = global_cfg.get("desafios", {})
            tiene_crono = des_cfg.get("usa_cronometro", True)
            tiempo_key = f"tiempo_default_segundos_{nivel_id}"
            if modulo_id == 99:
                tiempo_lim = des_cfg.get(tiempo_key, 90)
            elif modulo_id in (3, 4):
                tiempo_lim = des_cfg.get(tiempo_key, 30 if nivel_id == 11 else (45 if nivel_id == 12 else 60))
            else:
                tiempo_lim = des_cfg.get(tiempo_key, 25 if nivel_id == 11 else (40 if nivel_id == 12 else 50))

        if not tiene_crono:
            tiempo_lim = None

        return fase8PreguntaParaAlumno(
            id=pregunta_elex.id,
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=pregunta_elex.enunciado,
            tipo_pregunta=pregunta_elex.tipo_pregunta.value,
            respuesta_correcta=pregunta_elex.respuesta_correcta if pregunta_elex.tipo_pregunta.value != "multiple_opcion" else None,
            tiene_cronometro=tiene_crono,
            tiempo_limite_segundos=tiempo_lim,
            alternativas=alts_out,
            datos_numericos=pregunta_elex.datos_numericos,
            aciertos_acumulados=progreso.aciertos_acumulados,
            intentos_totales=progreso.intentos_totales,
            porcentaje_actual=progreso.porcentaje_actual,
        )

    # 2. MODO PRÁCTICA LIBRE (1-10)
    else:
        progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)
        
        if reload:
            # 1. Borrar los intentos de la tabla general `Intento` para esta sección
            await db.execute(
                delete(Intento).where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == fase8_ID,
                    Intento.seccion == seccion
                ))
            )
            
            # 2. Borrar los intentos de la tabla `IntentoPregunta` para las preguntas de esta sección
            result_q_ids = await db.execute(
                select(Pregunta.id).where(and_(
                    Pregunta.fase_id == fase8_ID,
                    Pregunta.seccion == seccion
                ))
            )
            q_ids = result_q_ids.scalars().all()
            if q_ids:
                await db.execute(
                    delete(IntentoPregunta).where(and_(
                        IntentoPregunta.alumno_id == alumno.id,
                        IntentoPregunta.pregunta_id.in_(q_ids)
                    ))
                )
            
            # 3. Restablecer el progreso de maestría a 0%
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
                    Intento.fase_id == fase8_ID,
                    Intento.seccion == seccion,
                ))
                .order_by(Intento.fecha.desc(), Intento.id.desc())
                .limit(1)
            )
            latest_attempt = result.scalar_one_or_none()

        espejo_pregunta = None
        
        # Lógica Bucle Espejo (solo si el último intento fue fallido y no fue bypass)
        if latest_attempt and not latest_attempt.es_correcta and latest_attempt.respuesta_dada != "BYPASS_EXPLICACION":
            result_q = await db.execute(
                select(Pregunta).options(selectinload(Pregunta.alternativas)).where(Pregunta.id == latest_attempt.pregunta_id)
            )
            failed_pregunta = result_q.scalar_one_or_none()
            
            if failed_pregunta and failed_pregunta.estructura_padre_id:
                # Contar cuántos intentos lleva en esta misma familia de preguntas
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

                # Si lleva menos del máximo permitido en el bucle espejo y el último falló
                if attempts_count > 0 and not family_attempts[0].es_correcta and attempts_count < (MAX_ESPEJO + 1):
                    # Obtener las preguntas del pool para esta familia
                    result_fam_qs = await db.execute(
                        select(Pregunta).options(selectinload(Pregunta.alternativas))
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
            # Seleccionar una nueva familia (pregunta original: es_espejo = False)
            result_qs = await db.execute(
                select(Pregunta).options(selectinload(Pregunta.alternativas))
                .where(and_(
                    Pregunta.fase_id == fase8_ID,
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

            # Buscar familias ya tratadas (correctas o con bypass de explicación)
            res_solved = await db.execute(
                select(Pregunta.estructura_padre_id)
                .join(Intento, Intento.pregunta_id == Pregunta.id)
                .where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == fase8_ID,
                    Intento.seccion == seccion,
                    or_(
                        Intento.es_correcta == True,
                        Intento.respuesta_dada == "BYPASS_EXPLICACION"
                    )
                ))
            )
            solved_families = set(res_solved.scalars().all())

            unsolved_originales = [o for o in originales if o.estructura_padre_id not in solved_families]
            if not unsolved_originales:
                unsolved_originales = originales

            pregunta_elex = random.choice(unsolved_originales)

        pasos_encadenados = None
        if modulo_id == 4:
            pasos_encadenados = []
            if pregunta_elex.datos_numericos and "pasos" in pregunta_elex.datos_numericos:
                pasos_encadenados = pregunta_elex.datos_numericos["pasos"]

        alts_out = None
        if pregunta_elex.tipo_pregunta.value == "multiple_opcion" or pregunta_elex.alternativas:
            alts_out = [
                fase8AlternativaOut(id=alt.id, texto=alt.texto, orden=alt.orden)
                for alt in pregunta_elex.alternativas
            ]
            random.shuffle(alts_out)

        if config:
            tiene_crono = config.usa_cronometro
            tiempo_lim = config.tiempo_default_segundos
            cantidad_req = config.cantidad_requerida
        else:
            global_cfg = await _get_global_config(db)
            if modulo_id == 99 or nivel_id in (11, 12, 13):
                des_cfg = global_cfg.get("desafios", {})
                tiene_crono = des_cfg.get("usa_cronometro", True)
                tiempo_key = f"tiempo_default_segundos_{nivel_id}"
                if modulo_id in (3, 4):
                    tiempo_lim = des_cfg.get(tiempo_key, 30 if nivel_id == 11 else (45 if nivel_id == 12 else (90 if modulo_id == 99 else 60)))
                else:
                    tiempo_lim = des_cfg.get(tiempo_key, 25 if nivel_id == 11 else (40 if nivel_id == 12 else 50))
                cantidad_req = des_cfg.get("cantidad_requerida", 20 if nivel_id != 13 else 10)
            else:
                pl_cfg = global_cfg.get("practica_libre", {})
                tiene_crono = pl_cfg.get("usa_cronometro", False)
                tiempo_lim = pl_cfg.get("tiempo_default_segundos", 15)
                cantidad_req = pl_cfg.get("cantidad_requerida", 15)

        if not tiene_crono:
            tiempo_lim = None

        return fase8PreguntaParaAlumno(
            id=pregunta_elex.id,
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=pregunta_elex.enunciado,
            tipo_pregunta=pregunta_elex.tipo_pregunta.value,
            respuesta_correcta=pregunta_elex.respuesta_correcta if pregunta_elex.tipo_pregunta.value != "multiple_opcion" else None,
            tiene_cronometro=tiene_crono,
            tiempo_limite_segundos=tiempo_lim,
            pasos_encadenados=pasos_encadenados,
            alternativas=alts_out,
            datos_numericos=pregunta_elex.datos_numericos,
            aciertos_acumulados=progreso.aciertos_acumulados,
            intentos_totales=progreso.intentos_totales,
            porcentaje_actual=progreso.porcentaje_actual,
            cantidad_requerida=cantidad_req,
        )# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 4 — Responder pregunta (Valida y actualiza progreso)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/responder", response_model=fase8ResultadoRespuesta)
async def responder_fase8(
    payload: fase8ResponderPregunta,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Valida la respuesta del alumno, calcula aciertos, e implementa:
    - Bucle Espejo (Mirror Loop) en modo Práctica Libre (1-10).
    - Lógica de Salida Temprana (Early Exit) en modo Desafío (11-13) con reinicio de progreso.
    """
    modulo_id = payload.modulo_id
    nivel_id = payload.nivel_id
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)
    progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)

    if not payload.pregunta_id:
        raise HTTPException(status_code=400, detail="pregunta_id es requerido para validar la respuesta.")

    result_q = await db.execute(
        select(Pregunta).options(selectinload(Pregunta.alternativas))
        .options(selectinload(Pregunta.alternativas))
        .where(Pregunta.id == payload.pregunta_id)
    )
    pregunta = result_q.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada.")

    es_correcta = False
    respuesta_correcta_str = pregunta.respuesta_correcta
    paso_aprobado = None
    valor_paso1_congelado = None

    # 1. VALIDAR LA RESPUESTA
    tipo_pregunta = pregunta.tipo_pregunta.value
    is_money = (modulo_id == 3)

    tipo_error = None
    feedback_mostrado = None

    if tipo_pregunta == "multiple_opcion":
        if not payload.alternativa_id:
            # Caso de timeout o no selección: tratamos como error
            es_correcta = False
            alternativa_elegida = None
            correct_alt = next((a for a in pregunta.alternativas if a.es_correcta), None)
            respuesta_correcta_str = correct_alt.texto if correct_alt else pregunta.respuesta_correcta
            tipo_error = TipoErrorEnum.CALCULO
            feedback_mostrado = "¡Se acabó el tiempo! Intenta responder más rápido la próxima vez."
        else:
            alternativa_elegida = next((a for a in pregunta.alternativas if a.id == payload.alternativa_id), None)
            if not alternativa_elegida:
                raise HTTPException(status_code=404, detail="Alternativa elegida no encontrada.")
            
            es_correcta = alternativa_elegida.es_correcta
            correct_alt = next((a for a in pregunta.alternativas if a.es_correcta), None)
            respuesta_correcta_str = correct_alt.texto if correct_alt else pregunta.respuesta_correcta
            if not es_correcta:
                tipo_error = alternativa_elegida.tipo_error
                feedback_mostrado = alternativa_elegida.feedback_error

    elif tipo_pregunta == "constructor_soluciones_chained":
        pasos = (pregunta.datos_numericos or {}).get("pasos", [])
        paso_idx = (payload.paso_numero or 1) - 1
        if paso_idx < 0 or paso_idx >= len(pasos):
            raise HTTPException(status_code=400, detail="Número de paso inválido.")

        paso = pasos[paso_idx]
        respuesta_correcta_str = str(paso.get("respuesta_correcta", ""))
        
        resp_dada = normalize_response(payload.respuesta_dada, is_money)
        resp_corr = normalize_response(respuesta_correcta_str, is_money)
        es_correcta = resp_dada == resp_corr
        
        if es_correcta:
            paso_aprobado = payload.paso_numero
            if payload.paso_numero == 1:
                valor_paso1_congelado = respuesta_correcta_str

    else:
        resp_dada = normalize_response(payload.respuesta_dada, is_money)
        resp_corr = normalize_response(respuesta_correcta_str, is_money)
        es_correcta = resp_dada == resp_corr

    es_correcta_intento = es_correcta

    # 2. DETECTAR ERRORES COGNITIVOS EN PREGUNTAS ABIERTAS
    if not es_correcta and tipo_pregunta != "multiple_opcion":
        if pregunta.errores_previstos and isinstance(pregunta.errores_previstos, dict):
            normalized_dada = normalize_response(payload.respuesta_dada, is_money)
            err_list = pregunta.errores_previstos.get("respuestas_erroneas", [])
            for err in err_list:
                err_val_normalized = normalize_response(err.get("valor", ""), is_money)
                if normalized_dada == err_val_normalized:
                    tipo_error_str = err.get("tipo_error", "calculo")
                    tipo_error = TipoErrorEnum(tipo_error_str) if hasattr(TipoErrorEnum, tipo_error_str) else TipoErrorEnum.CALCULO
                    feedback_mostrado = err.get("feedback")
                    break
            
            # Fallback a calculo si no coincide con ningun error cognitivo previsto
            if not tipo_error:
                tipo_error = TipoErrorEnum.CALCULO
                feedback_mostrado = pregunta.errores_previstos.get("calculo", "Revisa tus cálculos e inténtalo de nuevo.")

    # INTEGRACIÓN DE INTENTOPREGUNTA E INTENTOPASO (MÓDULO 4 CONSTRUCTOR)
    es_variante_espejo = (pregunta.datos_numericos and pregunta.datos_numericos.get("es_espejo"))
    if tipo_pregunta == "constructor_soluciones_chained":
        # Buscar o crear IntentoPregunta
        result_ip = await db.execute(
            select(IntentoPregunta).where(and_(
                IntentoPregunta.alumno_id == alumno.id,
                IntentoPregunta.pregunta_id == pregunta.id
            ))
        )
        intento_preg = result_ip.scalar_one_or_none()
        if not intento_preg:
            intento_preg = IntentoPregunta(
                alumno_id=alumno.id,
                pregunta_id=pregunta.id,
                aprobada_completa=False,
                intentos_totales=0,
                tiempo_total=0.0
            )
            db.add(intento_preg)
            await db.flush()

        # Incrementar intentos y sumarle tiempo
        intento_preg.intentos_totales += 1
        if payload.tiempo_respuesta_segundos:
            intento_preg.tiempo_total += payload.tiempo_respuesta_segundos

        # Registrar el paso en IntentoPaso
        intento_paso = IntentoPaso(
            intento_pregunta_id=intento_preg.id,
            paso_numero=payload.paso_numero or 1,
            respuesta_dada=payload.respuesta_dada,
            es_correcta=es_correcta,
            tipo_error_detectado=tipo_error.value if tipo_error else None,
            es_espejo=bool(es_variante_espejo),
            tiempo_respuesta=payload.tiempo_respuesta_segundos
        )
        db.add(intento_paso)
        await db.flush()

        # Lógica de completitud general:
        # Solo si es el ÚLTIMO paso y es correcta, aprobamos el IntentoPregunta y mantenemos es_correcta_intento = True
        pasos = (pregunta.datos_numericos or {}).get("pasos", [])
        es_ultimo_paso = (payload.paso_numero == len(pasos))

        if es_correcta and es_ultimo_paso:
            intento_preg.aprobada_completa = True
            es_correcta_intento = True
        else:
            # Si es un paso intermedio o es incorrecta, la pregunta general no está aprobada completa,
            # y forzamos que el intento general de la tabla Intento sea es_correcta_intento = False
            # para no registrar la familia como resuelta de forma prematura.
            es_correcta_intento = False

    # 3. REGISTRAR EL INTENTO
    intento = Intento(
        alumno_id=alumno.id,
        pregunta_id=payload.pregunta_id,
        respuesta_dada=payload.respuesta_dada or (str(payload.alternativa_id) if payload.alternativa_id else ""),
        es_correcta=es_correcta_intento,
        fase_id=fase8_ID,
        seccion=seccion,
        operacion=operacion,
        tipo_error=tipo_error,
        feedback_mostrado=feedback_mostrado,
        explicacion_mostrada=pregunta.explicacion_paso_a_paso if not es_correcta else None,
        tiempo_respuesta_segundos=payload.tiempo_respuesta_segundos,
    )
    db.add(intento)
    await db.flush()

    # 3. ACTUALIZAR PROGRESO Y LÓGICAS ESPECIALES
    
    # 3.1 MODO DESAFÍO (11, 12, 13 o Mod 99) -> Salida Temprana (Early Exit)
    if modulo_id == 99 or nivel_id in (11, 12, 13):
        if config:
            cantidad_req = config.cantidad_requerida
            porc_aprobacion = config.porcentaje_aprobacion
        else:
            if modulo_id == 99:
                cantidad_req = 20
                porc_aprobacion = 90
            else:
                cantidad_req = 10 if nivel_id == 13 else 25
                porc_aprobacion = 90

        max_errores = calcular_max_errores(cantidad_req, porc_aprobacion)

        result_att = await db.execute(
            select(Intento)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == fase8_ID,
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
            # RESET ABSOLUTO POR SALIDA TEMPRANA
            progreso.aciertos_acumulados = 0
            progreso.porcentaje_actual = 0
            progreso.intentos_totales = 0
            progreso.estado = EstadoProgresoEnum.EN_PROGRESO
            
            # Borrar los intentos acumulados para evitar colisiones en la próxima sesión
            await db.execute(
                delete(Intento).where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.fase_id == fase8_ID,
                    Intento.seccion == seccion
                ))
            )
            
            # Borrar los intentos de la tabla `IntentoPregunta` si aplica
            result_q_ids = await db.execute(
                select(Pregunta.id).where(and_(
                    Pregunta.fase_id == fase8_ID,
                    Pregunta.seccion == seccion
                ))
            )
            q_ids = result_q_ids.scalars().all()
            if q_ids:
                await db.execute(
                    delete(IntentoPregunta).where(and_(
                        IntentoPregunta.alumno_id == alumno.id,
                        IntentoPregunta.pregunta_id.in_(q_ids)
                    ))
                )
            
            await db.commit()
            
            return fase8ResultadoRespuesta(
                es_correcta=es_correcta,
                respuesta_correcta=respuesta_correcta_str,
                aciertos_acumulados=0,
                intentos_totales=0,
                porcentaje_actual=0,
                bloque_completado=False,
                early_exit=True,
                errores_sesion=errores_sesion,
                max_errores_tolerados=max_errores,
                feedback_error=feedback_mostrado,
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
                cantidad_req    = config.cantidad_requerida
                porc_aprobacion = config.porcentaje_aprobacion
            else:
                global_cfg = await _get_global_config(db)
                des_cfg = global_cfg.get("desafios", {})
                if modulo_id == 99:
                    cantidad_req = 20
                else:
                    cantidad_req = des_cfg.get("cantidad_requerida", 10 if nivel_id == 13 else 25)
                porc_aprobacion = des_cfg.get("porcentaje_aprobacion", 90)

            # Progreso en desafío: ratio aciertos / cantidad_req (no familias)
            progreso.porcentaje_actual = (
                min(100, int((progreso.aciertos_acumulados / cantidad_req) * 100))
                if cantidad_req > 0 else 0
            )

            bloque_completado = False
            fase_completada   = False

            if progreso.porcentaje_actual >= porc_aprobacion:
                if progreso.estado != EstadoProgresoEnum.APROBADO:
                    progreso.estado = EstadoProgresoEnum.APROBADO
                    progreso.fecha_aprobacion = datetime.utcnow()
                bloque_completado = True

                await db.flush()
                res_aprob = await db.execute(
                    select(func.count(ProgresoMaestria.id)).where(and_(
                        ProgresoMaestria.alumno_id == alumno.id,
                        ProgresoMaestria.fase_id == fase8_ID,
                        ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO,
                    ))
                )
                if res_aprob.scalar() >= 26:
                    fase_completada = True

            await db.commit()

            return fase8ResultadoRespuesta(
                es_correcta=es_correcta,
                respuesta_correcta=respuesta_correcta_str,
                aciertos_acumulados=progreso.aciertos_acumulados,
                intentos_totales=progreso.intentos_totales,
                porcentaje_actual=progreso.porcentaje_actual,
                bloque_completado=bloque_completado,
                fase_completada=fase_completada,
                errores_sesion=errores_sesion,
                max_errores_tolerados=max_errores,
                feedback_error=feedback_mostrado,
            )


    else:
        # Práctica Libre (1-10): No contamos intentos ni aciertos si es una variante espejo 
        # para no penalizar el "Score" visual del alumno en modo entrenamiento.
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
            porc_aprobacion = config.porcentaje_aprobacion
        else:
            global_cfg = await _get_global_config(db)
            pl_cfg = global_cfg.get("practica_libre", {})
            cantidad_req = pl_cfg.get("cantidad_requerida", 15)
            porc_aprobacion = pl_cfg.get("porcentaje_aprobacion", 80)

        # NUEVO CÁLCULO DE PROGRESO POR COMPLETITUD (Familias únicas resueltas con éxito o bypass)
        res_fam_resueltas = await db.execute(
            select(func.count(func.distinct(Pregunta.estructura_padre_id)))
            .join(Intento, Intento.pregunta_id == Pregunta.id)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == fase8_ID,
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
                    ProgresoMaestria.fase_id == fase8_ID,
                    ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
                ))
            )
            if res_aprob.scalar() >= 26:
                fase_completada = True

            # Sincronizar espejo visual heredado
            await _sync_unlocked_levels(db, alumno.id, operacion)

        espejo = False
        intentos_espejo = 0
        soporte_avanzado = False

        if not es_correcta and modulo_id in (1, 2, 3) and pregunta.estructura_padre_id:
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

        return fase8ResultadoRespuesta(
            es_correcta=es_correcta,
            respuesta_correcta=respuesta_correcta_str,
            explicacion=pregunta.explicacion_paso_a_paso if (not es_correcta and soporte_avanzado) else None,
            feedback_error=feedback_mostrado,
            aciertos_acumulados=progreso.aciertos_acumulados,
            intentos_totales=progreso.intentos_totales,
            porcentaje_actual=progreso.porcentaje_actual,
            bloque_completado=bloque_completado,
            fase_completada=fase_completada,
            es_espejo=espejo,
            intentos_espejo_actuales=intentos_espejo,
            intentos_espejo_max=MAX_ESPEJO,
            soporte_avanzado=soporte_avanzado,
            paso_aprobado=paso_aprobado,
            valor_paso1_congelado=valor_paso1_congelado,
        )


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 4.5 — Cerrar Rescate (Bypass sin anti-spam)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/cerrar-rescate", response_model=fase8ResultadoRespuesta)
async def cerrar_rescate_fase8(
    payload: fase8CerrarRescate,
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
        select(Pregunta).options(selectinload(Pregunta.alternativas)).where(Pregunta.id == payload.pregunta_id)
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
        fase_id=fase8_ID,
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

    # Calcular progreso por completitud (familias resueltas con éxito o bypass)
    res_fam_resueltas = await db.execute(
        select(func.count(func.distinct(Pregunta.estructura_padre_id)))
        .join(Intento, Intento.pregunta_id == Pregunta.id)
        .where(and_(
            Intento.alumno_id == alumno.id,
            Intento.fase_id == fase8_ID,
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
                ProgresoMaestria.fase_id == fase8_ID,
                ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
            ))
        )
        if res_aprob.scalar() >= 26:
            fase_completada = True

        # Sincronizar espejo visual heredado
        await _sync_unlocked_levels(db, alumno.id, operacion)

    await db.commit()

    return fase8ResultadoRespuesta(
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
# ENDPOINT 5 — Graduación a Fase 3 (Exige 26 niveles aprobados)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/graduate")
async def graduate_fase8(
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    """
    Gradúa al alumno de Fase 2 a Fase 3 si todos los 26 niveles (14 práctica + 12 desafíos) están dominados.
    """

    result = await db.execute(
        select(func.count(ProgresoMaestria.id)).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == fase8_ID,
            ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO,
        ))
    )
    aprobados = result.scalar()
    if aprobados < 26:
        raise HTTPException(
            status_code=400,
            detail=f"Debes dominar los 26 niveles de Fase 2 (14 de práctica y 12 desafíos). Llevas {aprobados}/26.",
        )

    result = await db.execute(select(Fase).where(Fase.orden == 3))
    fase3 = result.scalar_one_or_none()
    if not fase3:
        raise HTTPException(status_code=500, detail="La Fase 3 aún no ha sido configurada.")

    alumno.fase_actual_id = fase3.id
    await db.commit()

    return {
        "message": "¡Felicitaciones! ¡Has dominado la Fase 2 y avanzas a la Fase 3!",
        "nueva_fase_id": fase3.id,
        "nueva_fase_nombre": fase3.nombre,
    }




