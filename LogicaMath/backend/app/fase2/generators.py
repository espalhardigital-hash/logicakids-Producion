"""
Generadores de Preguntas — Fase 2 (Módulos 1, 2 y 3)
=====================================================
Generación determinista del lado del servidor usando seed reproducible.
Los módulos 4 y 5 usan preguntas almacenadas en BD; no necesitan generadores.

Convención de retorno de todos los generadores:
{
    "enunciado": str,
    "respuesta_correcta": str,
    "datos_numericos": dict,
    "explicacion_paso_a_paso": dict,
    "errores_previstos": dict,
}
"""

import random
import math
from typing import Dict, Any


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _rnd(seed: int) -> random.Random:
    """Crea una instancia de Random con seed fija para reproducibilidad."""
    r = random.Random()
    r.seed(seed)
    return r


def _struct_rnd(seed: int) -> random.Random:
    """Crea una instancia de Random para elecciones estructurales (misma para toda la familia)."""
    return _rnd(seed // 10)


def _centavos_validos() -> list:
    """Solo centavos pedagógicamente válidos en el sistema monetario brasileño."""
    return [0, 25, 50, 75]


def _fmt_reais(centavos: int) -> str:
    """Formatea centavos como R$ X,XX."""
    reais = centavos // 100
    cents = centavos % 100
    return f"R$ {reais},{cents:02d}"


# ─────────────────────────────────────────────────────────────────────────────
# MÓDULO 1 — Gimnasio Numérico Mental
# ─────────────────────────────────────────────────────────────────────────────

def generate_modulo1_nivel1(seed: int) -> Dict[str, Any]:
    """
    Nivel 1: Escalas y Proporciones.
    Pregunta el doble, la mitad o el triple de un número.
    """
    r_struct = _struct_rnd(seed)
    operacion = r_struct.choice(["doble", "mitad", "triple"])
    
    r = _rnd(seed)
    if operacion == "mitad":
        # Asegurar que sea par para resultado entero
        base = r.randint(2, 30) * 2
        resultado = base // 2
        enunciado = f"¿Cuánto es la mitad de {base}?"
        explicacion = f"La mitad de {base} se calcula dividiendo entre 2: {base} ÷ 2 = {resultado}"
    elif operacion == "doble":
        base = r.randint(5, 50)
        resultado = base * 2
        enunciado = f"¿Cuánto es el doble de {base}?"
        explicacion = f"El doble de {base} se calcula multiplicando por 2: {base} × 2 = {resultado}"
    else:  # triple
        base = r.randint(3, 30)
        resultado = base * 3
        enunciado = f"¿Cuánto es el triple de {base}?"
        explicacion = f"El triple de {base} se calcula multiplicando por 3: {base} × 3 = {resultado}"

    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(resultado),
        "datos_numericos": {"base": base, "operacion": operacion, "resultado": resultado},
        "explicacion_paso_a_paso": {
            "pasos": [f"Identificamos el número base: {base}", explicacion],
            "resultado_final": str(resultado),
        },
        "errores_previstos": {
            "confusion_doble_triple": f"No confundas el doble ({base * 2}) con el triple ({base * 3})",
            "division_incorrecta": f"La mitad es dividir entre 2, no entre 3",
        },
    }


def generate_modulo1_nivel2(seed: int) -> Dict[str, Any]:
    """
    Nivel 2: Orden de Operaciones (PEMDAS/BODMAS).
    Expresiones con suma, resta y multiplicación.
    """
    r_struct = _struct_rnd(seed)
    patron = r_struct.choice(["a + b * c", "a * b + c", "a + b - c * d"])

    r = _rnd(seed)
    if patron == "a + b * c":
        a = r.randint(1, 20)
        b = r.randint(2, 10)
        c = r.randint(2, 8)
        resultado = a + b * c
        enunciado = f"¿Cuánto es {a} + {b} × {c}?"
        pasos = [
            f"Primero resolvemos la multiplicación: {b} × {c} = {b * c}",
            f"Luego la suma: {a} + {b * c} = {resultado}",
        ]
        datos = {"a": a, "b": b, "c": c, "expresion": f"{a} + {b} × {c}"}

    elif patron == "a * b + c":
        a = r.randint(2, 10)
        b = r.randint(2, 8)
        c = r.randint(1, 20)
        resultado = a * b + c
        enunciado = f"¿Cuánto es {a} × {b} + {c}?"
        pasos = [
            f"Primero resolvemos la multiplicación: {a} × {b} = {a * b}",
            f"Luego la suma: {a * b} + {c} = {resultado}",
        ]
        datos = {"a": a, "b": b, "c": c, "expresion": f"{a} × {b} + {c}"}

    else:  # a + b - c * d
        c = r.randint(2, 6)
        d = r.randint(2, 5)
        a = r.randint(c * d + 1, 60)
        b = r.randint(1, 15)
        resultado = a + b - c * d
        enunciado = f"¿Cuánto es {a} + {b} - {c} × {d}?"
        pasos = [
            f"Primero resolvemos la multiplicación: {c} × {d} = {c * d}",
            f"Ahora: {a} + {b} - {c * d} = {a + b} - {c * d} = {resultado}",
        ]
        datos = {"a": a, "b": b, "c": c, "d": d, "expresion": f"{a} + {b} - {c} × {d}"}

    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(resultado),
        "datos_numericos": datos,
        "explicacion_paso_a_paso": {
            "pasos": pasos,
            "resultado_final": str(resultado),
            "regla": "Siempre resuelve multiplicaciones y divisiones ANTES que sumas y restas.",
        },
        "errores_previstos": {
            "orden_incorrecto": f"No resuelvas de izquierda a derecha ignorando prioridades",
        },
    }


