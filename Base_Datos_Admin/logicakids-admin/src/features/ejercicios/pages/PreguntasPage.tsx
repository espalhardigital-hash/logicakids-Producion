import React, { useState } from "react";
import { usePreguntas, useTeoria } from "../hooks/usePreguntasQuery";
import { usePreguntaMutations } from "../hooks/usePreguntaMutations";
import { Trash2, Edit3, Plus, Loader2, BookOpen, HelpCircle, Trophy, AlertTriangle, Info } from "lucide-react";
import { PreguntaForm } from "../components/PreguntaForm";
import { TeoriaFormModal } from "../components/TeoriaFormModal";
import { useCustomDialog } from "../../../components/common/CustomDialog";
import { OperacionEnum } from "../../../types/db-enums";

type SubTabType = "theory" | "practice" | "challenge";

export const PreguntasPage: React.FC = () => {
  const { confirm, alert: showAlert } = useCustomDialog();

  // Navigation states
  const [faseId, setFaseId] = useState<number | null>(1); // Default to Fase 1 to start granular
  const [moduloId, setModuloId] = useState<number | null>(1); // Default to Módulo 1
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("practice");

  // Modal states
  const [isPreguntaModalOpen, setIsPreguntaModalOpen] = useState(false);
  const [isTeoriaModalOpen, setIsTeoriaModalOpen] = useState(false);
  const [selectedPregunta, setSelectedPregunta] = useState<any>(null);

  // Queries
  const { data: preguntas = [], isLoading: isLoadingPreguntas } = usePreguntas(
    faseId,
    moduloId,
    activeSubTab === "challenge" ? "mixta" : null
  );

  const { data: teoriaData, isLoading: isLoadingTeoria } = useTeoria(
    faseId,
    moduloId,
    activeSubTab === "theory"
  );

  const { deletePregunta } = usePreguntaMutations();

  // Filters for questions
  const filteredPreguntas = activeSubTab === "practice"
    ? preguntas.filter((p: any) => p.operacion !== OperacionEnum.MIXTA)
    : preguntas; // If challenge, backend is already filtered by "mixta"

  const handleDeletePregunta = (id: number) => {
    confirm({
      title: "Eliminar Pregunta",
      message: "¿Seguro que deseas eliminar esta pregunta del banco de ejercicios? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deletePregunta(id);
          showAlert("Pregunta eliminada correctamente.", "success");
        } catch (err: any) {
          showAlert("Error al eliminar la pregunta: " + (err.message || err), "error");
        }
      }
    });
  };

  const handleEditPregunta = (pregunta: any) => {
    setSelectedPregunta(pregunta);
    setIsPreguntaModalOpen(true);
  };

  const handleNuevaPregunta = () => {
    setSelectedPregunta(null);
    setIsPreguntaModalOpen(true);
  };

  const handleFaseChange = (id: number | null) => {
    setFaseId(id);
    if (id !== null) {
      setModuloId(1);
    } else {
      setModuloId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Banco de Ejercicios</h1>
          <p className="text-slate-500 text-sm mt-1">Administra la teoría, prácticas y desafíos de todas las fases.</p>
        </div>
        {activeSubTab !== "theory" && faseId !== null && (
          <button
            onClick={handleNuevaPregunta}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm w-fit"
          >
            <Plus className="h-5 w-5" /> Nueva Pregunta
          </button>
        )}
      </div>

      {/* Selector de Fases (1 a 9) */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Seleccionar Fase</label>
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 w-fit">
          <button
            onClick={() => handleFaseChange(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              faseId === null
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            Todas
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => (
            <button
              key={id}
              onClick={() => handleFaseChange(id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                faseId === id
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              Fase {id}
            </button>
          ))}
        </div>
      </div>

      {/* Selectores de Módulo y Tipo de Contenido (Solo si se escoge una Fase específica) */}
      {faseId !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t dark:border-slate-800">
          {/* Selector de Módulo */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Seleccionar Módulo</label>
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 w-fit">
              {[1, 2, 3, 4].map((id) => (
                <button
                  key={id}
                  onClick={() => setModuloId(id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    moduloId === id
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  }`}
                >
                  Módulo {id}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Sub-pestaña (Teoría / Prácticas / Desafíos) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de Contenido</label>
            <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 w-fit">
              <button
                onClick={() => setActiveSubTab("theory")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === "theory"
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" /> Teoría
              </button>
              <button
                onClick={() => setActiveSubTab("practice")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === "practice"
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" /> Práctica Libre
              </button>
              <button
                onClick={() => setActiveSubTab("challenge")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSubTab === "challenge"
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                }`}
              >
                <Trophy className="h-3.5 w-3.5" /> Desafíos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN DE VISTA DETALLADA / TABLAS */}
      <div className="pt-4">
        {activeSubTab === "theory" && faseId !== null ? (
          // RENDER DE TEORÍA
          isLoadingTeoria ? (
            <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
          ) : teoriaData ? (
            <div className="bg-white border rounded-3xl p-6 space-y-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">{teoriaData.titulo}</h3>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">Fase {faseId} - Módulo {moduloId}</p>
                </div>
                <button
                  onClick={() => setIsTeoriaModalOpen(true)}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors dark:bg-slate-800 dark:text-slate-300"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Editar Teoría
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Texto de Descubrimiento</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {teoriaData.texto_descubrimiento}
                </p>
              </div>

              {teoriaData.advertencia && (
                <div className="flex gap-2.5 items-start bg-amber-50 p-4 rounded-2xl border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-medium">
                  <Info className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                  <p>{teoriaData.advertencia}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ejemplos ({teoriaData.ejemplos?.length || 0})</h4>
                  <ul className="space-y-1.5">
                    {teoriaData.ejemplos?.map((ex: any, idx: number) => (
                      <li key={idx} className="bg-slate-50 p-2.5 rounded-xl text-xs font-semibold dark:bg-slate-800/50 dark:text-slate-300">
                        {typeof ex === "string" ? ex : JSON.stringify(ex)}
                      </li>
                    )) || <p className="text-xs text-slate-400">Sin ejemplos registrados.</p>}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Elementos Interactivos ({teoriaData.interactivos?.length || 0})</h4>
                  <ul className="space-y-1.5">
                    {teoriaData.interactivos?.map((int: any, idx: number) => (
                      <li key={idx} className="bg-slate-50 p-2.5 rounded-xl text-xs font-semibold dark:bg-slate-800/50 dark:text-slate-300">
                        {typeof int === "string" ? int : JSON.stringify(int)}
                      </li>
                    )) || <p className="text-xs text-slate-400">Sin guías interactivas.</p>}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-3xl p-12 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mx-auto text-indigo-500">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="max-w-sm mx-auto space-y-2">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">No hay teoría cargada</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Crea y configura el texto de explicación teórica y los ejemplos matemáticos que se le presentarán a los alumnos antes de practicar.
                </p>
              </div>
              <button
                onClick={() => setIsTeoriaModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="h-4.5 w-4.5" /> Crear Teoría
              </button>
            </div>
          )
        ) : (
          // RENDER TABLA DE PREGUNTAS
          isLoadingPreguntas ? (
            <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs font-bold text-slate-500 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                      <th className="px-6 py-4">Fase</th>
                      {faseId === null && <th className="px-6 py-4">Módulo</th>}
                      <th className="px-6 py-4">Operación</th>
                      <th className="px-6 py-4">Enunciado</th>
                      <th className="px-6 py-4">Respuesta Correcta</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {filteredPreguntas.length === 0 ? (
                      <tr>
                        <td colSpan={faseId === null ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                          No se encontraron preguntas en este bloque.
                        </td>
                      </tr>
                    ) : (
                      filteredPreguntas.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">Fase {p.fase_id}</td>
                          {faseId === null && <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Mód. {p.seccion}</td>}
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              p.operacion === "mixta"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}>
                              {p.operacion}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-sm truncate text-slate-700 dark:text-slate-300">{p.enunciado}</td>
                          <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{p.respuesta_correcta}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEditPregunta(p)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
                                title="Editar Pregunta"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePregunta(p.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                                title="Eliminar Pregunta"
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
          )
        )}
      </div>

      {/* FORMULARIO PREGUNTAS (CREATE / UPDATE) */}
      <PreguntaForm
        isOpen={isPreguntaModalOpen}
        onClose={() => setIsPreguntaModalOpen(false)}
        initialData={selectedPregunta}
        defaultFaseId={faseId}
        defaultSeccion={moduloId}
        defaultOperacion={activeSubTab === "challenge" ? "mixta" : "suma"}
      />

      {/* FORMULARIO TEORÍA (CREATE / UPDATE) */}
      <TeoriaFormModal
        isOpen={isTeoriaModalOpen}
        onClose={() => setIsTeoriaModalOpen(false)}
        faseId={faseId || 1}
        moduloId={moduloId || 1}
        initialData={teoriaData}
      />
    </div>
  );
};