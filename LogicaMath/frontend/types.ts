
export enum GameScreenState {
  LOGIN,
  PHASE_MAP,        // Nuevo estado principal post-login
  WELCOME,
  SUBJECT_SELECTION,
  PLAYING,
  RESULTS,
  LEADERBOARD,
  STUDY_TABLES,
  PROFILE,
  ADMIN_PANEL,
  LEVEL_SELECTION,
  MY_PROGRESS
}


export type GameCategory =
  | 'challenge'
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'mixed_add_sub'
  | 'mixed_mult_add'
  | 'all_mixed'
  | 'logic_sequences'
  | 'logic_patterns'
  | 'logic_puzzles'
  | 'gym'
  | 'tables_action'
  | 'store'
  | 'detective'
  | 'builder'
  | 'challenge_fase2';

export type Difficulty = 'easy' | 'easy_medium' | 'medium' | 'medium_hard' | 'hard' | 'random_tables';

export interface Question {
  id?: number;
  text: string;
  answer: number;
}

export interface AlternativaParaAlumno {
  id: number;
  texto: string;
  orden: number;
}

export interface PreguntaParaAlumno {
  id: number;
  enunciado: string;
  tipo_pregunta: string;
  operacion: string;
  requiere_subrayado: boolean;
  tiene_cronometro: boolean;
  tiempo_limite_segundos: number | null;
  alternativas: AlternativaParaAlumno[];
}

export interface ResultadoRespuesta {
  es_correcta: boolean;
  respuesta_correcta: string;
  tipo_feedback: string;
  aciertos_acumulados: number;
  intentos_totales: number;
  porcentaje_actual: number;
  bloque_completado: boolean;
  fase_completada: boolean;
  explicacion_paso_a_paso?: string;
  tipo_error?: string;
  feedback_error?: string;
}

export interface ScoreRecord {
  id: string;
  user: string;
  score: number;
  correctCount: number;
  errorCount: number;
  avgTime: number;
  date: string;
  subject_id?: string;
  category?: string;
  difficulty?: string;
}

export interface GameStats {
  correct: number;
  incorrect: number;
  totalTime: number;
}

// --- NEW USER TYPES ---

export type UserRole = 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface UserSettings {
  customTimers?: Partial<Record<Difficulty, number>>; // Custom seconds per difficulty
  unlockedLevels?: Record<string, number>; // Category -> Level Index
}

export interface User {
  id: string;
  username: string;
  email: string;
  /**
   * @internal
   * WARNING: Never expose this field in the frontend UI. It is only needed for the backend/authentication layer.
   */
  password: string; // Password hash stored in backend
  role: UserRole;
  status: UserStatus;
  avatar?: string; // Base64 string
  createdAt: string;
  lastLogin?: string;
  settings: UserSettings;
  unlockedLevel: number;
  fase_actual_id?: number;
}

export interface CategoryProgress {
  category: string;
  unlocked_level: number;
  total_games: number;
  total_score: number;
  total_correct: number;
  total_errors: number;
  total_time_seconds: number;
  accuracy_rate?: number;
  avg_response_time?: number;
}

export interface GlobalPedagogySubConfig {
  cantidad_requerida: number;
  porcentaje_aprobacion: number;
  usa_cronometro: boolean;
  tiempo_default_segundos: number;
  tipo_feedback: string;
}

export interface GlobalDesafiosSubConfig {
  cantidad_requerida: number;
  porcentaje_aprobacion: number;
  usa_cronometro: boolean;
  tiempo_default_segundos_11: number;
  tiempo_default_segundos_12: number;
  tiempo_default_segundos_13: number;
  tipo_feedback: string;
}

export interface PedagogyConfig {
  practica_libre: GlobalPedagogySubConfig;
  desafios: GlobalDesafiosSubConfig;
  // Legacy / Fase-1 compatibility fields (optional)
  passingScore?: number;
  questionsPerPhase?: number;
  useTimer?: boolean;
  timers?: {
    easy?: number;
    easy_medium?: number;
    medium?: number;
    medium_hard?: number;
    hard?: number;
    random_tables?: number;
  };
}

export interface ConfiguracionProgreso {
  id?: number;
  fase_id: number;
  seccion: number;
  operacion: string;
  cantidad_requerida: number;
  porcentaje_aprobacion: number;
  orden_desbloqueo: number;
  tipo_feedback: string;
  usa_cronometro: boolean;
  tiempo_default_segundos: number | null;
  activo?: boolean;
  fecha_creacion?: string;
  ultima_modificacion?: string;
}

export interface AcademicBlockProgress {
  fase_id: number;
  fase_titulo: string;
  modulo_id: number;
  modulo_titulo: string;
  nivel_id?: number | null;
  nivel_titulo?: string | null;
  desafio_id?: number | null;
  desafio_titulo?: string | null;
  seccion: number;
  operacion: 'suma' | 'resta' | 'multiplicacion' | 'division' | 'mixta';

  estado: 'BLOQUEADO' | 'EN_PROGRESO' | 'APROBADO';
  porcentaje_actual: number;
  completitud_actual: number;
  aciertos_acumulados: number;
  intentos_totales: number;

  desbloqueado_por_admin: boolean;
  aprobado_por_admin: boolean;
  override_tipo?: 'unlock' | 'approve' | 'lock' | 'reset' | null;
  override_motivo?: string | null;
  override_fecha?: string | null;

  ultimo_intento_at?: string | null;
  siguiente_bloque_disponible?: boolean;
}

export interface StudentAttemptSummary {
  id: string;
  alumno_id: string;
  session_id: string;

  fase_id: number;
  modulo_id: number;
  nivel_id?: number | null;
  desafio_id?: number | null;
  seccion: number;
  operacion: 'suma' | 'resta' | 'multiplicacion' | 'division' | 'mixta';

  porcentaje: number;
  completitud: number;
  aciertos: number;
  errores: number;
  intentos_totales: number;
  tiempo_promedio_segundos: number;

  tipo_pool: 'practica' | 'desafio';
  estado_resultado:
    | 'APROBADO'
    | 'NO_APROBADO'
    | 'EN_PROGRESO'
    | 'EARLY_EXIT'
    | 'RESCATE_COMPLETADO'
    | 'ADMIN_UNLOCK'
    | 'ADMIN_APPROVE';

  tiempo_limite_configurado?: number | null;
  preguntas_configuradas?: number | null;

  fecha_inicio: string;
  fecha_fin: string;
}

export interface ProgressSummary {
  alumno_id: string;
  total_bloques_trabajados: number;
  total_bloques_aprobados: number;
  total_bloques_liberados_admin: number;
  total_bloques_aprobados_admin: number;
  precision_promedio: number;
  completitud_promedio: number;
  total_aciertos: number;
  total_errores: number;
  tiempo_total_segundos: number;
}


