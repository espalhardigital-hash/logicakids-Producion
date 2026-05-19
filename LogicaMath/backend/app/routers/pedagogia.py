from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List
import random
from datetime import datetime

from ..schemas import (
    DashboardAlumno, ResponderPregunta, ResultadoRespuesta,
    ProgresoMaestriaResponse, ProgresoResumenFase, FaseResponse,
    PreguntaParaAlumno, AlternativaParaAlumno, ConfiguracionProgresoResponse
)
from ..db.session import get_db
from ..models.sql_models import (
    Alumno, Fase, Pregunta, Alternativa, ConfiguracionProgreso,
    ProgresoMaestria, Intento, PoolAsignadoAlumno, StatusEnum, EstadoProgresoEnum,
    SesionEvaluacion
)
from ..auth import get_current_user

router = APIRouter(prefix="/pedagogia", tags=["pedagogia"])

@router.get("/dashboard", response_model=DashboardAlumno)
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        raise HTTPException(status_code=400, detail="El usuario no tiene un perfil de alumno asociado.")

    # 1. Obtener Alumno
    result = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result.scalar_one_or_none()
    
    if not alumno:
        raise HTTPException(status_code=404, detail="Perfil de alumno no encontrado.")
    
    # 2. Obtener Fase Actual
    fase_actual = None
    configuracion_bloque = None
    siguiente_pregunta = None
    progreso_fase = None
    
    if alumno.fase_actual_id:
        result = await db.execute(select(Fase).where(Fase.id == alumno.fase_actual_id))
        fase = result.scalar_one_or_none()
        if fase:
            fase_actual = FaseResponse.model_validate(fase)
            
            # Obtener todos los progresos de esta fase para el alumno
            result = await db.execute(
                select(ProgresoMaestria)
                .where(and_(ProgresoMaestria.alumno_id == alumno_id, ProgresoMaestria.fase_id == fase.id))
            )
            progresos = list(result.scalars().all())
            
            # --- AUTO-INICIALIZACIÓN DE MÓDULOS/PROGRESOS ---
            bloque_activo = next((p for p in progresos if p.estado != EstadoProgresoEnum.APROBADO), None)
            
            if not bloque_activo:
                # Si no hay progresos activos, buscar el siguiente bloque desbloqueable por orden
                result_configs = await db.execute(
                    select(ConfiguracionProgreso)
                    .where(ConfiguracionProgreso.fase_id == fase.id)
                    .order_by(ConfiguracionProgreso.orden_desbloqueo.asc())
                )
                configs = result_configs.scalars().all()
                
                aprobados_ops = {(p.seccion, p.operacion) for p in progresos if p.estado == EstadoProgresoEnum.APROBADO}
                next_config = next((c for c in configs if (c.seccion, c.operacion) not in aprobados_ops), None)
                
                if next_config:
                    bloque_activo = ProgresoMaestria(
                        alumno_id=alumno_id,
                        fase_id=fase.id,
                        seccion=next_config.seccion,
                        operacion=next_config.operacion,
                        estado=EstadoProgresoEnum.EN_PROGRESO,
                        porcentaje_actual=0,
                        intentos_totales=0,
                        aciertos_acumulados=0
                    )
                    db.add(bloque_activo)
                    await db.commit()
                    progresos.append(bloque_activo)
            
            # Construir resumen de fase
            progreso_fase = ProgresoResumenFase(
                fase_id=fase.id,
                fase_nombre=fase.nombre,
                bloques=[ProgresoMaestriaResponse.model_validate(p) for p in progresos],
                bloques_aprobados=sum(1 for p in progresos if p.estado == EstadoProgresoEnum.APROBADO),
                bloques_totales=len(progresos),
                fase_completada=all(p.estado == EstadoProgresoEnum.APROBADO for p in progresos) if progresos else False
            )
            
            if bloque_activo:
                # Obtener la configuración de este bloque
                result = await db.execute(
                    select(ConfiguracionProgreso)
                    .where(and_(
                        ConfiguracionProgreso.fase_id == fase.id,
                        ConfiguracionProgreso.seccion == bloque_activo.seccion,
                        ConfiguracionProgreso.operacion == bloque_activo.operacion
                    ))
                )
                config = result.scalar_one_or_none()
                if config:
                    configuracion_bloque = ConfiguracionProgresoResponse.model_validate(config)
                    
                    # --- BUCLE ESPEJO (MIRROR LOOP) ---
                    # Buscar si hay una sesión activa de evaluación con pregunta espejo pendiente
                    result_sesion = await db.execute(
                        select(SesionEvaluacion)
                        .where(and_(
                            SesionEvaluacion.alumno_id == alumno_id,
                            SesionEvaluacion.fase_id == fase.id,
                            SesionEvaluacion.seccion == bloque_activo.seccion,
                            SesionEvaluacion.operacion == bloque_activo.operacion,
                            SesionEvaluacion.completada == False
                        ))
                        .limit(1)
                    )
                    sesion = result_sesion.scalar_one_or_none()
                    
                    pregunta_db = None
                    if sesion and sesion.pregunta_espejo_activa and sesion.pregunta_espejo_id:
                        # Recuperar la misma pregunta que falló para darle otra oportunidad
                        result_espejo = await db.execute(
                            select(Pregunta)
                            .options(selectinload(Pregunta.alternativas))
                            .where(Pregunta.id == sesion.pregunta_espejo_id)
                        )
                        pregunta_db = result_espejo.scalar_one_or_none()
                    
                    if not pregunta_db:
                        # Si no hay pregunta espejo activa, obtener una del pool de forma aleatoria
                        result = await db.execute(
                            select(Pregunta)
                            .options(selectinload(Pregunta.alternativas))
                            .where(and_(
                                Pregunta.fase_id == fase.id,
                                Pregunta.seccion == bloque_activo.seccion,
                                Pregunta.operacion == bloque_activo.operacion,
                                Pregunta.estado == StatusEnum.ACTIVO
                            ))
                            .order_by(func.random())
                            .limit(1)
                        )
                        pregunta_db = result.scalar_one_or_none()
                    
                    if pregunta_db:
                        siguiente_pregunta = PreguntaParaAlumno(
                            id=pregunta_db.id,
                            enunciado=pregunta_db.enunciado,
                            tipo_pregunta=pregunta_db.tipo_pregunta.value,
                            operacion=pregunta_db.operacion.value,
                            requiere_subrayado=pregunta_db.requiere_subrayado,
                            tiene_cronometro=config.usa_cronometro,
                            tiempo_limite_segundos=config.tiempo_default_segundos,
                            alternativas=[
                                AlternativaParaAlumno(id=a.id, texto=a.texto, orden=a.orden)
                                for a in pregunta_db.alternativas
                            ]
                        )
    
    return {
        "alumno": alumno,
        "fase_actual": fase_actual,
        "progreso_fase": progreso_fase,
        "siguiente_pregunta": siguiente_pregunta,
        "configuracion_bloque": configuracion_bloque
    }

