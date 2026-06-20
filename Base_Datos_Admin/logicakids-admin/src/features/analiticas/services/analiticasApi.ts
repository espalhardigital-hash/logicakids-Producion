import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";

export const analiticasApi = {
  getEngagement: async () => {
    const res = await apiClient.get(ENDPOINTS.ADMIN_ANALYTICS.ENGAGEMENT);
    return res.data;
  },
  getChurn: async () => {
    const res = await apiClient.get(ENDPOINTS.ADMIN_ANALYTICS.CHURN_BY_LEVEL);
    return res.data;
  },
  getInsights: async (alumnoId: number) => {
    const res = await apiClient.get(ENDPOINTS.ADMIN_AI.ALUMNO_INSIGHTS(alumnoId));
    return res.data;
  }
};