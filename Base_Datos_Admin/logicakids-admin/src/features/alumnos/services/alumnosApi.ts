import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";
import { Alumno } from "../../../types/db-models";

export interface AdminUserCreateInput { username: string; email: string; password?: string; }

export const alumnosApi = {
  searchAlumnos: async (query: string = "", skip = 0, limit = 15): Promise<Alumno[]> => {
    const response = await apiClient.get<any>(ENDPOINTS.ADMIN_ALUMNOS.SEARCH, { params: { query, skip, limit } });
    const rawData = response.data?.data || [];
    return rawData.map((item: any) => ({
      id: item.alumno_id,
      user_id: item.id,
      nombre: item.alumno_nombre || item.username,
      edad: item.edad, // si no viene, será undefined
      estado: item.estado,
      fase_actual_id: item.fase_actual_id,
    }));
  },
  createAlumno: async (payload: AdminUserCreateInput): Promise<any> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN_USERS.CREATE, payload);
    return response.data;
  },
  deleteUser: async (userId: string): Promise<any> => {
    const response = await apiClient.delete(ENDPOINTS.ADMIN_USERS.DELETE(userId));
    return response.data;
  },
  anonymizeUser: async (userId: string): Promise<any> => {
    const response = await apiClient.post(ENDPOINTS.ADMIN_USERS.ANONYMIZE(userId));
    return response.data;
  }
};