# Información de Versión y Fuentes de Datos - LogicaKids Pro

Este documento detalla el control de versiones, nombres de la aplicación como variables y la arquitectura de lectura de archivos e interfaces de **LogicaKids Pro**.

## 1. Variables de Identificación de la Aplicación

### Nombre de la Aplicación
El nombre de la aplicación está definido como variable en múltiples capas del sistema:
* **Entorno de Desarrollo**: Variable `NOMBRE_APP` en [Datos_Desarrollo/.env](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Datos_Desarrollo/.env) definida como `pruebas`.
* **Entorno de Producción**: Variable `NOMBRE_APP` en [Datos_Producion/.env](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Datos_Producion/.env) definida como `matematicas_Kids`.
* **Frontend**: Clave `"name"` en [package.json](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/package.json) definida como `logicakids-pro`.
* **Backend**: Atributo `title` en el punto de entrada [main.py](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/main.py) definido como `LogicaKids Pro API`.

### Versión de la Aplicación
* **Suite/Backend API**: Versión `3.0.0` (definida en el constructor `FastAPI` en [main.py](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/main.py)).
* **Frontend**: Versión `0.0.0` (inicial, definida en [package.json](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/package.json)).

---

## 2. Orígenes y Lectura de Archivos para Interfaces

Las diferentes interfaces de usuario en el frontend leen datos y recursos desde distintas ubicaciones del sistema (servicios locales, base de datos y buckets de almacenamiento S3):

### A. Base de Datos Central (PostgreSQL)
La base de datos PostgreSQL almacena la información dinámica necesaria para renderizar el progreso de los alumnos y las preguntas dinámicas de las fases iniciales:
* **Configuraciones de Progreso y Maestría**: Las interfaces consumen datos de las tablas `configuracion_progreso` y `progreso_maestria` para determinar qué módulos y niveles están desbloqueados.
* **Preguntas Dinámicas (Fase 1 y Fase 2)**: Leídas dinámicamente desde la tabla `pregunta` y sus correspondientes `alternativa` en la base de datos a través del backend API.
* **Historial e Intentos**: Se leen desde las tablas `intento` e `intento_pregunta` para mostrar los gráficos de rendimiento y tablas de análisis en la interfaz de administración.

### B. Almacenamiento S3 / MinIO (Imágenes y Avatares)
Para mostrar imágenes de perfil y avatares personalizados en la interfaz de perfil ([ProfileScreen.tsx](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/ProfileScreen.tsx)), la aplicación lee archivos binarios desde un bucket S3:
* **Desarrollo**: Bucket `logicakids` configurado en [Datos_Desarrollo/.env](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Datos_Desarrollo/.env) apuntando a `http://minio:9000`.
* **Producción**: Bucket `logicakids-producion` configurado en [Datos_Producion/.env](file:///d:/Antigravity/APP_Logica_Matematicas_kids/Datos_Producion/.env) apuntando a `https://files.espalhar.shop`.
* **Acceso**: El backend genera URLs firmadas u obtiene rutas públicas a través de la clase en [storage.py](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/backend/app/core/storage.py) que el frontend consume mediante la función `getAvatarUrl` de [storageService.ts](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/services/storageService.ts).

### C. Base de Datos Estática (Archivos Locales de Frontend)
Para las fases avanzadas (Fase 3 a Fase 8), el frontend utiliza una base de datos estática local para renderizar teoría, consejos y preguntas de muestra sin realizar consultas pesadas al backend:
* **Archivo de Origen**: [faseMetadata.ts](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/fase_generic/faseMetadata.ts).
* **Campos Soportados**: Contiene descripciones del módulo, nombre, emojis, esquemas de color, apartados de teoría con párrafos, ejemplos ilustrativos y bancos de preguntas locales (ID, enunciado, tipo de pregunta y respuesta correcta).
* **Interfaces que lo consumen**: Las interfaces genéricas de fase ([fase_generic](file:///d:/Antigravity/APP_Logica_Matematicas_kids/LogicaMath/frontend/components/fase_generic)) importan este archivo para estructurar los mapas de niveles visuales.

### D. Configuración del Servidor y Proxy (`.env` y Traefik)
El frontend descubre el punto de entrada del servidor backend mediante variables de entorno configuradas durante el proceso de compilación de Docker:
* **Variable Clave**: `VITE_API_URL`
  * En Desarrollo: `https://logica.espalhar.shop/api`
  * En Producción: `https://matematicas.espalhar.shop/api`
* El proxy inverso **Traefik** utiliza la variable `DOMINIO` y `NOMBRE_APP` de los archivos `.env` para enrutar el tráfico de red de forma segura con certificados SSL.
