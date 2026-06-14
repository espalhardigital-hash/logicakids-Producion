/**
 * Tipos TypeScript — Fase 7
 * Espeja los schemas Pydantic del backend (fase7/schemas.py)
 */

export interface Fase7AlternativaOut {
  id: number;
  texto: string;
  orden?: number;
}

export interface Fase7Pregunta {
  id?: number;
  modulo_id: number;
  nivel_id: number;
  enunciado: string;
  tipo_pregunta: 'respuesta_numerica' | 'multiple_opcion';
  respuesta_correcta?: string;
  tiene_cronometro: boolean;
  tiempo_limite_segundos?: number;
  alternativas?: Fase7AlternativaOut[];
  datos_numericos?: Record<string, any>;
  aciertos_acumulados?: number;
  intentos_totales?: number;
  porcentaje_actual?: number;
}

export interface Fase7AnswerPayload {
  modulo_id: number;
  nivel_id: number;
  pregunta_id?: number;
  respuesta_dada?: string;
  alternativa_id?: number;
  tiempo_respuesta_segundos?: number;
}

export interface Fase7AnswerResult {
  es_correcta: boolean;
  respuesta_correcta?: string;
  explicacion?: Record<string, any>;
  feedback_error?: string;
  aciertos_acumulados: number;
  intentos_totales: number;
  porcentaje_actual: number;
  bloque_completado: boolean;
  fase_completada: boolean;
  es_espejo: boolean;
  intentos_espejo_actuales: number;
  intentos_espejo_max: number;
  soporte_avanzado: boolean;
  early_exit?: boolean;
  errores_sesion?: number;
  max_errores_tolerados?: number;
}

export interface Fase7NivelInfo {
  nivel_id: number;
  nombre: string;
  descripcion: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  usa_cronometro: boolean;
}

export interface Fase7DesafioInfo {
  desafio_id: number;
  nombre: string;
  dificultad: 'estandar' | 'avanzada' | 'maestria';
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  tiempo_limite: number;
  max_errores: number;
}

export interface Fase7ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase7NivelInfo[];
  desafios: Fase7DesafioInfo[];
}

export interface Fase7Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  modulos: Fase7ModuloInfo[];
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'disponible' | 'completado';
}

export interface Fase7Lectura {
  modulo_id: number;
  nivel_id: number;
  titulo: string;
  parrafos: string[];
  diccionario?: Record<string, string>;
  ejemplos?: Array<any>;
  interactivos?: Array<any>;
  tip_pedagogico?: string;
}
