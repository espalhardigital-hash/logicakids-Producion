/**
 * Tipos TypeScript — Fase 8
 * Espeja los schemas Pydantic del backend (fase9/schemas.py)
 */

export interface Fase9AlternativaOut {
  id: number;
  texto: string;
  orden?: number;
}

export interface Fase9Pregunta {
  id?: number;
  modulo_id: number;
  nivel_id: number;
  enunciado: string;
  tipo_pregunta: 'respuesta_numerica' | 'multiple_opcion';
  respuesta_correcta?: string;
  tiene_cronometro: boolean;
  tiempo_limite_segundos?: number;
  alternativas?: Fase9AlternativaOut[];
  datos_numericos?: Record<string, any>;
  aciertos_acumulados?: number;
  intentos_totales?: number;
  porcentaje_actual?: number;
}

export interface Fase9AnswerPayload {
  modulo_id: number;
  nivel_id: number;
  pregunta_id?: number;
  respuesta_dada?: string;
  alternativa_id?: number;
  tiempo_respuesta_segundos?: number;
}

export interface Fase9AnswerResult {
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

export interface Fase9NivelInfo {
  nivel_id: number;
  nombre: string;
  descripcion: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  usa_cronometro: boolean;
}

export interface Fase9DesafioInfo {
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

export interface Fase9ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase9NivelInfo[];
  desafios: Fase9DesafioInfo[];
}

export interface Fase9Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  modulos: Fase9ModuloInfo[];
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'disponible' | 'completado';
}

export interface Fase9Lectura {
  modulo_id: number;
  nivel_id: number;
  titulo: string;
  parrafos: string[];
  diccionario?: Record<string, string>;
  ejemplos?: Array<any>;
  interactivos?: Array<any>;
  tip_pedagogico?: string;
}
