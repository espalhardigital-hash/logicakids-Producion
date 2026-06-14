import type {
  Fase9Dashboard,
  Fase9Pregunta,
  Fase9AnswerPayload,
  Fase9AnswerResult,
  Fase9Lectura,
} from './Fase9Types';

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

export async function getFase9Dashboard(): Promise<Fase9Dashboard> {
  const key = 'dashboard-fase9';
  return fetchDeduplicated(key, async () => {
    const res = await fetch(`${API_URL}/fase9/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Fase9Dashboard>(res);
  });
}

export async function getFase9Question(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase9Pregunta> {
  const key = `question-fase9-${moduloId}-${nivelId}-${reload}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase9/modulo/${moduloId}/nivel/${nivelId}/pregunta?reload=${reload}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase9Pregunta>(res);
  });
}

export async function submitFase9Answer(
  payload: Fase9AnswerPayload
): Promise<Fase9AnswerResult> {
  const res = await fetch(`${API_URL}/fase9/responder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Fase9AnswerResult>(res);
}

export async function closeFase9Rescate(
  moduloId: number, nivelId: number, preguntaId: number
): Promise<Fase9AnswerResult> {
  const res = await fetch(`${API_URL}/fase9/cerrar-rescate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ modulo_id: moduloId, nivel_id: nivelId, pregunta_id: preguntaId }),
  });
  return handleResponse<Fase9AnswerResult>(res);
}

export async function getFase9Reading(
  moduloId: number, nivelId: number, reload: boolean = false): Promise<Fase9Lectura> {
  const key = `reading-fase9-${moduloId}-${nivelId}`;
  return fetchDeduplicated(key, async () => {
    const res = await fetch(
      `${API_URL}/fase9/lectura/${moduloId}/nivel/${nivelId}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse<Fase9Lectura>(res);
  });
}
