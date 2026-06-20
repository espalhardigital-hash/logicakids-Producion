import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";
import { Fase, ConfiguracionProgreso } from "../../../types/db-models";

export const pedagogiaApi = {
  getFases: async (): Promise<Fase[]> => {
    const response = await apiClient.get<Fase[]>(ENDPOINTS.ADMIN_PEDAGOGIA.FASES);
    return response.data;
  },
  getConfiguraciones: async (faseId?: number): Promise<ConfiguracionProgreso[]> => {
    const response = await apiClient.get<ConfiguracionProgreso[]>(ENDPOINTS.ADMIN_PEDAGOGIA.CONFIGURACIONES, { params: faseId ? { fase_id: faseId } : {} });
    return response.data;
  },
  updateConfiguracion: async (configId: number, payload: any): Promise<any> => {
    const response = await apiClient.patch(ENDPOINTS.ADMIN_PEDAGOGIA.CONFIGURACION_BY_ID(configId), payload);
    return response.data;
  }
};