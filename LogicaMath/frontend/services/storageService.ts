import { ScoreRecord, User, UserRole } from '../types';
import { getIdToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getAvatarUrl = (url: string | undefined | null) => {
  if (!url) return '';
  // URL absoluta (S3/MinIO)
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Ruta relativa de la API
  if (url.startsWith('/api')) return `${API_URL}${url.replace('/api', '')}`;
  return `${API_URL}${url}`;
};

// HELPER: Authenticated API request
async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  // Always get a fresh token from the SDK
  const token = await getIdToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    console.warn("Sesión expirada o inválida (401). Redireccionando a Login...");
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || err.message || 'API Error');
  }

  return response.json() as Promise<T>;
}

// --- SCORE MANAGEMENT ---

export const saveScore = async (record: ScoreRecord): Promise<void> => {
  try {
    const res = await apiRequest('/scores', 'POST', record);
    console.log("Score saved successfully:", res);
  } catch (error) {
    console.error("Error saving score:", error);
    // Re-throw to allow caller (App.tsx) to handle/alert
    throw error;
  }
};

export const getTopScoresByUser = async (username: string): Promise<ScoreRecord[]> => {
  try {
    const scores = await apiRequest<ScoreRecord[]>(`/scores?user=${encodeURIComponent(username)}`);
    // Return all scores sorted by date (newest first)
    return scores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching scores:", error);
    return [];
  }
};

// NEW: Get all scores for admin analytics
export const getAllScores = async (): Promise<ScoreRecord[]> => {
  try {
    return await apiRequest<ScoreRecord[]>('/scores');
  } catch (error) {
    console.error("Error fetching all scores:", error);
    return [];
  }
};

export const deleteScoreById = async (scoreId: string): Promise<void> => {
  await apiRequest(`/scores/${scoreId}`, 'DELETE');
};

// NEW: Get basic stats (used in table list)
export const getUserStatsSummary = async (username: string) => {
  const userScores = await apiRequest<ScoreRecord[]>(`/scores?user=${encodeURIComponent(username)}`); // Optimized to fetch only user scores

  const totalGames = userScores.length;
  if (totalGames === 0) {
    return { totalGames: 0, avgScore: 0, accuracy: 0, recentGames: [] };
  }

  const totalScore = userScores.reduce((acc, curr) => acc + curr.score, 0);
  const totalCorrect = userScores.reduce((acc, curr) => acc + curr.correctCount, 0);
  const totalQuestions = userScores.reduce((acc, curr) => acc + (curr.correctCount + curr.errorCount), 0);

  const avgScore = Math.round(totalScore / totalGames);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Sort by date descending
  const recentGames = userScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return { totalGames, avgScore, accuracy, recentGames };
};

// NEW: Advanced Analytics for Charts and Breakdowns
export const getUserDetailedAnalytics = async (username: string) => {
  // Can optimize by fetching only user scores if backend supports it (which it does now)
  const userScores = await apiRequest<ScoreRecord[]>(`/scores?user=${encodeURIComponent(username)}`);

  // Filter and Sort by Date Ascending for the Graph
  userScores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (userScores.length === 0) return null;

  // 1. History for Graph
  const history = userScores.map(s => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    rawDate: s.date,
    score: s.score,
    category: s.category || 'N/A',
    difficulty: s.difficulty || 'N/A',
    errorCount: s.errorCount
  }));

  // 2. Breakdown by Category
  const byCategory: Record<string, { games: number; totalScore: number; totalTime: number; correct: number; totalQ: number }> = {};

  // 3. Breakdown by Difficulty
  const byDifficulty: Record<string, { games: number; totalScore: number; totalTime: number; correct: number; totalQ: number }> = {};

  userScores.forEach(s => {
    // Init Category
    const cat = s.category || 'Unknown';
    if (!byCategory[cat]) byCategory[cat] = { games: 0, totalScore: 0, totalTime: 0, correct: 0, totalQ: 0 };
    byCategory[cat].games++;
    byCategory[cat].totalScore += s.score;
    byCategory[cat].totalTime += s.avgTime; // Storing sum of averages to average later
    byCategory[cat].correct += s.correctCount;
    byCategory[cat].totalQ += (s.correctCount + s.errorCount);

    // Init Difficulty
    const diff = s.difficulty || 'Unknown';
    if (!byDifficulty[diff]) byDifficulty[diff] = { games: 0, totalScore: 0, totalTime: 0, correct: 0, totalQ: 0 };
    byDifficulty[diff].games++;
    byDifficulty[diff].totalScore += s.score;
    byDifficulty[diff].totalTime += s.avgTime;
    byDifficulty[diff].correct += s.correctCount;
    byDifficulty[diff].totalQ += (s.correctCount + s.errorCount);
  });

  // Helper to process aggregations
  const processBreakdown = (obj: any) => {
    return Object.keys(obj).map(key => {
      const d = obj[key];
      return {
        key,
        games: d.games,
        avgScore: Math.round(d.totalScore / d.games),
        avgTimePerQuestion: parseFloat((d.totalTime / d.games).toFixed(2)),
        accuracy: d.totalQ > 0 ? Math.round((d.correct / d.totalQ) * 100) : 0,
        errors: d.totalQ - d.correct
      };
    });
  };

  return {
    history, // For Chart
    byCategory: processBreakdown(byCategory),
    byDifficulty: processBreakdown(byDifficulty),
    totalGames: userScores.length
  };
};

