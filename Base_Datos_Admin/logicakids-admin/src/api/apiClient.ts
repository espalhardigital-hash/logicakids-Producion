import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const getBaseUrl = (): string => {
  const customUrl = localStorage.getItem("logicakids_api_url");
  if (customUrl) return customUrl;
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
};

export const apiClient = axios.create({ baseURL: getBaseUrl(), timeout: 15000, headers: { "Content-Type": "application/json" } });

export const changeApiBaseUrl = (newUrl: string) => {
  if (newUrl && newUrl.trim() !== "") {
    let sanitizedUrl = newUrl.trim();
    if (!sanitizedUrl.endsWith("/api")) sanitizedUrl = sanitizedUrl.endsWith("/") ? `${sanitizedUrl}api` : `${sanitizedUrl}/api`;
    localStorage.setItem("logicakids_api_url", sanitizedUrl);
  } else {
    localStorage.removeItem("logicakids_api_url");
  }
  window.location.reload();
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("logicakids_token");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

apiClient.interceptors.response.use(res => res, (error: AxiosError) => {
  const status = error.response?.status;
  if (status === 401) {
    localStorage.removeItem("logicakids_token");
    if (!window.location.pathname.includes("/login")) window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
  }
  
  let errMsg = (error.response?.data as any)?.detail || (error.response?.data as any)?.message || error.message;
  if (Array.isArray(errMsg)) {
    errMsg = errMsg.map(err => {
      const field = err.loc ? err.loc.join(".") : "";
      return `${field ? field + ": " : ""}${err.msg}`;
    }).join(", ");
  } else if (typeof errMsg === 'object' && errMsg !== null) {
    errMsg = JSON.stringify(errMsg);
  }

  return Promise.reject({ status: status || 500, message: errMsg });
});