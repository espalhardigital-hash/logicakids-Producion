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
