# CONTEXTO TÉCNICO Y ARQUITECTURA (CONTEXTO-TECNICO.md)

Este documento especifica la infraestructura tecnológica, la arquitectura de software y las directrices de desarrollo que rigen el proyecto de acuerdo con la definición del sistema.

---

## 1. Stack Tecnológico Principal

- **Framework de Frontend:** **Next.js** (React Framework para producción).
- **Backend y Base de Datos:** **Supabase** (BaaS que proporciona PostgreSQL en la nube, autenticación integrada, almacenamiento S3-compatible de archivos y APIs RESTful en tiempo real autogeneradas).

---

## 2. Arquitectura de Software

- **Enfoque:** **Client-Side First** (mínima lógica en el lado del servidor).
- **Consumo de Datos:** La mayor parte del procesamiento de datos, enrutamiento y lógica de negocio se ejecuta directamente en el navegador del cliente.
- **Interacción con Base de Datos:** Consultas directas a Supabase utilizando la librería cliente de Supabase en Javascript/TypeScript (`@supabase/supabase-js`), minimizando la necesidad de construir servidores intermedios de backend o usar Server-Side Rendering (SSR) pesado, a menos que sea estrictamente necesario por razones de seguridad de claves privadas.

---

## 3. Interfaz de Usuario (UI) y Sistema de Diseño

- **Base de Diseño:** **shadcn/ui** (una colección de componentes reutilizables construidos con Tailwind CSS y Radix UI).
- **Implementación:** Los componentes se copian e integran directamente en el código del proyecto, permitiendo personalización total sin la rigidez de las dependencias externas tradicionales.
- **Estilo:** Limpio, minimalista y responsivo.

---

## 4. Estilo Visual (Aesthetic)

- **Tema de Referencia:** **Light Mode** (Modo Claro) como tema predeterminado.
- **Inspiración Visual:** Interfaces limpias, modernas y de alta legibilidad inspiradas en referentes de la industria como:
  - **Linear:** Diseño técnico refinado con bordes nítidos y sombras muy suaves.
  - **Resend:** Minimalismo extremo y tipografía elegante de alto contraste.
  - **Vercel:** Estructura geométrica clara con fuerte énfasis en el espacio en blanco y los contrastes oscuros sobre claros.