def generate_modulo1_nivel3(seed: int) -> Dict[str, Any]:
    """
    Nivel 3: Problemas de texto que integran escalas y operaciones.
    Traduce palabras a operaciones matemáticas.
    """
    r_struct = _struct_rnd(seed)
    plantillas = [
        {
            "id": 0,
            "gen": lambda r: (r.randint(3, 20), r.randint(2, 5)),
            "texto": lambda b, m: f"Ana tiene {b} canicas. Pedro tiene el {m} doble que ella. ¿Cuántas canicas tiene Pedro?",
            "calc": lambda b, m: b * m,
            "explicacion": lambda b, m: [f"Pedro tiene {m} veces las canicas de Ana.", f"{b} × {m} = {b * m}"],
        },
        {
            "id": 1,
            "gen": lambda r: (r.randint(10, 50) * 2, None),
            "texto": lambda b, _: f"En una fiesta hay {b} globos. Al final de la fiesta se usó la mitad. ¿Cuántos globos quedaron?",
            "calc": lambda b, _: b // 2,
            "explicacion": lambda b, _: [f"La mitad de {b} es {b} ÷ 2 = {b // 2}"],
        },
        {
            "id": 2,
            "gen": lambda r: (r.randint(5, 20), r.randint(2, 8)),
            "texto": lambda b, c: f"Una caja tiene {b} chocolates. Si compramos el triple de cajas, ¿cuántos chocolates tenemos en total?",
            "calc": lambda b, c: b * 3,
            "explicacion": lambda b, c: [f"Triple significa 3 veces.", f"{b} × 3 = {b * 3}"],
        },
    ]
    t_idx = r_struct.randint(0, len(plantillas) - 1)
    t = plantillas[t_idx]
    
    r = _rnd(seed)
    vals = t["gen"](r)
    b, m = vals[0], vals[1]
    resultado = t["calc"](b, m)

    return {
        "enunciado": t["texto"](b, m),
        "respuesta_correcta": str(resultado),
        "datos_numericos": {"base": b, "multiplicador": m},
        "explicacion_paso_a_paso": {
            "pasos": t["explicacion"](b, m),
            "resultado_final": str(resultado),
        },
        "errores_previstos": {
            "no_identifica_operacion": "Lee con atención: 'el doble' = ×2, 'la mitad' = ÷2, 'el triple' = ×3",
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# MÓDULO 2 — Tablas en Acción
# ─────────────────────────────────────────────────────────────────────────────

def generate_modulo2_nivel1(seed: int) -> Dict[str, Any]:
    """
    Nivel 1: Inversa de suma/resta.
    Dado a + b = c, pregunta c - b = ?
    """
    r_struct = _struct_rnd(seed)
    modo = r_struct.choice(["falta_a", "falta_b"])
    
    r = _rnd(seed)
    a = r.randint(5, 40)
    b = r.randint(3, 30)
    c = a + b

    if modo == "falta_b":
        enunciado = f"Si {a} + ___ = {c}, ¿cuánto vale ___?"
        resultado = b
        pasos = [f"Tenemos {a} + ___ = {c}", f"Para encontrar el número que falta: {c} - {a} = {resultado}"]
    else:
        enunciado = f"Si ___ + {b} = {c}, ¿cuánto vale ___?"
        resultado = a
        pasos = [f"Tenemos ___ + {b} = {c}", f"Para encontrar el número que falta: {c} - {b} = {resultado}"]

    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(resultado),
        "datos_numericos": {"a": a, "b": b, "c": c},
        "explicacion_paso_a_paso": {
            "pasos": pasos,
            "resultado_final": str(resultado),
            "regla": "La suma y la resta son operaciones inversas.",
        },
        "errores_previstos": {
            "suma_en_vez_de_restar": f"No sumes {a} + {c}; debes restar para encontrar el valor desconocido",
        },
    }


def generate_modulo2_nivel2(seed: int) -> Dict[str, Any]:
    """
    Nivel 2: Inversa de multiplicación/división.
    Dado a × b = c, pregunta c ÷ a = ?
    """
    r_struct = _struct_rnd(seed)
    modo = r_struct.choice(["falta_factor_b", "falta_factor_a"])
    
    r = _rnd(seed)
    a = r.randint(2, 12)
    b = r.randint(2, 12)
    c = a * b

    if modo == "falta_factor_b":
        enunciado = f"Si {a} × ___ = {c}, ¿cuánto vale ___?"
        resultado = b
        pasos = [f"Tenemos {a} × ___ = {c}", f"Dividimos: {c} ÷ {a} = {resultado}"]
    else:
        enunciado = f"Si ___ × {b} = {c}, ¿cuánto vale ___?"
        resultado = a
        pasos = [f"Tenemos ___ × {b} = {c}", f"Dividimos: {c} ÷ {b} = {resultado}"]

    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(resultado),
        "datos_numericos": {"a": a, "b": b, "c": c},
        "explicacion_paso_a_paso": {
            "pasos": pasos,
            "resultado_final": str(resultado),
            "regla": "La multiplicación y la división son operaciones inversas.",
        },
        "errores_previstos": {
            "confusion_factor": f"Para encontrar un factor desconocido, divide el producto entre el factor conocido",
        },
    }


