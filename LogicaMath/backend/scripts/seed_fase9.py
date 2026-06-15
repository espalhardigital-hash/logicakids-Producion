"""
seed_fase9.py
=============
Limpia y re-siembra la Fase 9 (Simulados Oficiales) con la estructura
exacta que el frontend espera:

  Módulo 1 (Nivel Fácil):     niveles 1-5   → secciones 101-105
  Módulo 2 (Nivel Intermedio): niveles 1-10  → secciones 201-210
  Módulo 3 (Nivel Difícil):    niveles 1-5   → secciones 301-305

  20 preguntas de opción múltiple (A/B/C/D) por sección.

También inserta/actualiza configuracion_progreso para la Fase 9:
  - Una fila global (seccion=0, operacion='MIXTA') con el cronómetro.
  - Una fila por cada sección activa.
"""
import asyncio
import os
import sys
import random
from datetime import datetime

# Añadir el directorio raíz al path para poder importar 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, delete
from app.db.session import AsyncSessionLocal
from app.models.sql_models import (
    Pregunta, Alternativa, ConfiguracionProgreso,
    OperacionEnum, TipoPreguntaEnum, StatusEnum
)

# ── Configuración de la estructura ────────────────────────────────
# (modulo_id, num_niveles)
ESTRUCTURA = [
    (1, 5),   # Módulo 1: Nivel Fácil — 5 simulacros
    (2, 10),  # Módulo 2: Nivel Intermedio — 10 simulacros
    (3, 5),   # Módulo 3: Nivel Difícil — 5 simulacros
]

PREGUNTAS_POR_SECCION = 20    # El endpoint puede seleccionar hasta 20 aleatoriamente
FASE_ID = 9
TIEMPO_POR_PREGUNTA_SEGUNDOS = 120  # 2 minutos por pregunta (cronómetro)
PORCENTAJE_APROBACION = 90

# Enunciados placeholder realistas (representan imágenes de examen Pedro II)
# El texto real se reemplazará con imágenes SVG cuando estén disponibles.
ENUNCIADOS_BASE = [
    "Analisa o gráfico e responde: qual é o valor correto para a situação apresentada?",
    "Com base na figura geométrica abaixo, calcule a área solicitada.",
    "Um trem parte às 8h15 e chega ao destino 3h40min depois. A que horas chegou?",
    "Joana gasta 25% de sua mesada em passagens. Se recebe R$ 120 ao mês, quanto gasta em passagens?",
    "Observa o padrão numérico e determina o próximo termo da sequência.",
    "Se hoje é terça-feira, que dia da semana será daqui a 100 dias?",
    "Após uma aula-passeio ao Museu Nacional, um estudante decidiu calcular o volume do sarcófago que viu. O sarcófago tem formato de um paralelepípedo de 2m × 1m × 0,5m. Qual é o volume?",
    "Uma torneira enche 1/4 de um tanque por hora. Quantas horas serão necessárias para encher o tanque inteiro?",
    "Pedro tem o dobro de figurinhas que Ana. Juntos eles têm 90. Quantas figurinhas tem Pedro?",
    "Numa escola, 3/5 dos alunos são meninas. Se há 200 alunos, quantas são meninas?",
    "Em uma urna há 4 bolas vermelhas e 6 azuis. Qual a probabilidade de sortear uma vermelha?",
    "O perímetro de um quadrado é 48 cm. Qual é a área desse quadrado?",
    "Uma mercadoria custava R$ 80 e sofreu um aumento de 15%. Qual é o novo preço?",
    "Calcule o valor de X na equação: 3X + 7 = 28.",
    "Quantas diagonais tem um hexágono regular?",
    "A média aritmética dos números 8, 12, 15 e X é 11. Qual é o valor de X?",
    "Um automóvel percorre 300 km em 4 horas. Qual é sua velocidade média em km/h?",
    "Em um retângulo, o comprimento é o triplo da largura. Se o perímetro é 64 cm, qual é a largura?",
    "Simplifica a fração 36/48 à sua forma irredutível.",
    "Uma caixa tem 5 bolinhas amarelas, 3 verdes e 2 vermelhas. Qual a probabilidade de sortear uma verde?",
]

ALTERNATIVAS_TEMPLATE = [
    [("28 m³", True), ("18 m³", False), ("10 m³", False), ("1 m³", False)],
    [("120 cm²", False), ("144 cm²", True), ("100 cm²", False), ("64 cm²", False)],
    [("R$ 92,00", True), ("R$ 88,00", False), ("R$ 95,00", False), ("R$ 84,00", False)],
    [("X = 7", True), ("X = 5", False), ("X = 9", False), ("X = 3", False)],
    [("3/10", False), ("3/5", True), ("2/5", False), ("1/2", False)],
]


