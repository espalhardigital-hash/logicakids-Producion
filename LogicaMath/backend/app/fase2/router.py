"""
Router FastAPI — Fase 2: Desarrollo Numérico y Razonamiento
===========================================================
Prefijo: /fase2
Tags:    fase2

Responsabilidades:
  - Dashboard con los 5 módulos y su estado de progreso
  - Obtener preguntas (generadas para mód 1-3, desde BD para mód 4-5)
  - Validar respuestas con lógica Bucle Espejo (Mirror Loop)
  - Contenido de lectura/teoría por nivel
  - Graduación a Fase 3
"""

import hashlib
import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from ..db.session import get_db
from ..auth import get_current_user
from ..models.sql_models import (
    Alumno, Fase, Pregunta, ConfiguracionProgreso,
    ProgresoMaestria, Intento, PoolAsignadoAlumno,
    StatusEnum, EstadoProgresoEnum,
    IntentoPregunta, IntentoPaso,
)
from .generators import generate_question
from .schemas import (
    Fase2Dashboard, Fase2ModuloInfo, Fase2NivelInfo,
    Fase2PreguntaParaAlumno, Fase2Token,
    Fase2ResponderPregunta, Fase2ResultadoRespuesta,
    Fase2ContenidoLectura,
)

router = APIRouter(prefix="/fase2", tags=["fase2"])

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTES DE MÓDULOS (metadatos estáticos)
# ─────────────────────────────────────────────────────────────────────────────

MODULOS_META = {
    1: {"nombre": "Gimnasio Mental",    "descripcion": "Cálculo mental ultra veloz, dobles y mitades.", "icono": "activity", "color": "#10B981"},
    2: {"nombre": "Tablas en Acción",   "descripcion": "Tablas de multiplicar y operaciones inversas.", "icono": "hash",     "color": "#8B5CF6"},
    3: {"nombre": "Tienda Matemática",  "descripcion": "Cálculo de cambio, billetes y precios en R$.", "icono": "shopping-bag","color": "#F59E0B"},
    4: {"nombre": "Detective",          "descripcion": "Aislar distractores con subrayador interactivo.","icono": "search",   "color": "#3B82F6"},
    5: {"nombre": "Constructor",        "descripcion": "Problemas de múltiples pasos conectados.",       "icono": "tool",     "color": "#EC4899"},
}

NIVELES_META = {
    (1, 1): {"nombre": "Escalas",         "descripcion": "Doble, mitad y triple"},
    (1, 2): {"nombre": "Prioridades",     "descripcion": "Orden de operaciones"},
    (1, 3): {"nombre": "Integración",     "descripcion": "Problemas de texto"},
    (2, 1): {"nombre": "Inversa +/-",     "descripcion": "Operaciones inversas aditivas"},
    (2, 2): {"nombre": "Inversa ×÷",      "descripcion": "Operaciones inversas multiplicativas"},
    (2, 3): {"nombre": "Número faltante", "descripcion": "Ecuaciones simples"},
    (2, 4): {"nombre": "Gran Integración", "descripcion": "Prueba de velocidad mental"},
    (3, 1): {"nombre": "Monedas",         "descripcion": "Reconocimiento y suma de monedas"},
    (3, 2): {"nombre": "Pago exacto",     "descripcion": "Suma de precios"},
    (3, 3): {"nombre": "Vuelto",          "descripcion": "Cálculo del troco"},
    (3, 4): {"nombre": "Comprador Inteligente", "descripcion": "Control de presupuesto"},
    (4, 1): {"nombre": "Datos simples",   "descripcion": "Subrayar cantidades y unidades"},
    (4, 2): {"nombre": "Distractores",    "descripcion": "Ignorar información irrelevante"},
    (4, 3): {"nombre": "Comparación",     "descripcion": "Problemas con múltiples entidades"},
    (4, 4): {"nombre": "Series y Patrones", "descripcion": "Identificar ritmos numéricos"},
    (4, 5): {"nombre": "Integrador Completo", "descripcion": "Historias complejas integradas"},
    (5, 1): {"nombre": "Dos pasos",       "descripcion": "Operaciones encadenadas básicas"},
    (5, 2): {"nombre": "Dependencia",     "descripcion": "Paso 2 depende del resultado de Paso 1"},
    (5, 3): {"nombre": "Planificación",   "descripcion": "Cadenas mixtas avanzadas"},
    (5, 4): {"nombre": "Gran Integración", "descripcion": "El Maestro Constructor"},
}