def generate_modulo2_nivel3(seed: int) -> Dict[str, Any]:
    """
    Nivel 3: Número faltante con cualquier operación (mixta).
    """
    r_struct = _struct_rnd(seed)
    tipo = r_struct.choice(["suma_mixta", "resta_mixta", "mult_division"])
    
    r = _rnd(seed)
    if tipo == "suma_mixta":
        total = r.randint(15, 80)
        parte1 = r.randint(5, total - 5)
        parte2 = total - parte1
        enunciado = f"{parte1} + [ ] = {total}"
        resultado = parte2
        pasos = [f"Necesitamos encontrar qué número sumado a {parte1} da {total}", f"{total} - {parte1} = {resultado}"]
    elif tipo == "resta_mixta":
        a = r.randint(20, 80)
        b = r.randint(5, a - 5)
        resultado = a - b
        enunciado = f"{a} - [ ] = {resultado}"
        pasos = [f"Restamos: {a} - [ ] = {resultado}", f"El número que falta es: {a} - {resultado} = {b}"]
        resultado = b
    else:
        a = r.randint(2, 10)
        b = r.randint(2, 10)
        c = a * b
        enunciado = f"{a} × [ ] = {c}"
        resultado = b
        pasos = [f"Multiplicación: {a} × [ ] = {c}", f"Dividimos: {c} ÷ {a} = {resultado}"]

    return {
        "enunciado": enunciado,
        "respuesta_correcta": str(resultado),
        "datos_numericos": {"tipo": tipo},
        "explicacion_paso_a_paso": {"pasos": pasos, "resultado_final": str(resultado)},
        "errores_previstos": {"operacion_incorrecta": "Identifica la operación inversa para despejar el número desconocido"},
    }


# ─────────────────────────────────────────────────────────────────────────────
# MÓDULO 3 — Tienda Matemática
# ─────────────────────────────────────────────────────────────────────────────

PRODUCTOS = [
    ("Lápiz",    25),   # R$ 0,25
    ("Borracha", 50),   # R$ 0,50
    ("Caderno",  350),  # R$ 3,50
    ("Caneta",   175),  # R$ 1,75
    ("Régua",    225),  # R$ 2,25
    ("Apontador",75),   # R$ 0,75
    ("Cola",     150),  # R$ 1,50
    ("Tesoura",  400),  # R$ 4,00
    ("Estojo",   750),  # R$ 7,50
    ("Mochila",  2500), # R$ 25,00
]


