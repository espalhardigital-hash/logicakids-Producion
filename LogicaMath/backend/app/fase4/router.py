import random
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, delete, cast, Integer
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
from ..fase2.models import NivelTeoria
from ..fase2.schemas import (
    Fase2Dashboard as Fase4Dashboard, Fase2ModuloInfo as Fase4ModuloInfo,
    Fase2NivelInfo as Fase4NivelInfo, Fase2DesafioInfo as Fase4DesafioInfo,
    Fase2PreguntaParaAlumno as Fase4PreguntaParaAlumno, Fase2AlternativaOut as Fase4AlternativaOut,
    Fase2ResponderPregunta as Fase4ResponderPregunta, Fase2ResultadoRespuesta as Fase4ResultadoRespuesta,
    Fase2ContenidoLectura as Fase4ContenidoLectura, Fase2CerrarRescate as Fase4CerrarRescate
)

router = APIRouter(prefix="/fase4", tags=["fase4"])

FASE4_ID = 4
MAX_ESPEJO = 3  # Intentos máximos en Bucle Espejo

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
            if "fase4" not in settings["unlockedLevels"]:
                settings["unlockedLevels"]["fase4"] = {}
                
            cat_map = {
                "suma": "addition",
                "resta": "subtraction",
                "multiplicacion": "multiplication",
                "division": "division",
                "mixta": "challenge"
            }
            cat = cat_map.get(operacion, "challenge")
            settings["unlockedLevels"]["fase4"][cat] = 6
            user.settings = settings
            flag_modified(user, "settings")
            await db.flush()

MODULOS_META = {
    1: {
        "nombre": "La Fracción Visual",
        "descripcion": "Concepto de parte-todo y fracciones equivalentes.",
        "icono": "pie-chart",
        "color": "#A855F7"  # Púrpura neón
    },
    2: {
        "nombre": "Fracción de Cantidad",
        "descripcion": "Operador fraccionario sobre conjuntos finitos.",
        "icono": "divide",
        "color": "#C084FC"  # Púrpura brillante
    },
    3: {
        "nombre": "Porcentajes Rápidos y Promedios",
        "descripcion": "Equivalencias, estadística y media aritmética.",
        "icono": "percent",
        "color": "#7C3AED"  # Púrpura oscuro
    },
    4: {
        "nombre": "Razón y Mezclas",
        "descripcion": "Escalas numéricas, razones y reparto proporcional.",
        "icono": "beaker",
        "color": "#6D28D9"  # Púrpura profundo
    }
}

NIVELES_META = {
    (1, 1): {"nombre": "Lectura de Fracciones", "descripcion": "Lectura y modelado de numerador/denominador en polígonos simétricos."},
    (1, 2): {"nombre": "Fracciones Equivalentes", "descripcion": "Construcción de equivalencias mediante amplificación."},
    (1, 3): {"nombre": "Áreas y Asimetrías", "descripcion": "Áreas fraccionarias en composiciones geométricas asimétricas."},
    (2, 1): {"nombre": "Porciones de un Grupo", "descripcion": "Cálculo de porciones unitarias (1/n) sobre grupos."},
    (2, 2): {"nombre": "El Motor de Dos Pasos", "descripcion": "Operador compuesto (m/n de X) y algoritmo de dos pasos."},
    (2, 3): {"nombre": "Lógica del Complemento", "descripcion": "Deducción de la fracción del resto y lo que queda."},
    (3, 1): {"nombre": "Porcentajes Intuitivos", "descripcion": "Mapeo de porcentajes comunes: 50%, 25%, 10%."},
    (3, 2): {"nombre": "Gráficos Circulares", "descripcion": "Lectura e interpretación de gráficos circulares."},
    (3, 3): {"nombre": "Gráficos de Barras", "descripcion": "Comparación de tasas y lectura de gráficos de barras."},
    (3, 4): {"nombre": "La Media Aritmética", "descripcion": "El punto de equilibrio y cálculo de promedios."},
    (4, 1): {"nombre": "Razones y Proporciones", "descripcion": "Razones simples (a:b) y proporcionalidad directa."},
    (4, 2): {"nombre": "Reparto de Volúmenes", "descripcion": "Reparto proporcional de volúmenes macro a escala."},
    (4, 3): {"nombre": "Mezclas Complejas", "descripcion": "Homogeneización de mezclas complejas y porcentajes de volumen."},
}