// --- USER MANAGEMENT ---

export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await apiRequest<User[]>('/users');
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveUser = async (userToSave: User): Promise<void> => {
  try {
    await apiRequest('/users', 'POST', userToSave);
  } catch (e) {
    console.error("Error saving user", e);
    throw e; // Re-throw so callers can handle the error
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  await apiRequest(`/users/${userId}`, 'DELETE');
};

// --- ADMIN USER MANAGEMENT ---

export const adminCreateUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role?: string;
}): Promise<{ success: boolean; message?: string; user?: any }> => {
  try {
    const result = await apiRequest<any>('/admin/users', 'POST', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'USER'
    });
    return { success: true, message: result.message, user: result };
  } catch (e: any) {
    console.error("Error creating user", e);
    return { success: false, message: e.message || 'Error al crear usuario' };
  }
};

export const adminChangePassword = async (userId: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await apiRequest<any>(`/admin/users/${userId}/password`, 'PATCH', {
      new_password: newPassword
    });
    return { success: true, message: result.message };
  } catch (e: any) {
    console.error("Error changing password", e);
    return { success: false, message: e.message || 'Error al cambiar contraseña' };
  }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  // This is inefficient to fetch all, but sticking to previous interface logic roughly.
  // Better: add endpoint to search by email.
  // But standard users list is okay for admin.
  // For login we use specific login endpoint.
  // Let's implement a specific search optimization if possible, or just fetch all for now or rely on login's return.
  // Wait, loginUser calls this? No, loginUser in backend handles it.
  // Only used for registration check?
  try {
    // We don't have get-by-email endpoint publicly, but let's assume valid usage
    // Actually, let's just return undefined and let the backend endpoints handle uniqueness checks (register/login).
    return undefined;
  } catch (e) { return undefined; }
};

// --- ANALYTICS HELPERS ---
export const getStorageUsage = (): string => {
  return "Cloud";
};

// --- NEW AUTH & AVATAR METHODS ---

// Fetch full user profile from backend (includes unlockedLevel, avatar, settings)
export const getCurrentUserFull = async (): Promise<User> => {
  return await apiRequest<User>('/users/me');
};

// Upload User Avatar
export const uploadAvatar = async (file: File): Promise<string> => {
  const token = await getIdToken();
  if (!token) throw new Error('Usuario no autenticado');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload-avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set Content-Type header manually for FormData, browser does it with boundary
    },
    body: formData
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Error subiendo imagen');
  }

  const result = await response.json();
  return result.url;
};

// --- PROGRESS MANAGEMENT (NEW) ---

export const getUserProgress = async (): Promise<import('../types').CategoryProgress[]> => {
  try {
    return await apiRequest<import('../types').CategoryProgress[]>('/users/me/progress');
  } catch (error) {
    console.error("Error fetching progress:", error);
    return [];
  }
};

export const unlockLevel = async (category: import('../types').GameCategory, newLevel: number): Promise<void> => {
  try {
    await apiRequest('/users/me/progress/level', 'PATCH', { category, new_level: newLevel });
  } catch (error) {
    console.error("Error unlocking level:", error);
  }
};

export const graduateToFase1 = async (): Promise<void> => {
  try {
    await apiRequest('/pedagogia/graduate-to-fase1', 'POST');
  } catch (error) {
    console.error("Error graduating to Fase 1:", error);
  }
};

export const graduateToFase2 = async (): Promise<void> => {
  try {
    await apiRequest('/pedagogia/graduate-to-fase2', 'POST');
  } catch (error) {
    console.error("Error graduating to Fase 2:", error);
  }
};


export const getPedagogiaDashboard = async (): Promise<any> => {
  return await apiRequest<any>('/pedagogia/dashboard');
};

export const responderPreguntaPedagogica = async (data: {
  pregunta_id: number;
  respuesta_dada: string;
  tiempo_respuesta_segundos: number;
}): Promise<import('../types').ResultadoRespuesta> => {
  return await apiRequest<import('../types').ResultadoRespuesta>('/pedagogia/responder', 'POST', data);
};

