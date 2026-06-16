"""
Router FastAPI — Sistema de Simulacros Fase 9 (Pedro II)
=========================================================
Prefijo: /fases/9/simulados  (el middleware StripAPIPrefixMiddleware elimina /api antes de enrutar)
Tags:    simulados

Responsabilidades:
  - GET  /progresso          — Estado de los 20 simulacros del alumno
  - POST /iniciar            — Inicia un simulacro (por numero 1-20), retorna 10 preguntas
  - POST /{id}/save_progress — Guarda respuestas parciales y tiempo restante
  - POST /{id}/entregar      — Califica y retorna resultado + gabarito + resolução

Reglas:
  - 20 simulacros: Módulo 1 (1-5, 20min), Módulo 2 (6-15, 18min), Módulo 3 (16-20, 15min)
  - 10 preguntas por simulacro
  - Aprobación: >= 60% (6/10)
  - Desbloqueo secuencial: el siguiente simulacro se desbloquea al aprobar el anterior
  - El gabarito (alternativa_correta) NUNCA se envía al frontend antes de entregar
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.db.session import get_db
from app.auth import get_current_user
from app.models.sql_models import Alumno, ProgresoMaestria, EstadoProgresoEnum
from app.models.simulado import SimuladoSession
from app.models.simulado_questao import SimuladoQuestao

router = APIRouter(prefix="/fases/9/simulados", tags=["simulados"])

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN DE LOS 20 SIMULACROS
# ─────────────────────────────────────────────────────────────────────────────

FASE_ID = 9
PREGUNTAS_POR_SIMULACRO = 10
PORCENTAJE_APROBACION = 60  # 6/10

SIMULACROS_META = {
    1:  {"nome": "Números e Operações",          "modulo": 1, "dificuldade": "facil",  "tempo_minutos": 20},
    2:  {"nome": "Dinheiro e Medidas",            "modulo": 1, "dificuldade": "facil",  "tempo_minutos": 20},
    3:  {"nome": "Geometria e Áreas",             "modulo": 1, "dificuldade": "facil",  "tempo_minutos": 20},
    4:  {"nome": "Lógica e Padrões",              "modulo": 1, "dificuldade": "facil",  "tempo_minutos": 20},
    5:  {"nome": "Probabilidade e Tabelas",       "modulo": 1, "dificuldade": "facil",  "tempo_minutos": 20},
    6:  {"nome": "Frações e Proporções",          "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    7:  {"nome": "Equações e Incógnitas",         "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    8:  {"nome": "Geometria Espacial",            "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    9:  {"nome": "Gráficos e Estatística",        "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    10: {"nome": "Tempo e Rotas",                 "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    11: {"nome": "Divisibilidade e MDC",          "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    12: {"nome": "Sequências e Padrões",          "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    13: {"nome": "Área e Perímetro Avançado",     "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    14: {"nome": "Proporções e Misturas",         "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    15: {"nome": "Expressões Numéricas",          "modulo": 2, "dificuldade": "medio",  "tempo_minutos": 18},
    16: {"nome": "Combinatória e Contagem",       "modulo": 3, "dificuldade": "dificil", "tempo_minutos": 15},
    17: {"nome": "Sólidos Geométricos",           "modulo": 3, "dificuldade": "dificil", "tempo_minutos": 15},
    18: {"nome": "Probabilidade Avançada",        "modulo": 3, "dificuldade": "dificil", "tempo_minutos": 15},
    19: {"nome": "Planificação e Transformações", "modulo": 3, "dificuldade": "dificil", "tempo_minutos": 15},
    20: {"nome": "Simulado Completo Pedro II",    "modulo": 3, "dificuldade": "dificil", "tempo_minutos": 15},
}

MODULOS_META = {
    1: {"nome": "Simulacros Iniciais",      "descricao": "Aquece os motores com 5 simulacros de nível fácil.",          "cor": "#10B981"},
    2: {"nome": "Simulacros Intermediários","descricao": "10 simulacros com formato idêntico ao exame do Pedro II.",     "cor": "#6366F1"},
    3: {"nome": "Simulacros Avançados",     "descricao": "5 simulacros de alta complexidade: o desafio final.",         "cor": "#F59E0B"},
}


def _get_alumno_id(current_user: dict) -> int:
    """Extrae el alumno_id del usuario autenticado (current_user es dict)."""
    alumno_id = current_user.get("alumno_id")
    if not alumno_id:
        raise HTTPException(status_code=400, detail="El usuario no tiene un perfil de alumno.")
    return alumno_id


def _is_simulacro_desbloqueado(
    numero: int,
    progresos: Dict[int, ProgresoMaestria],
    user_role: str
) -> bool:
    """El simulacro 1 siempre está disponible. Los demás requieren que el anterior esté aprobado."""
    if user_role in ("ADMIN", "admin", "SUPER_ADMIN"):
        return True
    if numero == 1:
        return True
    prev_progreso = progresos.get(numero - 1)
    return prev_progreso is not None and prev_progreso.estado == EstadoProgresoEnum.APROBADO


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas (inline para mantener todo en un archivo)
# ─────────────────────────────────────────────────────────────────────────────

class IniciarSimuladoRequest(BaseModel):
    simulacro_numero: int   # 1–20

class SaveProgressRequest(BaseModel):
    respuestas: Dict[str, str]         # pregunta_id (str) -> letra_elegida ("A"/"B"/"C"/"D")
    marcadores_revision: List[str]
    tiempo_restante_segundos: int

class EntregarRequest(BaseModel):
    respuestas: Dict[str, str]         # pregunta_id (str) -> letra_elegida
    tiempo_restante_segundos: int


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 1 — GET /progresso
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/progresso")
async def get_progresso(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna el estado de los 20 simulacros para el alumno autenticado.
    Incluye: estado (bloqueado/disponivel/concluido), mejor porcentaje, si está aprobado.
    """
    alumno_id = _get_alumno_id(current_user)

    # Cargar todos los progresos del alumno en Fase 9 (seccion = simulacro_numero)
    result = await db.execute(
        select(ProgresoMaestria).where(
            and_(
                ProgresoMaestria.alumno_id == alumno_id,
                ProgresoMaestria.fase_id == FASE_ID,
            )
        )
    )
    progresos_list = result.scalars().all()
    progresos = {p.seccion: p for p in progresos_list}  # seccion == simulacro_numero

    user_role = current_user.get("role", "")

    simulacros_out = []
    for numero in range(1, 21):
        meta = SIMULACROS_META[numero]
        progreso = progresos.get(numero)
        desbloqueado = _is_simulacro_desbloqueado(numero, progresos, user_role)

        if progreso is None:
            estado = "disponivel" if desbloqueado else "bloqueado"
            melhor_porcentagem = 0.0
            aprovado = False
        else:
            aprovado = progreso.estado == EstadoProgresoEnum.APROBADO
            melhor_porcentagem = float(progreso.porcentaje_actual)
            estado = "concluido" if aprovado else ("disponivel" if desbloqueado else "bloqueado")

        simulacros_out.append({
            "numero": numero,
            "nome": f"Simulacro {numero} — {meta['nome']}",
            "modulo": meta["modulo"],
            "dificuldade": meta["dificuldade"],
            "tempo_minutos": meta["tempo_minutos"],
            "estado": estado,
            "melhor_porcentagem": melhor_porcentagem,
            "aprovado": aprovado,
        })

    # Calcular progreso por módulo
    modulos_out = []
    for mod_id, mod_meta in MODULOS_META.items():
        nums_en_modulo = [n for n, m in SIMULACROS_META.items() if m["modulo"] == mod_id]
        aprobados_en_modulo = sum(
            1 for n in nums_en_modulo
            if progresos.get(n) and progresos[n].estado == EstadoProgresoEnum.APROBADO
        )
        modulos_out.append({
            "modulo_id": mod_id,
            "nome": mod_meta["nome"],
            "descricao": mod_meta["descricao"],
            "cor": mod_meta["cor"],
            "total_simulacros": len(nums_en_modulo),
            "aprobados": aprobados_en_modulo,
            "porcentaje_modulo": round((aprobados_en_modulo / len(nums_en_modulo)) * 100) if nums_en_modulo else 0,
        })

    return {
        "simulacros": simulacros_out,
        "modulos": modulos_out,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 2 — POST /iniciar
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/iniciar")
async def iniciar_simulado(
    request: IniciarSimuladoRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    alumno_id = _get_alumno_id(current_user)
    num = request.simulacro_numero

    if num < 1 or num > 20:
        raise HTTPException(status_code=400, detail="simulacro_numero debe estar entre 1 y 20.")

    # Verificar desbloqueo
    result = await db.execute(
        select(ProgresoMaestria).where(
            and_(
                ProgresoMaestria.alumno_id == alumno_id,
                ProgresoMaestria.fase_id == FASE_ID,
            )
        )
    )
    progresos = {p.seccion: p for p in result.scalars().all()}
    user_role = current_user.get("role", "")

    if not _is_simulacro_desbloqueado(num, progresos, user_role):
        raise HTTPException(
            status_code=403,
            detail=f"El Simulacro {num} está bloqueado. Debes aprobar el Simulacro {num - 1} primero."
        )

    # Buscar las 10 preguntas de este simulacro en simulado_questao
    result_qs = await db.execute(
        select(SimuladoQuestao)
        .where(SimuladoQuestao.simulacro_numero == num)
        .order_by(SimuladoQuestao.ordem_na_prova)
    )
    questoes = result_qs.scalars().all()

    if not questoes:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontraron preguntas para el Simulacro {num}. Ejecuta el seed primero."
        )

    # Limitar a 10 si hubiera más
    questoes = questoes[:PREGUNTAS_POR_SIMULACRO]

    # Construir payload SIN gabarito
    payload_preguntas = []
    pregunta_ids = []
    for q in questoes:
        pregunta_ids.append(q.id)
        payload_preguntas.append({
            "id": str(q.id),
            "enunciado": q.enunciado,
            "dados_numericos": None,
            "requiere_subrayado": False,
            "alternativas": [
                {"id": "A", "texto": q.alternativa_a},
                {"id": "B", "texto": q.alternativa_b},
                {"id": "C", "texto": q.alternativa_c},
                {"id": "D", "texto": q.alternativa_d},
            ]
        })

    # Calcular tiempo según módulo
    meta = SIMULACROS_META[num]
    tiempo_segundos = meta["tempo_minutos"] * 60

    # Mapa modulo/nivel compatible con GameScreen (que usa URL :moduloId/:nivelId)
    modulo_id = meta["modulo"]
    nivel_id = num - {1: 0, 2: 5, 3: 15}[modulo_id]  # nivel dentro del módulo

    # Crear sesión
    nueva_sesion = SimuladoSession(
        alumno_id=alumno_id,
        fase_id=FASE_ID,
        modulo_id=modulo_id,
        nivel_id=nivel_id,
        simulacro_numero=num,
        estado="EN_CURSO",
        respuestas_json={},
        marcadores_revision=[],
        tiempo_restante_segundos=tiempo_segundos,
        pregunta_ids_json=pregunta_ids,
    )
    db.add(nueva_sesion)
    await db.commit()
    await db.refresh(nueva_sesion)

    return {
        "session_id": nueva_sesion.id,
        "simulacro_numero": num,
        "nome": f"Simulacro {num} — {meta['nome']}",
        "tiempo_total_segundos": tiempo_segundos,
        "preguntas": payload_preguntas,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 3 — POST /{session_id}/save_progress
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{session_id}/save_progress")
async def save_progress(
    session_id: str,
    request: SaveProgressRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Guarda el progreso parcial del simulacro (respuestas, marcadores, tiempo restante)."""
    result = await db.execute(
        select(SimuladoSession).where(SimuladoSession.id == session_id)
    )
    simulado = result.scalars().first()

    if not simulado or simulado.estado != "EN_CURSO":
        raise HTTPException(status_code=400, detail="Sesión no válida o ya finalizada.")

    simulado.respuestas_json = request.respuestas
    simulado.marcadores_revision = request.marcadores_revision
    simulado.tiempo_restante_segundos = request.tiempo_restante_segundos

    await db.commit()
    return {"status": "ok"}


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 4 — POST /{session_id}/entregar
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{session_id}/entregar")
async def entregar_simulado(
    session_id: str,
    request: EntregarRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Califica el simulacro. Retorna:
    - Puntaje (correctas/total)
    - Porcentaje y si está aprobado
    - Detalles de cada pregunta: respuesta del alumno, respuesta correcta, resolução
    Actualiza ProgresoMaestria del alumno.
    """
    result = await db.execute(
        select(SimuladoSession).where(SimuladoSession.id == session_id)
    )
    simulado = result.scalars().first()

    if not simulado or simulado.estado != "EN_CURSO":
        raise HTTPException(status_code=400, detail="Sesión no válida o ya finalizada.")

    # Finalizar la sesión
    simulado.respuestas_json = request.respuestas
    simulado.tiempo_restante_segundos = request.tiempo_restante_segundos
    simulado.estado = "FINALIZADO"
    simulado.fecha_fin = datetime.utcnow()
    await db.flush()

    # Obtener las preguntas de esta sesión (usando el snapshot pregunta_ids_json)
    pregunta_ids = simulado.pregunta_ids_json or []
    num = simulado.simulacro_numero

    if not pregunta_ids and num:
        # Fallback: cargar por simulacro_numero
        res_qs = await db.execute(
            select(SimuladoQuestao)
            .where(SimuladoQuestao.simulacro_numero == num)
            .order_by(SimuladoQuestao.ordem_na_prova)
            .limit(PREGUNTAS_POR_SIMULACRO)
        )
        questoes = res_qs.scalars().all()
    else:
        res_qs = await db.execute(
            select(SimuladoQuestao)
            .where(SimuladoQuestao.id.in_(pregunta_ids))
            .order_by(SimuladoQuestao.ordem_na_prova)
        )
        questoes = res_qs.scalars().all()

    # Calificar
    respuestas = request.respuestas  # {str(questao_id): "A"/"B"/"C"/"D"}
    correctas = 0
    detalles = []
    errores = []

    for q in questoes:
        qid = str(q.id)
        resposta_alumno = respuestas.get(qid, None)  # None = no respondió
        es_correcta = resposta_alumno == q.alternativa_correta if resposta_alumno else False

        if es_correcta:
            correctas += 1
        else:
            errores.append({"pregunta_id": qid})

        detalles.append({
            "pregunta_id": qid,
            "orden": q.ordem_na_prova,
            "enunciado": q.enunciado,
            "alternativas": {
                "A": q.alternativa_a,
                "B": q.alternativa_b,
                "C": q.alternativa_c,
                "D": q.alternativa_d,
            },
            "resposta_alumno": resposta_alumno,
            "resposta_correta": q.alternativa_correta,
            "es_correcta": es_correcta,
            "tema": q.tema,
            "resolucao": q.resolucao or [],
        })

    total = len(questoes)
    porcentaje = round((correctas / total) * 100, 1) if total > 0 else 0
    aprobado = porcentaje >= PORCENTAJE_APROBACION

    # Actualizar ProgresoMaestria (seccion = simulacro_numero)
    alumno_id = simulado.alumno_id
    seccion = num or (simulado.modulo_id * 100 + simulado.nivel_id)

    prog_result = await db.execute(
        select(ProgresoMaestria).where(
            and_(
                ProgresoMaestria.alumno_id == alumno_id,
                ProgresoMaestria.fase_id == FASE_ID,
                ProgresoMaestria.seccion == seccion,
            )
        )
    )
    progreso = prog_result.scalars().first()
    nuevo_estado = EstadoProgresoEnum.APROBADO if aprobado else EstadoProgresoEnum.EN_PROGRESO

    if progreso:
        progreso.intentos_totales += 1
        if porcentaje > progreso.porcentaje_actual:
            progreso.porcentaje_actual = int(porcentaje)
            progreso.aciertos_acumulados = correctas
        if aprobado and progreso.estado != EstadoProgresoEnum.APROBADO:
            progreso.estado = EstadoProgresoEnum.APROBADO
            progreso.fecha_aprobacion = datetime.utcnow()
    else:
        progreso = ProgresoMaestria(
            alumno_id=alumno_id,
            fase_id=FASE_ID,
            seccion=seccion,
            operacion="mixta",
            estado=nuevo_estado,
            aciertos_acumulados=correctas,
            intentos_totales=1,
            porcentaje_actual=int(porcentaje),
            fecha_aprobacion=datetime.utcnow() if aprobado else None,
        )
        db.add(progreso)

    await db.commit()

    # Número del próximo simulacro (si aprobó y no es el último)
    proximo_simulacro = (seccion + 1) if (aprobado and seccion < 20) else None

    return {
        "puntaje": correctas,
        "total": total,
        "porcentaje": porcentaje,
        "aprobado": aprobado,
        "simulacro_numero": seccion,
        "proximo_simulacro": proximo_simulacro,
        "detalles": detalles,
        "errores": errores,
    }
