/**
 * Tipos TypeScript — Fase 5: Desarrollo Numérico y Razonamiento
 * Espeja exactamente los schemas Pydantic del backend (fase5/schemas.py)
 */

// ─── Alternativa (Opción Múltiple — Desafíos 1 y 2) ──────────────────────────

export interface Fase5AlternativaOut {
  id: number;
  texto: string;
  orden?: number;
}

// ─── Tokens (Módulo 4 — Detective de Historias - Legado) ─────────────────────

export interface Fase5Token {
  id: number;
  texto: string;
  es_dato_relevante: boolean;
  categoria?: 'cantidad' | 'unidad' | 'operacion' | 'irrelevante';
}

// ─── Pregunta para el alumno ───────────────────────────────────────────────

export interface Fase5PasoCadenado {
  titulo: string;
  descripcion: string;
  respuesta_correcta: string;
}

export interface Fase5Pregunta {
  id?: number;
  modulo_id: number;
  nivel_id: number;
  enunciado: string;
  enunciado_seed?: string;
  tipo_pregunta:
    | 'respuesta_numerica'
    | 'multiple_opcion'
    | 'subrayado_tokens'
    | 'constructor_soluciones_chained';
  respuesta_correcta?: string;
  tiene_cronometro: boolean;
  tiempo_limite_segundos?: number;
  alternativas?: Fase5AlternativaOut[];
  payload_tokenizado?: Fase5Token[];
  pasos_encadenados?: Fase5PasoCadenado[];
  datos_numericos?: Record<string, any>;
  explicacion_referencia?: Record<string, any>;
  aciertos_acumulados?: number;
  intentos_totales?: number;
  porcentaje_actual?: number;
  cantidad_requerida?: number;
}

// ─── Respuesta del alumno ──────────────────────────────────────────────────

export interface Fase5AnswerPayload {
  modulo_id: number;
  nivel_id: number;
  pregunta_id?: number;
  enunciado_seed?: string;
  respuesta_dada?: string;
  alternativa_id?: number;
  tokens_seleccionados?: number[];
  paso_numero?: number;
  tiempo_respuesta_segundos?: number;
}

// ─── Resultado de respuesta ────────────────────────────────────────────────

export interface Fase5AnswerResult {
  es_correcta: boolean;
  respuesta_correcta?: string;
  explicacion?: Record<string, any>;
  feedback_error?: string;
  aciertos_acumulados: number;
  intentos_totales: number;
  porcentaje_actual: number;
  bloque_completado: boolean;
  fase_completada: boolean;
  // Bucle Espejo
  es_espejo: boolean;
  intentos_espejo_actuales: number;
  intentos_espejo_max: number;
  soporte_avanzado: boolean;
  // Early Exit
  early_exit?: boolean;
  errores_sesion?: number;
  max_errores_tolerados?: number;
  // Módulo 4
  tokens_correctos?: number[];
  // Módulo 5 (ahora Módulo 4 Constructor)
  paso_approved?: number; // legacy
  paso_aprobado?: number;
  valor_paso1_congelado?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────

export interface Fase5NivelInfo {
  nivel_id: number;
  nombre: string;
  descripcion: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  usa_cronometro: boolean;
}

export interface Fase5DesafioInfo {
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

export interface Fase5ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase5NivelInfo[];
  desafios: Fase5DesafioInfo[];
}

export interface Fase5Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  modulos: Fase5ModuloInfo[];
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'disponible' | 'completado';
}

// ─── Lectura / Teoría ─────────────────────────────────────────────────────

export interface Fase5Lectura {
  modulo_id: number;
  nivel_id: number;
  titulo: string;
  parrafos: string[];
  diccionario?: Record<string, string>;
  ejemplos?: Array<{ 
    enunciado: string; 
    pasos?: Array<{ orden: number; texto: string }>;
    respuesta?: string; // Legacy / Fallback
  }>;
  interactivos?: Array<{
    enunciado?: string;
    pregunta?: string; // Legacy
    pasos?: Array<{ orden: number; texto: string }>;
    respuesta: string;
    feedback_acierto: string;
    feedback_error: string;
  }>;
  tip_pedagogico?: string;
}

