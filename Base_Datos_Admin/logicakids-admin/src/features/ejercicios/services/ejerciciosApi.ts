import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";
import { Pregunta } from "../../../types/db-models";

export const ejerciciosApi = {
  getPreguntas: async (faseId?: number | null): Promise<Pregunta[]> => {
    const response = await apiClient.get<Pregunta[]>(ENDPOINTS.ADMIN_EJERCICIOS.PREGUNTAS, { params: faseId ? { fase_id: faseId } : {} });
    return response.data;
  },
  deletePregunta: async (id: number): Promise<any> => {
    const response = await apiClient.delete(ENDPOINTS.ADMIN_EJERCICIOS.PREGUNTA_BY_ID(id));
    return response.data;
  },
  createPregunta: async (payload: any): Promise<Pregunta> => {
    const response = await apiClient.post<Pregunta>(ENDPOINTS.ADMIN_EJERCICIOS.PREGUNTAS, payload);
    return response.data;
  },
  updatePregunta: async (id: number, payload: any): Promise<Pregunta> => {
    const response = await apiClient.patch<Pregunta>(ENDPOINTS.ADMIN_EJERCICIOS.PREGUNTA_BY_ID(id), payload);
    return response.data;
  },
  getTeoria: async (faseId: number, moduloId: number, nivelId: number): Promise<any> => {
    const response = await apiClient.get(ENDPOINTS.ADMIN_EJERCICIOS.TEORIA, {
      params: { fase_id: faseId, modulo_id: moduloId, nivel_id: nivelId }
    });
    return response.data;
  },
  saveTeoria: async (payload: any): Promise<any> => {
    const response = await apiClient.put(ENDPOINTS.ADMIN_EJERCICIOS.TEORIA, payload);
    return response.data;
  }
};