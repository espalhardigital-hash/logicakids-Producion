# 🧠 Lógica Matemática Central - Fase 0 (Operaciones Elementales)

## ¿Qué es la Fase 0?
La **Fase 0** es la etapa de nivelación y diagnóstico inicial de la plataforma LogicaKids. Su propósito es asegurar que el alumno posee la fluidez necesaria en las operaciones aritméticas básicas antes de avanzar a desafíos más complejos de inferencia y contexto en las fases posteriores.

En esta fase, la generación de ejercicios es **100% dinámica** (basada en algoritmos), lo que permite una práctica infinita y variada. Incluye las cuatro operaciones fundamentales: **Suma, Resta, Multiplicación y División**.

### Objetivo de la Fase
El alumno debe demostrar maestría en cada nivel para progresar. El objetivo final es completar una partida de **50 preguntas** con un rendimiento óptimo para desbloquear la **Fase 1 (Aprendizaje por Dominio)**.

---

## 1. Reglas de Tiempo Límite y Aprobación

Los tiempos y porcentajes detallados a continuación son los **valores estándar** del sistema. Sin embargo, todos estos parámetros pueden ser personalizados por un docente desde el **Panel de Administrador** para adaptarse al ritmo de aprendizaje de cada grupo o alumno.

### Tiempos por Pregunta
El cronómetro se ajusta automáticamente según la dificultad para fomentar la agilidad mental sin generar frustración:

| Nivel | Dificultad | Tiempo Límite (Estándar) |
| :--- | :--- | :--- |
| **Nivel 1** | Fácil | 10 segundos |
| **Nivel 2** | Fácil-Medio | 12 segundos |
| **Nivel 3** | Medio | 14 segundos |
| **Nivel 4** | Medio-Difícil | 16 segundos |
| **Nivel 5** | Difícil | 18 segundos |

### Criterio de Aprobación
Para superar un bloque o nivel y avanzar al siguiente, el sistema exige por defecto un **95% de aciertos** en la sesión (ej. 48 aciertos de 50 preguntas). Este porcentaje también es **configurable desde el Panel de Control**.

---

## 2. Lógica de Generación de Preguntas

### ➕ Sumas (Adición)
- **Nivel 1**: 1 dígito + 1 dígito (Números del 1 al 9).
- **Nivel 2**: 2 dígitos + 1 dígito (A: 10-20, B: 1-9).
- **Nivel 3**: 2 dígitos + 2 dígitos (Ambos entre 10-50).
- **Nivel 4**: Tres números de 1 dígito (A + B + C, todos 1-9).
- **Nivel 5**: Suma de 3 números (A, B: 10-50, C: 1-9).

### ➖ Restas (Sustracción)
- **Nivel 1**: A (2-10) menos B (1 a A-1). *Garantiza resultado > 0*.
- **Nivel 2**: A (10-20) menos B (1-9).
- **Nivel 3**: A (20-50) menos B (2-9).
- **Nivel 4**: 2 dígitos menos 2 dígitos simples (A: 30-99, B: 10-25). *Garantiza A > B*.
- **Nivel 5**: 2 dígitos menos 2 dígitos complejos (A: 50-99, B: 20 a A-10).

### ✖️ Multiplicaciones
- **Nivel 1**: Multiplicar por 1, 2 o 10 (A ∈ {1, 2, 10}, B: 1-10).
- **Nivel 2**: Tablas del 2 al 5 (A: 2-5, B: 1-10).
- **Nivel 3**: Tablas del 2 al 9 (A: 2-9, B: 2-10).
- **Nivel 4**: Tablas extendidas (A: 6-12, B: 3-10).
- **Nivel 5**: 2 dígitos por 1 dígito (A: 12-15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100; B: 3-9).

### ➗ Divisiones
*Técnica: Se genera primero la multiplicación (Divisor × Cociente = Dividendo) para asegurar resultados enteros.*
- **Nivel 1**: Divisor 2-3, Cociente 2-5.
- **Nivel 2**: Divisor 2-5, Cociente 2-10.
- **Nivel 3**: Divisor 3-9, Cociente 3-9.
- **Nivel 4**: Divisor 4-12, Cociente 4-12.

---

## 3. Modo "Desafío Mixto" (Progresión Dinámica)

En este modo, las 50 preguntas escalan de nivel automáticamente dentro de la misma partida:

| Rango Preguntas | Nivel | Operaciones Disponibles |
| :--- | :--- | :--- |
| **1 al 10** | 1 | Sumas (50%) o Restas (50%) |
| **11 al 20** | 2 | Sumas (33%), Restas (33%) o Multiplicaciones (33%) |
| **21 al 30** | 3 | Mezcla equitativa: Suma, Resta, Mult, Div (25% c/u) |
| **31 al 40** | 4 | Operaciones combinadas + Mult/Div Nivel 4 |
| **41 al 50** | 5 | Mezcla completa Nivel 4+ Operaciones encadenadas complejas |

---

## 🛠️ Implementación Técnica (`mathService.ts`)

La lógica está implementada en el servicio frontend para garantizar una respuesta instantánea sin latencia de red.

```typescript
// Ejemplo de estructura del generador
export const generateQuestion = (attempt: number, category: GameCategory, difficulty: Difficulty): Question => {
  // Implementación de rangos aleatorios según nivel...
}

export const calculateTimeLimit = (attempt: number, difficulty: Difficulty): number => {
  // Retorna segundos según tabla del punto 1...
}
```
