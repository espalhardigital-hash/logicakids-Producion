/**
 * faseMetadata.ts
 * ─────────────────────────────────────────────────────────────
 * Base de datos estática con los metadatos enriquecidos de las
 * Fases 3 a 8 de LogicaKids.
 *
 * Cada fase contiene módulos → niveles → teoría + preguntas de muestra.
 */

// ── Tipos ──────────────────────────────────────────────────────

export interface FasePregunta {
  id: number;
  enunciado: string;
  tipo: 'numerico' | 'opcion_multiple';
  opciones?: string[];
  respuesta_correcta: string;
  datos_numericos?: any; // To hold visual metadata
}

export interface FaseTeoria {
  titulo: string;
  parrafos: string[];
  diccionario?: Record<string, string>;
  ejemplos?: Array<{ 
    enunciado: string; 
    pasos?: Array<{ orden: number; texto: string }>;
    respuesta?: string;
  }>;
  interactivos?: Array<{
    enunciado?: string;
    pregunta?: string; // Legacy / Fallback
    pasos?: Array<{ orden: number; texto: string }>;
    respuesta: string;
    feedback_acierto: string;
    feedback_error: string;
  }>;
  tip_pedagogico?: string;
}

export interface FaseNivel {
  nivelId: number;
  nombre: string;
  descripcion: string;
  teoria: FaseTeoria;
  preguntas: FasePregunta[];
}

export interface FaseModulo {
  moduloId: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  niveles: FaseNivel[];
}

export interface FaseMetadata {
  faseId: number;
  nombre: string;
  emoji: string;
  descripcion: string;
  colorPrimario: string;
  colorSecundario: string;
  modulos: FaseModulo[];
}

// ── Helpers ────────────────────────────────────────────────────

let _qid = 0;
const qid = () => ++_qid;

// Helpers para Mocks eliminados de Fase 7 y 8 ya que ahora usan PostgreSQL
const generateFase7Questions = (a: number, b: number) => [];
const generateFase8Questions = (a: number, b: number, c?: number) => [];

// ── FASE 3: Problemas de Texto ─────────────────────────────────

