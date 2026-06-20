import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";

export const useAuth = () => {
  const login = async (data: any) => {
    try {
      const params = new URLSearchParams();
      params.append("username", data.username);
      params.append("password", data.password);

      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      
      const token = response.data.access_token || response.data.token;
      if (token) {
        localStorage.setItem("logicakids_token", token);
        window.location.href = "/";
      } else {
        throw new Error("No se recibió el token de autenticación");
      }
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión");
    }
  };

  const logout = () => {
    localStorage.removeItem("logicakids_token");
    window.location.href = "/login";
  };

  return { login, logout };
};
