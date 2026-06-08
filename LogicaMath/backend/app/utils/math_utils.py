"""
Utilidades Matemáticas y de Normalización - LogicaKids Pro
==========================================================
Contiene funciones compartidas para la limpieza de datos, normalización de
respuestas y cálculos pedagógicos comunes.
"""

def normalize_response(val: str, is_money: bool = False) -> str:
    """
    Limpia y estandariza la respuesta del alumno para comparación.
    Maneja símbolos de moneda (R$), espacios, comas y puntos decimales.
    """
    if not val:
        return ""
    
    # Limpieza básica
    cleaned = val.strip().lower()
    for symbol in ["r$", "$", "reais", "real", " "]:
        cleaned = cleaned.replace(symbol, "")
    
    # Si contiene separadores decimales o es modo moneda
    if is_money or "," in cleaned or "." in cleaned:
        cleaned_num = cleaned.replace(",", ".")
        try:
            val_float = float(cleaned_num)
            if is_money:
                # Modo moneda: siempre a centavos enteros para evitar líos de flotantes
                return str(round(val_float * 100))
            else:
                # Modo numérico general: normalizar a entero si no hay decimales reales
                if val_float == int(val_float):
                    return str(int(val_float))
                return str(val_float)
        except ValueError:
            pass
    
    return cleaned.replace(",", ".")


def calcular_max_errores(cantidad_req: int, porc_aprobacion: int) -> int:
    """
    Calcula dinámicamente el número máximo de errores permitidos en un desafío
    antes de que sea matemáticamente imposible aprobar.
    """
    if cantidad_req <= 0:
        return 1
    
    min_aciertos_req = cantidad_req
    for c in range(cantidad_req + 1):
        if int((c / cantidad_req) * 100) >= porc_aprobacion:
            min_aciertos_req = c
            break
            
    # Si comete (cantidad_req - min_aciertos_req + 1) errores, lo máximo que puede
    # obtener de aciertos es (min_aciertos_req - 1), haciendo imposible aprobar.
    return cantidad_req - min_aciertos_req + 1

