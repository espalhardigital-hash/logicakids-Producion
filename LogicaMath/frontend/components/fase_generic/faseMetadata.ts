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
}

export interface FaseTeoria {
  titulo: string;
  parrafos: string[];
  ejemplos?: { enunciado: string; respuesta: string }[];
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
            { id: qid(), enunciado: 'La clase empieza a las 8:15 y dura 45 minutos. ¿A qué hora termina?', tipo: 'opcion_multiple', opciones: ['8:50', '9:00', '9:15'], respuesta_correcta: '9:00' },
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
          teoria: { titulo: 'Puntos Cardinales', parrafos: ['Norte (arriba), Sur (abajo), Este (derecha), Oeste (izquierda).', 'La brújula siempre señala al Norte.'], tip_pedagogico: 'Usa la palabra NOSE: Norte, Oeste, Sur, Este (en sentido antihorario).' },
          preguntas: [
            { id: qid(), enunciado: 'Si miro hacia el Norte y giro a la derecha, ¿hacia dónde miro?', tipo: 'opcion_multiple', opciones: ['Sur', 'Este', 'Oeste', 'Norte'], respuesta_correcta: 'Este' },
            { id: qid(), enunciado: '¿Cuál es el punto cardinal opuesto al Oeste?', tipo: 'opcion_multiple', opciones: ['Norte', 'Sur', 'Este'], respuesta_correcta: 'Este' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Seguir comandos de ruta en cuadrículas.',
          teoria: { titulo: 'Rutas en Cuadrícula', parrafos: ['Norte 3 = sube 3 casillas. Leste 2 = muévete 2 a la derecha.', 'Sigue las instrucciones paso a paso.'], tip_pedagogico: 'Dibuja la ruta en la cuadrícula con un lápiz.' },
          preguntas: [
            { id: qid(), enunciado: 'Desde (1,1), Norte 3 y Este 2. ¿En qué casilla estás?', tipo: 'opcion_multiple', opciones: ['(3,4)', '(3,3)', '(4,3)'], respuesta_correcta: '(3,4)' },
            { id: qid(), enunciado: 'Desde el punto A, caminé Norte 2, Este 3, Sur 1. ¿Cuántas casillas me moví en total?', tipo: 'numerico', respuesta_correcta: '6' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Descubrir qué ruta es imposible.',
          teoria: { titulo: 'Rutas Imposibles', parrafos: ['Algunas instrucciones llevan fuera del mapa o a un obstáculo.', 'Traza cada opción para verificar cuál no funciona.'], tip_pedagogico: 'Prueba cada ruta dibujándola antes de decidir.' },
          preguntas: [
            { id: qid(), enunciado: 'En una cuadrícula 5×5, desde (1,1): ¿cuál ruta es imposible? A) Norte 4 + Este 2 B) Norte 6', tipo: 'opcion_multiple', opciones: ['Ruta A', 'Ruta B', 'Ambas son posibles'], respuesta_correcta: 'Ruta B' },
            { id: qid(), enunciado: 'Para ir de (2,1) a (5,4), ¿cuántas casillas hacia el Norte y hacia el Este necesitas?', tipo: 'opcion_multiple', opciones: ['Norte 3, Este 3', 'Norte 2, Este 4', 'Norte 4, Este 2'], respuesta_correcta: 'Norte 3, Este 3' },
          ]
        }
      ]
    },
    {
      moduloId: 2, nombre: 'Plano Cartesiano', descripcion: 'Localiza y mueve puntos en coordenadas.', icono: 'crosshair', color: '#2DD4BF',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Localizar pares ordenados (X, Y).',
          teoria: { titulo: 'Par Ordenado (X, Y)', parrafos: ['X es la posición horizontal (derecha). Y es la vertical (arriba).', 'El punto (3, 2) está 3 a la derecha y 2 arriba.'], tip_pedagogico: 'Primero camina horizontal (X), luego sube (Y).' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuál es la posición del punto que está 4 a la derecha y 5 arriba del origen?', tipo: 'opcion_multiple', opciones: ['(5,4)', '(4,5)', '(4,4)'], respuesta_correcta: '(4,5)' },
            { id: qid(), enunciado: 'El punto (0, 3) está sobre cuál eje?', tipo: 'opcion_multiple', opciones: ['Eje X', 'Eje Y', 'Ninguno'], respuesta_correcta: 'Eje Y' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Par ordenado como vector de desplazamiento.',
          teoria: { titulo: 'Vectores de Movimiento', parrafos: ['Un vector (+2, +3) significa "muévete 2 a la derecha y 3 arriba".', 'Desde (1,1) con vector (+2,+3) llegas a (3,4).'], tip_pedagogico: 'Suma las coordenadas del punto + el vector.' },
          preguntas: [
            { id: qid(), enunciado: 'Desde (2,3), aplica el vector (+4, +1). ¿A qué punto llegas?', tipo: 'opcion_multiple', opciones: ['(6,4)', '(4,6)', '(3,7)'], respuesta_correcta: '(6,4)' },
            { id: qid(), enunciado: 'Para ir de (1,2) a (5,6), ¿cuál es el vector?', tipo: 'opcion_multiple', opciones: ['(+4,+4)', '(+3,+4)', '(+4,+3)'], respuesta_correcta: '(+4,+4)' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Movimiento relativo entre puntos.',
          teoria: { titulo: 'Movimiento Relativo', parrafos: ['Para ir de A(2,1) a B(5,4): vector = (5−2, 4−1) = (+3, +3).'], tip_pedagogico: 'Resta las coordenadas: destino − origen.' },
          preguntas: [
            { id: qid(), enunciado: 'El punto A está en (3,2) y B en (7,5). ¿Cuánto debes moverte en X?', tipo: 'numerico', respuesta_correcta: '4' },
            { id: qid(), enunciado: 'Desde (1,1), me moví (+3,+2) y luego (+1,+4). ¿Dónde estoy?', tipo: 'opcion_multiple', opciones: ['(5,7)', '(4,6)', '(5,6)'], respuesta_correcta: '(5,7)' },
          ]
        }
      ]
    },
    {
      moduloId: 3, nombre: 'La Mecánica del Tiempo', descripcion: 'Opera con horas, minutos y conversiones temporales.', icono: 'clock', color: '#0D9488',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Conversiones: minutos a horas, días a semanas.',
          teoria: { titulo: 'Unidades de Tiempo', parrafos: ['1 hora = 60 minutos. 1 día = 24 horas. 1 semana = 7 días.'], tip_pedagogico: 'Para minutos → horas: divide por 60.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuántos minutos tiene 2 horas y media?', tipo: 'numerico', respuesta_correcta: '150' },
            { id: qid(), enunciado: '¿Cuántas horas hay en 3 días?', tipo: 'numerico', respuesta_correcta: '72' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Sumas y restas de intervalos de tiempo.',
          teoria: { titulo: 'Operaciones con Tiempo', parrafos: ['Para sumar tiempos: suma minutos, si pasan de 60, convierte a hora.', 'Ejemplo: 2h30 + 1h45 = 3h75 = 4h15.'], tip_pedagogico: 'Cada 60 minutos sube 1 hora.' },
          preguntas: [
            { id: qid(), enunciado: '1 hora 40 minutos + 2 horas 30 minutos = ?', tipo: 'opcion_multiple', opciones: ['3h70min', '4h10min', '3h10min'], respuesta_correcta: '4h10min' },
            { id: qid(), enunciado: 'Si ahorro R$10 por semana, ¿cuánto tendré en 8 semanas?', tipo: 'numerico', respuesta_correcta: '80' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Ecuaciones temporales.',
          teoria: { titulo: 'Horarios Complejos', parrafos: ['Una escuela tiene 7 clases de 50 min + recreo de 20 min.', 'Tiempo total = 7 × 50 + 20 = 370 min = 6h10min.'], tip_pedagogico: 'Calcula cada bloque y suma al final.' },
          preguntas: [
            { id: qid(), enunciado: 'Un colegio tiene 5 clases de 45 minutos y 2 recreos de 15 minutos. ¿Cuánto dura el día escolar en minutos?', tipo: 'numerico', respuesta_correcta: '255' },
            { id: qid(), enunciado: 'Si las clases empiezan a las 7:30 y duran 255 minutos, ¿a qué hora terminan?', tipo: 'opcion_multiple', opciones: ['11:45', '11:30', '12:00'], respuesta_correcta: '11:45' },
          ]
        }
      ]
    },
    {
      moduloId: 4, nombre: 'Horarios y Apps', descripcion: 'Lee tablas de horario y toma decisiones lógicas.', icono: 'calendar', color: '#059669',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Leer tablas de horarios de transporte.',
          teoria: { titulo: 'Tablas de Horario', parrafos: ['Las tablas de autobús muestran la hora de salida y llegada.', 'Busca la fila de tu parada y la columna de la hora.'], tip_pedagogico: 'Usa la línea de tu dedo para no perder la fila.' },
          preguntas: [
            { id: qid(), enunciado: 'El bus sale a las 8:00 y llega a las 8:45. ¿Cuánto dura el viaje?', tipo: 'numerico', respuesta_correcta: '45' },
            { id: qid(), enunciado: 'El bus sale cada 20 minutos desde las 7:00. ¿A qué hora sale el tercer bus?', tipo: 'opcion_multiple', opciones: ['7:40', '7:30', '8:00'], respuesta_correcta: '7:40' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Sumar duración de viaje para hallar hora de llegada.',
          teoria: { titulo: 'Hora de Llegada', parrafos: ['Hora de llegada = Hora de salida + Duración del viaje.', 'Si sales a las 14:20 y el viaje dura 1h35min, llegas a las 15:55.'], tip_pedagogico: 'Suma las horas y los minutos por separado.' },
          preguntas: [
            { id: qid(), enunciado: 'Salgo a las 10:15 y el viaje dura 1 hora 30 minutos. ¿A qué hora llego?', tipo: 'opcion_multiple', opciones: ['11:45', '11:30', '12:15'], respuesta_correcta: '11:45' },
            { id: qid(), enunciado: 'Necesito llegar a las 9:00. El viaje dura 50 minutos. ¿A qué hora debo salir?', tipo: 'opcion_multiple', opciones: ['8:00', '8:10', '8:50'], respuesta_correcta: '8:10' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Comparar opciones de transporte (estilo Moovit).',
          teoria: { titulo: 'La Mejor Opción', parrafos: ['A veces tienes dos rutas: una más rápida pero con transbordo, otra directa.', 'Compara el tiempo total de cada opción.'], tip_pedagogico: 'Calcula el tiempo total de CADA opción antes de decidir.' },
          preguntas: [
            { id: qid(), enunciado: 'Ruta A: bus 30 min + caminar 10 min = 40 min. Ruta B: metro 20 min + esperar 15 min + caminar 5 min = 40 min. ¿Cuál es más rápida?', tipo: 'opcion_multiple', opciones: ['Ruta A', 'Ruta B', 'Son iguales'], respuesta_correcta: 'Son iguales' },
            { id: qid(), enunciado: 'Opción 1: salir 7:00 y llegar 7:50. Opción 2: salir 7:15 y llegar 7:55. ¿Cuál dura menos?', tipo: 'opcion_multiple', opciones: ['Opción 1 (50 min)', 'Opción 2 (40 min)', 'Iguales'], respuesta_correcta: 'Opción 2 (40 min)' },
          ]
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
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Identificar el patrón numérico (suma o resta fija).',
          teoria: { titulo: 'Patrones de Suma', parrafos: ['2, 5, 8, 11, ... → el patrón es +3.', 'Para encontrar el siguiente, suma 3: 11 + 3 = 14.'], tip_pedagogico: 'Resta dos números consecutivos para encontrar el patrón.' },
          preguntas: [
            { id: qid(), enunciado: '3, 7, 11, 15, ___. ¿Cuál es el siguiente número?', tipo: 'numerico', respuesta_correcta: '19' },
            { id: qid(), enunciado: '20, 17, 14, 11, ___. ¿Cuál sigue?', tipo: 'numerico', respuesta_correcta: '8' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Progresiones multiplicativas.',
          teoria: { titulo: 'Patrones Multiplicativos', parrafos: ['2, 4, 8, 16, ... → el patrón es ×2 (el doble).', '3, 9, 27, 81, ... → el patrón es ×3.'], tip_pedagogico: 'Divide un número por el anterior para encontrar el multiplicador.' },
          preguntas: [
            { id: qid(), enunciado: '2, 6, 18, 54, ___. ¿Cuál es el siguiente?', tipo: 'numerico', respuesta_correcta: '162' },
            { id: qid(), enunciado: '5, 10, 20, 40, ___. ¿Cuál sigue?', tipo: 'numerico', respuesta_correcta: '80' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Interpolar datos faltantes en medio de una serie.',
          teoria: { titulo: 'Datos Faltantes', parrafos: ['A veces falta un número en el medio de la secuencia.', '2, ___, 8, 11 → el patrón es +3, entonces el faltante es 5.'], tip_pedagogico: 'Usa los números que sí tienes para descubrir el patrón.' },
          preguntas: [
            { id: qid(), enunciado: '4, ___, 12, 16, 20. ¿Cuál es el número faltante?', tipo: 'numerico', respuesta_correcta: '8' },
            { id: qid(), enunciado: '3, 6, ___, 24, 48. ¿Cuál falta?', tipo: 'numerico', respuesta_correcta: '12' },
          ]
        }
      ]
    },
    {
      moduloId: 2, nombre: 'Combinatoria Visual', descripcion: 'Cuenta las posibilidades cruzando conjuntos.', icono: 'shuffle', color: '#FBBF24',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Cruzar dos conjuntos (camisas × shorts).',
          teoria: { titulo: 'Principio de Multiplicación', parrafos: ['Si tienes 3 camisas y 2 pantalones, las combinaciones son 3 × 2 = 6.', 'Cada camisa se combina con cada pantalón.'], ejemplos: [{ enunciado: '3 camisas × 2 shorts', respuesta: '6 combinaciones' }], tip_pedagogico: 'Dibuja un diagrama de árbol: de cada camisa salen 2 ramas (una por pantalón).' },
          preguntas: [
            { id: qid(), enunciado: 'Ana tiene 4 blusas y 3 faldas. ¿Cuántos outfits diferentes puede armar?', tipo: 'numerico', respuesta_correcta: '12' },
            { id: qid(), enunciado: 'Hay 3 sabores de helado y 2 tipos de cono. ¿Cuántas opciones hay?', tipo: 'numerico', respuesta_correcta: '6' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Trazos posibles sin levantar el dedo.',
          teoria: { titulo: 'Caminos y Trazos', parrafos: ['En una cuadrícula 2×2 hay varios caminos del punto A al punto B.', 'Cuenta cada ruta posible sin repetir segmentos.'], tip_pedagogico: 'Dibuja todas las opciones sistemáticamente.' },
          preguntas: [
            { id: qid(), enunciado: 'En una cuadrícula 2×2 (del punto inferior-izquierdo al superior-derecho), solo puedes ir arriba o derecha. ¿Cuántos caminos hay?', tipo: 'numerico', respuesta_correcta: '6' },
            { id: qid(), enunciado: 'Tienes 2 caminos del punto A al B, y 3 del B al C. ¿Cuántos caminos totales hay de A a C?', tipo: 'numerico', respuesta_correcta: '6' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Agrupaciones exactas sin sobras.',
          teoria: { titulo: 'Divisibilidad y Agrupaciones', parrafos: ['Si tienes 24 bombones y quieres hacer paquetes de 6, puedes hacer 24÷6 = 4 paquetes exactos.', 'Si el número no es divisible, sobran unidades.'], tip_pedagogico: 'Divide y revisa si el resto es 0.' },
          preguntas: [
            { id: qid(), enunciado: '36 alumnos se dividen en equipos de 4. ¿Cuántos equipos se forman?', tipo: 'numerico', respuesta_correcta: '9' },
            { id: qid(), enunciado: 'Tengo 50 galletas para empacar de a 8. ¿Cuántos paquetes completos puedo hacer y cuántas sobran?', tipo: 'opcion_multiple', opciones: ['6 paquetes, sobran 2', '7 paquetes, sobran 0', '5 paquetes, sobran 10'], respuesta_correcta: '6 paquetes, sobran 2' },
          ]
        }
      ]
    },
    {
      moduloId: 3, nombre: 'Probabilidad', descripcion: 'Comprende la probabilidad con ejemplos cotidianos.', icono: 'target', color: '#D97706',
      niveles: [
        {
          nivelId: 1, nombre: 'Descubrimiento', descripcion: 'Conceptos de posible, imposible, seguro.',
          teoria: { titulo: 'Posible, Imposible y Seguro', parrafos: ['Imposible: sacar una bola verde de una urna que solo tiene rojas.', 'Seguro: sacar una bola roja de una urna que solo tiene rojas.', 'Posible: puede o no ocurrir.'], tip_pedagogico: 'Pregúntate: ¿puede pasar? ¿siempre pasa? ¿nunca pasa?' },
          preguntas: [
            { id: qid(), enunciado: 'Una urna tiene 5 bolas rojas y 0 azules. ¿Sacar una bola azul es...?', tipo: 'opcion_multiple', opciones: ['Posible', 'Imposible', 'Seguro'], respuesta_correcta: 'Imposible' },
            { id: qid(), enunciado: 'Un dado de 6 caras: ¿sacar un número menor que 7 es...?', tipo: 'opcion_multiple', opciones: ['Posible', 'Imposible', 'Seguro'], respuesta_correcta: 'Seguro' },
          ]
        },
        {
          nivelId: 2, nombre: 'Consolidación', descripcion: 'Mayor/menor probabilidad.',
          teoria: { titulo: 'Comparar Probabilidades', parrafos: ['Si hay 3 bolas rojas y 1 azul, es más probable sacar roja.', 'El color con más bolas tiene más chances.'], tip_pedagogico: 'Más cantidad = más probabilidad.' },
          preguntas: [
            { id: qid(), enunciado: 'Urna: 6 bolas rojas, 2 azules, 2 verdes. ¿Cuál color es más probable sacar?', tipo: 'opcion_multiple', opciones: ['Roja', 'Azul', 'Verde', 'Todas iguales'], respuesta_correcta: 'Roja' },
            { id: qid(), enunciado: 'Urna: 3 triángulos, 5 círculos, 2 cuadrados. ¿Cuál forma es MENOS probable?', tipo: 'opcion_multiple', opciones: ['Triángulo', 'Círculo', 'Cuadrado'], respuesta_correcta: 'Cuadrado' },
          ]
        },
        {
          nivelId: 3, nombre: 'Fluidez', descripcion: 'Fracción probabilística simple.',
          teoria: { titulo: 'Probabilidad como Fracción', parrafos: ['Probabilidad = casos favorables / total de casos.', 'Urna con 3 rojas de 10 bolas: P(roja) = 3/10.'], tip_pedagogico: 'Numerador = lo que quieres. Denominador = el total.' },
          preguntas: [
            { id: qid(), enunciado: 'Una urna tiene 4 bolas rojas y 6 azules. ¿Cuál es la probabilidad de sacar roja?', tipo: 'opcion_multiple', opciones: ['4/10', '6/10', '4/6', '10/4'], respuesta_correcta: '4/10' },
            { id: qid(), enunciado: 'Un dado de 6 caras. ¿Cuál es la probabilidad de sacar un número par?', tipo: 'opcion_multiple', opciones: ['1/6', '2/6', '3/6', '4/6'], respuesta_correcta: '3/6' },
          ]
        }
      ]
    },
    {
      moduloId: 4, nombre: 'Simulador Pedro II', descripcion: 'Practica con el formato real del examen.', icono: 'graduation', color: '#B45309',
      niveles: [
        {
          nivelId: 1, nombre: 'Sesión Fases 1-4', descripcion: '10 preguntas aleatorias de Aritmética, Texto, Fracciones.',
          teoria: { titulo: 'Simulador Pedro II — Nivel 1', parrafos: ['Este simulador mezcla preguntas de las Fases 1 a 4.', 'Tienes 10 preguntas: responde con calma y atención.'], tip_pedagogico: 'Lee cada enunciado dos veces antes de responder.' },
          preguntas: [
            { id: qid(), enunciado: '¿Cuánto es 3/4 de 60?', tipo: 'numerico', respuesta_correcta: '45' },
            { id: qid(), enunciado: 'Un gráfico muestra: 40% fútbol, 25% básquet, 35% vóley. Si hay 200 alumnos, ¿cuántos prefieren vóley?', tipo: 'numerico', respuesta_correcta: '70' },
          ]
        },
        {
          nivelId: 2, nombre: 'Sesión Fases 5-7', descripcion: '10 preguntas de Geometría, Coordenadas y Tiempo.',
          teoria: { titulo: 'Simulador Pedro II — Nivel 2', parrafos: ['Ahora las preguntas incluyen geometría, mapas y tiempo.', 'Dibuja cuando sea necesario.'], tip_pedagogico: 'Un dibujo rápido ahorra errores.' },
          preguntas: [
            { id: qid(), enunciado: 'Un rectángulo de 7 cm × 4 cm. ¿Cuál es su área?', tipo: 'numerico', respuesta_correcta: '28' },
            { id: qid(), enunciado: 'Salgo a las 8:25 y el viaje dura 1h40min. ¿A qué hora llego?', tipo: 'opcion_multiple', opciones: ['10:05', '9:55', '10:15'], respuesta_correcta: '10:05' },
          ]
        },
        {
          nivelId: 3, nombre: 'Maratón Final', descripcion: '20 preguntas con el estilo del Pedro II.',
          teoria: { titulo: 'Maratón Final Pedro II', parrafos: ['¡Esta es la prueba definitiva!', '20 preguntas que mezclan TODAS las fases.', 'Necesitas 90% de aciertos para maestría.'], tip_pedagogico: 'Administra tu tiempo: no te detengas demasiado en una pregunta.' },
          preguntas: [
            { id: qid(), enunciado: 'En un dado de 6 caras, ¿cuál es la probabilidad de sacar un número mayor que 4?', tipo: 'opcion_multiple', opciones: ['1/6', '2/6', '3/6', '4/6'], respuesta_correcta: '2/6' },
            { id: qid(), enunciado: 'Ana tiene 3 camisas y 4 pantalones. ¿Cuántas combinaciones puede armar?', tipo: 'numerico', respuesta_correcta: '12' },
          ]
        }
      ]
    }
  ]
};

// ── Export: Todas las fases ─────────────────────────────────────

export const ALL_FASES: FaseMetadata[] = [FASE_3, FASE_4, FASE_5, FASE_6, FASE_7, FASE_8];

export function getFaseMetadata(faseId: number): FaseMetadata | undefined {
  return ALL_FASES.find(f => f.faseId === faseId);
}
