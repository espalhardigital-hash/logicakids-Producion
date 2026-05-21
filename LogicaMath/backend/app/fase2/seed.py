import asyncio
import sys
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.sql_models import (
    Fase,
    Pregunta,
    ConfiguracionProgreso,
    StatusEnum,
    OperacionEnum,
    TipoPreguntaEnum,
)

# ID de la Fase 2 en la base de datos
FASE2_ID = 2

async def seed_configuracion_progreso(session: AsyncSession):
    print("Sembrando ConfiguracionProgreso para Fase 2...")
    
    # Mapeo: modulo_id -> lista de niveles con su configuración
    # Cada nivel tiene: (nivel_id, operacion, cantidad_requerida, usa_cronometro, tiempo_segundos, tipo_feedback)
    # Modulo 1: 3 niveles
    # Modulo 2: 4 niveles
    # Modulo 3: 4 niveles
    # Modulo 4: 5 niveles
    # Modulo 5: 4 niveles
    config_map = {
        1: [
            (1, OperacionEnum.SUMA, 25, False, 0, "espejo"),
            (2, OperacionEnum.SUMA, 25, False, 0, "espejo"),
            (3, OperacionEnum.SUMA, 25, False, 0, "espejo"),
        ],
        2: [
            (1, OperacionEnum.MULTIPLICACION, 15, False, 0, "espejo"),
            (2, OperacionEnum.MULTIPLICACION, 15, False, 0, "espejo"),
            (3, OperacionEnum.MULTIPLICACION, 15, False, 0, "espejo"),
            (4, OperacionEnum.MULTIPLICACION, 15, False, 0, "espejo"),
        ],
        3: [
            (1, OperacionEnum.MIXTA, 15, False, 0, "espejo"),
            (2, OperacionEnum.MIXTA, 15, False, 0, "espejo"),
            (3, OperacionEnum.MIXTA, 15, False, 0, "espejo"),
            (4, OperacionEnum.MIXTA, 15, False, 0, "espejo"),
        ],
        4: [
            (1, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
            (2, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
            (3, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
            (4, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
            (5, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
        ],
        5: [
            (1, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
            (2, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
            (3, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
            (4, OperacionEnum.MIXTA, 10, False, 0, "detallado"),
        ]
    }

    for modulo_id, niveles in config_map.items():
        for nivel_id, op, cant, crono, tiempo, fb in niveles:
            # Formula de sección: modulo_id * 100 + nivel_id
            seccion = modulo_id * 100 + nivel_id
            
            result = await session.execute(
                select(ConfiguracionProgreso).where(and_(
                    ConfiguracionProgreso.fase_id == FASE2_ID,
                    ConfiguracionProgreso.seccion == seccion,
                    ConfiguracionProgreso.operacion == op
                ))
            )
            existing = result.scalar_one_or_none()
            if not existing:
                config = ConfiguracionProgreso(
                    fase_id=FASE2_ID,
                    seccion=seccion,
                    operacion=op,
                    cantidad_requerida=cant,
                    porcentaje_aprobacion=80,
                    usa_cronometro=crono,
                    tiempo_default_segundos=tiempo,
                    tipo_feedback=fb
                )
                session.add(config)
                print(f"  Creada config para Módulo {modulo_id} Nivel {nivel_id} (Sección {seccion})")
            else:
                print(f"  Config para Módulo {modulo_id} Nivel {nivel_id} (Sección {seccion}) ya existe. Saltando.")


# Banco de preguntas fijas para Módulo 4 (Detective de Historias)
PREGUNTAS_MODULO_4 = [
    # ── NIVEL 1: FILTRO DE DATOS SIMPLES ──
    {
        "nivel": 1,
        "enunciado": "Sofía compró 12 manzanas rojas y tiene 3 hermanos. Luego compró 5 manzanas verdes más. ¿Cuántas manzanas tiene en total?",
        "respuesta_correcta": "17",
        "payload_tokenizado": [
            {"id": 1, "texto": "Sofía compró", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "12 manzanas rojas", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 3, "texto": "y tiene 3 hermanos.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "Luego compró", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 5, "texto": "5 manzanas verdes", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 6, "texto": "más. ¿Cuántas tiene?", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    {
        "nivel": 1,
        "enunciado": "Pedro tiene 20 canicas azules. Su gato duerme 12 horas. Pedro perdió 4 canicas. ¿Cuántas canicas le quedan?",
        "respuesta_correcta": "16",
        "payload_tokenizado": [
            {"id": 1, "texto": "Pedro tiene", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "20 canicas azules.", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 3, "texto": "Su gato duerme 12 horas.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "Pedro perdió", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 5, "texto": "4 canicas.", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 6, "texto": "¿Cuántas le quedan?", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    # ── NIVEL 2: TRADUCTORES DE PALABRAS / DISTRACTORES ──
    {
        "nivel": 2,
        "enunciado": "Lucas tiene 8 chocolates. Compra 2 cajas con 6 chocolates cada una. Además, compró 3 helados. ¿Cuántos chocolates compró en total en las cajas?",
        "respuesta_correcta": "12",
        "payload_tokenizado": [
            {"id": 1, "texto": "Lucas tiene 8 chocolates.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "Compra", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 3, "texto": "2 cajas", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 4, "texto": "con", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 5, "texto": "6 chocolates cada una.", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 6, "texto": "Además compró 3 helados. ¿Cuántos chocolates hay?", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    {
        "nivel": 2,
        "enunciado": "En la granja hay 40 ovejas y 5 tractores. Si vendemos la mitad de las ovejas, ¿cuántas ovejas quedan?",
        "respuesta_correcta": "20",
        "payload_tokenizado": [
            {"id": 1, "texto": "En la granja hay", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "40 ovejas", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 3, "texto": "y 5 tractores.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "Si vendemos", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 5, "texto": "la mitad,", "es_dato_relevante": True, "categoria": "operacion"},
            {"id": 6, "texto": "¿cuántas ovejas quedan?", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    # ── NIVEL 3: COMPARACIÓN Y MULTI-ENTIDAD ──
    {
        "nivel": 3,
        "enunciado": "Mariana tiene 15 pegatinas. Juan tiene el triple de pegatinas que Mariana. Su perro tiene 2 pelotas. ¿Cuántas pegatinas tiene Juan?",
        "respuesta_correcta": "45",
        "payload_tokenizado": [
            {"id": 1, "texto": "Mariana tiene", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "15 pegatinas.", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 3, "texto": "Juan tiene", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "el triple", "es_dato_relevante": True, "categoria": "operacion"},
            {"id": 5, "texto": "de pegatinas que Mariana.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 6, "texto": "Su perro tiene 2 pelotas.", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    {
        "nivel": 3,
        "enunciado": "Una caja contiene 30 lápices. La caja verde tiene el doble que la caja roja. La caja roja tiene 15 lápices. ¿Cuántos lápices hay entre las dos?",
        "respuesta_correcta": "45",
        "payload_tokenizado": [
            {"id": 1, "texto": "La caja verde tiene", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "el doble", "es_dato_relevante": True, "categoria": "operacion"},
            {"id": 3, "texto": "que la caja roja.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "La caja roja tiene", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 5, "texto": "15 lápices.", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 6, "texto": "¿Cuántos lápices tienen juntas?", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    # ── NIVEL 4: SERIES Y PATRONES ──
    {
        "nivel": 4,
        "enunciado": "Un tren avanza sumando 4 metros por segundo. Empezó en 8, luego 12, luego 16. ¿Cuáles son las distancias correctas del tren?",
        "respuesta_correcta": "4",
        "payload_tokenizado": [
            {"id": 1, "texto": "Un tren avanza", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "sumando 4", "es_dato_relevante": True, "categoria": "operacion"},
            {"id": 3, "texto": "metros por segundo.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "Empezó en", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 5, "texto": "8,", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 6, "texto": "luego 12, luego 16.", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    {
        "nivel": 4,
        "enunciado": "La serie va hacia atrás restando 5: 35, 30, 25, 20. Identifica el punto de partida y el salto de la serie.",
        "respuesta_correcta": "5",
        "payload_tokenizado": [
            {"id": 1, "texto": "La serie va hacia atrás", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "restando 5:", "es_dato_relevante": True, "categoria": "operacion"},
            {"id": 3, "texto": "empezando en", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "35,", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 5, "texto": "luego 30, 25, 20.", "es_dato_relevante": False, "categoria": "irrelevante"}
        ]
    },
    # ── NIVEL 5: INTEGRADOR COMPLETO ──
    {
        "nivel": 5,
        "enunciado": "En la caja hay 18 bombones. Marcos se comió la mitad. Su tía trajo 4 helados de postre. Luego Marcos compró 6 bombones más. ¿Cuántos bombones hay al final?",
        "respuesta_correcta": "15",
        "payload_tokenizado": [
            {"id": 1, "texto": "En la caja hay", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "18 bombones.", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 3, "texto": "Marcos se comió", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "la mitad.", "es_dato_relevante": True, "categoria": "operacion"},
            {"id": 5, "texto": "Su tía trajo 4 helados.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 6, "texto": "Luego compró", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 7, "texto": "6 bombones más.", "es_dato_relevante": True, "categoria": "cantidad"}
        ]
    },
    {
        "nivel": 5,
        "enunciado": "Un granjero tiene 12 pollos y 3 perros. Compra el doble de pollos. Luego vende 5 pollos. ¿Cuántos pollos le quedan?",
        "respuesta_correcta": "19",
        "payload_tokenizado": [
            {"id": 1, "texto": "Un granjero tiene", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 2, "texto": "12 pollos", "es_dato_relevante": True, "categoria": "cantidad"},
            {"id": 3, "texto": "y 3 perros.", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 4, "texto": "Compra", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 5, "texto": "el doble.", "es_dato_relevante": True, "categoria": "operacion"},
            {"id": 6, "texto": "Luego vende", "es_dato_relevante": False, "categoria": "irrelevante"},
            {"id": 7, "texto": "5 pollos.", "es_dato_relevante": True, "categoria": "cantidad"}
        ]
    }
]

# Banco de preguntas fijas para Módulo 5 (Constructor de Soluciones)
PREGUNTAS_MODULO_5 = [
    # ── NIVEL 1: DOS PASOS (SUMA -> RESTA) ──
    {
        "nivel": 1,
        "enunciado": "En un autobús viajan 18 personas. En la primera parada suben 6 personas. En la siguiente parada bajan 4 personas. ¿Cuántas personas viajan al final?",
        "respuesta_correcta": "20",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántas personas hay en el autobús después de subir las 6 personas?", "respuesta_correcta": "24"},
                {"titulo": "Paso 2", "descripcion": "¿Cuántas personas viajan en el autobús al final?", "respuesta_correcta": "20"}
            ]
        }
    },
    {
        "nivel": 1,
        "enunciado": "Sofía empezó el día con 30 tazos. Ganó 10 tazos jugando con Lucas. Luego le regaló 5 tazos a su primo. ¿Con cuántos tazos terminó?",
        "respuesta_correcta": "35",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántos tazos tenía Sofía después de ganar 10?", "respuesta_correcta": "40"},
                {"titulo": "Paso 2", "descripcion": "¿Con cuántos tazos terminó después de regalar 5?", "respuesta_correcta": "35"}
            ]
        }
    },
    # ── NIVEL 2: DEPENDENCIA (MULTIPLICACIÓN -> DIVISIÓN / SUMA) ──
    {
        "nivel": 2,
        "enunciado": "Lucas compra 5 paquetes de galletas. Cada paquete tiene 6 galletas. Si quiere repartir todas las galletas por igual entre sus 3 amigos, ¿cuántas galletas recibe cada amigo?",
        "respuesta_correcta": "10",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántas galletas compró Lucas en total?", "respuesta_correcta": "30"},
                {"titulo": "Paso 2", "descripcion": "¿Cuántas galletas recibe cada uno de sus 3 amigos?", "respuesta_correcta": "10"}
            ]
        }
    },
    {
        "nivel": 2,
        "enunciado": "Mariana tiene 3 cajas de bombones. Cada caja tiene 8 bombones. Si decide regalarle 4 bombones a cada uno de sus hermanos, ¿para cuántos hermanos le alcanzan los bombones?",
        "respuesta_correcta": "6",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántos bombones tiene Mariana en total?", "respuesta_correcta": "24"},
                {"titulo": "Paso 2", "descripcion": "¿Para cuántos hermanos le alcanzan los bombones?", "respuesta_correcta": "6"}
            ]
        }
    },
    # ── NIVEL 3: PLANIFICACIÓN Y CADENAS MIXTAS AVANZADAS ──
    {
        "nivel": 3,
        "enunciado": "Una escuela compró 8 paquetes de cuadernos de 10 unidades cada uno. Si se dañaron 15 cuadernos en el almacén y el resto se guarda en 5 cajones iguales, ¿cuántos cuadernos hay por cajón?",
        "respuesta_correcta": "13",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántos cuadernos se compraron en total en los paquetes?", "respuesta_correcta": "80"},
                {"titulo": "Paso 2", "descripcion": "¿Cuántos cuadernos quedan sanos después de restarle los 15 dañados?", "respuesta_correcta": "65"}
            ]
        }
    },
    {
        "nivel": 3,
        "enunciado": "Pedro gana R$ 8 por hora. Si trabaja 5 horas al día y gasta R$ 10 en almuerzo, ¿cuánto dinero le queda al final de un día de trabajo?",
        "respuesta_correcta": "30",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuánto dinero gana Pedro en total por las 5 horas de trabajo?", "respuesta_correcta": "40"},
                {"titulo": "Paso 2", "descripcion": "¿Cuánto dinero le queda después de gastar R$ 10?", "respuesta_correcta": "30"}
            ]
        }
    },
    # ── NIVEL 4: GRAN INTEGRACIÓN (EL MAESTRO CONSTRUCTOR) ──
    {
        "nivel": 4,
        "enunciado": "Sofía compró 4 libros de R$ 12 cada uno. Si pagó con un billete de R$ 50, ¿cuánto dinero le sobró de vuelto?",
        "respuesta_correcta": "2",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuánto costaron los 4 libros en total?", "respuesta_correcta": "48"},
                {"titulo": "Paso 2", "descripcion": "¿Cuánto dinero le sobró de vuelto al pagar con R$ 50?", "respuesta_correcta": "2"}
            ]
        }
    },
    {
        "nivel": 4,
        "enunciado": "En un depósito hay 60 botellas de agua. Se retiran 20 botellas. Las botellas restantes se meten en cajas de 8 botellas cada una. ¿Cuántas cajas se completan?",
        "respuesta_correcta": "5",
        "datos_numericos": {
            "pasos": [
                {"titulo": "Paso 1", "descripcion": "¿Cuántas botellas quedan en el depósito después de retirar 20?", "respuesta_correcta": "40"},
                {"titulo": "Paso 2", "descripcion": "¿Cuántas cajas de 8 botellas se pueden llenar con las restantes?", "respuesta_correcta": "5"}
            ]
        }
    }
]

async def seed_preguntas_pool(session: AsyncSession):
    print("Sembrando banco de preguntas para Módulo 4 y Módulo 5...")
    
    # Registrar pregunta comodín de Fase 2 (para Módulos dinámicos 1-3)
    result = await session.execute(
        select(Pregunta).where(Pregunta.id == 999999)
    )
    existing = result.scalar_one_or_none()
    if not existing:
        pregunta_comodin = Pregunta(
            id=999999,
            fase_id=FASE2_ID,
            seccion=200,  # Sección genérica para comodines
            operacion=OperacionEnum.MIXTA,
            tipo_pregunta=TipoPreguntaEnum.RESPUESTA_NUMERICA,
            enunciado="Pregunta dinámica generada en Fase 2",
            respuesta_correcta="0",
            estado=StatusEnum.ACTIVO
        )
        session.add(pregunta_comodin)
        print("  Añadida pregunta comodín dinámica de Fase 2 (ID: 999999)")

    # 1. Sembrar preguntas del Módulo 4
    for q_data in PREGUNTAS_MODULO_4:
        seccion = 4 * 100 + q_data["nivel"]
        
        result = await session.execute(
            select(Pregunta).where(and_(
                Pregunta.fase_id == FASE2_ID,
                Pregunta.seccion == seccion,
                Pregunta.enunciado == q_data["enunciado"]
            ))
        )
        existing = result.scalar_one_or_none()
        if not existing:
            pregunta = Pregunta(
                fase_id=FASE2_ID,
                seccion=seccion,
                operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.SUBRAYADO_TOKENS,
                enunciado=q_data["enunciado"],
                respuesta_correcta=q_data["respuesta_correcta"],
                payload_tokenizado=q_data["payload_tokenizado"],
                estado=StatusEnum.ACTIVO
            )
            session.add(pregunta)
            print(f"  Añadida pregunta Módulo 4 Nivel {q_data['nivel']}")
        else:
            print(f"  Pregunta Módulo 4 Nivel {q_data['nivel']} ya existe. Saltando.")
            
    # 2. Sembrar preguntas del Módulo 5
    for q_data in PREGUNTAS_MODULO_5:
        seccion = 5 * 100 + q_data["nivel"]
        
        result = await session.execute(
            select(Pregunta).where(and_(
                Pregunta.fase_id == FASE2_ID,
                Pregunta.seccion == seccion,
                Pregunta.enunciado == q_data["enunciado"]
            ))
        )
        existing = result.scalar_one_or_none()
        if not existing:
            pregunta = Pregunta(
                fase_id=FASE2_ID,
                seccion=seccion,
                operacion=OperacionEnum.MIXTA,
                tipo_pregunta=TipoPreguntaEnum.CONSTRUCTOR_CHAINED,
                enunciado=q_data["enunciado"],
                respuesta_correcta=q_data["respuesta_correcta"],
                datos_numericos=q_data["datos_numericos"],
                estado=StatusEnum.ACTIVO
            )
            session.add(pregunta)
            print(f"  Añadida pregunta Módulo 5 Nivel {q_data['nivel']}")
        else:
            print(f"  Pregunta Módulo 5 Nivel {q_data['nivel']} ya existe. Saltando.")

async def run_fase2_seed():
    print("=" * 60)
    print("Iniciando inyección de datos semilla de Fase 2...")
    print("=" * 60)
    
    async with AsyncSessionLocal() as session:
        # Verificar que la Fase 2 exista
        result = await session.execute(select(Fase).where(Fase.id == FASE2_ID))
        fase2 = result.scalar_one_or_none()
        if not fase2:
            print("  Fase 2 no existe en la tabla fases. Creándola...")
            fase2 = Fase(
                id=FASE2_ID,
                nombre="Desarrollo Numérico y Razonamiento",
                descripcion="Cálculo mental, comprensión del sistema monetario y lectura de problemas.",
                orden=2
            )
            session.add(fase2)
            await session.flush()
            
        await seed_configuracion_progreso(session)
        await seed_preguntas_pool(session)
        await session.commit()
        
    print("=" * 60)
    print("¡Datos semilla de Fase 2 completados con éxito!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_fase2_seed())
