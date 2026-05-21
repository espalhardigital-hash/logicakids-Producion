/**
 * Tipos TypeScript — Fase 2: Desarrollo Numérico y Razonamiento
 * Espeja exactamente los schemas Pydantic del backend (fase2/schemas.py)
 */

// ─── Tokens (Módulo 4 — Detective de Historias) ───────────────────────────

export interface Fase2Token {
  id: number;
  texto: string;
  es_dato_relevante: boolean;
  categoria?: 'cantidad' | 'unidad' | 'operacion' | 'irrelevante';
}

// ─── Pregunta para el alumno ───────────────────────────────────────────────

export interface Fase2PasoCadenado {
  titulo: string;
  descripcion: string;
  respuesta_correcta: string;
}

export interface Fase2Pregunta {
  id?: number;
  modulo_id: number;
  nivel_id: number;
  enunciado: string;
  enunciado_seed?: string;
  tipo_pregunta:
    | 'respuesta_numerica'
    | 'subrayado_tokens'
    | 'constructor_soluciones_chained';
  respuesta_correcta?: string;
  tiene_cronometro: boolean;
  tiempo_limite_segundos?: number;
  payload_tokenizado?: Fase2Token[];
  pasos_encadenados?: Fase2PasoCadenado[];
  datos_numericos?: Record<string, unknown>;
  explicacion_referencia?: Record<string, unknown>;
}

// ─── Respuesta del alumno ──────────────────────────────────────────────────

export interface Fase2AnswerPayload {
  modulo_id: number;
  nivel_id: number;
  pregunta_id?: number;
  enunciado_seed?: string;
  respuesta_dada?: string;
  tokens_seleccionados?: number[];
  paso_numero?: number;
  tiempo_respuesta_segundos?: number;
}

// ─── Resultado de respuesta ────────────────────────────────────────────────

export interface Fase2AnswerResult {
  es_correcta: boolean;
  respuesta_correcta?: string;
  explicacion?: Record<string, unknown>;
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
  // Módulo 4
  tokens_correctos?: number[];
  // Módulo 5
  paso_aprobado?: number;
  valor_paso1_congelado?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────

export interface Fase2NivelInfo {
  nivel_id: number;
  nombre: string;
  descripcion: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje: number;
  aciertos: number;
  requeridos: number;
  usa_cronometro: boolean;
}

export interface Fase2ModuloInfo {
  modulo_id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: 'bloqueado' | 'en_progreso' | 'dominado';
  porcentaje_global: number;
  niveles: Fase2NivelInfo[];
}

export interface Fase2Dashboard {
  alumno_nombre: string;
  puntos_totales: number;
  modulos: Fase2ModuloInfo[];
  desafio_mixto_disponible: boolean;
  desafio_mixto_estado: 'bloqueado' | 'disponible' | 'completado';
}

// ─── Lectura / Teoría ─────────────────────────────────────────────────────

export interface Fase2Lectura {
  modulo_id: number;
  nivel_id: number;
  titulo: string;
  parrafos: string[];
  ejemplos?: Array<{ enunciado: string; respuesta: string }>;
  tip_pedagogico?: string;
}
