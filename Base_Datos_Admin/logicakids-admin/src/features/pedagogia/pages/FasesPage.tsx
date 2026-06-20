import React, { useState } from "react";
import { useFases, useConfiguraciones } from "../hooks/usePedagogiaQuery";
import { usePedagogiaMutations } from "../hooks/usePedagogiaMutations";
import { useCustomDialog } from "../../../components/common/CustomDialog";
import { Loader2, ChevronDown, ChevronUp, Edit3, Settings, HelpCircle, Save, X, Sparkles, Award } from "lucide-react";

export const FasesPage: React.FC = () => {
  const { data: fases = [], isLoading } = useFases();
  const [expandedFaseId, setExpandedFaseId] = useState<number | null>(1); // Default Fase 1 expanded to display visual tree immediately
  const [editConfig, setEditConfig] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-500" />
        <p className="text-sm text-slate-500 mt-2">Cargando mapa pedagógico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="text-indigo-600 dark:text-indigo-400" /> Mapa de Pedagogía y Fases
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Visualiza el árbol de aprendizaje de los alumnos. Cada fase desbloquea módulos específicos con diferentes operaciones matemáticas.
        </p>
      </div>

      {/* ÁRBOL DE APRENDIZAJE TRUNK */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-100 dark:border-indigo-950/60 ml-2 space-y-6 pt-2 pb-2">
        {fases.map((f, idx) => {
          const isExpanded = expandedFaseId === f.id;
          return (
            <div key={f.id} className="relative">
              {/* Trunk Node Dot Indicator */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 transition-all ${
                isExpanded 
                  ? "bg-indigo-600 border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/40" 
                  : "bg-white border-indigo-300 dark:bg-slate-900 dark:border-indigo-800"
              }`} />

              {/* Phase Card Node */}
              <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-white">
                <div
                  onClick={() => setExpandedFaseId(isExpanded ? null : f.id)}
                  className={`flex justify-between items-center p-5 cursor-pointer transition-colors ${
                    isExpanded 
                      ? "bg-indigo-50/30 dark:bg-indigo-950/10" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 px-3 py-1 rounded-full">
                      Fase {f.orden}
                    </span>
                    <span className="font-extrabold text-sm sm:text-base tracking-tight dark:text-slate-100">
                      {f.nombre}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Sub-Branch: Module Diagram */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Ramas del Módulo
                    </div>
                    
                    <ModuleTreeBranch 
                      faseId={f.id} 
                      onEditConfig={(config: any) => setEditConfig(config)} 
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT LEAF MODAL (INLINE FORM OVERLAY) */}
      {editConfig && (
        <EditConfigModal 
          config={editConfig} 
          onClose={() => setEditConfig(null)} 
        />
      )}
    </div>
  );
};

// Component for rendering the visual tree branches of the modules
const ModuleTreeBranch: React.FC<{ 
  faseId: number; 
  onEditConfig: (config: any) => void;
}> = ({ faseId, onEditConfig }) => {
  const { data: configs = [], isLoading } = useConfiguraciones(faseId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Cargando ramas del árbol...
      </div>
    );
  }

  if (configs.length === 0) {
    return <p className="text-xs text-slate-400 italic">No hay módulos configurados para esta fase.</p>;
  }

  // Get operational badge details
  const getOpDetails = (op: string) => {
    const key = op.toLowerCase();
    if (key.includes("suma")) return { label: "Suma", icon: "+", color: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400" };
    if (key.includes("resta")) return { label: "Resta", icon: "−", color: "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400" };
    if (key.includes("multiplicacion") || key.includes("mult")) return { label: "Multiplicación", icon: "×", color: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400" };
    if (key.includes("division") || key.includes("div")) return { label: "División", icon: "÷", color: "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/30 dark:border-purple-900/40 dark:text-purple-400" };
    return { label: "Mixta", icon: "★", color: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400" };
  };

  return (
    <div className="relative">
      {/* Visual Tree Connector System */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-indigo-100 dark:bg-indigo-950/40 z-0" />

      {/* Grid of branch leaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {configs.map((c: any, index: number) => {
          const op = getOpDetails(c.operacion);
          const isLeft = index % 2 === 0;

          return (
            <div 
              key={c.id} 
              className={`flex items-center gap-4 group p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all dark:bg-slate-900/50 dark:border-slate-800 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Node index / Branching number */}
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-xs shrink-0 dark:bg-indigo-950/40 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                M{c.seccion}
              </div>

              {/* Branch Node Card Body */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                    Módulo {c.seccion}
                  </span>
                  <button
                    onClick={() => onEditConfig(c)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    title="Editar porcentaje de aprobación"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {/* Operation Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${op.color}`}>
                    <span className="text-xs font-black">{op.icon}</span> {op.label}
                  </span>

                  {/* Percentage Target Badge */}
                  <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                    Aprobación: {c.porcentaje_aprobacion}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Custom interactive config leaf editor modal
const EditConfigModal: React.FC<{ 
  config: any; 
  onClose: () => void; 
}> = ({ config, onClose }) => {
  const { updateConfiguracion } = usePedagogiaMutations();
  const { alert: showAlert } = useCustomDialog();
  const [pct, setPct] = useState<number>(config.porcentaje_aprobacion);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateConfiguracion({ 
        id: config.id, 
        payload: { porcentaje_aprobacion: pct } 
      });
      showAlert("Regla pedagógica actualizada con éxito.", "success");
      onClose();
    } catch (err: any) {
      showAlert("Error al actualizar la regla: " + (err.message || err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border dark:bg-slate-900 dark:border-slate-800 text-slate-900 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="text-indigo-500 h-5 w-5" />
            <h3 className="text-lg font-black dark:text-white">Editar Módulo {config.seccion}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl dark:bg-slate-950/50 space-y-1.5 text-xs border dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Operación:</span>
              <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">{config.operacion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Módulo actual:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Sección {config.seccion}</span>
            </div>
          </div>

          {/* Slider input control */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Porcentaje de Aprobación</label>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{pct}%</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-800 accent-indigo-600 dark:accent-indigo-450"
              value={pct}
              onChange={e => setPct(Number(e.target.value))}
            />
            
            {/* Quick buttons */}
            <div className="flex gap-2 justify-center">
              {[50, 70, 80, 90, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPct(val)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    pct === val 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border text-sm font-bold rounded-xl dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl flex items-center justify-center min-w-[100px] hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="flex items-center gap-1.5"><Save className="h-4 w-4" /> Salvar</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};