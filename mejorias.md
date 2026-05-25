1. Crear un animacion al finalziar exitosamente un modulo
Actúa como un experto programador frontend y diseñador de UI/UX. Estoy desarrollando una aplicación web utilizando React, TypeScript y Vite. Necesito crear un nuevo componente de alta calidad llamado ModuleCompletedScreen.tsx que se mostrará cuando un usuario termine un módulo.

Objetivo:
Quiero que este componente tenga un diseño impecable y una secuencia de animación fluida y pulida, fuertemente inspirada en la pantalla de "Lección completada" de Duolingo. Debe transmitir celebración, recompensa y mantener al usuario motivado.

Estructura Visual Requerida:

Fondo: Un color oscuro (similar al #131f24 de Duolingo).

Animación Central: Un espacio para un gráfico/mascota central. Encima o alrededor de este gráfico, deben aparecer destellos o fuegos artificiales animados con buen gusto.

Texto de Éxito: Un encabezado vibrante y animado que diga "¡Completaste el módulo!" en color amarillo o naranja. Tipografía atractiva y moderna.

Tarjetas de Estadísticas: Dos tarjetas en la parte inferior, dispuestas horizontalmente con un diseño "flat" pero con volumen (estilo botón de Duolingo):

Tarjeta 1 (Izquierda): Fondo amarillo, título "PUNTOS TOTALES", un ícono de un rayo y el valor numérico (ej. 14).

Tarjeta 2 (Derecha): Fondo verde brillante, título "¡MUY BIEN!", un ícono de precisión y el porcentaje (ej. 94%).

Comportamiento y Animaciones Esperadas:
Para las animaciones, utiliza la librería framer-motion. Como experto, asegúrate de que los tiempos (delays y durations) y el easing se sientan naturales y gratificantes. La secuencia debe ser:

El personaje central aparece con un efecto de rebote elástico (spring o bounce).

Los destellos de celebración estallan alrededor del personaje justo después.

El texto "¡Completaste el módulo!" aparece haciendo un fade-in y deslizándose ligeramente hacia arriba.

Las dos tarjetas de estadísticas entran en secuencia (staggered animation), apareciendo desde abajo hacia arriba.

Opcional pero valorado: Los números de las tarjetas deben hacer una animación de conteo fluida desde cero hasta su valor final.

Requisitos Técnicos:

Escribe código limpio, modular y mantenible en TypeScript (.tsx).

Define una interfaz genérica y tipada para las Props para pasar dinámicamente los puntos y el porcentaje.

Utiliza marcadores de posición (<svg>) para la mascota y los íconos, o utiliza la librería lucide-react.

Proporciona el código de estilos CSS puro necesario (o utiliza clases de Tailwind CSS si prefieres, pero indícamelo).

Garantiza que el diseño sea perfectamente responsive (mobile-first, adaptándose a escritorio).

Por favor, genera el código completo, paso a paso, listo para ser implementado directamente en mi proyecto.