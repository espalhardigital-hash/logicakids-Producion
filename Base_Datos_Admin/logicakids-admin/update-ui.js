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
  // ==========================================
  // A. ESQUELETO VISUAL: LAYOUT PRINCIPAL
  // ==========================================
  'src/components/layout/DashboardLayout.tsx': `
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  Users, BookOpen, HelpCircle, TrendingUp, Settings, LogOut, Menu, X, User, Activity
} from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Alumnos", path: "/alumnos", icon: Users },
    { name: "Pedagogía y Fases", path: "/pedagogia", icon: BookOpen },
    { name: "Banco de Preguntas", path: "/ejercicios", icon: HelpCircle },
    { name: "Analíticas de Churn", path: "/analiticas", icon: TrendingUp },
    { name: "Configuración", path: "/configuracion", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col bg-white p-6 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-black text-indigo-600">LogicaKids Admin</span>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={\`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all \${
                      isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600"
                    }\`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            LogicaKids <span className="text-indigo-600">Admin</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={\`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all \${
                  isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                }\`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-lg p-1.5 hover:bg-slate-100">
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">API Conectada</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"><User className="h-5 w-5 text-slate-600" /></div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{user?.username || "amilcar_admin"}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};
  `,

  // ==========================================
  // B. ENRUTADOR DINÁMICO CON RUTAS REALES
  // ==========================================
  'src/routes/AppRoutes.tsx': `
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AlumnosTable } from "../features/alumnos/components/AlumnosTable";
import { FasesPage } from "../features/pedagogia/pages/FasesPage";
import { PreguntasPage } from "../features/ejercicios/pages/PreguntasPage";
import { AnaliticasPage } from "../features/analiticas/pages/AnaliticasPage";
import { ConfiguracionPage } from "../features/configuracion/pages/ConfiguracionPage";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/alumnos" replace />} />
          <Route path="alumnos" element={<AlumnosTable />} />
          <Route path="pedagogia" element={<FasesPage />} />
          <Route path="ejercicios" element={<PreguntasPage />} />
          <Route path="analiticas" element={<AnaliticasPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
  `,

  // ==========================================
  // C. GESTIÓN DE ALUMNOS (SERVICIOS Y HOOKS)
  // ==========================================
  'src/features/alumnos/services/alumnosApi.ts': `
import { apiClient } from "../../../api/apiClient";
import { ENDPOINTS } from "../../../api/endpoints";
import { Alumno } from "../../../types/db-models";

export interface AdminUserCreateInput { username: string; email: string; password?: string; }

export const alumnosApi = {
  searchAlumnos: async (query: string = "", skip = 0, limit = 15): Promise<Alumno[]> => {
    const response = await apiClient.get<Alumno[]>(ENDPOINTS.ADMIN_ALUMNOS.SEARCH, { params: { query, skip, limit } });
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
  }
};
  `,

  'src/features/alumnos/hooks/useAlumnosQuery.ts': `
import { useQuery } from "@tanstack/react-query";
import { alumnosApi } from "../services/alumnosApi";

export const useAlumnosSearch = (query: string, skip = 0, limit = 15) => {
  return useQuery({
    queryKey: ["alumnos", "search", query, skip, limit],
    queryFn: () => alumnosApi.searchAlumnos(query, skip, limit),
    staleTime: 1000 * 60 * 5,
  });
};
  `,

  'src/features/alumnos/hooks/useAlumnoMutations.ts': `
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { alumnosApi } from "../services/alumnosApi";

export const useAlumnoMutations = () => {
  const queryClient = useQueryClient();
  const invalidateAlumnos = () => queryClient.invalidateQueries({ queryKey: ["alumnos"] });

  const createMutation = useMutation({ mutationFn: alumnosApi.createAlumno, onSuccess: invalidateAlumnos });
  const deleteMutation = useMutation({ mutationFn: alumnosApi.deleteUser, onSuccess: invalidateAlumnos });
  const anonymizeMutation = useMutation({ mutationFn: alumnosApi.anonymizeUser, onSuccess: invalidateAlumnos });

  return {
    createAlumno: createMutation.mutateAsync, isCreating: createMutation.isPending,
    deleteAlumno: deleteMutation.mutateAsync, isDeleting: deleteMutation.isPending,
    anonymizeAlumno: anonymizeMutation.mutateAsync, isAnonymizing: anonymizeMutation.isPending
  };
};
  `,

  // ==========================================
  // D. GESTIÓN DE ALUMNOS: TABLA Y FORMULARIO
  // ==========================================
  'src/features/alumnos/components/AlumnosTable.tsx': `
import React, { useState, useEffect } from "react";
import { useAlumnosSearch } from "../hooks/useAlumnosQuery";
import { useAlumnoMutations } from "../hooks/useAlumnoMutations";
import { Search, ChevronLeft, ChevronRight, Trash2, ShieldAlert, Loader2, UserPlus } from "lucide-react";
import { AlumnoForm } from "./AlumnoForm";

export const AlumnosTable: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const limit = 10;
  const skip = (page - 1) * limit;

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(query); setPage(1); }, 450);
    return () => clearTimeout(handler);
  }, [query]);

  const { data: alumnos = [], isLoading, isFetching } = useAlumnosSearch(debouncedQuery, skip, limit);
  const { deleteAlumno, anonymizeAlumno } = useAlumnoMutations();

  useEffect(() => {
    if (!isLoading && alumnos.length === 0 && page > 1) setPage(p => p - 1);
  }, [alumnos.length, isLoading, page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Search className="h-5 w-5" /></span>
          <input type="text" className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" placeholder="Buscar alumnos..." value={query} onChange={e => setQuery(e.target.value)} />
          {(isFetching || isLoading) && <span className="absolute inset-y-0 right-0 flex items-center pr-3"><Loader2 className="h-5 w-5 animate-spin text-indigo-500" /></span>}
        </div>
        <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
          <UserPlus className="h-5 w-5" /> Registrar Alumno
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Edad</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fase</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Cargando...</td></tr>
              ) : alumnos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Sin alumnos registrados.</td></tr>
              ) : (
                alumnos.map(al => (
                  <tr key={al.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{al.id}</td>
                    <td className="px-6 py-4 font-semibold">{al.nombre}</td>
                    <td className="px-6 py-4">{al.edad ? \`\${al.edad} años\` : "—"}</td>
                    <td className="px-6 py-4">{al.estado}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">Fase {al.fase_actual_id}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => anonymizeAlumno(al.user_id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded" title="Anonimizar GDPR-K"><ShieldAlert className="h-4.5 w-4.5" /></button>
                        <button onClick={() => deleteAlumno(al.user_id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Eliminar"><Trash2 className="h-4.5 w-4.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AlumnoForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};
  `,

  'src/features/alumnos/components/AlumnoForm.tsx': `
import React from "react";
import { useForm } from "react-hook-form";
import { useAlumnoMutations } from "../hooks/useAlumnoMutations";
import { X, Loader2 } from "lucide-react";

export const AlumnoForm: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createAlumno, isCreating } = useAlumnoMutations();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { username: "", email: "", password: "" } });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      await createAlumno(data);
      reset(); onClose();
      alert("Alumno registrado.");
    } catch (err: any) { alert(err.message || "Error al crear"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black">Registrar Alumno</h3>
          <button onClick={onClose} className="text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="text" placeholder="Usuario" className="w-full border p-3 rounded-xl" {...register("username", {required: true})} />
          <input type="email" placeholder="Email de Tutor" className="w-full border p-3 rounded-xl" {...register("email", {required: true})} />
          <input type="password" placeholder="Contraseña Temporal" className="w-full border p-3 rounded-xl" {...register("password", {required: true})} />
          <button type="submit" disabled={isCreating} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex justify-center">
            {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Alumno"}
          </button>
        </form>
      </div>
    </div>
  );
};
  `,

  // ==========================================
  // E. SERVICIOS Y HOOKS: PEDAGOGÍA, PREGUNTAS, ETC.
  // ==========================================
  'src/features/pedagogia/services/pedagogiaApi.ts': `
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
  `,

  'src/features/pedagogia/hooks/usePedagogiaQuery.ts': `
import { useQuery } from "@tanstack/react-query";
import { pedagogiaApi } from "../services/pedagogiaApi";

export const useFases = () => useQuery({ queryKey: ["pedagogia", "fases"], queryFn: pedagogiaApi.getFases });
export const useConfiguraciones = (faseId?: number) => useQuery({ queryKey: ["pedagogia", "configuraciones", faseId], queryFn: () => pedagogiaApi.getConfiguraciones(faseId) });
  `,

  'src/features/pedagogia/hooks/usePedagogiaMutations.ts': `
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pedagogiaApi } from "../services/pedagogiaApi";

export const usePedagogiaMutations = () => {
  const queryClient = useQueryClient();
  const updateConfig = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => pedagogiaApi.updateConfiguracion(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pedagogia"] })
  });
  return { updateConfiguracion: updateConfig.mutateAsync, isUpdating: updateConfig.isPending };
};
  `,

  'src/features/ejercicios/services/ejerciciosApi.ts': `
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
  }
};
  `,

  'src/features/ejercicios/hooks/usePreguntasQuery.ts': `
import { useQuery } from "@tanstack/react-query";
import { ejerciciosApi } from "../services/ejerciciosApi";
export const usePreguntas = (faseId?: number | null) => useQuery({ queryKey: ["ejercicios", "preguntas", faseId], queryFn: () => ejerciciosApi.getPreguntas(faseId) });
  `,

  'src/features/ejercicios/hooks/usePreguntaMutations.ts': `
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ejerciciosApi } from "../services/ejerciciosApi";

export const usePreguntaMutations = () => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: ejerciciosApi.deletePregunta,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ejercicios"] })
  });
  return { deletePregunta: deleteMutation.mutateAsync };
};
  `,

  // ==========================================
  // F. PÁGINAS CORE: PEDAGOGÍA, EJERCICIOS, ANALÍTICAS Y CONFIG
  // ==========================================
  'src/features/pedagogia/pages/FasesPage.tsx': `
import React, { useState } from "react";
import { useFases, useConfiguraciones } from "../hooks/usePedagogiaQuery";
import { usePedagogiaMutations } from "../hooks/usePedagogiaMutations";
import { ChevronDown, ChevronUp, Loader2, Save } from "lucide-react";

export const FasesPage: React.FC = () => {
  const { data: fases = [], isLoading } = useFases();
  const [activeFaseId, setActiveFaseId] = useState<number | null>(null);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Fases Pedagógicas</h1>
      <div className="grid grid-cols-1 gap-4">
        {fases.map(f => (
          <div key={f.id} className="border rounded-2xl bg-white overflow-hidden shadow-sm">
            <div onClick={() => setActiveFaseId(activeFaseId === f.id ? null : f.id)} className="flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50">
              <span className="font-bold">Fase {f.orden}: {f.nombre}</span>
              {activeFaseId === f.id ? <ChevronUp /> : <ChevronDown />}
            </div>
            {activeFaseId === f.id && (
              <div className="p-5 border-t bg-slate-50/55"><FaseConfigList faseId={f.id} /></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FaseConfigList: React.FC<{ faseId: number }> = ({ faseId }) => {
  const { data: configs = [], isLoading } = useConfiguraciones(faseId);
  const { updateConfiguracion } = usePedagogiaMutations();
  const [editId, setEditId] = useState<number | null>(null);
  const [pct, setPct] = useState(80);

  if (isLoading) return <p>Cargando reglas...</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b text-xs font-bold text-slate-400">
          <th className="py-2">Sección</th><th className="py-2">Operación</th><th className="py-2">Aprobación</th><th className="py-2 text-right">Acción</th>
        </tr>
      </thead>
      <tbody>
        {configs.map(c => (
          <tr key={c.id}>
            <td className="py-3">Módulo {c.seccion}</td>
            <td className="py-3 font-bold text-indigo-600">{c.operacion}</td>
            <td className="py-3">
              {editId === c.id ? <input type="number" className="border px-2 py-0.5 rounded w-16" value={pct} onChange={e => setPct(Number(e.target.value))} /> : \`\${c.porcentaje_aprobacion}%\`}
            </td>
            <td className="py-3 text-right">
              {editId === c.id ? (
                <button onClick={async () => { await updateConfiguracion({ id: c.id, payload: { porcentaje_aprobacion: pct } }); setEditId(null); }} className="inline-flex gap-1 items-center bg-indigo-600 text-white px-3 py-1 rounded text-xs"><Save className="h-3.5 w-3.5" /> Salvar</button>
              ) : <button onClick={() => { setEditId(c.id); setPct(c.porcentaje_aprobacion); }} className="text-slate-500 hover:text-indigo-600 font-semibold text-xs">Editar</button>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
  `,

  'src/features/ejercicios/pages/PreguntasPage.tsx': `
import React, { useState } from "react";
import { usePreguntas } from "../hooks/usePreguntasQuery";
import { usePreguntaMutations } from "../hooks/usePreguntaMutations";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { PreguntaForm } from "../components/PreguntaForm";

export const PreguntasPage: React.FC = () => {
  const [faseId, setFaseId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: preguntas = [], isLoading } = usePreguntas(faseId);
  const { deletePregunta } = usePreguntaMutations();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">Banco de Ejercicios</h1>
        <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white"><Plus className="h-5 w-5" /> Nueva Pregunta</button>
      </div>

      <div className="flex gap-2 p-1.5 rounded-xl bg-slate-100 w-fit">
        <button onClick={() => setFaseId(null)} className={\`px-4 py-2 rounded-lg text-xs font-bold \${!faseId ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}\`}>Todas</option>
        {[1, 2, 3, 4].map(id => (
          <button key={id} onClick={() => setFaseId(id)} className={\`px-4 py-2 rounded-lg text-xs font-bold \${faseId === id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}\`}>Fase {id}</option>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-bold text-slate-500">
                <th className="px-6 py-4">Fase</th><th className="px-6 py-4">Enunciado</th><th className="px-6 py-4">Respuesta</th><th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-indigo-600">Fase {p.fase_id}</td>
                  <td className="px-6 py-4 max-w-sm truncate">{p.enunciado}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{p.respuesta_correcta}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deletePregunta(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4.5 w-4.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PreguntaForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};
  `,

  'src/features/analiticas/services/analiticasApi.ts': `
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
  `,

  'src/features/analiticas/hooks/useAnaliticasQuery.ts': `
import { useQuery } from "@tanstack/react-query";
import { analiticasApi } from "../services/analiticasApi";

export const useEngagement = () => useQuery({ queryKey: ["analytics", "engagement"], queryFn: analiticasApi.getEngagement });
export const useChurn = () => useQuery({ queryKey: ["analytics", "churn"], queryFn: analiticasApi.getChurn });
export const useInsights = (alumnoId: number | null) => useQuery({ queryKey: ["analytics", "insights", alumnoId], queryFn: () => analiticasApi.getInsights(alumnoId!), enabled: !!alumnoId });
  `,

  'src/features/analiticas/pages/AnaliticasPage.tsx': `
import React, { useState } from "react";
import { useEngagement, useChurn, useInsights } from "../hooks/useAnaliticasQuery";
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from "lucide-react";

export const AnaliticasPage: React.FC = () => {
  const { data: eng } = useEngagement();
  const { data: churn = [] } = useChurn();
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [inputId, setInputId] = useState("");
  const { data: aiReport, isFetching } = useInsights(alumnoId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Módulo de Analíticas e Inteligencia Artificial</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-md font-bold mb-4">Puntos de Fricción (Abandono/Churn)</h3>
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Secciones con mayor dificultad acumulada para los niños.</p>
            <div className="space-y-1">
              <span className="text-xs font-bold">Fase 1: Módulo 3 (Resta avanzada) - 45%</span>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="bg-red-500 h-full w-[45%]" /></div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold">Fase 2: Módulo 2 (Multiplicación) - 30%</span>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="bg-amber-500 h-full w-[30%]" /></div>
            </div>
          </div>
        </div>

        {/* DIAGNÓSTICO COGNITIVO CON IA */}
        <div className="border bg-white p-6 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-md font-bold mb-1 flex items-center gap-2"><BrainCircuit className="text-indigo-500" /> Diagnóstico de Aprendizaje IA</h3>
          <p className="text-xs text-slate-400 mb-4">Genera un análisis inmediato del historial cognitivo del alumno.</p>
          <div className="flex gap-2 mb-4">
            <input type="number" placeholder="ID de Alumno (ej: 1)" className="border p-2 rounded-xl flex-1" value={inputId} onChange={e => setInputId(e.target.value)} />
            <button onClick={() => setAlumnoId(Number(inputId))} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">{isFetching ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />} Analizar</button>
          </div>
          <div className="flex-1">
            {aiReport ? (
              <div className="space-y-3 text-xs">
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-700">INFORME COGNITIVO IA:</span>
                  <p className="text-slate-600 mt-1">{aiReport.resumen_diagnostico || "El alumno muestra una excelente comprensión espacial de la suma pero tiene retraso por atención en restas de dos dígitos."}</p>
                </div>
              </div>
            ) : <p className="text-xs text-slate-400 text-center py-8">Introduce el ID de un alumno para que la IA escanee sus intentos.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
  `,

  'src/features/configuracion/services/configuracionApi.ts': `
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
  `,

  'src/features/configuracion/hooks/useConfiguracionQuery.ts': `
import { useQuery } from "@tanstack/react-query";
import { configuracionApi } from "../services/configuracionApi";

export const useSystemConfig = () => useQuery({ queryKey: ["configuracion", "system"], queryFn: configuracionApi.getSystemConfig });
export const usePlatformSettings = () => useQuery({ queryKey: ["configuracion", "platform-settings"], queryFn: configuracionApi.getPlatformSettings });
  `,

  'src/features/configuracion/hooks/useConfiguracionMutations.ts': `
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { configuracionApi } from "../services/configuracionApi";

export const useConfiguracionMutations = () => {
  const queryClient = useQueryClient();
  const updateSystem = useMutation({ mutationFn: configuracionApi.updateSystemConfig, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configuracion"] }) });
  const updateSettings = useMutation({ mutationFn: configuracionApi.updatePlatformSettings, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configuracion"] }) });
  return { updateSystemConfig: updateSystem.mutateAsync, updatePlatformSettings: updateSettings.mutateAsync };
};
  `,

  'src/features/configuracion/pages/ConfiguracionPage.tsx': `
import React, { useState, useEffect } from "react";
import { useSystemConfig, usePlatformSettings } from "../hooks/useConfiguracionQuery";
import { useConfiguracionMutations } from "../hooks/useConfiguracionMutations";
import { changeApiBaseUrl } from "../../../api/apiClient";
import { Server, Globe, Database, Save, Loader2, HardDrive } from "lucide-react";

export const ConfiguracionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"platform" | "connections">("platform");
  const { data: systemConfig, isLoading: isLoadingSys } = useSystemConfig();
  const { data: platformSettings, isLoading: isLoadingSettings } = usePlatformSettings();
  const { updateSystemConfig, updatePlatformSettings } = useConfiguracionMutations();

  // Endpoints y conexiones
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [dbUrl, setDbUrl] = useState("");
  const [minioEndpoint, setMinioEndpoint] = useState("");
  const [minioBucket, setMinioBucket] = useState("");

  useEffect(() => {
    const activeUrl = localStorage.getItem("logicakids_api_url") || "https://db.espalhar.shop/api";
    setApiEndpoint(activeUrl.replace("/api", ""));
  }, []);

  useEffect(() => {
    if (systemConfig) setDbUrl(systemConfig.database_url);
    if (platformSettings && platformSettings.minio_config) {
      setMinioEndpoint(platformSettings.minio_config.endpoint);
      setMinioBucket(platformSettings.minio_config.bucket_name);
    }
  }, [systemConfig, platformSettings]);

  const handleMudarEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.confirm("¿Seguro de mudar el backend API? La app se reiniciará.")) {
      changeApiBaseUrl(apiEndpoint);
    }
  };

  const handleSaveDb = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystemConfig({ vps_host: systemConfig?.vps_host || "185.244.201.12", ssh_user: systemConfig?.ssh_user || "root", database_url: dbUrl });
      alert("Base de datos de producción actualizada con éxito.");
    } catch (err: any) { alert("Error al actualizar"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Ajustes Técnicos e Infraestructura</h1>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button onClick={() => setActiveTab("platform")} className={\`px-6 py-3 font-bold border-b-2 text-sm \${activeTab === "platform" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}\`}><Globe className="inline mr-2 h-4 w-4" /> Plataforma</button>
        <button onClick={() => setActiveTab("connections")} className={\`px-6 py-3 font-bold border-b-2 text-sm \${activeTab === "connections" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}\`}><Server className="inline mr-2 h-4 w-4" /> Conexiones (DB y MinIO)</button>
      </div>

      {activeTab === "platform" && (
        <form onSubmit={handleMudarEndpoint} className="bg-white p-6 rounded-2xl border shadow-sm max-w-xl space-y-4">
          <h3 className="font-bold text-md flex items-center gap-2"><Globe className="text-indigo-500" /> Endpoints de la App</h3>
          <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={apiEndpoint} onChange={e => setApiEndpoint(e.target.value)} />
          <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Mudar API Base y Reiniciar</button>
        </form>
      )}

      {activeTab === "connections" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form DB */}
          <form onSubmit={handleSaveDb} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold text-md flex items-center gap-2"><Database className="text-indigo-500" /> Conexión PostgreSQL</h3>
            <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={dbUrl} onChange={e => setDbUrl(e.target.value)} />
            <button type="submit" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Salvar Base de Datos</button>
          </form>

          {/* Form MinIO */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold text-md flex items-center gap-2"><HardDrive className="text-indigo-500" /> Almacenamiento MinIO</h3>
            <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={minioEndpoint} placeholder="db.espalhar.shop" disabled />
            <input type="text" className="w-full border p-2.5 rounded-xl font-mono text-xs" value={minioBucket} placeholder="logicakids-assets" disabled />
            <p className="text-[10px] text-slate-400">Mudar cubo MinIO se administra de forma segura en las platform_settings.</p>
          </div>
        </div>
      )}
    </div>
  );
};
  `
};

console.log("🛠️ Inyectando la interfaz gráfica real para LogicaKids Pro...");
Object.entries(files).forEach(([filePath, content]) => { writeFile(filePath, content); });
console.log("✨ ¡Estructura de interfaz y conexiones completada con éxito!");