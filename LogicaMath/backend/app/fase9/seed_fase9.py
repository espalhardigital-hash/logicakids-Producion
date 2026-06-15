import asyncio
import random
from sqlalchemy import select, and_, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal

from app.models.sql_models import (
    Fase, Pregunta, Alternativa, ConfiguracionProgreso,
    StatusEnum, OperacionEnum, TipoPreguntaEnum, TipoErrorEnum,
    Intento, PoolAsignadoAlumno
)
from app.fase2.models import NivelTeoria, IntentoPregunta, IntentoPaso

FASE9_ID = 9

async def clear_fase9_data(session: AsyncSession):
    print("Purging existing Fase 9 data...")
    result = await session.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE9_ID))
    pregunta_ids_list = result.scalars().all()
    
    if pregunta_ids_list:
        await session.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(pregunta_ids_list)))
        res_int_q = await session.execute(select(IntentoPregunta.id).where(IntentoPregunta.pregunta_id.in_(pregunta_ids_list)))
        int_q_ids = res_int_q.scalars().all()
        if int_q_ids:
            await session.execute(delete(IntentoPaso).where(IntentoPaso.intento_pregunta_id.in_(int_q_ids)))
            await session.execute(delete(IntentoPregunta).where(IntentoPregunta.id.in_(int_q_ids)))
            
        await session.execute(delete(Intento).where(Intento.pregunta_id.in_(pregunta_ids_list)))
        await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.pregunta_id.in_(pregunta_ids_list)))
        
    await session.execute(delete(Intento).where(Intento.fase_id == FASE9_ID))
    await session.execute(delete(PoolAsignadoAlumno).where(PoolAsignadoAlumno.fase_id == FASE9_ID))
    await session.execute(delete(Pregunta).where(Pregunta.fase_id == FASE9_ID))
    await session.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE9_ID))
    await session.execute(delete(NivelTeoria).where(NivelTeoria.fase_id == FASE9_ID))
    await session.commit()
    print("Fase 9 data purged.")
async def seed_teoria_niveles_fase9(session: AsyncSession):
    print("Sembrando guión de textos para Fase 9...")
    niveles_teoria = []
    
    # Módulo 1 (5 niveles)
    for l in range(1, 6):
        niveles_teoria.append({
            "modulo_id": 1,
            "nivel_id": l,
            "titulo": f"Simulacro {l}",
            "texto_descubrimiento": "Simulacro de adaptación y nivel básico.",
            "diccionario": {},
            "advertencia": "",
            "ejemplos": [],
            "interactivos": []
        })
        
    # Módulo 2 (10 niveles)
    for l in range(1, 11):
        niveles_teoria.append({
            "modulo_id": 2,
            "nivel_id": l,
            "titulo": f"Simulacro {l+5}",
            "texto_descubrimiento": "Simulacro de exigencia real.",
            "diccionario": {},
            "advertencia": "",
            "ejemplos": [],
            "interactivos": []
        })
        
    # Módulo 3 (5 niveles)
    for l in range(1, 6):
        niveles_teoria.append({
            "modulo_id": 3,
            "nivel_id": l,
            "titulo": f"Simulacro Maestro {l+15}",
            "texto_descubrimiento": "Simulacro de alta exigencia.",
            "diccionario": {},
            "advertencia": "",
            "ejemplos": [],
            "interactivos": []
        })

    for data in niveles_teoria:
        nt = NivelTeoria(fase_id=FASE9_ID, **data)
        session.add(nt)
    await session.commit()


async def inject_pedro_ii_history(session: AsyncSession):
    print("Inyectando Banco Histórico Pedro II y preguntas de simulación...")
    
    sections = []
    # Module 1: 5 levels
    for l in range(1, 6):
        sections.append((1, l))
    # Module 2: 10 levels
    for l in range(1, 11):
        sections.append((2, l))
    # Module 3: 5 levels
    for l in range(1, 6):
        sections.append((3, l))
        
    for mod_id, lvl_id in sections:
        seccion_id = mod_id * 100 + lvl_id
        for i in range(10): # 10 questions per exam!
            rng = random.Random(FASE9_ID * 100000 + seccion_id * 1000 + i)
            tipo_q = rng.choice(["hist", "calc", "log"])
            
            if tipo_q == "hist":
                enunciado = "Após uma aula passeio ao Museu Nacional, um estudante decidiu calcular o volume do sarcófago que viu..."
                ans = "64"
                alts = ["64", "27", "16", "128"]
            elif tipo_q == "calc":
                enunciado = "Joana gasta el 25% de su mesada en pasajes. Si recibe R$ 120 al mes, ¿cuánto gasta en pasajes?"
                ans = "R$ 30"
                alts = ["R$ 30", "R$ 25", "R$ 40", "R$ 15"]
            else:
                enunciado = "Si hoy es martes, ¿qué día será en 100 días?"
                ans = "Jueves"
                alts = ["Jueves", "Viernes", "Lunes", "Miércoles"]
                
            payload = {
                "fase9": True,
                "origen_examen": "Pedro II 2023" if rng.random() > 0.5 else "Simulacro Interno",
            }
            
            p = Pregunta(
                fase_id=FASE9_ID, seccion=seccion_id, operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION, enunciado=f"[Q{i}] {enunciado}",
                respuesta_correcta=ans, 
                datos_numericos=payload,
                errores_previstos={},
                explicacion_paso_a_paso={"titulo": "Resolución", "pasos": [{"orden": 1, "texto": "Explicación automática."}]},
                estado=StatusEnum.ACTIVO
            )
            
            for idx_alt, alt in enumerate(alts):
                is_correct = (alt == ans)
                p.alternativas.append(Alternativa(texto=alt, es_correcta=is_correct, orden=idx_alt+1))
            
            session.add(p)
    await session.commit()

async def run_fase9_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de FASE 9...")
    async with AsyncSessionLocal() as session:
        fase = await session.get(Fase, FASE9_ID)
        if not fase:
            fase = Fase(id=FASE9_ID, nombre="Simulados Colegio Pedro II", descripcion="Fase 9", orden=9, icono="🎓")
            session.add(fase)
            await session.commit()
            
        await clear_fase9_data(session)
        await seed_teoria_niveles_fase9(session)
        await inject_pedro_ii_history(session)
    print("FASE 9 COMPLETADA.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase9_seed())