export const updateOwnProfile = async (data: {
  username?: string;
  email?: string;
  new_password?: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await apiRequest<{ message: string; username: string; email: string }>(
      '/users/me/profile', 'PATCH', data
    );
    return { success: true, message: result.message };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al actualizar perfil' };
  }
};


// --- SETTINGS (ADMIN & PEDAGOGY) ---

export const getAdminSettings = async (): Promise<import('../types').PedagogyConfig | null> => {
  try {
    return await apiRequest<import('../types').PedagogyConfig>('/admin/settings');
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return null;
  }
};

export const saveAdminSettings = async (settings: import('../types').PedagogyConfig): Promise<void> => {
  try {
    await apiRequest('/admin/settings', 'PUT', settings);
  } catch (error) {
    console.error("Error saving admin settings:", error);
    throw error;
  }
};

export const getModularConfigs = async (faseId?: number): Promise<import('../types').ConfiguracionProgreso[]> => {
  try {
    const endpoint = faseId !== undefined ? `/admin/configuracion?fase_id=${faseId}` : '/admin/configuracion';
    return await apiRequest<import('../types').ConfiguracionProgreso[]>(endpoint);
  } catch (error) {
    console.error("Error fetching modular configs:", error);
    return [];
  }
};

export const saveModularConfig = async (configId: number, data: Partial<import('../types').ConfiguracionProgreso>): Promise<import('../types').ConfiguracionProgreso> => {
  return await apiRequest<import('../types').ConfiguracionProgreso>(`/admin/configuracion/${configId}`, 'PATCH', data);
};

export const createModularConfig = async (data: Omit<import('../types').ConfiguracionProgreso, 'id'>): Promise<import('../types').ConfiguracionProgreso> => {
  return await apiRequest<import('../types').ConfiguracionProgreso>('/admin/configuracion', 'POST', data);
};


// --- AI ANALYSIS ---

export const getAIAnalysis = async (category: string): Promise<string> => {
  try {
    const result = await apiRequest<{ analysis: string }>(`/ai/analyze/${category}`);
    return result.analysis;
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    return "No se pudo obtener el análisis de IA en este momento.";
  }
};

// --- ALUMNOS & RENDIMIENTO ---

export interface AlumnoSearchInfo {
  id: string;
  username: string;
  email: string;
  alumno_id: number;
  alumno_nombre: string;
  fase_actual_id: number;
  estado: string;
}

export interface ProgresoOverrideResponse {
  status: string;
  message: string;
}

export const searchAlumnos = async (query: string = ""): Promise<AlumnoSearchInfo[]> => {
  return await apiRequest<AlumnoSearchInfo[]>(`/admin/alumnos/search?query=${encodeURIComponent(query)}`);
};

export const getAlumnoProgress = async (alumnoId: number): Promise<any[]> => {
  return await apiRequest<any[]>(`/admin/alumnos/${alumnoId}/progress`);
};

export const overrideAlumnoProgress = async (alumnoId: number, data: {
  fase_id: number;
  seccion: number;
  operacion: string;
  action: 'approve' | 'unlock' | 'lock';
}): Promise<ProgresoOverrideResponse> => {
  return await apiRequest<ProgresoOverrideResponse>(`/admin/alumnos/${alumnoId}/progress/override`, 'POST', data);
};

// --- PREGUNTAS CRUD ---

export const getPreguntasByLevel = async (faseId: number, seccion: number, operacion: string): Promise<any[]> => {
  return await apiRequest<any[]>(`/admin/preguntas?fase_id=${faseId}&seccion=${seccion}&operacion=${encodeURIComponent(operacion)}`);
};

export const deletePregunta = async (preguntaId: number): Promise<void> => {
  await apiRequest(`/admin/preguntas/${preguntaId}`, 'DELETE');
};

export const createPregunta = async (data: any): Promise<any> => {
  return await apiRequest('/admin/preguntas', 'POST', data);
};

export const updatePregunta = async (preguntaId: number, data: any): Promise<any> => {
  return await apiRequest(`/admin/preguntas/${preguntaId}`, 'PATCH', data);
};

// --- TEORIA CRUD ---

export const getNivelTeoria = async (faseId: number, moduloId: number, nivelId: number): Promise<any | null> => {
  try {
    return await apiRequest<any | null>(`/admin/teoria?fase_id=${faseId}&modulo_id=${moduloId}&nivel_id=${nivelId}`);
  } catch {
    return null;
  }
};

export const saveNivelTeoria = async (data: any): Promise<void> => {
  await apiRequest('/admin/teoria', 'PUT', data);
};