def generate_modulo3_nivel1(seed: int) -> Dict[str, Any]:
    """
    Nivel 1: Reconocimiento de monedas y conversión a R$.
    Suma de monedas válidas (valores en centavos).
    """
    r_struct = _struct_rnd(seed)
    num_monedas = r_struct.randint(3, 6)
    
    r = _rnd(seed)
    monedas_opciones = [5, 10, 25, 50, 100]  # centavos
    monedas = [r.choice(monedas_opciones) for _ in range(num_monedas)]
    total = sum(monedas)

    monedas_texto = " + ".join([_fmt_reais(m) for m in monedas])
    enunciado = f"¿Cuánto suman estas monedas? {monedas_texto}"

    return {
        "enunciado": enunciado,
        "respuesta_correcta": _fmt_reais(total),
        "datos_numericos": {"monedas_centavos": monedas, "total_centavos": total},
        "explicacion_paso_a_paso": {
            "pasos": [f"Sumamos cada moneda: {monedas_texto}", f"Total = {_fmt_reais(total)}"],
            "resultado_final": _fmt_reais(total),
        },
        "errores_previstos": {
            "conversion_decimal": "Trabaja en centavos para evitar errores: suma los números enteros primero",
        },
    }


def generate_modulo3_nivel2(seed: int) -> Dict[str, Any]:
    """
    Nivel 2: Pago exacto — suma de precios de productos.
    """
    r_struct = _struct_rnd(seed)
    num_productos = r_struct.randint(2, 4)
    # Para sample necesitamos consistencia en la selección si queremos el mismo set de productos
    # Pero aquí r.sample usará el seed de valores, así que cada variante tendrá productos distintos.
    # Si queremos los mismos productos pero diferentes precios (no aplica aquí porque precios son fijos),
    # o simplemente que sea "el mismo tipo de problema".
    # Como los precios son fijos, si cambiamos los productos, cambiamos la respuesta.
    # El usuario quiere "la misma pregunta con número o enunciado muy parecido".
    # Entonces r_struct debe elegir los productos.
    seleccionados = r_struct.sample(PRODUCTOS, num_productos)
    total = sum(p[1] for p in seleccionados)

    lista = ", ".join([f"{p[0]} ({_fmt_reais(p[1])})" for p in seleccionados])
    enunciado = f"João compró: {lista}. ¿Cuánto pagó en total?"

    pasos = [f"Precio de {p[0]}: {_fmt_reais(p[1])}" for p in seleccionados]
    pasos.append(f"Total: {' + '.join([_fmt_reais(p[1]) for p in seleccionados])} = {_fmt_reais(total)}")

    return {
        "enunciado": enunciado,
        "respuesta_correcta": _fmt_reais(total),
        "datos_numericos": {"productos": [(p[0], p[1]) for p in seleccionados], "total_centavos": total},
        "explicacion_paso_a_paso": {"pasos": pasos, "resultado_final": _fmt_reais(total)},
        "errores_previstos": {
            "centavos_incorrectos": "Suma por separado los reales y los centavos, luego combínalos",
        },
    }


def generate_modulo3_nivel3(seed: int) -> Dict[str, Any]:
    """
    Nivel 3: Cálculo de troco (cambio/vuelto).
    """
    r_struct = _struct_rnd(seed)
    num_productos = r_struct.randint(1, 3)
    seleccionados = r_struct.sample(PRODUCTOS, num_productos)
    
    total_compra = sum(p[1] for p in seleccionados)

    # Calcular billete justo encima del total (50, 100, 200, 500, 1000 centavos = R$ 0.50, 1, 2, 5, 10)
    billetes = [100, 200, 500, 1000, 2000, 5000]
    billete = next((b for b in billetes if b > total_compra), 5000)
    troco = billete - total_compra

    lista = ", ".join([f"{p[0]} ({_fmt_reais(p[1])})" for p in seleccionados])
    enunciado = f"María compró: {lista}. Pagó con {_fmt_reais(billete)}. ¿Cuánto recibe de vuelto?"

    return {
        "enunciado": enunciado,
        "respuesta_correcta": _fmt_reais(troco),
        "datos_numericos": {
            "productos": [(p[0], p[1]) for p in seleccionados],
            "total_compra_centavos": total_compra,
            "billete_centavos": billete,
            "troco_centavos": troco,
        },
        "explicacion_paso_a_paso": {
            "pasos": [
                f"Total de la compra: {_fmt_reais(total_compra)}",
                f"Pagó con: {_fmt_reais(billete)}",
                f"Vuelto = {_fmt_reais(billete)} - {_fmt_reais(total_compra)} = {_fmt_reais(troco)}",
            ],
            "resultado_final": _fmt_reais(troco),
        },
        "errores_previstos": {
            "troco_incorrecto": "El vuelto es la diferencia entre lo que pagaste y el total de la compra",
        },
    }


