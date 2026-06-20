import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { Lock, User, AlertCircle, Loader2, Eye, EyeOff, Settings, RotateCcw } from "lucide-react";

const loginFormSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(4, "La contraseña es muy corta"),
});

type LoginFormInput = z.infer<typeof loginFormSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Ajustes de API dinámicos
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return localStorage.getItem("logicakids_api_url") || "";
  });
  const currentBaseUrl = localStorage.getItem("logicakids_api_url") || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormInput) => {
    setIsLoggingIn(true);
    setLoginError("");
    try {
      await login(data);
    } catch (err: any) {
      setLoginError(err.message || "Credenciales incorrectas");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiUrl.trim() === "") {
      localStorage.removeItem("logicakids_api_url");
    } else {
      let sanitizedUrl = customApiUrl.trim();
      if (!sanitizedUrl.endsWith("/api")) {
        sanitizedUrl = sanitizedUrl.endsWith("/") ? `${sanitizedUrl}api` : `${sanitizedUrl}/api`;
      }
      localStorage.setItem("logicakids_api_url", sanitizedUrl);
    }
    window.location.reload();
  };

  const handleResetApiUrl = () => {
    localStorage.removeItem("logicakids_api_url");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        
        {/* Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <span className="text-3xl font-black">LK</span>
          </div>
          <h2 className="mt-6 text-3xl font-black text-slate-900 dark:text-white">LogicaKids Pro</h2>
          <p className="mt-2 text-sm text-slate-500">Panel Administrativo</p>
        </div>

        {/* Error Alert */}
        {loginError && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">{loginError}</p>
              {loginError.toLowerCase().includes("network error") && (
                <p className="text-xs text-red-600 mt-1">
                  Parece un problema de conexión con el servidor. Verifica el endpoint de la API más abajo.
                </p>
              )}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Usuario / Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User className="h-5 w-5" /></span>
                <input type="text" disabled={isLoggingIn} className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-600 focus:bg-white" placeholder="amilcar@gmail.com" {...register("username")} />
              </div>
              {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-500">Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock className="h-5 w-5" /></span>
                <input type={showPassword ? "text" : "password"} disabled={isLoggingIn} className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 outline-none focus:border-indigo-600 focus:bg-white" placeholder="••••••••" {...register("password")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

          </div>

          <button type="submit" disabled={isLoggingIn} className="flex w-full justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-700">
            {isLoggingIn ? <><Loader2 className="h-5 w-5 animate-spin" /> Conectando...</> : "Ingresar al Sistema"}
          </button>
        </form>

        {/* Configuración de Endpoint API */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mx-auto"
          >
            <Settings className="h-3.5 w-3.5" />
            {showApiSettings ? "Ocultar ajustes de servidor" : "Configurar servidor API"}
          </button>

          {showApiSettings && (
            <form onSubmit={handleSaveApiUrl} className="mt-4 space-y-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-900/50">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">API Endpoint Actual</label>
                <div className="text-[11px] font-mono text-slate-600 break-all dark:text-slate-400 mt-0.5">
                  {currentBaseUrl}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">Nuevo Endpoint</label>
                <input
                  type="text"
                  placeholder="https://mi-servidor.com/api"
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none focus:border-indigo-600"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 transition-colors"
                >
                  Conectar
                </button>
                <button
                  type="button"
                  onClick={handleResetApiUrl}
                  className="px-2 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-300 transition-colors dark:bg-slate-800 dark:text-slate-300"
                  title="Restablecer por defecto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

