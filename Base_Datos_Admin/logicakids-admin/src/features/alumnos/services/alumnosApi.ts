import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";
import { Alumno } from "../../../types/db-models";

export interface AdminUserCreateInput { username: string; email: string; password?: string; }

export interface PaginatedAlumnos {
  data: Alumno[];
  total: number;
  page: number;
  limit: number;
}

export const alumnosApi = {
  searchAlumnos: async (query: string = "", skip = 0, limit = 15): Promise<PaginatedAlumnos> => {
    const response = await apiClient.get<PaginatedAlumnos>(ENDPOINTS.ADMIN_ALUMNOS.SEARCH, { params: { query, skip, limit } });
    return response.data;
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
  },
  deleteUsersBulk: async (userIds: string[]): Promise<any> => {
    const response = await apiClient.delete(ENDPOINTS.ADMIN_USERS.BULK_DELETE, { data: { user_ids: userIds } });
    return response.data;
  }
};