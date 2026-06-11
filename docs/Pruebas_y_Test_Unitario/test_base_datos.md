# Instrucciones para el Análisis de Base de Datos: Calidad de Preguntas

## 1. Contexto y Objetivo
El objetivo de este procedimiento es analizar estructural y pedagógicamente la base de datos local (PostgreSQL) para identificar, evaluar y proponer mejoras en la calidad de las preguntas de la plataforma LogicaKids. Se busca asegurar que todas las preguntas cumplan con altos estándares de calidad, presenten opciones lógicas (distractores efectivos) y carezcan de errores de formato.

---

## 2. Acceso al Entorno de Base de Datos
Todas las pruebas y consultas deben ejecutarse en el entorno Docker de pruebas locales.

**Comando de conexión a PostgreSQL local:**
```bash
docker exec -it logicakids_local_db psql -U logicakids_local_user -d logicakids_local
```

Para consultas automáticas que deban ser exportadas a un archivo para análisis de la IA:
```bash
docker exec logicakids_local_db psql -U logicakids_local_user -d logicakids_local -c "TU_CONSULTA_AQUI" > salida_analisis.txt
```

---

## 3. Consultas SQL Estructurales (Diagnóstico Técnico)

El agente tester deberá ejecutar las siguientes consultas para diagnosticar el estado técnico de la tabla `preguntas`:

### A. Distribución General de Preguntas
*Objetivo: Verificar que cada fase y módulo cuente con la cantidad necesaria de preguntas según su dificultad.*
```sql
SELECT fase_id, modulo_id, nivel_id, dificultad, COUNT(*) as total_preguntas 
FROM preguntas 
GROUP BY fase_id, modulo_id, nivel_id, dificultad 
ORDER BY fase_id, modulo_id, nivel_id, dificultad;
```

### B. Validación de Opciones Múltiples (Formato JSON)
*Objetivo: Detectar preguntas de opción múltiple que tengan un arreglo vacío, nulo o menos de 3 opciones (insuficiente para distractores de calidad).*
```sql
SELECT id, enunciado, opciones 
FROM preguntas 
WHERE tipo = 'opcion_multiple' 
  AND (opciones IS NULL OR json_array_length(opciones::json) < 3);
```

### C. Coherencia de Respuesta Correcta
*Objetivo: Comprobar que en las preguntas de opción múltiple, la `respuesta_correcta` esté literalmente incluida dentro del arreglo JSON de `opciones`.*
```sql
SELECT id, enunciado, respuesta_correcta, opciones 
FROM preguntas 
WHERE tipo = 'opcion_multiple' 
  AND NOT (opciones::jsonb ? respuesta_correcta);
```

### D. Detección de Preguntas sin Explicación Pedagógica (Feedback)
*Objetivo: Identificar preguntas huérfanas de feedback, el cual es vital para el aprendizaje tras un error. Además, se debe asegurar que existan al menos 5 "Ejemplos Guiados" por cada nivel.*
```sql
SELECT id, enunciado, fase_id 
FROM preguntas 
WHERE explicacion_paso_a_paso IS NULL OR explicacion_paso_a_paso::text = 'null' OR explicacion_paso_a_paso::text = '""';
```

### E. Detección de Preguntas Repetitivas o Duplicadas
*Objetivo: Identificar si las preguntas en la base de datos son idénticas o demasiado repetitivas. **Solución esperada:** No basta con eliminar; se deben consolidar dejando un pool razonable (10 a 20) inyectando variables dinámicas extraídas de `datos_numericos` directamente en el `enunciado` para garantizar variedad matemática real.*
```sql
SELECT enunciado, COUNT(*) as repeticiones
FROM preguntas
GROUP BY enunciado
HAVING COUNT(*) > 1
ORDER BY repeticiones DESC;
```

### F. Validación de Uso de Imágenes de Apoyo (SVGs Paramétricos)
*Objetivo: Verificar qué proporción de preguntas utiliza imágenes y detectar si áreas eminentemente visuales (ej. Geometría, Fracciones) carecen de ellas. **Solución esperada:** Generar gráficos SVG en formato HTML inyectados en el `enunciado` construidos algorítmicamente a partir de los `datos_numericos` (ej. base, altura, profundidad).*
```sql
SELECT fase_id, seccion, 
       COUNT(*) as total, 
       SUM(CASE WHEN enunciado ILIKE '%<svg%' OR enunciado ILIKE '%<img%' THEN 1 ELSE 0 END) as con_imagen
FROM preguntas
GROUP BY fase_id, seccion
ORDER BY fase_id, seccion;
```

