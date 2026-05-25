/**
 * Servicio API — Fase 2: Desarrollo Numérico y Razonamiento
 * Capa de comunicación con el backend de Fase 2.
 */

import type {
  Fase2Dashboard,
  Fase2Pregunta,
  Fase2AnswerPayload,
  Fase2AnswerResult,
  Fase2Lectura,
} from './Fase2Types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  // Compatibilidad con el sistema de almacenamiento de tokens del proyecto
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('auth_token') ||
    '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Error HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const activeRequests = new Map<string, Promise<any>>();

async function fetchDeduplicated<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const existing = activeRequests.get(key);
  if (existing) {
    return existing;
  }
  const promise = fetchFn().finally(() => {
    activeRequests.delete(key);
  });
  activeRequests.set(key, promise);
  return promise;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el dashboard de Fase 2 con los 5 módulos y su estado.
 */
export async function getFase2Dashboard(): Promise<Fase2Dashboard> {
  const key = 'dashboard';
  return fetchDeduplicated(key, async () => {
    const res = await fetch(`${API_URL}/fase2/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Fase2Dashboard>(res);
  });
}

/**
 * Obtiene la siguiente pregunta para un módulo y nivel específicos.
 */
export async function getFase2Question(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase2Pregunta> {
  const key = `question-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase2/modulo/${moduloId}/nivel/${nivelId}/pregunta?reload=${reload}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase2Pregunta>(res);
  });
}

/**
 * Envía la respuesta del alumno y recibe el resultado con feedback.
 */
export async function submitFase2Answer(
  payload: Fase2AnswerPayload
): Promise<Fase2AnswerResult> {
  const res = await fetch(`${API_URL}/fase2/responder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Fase2AnswerResult>(res);
}

/**
 * Obtiene el contenido de lectura/teoría de un nivel.
 */
export async function getFase2Reading(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase2Lectura> {
  const key = `reading-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase2/lectura/${moduloId}/nivel/${nivelId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase2Lectura>(res);
  });
}

/**
 * Gradúa al alumno de Fase 2 a Fase 3 (requiere todos los módulos dominados).
 */
export async function graduateFase2(): Promise<{
  message: string;
  nueva_fase_id: number;
  nueva_fase_nombre: string;
}> {
  const res = await fetch(`${API_URL}/fase2/graduate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

