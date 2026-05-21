Corrección de Bugs Fase 2 — LogicaKids
Análisis profundo y corrección de bugs lógicos, UX y funcionalidad faltante en la Fase 2.

Bugs Encontrados
🐛 BUG CRÍTICO 1: Respuesta Incorrecta en Mock — "La mitad de 6 = 34"
CAUTION

El bug que se muestra en la imagen: Cuando el backend no está disponible, el frontend usa datos MOCK que tienen la respuesta hardcodeada como "34" para TODOS los módulos 1-3, sin importar la pregunta real.

Ubicación: 
Fase2GameScreen.tsx

typescript

// Línea 524 — MOCK_RESULTADO: SIEMPRE compara con '34' → INCORRECTO
if (moduloId <= 3) esCorrecta = respuesta.trim() === '34';
// Línea 531 — También devuelve '34' como respuesta correcta
respuesta_correcta: moduloId <= 3 ? '34' : ...
Y la pregunta mock (línea 508): Si moduloId === 1, muestra "¿Cuánto es el doble de 17?" cuya respuesta sería 34, pero ese enunciado solo aparece como fallback cuando moduloId === 1. El bug se reproduce cuando el sistema genera dinámicamente preguntas con seed del backend (ej: "¿Cuánto es la mitad de 6?" → respuesta correcta = 3) pero al caer al modo offline, el MOCK siempre dice 34.

Solución: Implementar un generador de preguntas local en el frontend que replique la lógica del backend (generators.py), para que las preguntas MOCK sean matemáticamente correctas. La función MOCK_PREGUNTA debe generar enunciados con su respuesta correcta calculada, y MOCK_RESULTADO debe validar contra esa respuesta real.

🐛 BUG CRÍTICO 2: Falta Recuadro Explicativo al Iniciar Nivel
IMPORTANT

Al iniciar un nivel de un módulo en Fase 2, NO aparece el recuadro con texto explicativo (lectura/teoría). En Fase 1 no hay este concepto directamente, pero Fase 2 tiene un endpoint de lectura (/fase2/lectura/{modulo_id}/nivel/{nivel_id}) y contenido de teoría definido en el backend que nunca se muestra al alumno.

Ubicación del endpoint: 
router.py
 — El endpoint existe pero nunca se llama desde el frontend.

Ubicación del servicio: 
Fase2Service.ts
 — La función getFase2Reading() existe pero nunca se utiliza.

Solución: Agregar un modal/overlay de lectura introductoria en Fase2GameScreen.tsx que:

Al montar la pantalla de juego, llame a getFase2Reading(moduloId, nivelId)
Muestre un recuadro con título, párrafos, ejemplos y tip pedagógico
Tenga un botón "¡Entendido, empezar!" para cerrar y comenzar las preguntas
Se muestre solo la primera vez que se entra al nivel (usando sessionStorage)
🐛 BUG 3: UX de Fase 2 No Sigue el Patrón de Fase 1
WARNING

La Fase 2 tiene un estilo visual completamente diferente de la Fase 1. Fase 1 usa diseño glass-card con framer-motion, colores suaves y keypad numérico. Fase 2 usa diseño "Dark Space" con CSS puro, sin animaciones ni keypad.

Diferencias clave que deben corregirse en el GameScreen de Fase 2:

Aspecto	Fase 1 (GameScreen.tsx)	Fase 2 (Fase2GameScreen.tsx)
Animaciones	framer-motion (spring, stagger)	Ninguna (solo CSS)
Feedback	Inline en input (checkmark/X + "Era: X")	Modal overlay separado
Teclado numérico	Keypad visual (7-8-9, 4-5-6, 1-2-3, ⌫-0-→)	Sin keypad
Timer	Barra lineal horizontal + texto "Xs"	Timer circular SVG
Pregunta	Texto GRANDE centrado (text-7xl/8xl)	Texto normal (1.3rem)
Estadísticas	Correctas/Errores inline debajo	Sin estadísticas visibles
Botón salir	"Abortar Misión" con icono	Flecha simple
Solución: Agregar al GameScreen de Fase 2:

Teclado numérico virtual para módulos 1-3 (idéntico al de Fase 1)
Tamaño de pregunta mayor — hacer el texto del enunciado más prominente
Animaciones de shake en error y ambient glow como en Fase 1
Estadísticas inline (Correctas/Errores) dentro de la tarjeta de pregunta
Mantener el feedback overlay ya que en Fase 2 es más complejo (Bucle Espejo)
🐛 BUG 4: Pregunta Mock de Módulo 3 no funciona correctamente
Ubicación: 
Fase2GameScreen.tsx L508-511

typescript

// Módulo 3 muestra: '¿Cuánto suman R$ 0,50 + R$ 1,25?'
// Pero MOCK_RESULTADO compara con '34' → siempre incorrecto
La respuesta correcta de "R0,50+R 1,25" es "R$ 1,75" pero el mock valida contra "34".

🐛 BUG 5: MOCK_PREGUNTA no tiene id para módulos 1-3
Ubicación: 
Fase2GameScreen.tsx L505-513

El mock de módulos 1-3 no incluye id, lo que puede causar errores cuando se intenta enviar pregunta_id al backend.

Propuestas de Cambio
[Component: Frontend - Fase2GameScreen]
[MODIFY] 
Fase2GameScreen.tsx
Reescribir MOCK_PREGUNTA: Implementar generador local con cálculos matemáticos correctos para módulos 1-3 (doble, mitad, triple, orden de operaciones, etc.)
Reescribir MOCK_RESULTADO: Validar contra la respuesta matemáticamente correcta generada por el mock
Agregar modal de lectura introductoria: Al iniciar un nivel, mostrar recuadro explicativo con título, teoría, ejemplos y tip
Agregar teclado numérico virtual para módulos 1-3
Mejorar tamaño de texto de la pregunta para ser más prominente
Agregar contadores de Correctas/Errores debajo de la pregunta
Agregar animación shake mejorada al error
[MODIFY] 
Fase2Styles.css
Agregar estilos para el modal de lectura introductoria
Agregar estilos para el teclado numérico virtual
Agregar estilos para las estadísticas inline
Ajustar tamaño del texto de pregunta
Open Questions
IMPORTANT

Sobre el recuadro explicativo: ¿El recuadro de lectura introductoria debe aparecer CADA VEZ que se entra al nivel, o solo la primera vez? Mi propuesta es mostrarlo solo la primera vez por sesión (usando sessionStorage), con opción de verlo nuevamente con un botón "📖 Ver teoría".

IMPORTANT

Sobre el teclado numérico: ¿El teclado numérico en Fase 2 debe ser idéntico al de Fase 1 (usando framer-motion/lucide-react), o mantener el estilo CSS puro de Fase 2 con un diseño adaptado?

Verification Plan
Automated Tests
Verificar que MOCK_PREGUNTA genera preguntas con respuestas matemáticamente correctas para cada módulo/nivel
Verificar que MOCK_RESULTADO valida correctamente contra la respuesta real
Build del frontend: npm run build en LogicaMath/frontend
Manual Verification
Probar "¿Cuánto es la mitad de 6?" → respuesta 3 → debe mostrar ¡Correcto!
Probar "¿Cuánto es el doble de 17?" → respuesta 34 → debe mostrar ¡Correcto!
Probar entrar a un nivel por primera vez → debe aparecer recuadro explicativo
Verificar que el teclado numérico funciona al hacer clic en los números
Comparar visualmente con Fase 1 para confirmar consistencia UX
Git
Commit y push de todos los cambios al repositorio
NO se hará migración directa a la base de datos
Los archivos de seed se actualizarán para que el técnico los ejecute manualmente