@router.post("/responder", response_model=ResultadoRespuesta)
async def responder_pregunta(
    respuesta: ResponderPregunta,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        raise HTTPException(status_code=400, detail="El usuario no tiene un perfil de alumno asociado.")

    # 1. Validar la pregunta
    result = await db.execute(
        select(Pregunta).options(selectinload(Pregunta.alternativas)).where(Pregunta.id == respuesta.pregunta_id)
    )
    pregunta = result.scalar_one_or_none()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    # 2. Obtener configuración del bloque
    result = await db.execute(
        select(ConfiguracionProgreso).where(and_(
            ConfiguracionProgreso.fase_id == pregunta.fase_id,
            ConfiguracionProgreso.seccion == pregunta.seccion,
            ConfiguracionProgreso.operacion == pregunta.operacion
        ))
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=500, detail="Configuración no encontrada para este bloque")

    # 3. Evaluar respuesta con soporte robusto de coma decimal para Real (R$) brasileño
    es_correcta = False
    alternativa_elegida = None
    
    if respuesta.alternativa_id:
        alternativa_elegida = next((a for a in pregunta.alternativas if a.id == respuesta.alternativa_id), None)
        if alternativa_elegida:
            es_correcta = alternativa_elegida.es_correcta
    elif respuesta.respuesta_dada is not None:
        if pregunta.respuesta_correcta is not None and respuesta.respuesta_dada.strip():
            clean_given = respuesta.respuesta_dada.strip().replace(",", ".").lower()
            clean_correct = pregunta.respuesta_correcta.strip().replace(",", ".").lower()
            
            # Tolerancia numérica para float (comparar 3.5 con 3.50)
            try:
                es_correcta = float(clean_given) == float(clean_correct)
            except ValueError:
                es_correcta = (clean_given == clean_correct)
        else:
            es_correcta = False
    
    # 4. Obtener/Crear ProgresoMaestria y SesionEvaluacion
    result_progreso = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno_id,
            ProgresoMaestria.fase_id == pregunta.fase_id,
            ProgresoMaestria.seccion == pregunta.seccion,
            ProgresoMaestria.operacion == pregunta.operacion
        ))
    )
    progreso = result_progreso.scalar_one_or_none()
    
    if not progreso:
        progreso = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=pregunta.fase_id,
            seccion=pregunta.seccion,
            operacion=pregunta.operacion,
            estado=EstadoProgresoEnum.EN_PROGRESO
        )
        db.add(progreso)
    
    result_sesion = await db.execute(
        select(SesionEvaluacion)
        .where(and_(
            SesionEvaluacion.alumno_id == alumno_id,
            SesionEvaluacion.fase_id == pregunta.fase_id,
            SesionEvaluacion.seccion == pregunta.seccion,
            SesionEvaluacion.operacion == pregunta.operacion,
            SesionEvaluacion.completada == False
        ))
        .limit(1)
    )
    sesion = result_sesion.scalar_one_or_none()
    if not sesion:
        sesion = SesionEvaluacion(
            alumno_id=alumno_id,
            fase_id=pregunta.fase_id,
            seccion=pregunta.seccion,
            operacion=pregunta.operacion,
            completada=False
        )
        db.add(sesion)

    # Actualizar contadores pedagógicos y de sesión
    progreso.intentos_totales += 1
    sesion.intentos_totales += 1
    
    if es_correcta:
        progreso.aciertos_acumulados += 1
        sesion.intentos_correctos += 1
        sesion.fallas_consecutivas = 0
        sesion.pregunta_espejo_activa = False
        sesion.pregunta_espejo_id = None
    else:
        sesion.intentos_incorrectos += 1
        sesion.fallas_consecutivas += 1
        
        # --- LÓGICA BUCLE ESPEJO Y AVANCE POR FRUSTRACIÓN ---
        if sesion.fallas_consecutivas >= 3:
            # Bypass pedagógico para evitar frustración excesiva (3 fallos seguidos)
            sesion.fallas_consecutivas = 0
            sesion.pregunta_espejo_activa = False
            sesion.pregunta_espejo_id = None
            # Permitimos que avance sin quedar atrapado
        else:
            sesion.pregunta_espejo_activa = True
            sesion.pregunta_espejo_id = pregunta.id
        
    progreso.porcentaje_actual = int((progreso.aciertos_acumulados / config.cantidad_requerida) * 100) if config.cantidad_requerida > 0 else 0
    
    bloque_completado = False
    fase_completada = False
    
    if progreso.porcentaje_actual >= config.porcentaje_aprobacion and progreso.aciertos_acumulados >= config.cantidad_requerida:
        progreso.estado = EstadoProgresoEnum.APROBADO
        progreso.fecha_aprobacion = datetime.utcnow()
        bloque_completado = True
        sesion.completada = True
        sesion.fecha_fin = datetime.utcnow()
        
    # 5. Registrar Intento
    intento = Intento(
        alumno_id=alumno_id,
        pregunta_id=pregunta.id,
        alternativa_id=respuesta.alternativa_id,
        respuesta_dada=respuesta.respuesta_dada,
        es_correcta=es_correcta,
        fase_id=pregunta.fase_id,
        seccion=pregunta.seccion,
        operacion=pregunta.operacion,
        tipo_error=alternativa_elegida.tipo_error if alternativa_elegida else None,
        feedback_mostrado=alternativa_elegida.feedback_error if alternativa_elegida else None,
        explicacion_mostrada=pregunta.explicacion_paso_a_paso if config.tipo_feedback == "detallado" else None,
        tiempo_respuesta_segundos=respuesta.tiempo_respuesta_segundos
    )
    db.add(intento)
    
    await db.commit()

    # 6. Preparar respuesta
    resultado = ResultadoRespuesta(
        es_correcta=es_correcta,
        respuesta_correcta=pregunta.respuesta_correcta,
        tipo_feedback=config.tipo_feedback,
        aciertos_acumulados=progreso.aciertos_acumulados,
        intentos_totales=progreso.intentos_totales,
        porcentaje_actual=progreso.porcentaje_actual,
        bloque_completado=bloque_completado,
        fase_completada=fase_completada
    )
    
    if not es_correcta and config.tipo_feedback == "detallado":
        resultado.explicacion_paso_a_paso = pregunta.explicacion_paso_a_paso
        if alternativa_elegida:
            resultado.tipo_error = alternativa_elegida.tipo_error.value if alternativa_elegida.tipo_error else None
            resultado.feedback_error = alternativa_elegida.feedback_error

    return resultado

@router.post("/graduate-to-fase1")
async def graduate_to_fase1(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        raise HTTPException(status_code=400, detail="El usuario no tiene un perfil de alumno asociado.")

    # 1. Obtener Alumno
    result = await db.execute(select(Alumno).where(Alumno.id == alumno_id))
    alumno = result.scalar_one_or_none()
    
    if not alumno:
        raise HTTPException(status_code=404, detail="Perfil de alumno no encontrado")
        
    # 2. Buscar Fase 1 (orden = 1)
    result = await db.execute(select(Fase).where(Fase.orden == 1))
    fase_uno = result.scalar_one_or_none()
    
    if not fase_uno:
        raise HTTPException(status_code=500, detail="La Fase 1 no ha sido configurada en el sistema.")
        
    # 3. Actualizar Fase
    alumno.fase_actual_id = fase_uno.id
    await db.commit()
    
    return {"message": "¡Felicidades! Has avanzado a la Fase 1", "new_fase_id": fase_uno.id}