const FASE_3: FaseMetadata = {
  faseId: 3,
  nombre: 'Problemas de Texto',
  emoji: '📖',
  descripcion: 'Aprende a leer, interpretar y estructurar datos para resolver problemas matemáticos.',
  colorPrimario: '#F97316',
  colorSecundario: '#EA580C',
  modulos: [
    {
      moduloId: 1,
      nombre: 'Lectura Matemática',
      descripcion: 'Identifica los datos numéricos clave dentro de un enunciado.',
      icono: 'book',
      color: '#F97316',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Subraya los números y la pregunta.',
          teoria: {
            titulo: 'Leer un Problema Matemático',
            parrafos: ['El primer paso es encontrar los números y entender qué te piden.', 'Lee dos veces: la primera para entender la historia, la segunda para encontrar los datos.'],
            ejemplos: [{ enunciado: 'Ana tiene 12 manzanas y le dan 5 más. ¿Cuántas tiene?', respuesta: 'Datos: 12 y 5. Pregunta: ¿cuántas tiene? → 12 + 5 = 17' }],
            tip_pedagogico: 'Siempre subraya los números y rodea la pregunta.'
          },
          preguntas: [
            { id: qid(), enunciado: 'Pedro tiene 8 caramelos. Su mamá le da 7 más. ¿Cuántos caramelos tiene Pedro ahora?', tipo: 'numerico', respuesta_correcta: '15' },
            { id: qid(), enunciado: 'En una caja hay 20 lápices. Se sacan 6. ¿Cuántos lápices quedan?', tipo: 'numerico', respuesta_correcta: '14' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Problemas con dos operaciones.',
          teoria: {
            titulo: 'Problemas de Dos Pasos',
            parrafos: ['Algunos problemas requieren dos operaciones.', 'Resuelve paso a paso: primero una operación, luego la otra.'],
            ejemplos: [{ enunciado: 'Compré 3 paquetes de 4 galletas y comí 2.', respuesta: '3 × 4 = 12, luego 12 − 2 = 10 galletas.' }],
            tip_pedagogico: 'Escribe cada paso en una línea diferente.'
          },
          preguntas: [
            { id: qid(), enunciado: 'María compró 5 paquetes con 6 stickers cada uno. Regaló 8 stickers. ¿Cuántos le quedan?', tipo: 'numerico', respuesta_correcta: '22' },
            { id: qid(), enunciado: 'Un bus tenía 30 pasajeros. En la primera parada bajaron 12 y subieron 5. ¿Cuántos hay ahora?', tipo: 'numerico', respuesta_correcta: '23' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Problemas con información distractora.',
          teoria: {
            titulo: 'Filtrar la Información',
            parrafos: ['En la vida real, los problemas tienen datos que NO necesitas.', 'Aprende a separar lo importante de lo irrelevante.'],
            ejemplos: [{ enunciado: 'Lucas tiene 10 años, 3 hermanos y 15 figuritas. Perdió 4 figuritas. ¿Cuántas le quedan?', respuesta: 'La edad y los hermanos no importan. 15 − 4 = 11.' }],
            tip_pedagogico: 'Tacha los datos que no se relacionan con la pregunta.'
          },
          preguntas: [
            { id: qid(), enunciado: 'Sara tiene 12 años, mide 1,45 m y tiene 24 libros. Prestó 7 libros. ¿Cuántos libros tiene ahora?', tipo: 'numerico', respuesta_correcta: '17' },
            { id: qid(), enunciado: 'En una granja hay 15 vacas, 8 gallinas y 3 perros. Las vacas producen 5 litros de leche cada una al día. ¿Cuántos litros de leche se producen?', tipo: 'numerico', respuesta_correcta: '75' },
          ]
        }
      ]
    },
    {
      moduloId: 2,
      nombre: 'Extracción de Datos',
      descripcion: 'Organiza datos de tablas y listas para resolver problemas.',
      icono: 'table',
      color: '#FB923C',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Leer tablas simples.',
          teoria: { titulo: 'Leer una Tabla', parrafos: ['Una tabla organiza información en filas y columnas.', 'Busca la fila correcta y la columna que te piden.'], tip_pedagogico: 'Usa el dedo para seguir la fila y la columna.' },
          preguntas: [
            { id: qid(), enunciado: 'La tabla muestra: Lunes=5 libros, Martes=8 libros, Miércoles=3 libros. ¿Cuántos libros se leyeron el martes?', tipo: 'numerico', respuesta_correcta: '8' },
            { id: qid(), enunciado: 'Ventas: Enero=120, Febrero=95, Marzo=110. ¿En cuál mes se vendió menos?', tipo: 'opcion_multiple', opciones: ['Enero', 'Febrero', 'Marzo'], respuesta_correcta: 'Febrero' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Comparar datos entre filas.',
          teoria: { titulo: 'Comparar en Tablas', parrafos: ['A veces necesitas restar dos valores de la tabla para compararlos.'], tip_pedagogico: 'Anota los valores que necesitas antes de operar.' },
          preguntas: [
            { id: qid(), enunciado: 'Turma A: 32 alumnos. Turma B: 28 alumnos. ¿Cuántos alumnos más tiene la Turma A?', tipo: 'numerico', respuesta_correcta: '4' },
            { id: qid(), enunciado: 'Tabla de goles: Equipo X=14, Equipo Y=9. ¿Cuál es la diferencia de goles?', tipo: 'numerico', respuesta_correcta: '5' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Operar con múltiples datos de tabla.',
          teoria: { titulo: 'Cálculos con Tablas', parrafos: ['Combina suma, resta o multiplicación con datos de la tabla.'], tip_pedagogico: 'Extrae todos los datos antes de calcular.' },
          preguntas: [
            { id: qid(), enunciado: 'Precios: Manzana=R$2, Banana=R$1, Uva=R$5. Compré 3 manzanas y 2 bananas. ¿Cuánto gasté?', tipo: 'numerico', respuesta_correcta: '8' },
            { id: qid(), enunciado: 'Puntaje semanal: Lun=10, Mar=15, Mié=12, Jue=8, Vie=20. ¿Cuál es el total de la semana?', tipo: 'numerico', respuesta_correcta: '65' },
          ]
        }
      ]
    },
    {
      moduloId: 3,
      nombre: 'Enigmas Numéricos',
      descripcion: 'Descubre el número desconocido usando pistas del problema.',
      icono: 'puzzle',
      color: '#E11D48',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Encontrar el número faltante en sumas.',
          teoria: { titulo: 'El Número Misterioso', parrafos: ['Si ___ + 5 = 12, entonces ___ = 12 − 5 = 7.', 'Usa la operación inversa para descubrirlo.'], ejemplos: [{ enunciado: '___ + 8 = 15', respuesta: '15 − 8 = 7' }], tip_pedagogico: 'La resta es la operación inversa de la suma.' },
          preguntas: [
            { id: qid(), enunciado: 'Pensé en un número, le sumé 9 y obtuve 21. ¿En qué número pensé?', tipo: 'numerico', respuesta_correcta: '12' },
            { id: qid(), enunciado: '___ + 14 = 30. ¿Cuál es el número?', tipo: 'numerico', respuesta_correcta: '16' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Encontrar el número faltante en multiplicaciones.',
          teoria: { titulo: 'Inversa de la Multiplicación', parrafos: ['Si ___ × 4 = 28, entonces ___ = 28 ÷ 4 = 7.'], tip_pedagogico: 'La división es la inversa de la multiplicación.' },
          preguntas: [
            { id: qid(), enunciado: 'Un número multiplicado por 6 da 42. ¿Cuál es ese número?', tipo: 'numerico', respuesta_correcta: '7' },
            { id: qid(), enunciado: 'Repartí caramelos en partes iguales entre 5 amigos. Cada uno recibió 8. ¿Cuántos caramelos tenía?', tipo: 'numerico', respuesta_correcta: '40' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Problemas con dos incógnitas relacionadas.',
          teoria: { titulo: 'Relaciones entre Números', parrafos: ['A veces un problema tiene dos valores desconocidos, pero uno depende del otro.', 'Ejemplo: "El doble de un número más 3 es 15".'], tip_pedagogico: 'Escribe la relación como una ecuación simple.' },
          preguntas: [
            { id: qid(), enunciado: 'El doble de un número es 18. ¿Cuál es ese número?', tipo: 'numerico', respuesta_correcta: '9' },
            { id: qid(), enunciado: 'Tres veces un número menos 5 da 16. ¿Cuál es el número?', tipo: 'numerico', respuesta_correcta: '7' },
          ]
        }
      ]
    },
    {
      moduloId: 4,
      nombre: 'Historias con Contexto',
      descripcion: 'Resuelve problemas ambientados en situaciones cotidianas.',
      icono: 'globe',
      color: '#0EA5E9',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Compras y dinero.',
          teoria: { titulo: 'Matemáticas en la Tienda', parrafos: ['Comprar requiere sumar precios y calcular cambio.'], tip_pedagogico: 'Organiza: ¿cuánto cuesta? ¿cuánto pagué? ¿cuánto recibo de cambio?' },
          preguntas: [
            { id: qid(), enunciado: 'Un cuaderno cuesta R$12 y un lápiz R$3. Pagué con R$20. ¿Cuánto recibo de cambio?', tipo: 'numerico', respuesta_correcta: '5' },
            { id: qid(), enunciado: 'Compré 4 jugos a R$3 cada uno. ¿Cuánto gasté en total?', tipo: 'numerico', respuesta_correcta: '12' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Tiempo y distancias.',
          teoria: { titulo: 'Tiempo y Recorridos', parrafos: ['Los problemas de tiempo usan horas y minutos.', 'Los de distancia pueden usar metros o kilómetros.'], tip_pedagogico: 'Dibuja una línea de tiempo para organizar los eventos.' },
          preguntas: [
            { id: qid(), enunciado: 'La clase empieza a la hora marcada en el reloj y dura exactamente 45 minutos. ¿A qué hora termina?', tipo: 'opcion_multiple', opciones: ['8:50', '9:00', '9:15'], respuesta_correcta: '9:00', datos_numericos: { tipo_visual: 'reloj', hora: '08:15' } },
            { id: qid(), enunciado: 'Caminé 800 metros de ida y 800 de vuelta. ¿Cuántos metros recorrí en total?', tipo: 'numerico', respuesta_correcta: '1600' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Problemas multietapa de la vida real.',
          teoria: { titulo: 'Problemas Complejos', parrafos: ['Algunos problemas del mundo real necesitan 3 o más pasos.', 'Planifica antes de calcular.'], tip_pedagogico: 'Numera los pasos: Paso 1, Paso 2, Paso 3...' },
          preguntas: [
            { id: qid(), enunciado: 'Tenía R$50. Compré 2 libros de R$12 cada uno y un lápiz de R$4. ¿Cuánto me queda?', tipo: 'numerico', respuesta_correcta: '22' },
            { id: qid(), enunciado: 'Una excursión cuesta R$15 por alumno. Son 3 turmas de 10 alumnos. ¿Cuánto cuesta en total?', tipo: 'numerico', respuesta_correcta: '450' },
          ]
        }
      ]
    }
  ]
};

// ── FASE 4: Fracciones, Porcentajes y Proporciones ──────────────

const FASE_4: FaseMetadata = {
  faseId: 4,
  nombre: 'Fracciones, Porcentajes y Proporciones',
  emoji: '🍕',
  descripcion: 'Visualiza la relación "parte-todo" con fracciones, porcentajes y gráficos.',
  colorPrimario: '#A855F7',
  colorSecundario: '#9333EA',
  modulos: [
    {
      moduloId: 1, nombre: 'La Fracción Visual', descripcion: 'Identifica y compara fracciones en figuras geométricas.', icono: 'pie', color: '#A855F7',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Identificar la fracción sombreada en figuras simétricas simples.',
          teoria: { titulo: 'La Fracción Sombreada', parrafos: ['Una fracción representa una parte de un todo.', 'Si un cuadrado está dividido en 4 partes iguales y 1 está pintada, la fracción es 1/4.'], ejemplos: [{ enunciado: 'Círculo dividido en 3 partes, 2 pintadas', respuesta: '2/3' }], tip_pedagogico: 'Cuenta el total de partes (denominador) y las pintadas (numerador).' },
          preguntas: [
            { id: qid(), enunciado: 'Un rectángulo está dividido en 6 partes iguales. 2 están sombreadas. ¿Qué fracción está sombreada?', tipo: 'opcion_multiple', opciones: ['1/3', '2/6', '2/3', '1/6'], respuesta_correcta: '2/6' },
            { id: qid(), enunciado: 'Un círculo dividido en 8 partes iguales tiene 3 pintadas. ¿Qué fracción está pintada?', tipo: 'opcion_multiple', opciones: ['3/8', '5/8', '3/5', '8/3'], respuesta_correcta: '3/8' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Fracciones equivalentes visuales.',
          teoria: { titulo: 'Fracciones Equivalentes', parrafos: ['2/4 es lo mismo que 1/2: representan la misma cantidad.', 'Si cortas cada parte en 2, el numerador y denominador se multiplican por 2.'], ejemplos: [{ enunciado: '1/2 = 2/4 = 4/8', respuesta: 'Todas representan la mitad.' }], tip_pedagogico: 'Multiplica arriba y abajo por el mismo número.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuál fracción es equivalente a 1/3?', tipo: 'opcion_multiple', opciones: ['2/6', '2/3', '3/6', '1/6'], respuesta_correcta: '2/6' },
            { id: qid(), enunciado: '¿Cuál fracción es equivalente a 3/4?', tipo: 'opcion_multiple', opciones: ['6/8', '4/6', '3/8', '9/16'], respuesta_correcta: '6/8' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Analizar rectángulos divididos asimétricamente.',
          teoria: { titulo: 'Divisiones No Iguales', parrafos: ['A veces la figura NO está dividida en partes iguales.', 'Debes verificar que las partes sean del mismo tamaño antes de contar.'], tip_pedagogico: 'Si las partes no son iguales, reorganiza mentalmente la figura.' },
          preguntas: [
            { id: qid(), enunciado: 'Un cuadrado está dividido en 4 partes, pero 2 son más grandes que las otras. ¿Se puede decir que cada parte es 1/4?', tipo: 'opcion_multiple', opciones: ['No, porque las partes no son iguales', 'Sí, siempre', 'Solo si están pintadas'], respuesta_correcta: 'No, porque las partes no son iguales' },
            { id: qid(), enunciado: 'Un rectángulo se dividió en 2 triángulos iguales con una diagonal. ¿Qué fracción representa cada triángulo?', tipo: 'opcion_multiple', opciones: ['1/2', '1/4', '1/3', '2/4'], respuesta_correcta: '1/2' },
          ]
        }
      ]
    },
    {
      moduloId: 2, nombre: 'Fracción de Cantidad', descripcion: 'Calcula fracciones de números enteros.', icono: 'divide', color: '#C084FC',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Calcular 1/2, 1/3 y 1/4 de números enteros.',
          teoria: { titulo: 'La Fracción como División', parrafos: ['1/2 de 10 = 10 ÷ 2 = 5.', '1/3 de 12 = 12 ÷ 3 = 4.', 'El denominador te dice en cuántas partes dividir.'], tip_pedagogico: 'Fracción de un número = número ÷ denominador × numerador.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuánto es 1/4 de 20?', tipo: 'numerico', respuesta_correcta: '5' },
            { id: qid(), enunciado: '¿Cuánto es 1/3 de 15?', tipo: 'numerico', respuesta_correcta: '5' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Fracciones compuestas (ej. 3/4 de 120).',
          teoria: { titulo: 'Fracciones Compuestas', parrafos: ['Para calcular 3/4 de un número: divide por 4, multiplica por 3.', 'Ejemplo: 3/4 de 120 → 120 ÷ 4 = 30 → 30 × 3 = 90.'], tip_pedagogico: 'Primero divide, después multiplica.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuánto es 3/4 de 80?', tipo: 'numerico', respuesta_correcta: '60' },
            { id: qid(), enunciado: 'En una clase de 30 alumnos, 2/3 son niñas. ¿Cuántas niñas hay?', tipo: 'numerico', respuesta_correcta: '20' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Resolver historias con "la fracción del resto".',
          teoria: { titulo: 'Fracción del Resto', parrafos: ['A veces te piden la fracción de lo que sobra.', 'Ejemplo: De 24 bombones, comí 1/3. Del resto, regalé 1/2.'], tip_pedagogico: 'Calcula lo que sobra primero, luego aplica la nueva fracción.' },
          preguntas: [
            { id: qid(), enunciado: 'De 30 figuritas, regalé 1/3. Del resto, perdí la mitad. ¿Cuántas me quedan?', tipo: 'numerico', respuesta_correcta: '10' },
            { id: qid(), enunciado: 'Tenía 40 chocolates. Comí 1/4 y regalé 1/2 del resto. ¿Cuántos quedaron?', tipo: 'numerico', respuesta_correcta: '15' },
          ]
        }
      ]
    },
    {
      moduloId: 3, nombre: 'Porcentajes Rápidos', descripcion: 'Relaciona porcentajes comunes con fracciones.', icono: 'percent', color: '#7C3AED',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Relacionar 50%, 25% y 10%.',
          teoria: { titulo: 'Porcentajes Básicos', parrafos: ['50% = la mitad, 25% = un cuarto, 10% = una décima parte.', '50% de 60 = 30. 25% de 80 = 20. 10% de 200 = 20.'], tip_pedagogico: '50% → divide por 2. 25% → divide por 4. 10% → divide por 10.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuánto es el 50% de 120?', tipo: 'numerico', respuesta_correcta: '60' },
            { id: qid(), enunciado: '¿Cuánto es el 10% de 350?', tipo: 'numerico', respuesta_correcta: '35' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Extraer datos de gráficos circulares.',
          teoria: { titulo: 'Gráficos Circulares (Pie Chart)', parrafos: ['Un gráfico circular muestra porcentajes como porciones de un pastel.', 'La suma siempre es 100%.'], tip_pedagogico: 'Si una porción dice 30%, significa 30 de cada 100.' },
          preguntas: [
            { id: qid(), enunciado: 'En un gráfico circular, el 40% prefiere fútbol, el 35% básquet y el resto vóley. ¿Qué porcentaje prefiere vóley?', tipo: 'numerico', respuesta_correcta: '25' },
            { id: qid(), enunciado: 'De 200 alumnos encuestados, el 25% prefiere matemáticas. ¿Cuántos alumnos son?', tipo: 'numerico', respuesta_correcta: '50' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Gráficos de barras comparativos.',
          teoria: { titulo: 'Lectura de Gráficos de Barras', parrafos: ['Las barras muestran cantidades. La más alta = la mayor cantidad.', 'Para comparar, fíjate en la diferencia de alturas.'], tip_pedagogico: 'Lee siempre la escala del eje Y antes de responder.' },
          preguntas: [
            { id: qid(), enunciado: 'Un gráfico de barras muestra: Región A=450, Región B=320, Región C=530. ¿Cuántas empresas hay en total?', tipo: 'numerico', respuesta_correcta: '1300' },
            { id: qid(), enunciado: '¿Cuántas empresas más tiene la Región C que la Región B?', tipo: 'numerico', respuesta_correcta: '210' },
          ]
        }
      ]
    },
    {
      moduloId: 4, nombre: 'Razón y Mezclas', descripcion: 'Proporciones y repartos en contextos cotidianos.', icono: 'beaker', color: '#6D28D9',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Proporciones simples.',
          teoria: { titulo: 'Proporciones', parrafos: ['Una proporción es una relación entre dos cantidades.', '"2 tazas de agua por 1 de arroz" significa que siempre mantienes esa proporción.'], tip_pedagogico: 'Multiplica ambas partes por el mismo número para escalar.' },
          preguntas: [
            { id: qid(), enunciado: 'Para hacer jugo necesitas 2 vasos de agua por cada 1 de concentrado. Si usas 3 vasos de concentrado, ¿cuántos de agua necesitas?', tipo: 'numerico', respuesta_correcta: '6' },
            { id: qid(), enunciado: 'Una receta lleva 3 huevos por cada 2 tazas de harina. Si uso 6 tazas de harina, ¿cuántos huevos necesito?', tipo: 'numerico', respuesta_correcta: '9' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Escalar mezclas totales.',
          teoria: { titulo: 'Mezclas a Escala', parrafos: ['Si una mezcla tiene 2 partes azul y 3 partes rojo (5 partes total), para hacer 70 litros:', '70 ÷ 5 = 14 litros por parte. Azul = 2 × 14 = 28L. Rojo = 3 × 14 = 42L.'], tip_pedagogico: 'Suma las partes para saber el total, luego divide.' },
          preguntas: [
            { id: qid(), enunciado: 'Una pintura mezcla 2 partes de azul y 3 de blanco. Para hacer 50 litros, ¿cuántos litros de azul necesitas?', tipo: 'numerico', respuesta_correcta: '20' },
            { id: qid(), enunciado: 'Una limonada lleva 1 parte de limón y 4 de agua. Para 25 vasos, ¿cuántos vasos son de limón?', tipo: 'numerico', respuesta_correcta: '5' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Reparto proporcional en contextos cotidianos.',
          teoria: { titulo: 'Reparto Proporcional', parrafos: ['Repartir proporcionalmente significa dar a cada uno según su parte.', 'Ejemplo: repartir R$100 entre Ana (2 partes) y Beto (3 partes).'], tip_pedagogico: 'Total de partes = 2+3 = 5. Cada parte = 100÷5 = 20. Ana=40, Beto=60.' },
          preguntas: [
            { id: qid(), enunciado: 'Se reparten R$90 entre dos amigos en proporción 1:2. ¿Cuánto recibe el que tiene la porción mayor?', tipo: 'numerico', respuesta_correcta: '60' },
            { id: qid(), enunciado: 'Tres hermanos reparten 60 dulces en proporción 1:2:3. ¿Cuántos recibe el mayor?', tipo: 'numerico', respuesta_correcta: '30' },
          ]
        }
      ]
    }
  ]
};

// ── FASE 5: Geometría Plana y Medidas ───────────────────────────

const FASE_5: FaseMetadata = {
  faseId: 5,
  nombre: 'Geometría Plana y Medidas',
  emoji: '📐',
  descripcion: 'Domina la cuadrícula, áreas compuestas, perímetros y escalas.',
  colorPrimario: '#F43F5E',
  colorSecundario: '#E11D48',
  modulos: [
    {
      moduloId: 1, nombre: 'Perímetro y Borde', descripcion: 'Calcula el contorno de figuras geométricas.', icono: 'border', color: '#F43F5E',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Contar el contorno exterior en mallas cuadradas.',
          teoria: { titulo: '¿Qué es el Perímetro?', parrafos: ['El perímetro es la suma de todos los lados de una figura.', 'En una cuadrícula, cuenta los bordes exteriores.'], ejemplos: [{ enunciado: 'Cuadrado de 4 cm de lado', respuesta: 'P = 4 + 4 + 4 + 4 = 16 cm' }], tip_pedagogico: 'Recorre el borde con el dedo y cuenta cada segmento.' },
          preguntas: [
            { id: qid(), enunciado: 'Un cuadrado tiene lados de 5 cm. ¿Cuál es su perímetro?', tipo: 'numerico', respuesta_correcta: '20' },
            { id: qid(), enunciado: 'Un rectángulo mide 8 cm de largo y 3 cm de ancho. ¿Cuál es su perímetro?', tipo: 'numerico', respuesta_correcta: '22' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Perímetro de polígonos irregulares.',
          teoria: { titulo: 'Polígonos Irregulares', parrafos: ['Los polígonos irregulares tienen lados de diferentes medidas.', 'Suma todos los lados, uno por uno.'], tip_pedagogico: 'Numera cada lado para no olvidar ninguno.' },
          preguntas: [
            { id: qid(), enunciado: 'Un polígono tiene lados de 3, 5, 4 y 6 cm. ¿Cuál es su perímetro?', tipo: 'numerico', respuesta_correcta: '18' },
            { id: qid(), enunciado: 'Una figura en forma de L tiene lados de 2, 4, 2, 2, 4 y 6 cm. ¿Cuál es su perímetro?', tipo: 'numerico', respuesta_correcta: '20' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Conversión lineal básica.',
          teoria: { titulo: 'Conversión de Unidades', parrafos: ['1 m = 100 cm. 1 dm = 10 cm.', '2,68 dm = 26,8 cm.'], tip_pedagogico: 'Para pasar dm a cm, multiplica por 10.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuántos centímetros hay en 3,5 dm?', tipo: 'numerico', respuesta_correcta: '35' },
            { id: qid(), enunciado: 'Un teclado mide 2,68 dm de largo. ¿Cuántos cm son?', tipo: 'opcion_multiple', opciones: ['2,68 cm', '26,8 cm', '268 cm'], respuesta_correcta: '26,8 cm' },
          ]
        }
      ]
    },
    {
      moduloId: 2, nombre: 'Área en Cuadrícula', descripcion: 'Cuenta cuadraditos para medir el área.', icono: 'grid', color: '#FB7185',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Contar cuadraditos completos.',
          teoria: { titulo: 'Área = Cuadraditos', parrafos: ['El área de una figura es la cantidad de cuadraditos que caben dentro.', 'Cada cuadradito = 1 unidad de área.'], tip_pedagogico: 'Marca los cuadraditos ya contados con un punto.' },
          preguntas: [
            { id: qid(), enunciado: 'Un rectángulo tiene 4 cuadraditos de largo y 3 de ancho. ¿Cuál es su área?', tipo: 'numerico', respuesta_correcta: '12' },
            { id: qid(), enunciado: 'Un cuadrado tiene 5 cuadraditos de lado. ¿Cuál es su área?', tipo: 'numerico', respuesta_correcta: '25' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Unir medios cuadrados (triángulos) para formar unidades.',
          teoria: { titulo: 'Triángulos = Medio Cuadrado', parrafos: ['Un triángulo que ocupa medio cuadradito vale 0,5 unidades de área.', 'Dos medios triángulos = 1 cuadradito completo.'], tip_pedagogico: 'Cuenta los triángulos de a pares para formar cuadrados.' },
          preguntas: [
            { id: qid(), enunciado: 'Una figura tiene 6 cuadraditos completos y 4 triángulos (medios cuadrados). ¿Cuál es su área total?', tipo: 'numerico', respuesta_correcta: '8' },
            { id: qid(), enunciado: 'Un triángulo ocupa la mitad de un cuadrado de 4×4. ¿Cuál es el área del triángulo?', tipo: 'numerico', respuesta_correcta: '8' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Área de figuras complejas.',
          teoria: { titulo: 'Figuras Complejas', parrafos: ['Divide la figura compleja en rectángulos simples y suma sus áreas.', 'O calcula el rectángulo grande y resta el hueco.'], tip_pedagogico: 'Colorea las partes para no confundirte.' },
          preguntas: [
            { id: qid(), enunciado: 'Una bandera tiene forma de L: parte izquierda 3×5 y parte inferior 2×4. ¿Cuál es el área total?', tipo: 'numerico', respuesta_correcta: '23' },
            { id: qid(), enunciado: 'Un rectángulo de 6×4 tiene un cuadrado de 2×2 recortado adentro. ¿Cuál es el área resultante?', tipo: 'numerico', respuesta_correcta: '20' },
          ]
        }
      ]
    },
    {
      moduloId: 3, nombre: 'Figuras Compuestas', descripcion: 'Rompecabezas geométricos y Tangram.', icono: 'shapes', color: '#E11D48',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Rompecabezas geométricos: encajar piezas.',
          teoria: { titulo: 'Encajar Figuras', parrafos: ['Un Tangram tiene 7 piezas que forman un cuadrado.', 'Cada pieza tiene un área proporcional al total.'], tip_pedagogico: 'Las piezas grandes valen más área que las pequeñas.' },
          preguntas: [
            { id: qid(), enunciado: 'Un Tangram cuadrado tiene 16 cm² de área. Si el triángulo grande ocupa 1/4 del total, ¿cuánto mide su área?', tipo: 'numerico', respuesta_correcta: '4' },
            { id: qid(), enunciado: '¿Cuántos triángulos pequeños iguales se necesitan para cubrir un cuadrado de 4 cm²?', tipo: 'opcion_multiple', opciones: ['2', '4', '8'], respuesta_correcta: '2' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Área proporcional en un Tangram.',
          teoria: { titulo: 'Proporciones en el Tangram', parrafos: ['El triángulo mediano del Tangram es 1/2 del grande.', 'El cuadrado pequeño es 1/4 del grande.'], tip_pedagogico: 'Compara cada pieza con la mayor para encontrar proporciones.' },
          preguntas: [
            { id: qid(), enunciado: 'El Tangram completo tiene área 64 cm². El triángulo mediano ocupa 1/8 del total. ¿Cuál es su área?', tipo: 'numerico', respuesta_correcta: '8' },
            { id: qid(), enunciado: 'Si el paralelogramo del Tangram tiene la misma área que el cuadrado (4 cm²), ¿cuánto suman juntos?', tipo: 'numerico', respuesta_correcta: '8' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Restar el área interior de una figura exterior.',
          teoria: { titulo: 'Área = Grande − Hueco', parrafos: ['Para una figura con agujero: área total = área exterior − área del agujero.'], tip_pedagogico: 'Calcula cada área por separado, luego resta.' },
          preguntas: [
            { id: qid(), enunciado: 'Un marco cuadrado exterior mide 10×10 y el hueco interior mide 6×6. ¿Cuál es el área del marco?', tipo: 'numerico', respuesta_correcta: '64' },
            { id: qid(), enunciado: 'Un anillo circular tiene área exterior 50 cm² y área del agujero 20 cm². ¿Cuánto mide el anillo?', tipo: 'numerico', respuesta_correcta: '30' },
          ]
        }
      ]
    },
    {
      moduloId: 4, nombre: 'Conversión y Pantallas', descripcion: 'Unidades de medida y área en la vida real.', icono: 'monitor', color: '#BE123C',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Noción de área real vs área dibujada.',
          teoria: { titulo: 'Escala: del Dibujo a la Realidad', parrafos: ['Un dibujo puede representar algo mucho más grande.', 'Si 1 cm en el mapa = 10 m en la realidad, 3 cm = 30 m.'], tip_pedagogico: 'Multiplica la medida del dibujo por la escala.' },
          preguntas: [
            { id: qid(), enunciado: 'En un plano, 1 cm = 5 m. Un salón mide 4 cm en el plano. ¿Cuánto mide en la realidad?', tipo: 'numerico', respuesta_correcta: '20' },
            { id: qid(), enunciado: 'En un mapa, 2 cm representan 100 km. ¿Cuántos km representan 5 cm?', tipo: 'numerico', respuesta_correcta: '250' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'La diagonal como medida estándar (pulgadas de TV).',
          teoria: { titulo: 'Pulgadas y Pantallas', parrafos: ['Los televisores se miden por su diagonal.', '1 pulgada ≈ 2,54 cm.'], tip_pedagogico: 'La diagonal no es el ancho ni el alto, es la línea que cruza esquina a esquina.' },
          preguntas: [
            { id: qid(), enunciado: 'Un TV de 40 pulgadas tiene una diagonal de aproximadamente cuántos cm? (1 pulgada = 2,5 cm)', tipo: 'numerico', respuesta_correcta: '100' },
            { id: qid(), enunciado: '¿Qué medida de una pantalla indica su tamaño?', tipo: 'opcion_multiple', opciones: ['El ancho', 'La diagonal', 'El alto', 'El perímetro'], respuesta_correcta: 'La diagonal' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Unidades cuadradas cotidianas (cm², m²).',
          teoria: { titulo: 'Unidades de Área', parrafos: ['El cm² es un cuadradito de 1 cm de lado.', 'El m² es un cuadrado de 1 m de lado = 10000 cm².'], tip_pedagogico: 'Para convertir m² a cm², multiplica por 10000.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuántos cm² tiene un cuadrado de 3 cm de lado?', tipo: 'numerico', respuesta_correcta: '9' },
            { id: qid(), enunciado: 'Una habitación mide 4 m × 3 m. ¿Cuál es su área en m²?', tipo: 'numerico', respuesta_correcta: '12' },
          ]
        }
      ]
    }
  ]
};

// ── FASE 6: Geometría Espacial y Volumen ────────────────────────

const FASE_6: FaseMetadata = {
  faseId: 6,
  nombre: 'Geometría Espacial y Volumen',
  emoji: '🧊',
  descripcion: 'Desarrolla la visualización 3D y el volumen mediante cubos unitarios estilo Minecraft.',
  colorPrimario: '#6366F1',
  colorSecundario: '#4F46E5',
  modulos: [
    {
      moduloId: 1, nombre: 'Reconocimiento 3D', descripcion: 'Diferencia sólidos geométricos y sus propiedades.', icono: 'cube', color: '#6366F1',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Diferenciar prismas, pirámides, cilindros y esferas.',
          teoria: { titulo: 'Sólidos Geométricos', parrafos: ['Un prisma tiene dos bases iguales y caras laterales rectangulares.', 'Una pirámide tiene una base y caras triangulares que se unen en un vértice.', 'El cilindro tiene dos bases circulares. La esfera no tiene caras.'], tip_pedagogico: 'Los prismas ruedan si los acuestas, las pirámides no.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuántas caras tiene un cubo?', tipo: 'numerico', respuesta_correcta: '6' },
            { id: qid(), enunciado: '¿Cuál sólido tiene solo 1 vértice?', tipo: 'opcion_multiple', opciones: ['Pirámide de base cuadrada', 'Cono', 'Cilindro', 'Cubo'], respuesta_correcta: 'Cono' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Identificar caras ocultas de un sólido.',
          teoria: { titulo: 'Caras Ocultas', parrafos: ['Cuando un sólido está apoyado en el suelo, no puedes ver la cara inferior.', 'Un cubo tiene 6 caras, pero solo ves 3 a la vez.'], tip_pedagogico: 'Imagina levantar el objeto para ver debajo.' },
          preguntas: [
            { id: qid(), enunciado: 'Un cubo apoyado en una mesa muestra 5 caras visibles. ¿Cuántas están ocultas?', tipo: 'numerico', respuesta_correcta: '1' },
            { id: qid(), enunciado: 'Una pirámide de base cuadrada apoyada en el piso muestra 4 caras. ¿Cuántas tiene en total?', tipo: 'numerico', respuesta_correcta: '5' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Asociar moldes bidimensionales con su sólido.',
          teoria: { titulo: 'Planificaciones (Moldes)', parrafos: ['La planificación es como "abrir" un sólido y aplastarlo.', 'Un cubo se abre en 6 cuadrados conectados en forma de cruz.'], tip_pedagogico: 'Dobla mentalmente el molde para verificar si forma el sólido.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuántos cuadrados tiene la planificación de un cubo?', tipo: 'numerico', respuesta_correcta: '6' },
            { id: qid(), enunciado: 'Una planificación con 1 cuadrado y 4 triángulos forma...', tipo: 'opcion_multiple', opciones: ['Un cubo', 'Una pirámide de base cuadrada', 'Un cilindro'], respuesta_correcta: 'Una pirámide de base cuadrada' },
          ]
        }
      ]
    },
    {
      moduloId: 2, nombre: 'Patrones de Crecimiento', descripcion: 'Progresiones espaciales contando bloques.', icono: 'layers', color: '#818CF8',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Sumar capas base a una pirámide.',
          teoria: { titulo: 'Patrones en 3D', parrafos: ['Cada nivel de una pirámide de bloques tiene más cubos que el anterior.', 'Ejemplo: nivel 1 = 1 cubo, nivel 2 = 4 cubos (2×2), nivel 3 = 9 cubos (3×3).'], tip_pedagogico: 'Dibuja cada capa vista desde arriba.' },
          preguntas: [
            { id: qid(), enunciado: 'Una pirámide de bloques tiene capas de 1, 4 y 9 cubos. ¿Cuántos cubos hay en total?', tipo: 'numerico', respuesta_correcta: '14' },
            { id: qid(), enunciado: 'Si la siguiente capa tiene 16 cubos (4×4), ¿cuántos cubos hay en las 4 capas?', tipo: 'numerico', respuesta_correcta: '30' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Contar bloques en estructuras simétricas (estilo Minecraft).',
          teoria: { titulo: 'Bloques Minecraft', parrafos: ['En Minecraft, las estructuras se hacen con cubos unitarios.', 'Para contar, cuenta cada fila y multiplica por las capas.'], tip_pedagogico: 'Cuenta capa por capa de abajo hacia arriba.' },
          preguntas: [
            { id: qid(), enunciado: 'Un árbol de bloques tiene base 3×3 (9 cubos) y tronco de 1×1×4 (4 cubos). ¿Cuántos cubos en total?', tipo: 'numerico', respuesta_correcta: '13' },
            { id: qid(), enunciado: 'Una escalera de 4 peldaños tiene 1, 2, 3 y 4 cubos de alto en cada columna. ¿Cuántos cubos en total?', tipo: 'numerico', respuesta_correcta: '10' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Predecir la cantidad de piezas de la etapa 10.',
          teoria: { titulo: 'Predicción de Patrones', parrafos: ['Si cada etapa suma una cantidad fija de cubos, puedes predecir el futuro.', 'Etapa 1 = 2, Etapa 2 = 5, Etapa 3 = 8 → patrón: +3 cada vez.'], tip_pedagogico: 'Busca la diferencia entre etapas consecutivas.' },
          preguntas: [
            { id: qid(), enunciado: 'Un patrón crece así: etapa 1=3, etapa 2=6, etapa 3=9. ¿Cuántos cubos en la etapa 5?', tipo: 'numerico', respuesta_correcta: '15' },
            { id: qid(), enunciado: 'Etapa 1=1, Etapa 2=4, Etapa 3=9, Etapa 4=16. ¿Cuántos cubos en la etapa 5?', tipo: 'numerico', respuesta_correcta: '25' },
          ]
        }
      ]
    },
    {
      moduloId: 3, nombre: 'Cubos Unitarios', descripcion: 'Calcula volúmenes contando cubos.', icono: 'box', color: '#4F46E5',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Contar cubos en bloques compactos regulares.',
          teoria: { titulo: 'Volumen = largo × ancho × alto', parrafos: ['El volumen de un bloque rectangular = largo × ancho × alto.', 'Cada cubo unitario = 1 unidad cúbica.'], ejemplos: [{ enunciado: 'Bloque 3×2×2', respuesta: '3 × 2 × 2 = 12 cubos' }], tip_pedagogico: 'Multiplica las tres dimensiones.' },
          preguntas: [
            { id: qid(), enunciado: 'Un bloque tiene 4 cubos de largo, 3 de ancho y 2 de alto. ¿Cuántos cubos tiene?', tipo: 'numerico', respuesta_correcta: '24' },
            { id: qid(), enunciado: 'Un cubo tiene 3 cubos unitarios de arista. ¿Cuántos cubitos lo forman?', tipo: 'numerico', respuesta_correcta: '27' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Cubos en figuras huecas o rompecabezas 3D.',
          teoria: { titulo: 'Figuras con Huecos', parrafos: ['Algunas figuras 3D tienen piezas faltantes.', 'Cuenta el bloque completo y resta los cubos que faltan.'], tip_pedagogico: 'Imagina que rellenas el hueco, cuenta el total y resta.' },
          preguntas: [
            { id: qid(), enunciado: 'Un bloque de 3×3×3 = 27 cubos tiene un hueco de 1 cubo en el centro. ¿Cuántos cubos quedan?', tipo: 'numerico', respuesta_correcta: '26' },
            { id: qid(), enunciado: 'Un bloque de 4×3×2 tiene una columna de 2 cubos removida. ¿Cuántos cubos quedan?', tipo: 'numerico', respuesta_correcta: '22' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Volumen de piezas encajadas (Tetris 3D).',
          teoria: { titulo: 'Piezas 3D Encajadas', parrafos: ['Para armar un cubo perfecto de 3×3×3, necesitas exactamente 27 cubos.', 'Si una pieza usa 5 cubos, necesitas más piezas para completar.'], tip_pedagogico: 'Cuenta cuántos cubos faltan: 27 − cubos usados = cubos faltantes.' },
          preguntas: [
            { id: qid(), enunciado: 'Un cubo perfecto de 3×3×3 necesita 27 cubitos. Ya se colocaron 19. ¿Cuántos faltan?', tipo: 'numerico', respuesta_correcta: '8' },
            { id: qid(), enunciado: 'Dos piezas en forma de L usan 4 cubos cada una. ¿Cuántos cubos suman?', tipo: 'numerico', respuesta_correcta: '8' },
          ]
        }
      ]
    }
  ]
};

// ── FASE 7: Coordenadas, Rutas y Tiempo ─────────────────────────

const FASE_7: FaseMetadata = {
  faseId: 7,
  nombre: 'Coordenadas, Rutas y Tiempo',
  emoji: '🗺️',
  descripcion: 'Interpreta mapas, trayectos cardinales y opera con unidades temporales.',
  colorPrimario: '#14B8A6',
  colorSecundario: '#0D9488',
  modulos: [
    {
      moduloId: 1, nombre: 'Orientación Cardinal', descripcion: 'Navega usando los puntos cardinales.', icono: 'compass', color: '#14B8A6',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Identificar Norte, Sur, Este y Oeste.',
          teoria: {
            titulo: 'Puntos Cardinales',
            parrafos: [
              '¡Bienvenido al Centro de Control de Navegación, Explorador Estelar!',
              'Antes de pilotar naves y trazar rutas por las calles, necesitas dominar el idioma universal de la orientación: los Puntos Cardinales.',
              'Son como las 4 flechas de tu mando de control: Norte (N) apunta siempre hacia arriba en un mapa, Sur (S) hacia abajo, Este (E) hacia la derecha y Oeste (O) hacia la izquierda.',
              'Cuando alguien te dice "camina 3 cuadras al Norte y luego 2 al Este", te está dando un vector de dirección: una flecha invisible que indica hacia dónde debes moverte y cuántas casillas debes avanzar.',
              'Además, existen los giros angulares: un giro de 90° es un cambio de dirección de esquina (como doblar en una calle), y un giro de 180° es darte media vuelta completa y caminar en la dirección contraria.'
            ],
            diccionario: {
              'Norte (N)': 'Arriba en el mapa. La flecha que apunta al cielo.',
              'Sur (S)': 'Abajo en el mapa. La flecha que apunta al suelo.',
              'Este (E / Leste)': 'Derecha en el mapa. Donde sale el sol.',
              'Oeste (O)': 'Izquierda en el mapa. Donde se pone el sol.',
              'Giro de 90°': 'Doblar en una esquina. Si ibas al Norte y giras 90° a la derecha, ahora vas al Este.',
              'Giro de 180°': 'Media vuelta. Si ibas al Norte, ahora vas al Sur.'
            },
            ejemplos: [
              {
                enunciado: 'Un explorador está en la posición (A,1) de una cuadrícula 5×5. Le dicen: "Avanza 3 casillas al Norte".',
                pasos: [
                  { orden: 1, texto: 'Norte = hacia arriba.' },
                  { orden: 2, texto: 'Desde (A,1), subo 3 posiciones: (A,2), (A,3), (A,4).' }
                ],
                respuesta: 'El explorador llega a la posición (A,4).'
              },
              {
                enunciado: 'Un robot mira al Norte. Le ordenan: "Gira 90° a la derecha".',
                pasos: [
                  { orden: 1, texto: 'Si miro al Norte y giro 90° a la derecha, termino mirando al Este.' }
                ],
                respuesta: 'El robot ahora mira al Este.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Si el cohete avanza 2 casillas al Norte y luego 1 al Oeste, ¿cuántas casillas se movió en total?',
                respuesta: '3',
                feedback_acierto: '¡Navegación perfecta! 2 al Norte + 1 al Oeste = 3 movimientos.',
                feedback_error: 'Cuenta cada casilla que recorres. Primero subes 2, luego vas 1 a la izquierda. Suma los movimientos.'
              },
              {
                enunciado: 'Un explorador mira al Este. Le dicen: "Gira 90° a la izquierda". ¿Hacia qué punto cardinal mira ahora?',
                respuesta: 'Norte',
                feedback_acierto: '¡Excelente! Desde el Este, girar 90° a la izquierda te lleva al Norte.',
                feedback_error: 'Imaginas la brújula: Este está a la derecha. Si giras a la izquierda desde ahí, apuntas hacia arriba = Norte.'
              }
            ],
            tip_pedagogico: 'Usa la palabra NOSE: Norte, Oeste, Sur, Este (en sentido antihorario). ¡Cuidado con la derecha del mapa!'
          },
          preguntas: [
            { id: qid(), enunciado: 'Si miro hacia el Norte y giro a la derecha, ¿hacia dónde miro?', tipo: 'opcion_multiple', opciones: ['Sur', 'Este', 'Oeste', 'Norte'], respuesta_correcta: 'Este' },
            { id: qid(), enunciado: '¿Cuál es el punto cardinal opuesto al Oeste?', tipo: 'opcion_multiple', opciones: ['Norte', 'Sur', 'Este'], respuesta_correcta: 'Este' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Seguir comandos de ruta en cuadrículas.',
          teoria: {
            titulo: 'Rutas en Cuadrícula',
            parrafos: [
              'Ahora que dominas las 4 direcciones y los giros básicos, es hora de recibir misiones completas de navegación.',
              'En este nivel, recibirás un párrafo con instrucciones de ruta completas: "Desde la plaza, camina 3 cuadras al Norte, gira al Este y avanza 2 cuadras, luego baja 1 cuadra al Sur".',
              'Tu superpoder es transformar ese texto verbal en un trazado exacto sobre la cuadrícula, leyendo cada instrucción como un vector independiente y ejecutándolos en secuencia estricta.',
              'Cada instrucción es un "tramo" de tu viaje. No puedes mezclar los tramos ni saltarte ninguno.'
            ],
            diccionario: {
              'Tramo': 'Cada segmento de movimiento en una dirección fija (ej. "3 al Norte" es un tramo).',
              'Trayecto completo': 'La suma secuencial de todos los tramos desde el inicio al destino.',
              'Distancia total': 'El conteo acumulado de todas las cuadras recorridas en todos los tramos.'
            },
            ejemplos: [
              {
                enunciado: 'Instrucción: "Norte 3, Este 2". ¿Cuántas cuadras recorrió en total?',
                pasos: [
                  { orden: 1, texto: 'Tramo 1: 3 cuadras al Norte.' },
                  { orden: 2, texto: 'Tramo 2: 2 cuadras al Este.' }
                ],
                respuesta: 'Distancia total = 3 + 2 = 5 cuadras.'
              },
              {
                enunciado: 'Instrucción: "Este 4, Norte 1, Oeste 2". ¿Posición final si partió de (1,1)?',
                pasos: [
                  { orden: 1, texto: '(1,1) → Este 4 → (5,1).' },
                  { orden: 2, texto: '(5,1) → Norte 1 → (5,2).' },
                  { orden: 3, texto: '(5,2) → Oeste 2 → (3,2).' }
                ],
                respuesta: 'Posición final: (3,2).'
              }
            ],
            interactivos: [
              {
                enunciado: 'Un robot parte de (2,2) en una cuadrícula 6×6. Instrucciones: "Norte 3, Este 1". ¿En qué posición terminó?',
                respuesta: '(3,5)',
                feedback_acierto: '¡Trazado perfecto! (2,2) → Norte 3 → (2,5) → Este 1 → (3,5).',
                feedback_error: 'Recuerda: Norte sube la coordenada Y. Este aumenta la coordenada X. Aplica cada tramo por separado.'
              },
              {
                enunciado: 'Un dron recibe: "Norte 2, Este 3, Sur 1". ¿Cuántas cuadras caminó en total?',
                respuesta: '6',
                feedback_acierto: '¡Correcto! 2 + 3 + 1 = 6 cuadras de distancia total recorrida.',
                feedback_error: 'Suma cada tramo individualmente: 2 + 3 + 1. No importa la dirección, la distancia total es la suma de todos los pasos.'
              }
            ],
            tip_pedagogico: 'La distancia total recorrida es la suma de todos los pasos individuales, sin importar la dirección final.'
          },
          preguntas: [
            { id: qid(), enunciado: 'Desde (1,1), Norte 3 y Este 2. ¿En qué casilla estás?', tipo: 'opcion_multiple', opciones: ['(3,4)', '(3,3)', '(4,3)'], respuesta_correcta: '(3,4)' },
            { id: qid(), enunciado: 'Desde el punto A, caminé Norte 2, Este 3, Sur 1. ¿Cuántas casillas me moví en total?', tipo: 'numerico', respuesta_correcta: '6' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Descubrir qué ruta es imposible.',
          teoria: {
            titulo: 'Rutas Imposibles',
            parrafos: [
              'Los verdaderos maestros de la navegación no solo siguen instrucciones: también detectan errores y optimizan caminos.',
              'En este nivel, recibirás varias rutas posibles y deberás identificar cuál es imposible (porque sale de la cuadrícula o choca con un obstáculo), cuál es la más corta, o cuál es la única que llega correctamente al destino.',
              'La ruta más corta entre dos puntos en una cuadrícula se calcula con la Distancia Manhattan: sumas la diferencia horizontal más la diferencia vertical.'
            ],
            diccionario: {
              'Distancia Manhattan': 'La distancia más corta moviéndose únicamente sobre las líneas de la cuadrícula.',
              'Ruta Imposible': 'Una ruta que excede los límites físicos de la cuadrícula o choca con un obstáculo.'
            },
            ejemplos: [
              {
                enunciado: 'En una cuadrícula 5×5, de (1,1) a (4,3). ¿Cuál es la ruta más corta?',
                pasos: [
                  { orden: 1, texto: 'Diferencia horizontal: |4 - 1| = 3 cuadras.' },
                  { orden: 2, texto: 'Diferencia vertical: |3 - 1| = 2 cuadras.' }
                ],
                respuesta: 'Ruta mínima = 3 + 2 = 5 cuadras.'
              },
              {
                enunciado: 'Cuadrícula 4×4. Un robot en (1,1) recibe: "Norte 5". ¿Es posible?',
                pasos: [
                  { orden: 1, texto: 'La cuadrícula tiene solo 4 filas.' },
                  { orden: 2, texto: 'Norte 5 lo llevaría a la fila 6, que no existe.' }
                ],
                respuesta: 'Ruta imposible. El robot saldría de la cuadrícula.'
              }
            ],
            interactivos: [
              {
                enunciado: 'En una cuadrícula 6×6, ¿cuál es la distancia mínima de (1,1) a (4,5)?',
                respuesta: '7',
                feedback_acierto: '¡Navegante experto! |4-1| + |5-1| = 3 + 4 = 7 cuadras.',
                feedback_error: 'Calcula la diferencia horizontal (columnas) y la vertical (filas) por separado, luego súmalas.'
              },
              {
                enunciado: 'Cuadrícula 5×5. Ruta desde (1,1): "Norte 3, Este 6". ¿Es posible esta ruta?',
                respuesta: 'No',
                feedback_acierto: '¡Alerta detectada! La cuadrícula tiene solo 5 columnas. Este 6 la rebasa.',
                feedback_error: 'La cuadrícula es de 5×5. Si la coordenada X llega a 7 (1+6), eso excede el límite de 5.'
              }
            ],
            tip_pedagogico: 'Prueba cada ruta simulando los pasos en tu mente. Recuerda que no se puede ir en diagonal.'
          },
          preguntas: [
            { id: qid(), enunciado: 'En una cuadrícula 5×5, desde (1,1): ¿cuál ruta es imposible? A) Norte 4 + Este 2 B) Norte 6', tipo: 'opcion_multiple', opciones: ['Ruta A', 'Ruta B', 'Ambas son posibles'], respuesta_correcta: 'Ruta B' },
            { id: qid(), enunciado: 'Para ir de (2,1) a (5,4), ¿cuántas casillas hacia el Norte y hacia el Este necesitas?', tipo: 'opcion_multiple', opciones: ['Norte 3, Este 3', 'Norte 2, Este 4', 'Norte 4, Este 2'], respuesta_correcta: 'Norte 3, Este 3' },
          ]
        },
        {
          nivelId: 11, nombre: 'Desafío 1: Navegación', descripcion: 'Mecánica: El Filtro, >80%',
          teoria: { titulo: 'Desafío de Navegación', parrafos: ['¡Demuestra que eres el mejor explorador cardinal!'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 12, nombre: 'Desafío 2: Explorador', descripcion: 'Mecánica: El Filtro, >90%',
          teoria: { titulo: 'Desafío Explorador', parrafos: ['Toma el control absoluto.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 13, nombre: 'Desafío Final: Maestro', descripcion: 'Mecánica: El Jefe, >90%',
          teoria: { titulo: 'Evaluación Final', parrafos: ['Máxima concentración.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        }
      ]
    },
    {
      moduloId: 2, nombre: 'Plano Cartesiano', descripcion: 'Localiza y mueve puntos en coordenadas.', icono: 'crosshair', color: '#2DD4BF',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Localizar pares ordenados (X, Y).',
          teoria: {
            titulo: 'Par Ordenado (X, Y)',
            parrafos: [
              '¡Bienvenido a la Sala de Radar, Operador de Coordenadas! El plano cartesiano es el mapa más preciso del universo.',
              'Funciona con dos ejes perpendiculares: el eje X (horizontal, como el piso) y el eje Y (vertical, como un ascensor).',
              'Cualquier punto del plano se identifica con un par ordenado (X, Y): el primer número te dice cuántos pasos das a la derecha sobre el piso, y el segundo te dice cuántos pasos subes por el ascensor.',
              'El orden es sagrado: primero el piso (X), luego el ascensor (Y). El punto donde los dos ejes se cruzan se llama origen, y su coordenada es (0, 0).'
            ],
            diccionario: {
              'Eje X (horizontal)': 'El "pasillo" — caminas a la derecha para aumentar X.',
              'Eje Y (vertical)': 'El "ascensor" — subes para aumentar Y.',
              'Par ordenado (X, Y)': 'Primero el pasillo, después el ascensor. ¡Nunca al revés!',
              'Origen (0, 0)': 'El punto de partida donde se cruzan los dos ejes.'
            },
            ejemplos: [
              {
                enunciado: 'Ubica el punto (2, 4) en una cuadrícula.',
                pasos: [
                  { orden: 1, texto: 'Desde el origen (0,0), camina 2 pasos a la derecha por el eje X.' },
                  { orden: 2, texto: 'Desde ahí, subo 4 pasos por el eje Y.' }
                ],
                respuesta: 'El punto (2, 4) está en la columna 2, fila 4.'
              },
              {
                enunciado: '¿Cuáles son las coordenadas de un punto ubicado 5 a la derecha y 1 arriba?',
                pasos: [
                  { orden: 1, texto: 'X = 5 (derecha). Y = 1 (arriba).' }
                ],
                respuesta: '(5, 1).'
              }
            ],
            interactivos: [
              {
                enunciado: '¿Cuántos pasos a la derecha y cuántos arriba necesitas dar para llegar al punto (6, 3) desde el origen?',
                respuesta: '6 y 3',
                feedback_acierto: '¡Ruta directa! 6 pasos por el pasillo y 3 por el ascensor.',
                feedback_error: 'El primer número del par (6) son los pasos horizontales. El segundo (3) son los verticales.'
              },
              {
                enunciado: 'Un avión está en el punto (5, 5) y otro en el punto (5, 0). ¿Están en la misma columna o en la misma fila?',
                respuesta: 'Columna',
                feedback_acierto: '¡Correcto! Ambos tienen X = 5, así que están en la misma columna vertical.',
                feedback_error: 'Fíjate en el primer número: ambos dicen 5. Eso significa que están en la misma posición horizontal (columna X = 5).'
              }
            ],
            tip_pedagogico: 'Primero camina en horizontal (X), luego sube en vertical (Y).'
          },
          preguntas: [
            { id: qid(), enunciado: '¿Cuál es la posición del punto P que está 4 a la derecha y 5 arriba del origen?<br/><img src=\'http://localhost:9100/logicakids/graphics/65b4a26824f84f6e85a05bf60580548c.png\' class=\'lk-question-graphic\' />', tipo: 'opcion_multiple', opciones: ['(5,4)', '(4,5)', '(4,4)'], respuesta_correcta: '(4,5)' },
            { id: qid(), enunciado: 'El punto A(0, 3) está sobre cuál eje?<br/><img src=\'http://localhost:9100/logicakids/graphics/75ec0bfd5cf943d5ba256b906d53b6b4.png\' class=\'lk-question-graphic\' />', tipo: 'opcion_multiple', opciones: ['Eje X', 'Eje Y', 'Ninguno'], respuesta_correcta: 'Eje Y' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Par ordenado como vector de desplazamiento.',
          teoria: {
            titulo: 'Vectores de Movimiento',
            parrafos: [
              'Mover un objeto en el plano cartesiano sin cambiarlo de forma se llama traslación.',
              'Para trasladar un punto, simplemente sumas o restas valores a sus coordenadas: si quieres moverlo 3 posiciones a la derecha, sumas 3 a X. Si lo bajas 2 posiciones, restas 2 a Y.',
              'Si tienes una figura con varios vértices (como un triángulo), aplicas la misma regla a cada vértice para que la figura entera se deslice como un bloque.'
            ],
            diccionario: {
              'Traslación': 'Desplazar una figura en el plano sumando o restando a sus coordenadas.',
              'Vector de Movimiento': 'El par de valores (+X, +Y) que indica cuánto desplazar la figura en cada eje.'
            },
            ejemplos: [
              {
                enunciado: 'El punto (2, 3) se traslada 4 a la derecha. ¿Nueva posición?',
                pasos: [
                  { orden: 1, texto: 'X final = 2 + 4 = 6.' },
                  { orden: 2, texto: 'Y final = 3.' }
                ],
                respuesta: '(6, 3).'
              },
              {
                enunciado: 'El punto (5, 7) se traslada 2 abajo. ¿Nueva posición?',
                pasos: [
                  { orden: 1, texto: 'X final = 5.' },
                  { orden: 2, texto: 'Y final = 7 - 2 = 5.' }
                ],
                respuesta: '(5, 5).'
              }
            ],
            interactivos: [
              {
                enunciado: 'El punto (3, 2) se traslada 5 a la derecha y 1 arriba. ¿Coordenada final?',
                respuesta: '(8,3)',
                feedback_acierto: '¡Deslizamiento perfecto! (3+5, 2+1) = (8, 3).',
                feedback_error: 'Suma el desplazamiento horizontal a X y el vertical a Y por separado.'
              },
              {
                enunciado: 'Un punto en (7, 6) se mueve 4 a la izquierda. ¿Cuál es su nueva coordenada X?',
                respuesta: '3',
                feedback_acierto: '¡Exacto! Moverse a la izquierda = restar de X. 7 – 4 = 3.',
                feedback_error: '"Izquierda" significa restar del eje X. Calcula 7 – 4.'
              }
            ],
            tip_pedagogico: 'Suma las coordenadas del punto original más las del vector de movimiento para hallar el destino.'
          },
          preguntas: [
            { id: qid(), enunciado: 'Desde el punto A(2,3), aplica el vector de movimiento (+4, +1). ¿A qué punto de destino llegas?<br/><img src=\'http://localhost:9100/logicakids/graphics/65cc36c451fe40699098be0d79b9a383.png\' class=\'lk-question-graphic\' />', tipo: 'opcion_multiple', opciones: ['(6,4)', '(4,6)', '(3,7)'], respuesta_correcta: '(6,4)' },
            { id: qid(), enunciado: 'Para ir de (1,2) a (5,6), ¿cuál es el vector?', tipo: 'opcion_multiple', opciones: ['(+4,+4)', '(+3,+4)', '(+4,+3)'], respuesta_correcta: '(+4,+4)' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Movimiento relativo entre puntos.',
          teoria: {
            titulo: 'Movimiento Relativo',
            parrafos: [
              'En la vida real no puedes volar en línea recta entre dos puntos. En una ciudad con calles, debes seguir las cuadras.',
              'La Distancia Manhattan (también llamada "distancia de taxi") mide exactamente cuántas cuadras caminas para ir de un punto A a un punto B moviéndote solo horizontal y verticalmente.',
              'La fórmula es elegante: Distancia = |X2 – X1| + |Y2 – Y1|. Las barras indican valor absoluto (siempre positivo).'
            ],
            diccionario: {
              'Distancia Manhattan': 'Suma de las diferencias absolutas de sus coordenadas: |X2-X1| + |Y2-Y1|.',
              'Movimiento Relativo': 'El vector necesario para ir de un punto de origen a uno de destino.'
            },
            ejemplos: [
              {
                enunciado: 'De (1, 1) a (4, 3). Distancia Manhattan:',
                pasos: [
                  { orden: 1, texto: 'Diferencia horizontal: |4 - 1| = 3.' },
                  { orden: 2, texto: 'Diferencia vertical: |3 - 1| = 2.' }
                ],
                respuesta: '3 + 2 = 5 cuadras.'
              },
              {
                enunciado: 'De (5, 2) a (2, 6). Distancia Manhattan:',
                pasos: [
                  { orden: 1, texto: 'Horizontal: |2 - 5| = 3.' },
                  { orden: 2, texto: 'Vertical: |6 - 2| = 4.' }
                ],
                respuesta: '3 + 4 = 7 cuadras.'
              }
            ],
            interactivos: [
              {
                enunciado: '¿Cuál es la distancia Manhattan de (2, 3) a (7, 5)?',
                respuesta: '7',
                feedback_acierto: '¡Taxista experto! |7–2| + |5–3| = 5 + 2 = 7.',
                feedback_error: 'Resta las coordenadas X (|7–2|=5) y las Y (|5–3|=2) por separado, luego suma.'
              },
              {
                enunciado: 'De (4, 4) a (4, 9). ¿Cuántas cuadras?',
                respuesta: '5',
                feedback_acierto: '¡Directo! Misma columna X, así que solo cuentas la diferencia vertical: |9–4| = 5.',
                feedback_error: 'Si la X es la misma, no hay movimiento horizontal. Solo cuenta la diferencia en Y.'
              }
            ],
            tip_pedagogico: 'Resta las coordenadas: destino menos origen para encontrar el vector de movimiento.'
          },
          preguntas: [
            { id: qid(), enunciado: 'El punto A está en (3,2) y B en (7,5). ¿Cuánto debes moverte en la dirección horizontal X para ir de A a B?<br/><img src=\'http://localhost:9100/logicakids/graphics/ca5216e9e0ed4d30b05ef2ce15793dfa.png\' class=\'lk-question-graphic\' />', tipo: 'numerico', respuesta_correcta: '4' },
            { id: qid(), enunciado: 'Desde (1,1), me moví (+3,+2) y luego (+1,+4). ¿Dónde estoy?', tipo: 'opcion_multiple', opciones: ['(5,7)', '(4,6)', '(5,6)'], respuesta_correcta: '(5,7)' },
          ]
        },
        {
          nivelId: 11, nombre: 'Desafío 1: Cartesiano', descripcion: 'Mecánica: El Filtro, >80%',
          teoria: { titulo: 'Desafío Cartesiano', parrafos: ['Domina las coordenadas exactas.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 12, nombre: 'Desafío 2: Topógrafo', descripcion: 'Mecánica: El Filtro, >90%',
          teoria: { titulo: 'Desafío de Topógrafo', parrafos: ['Mediciones precisas.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 13, nombre: 'Desafío Final: Geómetra', descripcion: 'Mecánica: El Jefe, >90%',
          teoria: { titulo: 'Evaluación Final', parrafos: ['Máxima precisión.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        }
      ]
    },
    {
      moduloId: 3, nombre: 'La Mecánica del Tiempo', descripcion: 'Opera con horas, minutos y conversiones temporales.', icono: 'clock', color: '#0D9488',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Conversiones: minutos a horas, días a semanas.',
          teoria: {
            titulo: 'Unidades de Tiempo',
            parrafos: [
              '¡Bienvenido al Taller del Cronista, Maestro del Tiempo! El tiempo es el único recurso que no se puede devolver.',
              'El reloj usa un sistema especial llamado sexagesimal: cada hora tiene 60 minutos, y cada minuto tiene 60 segundos.',
              'Las conversiones fundamentales son: 1 hora = 60 minutos, 1 día = 24 horas, 1 semana = 7 días.',
              'Para convertir horas a minutos, multiplicas por 60. Para convertir minutos a horas, divides entre 60.'
            ],
            diccionario: {
              'Sistema sexagesimal': 'Base 60. 60 segundos = 1 minuto. 60 minutos = 1 hora.',
              'Hora (h)': 'Unidad de tiempo que equivale a 60 minutos.',
              'Minuto (min)': 'Unidad de tiempo que equivale a 60 segundos.'
            },
            ejemplos: [
              {
                enunciado: 'Convertir 2 horas a minutos.',
                pasos: [
                  { orden: 1, texto: 'Multiplicamos: 2 × 60 = 120.' }
                ],
                respuesta: '120 minutos.'
              },
              {
                enunciado: 'Convertir 180 minutos a horas.',
                pasos: [
                  { orden: 1, texto: 'Dividimos: 180 ÷ 60 = 3.' }
                ],
                respuesta: '3 horas.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Convierte 3 horas y 15 minutos a minutos totales.',
                respuesta: '195',
                feedback_acierto: '¡Cronista perfecto! 3 × 60 = 180, más 15 = 195 minutos.',
                feedback_error: 'Primero convierte las horas: 3 × 60 = 180 minutos. Luego suma los 15 minutos extras.'
              },
              {
                enunciado: '¿Cuántas horas completas hay en 150 minutos?',
                respuesta: '2',
                feedback_acierto: '¡Exacto! 150 ÷ 60 = 2 horas completas (sobran 30 minutos).',
                feedback_error: 'Divide 150 entre 60. El cociente entero (sin decimales) son las horas completas.'
              }
            ],
            tip_pedagogico: 'Cada vez que cambies de horas a minutos, multiplica por 60. De minutos a horas, divide por 60.'
          },
          preguntas: [
            { id: qid(), enunciado: '¿Cuántos minutos tiene 2 horas y media de duración?<br/><img src=\'http://localhost:9100/logicakids/graphics/65f566a6ef6747d3966f3cea8e89b87f.png\' class=\'lk-question-graphic\' />', tipo: 'numerico', respuesta_correcta: '150' },
            { id: qid(), enunciado: '¿Cuántas horas hay en 3 días?', tipo: 'numerico', respuesta_correcta: '72' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Sumas y restas de intervalos de tiempo.',
          teoria: {
            titulo: 'Operaciones con Tiempo',
            parrafos: [
              'El verdadero reto del cronista temporal es calcular cuánto tiempo dura un evento que empieza en una hora y termina en otra.',
              'Si una película comienza a las 14:20 y termina a las 16:05, ¿cuánto duró?',
              'La estrategia maestra es dividir el cálculo en dos partes: primero cuántos minutos faltan para la hora siguiente (el "puente"), y luego cuántas horas y minutos quedan hasta la hora final.'
            ],
            diccionario: {
              'Intervalo': 'La cantidad de tiempo transcurrido entre un inicio y un fin.',
              'Formato 24h': 'Representar la hora del día del 00 al 23. Evita confusiones AM/PM.'
            },
            ejemplos: [
              {
                enunciado: 'Una película empieza a las 14:20 y termina a las 16:05. ¿Duración?',
                pasos: [
                  { orden: 1, texto: 'De 14:20 a 15:00 = 40 minutos.' },
                  { orden: 2, texto: 'De 15:00 a 16:00 = 60 minutos (1 hora).' },
                  { orden: 3, texto: 'De 16:00 a 16:05 = 5 minutos.' }
                ],
                respuesta: '40 + 60 + 5 = 105 minutos = 1 hora y 45 minutos.'
              },
              {
                enunciado: 'De las 23:00 a las 01:00 del día siguiente. ¿Duración?',
                pasos: [
                  { orden: 1, texto: 'De 23:00 a 00:00 (medianoche) = 1 hora.' },
                  { orden: 2, texto: 'De 00:00 a 01:00 = 1 hora.' }
                ],
                respuesta: '1 + 1 = 2 horas.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Una fiesta empieza a las 15:30 y termina a las 18:00. ¿Cuántas horas y minutos duró?',
                respuesta: '2 horas y 30 minutos',
                feedback_acierto: '¡Cronómetro exacto! De 15:30 a 18:00 = 2h 30min.',
                feedback_error: 'Cuenta: de 15:30 a 16:00 = 30 min. De 16:00 a 18:00 = 2 horas. Total: 2h 30min.'
              },
              {
                enunciado: 'Lucas empezó la tarea a las 17:40 y la terminó a las 19:10. ¿Cuántos minutos le tomó?',
                respuesta: '90',
                feedback_acierto: '¡Velocidad académica! 1 hora 30 minutos = 90 minutos.',
                feedback_error: 'De 17:40 a 18:00 = 20 min. De 18:00 a 19:00 = 60 min. De 19:00 a 19:10 = 10 min. Total: 90 min.'
              }
            ],
            tip_pedagogico: 'Usa la hora siguiente como un "puente" para calcular intervalos de minutos de forma más sencilla.'
          },
          preguntas: [
            { id: qid(), enunciado: '1 hora 40 minutos + 2 horas 30 minutos = ?', tipo: 'opcion_multiple', opciones: ['3h70min', '4h10min', '3h10min'], respuesta_correcta: '4h10min' },
            { id: qid(), enunciado: 'Si ahorro R$10 por semana, ¿cuánto tendré en 8 semanas?', tipo: 'numerico', respuesta_correcta: '80' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Ecuaciones temporales.',
          teoria: {
            titulo: 'Horarios Complejos',
            parrafos: [
              'Para sumar horas y minutos, debes sumar las horas por un lado y los minutos por otro.',
              'But si los minutos resultantes suman 60 o más, debes convertir el exceso en horas.',
              'A esto lo llamamos acarreo sexagesimal: cada vez que acumulas 60 minutos, los transformas en 1 hora.',
              'Para restar, si los minutos del sustraendo son mayores que los del minuendo, "pides prestada" 1 hora (que son 60 minutos) y la sumas al minuendo.'
            ],
            diccionario: {
              'Acarreo sexagesimal': 'Llevar 60 minutos como 1 hora extra al sumar.',
              'Préstamo sexagesimal': 'Convertir 1 hora en 60 minutos para poder restar cuando el minuendo es menor.'
            },
            ejemplos: [
              {
                enunciado: 'Sumar 2h 35min + 1h 40min.',
                pasos: [
                  { orden: 1, texto: 'Horas: 2 + 1 = 3h.' },
                  { orden: 2, texto: 'Minutos: 35 + 40 = 75 min.' },
                  { orden: 3, texto: '75 min = 1h 15min. Sumamos: 3h + 1h 15min = 4h 15min.' }
                ],
                respuesta: '4 horas y 15 minutos.'
              },
              {
                enunciado: 'Restar 5h 10min – 2h 45min.',
                pasos: [
                  { orden: 1, texto: '10 min - 45 min no alcanza. Pedimos 1 hora prestada: 5h 10min → 4h 70min.' },
                  { orden: 2, texto: 'Restamos minutos: 70 - 45 = 25 min.' },
                  { orden: 3, texto: 'Restamos horas: 4 - 2 = 2h.' }
                ],
                respuesta: '2 horas y 25 minutos.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Suma: 1h 45min + 2h 30min. ¿Resultado?',
                respuesta: '4h 15min',
                feedback_acierto: '¡Acarreo sexagesimal dominado! 45+30=75 min → 1h 15min. Total: 1+2+1=4h 15min.',
                feedback_error: 'Suma los minutos: 45+30=75. Como 75 >= 60, convierte: 75–60=15 minutos y suma 1 hora extra.'
              },
              {
                enunciado: 'Resta: 4h 15min – 1h 50min. ¿Resultado?',
                respuesta: '2h 25min',
                feedback_acierto: '¡Préstamo temporal perfecto! 4h 15min → 3h 75min. 75–50=25. 3–1=2h 25min.',
                feedback_error: 'Como 15 < 50, pide 1 hora: 4h 15min → 3h 75min. Ahora resta: 75–50=25min, 3–1=2h.'
              }
            ],
            tip_pedagogico: 'Cada 60 minutos acumulados se convierten en 1 hora. ¡No te olvides de llevarte esa hora!'
          },
          preguntas: [
            { id: qid(), enunciado: 'Un colegio tiene 5 clases de 45 minutos y 2 recreos de 15 minutos. ¿Cuánto dura el día escolar en minutos?', tipo: 'numerico', respuesta_correcta: '255' },
            { id: qid(), enunciado: 'Si las clases de la escuela empiezan a las 7:30 (como se ilustra) y duran 255 minutos, ¿a qué hora terminan?<br/><img src=\'http://localhost:9100/logicakids/graphics/3db00a1f872343a082a55f73b5c0532d.png\' class=\'lk-question-graphic\' />', tipo: 'opcion_multiple', opciones: ['11:45', '11:30', '12:00'], respuesta_correcta: '11:45' },
          ]
        },
        {
          nivelId: 11, nombre: 'Desafío 1: Cronómetro', descripcion: 'Mecánica: El Filtro, >80%',
          teoria: { titulo: 'Desafío del Tiempo', parrafos: ['¡Mide el tiempo sin dudar!'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 12, nombre: 'Desafío 2: Calculista', descripcion: 'Mecánica: El Filtro, >90%',
          teoria: { titulo: 'Desafío Calculista', parrafos: ['Añade y resta horas.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 13, nombre: 'Desafío Final: Maestro del Tiempo', descripcion: 'Mecánica: El Jefe, >90%',
          teoria: { titulo: 'Evaluación Final', parrafos: ['Máxima sincronización.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        }
      ]
    },
    {
      moduloId: 4, nombre: 'Horarios y Apps', descripcion: 'Lee tablas de horario y toma decisiones lógicas.', icono: 'calendar', color: '#059669',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Leer tablas de horarios de transporte.',
          teoria: {
            titulo: 'Tablas de Horario',
            parrafos: [
              '¡Bienvenido al Centro de Logística, Planificador Urbano!',
              'En la vida real, los horarios de trenes, autobuses y metros se presentan en tablas de doble entrada.',
              'Las filas representan las paradas y las columnas los diferentes viajes del día.',
              'Para leer una tabla de horarios debes cruzar dos datos: la línea (parada que te interesa) y la columna (el viaje o corrida del día).'
            ],
            diccionario: {
              'Tabla de doble entrada': 'Una cuadrícula donde filas y columnas representan categorías diferentes.',
              'Celda': 'La casilla donde se cruzan una fila y una columna. Contiene el dato que buscas.',
              'Horario de salida': 'La hora en que el transporte parte de una estación.'
            },
            ejemplos: [
              {
                enunciado: 'Tabla de bus: Salidas a las 7:00, 8:30, 10:00. La parada "Plaza" está 20 min después de la salida. ¿A qué hora pasa el segundo bus por la Plaza?',
                pasos: [
                  { orden: 1, texto: 'Segundo bus sale a las 8:30.' },
                  { orden: 2, texto: '8:30 + 20 min = 8:50.' }
                ],
                respuesta: 'Pasa a las 8:50.'
              },
              {
                enunciado: 'Un tren sale de la Terminal a las 6:15. Llega a la Estación Centro 45 min después. ¿Hora de llegada?',
                pasos: [
                  { orden: 1, texto: 'Sumamos: 6:15 + 45 min = 7:00.' }
                ],
                respuesta: '7:00.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Tabla de bus con salidas: 7:00, 9:00, 11:00. Parada "Mercado" = salida + 30 min. ¿A qué hora pasa el bus de las 9:00 por el Mercado?',
                respuesta: '9:30',
                feedback_acierto: '¡Lectura de tabla perfecta! 9:00 + 30min = 9:30.',
                feedback_error: 'Busca la columna del bus de las 9:00. Luego suma los 30 minutos de recorrido hasta el Mercado.'
              },
              {
                enunciado: 'La tabla dice que el metro pasa a las 7:10, 7:25, 7:40, 7:55. ¿Cada cuántos minutos pasa?',
                respuesta: '15',
                feedback_acierto: '¡Patrón de intervalos dominado! 7:25 – 7:10 = 15 minutos.',
                feedback_error: 'Resta dos horarios consecutivos para saber el intervalo: 7:25 - 7:10 = 15 min.'
              }
            ],
            tip_pedagogico: 'Usa tu dedo para trazar la fila y la columna hasta que se crucen en la celda correcta.'
          },
          preguntas: [
            { id: qid(), enunciado: 'El bus escolar sale a la hora indicada en el reloj y llega a su destino a las 8:45. ¿Cuánto dura el viaje en minutos?<br/><img src=\'http://localhost:9100/logicakids/graphics/8ee260240b674e9a93085327ec38fabb.png\' class=\'lk-question-graphic\' />', tipo: 'numerico', respuesta_correcta: '45' },
            { id: qid(), enunciado: 'El bus sale cada 20 minutos desde la hora inicial marcada en el reloj (7:00). ¿A qué hora sale el tercer bus?<br/><img src=\'http://localhost:9100/logicakids/graphics/3db00a1f872343a082a55f73b5c0532d.png\' class=\'lk-question-graphic\' />', tipo: 'opcion_multiple', opciones: ['7:40', '7:30', '8:00'], respuesta_correcta: '7:40' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Sumar duración de viaje para hallar hora de llegada.',
          teoria: {
            titulo: 'Hora de Llegada',
            parrafos: [
              'En el mundo real, un viaje rara vez es directo. Subes a un bus, bajas en una estación, esperas unos minutos, y luego tomas otro transporte.',
              'El tiempo total del viaje es la suma de todos los segmentos: tiempo de viaje del primer transporte + tiempo de espera + tiempo de viaje del segundo transporte.',
              'Tu superpoder es de descomponer cada tramo y sumarlos con la aritmética sexagesimal que ya dominas.'
            ],
            diccionario: {
              'Transbordo': 'Cambiar de un vehículo de transporte a otro durante el trayecto.',
              'Tiempo de espera': 'Los minutos que pasas esperando la salida del siguiente transporte.'
            },
            ejemplos: [
              {
                enunciado: 'Bus: 25 min. Espera: 10 min. Metro: 15 min. ¿Tiempo total?',
                pasos: [
                  { orden: 1, texto: 'Sumamos todos los tramos: 25 + 10 + 15 = 50 min.' }
                ],
                respuesta: '50 minutos.'
              },
              {
                enunciado: 'Primer bus: 30 min. Espera: 20 min. Segundo bus: 45 min. Sale a las 7:00. ¿Hora de llegada?',
                pasos: [
                  { orden: 1, texto: 'Tiempo total: 30 + 20 + 45 = 95 min = 1h 35min.' },
                  { orden: 2, texto: 'Llegada: 7:00 + 1h 35min = 8:35.' }
                ],
                respuesta: 'Llega a las 8:35.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Bus: 20 min. Espera: 15 min. Metro: 25 min. ¿Tiempo total del viaje?',
                respuesta: '60',
                feedback_acierto: '¡Planificador exacto! 20 + 15 + 25 = 60 minutos = 1 hora.',
                feedback_error: 'Suma cada segmento: tiempo de bus + tiempo de espera + tiempo de metro.'
              },
              {
                enunciado: 'Ana sale a las 8:15. Camina 10 min, espera 5 min y viaja 30 min. ¿A qué hora llega?',
                respuesta: '9:00',
                feedback_acierto: '¡Logística perfecta! 8:15 + 45 min = 9:00.',
                feedback_error: 'Total de viaje: 10+5+30=45 min. Suma eso a la hora de salida: 8:15 + 45 min = 9:00.'
              }
            ],
            tip_pedagogico: 'Suma las horas y los minutos por separado antes de realizar conversiones.'
          },
          preguntas: [
            { id: qid(), enunciado: 'Salgo a la hora indicada en el reloj y el viaje dura 1 hora 30 minutos. ¿A qué hora llego?<br/><img src=\'http://localhost:9100/logicakids/graphics/5e4db50d56884ed5870ec7365e608c29.png\' class=\'lk-question-graphic\' />', tipo: 'opcion_multiple', opciones: ['11:45', '11:30', '12:15'], respuesta_correcta: '11:45' },
            { id: qid(), enunciado: 'Necesito llegar a la escuela a la hora exacta marcada en el reloj (9:00). Si el viaje dura 50 minutos, ¿a qué hora debo salir?<br/><img src=\'http://localhost:9100/logicakids/graphics/97e1054d4dc8466ea3c905e6a777dc92.png\' class=\'lk-question-graphic\' />', tipo: 'opcion_multiple', opciones: ['8:00', '8:10', '8:50'], respuesta_correcta: '8:10' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Comparar opciones de transporte (estilo Moovit).',
          teoria: {
            titulo: 'La Mejor Opción',
            parrafos: [
              'El Planificador Urbano de élite no solo calcula tiempos: compara opciones y elige la mejor.',
              'Cuando tienes 2 o 3 rutas posibles, debes calcular el tiempo total de cada una y seleccionar la que te hace llegar más temprano o la que tiene menos transbordos.',
              'A veces la ruta "más rápida en transporte" no es la mejor porque tiene una espera muy larga.'
            ],
            diccionario: {
              'Optimización': 'Elegir la ruta más eficiente (menor tiempo o menor costo/esfuerzo).',
              'Hora de llegada': 'El indicador clave para saber cuál transporte te conviene tomar.'
            },
            ejemplos: [
              {
                enunciado: 'Ruta A: sale 7:00, dura 90 min. Ruta B: sale 7:30, dura 50 min. ¿Cuál llega antes?',
                pasos: [
                  { orden: 1, texto: 'Ruta A llega a las 7:00 + 1h 30min = 8:30.' },
                  { orden: 2, texto: 'Ruta B llega a las 7:30 + 50min = 8:20.' }
                ],
                respuesta: 'Ruta B llega primero (8:20 < 8:30).'
              },
              {
                enunciado: 'Bus directo: 1h 20min. Bus + metro: 40min + 15min espera + 20min. ¿Cuál es más rápido?',
                pasos: [
                  { orden: 1, texto: 'Directo: 80 min.' },
                  { orden: 2, texto: 'Combinado: 40 + 15 + 20 = 75 min.' }
                ],
                respuesta: 'El combinado ahorra 5 minutos.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Ruta A: sale 9:00, tarda 40 min. Ruta B: sale 9:10, tarda 25 min. ¿A qué hora llega la más rápida?',
                respuesta: '9:35',
                feedback_acierto: '¡Estratega del transporte! Ruta B: 9:10 + 25 = 9:35, que es antes que Ruta A (9:40).',
                feedback_error: 'Calcula la hora de llegada de cada ruta: A → 9:00+40=9:40. B → 9:10+25=9:35. La menor llega antes.'
              },
              {
                enunciado: 'El metro pasa cada 12 minutos desde las 6:00. Si llegas a la estación a las 6:50, ¿a qué hora sale el próximo metro?',
                respuesta: '7:00',
                feedback_acierto: '¡Patrón de intervalos dominado! 6:00, 6:12, 6:24, 6:36, 6:48, 7:00.',
                feedback_error: 'Cuenta múltiplos de 12 desde las 6:00: 6:12, 6:24, 6:36, 6:48, 7:00. El primero tras las 6:50 es las 7:00.'
              }
            ],
            tip_pedagogico: 'Lo que realmente importa es la hora de llegada, no siempre la duración neta del viaje.'
          },
          preguntas: [
            { id: qid(), enunciado: 'Ruta A: bus 30 min + caminar 10 min = 40 min. Ruta B: metro 20 min + esperar 15 min + caminar 5 min = 40 min. ¿Cuál es más rápida?', tipo: 'opcion_multiple', opciones: ['Ruta A', 'Ruta B', 'Son iguales'], respuesta_correcta: 'Son iguales' },
            { id: qid(), enunciado: 'Opción 1: salir 7:00 y llegar 7:50. Opción 2: salir 7:15 y llegar 7:55. ¿Cuál dura menos?', tipo: 'opcion_multiple', opciones: ['Opción 1 (50 min)', 'Opción 2 (40 min)', 'Iguales'], respuesta_correcta: 'Opción 2 (40 min)' },
          ]
        },
        {
          nivelId: 11, nombre: 'Desafío 1: Coordinador', descripcion: 'Mecánica: El Filtro, >80%',
          teoria: { titulo: 'Desafío Coordinador', parrafos: ['¡Coordina todos los horarios!'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 12, nombre: 'Desafío 2: Despachador', descripcion: 'Mecánica: El Filtro, >90%',
          teoria: { titulo: 'Desafío Despachador', parrafos: ['Gestiona flujos de transporte.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        },
        {
          nivelId: 13, nombre: 'Desafío Final: Logístico', descripcion: 'Mecánica: El Jefe, >90%',
          teoria: { titulo: 'Evaluación Final', parrafos: ['Máxima eficiencia.'], diccionario: {}, ejemplos: [], interactivos: [], tip_pedagogico: '' },
          preguntas: []
        }
      ]
    }
  ]
};

// ── FASE 8: Lógica, Combinatoria y Probabilidad ─────────────────

const FASE_8: FaseMetadata = {
  faseId: 8,
  nombre: 'Lógica, Combinatoria y Probabilidad',
  emoji: '🎲',
  descripcion: 'Integra razonamiento lógico, cálculo de posibilidades y preparación final.',
  colorPrimario: '#F59E0B',
  colorSecundario: '#D97706',
  modulos: [
    {
      moduloId: 1, nombre: 'Secuencias Lógicas', descripcion: 'Identifica y extiende patrones numéricos.', icono: 'trending', color: '#F59E0B',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Progresiones aritméticas: hallar patrón de suma/resta constante.',
          teoria: {
            titulo: 'Patrones de Suma',
            parrafos: [
              '¡Bienvenido al Laboratorio de Criptografía, Descifrador!',
              'Una secuencia lógica no es un montón de números tirados al azar; es un tren de vagones unidos por una regla secreta llamada Ley de Formación.',
              'En este primer nivel, las leyes son simples: para pasar de un vagón al siguiente, siempre se suma o siempre se resta la misma cantidad.',
              'Tu superpoder es medir la distancia entre dos números vecinos: si ves un 2 y luego un 5, el tren avanzó 3 pasos (+3). Si el siguiente es un 8, ¡el patrón está confirmado!',
              'Una vez que descubres la regla, puedes predecir cualquier número en el futuro.'
            ],
            diccionario: {
              'Secuencia': 'Una fila ordenada de números o figuras.',
              'Ley de Formación': 'La regla matemática oculta (ej. "sumar 4 cada vez").',
              'Progresión Aritmética': 'Cuando la regla es siempre sumar o siempre restar el mismo número fijo.',
              'Término': 'Cada uno de los números que forman la secuencia.'
            },
            ejemplos: [
              {
                enunciado: 'Secuencia: 3, 7, 11, 15, ?',
                pasos: [
                  { orden: 1, texto: 'Diferencia entre 7 y 3: 7 - 3 = +4.' },
                  { orden: 2, texto: 'Diferencia entre 11 y 7: 11 - 7 = +4. ¡Regla confirmada!' },
                  { orden: 3, texto: 'Al último (15) le sumo 4: 15 + 4 = 19.' }
                ],
                respuesta: 'El siguiente número es 19.'
              },
              {
                enunciado: 'Secuencia: 20, 17, 14, 11, ?',
                pasos: [
                  { orden: 1, texto: 'Los números bajan. 20 a 17 es -3.' },
                  { orden: 2, texto: 'De 17 a 14 es -3.' },
                  { orden: 3, texto: '11 - 3 = 8.' }
                ],
                respuesta: 'El siguiente número es 8.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Descubre el número que sigue: 4, 10, 16, 22, ?',
                respuesta: '28',
                feedback_acierto: '¡Código roto! La regla es sumar 6. 22 + 6 = 28.',
                feedback_error: 'Resta un número del anterior (10 - 4 = 6). Verifica con el siguiente (16 - 10 = 6). Suma ese 6 al 22.'
              },
              {
                enunciado: 'Encuentra el siguiente: 50, 45, 40, 35, ?',
                respuesta: '30',
                feedback_acierto: '¡Perfecto! La secuencia va restando 5 cada vez.',
                feedback_error: 'Observa que los números se van achicando. ¿Cuánto le quitas a 50 para llegar a 45? Quítale eso a 35.'
              }
            ],
            tip_pedagogico: 'Resta dos números consecutivos para encontrar el patrón. ¡Cuidado con la trampa del salto falso!'
          },
          preguntas: [ { id: qid(), enunciado: '3, 7, 11, 15, ___. ¿Cuál es el siguiente número?', tipo: 'numerico', respuesta_correcta: '19' } ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Progresiones compuestas: multiplicación e intercaladas.',
          teoria: {
            titulo: 'Patrones Multiplicativos',
            parrafos: [
              '¡Las secuencias han evolucionado! Ahora se defienden con reglas más complejas.',
              'En este nivel enfrentarás dos nuevos tipos de códigos.',
              '1. Progresiones Multiplicativas: Aquí el tren no suma, sino que multiplica de golpe (crece muy rápido, ej: 2, 4, 8, 16... multiplicando por 2).',
              '2. Progresiones Compuestas (Alternadas): Estas son dos secuencias mezcladas en una sola fila. La regla salta un vagón sí y otro no.'
            ],
            diccionario: {
              'Progresión Multiplicativa': 'Secuencia donde cada término se obtiene multiplicando el anterior por una cantidad fija.',
              'Secuencia Alternada': 'Secuencia con dos reglas distintas que se aplican una vez cada una de manera intercalada.'
            },
            ejemplos: [
              {
                enunciado: 'Secuencia: 3, 6, 12, 24, ?',
                pasos: [
                  { orden: 1, texto: 'De 3 a 6 hay ×2.' },
                  { orden: 2, texto: 'De 6 a 12 hay ×2. ¡Regla confirmada: ×2!' },
                  { orden: 3, texto: '24 × 2 = 48.' }
                ],
                respuesta: 'El siguiente número es 48.'
              },
              {
                enunciado: 'Secuencia Alternada: 10, 15, 13, 18, 16, ?',
                pasos: [
                  { orden: 1, texto: '10 a 15 es +5.' },
                  { orden: 2, texto: '15 a 13 es -2.' },
                  { orden: 3, texto: 'La regla es +5, -2. Después de 16 toca +5: 16 + 5 = 21.' }
                ],
                respuesta: 'El siguiente número es 21.'
              }
            ],
            interactivos: [
              {
                enunciado: '¿Qué número sigue en: 2, 6, 18, 54, ?',
                respuesta: '162',
                feedback_acierto: '¡Multiplicador experto! La regla es ×3. 54 × 3 = 162.',
                feedback_error: 'La suma no funciona. Multiplica 54 × 3.'
              },
              {
                enunciado: 'Descubre el patrón compuesto: 5, 10, 8, 13, 11, ?',
                respuesta: '16',
                feedback_acierto: '¡Doble agente! Sumaste 5 y restaste 2. A 11 le tocaba sumar 5.',
                feedback_error: 'La regla se intercala: +5, -2, +5, -2. Suma 5 a 11.'
              }
            ],
            tip_pedagogico: 'Si la suma no cuadra y el número crece rápido, prueba inmediatamente con la multiplicación.'
          },
          preguntas: [ { id: qid(), enunciado: '2, 6, 18, 54, ___. ¿Cuál es el siguiente?', tipo: 'numerico', respuesta_correcta: '162' } ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Interpolación: deducir el término central faltante en una serie.',
          teoria: {
            titulo: 'Datos Faltantes',
            parrafos: [
              'Hasta ahora siempre te faltaba el vagón del final. En el nivel maestro, el enemigo ha borrado un vagón del medio del tren.',
              'Para reparar este puente, tienes que calcular la distancia total sobre el hueco y dividirla a la mitad.',
              'Tu superpoder de Interpolación te permite calcular la regla mirando los vagones que quedaron unidos al final.'
            ],
            diccionario: {
              'Interpolación': 'Deducir un término central faltante en una secuencia.',
              'Verificación': 'Comprobar que el valor deducido mantiene la ley de formación para toda la secuencia.'
            },
            ejemplos: [
              {
                enunciado: 'Secuencia: 5, 10, ?, 20, 25.',
                pasos: [
                  { orden: 1, texto: 'Vagones unidos: 5→10 es +5. 20→25 es +5.' },
                  { orden: 2, texto: 'Rellenar hueco: 10 + 5 = 15.' },
                  { orden: 3, texto: 'Verificación: 15 + 5 = 20. ¡Correcto!' }
                ],
                respuesta: 'El número es 15.'
              },
              {
                enunciado: 'Secuencia: 2, ?, 18, 54.',
                pasos: [
                  { orden: 1, texto: 'Vagones unidos al final: 18→54 es ×3.' },
                  { orden: 2, texto: 'Rellenar hueco: 2 × 3 = 6.' },
                  { orden: 3, texto: 'Verificación: 6 × 3 = 18. ¡Correcto!' }
                ],
                respuesta: 'El número es 6.'
              }
            ],
            interactivos: [
              {
                enunciado: 'Rellena el hueco: 8, 13, ?, 23, 28.',
                respuesta: '18',
                feedback_acierto: '¡Puente reparado! La regla en ambos lados es +5. 13 + 5 = 18.',
                feedback_error: 'La diferencia constante es 5. Suma 5 a 13.'
              },
              {
                enunciado: 'Encuentra el número perdido: 100, 90, 80, ?, 60.',
                respuesta: '70',
                feedback_acierto: '¡Conexión perfecta! Todo el tren baja restando 10.',
                feedback_error: 'La diferencia es restar 10. Réstale 10 al 80.'
              }
            ],
            tip_pedagogico: 'Usa los números que sí tienes al principio o al final para descubrir el patrón.'
          },
          preguntas: [ { id: qid(), enunciado: '4, ___, 12, 16, 20. ¿Cuál es el número faltante?', tipo: 'numerico', respuesta_correcta: '8' } ]
        },
        {
          nivelId: 11, nombre: 'Desafío 1: Extensión directa', descripcion: 'Mecánica: El Filtro, >80%',
          teoria: {
            titulo: 'Extensión de serie directa',
            parrafos: [
              'Aplica lo aprendido sobre progresiones aritméticas para superar el filtro.',
              'Descubre la diferencia y agrégala al último término.'
            ],
            diccionario: {
              'Filtro': 'Superar esta prueba con al menos un 80% de aciertos.'
            },
            ejemplos: [
              {
                enunciado: 'Secuencia: 20, 17, 14, 11, ?',
                pasos: [
                  { orden: 1, texto: 'La diferencia es -3.' }
                ],
                respuesta: '11 - 3 = 8'
              }
            ],
            interactivos: [
              {
                enunciado: 'Completa: 15, 22, 29, 36, ?',
                respuesta: '43',
                feedback_acierto: '¡Correcto! Sumaste 7.',
                feedback_error: 'La diferencia es +7. Suma 7 a 36.'
              }
            ],
            tip_pedagogico: '¡Concéntrate, necesitas un 80% de precisión!'
          },
          preguntas: []
        },
        {
          nivelId: 12, nombre: 'Desafío 2: Reglas simultáneas', descripcion: 'Mecánica: La Trampa',
          teoria: {
            titulo: 'Series con dos reglas',
            parrafos: [
              'Cuidado con las series que alternan dos reglas distintas.',
              'Analiza por separado los números en posiciones pares e impares.'
            ],
            diccionario: {
              'Series Simultáneas': 'Dos leyes de formación corriendo de forma intercalada en el mismo tren.'
            },
            ejemplos: [
              {
                enunciado: 'Secuencia: 2, 5, 4, 10, 8, 20, ?',
                pasos: [
                  { orden: 1, texto: 'Pares: 5, 10, 20 (multiplica por 2).' },
                  { orden: 2, texto: 'Impares: 2, 4, 8 (multiplica por 2).' },
                  { orden: 3, texto: 'El siguiente término es de los impares: 8 * 2 = 16.' }
                ],
                respuesta: '16'
              }
            ],
            interactivos: [
              {
                enunciado: 'Secuencia: 1, 3, 2, 6, 4, 12, ?',
                respuesta: '8',
                feedback_acierto: '¡Impecable! Los impares van multiplicando por 2.',
                feedback_error: 'Analiza los impares: 1, 2, 4. Multiplican por 2. El que sigue es 4 × 2 = 8.'
              }
            ],
            tip_pedagogico: 'Separa la serie en dos subseries para descubrir las reglas individuales.'
          },
          preguntas: []
        },
        {
          nivelId: 13, nombre: 'Desafío Final: Exponencial', descripcion: 'Mecánica: El Candado, ≥90%',
          teoria: {
            titulo: 'Crecimiento Exponencial',
            parrafos: [
              'Problemas basados en el crecimiento acelerado, como la difusión de virus o de videos en redes.',
              'La base se multiplica repetidamente por sí misma.'
            ],
            diccionario: {
              'Crecimiento Exponencial': 'Multiplicación sucesiva por una misma base que genera aumentos muy veloces.'
            },
            ejemplos: [
              {
                enunciado: 'Un video tiene 2 vistas el primer día. Las vistas se triplican cada día. ¿Cuántas vistas tendrá al cuarto día?',
                pasos: [
                  { orden: 1, texto: 'Día 1: 2' },
                  { orden: 2, texto: 'Día 2: 2 * 3 = 6' },
                  { orden: 3, texto: 'Día 3: 6 * 3 = 18' },
                  { orden: 4, texto: 'Día 4: 18 * 3 = 54' }
                ],
                respuesta: '54'
              }
            ],
            interactivos: [
              {
                enunciado: 'Una bacteria se duplica cada hora. Si empezamos con 5 bacterias, ¿cuántas habrá a las 3 horas?',
                respuesta: '40',
                feedback_acierto: '¡Excelente! 5 -> 10 -> 20 -> 40.',
                feedback_error: 'Multiplica por 2 sucesivamente: 5 * 2 = 10 (1h), 10 * 2 = 20 (2h), 20 * 2 = 40 (3h).'
              }
            ],
            tip_pedagogico: 'Recuerda que la multiplicación sucesiva crece muy rápido.'
          },
          preguntas: []
        }
      ]
    },
    {
      moduloId: 2, nombre: 'Combinatoria Visual', descripcion: 'Cuenta las posibilidades cruzando conjuntos.', icono: 'shuffle', color: '#FBBF24',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Diagramas de árbol y combinaciones por filas × columnas.',
          teoria: {
            titulo: 'Principio de Multiplicación',
            parrafos: [
              'La Combinatoria es el arte de contar cuántas opciones diferentes tienes sin tener que contarlas una por una con el dedo.',
              'Si tienes 3 camisas y 2 pantalones, las combinaciones son 3 × 2 = 6.'
            ],
            diccionario: {
              'Combinación': 'Mezclar un elemento de un grupo con otro de otro grupo.',
              'Diagrama de Árbol': 'Un mapa visual de líneas que conecta todas las opciones posibles.'
            },
            ejemplos: [
              {
                enunciado: 'Ana tiene 4 blusas y 3 faldas. ¿Cuántos outfits diferentes puede armar?',
                pasos: [
                  { orden: 1, texto: 'Multiplicamos 4 opciones de blusa por 3 opciones de falda.' }
                ],
                respuesta: '12 outfits'
              }
            ],
            interactivos: [
              {
                enunciado: 'Un cine ofrece 3 tamaños de palomitas y 4 tipos de refrescos. ¿Cuántos combos puedes comprar?',
                respuesta: '12',
                feedback_acierto: '¡Multiplicación deliciosa! 3 * 4 = 12.',
                feedback_error: 'Multiplica la cantidad de tamaños por la de bebidas.'
              }
            ],
            tip_pedagogico: 'Dibuja un diagrama de árbol para ver la ramificación.'
          },
          preguntas: [ { id: qid(), enunciado: 'Ana tiene 4 blusas y 3 faldas. ¿Cuántos outfits diferentes puede armar?', tipo: 'numerico', respuesta_correcta: '12' } ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Principio multiplicativo: opciones independientes sin repetición.',
          teoria: {
            titulo: 'Principio Multiplicativo de 3 o más Variables',
            parrafos: [
              'El Principio Multiplicativo funciona para cualquier cantidad de categorías independientes.',
              'Si tienes 3 categorías: cabeza, cuerpo y piernas, multiplicas las tres en cadena.'
            ],
            diccionario: {
              'Principio Multiplicativo Ampliado': 'Multiplicar las opciones de cada una de las variables del evento.'
            },
            ejemplos: [
              {
                enunciado: 'Menú: 2 entradas, 3 platos principales, 2 postres. ¿Cuántos menús posibles?',
                pasos: [
                  { orden: 1, texto: 'Multiplicamos: 2 * 3 = 6.' },
                  { orden: 2, texto: 'Multiplicamos por postre: 6 * 2 = 12.' }
                ],
                respuesta: '12 menús'
              }
            ],
            interactivos: [
              {
                enunciado: 'Un restaurante ofrece 3 sopas, 4 platos fuertes y 2 jugos. ¿Cuántas combinaciones?',
                respuesta: '24',
                feedback_acierto: '¡Combo triple! 3 * 4 * 2 = 24.',
                feedback_error: 'Multiplica 3 * 4 * 2.'
              }
            ],
            tip_pedagogico: 'Identifica las categorías independientes y multiplícalas en cadena.'
          },
          preguntas: [ { id: qid(), enunciado: 'Hay 3 sabores de helado y 2 tipos de cono. ¿Cuántas opciones hay?', tipo: 'numerico', respuesta_correcta: '6' } ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Introducción a divisores comunes para empacar grupos exactos.',
          teoria: {
            titulo: 'Divisibilidad y Agrupaciones',
            parrafos: [
              'Para empacar exacto o dividir grupos, usamos divisiones exactas (resto cero).',
              'En combinatoria con restricciones, algunas opciones no se pueden combinar entre sí.'
            ],
            diccionario: {
              'Restricción': 'Condición limitadora que reduce las combinaciones posibles.'
            },
            ejemplos: [
              {
                enunciado: '36 alumnos se dividen en equipos de 4. ¿Cuántos equipos se forman?',
                pasos: [
                  { orden: 1, texto: 'Dividimos el total entre el tamaño: 36 / 4 = 9.' }
                ],
                respuesta: '9 equipos'
              }
            ],
            interactivos: [
              {
                enunciado: '3 camisas y 3 pantalones. No puedes usar camisa roja con pantalón rojo. ¿Cuántas combinaciones válidas hay?',
                respuesta: '8',
                feedback_acierto: '¡Exacto! 3 * 3 = 9 combinaciones totales, menos 1 imposible = 8.',
                feedback_error: 'Calcula el total (3 * 3 = 9) y réstale la única combinación prohibida.'
              }
            ],
            tip_pedagogico: 'Resta las opciones prohibidas al total de combinaciones calculadas.'
          },
          preguntas: [ { id: qid(), enunciado: '36 alumnos se dividen en equipos de 4. ¿Cuántos equipos se forman?', tipo: 'numerico', respuesta_correcta: '9' } ]
        },
        {
          nivelId: 11, nombre: 'Desafío 1: Multiplicación', descripcion: 'Mecánica: El Filtro, >80%',
          teoria: {
            titulo: 'Multiplicación de uniformes',
            parrafos: [
              'Aplica la multiplicación directa de opciones independientes para resolver problemas ágilmente.'
            ],
            diccionario: {
              'Independencia': 'Que la elección de una categoría no afecte a la otra.'
            },
            ejemplos: [
              {
                enunciado: '5 tipos de pan y 4 de queso. ¿Sándwiches posibles?',
                pasos: [],
                respuesta: '20'
              }
            ],
            interactivos: [
              {
                enunciado: 'Un uniforme tiene 4 poleras y 4 pantalones. ¿Cuántos combos distintos?',
                respuesta: '16',
                feedback_acierto: '¡Correcto! 4 * 4 = 16.',
                feedback_error: 'Multiplica 4 × 4.'
              }
            ],
            tip_pedagogico: '¡Alcanza más del 80%!'
          },
          preguntas: []
        },
        {
          nivelId: 12, nombre: 'Desafío 2: Restricciones', descripcion: 'Mecánica: La Trampa',
          teoria: {
            titulo: 'Restricciones excluyentes',
            parrafos: [
              'A veces algunas combinaciones no se pueden usar por razones de compatibilidad.'
            ],
            diccionario: {
              'Exclusión': 'Regla que invalida ciertas combinaciones.'
            },
            ejemplos: [
              {
                enunciado: '3 camisas y 3 pantalones. No puedes usar la camisa roja con pantalón rojo. ¿Cuántas combinaciones válidas hay?',
                pasos: [],
                respuesta: '8'
              }
            ],
            interactivos: [
              {
                enunciado: 'De 4 colores de polera y 3 pantalones, no se puede combinar negro con negro. ¿Combos válidos?',
                respuesta: '11',
                feedback_acierto: '¡Correcto! 4 * 3 = 12 total, menos 1 inválido = 11.',
                feedback_error: 'Resta 1 combinación al total de 12.'
              }
            ],
            tip_pedagogico: 'Resta las opciones imposibles al total.'
          },
          preguntas: []
        },
        {
          nivelId: 13, nombre: 'Desafío Final: Empaquetado tech', descripcion: 'Mecánica: El Candado, ≥90%',
          teoria: {
            titulo: 'Lotes Mínimos',
            parrafos: [
              'Problemas oficiales de empaquetado de componentes tecnológicos en lotes exactos.'
            ],
            diccionario: {
              'Lote': 'Grupo de piezas agrupadas bajo una misma medida exacta.'
            },
            ejemplos: [
              {
                enunciado: 'Tenemos 120 chips que deben ser empaquetados en lotes de 15. ¿Cuántos lotes se formarán?',
                pasos: [],
                respuesta: '8'
              }
            ],
            interactivos: [
              {
                enunciado: 'Tenemos 150 piezas y hacemos lotes de 25. ¿Cuántos lotes exactos?',
                respuesta: '6',
                feedback_acierto: '¡Correcto! 150 / 25 = 6.',
                feedback_error: 'Divide 150 entre 25.'
              }
            ],
            tip_pedagogico: 'Encuentra el divisor común o multiplica sabiamente.'
          },
          preguntas: []
        }
      ]
    },
    {
      moduloId: 3, nombre: 'Probabilidad', descripcion: 'Comprende la probabilidad con ejemplos cotidianos.', icono: 'target', color: '#D97706',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Clasificación determinística: evento seguro, posible, imposible.',
          teoria: {
            titulo: 'Posible, Imposible y Seguro',
            parrafos: [
              '¡Bienvenido al Oráculo! La Probabilidad estudia el azar.',
              'Evento Seguro: ocurre siempre (100% de probabilidad).',
              'Evento Imposible: no ocurre jamás (0% de probabilidad).',
              'Evento Posible: puede ocurrir pero no estamos seguros.'
            ],
            diccionario: {
              'Azar': 'Aleatoriedad donde el resultado es incierto.',
              'Evento Seguro': 'Que pasará con toda certeza.',
              'Evento Imposible': 'Que no tiene ninguna opción de ocurrir.'
            },
            ejemplos: [
              {
                enunciado: 'Una urna tiene 5 bolas rojas. ¿Sacar una bola azul es...?',
                pasos: [
                  { orden: 1, texto: 'No hay bolas azules adentro.' }
                ],
                respuesta: 'Imposible'
              },
              {
                enunciado: 'Una urna tiene 10 bolas verdes. ¿Sacar verde?',
                pasos: [
                  { orden: 1, texto: 'Todas las bolas son verdes.' }
                ],
                respuesta: 'Seguro'
              }
            ],
            interactivos: [
              {
                enunciado: 'Una urna tiene 5 bolas rojas y 0 azules. ¿Sacar una bola azul es...?',
                respuesta: 'Imposible',
                feedback_acierto: '¡Lógica clara! No hay azul.',
                feedback_error: '¿Hay alguna bola azul? No. Entonces es imposible.'
              },
              {
                enunciado: 'Tiras una moneda al aire. ¿Que caiga Cara es...?',
                respuesta: 'Posible',
                feedback_acierto: '¡Correcto! Es factible pero no seguro.',
                feedback_error: 'Puede caer Cara o Cruz, es posible.'
              }
            ],
            tip_pedagogico: 'Pregúntate siempre: ¿puede pasar? ¿estoy 100% seguro?'
          },
          preguntas: [ { id: qid(), enunciado: 'Una urna tiene 5 bolas rojas y 0 azules. ¿Sacar una bola azul es...?', tipo: 'opcion_multiple', opciones: ['Posible', 'Imposible', 'Seguro'], respuesta_correcta: 'Imposible' } ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Definición de Laplace: Casos Favorables / Casos Posibles.',
          teoria: {
            titulo: 'Casos Favorables y Posibles',
            parrafos: [
              'La Regla de Laplace le da un número exacto a la suerte usando fracciones.',
              'Abajo colocas el total de Casos Posibles.',
              'Arriba colocas los Casos Favorables que te hacen ganar.'
            ],
            diccionario: {
              'Casos Posibles': 'Total de todas las opciones en el juego.',
              'Casos Favorables': 'Opciones con las que ganas.',
              'Probabilidad': 'La fracción: Favorables / Posibles.'
            },
            ejemplos: [
              {
                enunciado: 'Dado de 6 caras. Probabilidad de sacar 3:',
                pasos: [
                  { orden: 1, texto: 'Total de caras = 6 (abajo).' },
                  { orden: 2, texto: 'Caras con el número 3 = 1 (arriba).' }
                ],
                respuesta: '1/6'
              },
              {
                enunciado: 'Urna con 3 bolas rojas y 2 azules. ¿Probabilidad de sacar roja?',
                pasos: [
                  { orden: 1, texto: 'Total de bolas = 3 + 2 = 5 (abajo).' },
                  { orden: 2, texto: 'Favorables = 3 rojas (arriba).' }
                ],
                respuesta: '3/5'
              }
            ],
            interactivos: [
              {
                enunciado: 'En una caja hay 7 lápices azules y 3 lápices rojos. ¿Probabilidad de sacar rojo?',
                respuesta: '3/10',
                feedback_acierto: '¡Excelente! 3/10 es la fracción correcta.',
                feedback_error: 'Total es 10 (abajo). Favorables es 3 (arriba). La fracción es 3/10.'
              },
              {
                enunciado: 'Dado normal. ¿Probabilidad de sacar número par?',
                respuesta: '3/6',
                feedback_acierto: '¡Paridad dominada! Hay 3 pares (2,4,6) de 6 en total.',
                feedback_error: 'Los pares son 2, 4 y 6 (3 casos). Total es 6. Fracción: 3/6.'
              }
            ],
            tip_pedagogico: 'Suma todo para hallar el número de abajo (denominador).'
          },
          preguntas: [ { id: qid(), enunciado: 'Dado de 6 caras. Probabilidad de sacar 3:', tipo: 'opcion_multiple', opciones: ['1/6', '2/6', '3/6'], respuesta_correcta: '1/6' } ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Análisis probabilístico y fracciones comparativas.',
          teoria: {
            titulo: 'Fracciones Comparativas y Sin Reposición',
            parrafos: [
              'Cuando no devuelves un objeto al inventario, la probabilidad cambia dinámicamente.',
              'Al sacar un objeto, restas 1 al total de abajo y 1 al grupo que sacaste arriba.'
            ],
            diccionario: {
              'Sin Reposición': 'Extracción de un elemento sin devolverlo al conjunto original.'
            },
            ejemplos: [
              {
                enunciado: '3 bolas rojas y 2 azules. Saco 1 roja y no la devuelvo. ¿Probabilidad de que la segunda sea roja?',
                pasos: [
                  { orden: 1, texto: 'Original: 3 rojas, 5 total.' },
                  { orden: 2, texto: 'Tras sacar roja, quedan 2 rojas y 4 total.' }
                ],
                respuesta: '2/4'
              }
            ],
            interactivos: [
              {
                enunciado: '3 rojas y 1 azul. ¿Qué es más probable sacar?',
                respuesta: 'Roja',
                feedback_acierto: '¡Correcto! Hay más rojas que azules.',
                feedback_error: 'Compara: 3 rojas vs. 1 azul. Es más probable sacar el color con más elementos.'
              },
              {
                enunciado: 'Nevera con 4 cola y 4 naranja (Total 8). Bebo 1 naranja. ¿Probabilidad de que la siguiente sea naranja?',
                respuesta: '3/7',
                feedback_acierto: '¡Universo actualizado! 3/7.',
                feedback_error: 'Restas 1 de naranja (quedan 3) y 1 del total (quedan 7). Fracción: 3/7.'
              }
            ],
            tip_pedagogico: 'Resta 1 al total si ya sacaste un elemento del juego.'
          },
          preguntas: [ { id: qid(), enunciado: '3 bolas rojas y 1 azul. ¿Qué es más probable sacar?', tipo: 'opcion_multiple', opciones: ['Roja', 'Azul'], respuesta_correcta: 'Roja' } ]
        },
        {
          nivelId: 11, nombre: 'Desafío 1: Fracción simple', descripcion: 'Mecánica: El Filtro, >80%',
          teoria: {
            titulo: 'Fracción de probabilidad simple',
            parrafos: [
              'Aplica Laplace rápidamente a lanzamientos de monedas y dados.'
            ],
            diccionario: {
              'Espacio Muestral': 'El conjunto de todos los resultados posibles.'
            },
            ejemplos: [
              {
                enunciado: 'Moneda justa. Probabilidad de cruz:',
                pasos: [],
                respuesta: '1/2'
              }
            ],
            interactivos: [
              {
                enunciado: 'Dado de 6 caras. ¿Probabilidad de sacar un número mayor que 4 (5 o 6)?',
                respuesta: '2/6',
                feedback_acierto: '¡Correcto! 2 de 6.',
                feedback_error: 'Favorables: 5 y 6 (2 caras). Posibles: 6. Fracción: 2/6.'
              }
            ],
            tip_pedagogico: 'Velocidad y precisión.'
          },
          preguntas: []
        },
        {
          nivelId: 12, nombre: 'Desafío 2: Cambio de espacio', descripcion: 'Mecánica: La Trampa',
          teoria: {
            titulo: 'Extracción sin reposición',
            parrafos: [
              'El espacio muestral disminuye si no devuelves el elemento al contenedor.'
            ],
            diccionario: {
              'Inventario Decreciente': 'Cuando cada suceso altera las proportions del siguiente.'
            },
            ejemplos: [
              {
                enunciado: 'Urna con 2 rojas y 2 azules. Saco 1 roja y NO la devuelvo. ¿Cuántas quedan?',
                pasos: [],
                respuesta: '3'
              }
            ],
            interactivos: [
              {
                enunciado: '5 dulces de fresa y 5 de menta. Comes uno de menta. ¿Probabilidad de que el segundo sea de menta?',
                respuesta: '4/9',
                feedback_acierto: '¡Perfecto! Quedan 4 de menta de un total de 9.',
                feedback_error: 'Quedan 4 de menta y el total bajó a 9. Fracción: 4/9.'
              }
            ],
            tip_pedagogico: 'Resta 1 al total si ya sacaste un elemento.'
          },
          preguntas: []
        },
        {
          nivelId: 13, nombre: 'Desafío Final: Mezcla compleja', descripcion: 'Mecánica: El Candado, ≥90%',
          teoria: {
            titulo: 'Problemas complejos',
            parrafos: [
              'Desafío final: probabilidad combinada con diferentes tipos de cuerpos tridimensionales en cajas.'
            ],
            diccionario: {
              'Sólido de Revolución': 'Cuerpo redondo como la esfera o el cilindro.'
            },
            ejemplos: [
              {
                enunciado: 'En una caja hay 4 esferas, 3 cilindros y 3 cubos. ¿Cuál es la probabilidad de sacar un sólido que no rueda (el cubo)?',
                pasos: [],
                respuesta: '3/10'
              }
            ],
            interactivos: [
              {
                enunciado: 'En una caja hay 5 esferas y 5 cubos. ¿Probabilidad de sacar un sólido que rueda (la esfera)?',
                respuesta: '5/10',
                feedback_acierto: '¡Excelente! 5/10.',
                feedback_error: 'Favorables (esferas) = 5. Total = 10. Fracción: 5/10.'
              }
            ],
            tip_pedagogico: 'Identifica el sólido correcto entre la mezcla.'
          },
          preguntas: []
        }
      ]
    }
  ]
};

// ── FASE 9: Simulados Colegio Pedro II ───────────────────────────────

const FASE_9: FaseMetadata = {
  faseId: 9,
  nombre: 'Simulados Oficiales',
  emoji: '🎓',
  descripcion: 'Exámenes de ingreso oficiales pasados para certificar el dominio analítico e integral.',
  colorPrimario: '#3B82F6',
  colorSecundario: '#1D4ED8',
  modulos: [
    {
      moduloId: 1, 
      nombre: 'Nivel Fácil', 
      descripcion: '5 Simulacros introductorios para adaptación a la dinámica del examen.', 
      icono: 'target', 
      color: '#10B981',
      niveles: Array.from({ length: 5 }, (_, i) => ({
        nivelId: i + 1,
        nombre: `Simulacro ${i + 1}`,
        descripcion: 'Simulacro de adaptación y nivel básico.',
        teoria: { titulo: `Simulacro ${i + 1}`, parrafos: ['Este es un simulacro oficial de nivel adaptativo.'], tip_pedagogico: 'Mantén la calma y administra tu tiempo.' },
        preguntas: []
      }))
    },
    {
      moduloId: 2, 
      nombre: 'Nivel Intermedio', 
      descripcion: '10 Simulacros estándar con nivel de dificultad real.', 
      icono: 'bar-chart', 
      color: '#F59E0B',
      niveles: Array.from({ length: 10 }, (_, i) => ({
        nivelId: i + 1,
        nombre: `Simulacro ${i + 6}`,
        descripcion: 'Simulacro de exigencia real.',
        teoria: { titulo: `Simulacro ${i + 6}`, parrafos: ['Estás en el nivel de exigencia real del examen.'], tip_pedagogico: 'No te detengas demasiado tiempo en una sola pregunta.' },
        preguntas: []
      }))
    },
    {
      moduloId: 3, 
      nombre: 'Nivel Difícil', 
      descripcion: '5 Simulacros de alta complejidad y resistencia bajo presión temporal.', 
      icono: 'award', 
      color: '#EF4444',
      niveles: Array.from({ length: 5 }, (_, i) => ({
        nivelId: i + 1,
        nombre: `Simulacro Maestro ${i + 16}`,
        descripcion: 'Simulacro de alta exigencia.',
        teoria: { titulo: `Simulacro Maestro ${i + 16}`, parrafos: ['Estos simulacros son para asegurar la excelencia.'], tip_pedagogico: 'Resiste la presión, confía en tu preparación.' },
        preguntas: []
      }))
    }
  ]
};

// ── Export: Todas las fases ─────────────────────────────────────

export const ALL_FASES: FaseMetadata[] = [FASE_3, FASE_4, FASE_5, FASE_6, FASE_7, FASE_8, FASE_9];

export function getFaseMetadata(faseId: number): FaseMetadata | undefined {
  return ALL_FASES.find(f => f.faseId === faseId);
}
