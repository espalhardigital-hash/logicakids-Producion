import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";

export const configuracionApi = {
  getSystemConfig: async () => {
    const res = await apiClient.get(ENDPOINTS.ADMIN_SYSTEM.CONFIG);
    return res.data;
  },
  updateSystemConfig: async (payload: any) => {
    const res = await apiClient.post(ENDPOINTS.ADMIN_SYSTEM.CONFIG, payload);
    return res.data;
  },
  getPlatformSettings: async () => {
    const res = await apiClient.get(ENDPOINTS.ADMIN_SYSTEM.SETTINGS);
    return res.data;
  },
  updatePlatformSettings: async (payload: any) => {
    const res = await apiClient.put(ENDPOINTS.ADMIN_SYSTEM.SETTINGS, payload);
    return res.data;
  }
};