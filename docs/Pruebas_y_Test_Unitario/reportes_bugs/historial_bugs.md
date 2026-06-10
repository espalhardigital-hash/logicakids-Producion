# 📚 Historial de Bugs y Soluciones — LogicaKids

Este archivo es la **base de conocimiento acumulativa** de todos los bugs encontrados
y resueltos durante las pruebas E2E. Cuando un problema se repite o uno similar aparece,
consulta este historial para encontrar rápidamente la solución.

> **Uso:** Busca por palabras clave (ej: "ChunkLoadError", "login", "bloqueo") para
> encontrar soluciones previas relevantes.

---


## ✅ BUG-13adminpan-20260610164236-2YLZ

| Campo | Valor |
|---|---|
| **Fecha detección** | 2026-06-10T16:42:14.812Z |
| **Fecha resolución** | 2026-06-10T16:42:50Z |
| **Estado** | 🟢 RESUELTO |

### Problema
El test `ADMIN puede crear una pregunta en ContentTab (Fase 4) y USER puede jugarla` fallaba porque la Fase 4 aparecía bloqueada al intentar ingresar como un usuario normal. Esto ocurría porque la API de usuario `/users/me` recalcula dinámicamente la `fase_actual_id` de los alumnos basada en su progreso completado real (el cual era 0 para el nuevo usuario). El backend incluye un bypass para evitar este recálculo para usuarios de pruebas automáticas, pero el nuevo usuario `pruebas_automaticas_2` no estaba incluido en la lista.

### Solución Aplicada
Se añadió el nombre de usuario `"pruebas_automaticas_2"` al listado de exclusión/bypass de recálculo de fase en `backend/app/services/pedagogia_service.py` y se reconstruyó la imagen de Docker del backend local para aplicar el cambio.

### Archivos Modificados
- `LogicaMath/backend/app/services/pedagogia_service.py`
---
