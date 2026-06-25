import React, { useState, useEffect } from "react";
import { useAlumnosSearch } from "../hooks/useAlumnosQuery";
import { useAlumnoMutations } from "../hooks/useAlumnoMutations";
import { Search, ChevronLeft, ChevronRight, Trash2, ShieldAlert, Loader2, UserPlus } from "lucide-react";
import { AlumnoForm } from "./AlumnoForm";
import { useCustomDialog } from "../../../components/common/CustomDialog";

export const AlumnosTable: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const skip = (page - 1) * limit;

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(query); setPage(1); }, 450);
    return () => clearTimeout(handler);
  }, [query]);

  const { data, isLoading, isFetching } = useAlumnosSearch(debouncedQuery, skip, limit);
  const alumnos = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const { deleteAlumno, anonymizeAlumno, deleteUsersBulk } = useAlumnoMutations();
  const { confirm, alert: showAlert } = useCustomDialog();

  useEffect(() => {
    if (!isLoading && alumnos.length === 0 && page > 1) setPage(p => p - 1);
  }, [alumnos.length, isLoading, page]);

  useEffect(() => {
    setSelectedIds([]);
  }, [page, limit, debouncedQuery]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIdsInPage = alumnos.map(al => al.user_id);
      setSelectedIds(allIdsInPage);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (userId: string) => {
    setSelectedIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    confirm({
      title: "Eliminar Alumnos en Lote",
      message: `¿Seguro que deseas eliminar permanentemente a los ${selectedIds.length} alumnos seleccionados? Esta acción eliminará sus progresos y archivos de avatares de MinIO.`,
      confirmText: "Eliminar Lote",
      cancelText: "Cancelar",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteUsersBulk(selectedIds);
          showAlert(`Se eliminaron ${selectedIds.length} alumnos correctamente.`, "success");
          setSelectedIds([]);
        } catch (err: any) {
          const msg = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
          showAlert("Error al realizar borrado masivo: " + msg, "error");
        }
      }
    });
  };

  const handleDeleteOne = (userId: string) => {
    confirm({
      title: "Eliminar Alumno",
      message: "¿Seguro que deseas eliminar permanentemente a este alumno?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
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

  const handleAnonymizeOne = (userId: string) => {
    confirm({
      title: "Anonimizar Alumno",
      message: "¿Seguro que deseas anonimizar todos los datos personales de este alumno por directivas de privacidad GDPR-K?",
      confirmText: "Anonimizar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await anonymizeAlumno(userId);
          showAlert("Alumno anonimizado correctamente.", "success");
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
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input 
            type="text" 
            className="block w-full rounded-xl border border-slate-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-900" 
            placeholder="Buscar alumnos..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
          {(isFetching || isLoading) && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4.5 w-4.5" /> Eliminar Lote ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" /> Registrar Alumno
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-950/50">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={alumnos.length > 0 && selectedIds.length === alumnos.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Edad</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fase</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm dark:divide-zinc-800">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center">Cargando...</td></tr>
              ) : alumnos.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Sin alumnos registrados.</td></tr>
              ) : (
                alumnos.map(al => (
                  <tr key={al.id} className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 ${selectedIds.includes(al.user_id) ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedIds.includes(al.user_id)}
                        onChange={() => handleSelectRow(al.user_id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{al.id}</td>
                    <td className="px-6 py-4 font-semibold">{al.nombre}</td>
                    <td className="px-6 py-4">{al.edad ? `${al.edad} años` : "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        al.estado === "activo" 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {al.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">Fase {al.fase_actual_id}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleAnonymizeOne(al.user_id)} 
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-zinc-800 rounded transition-colors" 
                          title="Anonimizar GDPR-K"
                        >
                          <ShieldAlert className="h-4.5 w-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOne(al.user_id)} 
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800 rounded transition-colors" 
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

      {/* Paginación y Ajuste de Límite */}
      {!isLoading && total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Mostrar</span>
            <select
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-100 bg-white px-2 py-1 outline-none text-slate-700 focus:border-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value={10}>10 alumnos</option>
              <option value={20}>20 alumnos</option>
              <option value={50}>50 alumnos</option>
            </select>
            <span>de {total} registrados</span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pNum => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  page === pNum
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                    : "border border-slate-100 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <AlumnoForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};