def _seccion_operacion(modulo_id: int, nivel_id: int) -> tuple:
    if modulo_id == 99 or nivel_id in (11, 12, 13):
        seccion = modulo_id * 1000 + nivel_id
        return seccion, "mixta"
    else:
        seccion = modulo_id * 100 + nivel_id
        return seccion, "mixta"

async def _get_global_config(db: AsyncSession) -> dict:
    result = await db.execute(
        select(PlatformSettings).where(PlatformSettings.key == "pedagogy_config")
    )
    settings = result.scalar_one_or_none()
    if not settings:
        return {
            "practica_libre": {
                "cantidad_requerida": 15,
                "porcentaje_aprobacion": 90,
                "usa_cronometro": False,
                "tiempo_default_segundos": 15,
                "tipo_feedback": "detallado"
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
            ConfiguracionProgreso.fase_id == FASE4_ID,
            ConfiguracionProgreso.seccion == seccion,
            ConfiguracionProgreso.activo == True
        ))
    )
    config = result.scalar_one_or_none()
    if config:
        return config

    result_phase = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == FASE4_ID,
            ConfiguracionProgreso.seccion == 0,
            ConfiguracionProgreso.operacion == "mixta",
            ConfiguracionProgreso.activo == True
        ))
    )
    return result_phase.scalar_one_or_none()

async def _get_progreso(db: AsyncSession, alumno_id: int, seccion: int, operacion: str) -> ProgresoMaestria:
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno_id,
            ProgresoMaestria.fase_id == FASE4_ID,
            ProgresoMaestria.seccion == seccion
        ))
    )
    progreso = result.scalar_one_or_none()
    if not progreso:
        progreso = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=FASE4_ID,
            seccion=seccion,
            operacion=operacion,
            estado=EstadoProgresoEnum.BLOQUEADO,
            aciertos_acumulados=0,
            intentos_totales=0,
            porcentaje_actual=0
        )
        db.add(progreso)
        await db.flush()
    return progreso

# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/dashboard", response_model=Fase4Dashboard)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    # Cargar todos los progresos de Fase 4 del estudiante
    result_prog = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE4_ID
        ))
    )
    progresos = {p.seccion: p for p in result_prog.scalars().all()}
    
    # Cargar todas las configuraciones activas de Fase 4
    result_configs = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == FASE4_ID,
            ConfiguracionProgreso.activo == True
        ))
    )
    configs = {c.seccion: c for c in result_configs.scalars().all()}
    
    # El primer nivel de Fase 4 se autodesbloquea si el alumno está en la Fase 4 o superior, o si es Admin
    fase_actual_ok = alumno.fase_actual_id >= FASE4_ID
    
    modulos_list = []
    tot_puntos = 0
    all_dominated = True
    
    for m_id, m_meta in MODULOS_META.items():
        niveles_list = []
        desafios_list = []
        
        # Módulos y niveles de Fase 4
        n_ids = range(1, 5) if m_id == 3 else range(1, 4)
        m_unlocked = False
        
        for n_id in n_ids:
            sec_n, op_n = _seccion_operacion(m_id, n_id)
            prog = progresos.get(sec_n)
            
            # Condición de desbloqueo: Primer nivel de M1 está abierto de entrada.
            # Los demás requieren que el nivel anterior de la lista esté aprobado (y para pasar de módulo, requiere además todos los desafíos).
            if m_id == 1 and n_id == 1:
                is_unlocked = fase_actual_ok
            else:
                # Nivel anterior
                if n_id > 1:
                    prev_sec, prev_op = _seccion_operacion(m_id, n_id - 1)
                    prev_prog = progresos.get(prev_sec)
                    is_unlocked = prev_prog is not None and prev_prog.estado == EstadoProgresoEnum.APROBADO
                else:
                    # Último del módulo anterior
                    prev_m = m_id - 1
                    prev_n = 4 if prev_m == 3 else 3
                    
                    # Check all practice levels of previous module
                    all_practice_ok = True
                    for p_level in range(1, prev_n + 1):
                        p_sec, p_op = _seccion_operacion(prev_m, p_level)
                        p_prog = progresos.get(p_sec)
                        if not p_prog or p_prog.estado != EstadoProgresoEnum.APROBADO:
                            all_practice_ok = False
                            break
                            
                    # Check all challenges of previous module
                    all_challenges_ok = True
                    for des_id in (11, 12, 13):
                        c_sec, c_op = _seccion_operacion(prev_m, des_id)
                        c_prog = progresos.get(c_sec)
                        if not c_prog or c_prog.estado != EstadoProgresoEnum.APROBADO:
                            all_challenges_ok = False
                            break
                            
                    is_unlocked = all_practice_ok and all_challenges_ok
                
            estado_n = "bloqueado"
            aciertos_n = 0
            porcentaje_n = 0
            
            if is_unlocked:
                estado_n = "en_progreso"
                m_unlocked = True
                if prog:
                    aciertos_n = prog.aciertos_acumulados
                    porcentaje_n = prog.porcentaje_actual
                    if prog.estado == EstadoProgresoEnum.APROBADO:
                        estado_n = "dominado"
                        porcentaje_n = 100
                        tot_puntos += 10
            
            if estado_n != "dominado":
                all_dominated = False
                
            niveles_list.append(Fase4NivelInfo(
                nivel_id=n_id,
                nombre=NIVELES_META[(m_id, n_id)]["nombre"],
                descripcion=NIVELES_META[(m_id, n_id)]["descripcion"],
                estado=estado_n,
                aciertos=aciertos_n,
                porcentaje=porcentaje_n
            ))
            
        # Desafíos
        all_m_levels_dominated = all(n.estado == "dominado" for n in niveles_list)
        
        for d_id in [11, 12, 13]:
            sec_d, op_d = _seccion_operacion(m_id, d_id)
            prog = progresos.get(sec_d)
            
            # Desbloqueo de desafíos: D11 requiere todos los niveles prácticos dominados.
            # D12 requiere D11 dominado. D13 requiere D12 dominado.
            if d_id == 11:
                is_d_unlocked = all_m_levels_dominated
            elif d_id == 12:
                d11_sec, d11_op = _seccion_operacion(m_id, 11)
                d11_prog = progresos.get(d11_sec)
                is_d_unlocked = d11_prog is not None and d11_prog.estado == EstadoProgresoEnum.APROBADO
            else:
                d12_sec, d12_op = _seccion_operacion(m_id, 12)
                d12_prog = progresos.get(d12_sec)
                is_d_unlocked = d12_prog is not None and d12_prog.estado == EstadoProgresoEnum.APROBADO
                
            estado_d = "bloqueado"
            aciertos_d = 0
            porcentaje_d = 0
            
            if is_d_unlocked:
                estado_d = "en_progreso"
                if prog:
                    aciertos_d = prog.aciertos_acumulados
                    porcentaje_d = prog.porcentaje_actual
                    if prog.estado == EstadoProgresoEnum.APROBADO:
                        estado_d = "dominado"
                        porcentaje_d = 100
                        tot_puntos += 25
                        
            if estado_d != "dominado":
                all_dominated = False
                
            d_name_map = {11: "Desafío Inicial", 12: "Desafío Intermedio", 13: "Desafío Final"}
            d_diff_map = {11: "estandar", 12: "avanzada", 13: "maestria"}
            d_time_map = {11: 25, 12: 40, 13: 50}

            config_d = configs.get(sec_d)
            if config_d:
                usa_crono = config_d.usa_cronometro
                tiempo_limite = config_d.tiempo_default_segundos if (config_d.tiempo_default_segundos is not None and config_d.tiempo_default_segundos > 0) else d_time_map[d_id]
                cantidad_req = config_d.cantidad_requerida
                porc_aprobacion = config_d.porcentaje_aprobacion
            else:
                usa_crono = True
                tiempo_limite = d_time_map[d_id]
                cantidad_req = 10 if d_id == 13 else 20
                porc_aprobacion = 90

            if not usa_crono:
                tiempo_limite = 0

            max_errores_dinamico = calcular_max_errores(cantidad_req, porc_aprobacion)

            desafios_list.append(Fase4DesafioInfo(
                desafio_id=d_id,
                nombre=d_name_map[d_id],
                estado=estado_d,
                aciertos=aciertos_d,
                porcentaje=porcentaje_d,
                dificultad=d_diff_map[d_id],
                tiempo_limite=tiempo_limite,
                max_errores=max_errores_dinamico,
            ))
            
        m_status = "bloqueado"
        if m_unlocked:
            m_status = "en_progreso"
            if all(n.estado == "dominado" for n in niveles_list) and all(d.estado == "dominado" for d in desafios_list):
                m_status = "dominado"
                
        # Porcentaje global del módulo
        total_blocks = len(niveles_list) + len(desafios_list)
        dominated_blocks = sum(1 for n in niveles_list if n.estado == "dominado") + sum(1 for d in desafios_list if d.estado == "dominado")
        pct_global = int((dominated_blocks / total_blocks) * 100)
        
        modulos_list.append(Fase4ModuloInfo(
            modulo_id=m_id,
            nombre=m_meta["nombre"],
            descripcion=m_meta["descripcion"],
            icono=m_meta["icono"],
            color=m_meta["color"],
            estado=m_status,
            porcentaje_global=pct_global,
            niveles=niveles_list,
            desafios=desafios_list
        ))
        
    desafio_mixto_disp = all_dominated and fase_actual_ok
    desafio_mixto_est = "bloqueado"
    if desafio_mixto_disp:
        desafio_mixto_est = "en_progreso"
        # Si el alumno ya graduó de Fase 4, está dominado
        if alumno.fase_actual_id > FASE4_ID:
            desafio_mixto_est = "completado"
            
    return Fase4Dashboard(
        alumno_nombre=alumno.nombre,
        puntos_totales=tot_puntos,
        desafio_mixto_disponible=desafio_mixto_disp,
        desafio_mixto_estado=desafio_mixto_est,
        modulos=modulos_list
    )

