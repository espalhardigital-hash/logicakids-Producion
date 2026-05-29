/**
 * Fase4Types.ts
 * ─────────────────────────────────────────────────────────────
 * Espeja exactamente los schemas de la Fase 4 y del backend (fase4/router.py)
 */

export interface Fase4AlternativaOut {
  id: number;
  texto: string;
}

export interface Fase4Pregunta {
  id: number;
  enunciado: string;
  tipo_pregunta: 'multiple_opcion' | 'respuesta_numerica';
  alternativas?: Fase4AlternativaOut[];
  tiene_cronometro: boolean;
  tiempo_limite_segundos?: number;
  datos_numericos?: {
    tipo_visual?: 'pizza' | 'thermometer';
    cortes?: number;
    sombreados?: number[];
    nivel?: number;
    [key: string]: any;
  };
  respuesta_correcta?: string;
  aciertos_acumulados?: number;
  intentos_totales?: number;
  porcentaje_actual?: number;
  cantidad_requerida?: number;
}

export interface Fase4AnswerPayload {
  modulo_id: number;
  nivel_id: number;
  pregunta_id: number;
  respuesta_dada?: string;
  alternativa_id?: number;
  tiempo_respuesta_segundos: number;
}

export interface Fase4AnswerResult {
  es_correcta: boolean;
  feedback_tutor: string;
  aciertos_acumulados: number;
  intentos_totales: number;
  porcentaje_actual: number;
  bloque_completado: boolean;
  fase_completada: boolean;
  es_espejo: boolean;
  early_exit: boolean;
  respuesta_correcta: string;
  explicacion_profunda?: string;
}

export interface Fase4NivelInfo {
  nivel_id: number;
  nombre: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  aciertos: number;
  porcentaje: number;
}

export interface Fase4DesafioInfo {
  desafio_id: number;
  nombre: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  aciertos: number;
  porcentaje: number;
  dificultad: 'estandar' | 'avanzada' | 'maestria';
  tiempo_limite: number;
  max_errores: number;
}

export interface Fase4ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase4NivelInfo[];
  desafios: Fase4DesafioInfo[];
}

export interface Fase4Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'en_progreso' | 'completado';
  modulos: Fase4ModuloInfo[];
}

export interface Fase4Lectura {
  modulo_id: number;
  nivel_id: number;
  titulo: string;
  parrafos: string[];
  ejemplos?: { enunciado: string; respuesta?: string; pasos?: { orden: number; texto: string }[] }[];
  tip_pedagogico?: string;
  diccionario?: Record<string, string>;
  interactivos?: { enunciado: string; respuesta: string; feedback_acierto: string; feedback_error: string }[];
}

export interface Fase4CerrarRescate {
  modulo_id: number;
  nivel_id: number;
  success?: boolean;
}
