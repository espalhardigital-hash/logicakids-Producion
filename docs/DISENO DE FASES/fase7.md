# Especificación de Interfaz de Usuario: Fase 7 — Coordenadas y Mapas

Esta especificación detalla las reglas de diseño visual y de interacción para la **Fase 7 de LogicaKids Pro**, enfocada en interpretar mapas, trayectos cardinales y operar con unidades temporales (horas, semanas, duraciones). Presencia constante en la prueba (ej. casa a escuela 2023 Q11, Moovit 2020 Q15).

---

## 1. Propósito Pedagógico

* **Objetivo General**: Interpretar mapas, seguir trayectos cardinales y operar con unidades de tiempo, habilidades de presencia constante en el examen.

### 1.1. Estructura de Módulos

| Módulo | Nivel 1: Descubrimiento | Nivel 2: Consolidación | Nivel 3: Fluidez (Integración) |
| :--- | :--- | :--- | :--- |
| **1. Orientación Cardinal** | Identificar Norte, Sur, Este y Oeste. | Seguir comandos de ruta en cuadrículas (Norte 3, Leste 2 - 2023 Q11). | Descubrir qué ruta es imposible o incorrecta. |
| **2. Plano Cartesiano** | Localizar pares ordenados simples (X, Y). | Entender el par ordenado como vector de desplazamiento. | Movimiento relativo (ej. A hasta B sumando vectores - 2024 Q19). |
| **3. La Mecánica del Tiempo**| Conversiones: minutos a horas, días a semanas. | Sumas y restas de intervalos de tiempo (ej. ahorrar por semanas - 2023 Q16). | Ecuaciones temporales (ej. clases = 7 aulas + 1 recreo - 2024 Q20). |
| **4. Horarios y Apps** | Leer tablas de horarios de transporte. | Sumar duración de viaje a hora de salida para hallar la llegada. | Tomar decisiones lógicas comparando dos opciones (Moovit - 2020 Q15). |

### 1.2. Estructura de Evaluación
*   **Desafío 1 (Estándar):** Evalúa los niveles de descubrimiento y consolidación con opciones múltiples.
*   **Desafío 2 (Avanzado):** Integra habilidades de todos los módulos con mayor complejidad.
*   **Desafío Final (Maestría):** Exige la resolución mediante input de texto puro, con un criterio de aprobación estricto del 90%.

---

## 2. Pautas de Diseño de la Interfaz Visual (Propuesta de Layout)

Esta fase adopta la estética de un "Radar Táctico" o "Sistema de Navegación Cartográfico", utilizando cuadrículas brillantes e íconos interactivos de ubicación.

### 2.1. El Radar Cartesiano (Plano de Coordenadas)
* **Visualizador**: Un plano cartesiano holográfico con ejes X e Y, simulando una pantalla de radar.
* **Interactividad**: Al colocar un "marcador", unas líneas guía temporales cruzan los ejes para evidenciar el par `(X, Y)`. Se pueden arrastrar objetos al punto exacto solicitado por el problema.

### 2.2. El Tablero de Exploración (Mapas y Rutas)
* **Visualizador**: Una vista cenital de cuadras (grids urbanos).
* **Interactividad**: Controles direccionales (N, S, E, O) mediante los cuales el niño traza el trayecto dejando una "estela de luz" que se pinta a medida que avanza.

### 2.3. Panel de Cronología y Relojes
* **Visualizador**: Relojes digitales y analógicos combinados con barras de itinerario.
* **Interactividad**: Deslizamiento de manecillas o selectores para calcular el tiempo transcurrido (ej. "¿Si el tren salió a las 8:15 y el viaje dura 45 minutos, a qué hora llega?").

---

## 3. Estilo Visual y Feedback

* **Estética**: Pantallas oscuras con trazados cian, brújulas neón doradas y elementos cartográficos minimalistas.
* **Feedback Pedagógico**: En errores cartesianos (ej. niño confunde X con Y), el sistema proyecta flechas rojas animadas primero sobre la línea horizontal ("Paso 1: caminar por el piso") y luego la vertical ("Paso 2: subir el edificio"), para corregir el orden de lectura.

---

## 4. Reglas Generales de Preguntas

---

## 5. Notas de Implementación Técnica

*   **JSONB para Patrones:** Las preguntas de rutas en cuadrícula y plano cartesiano deben ser generadas por el backend y enviadas como una lista de puntos o vectores para que el frontend dibuje el mapa de forma determinista y segura.

### 4.1. Diseño Pedagógico y Progresión (Estándar de Fase)
* Cada módulo incluye **niveles internos progresivos**.
* **Práctica inicial sin presión** de tiempo con activación del **Bucle Espejo** ante errores.
* Evaluación estructurada en: **Desafío 1, Desafío 2 y Desafío Final**.
* **Desbloqueo estricto**: Se requiere una maestría mínima del **90%** para avanzar.