async def seed_fase9():
    print("=" * 60)
    print("SEED FASE 9 - Simulados Oficiales Pedro II")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        # ── 1. Limpieza ────────────────────────────────────────────
        print("\n[1/3] Limpiando datos anteriores de la Fase 9...")
        result = await db.execute(select(Pregunta.id).where(Pregunta.fase_id == FASE_ID))
        ids_existentes = result.scalars().all()

        if ids_existentes:
            await db.execute(delete(Alternativa).where(Alternativa.pregunta_id.in_(ids_existentes)))
            await db.execute(delete(Pregunta).where(Pregunta.fase_id == FASE_ID))
            print(f"   ✓ Eliminadas {len(ids_existentes)} preguntas antiguas y sus alternativas.")

        # Limpiar configuracion_progreso de fase 9
        await db.execute(delete(ConfiguracionProgreso).where(ConfiguracionProgreso.fase_id == FASE_ID))
        await db.commit()
        print("   ✓ Limpieza completada.")

        # ── 2. Insertar configuracion_progreso ─────────────────────
        print("\n[2/3] Insertando configuración de progreso para Fase 9...")

        # Fila global (cronómetro general de la fase)
        config_global = ConfiguracionProgreso(
            fase_id=FASE_ID,
            seccion=0,  # Indica configuración global de la fase
            operacion=OperacionEnum.MIXTA,
            cantidad_requerida=PREGUNTAS_POR_SECCION,
            porcentaje_aprobacion=PORCENTAJE_APROBACION,
            orden_desbloqueo=0,
            tipo_feedback="EXAMEN",
            usa_cronometro=True,
            tiempo_default_segundos=TIEMPO_POR_PREGUNTA_SEGUNDOS,
            activo=True,
        )
        db.add(config_global)

        # Una fila por sección
        orden = 1
        for modulo_id, num_niveles in ESTRUCTURA:
            for nivel_id in range(1, num_niveles + 1):
                seccion = modulo_id * 100 + nivel_id
                db.add(ConfiguracionProgreso(
                    fase_id=FASE_ID,
                    seccion=seccion,
                    operacion=OperacionEnum.MIXTA,
                    cantidad_requerida=PREGUNTAS_POR_SECCION,
                    porcentaje_aprobacion=PORCENTAJE_APROBACION,
                    orden_desbloqueo=orden,
                    tipo_feedback="EXAMEN",
                    usa_cronometro=True,
                    tiempo_default_segundos=TIEMPO_POR_PREGUNTA_SEGUNDOS,
                    activo=True,
                ))
                orden += 1

        await db.commit()
        total_secciones = sum(n for _, n in ESTRUCTURA)
        print(f"   ✓ {total_secciones + 1} filas de configuracion_progreso insertadas.")

        # ── 3. Insertar preguntas y alternativas ───────────────────
        print(f"\n[3/3] Insertando {PREGUNTAS_POR_SECCION} preguntas por sección...")

        total_insertadas = 0
        opciones_letras = ["A", "B", "C", "D"]
        n_enunciados = len(ENUNCIADOS_BASE)
        n_alternativas_template = len(ALTERNATIVAS_TEMPLATE)

        for modulo_id, num_niveles in ESTRUCTURA:
            for nivel_id in range(1, num_niveles + 1):
                seccion = modulo_id * 100 + nivel_id

                for q_num in range(1, PREGUNTAS_POR_SECCION + 1):
                    # Rotar entre enunciados base para variedad
                    enunciado_idx = (total_insertadas) % n_enunciados
                    enunciado_base = ENUNCIADOS_BASE[enunciado_idx]

                    # Enunciado con referencia a imagen SVG (pendiente de reemplazar)
                    enunciado = (
                        f"**[M{modulo_id}-N{nivel_id}-Q{q_num:02d}]** "
                        f"{enunciado_base}\n\n"
                        f"![Pregunta {q_num}](/images/simulacros/fase9/m{modulo_id}_n{nivel_id}_q{q_num:02d}.svg)"
                    )

                    correct_idx = random.randint(0, 3)
                    respuesta_correcta = opciones_letras[correct_idx]

                    nueva_pregunta = Pregunta(
                        fase_id=FASE_ID,
                        seccion=seccion,
                        operacion=OperacionEnum.MIXTA,
                        tipo_pregunta=TipoPreguntaEnum.MULTIPLE_OPCION,
                        enunciado=enunciado,
                        respuesta_correcta=respuesta_correcta,
                        requiere_subrayado=False,
                        estado=StatusEnum.ACTIVO,
                        fecha_creacion=datetime.utcnow(),
                    )
                    db.add(nueva_pregunta)
                    await db.flush()  # Obtener el ID generado

                    # Generar 4 alternativas (A, B, C, D)
                    alt_template = ALTERNATIVAS_TEMPLATE[total_insertadas % n_alternativas_template]
                    for i, letra in enumerate(opciones_letras):
                        # Tomar el texto del template y reemplazar con la letra
                        texto_alt, _ = alt_template[i] if i < len(alt_template) else (f"Opción {letra}", False)
                        db.add(Alternativa(
                            pregunta_id=nueva_pregunta.id,
                            texto=letra,          # Texto simple (A, B, C, D) — el SVG tiene el contenido real
                            es_correcta=(i == correct_idx),
                            orden=i + 1,
                        ))

                    total_insertadas += 1

                print(f"   ✓ Módulo {modulo_id} / Nivel {nivel_id} (sección {seccion}): {PREGUNTAS_POR_SECCION} preguntas OK")

        await db.commit()

        total_secciones = sum(n for _, n in ESTRUCTURA)
        print("\n" + "=" * 60)
        print(f"✅ SEED COMPLETADO:")
        print(f"   • Secciones insertadas : {total_secciones}")
        print(f"   • Preguntas insertadas : {total_insertadas}")
        print(f"   • Alternativas         : {total_insertadas * 4}")
        print(f"   • Config_progreso rows : {total_secciones + 1}")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_fase9())