FASE2_ID = 2  # ID de la Fase 2 en la tabla fases
MAX_ESPEJO = 3  # Máximo de intentos en Bucle Espejo antes de mostrar soporte avanzado


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _make_seed(alumno_id: int, modulo_id: int, nivel_id: int) -> int:
    """Genera un seed determinista y único por alumno/módulo/nivel/tiempo."""
    ts = int(time.time() // 60)  # Cambia cada minuto → pregunta nueva cada minuto
    raw = f"{alumno_id}-{modulo_id}-{nivel_id}-{ts}"
    return int(hashlib.md5(raw.encode()).hexdigest(), 16) % (10 ** 9)


async def _get_alumno(db: AsyncSession, current_user: dict) -> Alumno:
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        raise HTTPException(status_code=400, detail="El usuario no tiene perfil de alumno.")
    result = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result.scalar_one_or_none()
    if not alumno:
        raise HTTPException(status_code=404, detail="Perfil de alumno no encontrado.")
    return alumno


async def _get_or_create_progreso(
    db: AsyncSession, alumno_id: int, seccion: int, operacion: str
) -> ProgresoMaestria:
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno_id,
            ProgresoMaestria.fase_id == FASE2_ID,
            ProgresoMaestria.seccion == seccion,
            ProgresoMaestria.operacion == operacion,
        ))
    )
    progreso = result.scalar_one_or_none()
    if not progreso:
        progreso = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=FASE2_ID,
            seccion=seccion,
            operacion=operacion,
            estado=EstadoProgresoEnum.EN_PROGRESO,
        )
        db.add(progreso)
        await db.flush()
    return progreso


def _seccion_operacion(modulo_id: int, nivel_id: int) -> tuple:
    """Mapea (módulo, nivel) → (sección, operación) para ConfiguracionProgreso."""
    operacion_map = {1: "suma", 2: "multiplicacion", 3: "mixta", 4: "mixta", 5: "mixta"}
    seccion = modulo_id * 100 + nivel_id
    return seccion, operacion_map.get(modulo_id, "mixta")


