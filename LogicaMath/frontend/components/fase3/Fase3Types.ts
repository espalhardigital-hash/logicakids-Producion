/**
 * Tipos TypeScript — Fase 3: Problemas de Texto y Sistemas Simples
 * Espeja exactamente los schemas de Fase 3 y del backend (fase3/router.py)
 */

export interface Fase3AlternativaOut {
  id: number;
  texto: string;
  orden?: number;
}

export interface Fase3Pregunta {
  id?: number;
  modulo_id: number;
  nivel_id: number;
  enunciado: string;
  tipo_pregunta: 'respuesta_numerica' | 'multiple_opcion' | 'constructor_operaciones';
  tiene_cronometro: boolean;
  tiempo_limite_segundos?: number;
  alternativas?: Fase3AlternativaOut[];
  datos_numericos?: Record<string, any>;
  explicacion_referencia?: Record<string, any>;
}

export interface Fase3AnswerPayload {
  modulo_id: number;
  nivel_id: number;
  pregunta_id?: number;
  respuesta_dada?: string;
  alternativa_id?: number;
  tiempo_respuesta_segundos?: number;
}

export interface Fase3AnswerResult {
  es_correcta: boolean;
  respuesta_correcta?: string;
  feedback_error?: string;
  aciertos_acumulados: number;
  intentos_totales: number;
  porcentaje_actual: number;
  bloque_completado: boolean;
  fase_completada?: boolean;
  early_exit: boolean;
  errores_sesion?: number;
  max_errores_tolerados?: number;
  // Bucle Espejo
  es_espejo?: boolean;
  intentos_espejo_actuales?: number;
  intentos_espejo_max?: number;
  soporte_avanzado?: boolean;
}

export interface Fase3NivelInfo {
  nivel_id: number;
  nombre: string;
  descripcion: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  usa_cronometro: boolean;
}

export interface Fase3DesafioInfo {
  desafio_id: number; // 11, 12, 13
  nombre: string;
  dificultad: 'estandar' | 'avanzada' | 'maestria';
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  tiempo_limite: number;
  max_errores: number;
}

export interface Fase3ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase3NivelInfo[];
  desafios: Fase3DesafioInfo[];
}

export interface Fase3Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  modulos: Fase3ModuloInfo[];
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'disponible' | 'completado';
}

export interface Fase3Lectura {
  modulo_id: number;
  nivel_id: number;
  titulo: string;
  parrafos: string[];
  diccionario?: Record<string, string>;
  ejemplos?: Array<{ 
    enunciado: string; 
    pasos?: Array<{ orden: number; texto: string }>;
    respuesta?: string;
  }>;
  interactivos?: Array<{
    pregunta?: string;
    respuesta: string;
    feedback_acierto: string;
    feedback_error: string;
  }>;
  tip_pedagogico?: string;
}
