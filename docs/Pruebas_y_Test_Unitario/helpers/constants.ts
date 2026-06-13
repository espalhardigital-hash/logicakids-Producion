/**
 * Constantes centralizadas para las pruebas E2E de LogicaKids.
 *
 * Contiene credenciales del usuario de prueba, rutas del frontend,
 * endpoints de la API, selectores CSS y configuración de aprobación.
 */

// ─── Usuario de Prueba ───────────────────────────────────────────────
export const TEST_USER = {
  email: process.env.TEST_EMAIL || 'pruebas_automaticas_2@gmail.com',
  password: process.env.TEST_PASSWORD || 'pruebas',
};

// ─── Rutas del Frontend ──────────────────────────────────────────────
export const ROUTES = {
  LOGIN: '/login',
  MAP: '/map',
  WELCOME_FASE1: '/welcome',
  WELCOME_FASE2: '/welcome-fase2',
  WELCOME_FASE3: '/welcome-fase3',
  WELCOME_FASE4: '/welcome-fase4',
  WELCOME_FASE5: '/welcome-fase5',
  WELCOME_FASE6: '/welcome-fase6',
  WELCOME_FASE7: '/welcome-fase7',
  WELCOME_FASE8: '/welcome-fase8',
  WELCOME_FASE9: '/welcome-fase9',
  WELCOME_FASE_GENERIC: '/welcome-fase', // Fases 7-8
  PLAY_FASE1: '/play',
  PLAY_FASE2: '/fase2/play',
  PLAY_FASE3: '/fase3/play',
  PLAY_FASE4: '/fase4/play',
  PLAY_FASE5: '/fase5/play',
  PLAY_FASE6: '/fase6/play',
  PLAY_FASE_GENERIC: '/fase/play', // Fases 7-8
  LEVEL_SELECTION: '/level-selection',
  RESULTS: '/results',
  PROGRESS: '/progress',
  PROFILE: '/profile',
} as const;

// ─── Endpoints de la API ─────────────────────────────────────────────
export const API = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  USER_ME: '/api/users/me',
  USER_PROFILE: '/api/users/me/profile',
  PROGRESS_BLOCKS: '/api/users/me/progress/blocks',
  PROGRESS_SUMMARY: '/api/users/me/progress/summary',
  PROGRESS_HISTORY: '/api/users/me/progress/history',
  FASE1_DASHBOARD: '/api/fase1/dashboard',
  FASE1_RESPONDER: '/api/fase1/responder',
  ADMIN_SETTINGS: '/api/admin/settings',
  ADMIN_CONFIG: '/api/admin/configuracion',
} as const;

// ─── Selectores CSS del LoginScreen ──────────────────────────────────
export const SELECTORS = {
  // Login
  EMAIL_INPUT: 'input[type="email"][placeholder="Correo Electrónico"]',
  PASSWORD_INPUT: 'input[placeholder="Contraseña"]',
  SUBMIT_BUTTON_LOGIN: 'button[type="submit"]',
  GUEST_BUTTON: 'button:has-text("Continuar como Invitado")',
  REGISTER_LINK: 'button:has-text("Regístrate")',
  LOGIN_LINK: 'button:has-text("Inicia Sesión")',
  ERROR_MESSAGE: '.text-red-500, .text-red-400',
  APP_TITLE: 'h1:has-text("Logica Kids")',

  // Mapa de Fases
  PHASE_MAP_CONTAINER: '#root',

  // Gameplay genérico
  ROOT_CONTAINER: '#root',
} as const;

// ─── Configuración de Aprobación ─────────────────────────────────────
export const GAME_CONFIG = {
  /** Porcentaje mínimo de aprobación por defecto */
  DEFAULT_PASSING_SCORE: 90,

  /** Estados de bloque */
  BLOCK_STATE: {
    BLOQUEADO: 'BLOQUEADO',
    EN_PROGRESO: 'EN_PROGRESO',
    APROBADO: 'APROBADO',
  },

  /** Tolerancia de Early Exit por cantidad de preguntas */
  EARLY_EXIT_TOLERANCE: {
    10: 2,
    15: 2,
    20: 3,
    25: 3,
    50: 6,
  },
} as const;

// ─── Fases disponibles para iteración ────────────────────────────────
export const PHASES = [
  { id: 1, name: 'Aritmética Básica', welcomePath: '/welcome', playPath: '/play' },
  { id: 2, name: 'Desarrollo Numérico', welcomePath: '/welcome-fase2', playPath: '/fase2/play' },
  { id: 3, name: 'Problemas de Texto', welcomePath: '/welcome-fase3', playPath: '/fase3/play' },
  { id: 4, name: 'Fracciones y Porcentajes', welcomePath: '/welcome-fase4', playPath: '/fase4/play' },
  { id: 5, name: 'Geometría Plana', welcomePath: '/welcome-fase5', playPath: '/fase5/play' },
  { id: 6, name: 'Geometría Espacial', welcomePath: '/welcome-fase6', playPath: '/fase6/play' },
] as const;

export const GENERIC_PHASES = [
  { id: 7, name: 'Coordenadas y Tiempo', welcomePath: '/welcome-fase7', playPath: '/fase/play' },
  { id: 8, name: 'Lógica y Probabilidad', welcomePath: '/welcome-fase8', playPath: '/fase/play' },
] as const;
