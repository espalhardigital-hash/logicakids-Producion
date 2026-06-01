import os
import httpx
import json
from typing import List, Dict, Any

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemini-1.5-flash" # Use flash for faster/cheaper analysis

async def analyze_student_performance(
    username: str, 
    intentos: List[Any], 
    context_name: str
) -> str:
    """
    Uses Gemini to analyze student performance and provide pedagogical feedback based on Intentos.
    """
    if not GOOGLE_API_KEY:
        return "El análisis de IA no está configurado actualmente (Falta API Key)."

    if not intentos:
        return "No hay suficientes datos (intentos) para generar un análisis."

    # Prepare the prompt
    errores_comunes = {}
    for intento in intentos:
        if not intento.es_correcta and intento.tipo_error:
            err_name = intento.tipo_error.value if hasattr(intento.tipo_error, 'value') else str(intento.tipo_error)
            errores_comunes[err_name] = errores_comunes.get(err_name, 0) + 1

    total_intentos = len(intentos)
    correctos = sum(1 for i in intentos if i.es_correcta)
    porcentaje = (correctos / total_intentos) * 100 if total_intentos > 0 else 0

    tiempos = [i.tiempo_respuesta_segundos for i in intentos if i.tiempo_respuesta_segundos is not None]
    tiempo_promedio = sum(tiempos) / len(tiempos) if tiempos else 0

    errores_str = ", ".join([f"{k} ({v} veces)" for k, v in errores_comunes.items()]) if errores_comunes else "Ninguno detectado"

    prompt = f"""
    Eres un tutor pedagógico experto en matemáticas para niños. 
    Analiza el desempeño reciente del estudiante '{username}' en '{context_name}'.
    
    Aquí está el resumen de sus últimos {total_intentos} intentos:
    - Precisión: {porcentaje:.1f}% ({correctos} correctos de {total_intentos})
    - Tiempo Promedio por Pregunta: {tiempo_promedio:.1f} segundos
    - Errores Frecuentes Identificados: {errores_str}
    
    
    Basado en estos datos, proporciona un breve análisis (máximo 3 párrafos) que incluya:
    1. Una felicitación motivadora basada en sus fortalezas.
    2. Identificación de áreas de mejora (ej. si falla mucho, si es muy lento, o si es inconsistente).
    3. Un consejo práctico para mejorar en la próxima sesión.
    
    Responde siempre en español, con un tono amable, motivador y profesional.
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GOOGLE_API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Extract text from Gemini response
            if "candidates" in data and len(data["candidates"]) > 0:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                return "No se pudo generar el análisis en este momento."
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return f"Error en el análisis de IA: {str(e)}"
