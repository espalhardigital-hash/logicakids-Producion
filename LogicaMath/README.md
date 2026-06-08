# LogicaKids Pro (Plataforma Educativa Pedro II)

Una plataforma educativa premium basada en el aprendizaje de dominio (mastery-based learning) para dominar las matemáticas de manera gamificada, intuitiva y profesional.

## 🎯 Objetivo y Enfoque Pedagógico

LogicaKids Pro no es solo un juego de cálculo; es un **sistema de tutoría invisible**. A través de una arquitectura backend basada en 8 tablas pedagógicas complejas, la plataforma es capaz de:
- Analizar no solo *si* la respuesta es correcta, sino *por qué* el alumno falló (diagnóstico por tipo de error).
- Entregar retroalimentación específica (feedback guiado y explicaciones paso a paso).
- Desbloquear progresivamente nuevos retos lógicos y operaciones matemáticas según la maestría alcanzada.

## 💎 Diseño Visual
La plataforma cuenta con un diseño de alta gama **Premium Glassmorphism**:
- Fondos oscuros con gradientes sutiles y elementos traslúcidos (`backdrop-blur-xl`).
- Micro-animaciones fluidas utilizando **Framer Motion**.
- Estilizado de alto rendimiento gracias a **Tailwind CSS v4**.

## 🚀 Stack Tecnológico

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Lucide React.
- **Backend**: FastAPI (Python) + SQLAlchemy Async + API Router-based.
- **Base de Datos**: PostgreSQL 15 (Estructura de 8 tablas pedagógicas y JWT nativo).
- **Almacenamiento**: S3-Compatible (MinIO) para subida de avatares.
- **Contenedores**: Docker + Portainer + Traefik.

## 🛠️ Instalación y Despliegue

La infraestructura está dockerizada y diseñada para su despliegue autónomo en servidores VPS. 
👉 **[Guía Completa de Despliegue (DEPLOY.md)](./DEPLOY.md)**

### Inicio Rápido (Docker Compose):

1. Configura tu entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales de PostgreSQL, JWT y almacenamiento S3.
   ```

2. Levanta los contenedores:
   ```bash
   docker compose up -d --build
   ```

*Nota: La inicialización de la base de datos es **automática**. El backend creará de forma inteligente todas las tablas (fases, alumnos, preguntas, progresos, usuarios, etc.) al iniciar si no existen.*

## 👑 Panel de Administración

La plataforma incluye un panel de control exclusivo para usuarios con rol `ADMIN`. Este panel cuenta con el mismo diseño Glassmorphism y permite:
- **Gestión de Usuarios**: Modificar perfiles, avatares y contraseñas.
- **Analíticas en Tiempo Real**: Ver progresos, tasas de acierto y estadísticas avanzadas.
- **Control Pedagógico**: (En desarrollo) Gestionar bancos de preguntas, diagnosticar errores comunes y configurar reglas de avance por bloque.

## 🧪 Testing

La suite de pruebas permite validar la conexión con la base de datos y flujos de información críticos:

```bash
docker compose exec backend python tests/test_db_connection.py
```
