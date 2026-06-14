import type {
  Fase7Dashboard,
  Fase7Pregunta,
  Fase7AnswerPayload,
  Fase7AnswerResult,
  Fase7Lectura,
} from './Fase7Types';

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

export async function getFase7Dashboard(): Promise<Fase7Dashboard> {
  const key = 'dashboard-fase7';
  return fetchDeduplicated(key, async () => {
    const res = await fetch(`${API_URL}/fase7/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Fase7Dashboard>(res);
  });
}

export async function getFase7Question(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase7Pregunta> {
  const key = `question-fase7-${moduloId}-${nivelId}-${reload}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase7/modulo/${moduloId}/nivel/${nivelId}/pregunta?reload=${reload}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase7Pregunta>(res);
  });
}

export async function submitFase7Answer(
  payload: Fase7AnswerPayload
): Promise<Fase7AnswerResult> {
  const res = await fetch(`${API_URL}/fase7/responder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Fase7AnswerResult>(res);
}

export async function closeFase7Rescate(
  moduloId: number, nivelId: number, preguntaId: number
): Promise<Fase7AnswerResult> {
  const res = await fetch(`${API_URL}/fase7/cerrar-rescate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ modulo_id: moduloId, nivel_id: nivelId, pregunta_id: preguntaId }),
  });
  return handleResponse<Fase7AnswerResult>(res);
}

export async function getFase7Reading(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase7Lectura> {
  const key = `reading-fase7-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase7/lectura/${moduloId}/nivel/${nivelId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase7Lectura>(res);
  });
}
