/**
 * Tipos TypeScript — Fase 8
 * Espeja los schemas Pydantic del backend (fase8/schemas.py)
 */

export interface Fase8AlternativaOut {
  id: number;
  texto: string;
  orden?: number;
}

export interface Fase8Pregunta {
  id?: number;
  modulo_id: number;
  nivel_id: number;
  enunciado: string;
  tipo_pregunta: 'respuesta_numerica' | 'multiple_opcion' | 'subrayado_tokens' | 'constructor_soluciones_chained';
  respuesta_correcta?: string;
  tiene_cronometro: boolean;
  tiempo_limite_segundos?: number;
  alternativas?: Fase8AlternativaOut[];
  datos_numericos?: Record<string, any>;
  aciertos_acumulados?: number;
  intentos_totales?: number;
  porcentaje_actual?: number;
  cantidad_requerida?: number;
  enunciado_seed?: any;
  pasos_encadenados?: any;
}

export interface Fase8AnswerPayload {
  modulo_id: number;
  nivel_id: number;
  pregunta_id?: number;
  respuesta_dada?: string;
  alternativa_id?: number;
  tiempo_respuesta_segundos?: number;
  enunciado_seed?: any;
}

export interface Fase8AnswerResult {
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
  valor_paso1_congelado?: string;
  paso_aprobado?: boolean;
  paso_approved?: boolean;
}

export interface Fase8NivelInfo {
  nivel_id: number;
  nombre: string;
  descripcion: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  usa_cronometro: boolean;
}

export interface Fase8DesafioInfo {
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

export interface Fase8ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase8NivelInfo[];
  desafios: Fase8DesafioInfo[];
}

export interface Fase8Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  modulos: Fase8ModuloInfo[];
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'disponible' | 'completado';
}

export interface Fase8Lectura {
  modulo_id: number;
  nivel_id: number;
  titulo: string;
  parrafos: string[];
  diccionario?: Record<string, string>;
  ejemplos?: Array<any>;
  interactivos?: Array<any>;
  tip_pedagogico?: string;
}

export interface Fase8Token {
  id: number;
  texto: string;
}
