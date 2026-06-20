export const ENDPOINTS = {
  AUTH: { REGISTER: "/auth/register", LOGIN: "/auth/login", ME: "/users/me" },
  ADMIN_USERS: { LIST_OR_SAVE: "/users", DELETE: (id: string) => `/users/${id}`, CREATE: "/admin/users", CHANGE_PASSWORD: (id: string) => `/admin/users/${id}/password`, ANONYMIZE: (id: string) => `/admin/users/${id}/forget` },
  ADMIN_PEDAGOGIA: { FASES: "/admin/fases", FASE_BY_ID: (id: number) => `/admin/fases/${id}`, CONFIGURACIONES: "/admin/configuracion", CONFIGURACION_BY_ID: (id: number) => `/admin/configuracion/${id}` },
  ADMIN_EJERCICIOS: { PREGUNTAS: "/admin/preguntas", PREGUNTA_BY_ID: (id: number) => `/admin/preguntas/${id}`, TEORIA: "/admin/teoria" },
  ADMIN_ALUMNOS: { SEARCH: "/admin/alumnos/search", PROGRESS: (id: number) => `/admin/alumnos/${id}/progress`, OVERRIDE_PROGRESS: (id: number) => `/admin/alumnos/${id}/progress/override`, OVERRIDE_PROGRESS_BULK: (id: number) => `/admin/alumnos/${id}/progress/override-bulk` },
  ADMIN_SYSTEM: { CONFIG: "/admin/system-config", SETTINGS: "/admin/settings" },
  ADMIN_ANALYTICS: { ENGAGEMENT: "/admin/analytics/engagement", CHURN_BY_LEVEL: "/admin/analytics/churn-by-level" },
  ADMIN_AI: { ALUMNO_INSIGHTS: (id: number) => `/ai/admin/alumnos/${id}/insights` }
};