# ─────────────────────────────────────────────────────────────────────────────
# OBTENER PREGUNTA
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/modulo/{modulo_id}/nivel/{nivel_id}/pregunta", response_model=Fase4PreguntaParaAlumno)
async def get_pregunta(
    modulo_id: int,
    nivel_id: int,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    seccion, operacion = _seccion_operacion(modulo_id, nivel_id)
    is_challenge = modulo_id == 99 or nivel_id in (11, 12, 13)
    
    # 1. Recuperar o inicializar progreso
    progreso = await _get_progreso(db, alumno.id, seccion, operacion)
    
    # 2. Cargar configuración
    config = await _get_config(db, seccion, operacion)
    if not config:
        raise HTTPException(status_code=404, detail="Configuración de progreso no parametrizada para este bloque.")
        
    # 3. Comprobar si el bloque ya fue completado
    max_aciertos = config.cantidad_requerida
    if progreso.aciertos_acumulados >= max_aciertos:
        # Ya completó el bloque. Reasignamos o limpiamos para permitir repetir
        progreso.aciertos_acumulados = 0
        progreso.porcentaje_actual = 0
        await db.flush()

    # 4. Asignar Pool de Preguntas
    result_pool = await db.execute(
        select(PoolAsignadoAlumno).where(and_(
            PoolAsignadoAlumno.alumno_id == alumno.id,
            PoolAsignadoAlumno.fase_id == FASE4_ID,
            PoolAsignadoAlumno.seccion == seccion,
            PoolAsignadoAlumno.operacion == operacion
        )).options(selectinload(PoolAsignadoAlumno.pregunta))
    )
    pool = result_pool.scalars().all()
    
    # Si el pool está vacío o completó todas, sembramos de nuevo
    pool_pendientes = [p for p in pool if not p.respondida_correctamente]
    
    if not pool or len(pool_pendientes) == 0:
        # Limpiar anterior
        if pool:
            await db.execute(
                delete(PoolAsignadoAlumno).where(and_(
                    PoolAsignadoAlumno.alumno_id == alumno.id,
                    PoolAsignadoAlumno.seccion == seccion
                ))
            )
            await db.flush()
            
        # Consultar pool general de la base de datos para esta sección
        if is_challenge and modulo_id == 99:
            result_q = await db.execute(
                select(Pregunta).where(and_(
                    Pregunta.fase_id == FASE4_ID,
                    Pregunta.estado == StatusEnum.ACTIVO
                ))
            )
        else:
            result_q = await db.execute(
                select(Pregunta).where(and_(
                    Pregunta.fase_id == FASE4_ID,
                    Pregunta.seccion == seccion,
                    Pregunta.estado == StatusEnum.ACTIVO
                ))
            )
        preguntas_db = result_q.scalars().all()
        if not preguntas_db:
            raise HTTPException(status_code=404, detail="No se encontraron preguntas en el banco para este nivel.")
            
        # Si es modo Práctica Libre (var=0 es la original)
        if not is_challenge:
            # Seleccionar familias únicas
            familias = list(set(p.estructura_padre_id for p in preguntas_db if p.estructura_padre_id))
            random.shuffle(familias)
            selected_fams = familias[:max_aciertos]
            
            # Sembrar las preguntas originales de esas familias (variante=0)
            for fam_id in selected_fams:
                fam_q = [p for p in preguntas_db if p.estructura_padre_id == fam_id and p.datos_numericos.get("variante") == 0]
                if fam_q:
                    q = fam_q[0]
                    pa = PoolAsignadoAlumno(
                        alumno_id=alumno.id,
                        pregunta_id=q.id,
                        fase_id=FASE4_ID,
                        seccion=seccion,
                        operacion=operacion,
                        respondida_correctamente=False
                    )
                    db.add(pa)
        else:
            # En Desafíos sembramos aleatoriamente sin espejo inicial
            random.shuffle(preguntas_db)
            selected_qs = preguntas_db[:max_aciertos]
            for q in selected_qs:
                pa = PoolAsignadoAlumno(
                    alumno_id=alumno.id,
                    pregunta_id=q.id,
                    fase_id=FASE4_ID,
                    seccion=seccion,
                    operacion=operacion,
                    respondida_correctamente=False
                )
                db.add(pa)
                
        await db.commit()
        
        # Recargar
        result_pool = await db.execute(
            select(PoolAsignadoAlumno).where(and_(
                PoolAsignadoAlumno.alumno_id == alumno.id,
                PoolAsignadoAlumno.fase_id == FASE4_ID,
                PoolAsignadoAlumno.seccion == seccion,
                PoolAsignadoAlumno.operacion == operacion
            )).options(selectinload(PoolAsignadoAlumno.pregunta))
        )
        pool = result_pool.scalars().all()
        pool_pendientes = [p for p in pool if not p.respondida_correctamente]
        
    # 5. Tomar la primera pendiente
    pool_item = pool_pendientes[0]
    pregunta_act = pool_item.pregunta
    
    # Cargar alternativas si las tiene
    result_alt = await db.execute(
        select(Alternativa).where(Alternativa.pregunta_id == pregunta_act.id).order_by(Alternativa.orden.asc())
    )
    alternativas_db = result_alt.scalars().all()
    alts_out = [
        Fase4AlternativaOut(id=a.id, texto=a.texto) for a in alternativas_db
    ] if alternativas_db else None
    
    # Calcular timer
    tiene_cronometro = config.usa_cronometro
    tiempo_limite = config.tiempo_default_segundos
    
    return Fase4PreguntaParaAlumno(
        id=pregunta_act.id,
        modulo_id=modulo_id,
        nivel_id=nivel_id,
        enunciado=pregunta_act.enunciado,
        tipo_pregunta=pregunta_act.tipo_pregunta,
        respuesta_correcta=pregunta_act.respuesta_correcta if pregunta_act.tipo_pregunta != TipoPreguntaEnum.MULTIPLE_OPCION else None,
        alternativas=alts_out,
        tiene_cronometro=tiene_cronometro,
        tiempo_limite_segundos=tiempo_limite,
        datos_numericos=pregunta_act.datos_numericos,
        aciertos_acumulados=progreso.aciertos_acumulados,
        intentos_totales=progreso.intentos_totales,
        porcentaje_actual=progreso.porcentaje_actual,
        cantidad_requerida=config.cantidad_requerida if config else 15
    )

# ─────────────────────────────────────────────────────────────────────────────
# VALIDAR RESPUESTA
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/responder", response_model=Fase4ResultadoRespuesta)
async def responder_pregunta(
    payload: Fase4ResponderPregunta,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    seccion, operacion = _seccion_operacion(payload.modulo_id, payload.nivel_id)
    is_challenge = payload.modulo_id == 99 or payload.nivel_id in (11, 12, 13)
    
    # 1. Recuperar pregunta
    result_q = await db.execute(
        select(Pregunta).where(Pregunta.id == payload.pregunta_id)
    )
    pregunta = result_q.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada.")
        
    # 2. Cargar config
    config = await _get_config(db, seccion, operacion)
    if not config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada.")
        
    # 3. Recuperar progreso
    progreso = await _get_progreso(db, alumno.id, seccion, operacion)
    
    # 4. Validar acierto
    es_correcta = False
    tipo_error = None
    feedback_msg = "Respuesta incorrecta."
    
    # Recuperar alternativas para validar
    result_alt = await db.execute(
        select(Alternativa).where(Alternativa.pregunta_id == pregunta.id)
    )
    alternativas = result_alt.scalars().all()
    
    if pregunta.tipo_pregunta == TipoPreguntaEnum.MULTIPLE_OPCION:
        if not payload.alternativa_id:
            raise HTTPException(status_code=400, detail="Debes enviar la alternativa_id para preguntas de opción múltiple.")
        alt_sel = next((a for a in alternativas if a.id == payload.alternativa_id), None)
        if alt_sel:
            es_correcta = alt_sel.es_correcta
            if not es_correcta:
                tipo_error = alt_sel.tipo_error or TipoErrorEnum.CALCULO
                feedback_msg = alt_sel.feedback_error or "Respuesta incorrecta."
    else:
        if not payload.respuesta_dada:
            raise HTTPException(status_code=400, detail="Debes enviar la respuesta_dada.")
        
        normalized_given = normalize_response(payload.respuesta_dada)
        normalized_correct = normalize_response(pregunta.respuesta_correcta)
        
        es_correcta = (normalized_given == normalized_correct)
        if es_correcta:
            feedback_msg = "¡Excelente trabajo! ¡Respuesta correcta!"
        else:
            tipo_error = TipoErrorEnum.CALCULO
            # Buscar si el tutor invisible tiene consejos específicos
            feedback_msg = "Vuelve a calcular. ¡Tú puedes!"
            
    # Registrar Intento
    intento = Intento(
        alumno_id=alumno.id,
        pregunta_id=pregunta.id,
        alternativa_id=payload.alternativa_id,
        respuesta_dada=payload.respuesta_dada,
        es_correcta=es_correcta,
        fase_id=FASE4_ID,
        seccion=seccion,
        operacion=operacion,
        tipo_error=tipo_error if not es_correcta else None,
        feedback_mostrado=feedback_msg,
        tiempo_respuesta_segundos=payload.tiempo_respuesta_segundos
    )
    db.add(intento)
    await db.flush()
    
    # 5. Lógica del pool asignado
    result_pool = await db.execute(
        select(PoolAsignadoAlumno).where(and_(
            PoolAsignadoAlumno.alumno_id == alumno.id,
            PoolAsignadoAlumno.pregunta_id == pregunta.id
        ))
    )
    pool_item = result_pool.scalar_one_or_none()
    
    early_exit = False
    es_espejo = False
    explicacion_profunda = None
    
    if es_correcta:
        # Acierto
        if pool_item:
            pool_item.respondida_correctamente = True
            pool_item.respondida_alguna_vez = True
            pool_item.numero_intentos += 1
            
        progreso.aciertos_acumulados += 1
        progreso.intentos_totales += 1
        
        # Calcular porcentaje actual de aciertos con base en la cantidad requerida
        progreso.porcentaje_actual = int((progreso.aciertos_acumulados / config.cantidad_requerida) * 100)
    else:
        # Error
        progreso.intentos_totales += 1
        if pool_item:
            pool_item.numero_intentos += 1
            pool_item.respondida_alguna_vez = True
            
        # Lógica especial de Práctica vs Desafíos
        if not is_challenge:
            # MODO PRÁCTICA LIBRE: Bucle Espejo (Mirror Loop)
            # Obtenemos la variante actual (0=original, 1, 2, 3 son espejos)
            variante_actual = pregunta.datos_numericos.get("variante", 0)
            
            if variante_actual < MAX_ESPEJO:
                # Activamos el bucle espejo reemplazando la pregunta actual del pool por su variante espejo
                siguiente_variante = variante_actual + 1
                
                # Buscar la variante espejo de la misma familia en el banco de preguntas
                result_mirror = await db.execute(
                    select(Pregunta).where(and_(
                        Pregunta.fase_id == FASE4_ID,
                        Pregunta.seccion == seccion,
                        Pregunta.estructura_padre_id == pregunta.estructura_padre_id,
                        cast(Pregunta.datos_numericos["variante"].astext, Integer) == siguiente_variante,
                        Pregunta.estado == StatusEnum.ACTIVO
                    ))
                )
                mirror_q = result_mirror.scalar_one_or_none()
                
                if mirror_q and pool_item:
                    # Remplazar pregunta en el pool asignado para mantener el índice lineal
                    pool_item.pregunta_id = mirror_q.id
                    pool_item.numero_intentos = 0
                    es_espejo = True
            else:
                # Llegó al límite del bucle espejo (espejo 3). Habilitamos bypass fluido y mostramos explicación
                explicacion_profunda = pregunta.explicacion_paso_a_paso.get("html") if pregunta.explicacion_paso_a_paso else None
        else:
            # MODO DESAFÍO: Salida Temprana (Early Exit)
            # Recuperamos los intentos de error en esta sesión de desafío
            result_errors = await db.execute(
                select(func.count(Intento.id)).where(and_(
                    Intento.alumno_id == alumno.id,
                    Intento.seccion == seccion,
                    Intento.es_correcta == False,
                    Intento.fecha >= progreso.fecha_inicio
                ))
            )
            errores_sesion = result_errors.scalar()
            
            # Límites de salida temprana dinámicos para evitar conflictos con el Administrador
            if config:
                cantidad_req = config.cantidad_requerida
                porc_aprobacion = config.porcentaje_aprobacion
            else:
                desafio_id = seccion % 1000
                cantidad_req = 10 if desafio_id == 13 else 20
                porc_aprobacion = 90

            max_errores_desafio = calcular_max_errores(cantidad_req, porc_aprobacion)
            
            if errores_sesion >= max_errores_desafio:
                # Expulsión y reinicio de progreso
                early_exit = True
                progreso.aciertos_acumulados = 0
                progreso.porcentaje_actual = 0
                progreso.estado = EstadoProgresoEnum.BLOQUEADO
                
                # Borrar pool asignado para obligar a sembrar desde cero en la siguiente entrada
                await db.execute(
                    delete(PoolAsignadoAlumno).where(and_(
                        PoolAsignadoAlumno.alumno_id == alumno.id,
                        PoolAsignadoAlumno.seccion == seccion
                    ))
                )
                feedback_msg = f"Has cometido {errores_sesion} errores. ¡Misión abortada! El progreso de este desafío se ha reiniciado."
                
    # Comprobar si se completó el bloque
    bloque_completado = False
    fase_completada = False
    
    if progreso.aciertos_acumulados >= config.cantidad_requerida:
        bloque_completado = True
        progreso.estado = EstadoProgresoEnum.APROBADO
        progreso.fecha_aprobacion = datetime.utcnow()
        
        # Sincronización legacy settings
        await _sync_unlocked_levels(db, alumno.id, "mixta")
        
        # Verificar si todos los 25 bloques de la Fase 4 están aprobados para habilitar graduación
        result_total_aprobados = await db.execute(
            select(func.count(ProgresoMaestria.id)).where(and_(
                ProgresoMaestria.alumno_id == alumno.id,
                ProgresoMaestria.fase_id == FASE4_ID,
                ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO
            ))
        )
        total_aprobados = result_total_aprobados.scalar()
        if total_aprobados >= 25:
            # Notifica que la fase fue completada, la graduación explícita será mediante /fase4/graduate
            fase_completada = True
                
    await db.commit()
    
    return Fase4ResultadoRespuesta(
        es_correcta=es_correcta,
        feedback_tutor=feedback_msg,
        aciertos_acumulados=progreso.aciertos_acumulados,
        intentos_totales=progreso.intentos_totales,
        porcentaje_actual=progreso.porcentaje_actual,
        bloque_completado=bloque_completado,
        fase_completada=fase_completada,
        es_espejo=es_espejo,
        early_exit=early_exit,
        respuesta_correcta=pregunta.respuesta_correcta,
        explicacion_profunda=explicacion_profunda
    )

# ─────────────────────────────────────────────────────────────────────────────
# CARGAR TEORÍA
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/lectura/{modulo_id}/nivel/{nivel_id}", response_model=Fase4ContenidoLectura)
async def get_lectura(
    modulo_id: int,
    nivel_id: int,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    result = await db.execute(
        select(NivelTeoria).where(and_(
            NivelTeoria.fase_id == FASE4_ID,
            NivelTeoria.modulo_id == modulo_id,
            NivelTeoria.nivel_id == nivel_id
        ))
    )
    theory = result.scalar_one_or_none()
    if not theory:
        raise HTTPException(status_code=404, detail="Teoría de nivel no encontrada en base de datos.")
        
    parrafos = [theory.texto_descubrimiento]
    
    return Fase4ContenidoLectura(
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
# GRADUACIÓN A FASE 5 (Exige 25 niveles aprobados)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/graduate")
async def graduate_fase4(
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    result = await db.execute(
        select(func.count(ProgresoMaestria.id)).where(and_(
            ProgresoMaestria.alumno_id == alumno.id,
            ProgresoMaestria.fase_id == FASE4_ID,
            ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO,
        ))
    )
    aprobados = result.scalar()
    if aprobados < 25:
        raise HTTPException(
            status_code=400,
            detail=f"Debes dominar los 25 niveles de Fase 4 (13 de práctica y 12 desafíos). Llevas {aprobados}/25.",
        )

    result = await db.execute(select(Fase).where(Fase.orden == 5))
    fase5 = result.scalar_one_or_none()
    if not fase5:
        raise HTTPException(status_code=500, detail="La Fase 5 aún no ha sido configurada.")

    alumno.fase_actual_id = fase5.id
    await db.commit()

    return {
        "message": "¡Felicitaciones! ¡Has dominado la Fase 4 y avanzas a la Fase 5!",
        "nueva_fase_id": fase5.id,
        "nueva_fase_nombre": fase5.nombre,
    }

# ─────────────────────────────────────────────────────────────────────────────
# ESCAPE DE RESCATE (Cerrar Bucle Espejo)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/cerrar-rescate", response_model=Fase4CerrarRescate)
async def cerrar_rescate(
    payload: Fase4CerrarRescate,
    db: AsyncSession = Depends(get_db),
    alumno: Alumno = Depends(get_current_student),
):
    seccion, operacion = _seccion_operacion(payload.modulo_id, payload.nivel_id)
    
    # 1. Recuperar pool asignado
    result_pool = await db.execute(
        select(PoolAsignadoAlumno).where(and_(
            PoolAsignadoAlumno.alumno_id == alumno.id,
            PoolAsignadoAlumno.seccion == seccion
        ))
    )
    pool = result_pool.scalars().all()
    
    if pool:
        # Buscamos la pregunta actual en juego
        pool_pendientes = [p for p in pool if not p.respondida_correctamente]
        if pool_pendientes:
            pool_item = pool_pendientes[0]
            
            # Buscar la pregunta original (variante 0) para saltar el bucle espejo y seguir el flujo lineal
            result_orig = await db.execute(
                select(Pregunta).where(and_(
                    Pregunta.id == pool_item.pregunta_id
                ))
            )
            curr_q = result_orig.scalar_one_or_none()
            
            if curr_q and curr_q.datos_numericos.get("variante", 0) > 0:
                result_orig_fam = await db.execute(
                    select(Pregunta).where(and_(
                        Pregunta.fase_id == FASE4_ID,
                        Pregunta.seccion == seccion,
                        Pregunta.estructura_padre_id == curr_q.estructura_padre_id,
                        cast(Pregunta.datos_numericos["variante"].astext, Integer) == 0,
                        Pregunta.estado == StatusEnum.ACTIVO
                    ))
                )
                orig_q = result_orig_fam.scalar_one_or_none()
                
                if orig_q:
                    # Marcamos la original como respondida correctamente para saltar esta familia
                    pool_item.pregunta_id = orig_q.id
                    pool_item.respondida_correctamente = True
                    pool_item.respondida_alguna_vez = True
                    
                    # Aumentar aciertos del alumno para mantener avance lineal
                    progreso = await _get_progreso(db, alumno.id, seccion, operacion)
                    config_rescate = await _get_config(db, seccion, operacion)
                    cantidad_req_rescate = config_rescate.cantidad_requerida if config_rescate else 15
                    progreso.aciertos_acumulados += 1
                    progreso.porcentaje_actual = int((progreso.aciertos_acumulados / cantidad_req_rescate) * 100)
                    
                    await db.commit()
                    
    return Fase4CerrarRescate(
        modulo_id=payload.modulo_id,
        nivel_id=payload.nivel_id,
        success=True
    )
