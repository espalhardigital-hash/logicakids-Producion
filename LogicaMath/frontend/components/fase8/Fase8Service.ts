import type {
  Fase8Dashboard,
  Fase8Pregunta,
  Fase8AnswerPayload,
  Fase8AnswerResult,
  Fase8Lectura,
} from './Fase8Types';

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

export async function getFase8Dashboard(): Promise<Fase8Dashboard> {
  const key = 'dashboard-fase8';
  return fetchDeduplicated(key, async () => {
    const res = await fetch(`${API_URL}/fase8/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Fase8Dashboard>(res);
  });
}

export async function getFase8Question(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase8Pregunta> {
  const key = `question-fase8-${moduloId}-${nivelId}-${reload}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase8/modulo/${moduloId}/nivel/${nivelId}/pregunta?reload=${reload}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase8Pregunta>(res);
  });
}

export async function submitFase8Answer(
  payload: Fase8AnswerPayload
): Promise<Fase8AnswerResult> {
  const res = await fetch(`${API_URL}/fase8/responder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Fase8AnswerResult>(res);
}

export async function closeFase8Rescate(
  moduloId: number, nivelId: number, preguntaId: number
): Promise<Fase8AnswerResult> {
  const res = await fetch(`${API_URL}/fase8/cerrar-rescate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ modulo_id: moduloId, nivel_id: nivelId, pregunta_id: preguntaId }),
  });
  return handleResponse<Fase8AnswerResult>(res);
}

export async function getFase8Reading(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase8Lectura> {
  const key = `reading-fase8-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase8/lectura/${moduloId}/nivel/${nivelId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase8Lectura>(res);
  });
}
