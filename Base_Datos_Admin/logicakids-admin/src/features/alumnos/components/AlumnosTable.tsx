import React, { useState, useEffect } from "react";
import { useAlumnosSearch } from "../hooks/useAlumnosQuery";
import { useAlumnoMutations } from "../hooks/useAlumnoMutations";
import { useCustomDialog } from "../../../components/common/CustomDialog";
import { Search, ChevronLeft, ChevronRight, Trash2, ShieldAlert, Loader2, UserPlus } from "lucide-react";
import { AlumnoForm } from "./AlumnoForm";

export const AlumnosTable: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { confirm, alert: showAlert } = useCustomDialog();
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

  const handleDeleteAlumno = (userId: string, nombre: string) => {
    confirm({
      title: "Eliminar Alumno",
      message: `¿Seguro que deseas eliminar al alumno "${nombre}"? Se borrarán permanentemente sus estadísticas e historial. Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteAlumno(userId);
          showAlert("Alumno eliminado correctamente.", "success");
        } catch (err: any) {
          showAlert("Error al eliminar alumno: " + (err.message || err), "error");
        }
      }
    });
  };

  const handleAnonymizeAlumno = (userId: string, nombre: string) => {
    confirm({
      title: "Anonimizar Alumno",
      message: `¿Seguro que deseas anonimizar al alumno "${nombre}" para cumplir con GDPR-K? Reemplazará su nombre con datos aleatorios.`,
      confirmText: "Anonimizar",
      isDanger: false,
      onConfirm: async () => {
        try {
          await anonymizeAlumno(userId);
          showAlert("Alumno anonimizado con éxito.", "success");
        } catch (err: any) {
          showAlert("Error al anonimizar alumno: " + (err.message || err), "error");
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Search className="h-5 w-5" /></span>
          <input
            type="text"
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:ring-indigo-900/40"
            placeholder="Buscar alumnos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {(isFetching || isLoading) && <span className="absolute inset-y-0 right-0 flex items-center pr-3"><Loader2 className="h-5 w-5 animate-spin text-indigo-500" /></span>}
        </div>
        <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <UserPlus className="h-5 w-5" /> Registrar Alumno
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Edad</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fase</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                      Cargando alumnos...
                    </div>
                  </td>
                </tr>
              ) : alumnos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">Sin alumnos registrados.</td></tr>
              ) : (
                alumnos.map(al => (
                  <tr key={al.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-900 dark:text-slate-100">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">#{al.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{al.nombre}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{al.edad ? `${al.edad} años` : "—"}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        al.estado?.toLowerCase() === "activo"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {al.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">Fase {al.fase_actual_id}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleAnonymizeAlumno(al.user_id, al.nombre)}
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-950/30 rounded-xl transition-colors"
                          title="Anonimizar GDPR-K"
                        >
                          <ShieldAlert className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAlumno(al.user_id, al.nombre)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
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