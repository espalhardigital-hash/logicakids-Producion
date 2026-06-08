#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auditor de Consistencia y Calidad de Preguntas Matemáticas (DevOps Tool)
=======================================================================
Este script se conecta a la base de datos PostgreSQL de LogicaKids y escanea
las preguntas cargadas de las Fases 2 y 3 para certificar:
1. Inconsistencias de dominio (ej. decimales en objetos discretos indivisibles).
2. Sesgo de anticipación (dos pasos) en el Paso 1.
3. Formato monetario (redondeo a centavos).
"""

import asyncio
import os
import sys
import math
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# --- 1. Diccionario de Dominio (Objetos y Contextos) ---
OBJETOS_DISCRETOS = {
    "libro", "cuaderno", "lápiz", "juguete", "pelota", "manzana", 
    "persona", "estudiante", "dulce", "tazo", "estampa", "figura", 
    "goma", "chocolate", "bombón", "crayón", "naranja", "gato"
}
OBJETOS_CONTINUOS = {
    "agua", "harina", "leche", "arena", "tela", "madera", "tiempo", 
    "litro", "kilo", "metro"
}
OBJETOS_MONETARIOS = {
    "peso", "dólar", "moneda", "centavo", "dinero", "vuelto", 
    "real", "cambio", "costo", "precio", "reales"
}

TEMAS_DECIMALES_VALIDOS = {"compras", "monedas", "medidas", "peso", "longitud", "volumen"}

def clasificar_texto(enunciado: str):
    text_clean = enunciado.lower()
    
    discretos = [w for w in OBJETOS_DISCRETOS if w in text_clean]
    monetarios = [w for w in OBJETOS_MONETARIOS if w in text_clean]
    continuos = [w for w in OBJETOS_CONTINUOS if w in text_clean]
    
    if monetarios:
        return "monetario", monetarios[0]
    if discretos:
        return "discreto", discretos[0]
    if continuos:
        return "continuo", continuos[0]
    return "desconocido", None

async def run_audit():
    # Load dotenv and connect
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ Error: DATABASE_URL no encontrada en el .env")
        sys.exit(1)
        
    # Reemplazo de host si se ejecuta externamente
    if "base_postgres_general" in db_url and os.path.exists("test_db_conn.py"):
        db_url = db_url.replace("base_postgres_general", "127.0.0.1")
        
    print("=" * 70)
    print("INICIANDO AUDITORÍA DE CONSISTENCIA DE LA BASE DE DATOS REAL")
    print(f"Conectando a: {db_url.split('@')[-1]}")
    print("=" * 70)
    
    engine = create_async_engine(db_url)
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT id, fase_id, seccion, tipo_pregunta, enunciado, respuesta_correcta 
                FROM preguntas 
                WHERE fase_id IN (2, 3)
                ORDER BY fase_id, seccion, id;
            """))
            questions = result.fetchall()
            print(f"Total de preguntas cargadas en la DB: {len(questions)}")
            
            anomalias = []
            
            for q in questions:
                q_id, fase_id, seccion, tipo_pregunta, enunciado, respuesta_correcta = q
                tipo_obj, obj_detectado = clasificar_texto(enunciado)
                
                resp_num = None
                try:
                    resp_num = float(respuesta_correcta.replace(",", "."))
                except ValueError:
                    pass
                    
                admite_decimales = str(seccion).startswith("3") or tipo_obj in ["continuo", "monetario"]
                
                resultado = {
                    "id": q_id,
                    "fase_id": fase_id,
                    "seccion": seccion,
                    "enunciado": enunciado,
                    "respuesta": respuesta_correcta,
                    "tipo_objeto": tipo_obj,
                    "objeto_detectado": obj_detectado,
                    "errores": [],
                    "advertencias": []
                }
                
                # 1. Objeto Discreto Indivisible con división decimal
                if not admite_decimales and tipo_obj == "discreto" and resp_num is not None:
                    if resp_num % 1 != 0:
                        resultado["errores"].append(
                            f"Inconsistencia de Dominio: Objeto discreto '{obj_detectado}' no puede dividirse en decimales ({respuesta_correcta})."
                        )
                        
                # 2. Formato Monetario con más de 2 decimales
                if tipo_obj == "monetario" and resp_num is not None and resp_num % 1 != 0:
                    partes = str(resp_num).split(".")
                    if len(partes) > 1 and len(partes[1]) > 2:
                        resultado["advertencias"].append(
                            f"Formato Monetario: La respuesta ({respuesta_correcta}) supera los 2 decimales de centavos."
                        )
                        
                # 3. Anticipación en dos pasos
                is_two_steps = str(seccion).startswith("4")
                if is_two_steps and "[ESPEJO]" not in enunciado:
                    en_lower = enunciado.lower()
                    if "paso 1" in en_lower or "bloque a" in en_lower:
                        if "mitad" in en_lower or "repart" in en_lower:
                            resultado["errores"].append(
                                "Sesgo de Anticipación: Enunciado del Paso 1 contiene premisas del Paso 2."
                            )
                            
                if resultado["errores"] or resultado["advertencias"]:
                    anomalias.append(resultado)
            
            print(f"Total de anomalías e inconsistencias de dominio encontradas: {len(anomalias)}")
            print("=" * 70)
            
            if anomalias:
                for idx, an in enumerate(anomalias[:10]):
                    print(f"\n[!] Anomalía #{idx+1} | ID: {an['id']} | Fase {an['fase_id']} | Sec {an['seccion']}")
                    print(f"    Texto: {an['enunciado'][:100]}...")
                    print(f"    Respuesta: '{an['respuesta']}' | Objeto: {an['tipo_objeto']} ({an['objeto_detectado']})")
                    for err in an["errores"]:
                        print(f"    ❌ [ERROR] {err}")
                    for adv in an["advertencias"]:
                        print(f"    ⚠️ [ADVERTENCIA] {adv}")
            else:
                print("🏆 ¡Felicidades! La base de datos está 100% libre de inconsistencias didácticas y de redondeo.")
                print("=" * 70)
                
    except Exception as e:
        print(f"❌ Error de conexión o ejecución de base de datos: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_audit())