---

## 4. Criterios de Evaluación Pedagógica (Análisis por IA)

Una vez extraídas las preguntas, el agente deberá analizarlas en lotes usando los siguientes criterios de calidad pedagógica:

1. **Claridad del Enunciado:** ¿Es el enunciado directo, comprensible para un niño de la edad objetivo y libre de ambigüedades?
2. **Calidad de los Distractores (Opciones Incorrectas):** Los distractores no deben ser aleatorios. Deben representar errores comunes (ej. un error de signo, olvidar un paso, confusión de conceptos).
3. **Equilibrio de Dificultad:** La pregunta debe coincidir con la etiqueta asignada (Estándar, Avanzada, Maestría). ¿Tienen todas las fases, módulos, niveles y desafíos las preguntas respectivas para su nivel?
4. **Valor del Feedback (Explicación):** Si el alumno falla, ¿la explicación le enseña la metodología correcta o solo le da la respuesta? 
5. **Ejemplos Guiados por Nivel:** ¿Existen al menos **5 ejemplos guiados** por cada nivel en todas las fases? Estas preguntas introductorias deben tener explicaciones sumamente detalladas estilo tutorial y guiar paso a paso antes de los desafíos.
6. **Variedad y No Repetición:** ¿Son las preguntas verdaderamente variadas o son un simple copiar-pegar cambiando un solo número? Deben ofrecer distintos ángulos del mismo problema lógico e incluir variables dinámicas reales en el texto.
7. **Uso de Imágenes Paramétricas:** ¿La pregunta cuenta con gráficos matemáticos exactos (SVG generados desde `datos_numericos`) o dibujos cuando es necesario?

### Prompt de Evaluación Sugerido para el Agente:
> "Extrae un lote de 20 preguntas del Módulo X. Analiza cada una utilizando la matriz de calidad pedagógica. Identifica: (a) Errores de sintaxis/ortografía, (b) Distractores débiles u obvios, (c) Falta de claridad en el enunciado. Propón una corrección directa en formato SQL `UPDATE` para cada pregunta defectuosa."

---

## 5. Verificación de Rutas y Endpoints (Integridad de la API)

Además del análisis de datos crudos, el agente debe verificar que las rutas y endpoints del backend entreguen la información correctamente a la interfaz sin fallos.

**Pruebas a realizar:**
1. **Endpoint de Fases y Módulos:** `GET /api/admin/phase-maps` (Asegurar que retorna todas las fases, módulos, niveles y desafíos con su estructura completa).
2. **Endpoint de Preguntas por Nivel:** `GET /api/gameplay/preguntas/{fase_id}/{modulo_id}/{nivel_id}` (Verificar que retorna el pool correcto y balanceado de preguntas según la dificultad, y que ninguna ruta devuelva un error 404 o 500).
3. **Carga de Imágenes y Archivos Estáticos:** Verificar que las URLs de las imágenes (`imagen_url`) que proveen los endpoints sean rutas válidas y accesibles en el servidor de almacenamiento local (ej. MinIO en el puerto 9100) sin devolver errores de red o imágenes rotas en el Frontend.

---

## 6. Flujo de Trabajo y Corrección

Para llevar a cabo el análisis completo de forma ordenada:

1. **Paso 1: Extracción por Fase.** Extraer el lote completo de preguntas de una Fase específica en un archivo JSON o TXT usando el contenedor de la BD local.
2. **Paso 2: Análisis Estructural (Automático).** Ejecutar las validaciones SQL (Punto 3) para encontrar errores graves (ej. sin opciones, respuesta que no coincide). Repararlos inmediatamente.
3. **Paso 3: Análisis Pedagógico (AI-Driven).** Leer los enunciados, opciones y explicaciones, y generar un reporte de mejora.
4. **Paso 4: Aplicación de Cambios.** Generar y ejecutar las sentencias `UPDATE` necesarias en la base de datos local para inyectar los enunciados pulidos y distractores mejorados.
5. **Paso 5: Validación E2E.** Correr Playwright (`npx playwright test`) sobre los tests de Gameplay correspondientes a la fase corregida para verificar que la interfaz renderiza las nuevas opciones correctamente.