async def _get_config(db: AsyncSession, seccion: int, operacion: str) -> Optional[ConfiguracionProgreso]:
    result = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == FASE2_ID,
            ConfiguracionProgreso.seccion == seccion,
            ConfiguracionProgreso.operacion == operacion,
        ))
    )
    return result.scalar_one_or_none()


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 1 — Dashboard
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=Fase2Dashboard)
async def get_fase2_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Devuelve el estado completo de los 5 módulos de Fase 2 para el alumno.
    """
    alumno = await _get_alumno(db, current_user)

    # Cargar todos los progresos del alumno en Fase 2
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE2_ID,
        ))
    )
    progresos = {(p.seccion, p.operacion): p for p in result.scalars().all()}

    # Cargar configuraciones de Fase 2
    result = await db.execute(
        select(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE2_ID)
    )
    configs = {(c.seccion, c.operacion): c for c in result.scalars().all()}

    modulos = []
    todos_dominados = True

    modulo_niveles_map = {1: 3, 2: 4, 3: 4, 4: 5, 5: 4}
    for mod_id in range(1, 6):
        meta = MODULOS_META[mod_id]
        niveles = []
        mod_porcentaje_total = 0
        num_niveles = modulo_niveles_map.get(mod_id, 3)

        for niv_id in range(1, num_niveles + 1):
            seccion, operacion = _seccion_operacion(mod_id, niv_id)
            niv_meta = NIVELES_META.get((mod_id, niv_id), {"nombre": f"Nivel {niv_id}", "descripcion": ""})
            config = configs.get((seccion, operacion))
            progreso = progresos.get((seccion, operacion))

            if config is None:
                estado = "bloqueado"
                porcentaje = 0
                aciertos = 0
                requeridos = 10
            elif progreso is None:
                estado = "en_progreso" if niv_id == 1 or _nivel_previo_dominado(progresos, mod_id, niv_id) else "bloqueado"
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
                    estado = "en_progreso"

            mod_porcentaje_total += porcentaje
            niveles.append(Fase2NivelInfo(
                nivel_id=niv_id,
                nombre=niv_meta["nombre"],
                descripcion=niv_meta["descripcion"],
                estado=estado,
                porcentaje=porcentaje,
                aciertos=aciertos,
                requeridos=requeridos,
                usa_cronometro=config.usa_cronometro if config else False,
            ))

        mod_porcentaje = mod_porcentaje_total // num_niveles
        estado_modulo = (
            "dominado"    if all(n.estado == "dominado" for n in niveles)
            else "bloqueado" if all(n.estado == "bloqueado" for n in niveles)
            else "en_progreso"
        )
        if estado_modulo != "dominado":
            todos_dominados = False

        modulos.append(Fase2ModuloInfo(
            modulo_id=mod_id,
            nombre=meta["nombre"],
            descripcion=meta["descripcion"],
            icono=meta["icono"],
            color=meta["color"],
            estado=estado_modulo,
            porcentaje_global=mod_porcentaje,
            niveles=niveles,
        ))

    # Puntos totales (simplificado: aciertos acumulados de todos los bloques)
    puntos = sum(p.aciertos_acumulados for p in progresos.values())

    return Fase2Dashboard(
        alumno_nombre=alumno.nombre,
        puntos_totales=puntos,
        modulos=modulos,
        desafio_mixto_disponible=todos_dominados,
        desafio_mixto_estado="disponible" if todos_dominados else "bloqueado",
    )


def _nivel_previo_dominado(progresos: dict, mod_id: int, niv_id: int) -> bool:
    """Verifica si el nivel anterior de un módulo está dominado."""
    if niv_id == 1:
        return True
    prev_seccion, prev_op = _seccion_operacion(mod_id, niv_id - 1)
    prev = progresos.get((prev_seccion, prev_op))
    return prev is not None and prev.estado == EstadoProgresoEnum.APROBADO


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 2 — Obtener pregunta
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/modulo/{modulo_id}/nivel/{nivel_id}/pregunta", response_model=Fase2PreguntaParaAlumno)
async def get_pregunta_fase2(
    modulo_id: int,
    nivel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Devuelve la siguiente pregunta para un módulo y nivel dados.
    - Módulos 1-3: generación dinámica (servidor) con seed determinista.
    - Módulos 4-5: selección aleatoria de la BD.
    """
    alumno = await _get_alumno(db, current_user)
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)

    if modulo_id in (1, 2, 3):
        seed = _make_seed(alumno.id, modulo_id, nivel_id)
        data = generate_question(modulo_id, nivel_id, seed)
        return Fase2PreguntaParaAlumno(
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=data["enunciado"],
            enunciado_seed=str(seed),
            tipo_pregunta="respuesta_numerica",
            tiene_cronometro=config.usa_cronometro if config else False,
            tiempo_limite_segundos=config.tiempo_default_segundos if config else None,
            datos_numericos=data.get("datos_numericos"),
            explicacion_referencia=data.get("explicacion_paso_a_paso"),
        )

    elif modulo_id == 4:
        # Módulo 4 — Detective: preguntas con tokens
        result = await db.execute(
            select(Pregunta)
            .where(and_(
                Pregunta.fase_id == FASE2_ID,
                Pregunta.seccion == seccion,
                Pregunta.estado == StatusEnum.ACTIVO,
            ))
            .order_by(func.random())
            .limit(1)
        )
        pregunta = result.scalar_one_or_none()
        if not pregunta:
            raise HTTPException(status_code=404, detail="No hay preguntas disponibles para este módulo.")

        tokens_raw = pregunta.payload_tokenizado or []
        tokens = [Fase2Token(**t) for t in tokens_raw] if tokens_raw else []

        return Fase2PreguntaParaAlumno(
            id=pregunta.id,
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=pregunta.enunciado,
            tipo_pregunta="subrayado_tokens",
            tiene_cronometro=config.usa_cronometro if config else False,
            tiempo_limite_segundos=config.tiempo_default_segundos if config else None,
            payload_tokenizado=tokens,
            datos_numericos=pregunta.datos_numericos,
        )

    elif modulo_id == 5:
        # Módulo 5 — Constructor: preguntas encadenadas
        result = await db.execute(
            select(Pregunta)
            .where(and_(
                Pregunta.fase_id == FASE2_ID,
                Pregunta.seccion == seccion,
                Pregunta.estado == StatusEnum.ACTIVO,
            ))
            .order_by(func.random())
            .limit(1)
        )
        pregunta = result.scalar_one_or_none()
        if not pregunta:
            raise HTTPException(status_code=404, detail="No hay preguntas disponibles para este módulo.")

        pasos = []
        if pregunta.datos_numericos and "pasos" in pregunta.datos_numericos:
            pasos = pregunta.datos_numericos["pasos"]

        return Fase2PreguntaParaAlumno(
            id=pregunta.id,
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            enunciado=pregunta.enunciado,
            tipo_pregunta="constructor_soluciones_chained",
            tiene_cronometro=config.usa_cronometro if config else False,
            tiempo_limite_segundos=config.tiempo_default_segundos if config else None,
            pasos_encadenados=pasos,
            datos_numericos=pregunta.datos_numericos,
        )

    raise HTTPException(status_code=400, detail=f"Módulo {modulo_id} no válido.")


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 3 — Responder pregunta
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/responder", response_model=Fase2ResultadoRespuesta)
async def responder_fase2(
    payload: Fase2ResponderPregunta,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Valida la respuesta del alumno e implementa el Bucle Espejo.
    """
    alumno = await _get_alumno(db, current_user)
    modulo_id = payload.modulo_id
    nivel_id = payload.nivel_id
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    config = await _get_config(db, seccion, operacion)
    progreso = await _get_or_create_progreso(db, alumno.id, seccion, operacion)

    es_correcta = False
    tokens_correctos = None
    paso_aprobado = None
    valor_paso1_congelado = None
    respuesta_correcta_str = None

    # ── VALIDACIÓN POR TIPO ──────────────────────────────────────────────────

    if modulo_id in (1, 2, 3):
        # Generada dinámicamente — recalcular con mismo seed
        if payload.enunciado_seed:
            seed = int(payload.enunciado_seed)
        else:
            seed = _make_seed(alumno.id, modulo_id, nivel_id)
        data = generate_question(modulo_id, nivel_id, seed)
        respuesta_correcta_str = data["respuesta_correcta"]
        respuesta_normalizada = (payload.respuesta_dada or "").strip().lower().replace(",", ".").replace("r$ ", "")
        correcta_normalizada = respuesta_correcta_str.strip().lower().replace(",", ".").replace("r$ ", "")
        es_correcta = respuesta_normalizada == correcta_normalizada

    elif modulo_id == 4:
        # Comparar token IDs seleccionados con los correctos
        if not payload.pregunta_id:
            raise HTTPException(status_code=400, detail="pregunta_id es requerido para el Módulo 4.")
        result = await db.execute(select(Pregunta).where(Pregunta.id == payload.pregunta_id))
        pregunta = result.scalar_one_or_none()
        if not pregunta:
            raise HTTPException(status_code=404, detail="Pregunta no encontrada.")

        tokens_raw = pregunta.payload_tokenizado or []
        ids_correctos = sorted([t["id"] for t in tokens_raw if t.get("es_dato_relevante")])
        ids_enviados = sorted(payload.tokens_seleccionados or [])
        tokens_correctos = ids_correctos
        es_correcta = ids_enviados == ids_correctos
        respuesta_correcta_str = str(ids_correctos)

    elif modulo_id == 5:
        # Validación por paso
        if not payload.pregunta_id:
            raise HTTPException(status_code=400, detail="pregunta_id es requerido para el Módulo 5.")
        result = await db.execute(select(Pregunta).where(Pregunta.id == payload.pregunta_id))
        pregunta = result.scalar_one_or_none()
        if not pregunta:
            raise HTTPException(status_code=404, detail="Pregunta no encontrada.")

        pasos = (pregunta.datos_numericos or {}).get("pasos", [])
        paso_idx = (payload.paso_numero or 1) - 1
        if paso_idx < 0 or paso_idx >= len(pasos):
            raise HTTPException(status_code=400, detail="Número de paso inválido.")

        paso = pasos[paso_idx]
        respuesta_correcta_str = str(paso.get("respuesta_correcta", ""))
        respuesta_normalizada = (payload.respuesta_dada or "").strip()
        es_correcta = respuesta_normalizada == respuesta_correcta_str
        paso_aprobado = payload.paso_numero
        if es_correcta and payload.paso_numero == 1:
            valor_paso1_congelado = respuesta_correcta_str

    # ── ACTUALIZAR PROGRESO ─────────────────────────────────────────────────

    progreso.intentos_totales += 1
    if es_correcta:
        progreso.aciertos_acumulados += 1

    cantidad_req = config.cantidad_requerida if config else 10
    progreso.porcentaje_actual = min(100, int((progreso.aciertos_acumulados / cantidad_req) * 100)) if cantidad_req > 0 else 0

    bloque_completado = False
    fase_completada = False
    porc_aprobacion = config.porcentaje_aprobacion if config else 80

    if progreso.porcentaje_actual >= porc_aprobacion and progreso.aciertos_acumulados >= cantidad_req:
        progreso.estado = EstadoProgresoEnum.APROBADO
        progreso.fecha_aprobacion = datetime.utcnow()
        bloque_completado = True

    # ── REGISTRAR INTENTO ───────────────────────────────────────────────────

    intento = Intento(
        alumno_id=alumno.id,
        pregunta_id=payload.pregunta_id or 0,
        respuesta_dada=payload.respuesta_dada or str(payload.tokens_seleccionados),
        es_correcta=es_correcta,
        fase_id=FASE2_ID,
        seccion=seccion,
        operacion=operacion,
        tiempo_respuesta_segundos=payload.tiempo_respuesta_segundos,
    )
    db.add(intento)

    # ── BUCLE ESPEJO ────────────────────────────────────────────────────────

    # El Bucle Espejo se activa sólo en módulos 1-3 (generados)
    espejo = False
    intentos_espejo = 0
    soporte_avanzado = False

    if not es_correcta and modulo_id in (1, 2, 3):
        # Contamos intentos fallidos recientes (últimos MAX_ESPEJO + 1)
        result = await db.execute(
            select(Intento)
            .where(and_(
                Intento.alumno_id == alumno.id,
                Intento.fase_id == FASE2_ID,
                Intento.seccion == seccion,
                Intento.es_correcta == False,
            ))
            .order_by(Intento.fecha.desc())
            .limit(MAX_ESPEJO + 1)
        )
        fallos_recientes = result.scalars().all()
        intentos_espejo = len(fallos_recientes)
        espejo = intentos_espejo > 0
        soporte_avanzado = intentos_espejo >= MAX_ESPEJO

    await db.commit()

    return Fase2ResultadoRespuesta(
        es_correcta=es_correcta,
        respuesta_correcta=respuesta_correcta_str,
        aciertos_acumulados=progreso.aciertos_acumulados,
        intentos_totales=progreso.intentos_totales,
        porcentaje_actual=progreso.porcentaje_actual,
        bloque_completado=bloque_completado,
        fase_completada=fase_completada,
        es_espejo=espejo,
        intentos_espejo_actuales=intentos_espejo,
        intentos_espejo_max=MAX_ESPEJO,
        soporte_avanzado=soporte_avanzado,
        tokens_correctos=tokens_correctos,
        paso_aprobado=paso_aprobado,
        valor_paso1_congelado=valor_paso1_congelado,
    )


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 4 — Contenido de lectura
# ─────────────────────────────────────────────────────────────────────────────

_LECTURAS = {
    (1, 1): Fase2ContenidoLectura(
        modulo_id=1, nivel_id=1, titulo="Escalas: Doble, Mitad y Triple",
        parrafos=[
            "Cuando multiplicamos un número por 2, obtenemos su doble.",
            "Cuando dividimos un número por 2, obtenemos su mitad.",
            "Cuando multiplicamos un número por 3, obtenemos su triple.",
        ],
        ejemplos=[{"enunciado": "El doble de 8", "respuesta": "8 × 2 = 16"}],
        tip_pedagogico="Recuerda: 'el doble' siempre multiplica por 2.",
    ),
    (1, 2): Fase2ContenidoLectura(
        modulo_id=1, nivel_id=2, titulo="Orden de Operaciones",
        parrafos=[
            "Las multiplicaciones y divisiones siempre se resuelven ANTES que las sumas y restas.",
            "Lee la expresión completa antes de empezar a calcular.",
        ],
        ejemplos=[{"enunciado": "3 + 2 × 4", "respuesta": "Primero: 2 × 4 = 8. Luego: 3 + 8 = 11"}],
        tip_pedagogico="Piensa en la multiplicación como un 'grupo' que siempre va primero.",
    ),
    (2, 1): Fase2ContenidoLectura(
        modulo_id=2, nivel_id=1, titulo="Suma y Resta son Inversas",
        parrafos=[
            "Si a + b = c, entonces c - b = a.",
            "Para encontrar un número desconocido en una suma, usa la resta.",
        ],
        ejemplos=[{"enunciado": "___ + 5 = 12", "respuesta": "12 - 5 = 7"}],
        tip_pedagogico="Piensa: ¿qué número le falta al total?",
    ),
    (3, 1): Fase2ContenidoLectura(
        modulo_id=3, nivel_id=1, titulo="Reconocimiento de Monedas (R$)",
        parrafos=[
            "En Brasil, las monedas son: 5¢, 10¢, 25¢, 50¢ y R$ 1,00.",
            "Para sumar dinero, trabaja en centavos para evitar errores.",
        ],
        ejemplos=[{"enunciado": "R$ 0,25 + R$ 0,50", "respuesta": "25 + 50 = 75 centavos = R$ 0,75"}],
        tip_pedagogico="Convierte todo a centavos, suma, y después convierte el resultado a R$.",
    ),
}


@router.get("/lectura/{modulo_id}/nivel/{nivel_id}", response_model=Fase2ContenidoLectura)
async def get_lectura_fase2(
    modulo_id: int,
    nivel_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Devuelve el contenido de lectura/teoría de un nivel específico."""
    lectura = _LECTURAS.get((modulo_id, nivel_id))
    if not lectura:
        # Lectura genérica para niveles sin contenido específico
        return Fase2ContenidoLectura(
            modulo_id=modulo_id,
            nivel_id=nivel_id,
            titulo=f"Módulo {modulo_id} — Nivel {nivel_id}",
            parrafos=["Practica con atención y verás que mejorarás rápidamente."],
            tip_pedagogico="Lee el enunciado dos veces antes de responder.",
        )
    return lectura


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 5 — Graduación a Fase 3
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/graduate")
async def graduate_fase2(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Gradúa al alumno de Fase 2 a Fase 3 si todos los módulos están dominados.
    """
    alumno = await _get_alumno(db, current_user)

    # Verificar que todos los 20 niveles estén aprobados
    result = await db.execute(
        select(func.count(ProgresoMaestria.id)).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE2_ID,
            ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO,
        ))
    )
    aprobados = result.scalar()
    if aprobados < 20:
        raise HTTPException(
            status_code=400,
            detail=f"Debes dominar los 20 niveles de Fase 2. Llevas {aprobados}/20.",
        )

    # Buscar Fase 3
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
