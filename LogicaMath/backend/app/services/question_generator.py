import random
from typing import Dict, List
from enum import Enum
from pydantic import BaseModel

class OperationType(str, Enum):
    SUMA = "suma"
    RESTA = "resta"
    MULTIPLICACION = "multiplicacion"
    DIVISION = "division"

class GeneratedQuestion(BaseModel):
    operacion: OperationType
    nivel: int
    enunciado: str
    respuesta_correcta: int
    tiempo_limite_segundos: int
    datos_numericos: Dict[str, int]

class QuestionGeneratorService:
    """
    Servicio para la generación procedural de preguntas de matemáticas (Suma, Resta, Multiplicación, División)
    basado en las reglas de negocio de LogicaKids (Fase 0 - Matemáticas).
    """

    @staticmethod
    def get_time_limit(nivel: int) -> int:
        """Devuelve el tiempo límite (en segundos) por pregunta basado en el nivel."""
        times = {1: 10, 2: 12, 3: 14, 4: 16, 5: 18}
        return times.get(nivel, 10)

    @staticmethod
    def generar_suma(nivel: int) -> GeneratedQuestion:
        if nivel == 1:
            # Nivel 1: 1 dígito + 1 dígito (1 al 9)
            a = random.randint(1, 9)
            b = random.randint(1, 9)
            return QuestionGeneratorService._build_suma(nivel, [a, b])
        elif nivel == 2:
            # Nivel 2: 2 dígitos + 1 dígito (A: 10-20, B: 1-9)
            a = random.randint(10, 20)
            b = random.randint(1, 9)
            if random.choice([True, False]):
                a, b = b, a  # Variabilidad en el orden visual
            return QuestionGeneratorService._build_suma(nivel, [a, b])
        elif nivel == 3:
            # Nivel 3: 2 dígitos + 2 dígitos (10-50)
            a = random.randint(10, 50)
            b = random.randint(10, 50)
            return QuestionGeneratorService._build_suma(nivel, [a, b])
        elif nivel == 4:
            # Nivel 4: Tres números de 1 dígito (1-9)
            a = random.randint(1, 9)
            b = random.randint(1, 9)
            c = random.randint(1, 9)
            return QuestionGeneratorService._build_suma(nivel, [a, b, c])
        else:
            # Nivel 5: Suma de 3 números (A, B: 10-50, C: 1-9)
            a = random.randint(10, 50)
            b = random.randint(10, 50)
            c = random.randint(1, 9)
            # Desordenar opcionalmente para que el de 1 dígito no esté siempre al final
            nums = [a, b, c]
            random.shuffle(nums)
            return QuestionGeneratorService._build_suma(nivel, nums)

    @staticmethod
    def _build_suma(nivel: int, numeros: List[int]) -> GeneratedQuestion:
        enunciado = " + ".join(str(n) for n in numeros)
        enunciado_completo = f"¿Cuánto es {enunciado}?"
        respuesta_correcta = sum(numeros)
        
        datos = {chr(97 + i): n for i, n in enumerate(numeros)}  # a, b, c...
        
        return GeneratedQuestion(
            operacion=OperationType.SUMA,
            nivel=nivel,
            enunciado=enunciado_completo,
            respuesta_correcta=respuesta_correcta,
            tiempo_limite_segundos=QuestionGeneratorService.get_time_limit(nivel),
            datos_numericos=datos
        )

    @staticmethod
    def generar_resta(nivel: int) -> GeneratedQuestion:
        if nivel == 1:
            # Nivel 1: A (2-10) - B (1 al A-1)
            a = random.randint(2, 10)
            b = random.randint(1, a - 1)
        elif nivel == 2:
            # Nivel 2: A (10-20) - B (1-9)
            a = random.randint(10, 20)
            b = random.randint(1, 9)
        elif nivel == 3:
            # Nivel 3: A (20-50) - B (2-9)
            a = random.randint(20, 50)
            b = random.randint(2, 9)
        elif nivel == 4:
            # Nivel 4: A (30-99) - B (10-25)
            a = random.randint(30, 99)
            b = random.randint(10, 25)
        else:
            # Nivel 5: A (50-99) - B (20 al A-10)
            a = random.randint(50, 99)
            b = random.randint(20, max(21, a - 10))
            
        return GeneratedQuestion(
            operacion=OperationType.RESTA,
            nivel=nivel,
            enunciado=f"¿Cuánto es {a} - {b}?",
            respuesta_correcta=a - b,
            tiempo_limite_segundos=QuestionGeneratorService.get_time_limit(nivel),
            datos_numericos={"a": a, "b": b}
        )

    @staticmethod
    def generar_multiplicacion(nivel: int) -> GeneratedQuestion:
        if nivel == 1:
            # Nivel 1: Factor A (1, 2, 10) x Factor B (1-10)
            a = random.choice([1, 2, 10])
            b = random.randint(1, 10)
        elif nivel == 2:
            # Nivel 2: Tablas del 2 al 5 x (1-10)
            a = random.randint(2, 5)
            b = random.randint(1, 10)
        elif nivel == 3:
            # Nivel 3: Tablas del 2 al 9 x (2-10)
            a = random.randint(2, 9)
            b = random.randint(2, 10)
        elif nivel == 4:
            # Nivel 4: Tablas extendidas (6-12) x (3-10)
            a = random.randint(6, 12)
            b = random.randint(3, 10)
        else:
            # Nivel 5: 2 dígitos por 1 dígito (12-20) x (3-9)
            a = random.randint(12, 20)
            b = random.randint(3, 9)
            
        if random.choice([True, False]): 
            a, b = b, a
            
        return GeneratedQuestion(
            operacion=OperationType.MULTIPLICACION,
            nivel=nivel,
            enunciado=f"¿Cuánto es {a} × {b}?",
            respuesta_correcta=a * b,
            tiempo_limite_segundos=QuestionGeneratorService.get_time_limit(nivel),
            datos_numericos={"a": a, "b": b}
        )

    @staticmethod
    def generar_division(nivel: int) -> GeneratedQuestion:
        if nivel == 1:
            divisor = random.randint(2, 3)
            cociente = random.randint(2, 5)
        elif nivel == 2:
            divisor = random.randint(2, 5)
            cociente = random.randint(2, 10)
        elif nivel == 3:
            divisor = random.randint(3, 9)
            cociente = random.randint(3, 9)
        elif nivel == 4:
            divisor = random.randint(4, 12)
            cociente = random.randint(4, 12)
        else:
            divisor = random.randint(5, 15)
            cociente = random.randint(5, 20)
            
        dividendo = divisor * cociente
        
        return GeneratedQuestion(
            operacion=OperationType.DIVISION,
            nivel=nivel,
            enunciado=f"¿Cuánto es {dividendo} ÷ {divisor}?",
            respuesta_correcta=cociente,
            tiempo_limite_segundos=QuestionGeneratorService.get_time_limit(nivel),
            datos_numericos={"dividendo": dividendo, "divisor": divisor}
        )

    @staticmethod
    def generar_pregunta(operacion: OperationType, nivel: int) -> GeneratedQuestion:
        """Genera una pregunta individual de una operación y nivel específicos."""
        if operacion == OperationType.SUMA:
            return QuestionGeneratorService.generar_suma(nivel)
        elif operacion == OperationType.RESTA:
            return QuestionGeneratorService.generar_resta(nivel)
        elif operacion == OperationType.MULTIPLICACION:
            return QuestionGeneratorService.generar_multiplicacion(nivel)
        elif operacion == OperationType.DIVISION:
            return QuestionGeneratorService.generar_division(nivel)
        else:
            raise ValueError(f"Operación no soportada: {operacion}")

    @staticmethod
    def generar_partida_desafio() -> List[GeneratedQuestion]:
        """
        Genera una partida completa de 'Desafío Mixto' con 50 preguntas,
        escalando progresivamente la dificultad.
        """
        preguntas = []
        
        for i in range(1, 51):
            if i <= 10:
                # Nivel 1 (Preguntas 1-10)
                nivel = 1
                op = random.choice([OperationType.SUMA, OperationType.RESTA])
            elif i <= 20:
                # Nivel 2 (Preguntas 11-20)
                nivel = 2
                op = random.choice([OperationType.SUMA, OperationType.RESTA, OperationType.MULTIPLICACION])
            elif i <= 30:
                # Nivel 3 (Preguntas 21-30)
                nivel = 3
                op = random.choice(list(OperationType))
            elif i <= 40:
                # Nivel 4 (Preguntas 31-40)
                nivel = 4
                op = random.choice(list(OperationType))
            else:
                # Nivel 5 (Preguntas 41-50)
                nivel = 5
                op = random.choice(list(OperationType))
                
            preguntas.append(QuestionGeneratorService.generar_pregunta(op, nivel))
            
        return preguntas