def generate_modulo2_nivel4(seed: int) -> Dict[str, Any]:
    """
    Nivel 4: Gran Integración.
    Combina de forma aleatoria inversa +/- (Nivel 1), inversa * / / (Nivel 2) y número faltante (Nivel 3).
    """
    r_struct = _struct_rnd(seed)
    sub = r_struct.randint(1, 3)
    if sub == 1:
        return generate_modulo2_nivel1(seed)
    elif sub == 2:
        return generate_modulo2_nivel2(seed)
    else:
        return generate_modulo2_nivel3(seed)


def generate_modulo3_nivel4(seed: int) -> Dict[str, Any]:
    """
    Nivel 4: Comprador Inteligente.
    Dado un presupuesto (billete) y una lista de compras, calcula si sobra o falta dinero,
    y devuelve la cantidad exacta de diferencia formateada como R$ X,XX.
    """
    r_struct = _struct_rnd(seed)
    # Seleccionar presupuesto
    billete = r_struct.choice([500, 1000, 1500, 2000])  # R$ 5.00, R$ 10.00, R$ 15.00, R$ 20.00
    
    # Seleccionar productos
    num_productos = r_struct.randint(1, 3)
    seleccionados = r_struct.sample(PRODUCTOS, num_productos)
    
    total_compra = sum(p[1] for p in seleccionados)
    
    # Si la compra es igual al billete, ajustamos un producto
    if total_compra == billete:
        seleccionados[0] = (seleccionados[0][0], seleccionados[0][1] + 25)
        total_compra += 25

    lista = ", ".join([f"{p[0]} ({_fmt_reais(p[1])})" for p in seleccionados])
    
    if billete > total_compra:
        diferencia = billete - total_compra
        enunciado = f"Tienes {_fmt_reais(billete)}. Compras: {lista}. ¿Cuánto dinero te sobra?"
        respuesta_correcta = _fmt_reais(diferencia)
        pasos = [
            f"Presupuesto: {_fmt_reais(billete)}",
            f"Total compra: {_fmt_reais(total_compra)}",
            f"Como el presupuesto es mayor, te sobra dinero.",
            f"Sobra: {_fmt_reais(billete)} - {_fmt_reais(total_compra)} = {_fmt_reais(diferencia)}",
        ]
    else:
        diferencia = total_compra - billete
        enunciado = f"Tienes {_fmt_reais(billete)}. Compras: {lista}. ¿Cuánto dinero te falta?"
        respuesta_correcta = _fmt_reais(diferencia)
        pasos = [
            f"Presupuesto: {_fmt_reais(billete)}",
            f"Total compra: {_fmt_reais(total_compra)}",
            f"Como la compra supera tu presupuesto, te falta dinero.",
            f"Falta: {_fmt_reais(total_compra)} - {_fmt_reais(billete)} = {_fmt_reais(diferencia)}",
        ]

    return {
        "enunciado": enunciado,
        "respuesta_correcta": respuesta_correcta,
        "datos_numericos": {
            "billete": billete,
            "total_compra": total_compra,
            "diferencia": diferencia,
            "productos": [(p[0], p[1]) for p in seleccionados]
        },
        "explicacion_paso_a_paso": {
            "pasos": pasos,
            "resultado_final": respuesta_correcta
        },
        "errores_previstos": {
            "resta_invertida": "Resta siempre la cantidad menor de la mayor para saber la diferencia",
            "confusion_sobra_falta": "Compara tu dinero con el total de la compra para saber si te sobra o te falta"
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# DISPATCHER — llama al generador correcto según módulo y nivel
# ─────────────────────────────────────────────────────────────────────────────

_GENERATORS = {
    (1, 1): generate_modulo1_nivel1,
    (1, 2): generate_modulo1_nivel2,
    (1, 3): generate_modulo1_nivel3,
    (2, 1): generate_modulo2_nivel1,
    (2, 2): generate_modulo2_nivel2,
    (2, 3): generate_modulo2_nivel3,
    (2, 4): generate_modulo2_nivel4,
    (3, 1): generate_modulo3_nivel1,
    (3, 2): generate_modulo3_nivel2,
    (3, 3): generate_modulo3_nivel3,
    (3, 4): generate_modulo3_nivel4,
}


def generate_question(modulo_id: int, nivel_id: int, seed: int) -> Dict[str, Any]:
    """
    Punto de entrada unificado para generar preguntas de los módulos 1-3.
    Lanza ValueError si el módulo/nivel no tiene generador.
    """
    key = (modulo_id, nivel_id)
    if key not in _GENERATORS:
        raise ValueError(f"No existe generador para módulo={modulo_id}, nivel={nivel_id}")
    return _GENERATORS[key](seed)
