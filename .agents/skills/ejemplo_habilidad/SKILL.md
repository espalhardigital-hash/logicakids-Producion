---
name: ejemplo_habilidad
description: Un ejemplo de habilidad para guiar al usuario en la creación de sus propias habilidades personalizadas.
---

# Guía de Habilidad de Ejemplo

Esta es una plantilla de habilidad que sirve como punto de partida. Las habilidades permiten personalizar el comportamiento del asistente (Antigravity) para tareas o flujos de trabajo específicos en este proyecto.

## Estructura de esta Habilidad

Una habilidad es una carpeta dentro del directorio `.agents/skills/` que contiene:
1. **`SKILL.md` (Este archivo)**: Contiene los metadatos en formato YAML al principio (delimitado por `---`) y las instrucciones detalladas en formato Markdown.
2. **`scripts/` (Opcional)**: Scripts o herramientas auxiliares que el asistente puede ejecutar.
3. **`examples/` (Opcional)**: Ejemplos prácticos o plantillas de código para que el asistente los tome como referencia.
4. **`references/` (Opcional)**: Documentos de referencia más largos que no caben en este archivo.

## Cómo Personalizar esta Habilidad

1. **Nombre (`name`)**: Cambia el valor en el bloque YAML para darle un identificador único a tu habilidad.
2. **Descripción (`description`)**: Explica brevemente qué hace la habilidad y en qué casos debe activarse. El asistente la usará para saber cuándo cargar esta habilidad.
3. **Instrucciones**: Agrega aquí las reglas, flujos de trabajo, formatos de código o lineamientos que quieres que el asistente siga estrictamente cuando la habilidad esté activa.
