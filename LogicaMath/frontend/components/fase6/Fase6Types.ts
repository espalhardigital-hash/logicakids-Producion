/**
 * Tipos TypeScript — Fase 6: Desarrollo Numérico y Razonamiento
 * Espeja exactamente los schemas Pydantic del backend (fase6/schemas.py)
 */

// ─── Alternativa (Opción Múltiple — Desafíos 1 y 2) ──────────────────────────

export interface Fase6AlternativaOut {
  id: number;
  texto: string;
  orden?: number;
}

// ─── Tokens (Módulo 4 — Detective de Historias - Legado) ─────────────────────

export interface Fase6Token {
  id: number;
  texto: string;
  es_dato_relevante: boolean;
  categoria?: 'cantidad' | 'unidad' | 'operacion' | 'irrelevante';
}

// ─── Pregunta para el alumno ───────────────────────────────────────────────

export interface Fase6PasoCadenado {
  titulo: string;
  descripcion: string;
  respuesta_correcta: string;
}

export interface Fase6Pregunta {
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
  alternativas?: Fase6AlternativaOut[];
  payload_tokenizado?: Fase6Token[];
  pasos_encadenados?: Fase6PasoCadenado[];
  datos_numericos?: Record<string, any>;
  explicacion_referencia?: Record<string, any>;
  aciertos_acumulados?: number;
  intentos_totales?: number;
  porcentaje_actual?: number;
  cantidad_requerida?: number;
}

// ─── Respuesta del alumno ──────────────────────────────────────────────────

export interface Fase6AnswerPayload {
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

export interface Fase6AnswerResult {
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

export interface Fase6NivelInfo {
  nivel_id: number;
  nombre: string;
  descripcion: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  usa_cronometro: boolean;
}

export interface Fase6DesafioInfo {
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

export interface Fase6ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase6NivelInfo[];
  desafios: Fase6DesafioInfo[];
}

export interface Fase6Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  modulos: Fase6ModuloInfo[];
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'disponible' | 'completado';
}

// ─── Lectura / Teoría ─────────────────────────────────────────────────────

export interface Fase6Lectura {
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

