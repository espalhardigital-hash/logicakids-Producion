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
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                      isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600"
                    }`}
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase dark:text-emerald-400 dark:bg-emerald-950/30">API Conectada</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
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