/**
 * Servicio API — Fase 3: Problemas de Texto y Sistemas Simples
 * Capa de comunicación con el backend de Fase 3.
 */

import type {
  Fase3Dashboard,
  Fase3Pregunta,
  Fase3AnswerPayload,
  Fase3AnswerResult,
  Fase3Lectura,
} from './Fase3Types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
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
 * Obtiene el dashboard de Fase 3 con los 4 módulos y su estado.
 */
export async function getFase3Dashboard(): Promise<Fase3Dashboard> {
  const key = 'dashboard-f3';
  return fetchDeduplicated(key, async () => {
    const res = await fetch(`${API_URL}/fase3/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Fase3Dashboard>(res);
  });
}

/**
 * Obtiene la siguiente pregunta para un módulo y nivel específicos.
 */
export async function getFase3Question(
  moduloId: number,
  nivelId: number
): Promise<Fase3Pregunta> {
  const key = `question-f3-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase3/modulo/${moduloId}/nivel/${nivelId}/pregunta`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase3Pregunta>(res);
  });
}

/**
 * Envía la respuesta del alumno y recibe el resultado con feedback.
 */
export async function submitFase3Answer(
  payload: Fase3AnswerPayload
): Promise<Fase3AnswerResult> {
  const res = await fetch(`${API_URL}/fase3/responder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Fase3AnswerResult>(res);
}

/**
 * Obtiene el contenido de lectura/teoría de un nivel.
 */
export async function getFase3Reading(
  moduloId: number,
  nivelId: number
): Promise<Fase3Lectura> {
  const key = `reading-f3-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase3/lectura/${moduloId}/nivel/${nivelId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase3Lectura>(res);
  });
}

/**
 * Gradúa al alumno de Fase 3 a Fase 4 (requiere todos los módulos dominados).
 */
export async function graduateFase3(): Promise<{
  message: string;
  nueva_fase_id: number;
  nueva_fase_nombre: string;
}> {
  const res = await fetch(`${API_URL}/fase3/graduate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
