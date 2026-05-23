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
    ProgresoMaestria, Intento, PoolAsignadoAlumno, StatusEnum, EstadoProgresoEnum
)
from ..auth import get_current_user

router = APIRouter(prefix="/pedagogia", tags=["pedagogia"])

@router.get("/dashboard", response_model=DashboardAlumno)
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        raise HTTPException(status_code=400, detail="El usuario no tiene un perfil de alumno asociado.")

    # 1. Obtener Alumno
    alumno = current_user.get("alumno_obj")
    if not alumno:
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
            progresos = result.scalars().all()
            
            # Construir resumen de fase
            progreso_fase = ProgresoResumenFase(
                fase_id=fase.id,
                fase_nombre=fase.nombre,
                bloques=[ProgresoMaestriaResponse.model_validate(p) for p in progresos],
                bloques_aprobados=sum(1 for p in progresos if p.estado == EstadoProgresoEnum.APROBADO),
                bloques_totales=0, # Pendiente calcular total
                fase_completada=False # Simplificado
            )
            
            # Buscar el bloque activo (el primero que no esté aprobado, o el último si todos lo están)
            bloque_activo = next((p for p in progresos if p.estado != EstadoProgresoEnum.APROBADO), None)
            
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
                    
                    # 1. Obtener los IDs de preguntas que el alumno ya respondió correctamente en este bloque
                    result_solved = await db.execute(
                        select(Intento.pregunta_id)
                        .where(and_(
                            Intento.alumno_id == alumno_id,
                            Intento.fase_id == fase.id,
                            Intento.seccion == bloque_activo.seccion,
                            Intento.operacion == bloque_activo.operacion,
                            Intento.es_correcta == True
                        ))
                    )
                    solved_ids = result_solved.scalars().all()

                    # 2. Intentar buscar una pregunta no resuelta
                    query = (
                        select(Pregunta)
                        .options(selectinload(Pregunta.alternativas))
                        .where(and_(
                            Pregunta.fase_id == fase.id,
                            Pregunta.seccion == bloque_activo.seccion,
                            Pregunta.operacion == bloque_activo.operacion,
                            Pregunta.estado == StatusEnum.ACTIVO
                        ))
                    )
                    if solved_ids:
                        query = query.where(~Pregunta.id.in_(solved_ids))

                    result = await db.execute(
                        query.order_by(func.random()).limit(1)
                    )
                    pregunta_db = result.scalar_one_or_none()

                    # 3. Si no hay preguntas no resueltas (o resolvió todas), no devolver una pregunta repetida
                    # Dejamos pregunta_db como None. El frontend puede hacer fallback o mostrar un mensaje.

                    if pregunta_db:
                        # Mapear a schema de alumno (sin revelar respuesta)
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

    # 3. Evaluar respuesta
    es_correcta = False
    alternativa_elegida = None
    
    if respuesta.alternativa_id:
        alternativa_elegida = next((a for a in pregunta.alternativas if a.id == respuesta.alternativa_id), None)
        if alternativa_elegida:
            es_correcta = alternativa_elegida.es_correcta
    elif respuesta.respuesta_dada is not None:
        if pregunta.respuesta_correcta is not None and respuesta.respuesta_dada.strip():
            es_correcta = (respuesta.respuesta_dada.strip().lower() == pregunta.respuesta_correcta.strip().lower())
        else:
            es_correcta = False
    
    # 4. Obtener/Crear ProgresoMaestria
    result = await db.execute(
        select(ProgresoMaestria).where(and_(
            ProgresoMaestria.alumno_id == alumno_id,
            ProgresoMaestria.fase_id == pregunta.fase_id,
            ProgresoMaestria.seccion == pregunta.seccion,
            ProgresoMaestria.operacion == pregunta.operacion
        ))
    )
    progreso = result.scalar_one_or_none()
    
    if not progreso:
        progreso = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=pregunta.fase_id,
            seccion=pregunta.seccion,
            operacion=pregunta.operacion,
            estado=EstadoProgresoEnum.EN_PROGRESO,
            aciertos_acumulados=0,
            intentos_totales=0
        )
        db.add(progreso)
    
    # Actualizar contadores
    progreso.intentos_totales += 1
    
    ya_resuelta = False
    if es_correcta:
        result_previo = await db.execute(
            select(Intento.id).where(and_(
                Intento.alumno_id == alumno_id,
                Intento.pregunta_id == pregunta.id,
                Intento.es_correcta == True
            ))
        )
        if result_previo.scalar_one_or_none():
            ya_resuelta = True

    if es_correcta and not ya_resuelta:
        progreso.aciertos_acumulados += 1
        
    progreso.porcentaje_actual = int((progreso.aciertos_acumulados / config.cantidad_requerida) * 100) if config.cantidad_requerida > 0 else 0
    
    bloque_completado = False
    fase_completada = False
    
    if progreso.porcentaje_actual >= config.porcentaje_aprobacion and progreso.aciertos_acumulados >= config.cantidad_requerida:
        if progreso.estado != EstadoProgresoEnum.APROBADO:
            progreso.estado = EstadoProgresoEnum.APROBADO
            progreso.fecha_aprobacion = datetime.utcnow()
        bloque_completado = True
        
        # Lógica de fase completada
        result_configs = await db.execute(select(ConfiguracionProgreso).where(and_(ConfiguracionProgreso.fase_id == pregunta.fase_id, ConfiguracionProgreso.seccion > 0, ConfiguracionProgreso.activo == True)))
        configs_fase = result_configs.scalars().all()
        if configs_fase:
            result_progresos = await db.execute(select(ProgresoMaestria).where(and_(ProgresoMaestria.alumno_id == alumno_id, ProgresoMaestria.fase_id == pregunta.fase_id, ProgresoMaestria.estado == EstadoProgresoEnum.APROBADO)))
            progresos_aprobados = result_progresos.scalars().all()
            
            aprobados_set = {(p.seccion, p.operacion) for p in progresos_aprobados}
            aprobados_set.add((progreso.seccion, progreso.operacion))
            
            fase_completada = all((c.seccion, c.operacion) in aprobados_set for c in configs_fase)
        
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
    alumno = current_user.get("alumno_obj")
    if not alumno:
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
