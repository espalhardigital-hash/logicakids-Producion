/**
 * Servicio API — Fase 4: Fracciones, Porcentajes y Proporciones
 * Capa de comunicación con el backend de Fase 4.
 */

import type {
  Fase4Dashboard,
  Fase4Pregunta,
  Fase4AnswerPayload,
  Fase4AnswerResult,
  Fase4Lectura,
} from './Fase4Types';

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
 * Obtiene el dashboard de Fase 4 con sus 4 módulos y su estado.
 */
export async function getFase4Dashboard(): Promise<Fase4Dashboard> {
  const key = 'dashboard-f4';
  return fetchDeduplicated(key, async () => {
    const res = await fetch(`${API_URL}/fase4/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Fase4Dashboard>(res);
  });
}

/**
 * Obtiene la siguiente pregunta para un módulo y nivel específicos.
 */
export async function getFase4Question(
  moduloId: number,
  nivelId: number
): Promise<Fase4Pregunta> {
  const key = `question-f4-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase4/modulo/${moduloId}/nivel/${nivelId}/pregunta`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase4Pregunta>(res);
  });
}

/**
 * Envía la respuesta del alumno y recibe el resultado con feedback.
 */
export async function submitFase4Answer(
  payload: Fase4AnswerPayload
): Promise<Fase4AnswerResult> {
  const res = await fetch(`${API_URL}/fase4/responder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Fase4AnswerResult>(res);
}

/**
 * Obtiene el contenido de lectura/teoría de un nivel.
 */
export async function getFase4Reading(
  moduloId: number,
  nivelId: number
): Promise<Fase4Lectura> {
  const key = `reading-f4-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase4/lectura/${moduloId}/nivel/${nivelId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase4Lectura>(res);
  });
}

/**
 * Cierra de forma segura el bucle de rescate (Mirror Loop).
 */
export async function submitFase4CloseRescue(
  moduloId: number,
  nivelId: number
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/fase4/cerrar-rescate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ modulo_id: moduloId, nivel_id: nivelId }),
  });
  return handleResponse(res);
}

/**
 * Gradúa al alumno de Fase 4 a Fase 5.
 */
export async function graduateFase4(): Promise<{
  message: string;
  nueva_fase_id: number;
  nueva_fase_nombre: string;
}> {
  const res = await fetch(`${API_URL}/fase4/graduate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
