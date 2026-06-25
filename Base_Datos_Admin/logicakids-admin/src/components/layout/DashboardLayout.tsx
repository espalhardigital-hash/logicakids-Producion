import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  Users, BookOpen, HelpCircle, TrendingUp, Settings, LogOut, Menu, X, User, Activity, Sun, Moon
} from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inicializar estado del tema local
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return "dark";
    if (savedTheme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { name: "Alumnos", path: "/alumnos", icon: Users },
    { name: "Pedagogía y Fases", path: "/pedagogia", icon: BookOpen },
    { name: "Banco de Preguntas", path: "/ejercicios", icon: HelpCircle },
    { name: "Analíticas de Churn", path: "/analiticas", icon: TrendingUp },
    { name: "Configuración", path: "/configuracion", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {/* Sidebar Móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col bg-[#0b1528] p-6 border-r border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-black text-white">
                LogicaKids <span className="text-indigo-400">Admin</span>
              </span>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
                <X className="h-6 w-6 text-slate-400" />
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
                      isActive 
                        ? "bg-white/10 text-white shadow-sm border border-white/10" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-800 pt-4">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors">
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden w-64 border-r border-slate-800 bg-[#0b1528] lg:flex lg:flex-col shrink-0">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-800 px-6">
          <span className="text-lg font-black tracking-tight text-white">
            LogicaKids <span className="text-indigo-400">Admin</span>
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
                    ? "bg-white/10 text-white shadow-sm border border-white/5" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800">
            <Menu className="h-6 w-6 text-slate-650 dark:text-zinc-300" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-605 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-full uppercase dark:text-emerald-450">API Conectada</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Cambiar tema"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 border dark:border-zinc-700">
              <User className="h-5 w-5 text-slate-650 dark:text-zinc-300" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 hidden sm:inline">{user?.username || "amilcar_admin"}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};