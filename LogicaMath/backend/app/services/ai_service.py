import os
import httpx
import json
from typing import List, Dict, Any

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-1.5-flash" # Use flash for faster/cheaper analysis

async def analyze_student_performance(
    username: str, 
    recent_scores: List[Dict[str, Any]], 
    category: str
) -> str:
    """
    Uses Gemini to analyze student performance and provide pedagogical feedback.
    """
    if not GOOGLE_API_KEY:
        return "El análisis de IA no está configurado actualmente (Falta API Key)."

    # Prepare the prompt
    scores_summary = "\n".join([
        f"- Fecha: {s['date']}, Puntaje: {s['score']}%, Correctas: {s['correctCount']}, Errores: {s['errorCount']}, Tiempo Promedio: {s['avgTime']}s"
        for s in recent_scores
    ])

    prompt = f"""
    Eres un tutor pedagógico experto en matemáticas para niños. 
    Analiza el desempeño reciente del estudiante '{username}' en la categoría '{category}'.
    
    Aquí están sus últimos resultados:
    {scores_summary}
    
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
