import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";
import { Pregunta } from "../../../types/db-models";

export const ejerciciosApi = {
  getPreguntas: async (faseId?: number | null, seccion?: number | null, operacion?: string | null): Promise<Pregunta[]> => {
    const params: any = {};
    if (faseId !== undefined && faseId !== null) params.fase_id = faseId;
    if (seccion !== undefined && seccion !== null) params.seccion = seccion;
    if (operacion !== undefined && operacion !== null) params.operacion = operacion;
    const response = await apiClient.get<Pregunta[]>(ENDPOINTS.ADMIN_EJERCICIOS.PREGUNTAS, { params });
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
  deletePregunta: async (id: number): Promise<any> => {
    const response = await apiClient.delete(ENDPOINTS.ADMIN_EJERCICIOS.PREGUNTA_BY_ID(id));
    return response.data;
  },
  getTeoria: async (faseId: number, moduloId: number, nivelId = 1): Promise<any> => {
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