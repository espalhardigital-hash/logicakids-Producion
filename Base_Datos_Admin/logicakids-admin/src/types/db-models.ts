export interface Alumno {
  id: string | number;
  user_id: string;
  nombre: string;
  edad?: number | null;
  estado: string;
  fase_actual_id: number;
  email?: string;
  username?: string;
  alumno_id?: number;
  alumno_nombre?: string;
}

export interface Fase {
  id: number;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  estado: string;
}

export interface ConfiguracionProgreso {
  id: number;
  fase_id: number;
  seccion: number;
  operacion: string;
  cantidad_requerida: number;
  porcentaje_aprobacion: number;
  orden_desbloqueo: number;
  tipo_feedback: string;
  usa_cronometro: boolean;
  tiempo_default_segundos?: number | null;
  activo: boolean;
}

export interface Alternativa {
  id?: number;
  pregunta_id?: number;
  texto: string;
  es_correcta: boolean;
  orden?: number | null;
  tipo_error?: string | null;
  feedback_error?: string | null;
}

export interface Pregunta {
  id: number;
  fase_id: number;
  seccion: number;
  sub_nivel?: number | null;
  estructura_padre_id?: string | null;
  operacion: string;
  tipo_pregunta: string;
  enunciado: string;
  respuesta_correcta: string;
  datos_numericos?: any;
  payload_tokenizado?: any;
  explicacion_paso_a_paso?: any;
  requiere_subrayado: boolean;
  palabras_clave?: any;
  errores_previstos?: any;
  estado: string;
  alternativas: Alternativa[];
  revisado_admin: boolean;
  revisado_por?: string | null;
  fecha_revision?: string | null;
}
