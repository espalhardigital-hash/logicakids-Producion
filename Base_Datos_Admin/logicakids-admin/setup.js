import fs from 'fs';
import path from 'path';

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const writeFile = (filePath, content) => {
  ensureDirectoryExistence(filePath);
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ Creado: ${filePath}`);
};

const files = {
  // --- VARIABLES DE ENTORNO ---
  '.env.development': `VITE_API_BASE_URL=http://localhost:8000/api`,
  '.env.production': `VITE_API_BASE_URL=https://db.espalhar.shop/api`,
  
  // --- ARCHIVOS DE DESPLIEGUE (DOCKER / NGINX / PORTAINER) ---
  'Dockerfile': `
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV VITE_API_BASE_URL=https://db.espalhar.shop/api
RUN npm run build

FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
  `,
  
  'nginx.conf': `
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
  `,

  'docker-compose.yml': `
version: '3.8'

services:
  admin-frontend:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: logicakids-admin-ui
    restart: always
    networks:
      - traefik_proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.logicakids-admin.rule=Host(\`db.espalhar.shop\`)"
      - "traefik.http.routers.logicakids-admin.entrypoints=websecure"
      - "traefik.http.routers.logicakids-admin.tls.certresolver=letsencrypt"
      - "traefik.http.services.logicakids-admin.loadbalancer.server.port=80"

networks:
  traefik_proxy:
    external: true
  `,

  // --- CLIENTE API ---
  'src/api/endpoints.ts': `
export const ENDPOINTS = {
  AUTH: { REGISTER: "/auth/register", LOGIN: "/auth/login", ME: "/users/me" },
  ADMIN_USERS: { LIST_OR_SAVE: "/users", DELETE: (id: string) => \`/users/\${id}\`, CREATE: "/admin/users", CHANGE_PASSWORD: (id: string) => \`/admin/users/\${id}/password\`, ANONYMIZE: (id: string) => \`/admin/users/\${id}/forget\` },
  ADMIN_PEDAGOGIA: { FASES: "/admin/fases", FASE_BY_ID: (id: number) => \`/admin/fases/\${id}\`, CONFIGURACIONES: "/admin/configuracion", CONFIGURACION_BY_ID: (id: number) => \`/admin/configuracion/\${id}\` },
  ADMIN_EJERCICIOS: { PREGUNTAS: "/admin/preguntas", PREGUNTA_BY_ID: (id: number) => \`/admin/preguntas/\${id}\`, TEORIA: "/admin/teoria" },
  ADMIN_ALUMNOS: { SEARCH: "/admin/alumnos/search", PROGRESS: (id: number) => \`/admin/alumnos/\${id}/progress\`, OVERRIDE_PROGRESS: (id: number) => \`/admin/alumnos/\${id}/progress/override\`, OVERRIDE_PROGRESS_BULK: (id: number) => \`/admin/alumnos/\${id}/progress/override-bulk\` },
  ADMIN_SYSTEM: { CONFIG: "/admin/system-config", SETTINGS: "/admin/settings" },
  ADMIN_ANALYTICS: { ENGAGEMENT: "/admin/analytics/engagement", CHURN_BY_LEVEL: "/admin/analytics/churn-by-level" },
  ADMIN_AI: { ALUMNO_INSIGHTS: (id: number) => \`/ai/admin/alumnos/\${id}/insights\` }
};
  `,

  'src/api/apiClient.ts': `
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
    if (!sanitizedUrl.endsWith("/api")) sanitizedUrl = sanitizedUrl.endsWith("/") ? \`\${sanitizedUrl}api\` : \`\${sanitizedUrl}/api\`;
    localStorage.setItem("logicakids_api_url", sanitizedUrl);
  } else {
    localStorage.removeItem("logicakids_api_url");
  }
  window.location.reload();
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("logicakids_token");
  if (token && config.headers) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
}, error => Promise.reject(error));

apiClient.interceptors.response.use(res => res, (error: AxiosError) => {
  const status = error.response?.status;
  if (status === 401) {
    localStorage.removeItem("logicakids_token");
    if (!window.location.pathname.includes("/login")) window.location.href = \`/login?redirectTo=\${encodeURIComponent(window.location.pathname)}\`;
  }
  return Promise.reject({ status: status || 500, message: (error.response?.data as any)?.message || error.message });
});
  `,

  // --- TIPOS ---
  'src/types/db-enums.ts': `
export enum StatusEnum { ACTIVO = "activo", INACTIVO = "inactivo", ELIMINADO = "eliminado" }
export enum OperacionEnum { SUMA = "suma", RESTA = "resta", MULTIPLICACION = "multiplicacion", DIVISION = "division", MIXTA = "mixta" }
export enum TipoPreguntaEnum { CALCUL0_DIRECTO = "calculo_directo", PROBLEMA_CONTEXTO = "problema_contexto", MULTIPLE_OPCION = "multiple_opcion" }
export enum TipoErrorEnum { CALCULO = "calculo", LECTURA = "lectura", ATENCION = "atencion" }
  `,

  'src/features/ejercicios/schemas/preguntaSchema.ts': `
import { z } from "zod";
import { OperacionEnum, TipoPreguntaEnum, StatusEnum, TipoErrorEnum } from "../../../types/db-enums";

const emptyToNull = z.union([z.string(), z.null()]).transform(val => (val === "" ? null : val));

export const alternativaSchema = z.object({
  id: z.number().optional(), texto: z.string().min(1), es_correcta: z.boolean().default(false),
  orden: z.number().nullable().optional(), tipo_error: z.nativeEnum(TipoErrorEnum).nullable().optional(), feedback_error: emptyToNull.optional()
});

export const preguntaSchema = z.object({
  fase_id: z.number(), seccion: z.number(), sub_nivel: z.number().nullable().optional(),
  estructura_padre_id: emptyToNull.optional(), operacion: z.nativeEnum(OperacionEnum),
  tipo_pregunta: z.nativeEnum(TipoPreguntaEnum), enunciado: z.string().min(5),
  respuesta_correcta: z.string().min(1), datos_numericos: z.record(z.any()).nullable().optional(),
  estado: z.nativeEnum(StatusEnum).default(StatusEnum.ACTIVO), alternativas: z.array(alternativaSchema).default([])
});

export type PreguntaInput = z.infer<typeof preguntaSchema>;
  `,

  // --- RUTAS Y APP ---
  'src/routes/ProtectedRoute.tsx': `
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showRescueBtn, setShowRescueBtn] = useState(false);
  const token = localStorage.getItem("logicakids_token"); // Simplificado para que compile directo

  useEffect(() => {
    let timer = setTimeout(() => setShowRescueBtn(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleResetUrl = () => { localStorage.removeItem("logicakids_api_url"); window.location.reload(); };

  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
  `,

  'src/routes/AppRoutes.tsx': `
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const Placeholder = ({ name }: { name: string }) => <div className="p-8 text-xl font-bold">Módulo {name} Cargado</div>;
const Layout = ({ children }: { children: React.ReactNode }) => <div className="p-4 bg-slate-50 min-h-screen">{children}</div>;

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div className="p-8"><h1 className="text-2xl font-bold">Login Page</h1></div>} />
        <Route path="/" element={<ProtectedRoute><Layout><Placeholder name="Dashboard Principal" /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};
  `,

  'src/App.tsx': `
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "./routes/AppRoutes";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}
  `
};

console.log("🚀 Construyendo el panel de administración...");
Object.entries(files).forEach(([filePath, content]) => { writeFile(filePath, content); });
console.log("✅ Estructura Docker y React generada. ¡Listo para GitHub!");