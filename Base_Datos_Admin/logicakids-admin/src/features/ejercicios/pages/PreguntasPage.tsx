import React, { useState, useEffect } from "react";
import { usePreguntas, useTeoria } from "../hooks/usePreguntasQuery";
import { usePreguntaMutations } from "../hooks/usePreguntaMutations";
import { useConfiguraciones } from "../../pedagogia/hooks/usePedagogiaQuery";
import { usePedagogiaMutations } from "../../pedagogia/hooks/usePedagogiaMutations";
import { 
  Trash2, Plus, Loader2, Eye, CheckCircle2, ChevronLeft, ChevronRight, Edit3, 
  HelpCircle, Settings, BookOpen, AlertTriangle, Save, Play, Square, Award
} from "lucide-react";
import { PreguntaForm } from "../components/PreguntaForm";
import { useCustomDialog } from "../../../components/common/CustomDialog";

// Diccionario de nombres de módulos por Fase (Fase F.1)
const FASE_MODULOS: Record<number, Record<number, string>> = {
  1: {
    1: "Operaciones Simples",
    2: "Inferencia y Contexto",
    3: "Resistencia y Combinación"
  },
  2: {
    1: "Gimnasio Numérico Mental",
    2: "Tablas en Acción",
    3: "Tienda Matemática",
    4: "Constructor de Soluciones"
  },
  3: {
    1: "El Detective Literario",
    2: "Secuencia Temporal",
    3: "Deducción de Precios",
    4: "Reparto y Residuos",
    5: "Ciclos y Agrupaciones Máximas"
  },
  4: {
    1: "La Fracción Visual",
    2: "Fracción de Cantidad",
    3: "Porcentajes Rápidos",
    4: "Razón y Mezclas"
  }
};

const getModuloName = (faseId: number, moduloId: number): string => {
  return FASE_MODULOS[faseId]?.[moduloId] || `Módulo ${moduloId}`;
};

export const PreguntasPage: React.FC = () => {
  const [faseId, setFaseId] = useState<number>(1);
  const [moduloId, setModuloId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"general" | "teoria" | "preguntas" | "desafios">("preguntas");
  const [activeChallengeFilter, setActiveChallengeFilter] = useState<"Todos" | "Desafío 1" | "Desafío 2" | "Maestría">("Todos");
  const [activePreguntaFilter, setActivePreguntaFilter] = useState<"Todos" | "Nivel 1" | "Nivel 2" | "Nivel 3">("Todos");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPreguntaForEdit, setSelectedPreguntaForEdit] = useState<any>(null);
  
  // Para el Simulador WYSIWYG
  const [simulatedItemIndex, setSimulatedItemIndex] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const { data: preguntas = [], isLoading: isLoadingPreguntas } = usePreguntas(faseId);
  const { deletePregunta, updatePregunta, saveTeoria } = usePreguntaMutations();
  const { data: configs = [], isLoading: isLoadingConfigs } = useConfiguraciones(faseId);
  const { updateConfiguracion } = usePedagogiaMutations();
  const { confirm, alert: showAlert } = useCustomDialog();

  // Reiniciar módulo al cambiar de fase
  useEffect(() => {
    const mods = FASE_MODULOS[faseId] || { 1: "", 2: "", 3: "" };
    const firstMod = Number(Object.keys(mods)[0]);
    setModuloId(firstMod);
  }, [faseId]);

  // Obtener teoría del módulo actual
  const { data: teoria, isLoading: isLoadingTeoria } = useTeoria(faseId, moduloId, 1);

  // Estados del editor de Teoría
  const [theoryTitle, setTheoryTitle] = useState("");
  const [theoryText, setTheoryText] = useState("");
  const [theoryWarning, setTheoryWarning] = useState("");
  const [diccionarioList, setDiccionarioList] = useState<{ termino: string; definicion: string }[]>([]);
  const [theoryEjemplos, setTheoryEjemplos] = useState<any[]>([]);
  const [theoryInteractivos, setTheoryInteractivos] = useState<any[]>([]);

  useEffect(() => {
    if (teoria) {
      setTheoryTitle(teoria.titulo || "");
      setTheoryText(teoria.texto_descubrimiento || "");
      setTheoryWarning(teoria.advertencia || "");
      
      const dictArray = Object.entries(teoria.diccionario || {}).map(([termino, definicion]) => ({
        termino,
        definicion: String(definicion)
      }));
      setDiccionarioList(dictArray);
      setTheoryEjemplos(teoria.ejemplos || []);
      setTheoryInteractivos(teoria.interactivos || []);
    } else {
      setTheoryTitle("");
      setTheoryText("");
      setTheoryWarning("");
      setDiccionarioList([]);
      setTheoryEjemplos([]);
      setTheoryInteractivos([]);
    }
  }, [teoria]);

  // Filtrar preguntas del módulo activo
  const getModuloIdFromSeccion = (seccion: number) => {
    if (seccion === 99099) {
      const mods = FASE_MODULOS[faseId] || {};
      const modIds = Object.keys(mods).map(Number);
      return modIds.length > 0 ? Math.max(...modIds) : 5;
    }
    if (faseId === 1) {
      const prefix = Math.floor(seccion / 100);
      if (prefix === 1 || prefix === 2) return 1;
      if (prefix === 3) return 2;
      if (prefix === 4) return 3;
      return prefix;
    }
    return seccion >= 1000 ? Math.floor(seccion / 1000) : Math.floor(seccion / 100);
  };

  const getSubIdFromSeccion = (seccion: number) => {
    if (faseId === 1) {
      return seccion % 100;
    }
    return seccion >= 1000 ? seccion % 1000 : seccion % 100;
  };

  const baseModulePreguntas = preguntas.filter(p => {
    const mId = getModuloIdFromSeccion(p.seccion);
    const subId = getSubIdFromSeccion(p.seccion);
    return mId === moduloId && subId < 11;
  });

  const modulePreguntas = baseModulePreguntas.filter(p => {
    if (activePreguntaFilter === "Todos") return true;
    const subId = getSubIdFromSeccion(p.seccion);
    if (activePreguntaFilter === "Nivel 1") return subId === 1;
    if (activePreguntaFilter === "Nivel 2") return subId === 2;
    if (activePreguntaFilter === "Nivel 3") return subId >= 3;
    return true;
  });

  const baseModuleDesafios = preguntas.filter(p => {
    const mId = getModuloIdFromSeccion(p.seccion);
    const subId = getSubIdFromSeccion(p.seccion);
    return mId === moduloId && subId >= 11;
  });

  const moduleDesafios = baseModuleDesafios.filter(p => {
    if (activeChallengeFilter === "Todos") return true;
    const subId = getSubIdFromSeccion(p.seccion);
    if (activeChallengeFilter === "Desafío 1") return subId === 11;
    if (activeChallengeFilter === "Desafío 2") return subId === 12;
    if (activeChallengeFilter === "Maestría") return subId >= 13;
    return true;
  });

  // Lista combinada de preguntas para el simulador
  const simulationList = activeTab === "desafios" ? moduleDesafios : modulePreguntas;

  // Calcular progreso de revisión (Fase F.4)
  const totalPreguntas = baseModulePreguntas.length + baseModuleDesafios.length;
  const revisadasCount = [...baseModulePreguntas, ...baseModuleDesafios].filter(p => p.revisado_admin).length;
  const revisionProgress = totalPreguntas > 0 ? Math.round((revisadasCount / totalPreguntas) * 100) : 0;

  // Filtrar configuraciones del módulo
  const moduleConfigs = configs.filter(c => getModuloIdFromSeccion(c.seccion) === moduloId);

  // Guardar teoría
  const handleSaveTeoria = async () => {
    try {
      const diccionarioObj: Record<string, string> = {};
      diccionarioList.forEach(item => {
        if (item.termino.trim()) {
          diccionarioObj[item.termino.trim()] = item.definicion;
        }
      });

      await saveTeoria({
        fase_id: faseId,
        modulo_id: moduloId,
        nivel_id: 1,
        titulo: theoryTitle,
        texto_descubrimiento: theoryText,
        advertencia: theoryWarning,
        diccionario: diccionarioObj,
        ejemplos: theoryEjemplos,
        interactivos: theoryInteractivos
      });
      showAlert("Teoría guardada exitosamente.", "success");
    } catch (err: any) {
      showAlert("Error al guardar teoría: " + (err.message || err), "error");
    }
  };

  // Guardar configuración en lote
  const handleUpdateConfig = async (configId: number, field: string, value: any) => {
    try {
      await updateConfiguracion({
        id: configId,
        payload: { [field]: value }
      });
      showAlert("Configuración actualizada correctamente.", "success");
    } catch (err: any) {
      showAlert("Error al actualizar configuración: " + (err.message || err), "error");
    }
  };

  const handleDeletePregunta = (id: number) => {
    confirm({
      title: "Eliminar Pregunta",
      message: "¿Seguro que deseas eliminar permanentemente esta pregunta de la base de datos?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deletePregunta(id);
          showAlert("Pregunta eliminada correctamente.", "success");
          if (simulatedItemIndex !== null) setSimulatedItemIndex(null);
        } catch (err: any) {
          showAlert("Error al eliminar pregunta: " + (err.message || err), "error");
        }
      }
    });
  };

  // Guardar estado de revisión en simulador
  const handleToggleRevision = async (pregunta: any, checked: boolean) => {
    try {
      await updatePregunta({
        id: pregunta.id,
        payload: {
          ...pregunta,
          revisado_admin: checked,
          revisado_por: checked ? "amilcar_admin" : null,
          fecha_revision: checked ? new Date().toISOString() : null
        }
      });
      showAlert(checked ? "Pregunta marcada como revisada." : "Pregunta pendiente de revisión.", "info");
    } catch (err: any) {
      showAlert("Error al actualizar estado de revisión: " + (err.message || err), "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Banco de Preguntas */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Banco de Preguntas</h1>
          <p className="text-sm text-slate-500">Administra ejercicios, teoría y configuraciones pedagógicas por bloques.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedPreguntaForEdit(null);
            setIsFormOpen(true);
          }} 
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="h-5 w-5" /> Nueva Pregunta
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 w-fit">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => (
          <button 
            key={id} 
            onClick={() => {
              setFaseId(id);
              setSimulatedItemIndex(null);
            }} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              faseId === id 
                ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-white" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            Fase {id}
          </button>
        ))}
      </div>

      {/* Progreso de Revisión General del Módulo */}
      <div className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/60 dark:border-indigo-900/40 rounded-2xl">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-indigo-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Revisión del Módulo: {revisadasCount} de {totalPreguntas} preguntas aprobadas
          </span>
        </div>
        <div className="flex items-center gap-3 w-64">
          <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${revisionProgress}%` }}></div>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{revisionProgress}%</span>
        </div>
      </div>

      {/* Layout de Doble Columna (Fase F.1) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Columna Izquierda: Sidebar de Módulos (25%) */}
        <aside className="border border-slate-100 bg-white rounded-2xl p-4 dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">Módulos de la Fase</span>
          {Object.keys(FASE_MODULOS[faseId] || { 1: "", 2: "", 3: "" }).map(mKey => {
            const mNum = Number(mKey);
            const isActive = moduloId === mNum;
            return (
              <button
                key={mNum}
                onClick={() => {
                  setModuloId(mNum);
                  setSimulatedItemIndex(null);
                }}
                className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-l-4 ${
                  isActive
                    ? "border-l-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-semibold"
                    : "border-l-transparent text-slate-600 hover:bg-slate-50 dark:hover:bg-zinc-800/50 dark:text-slate-300"
                }`}
              >
                <span>{getModuloName(faseId, mNum)}</span>
                <span className="text-xs font-mono text-slate-400">#M{mNum}</span>
              </button>
            );
          })}
        </aside>

        {/* Columna Derecha: Área de Trabajo Principal (75%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-slate-100 bg-white rounded-2xl p-6 dark:border-zinc-800 dark:bg-zinc-900">
            {/* Cabecera del Módulo */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {getModuloName(faseId, moduloId)} <span className="font-mono text-sm font-normal text-slate-400">(Fase {faseId} - Módulo {moduloId})</span>
              </h2>
              {/* Sub-pestañas horizontales */}
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs">
                {(["general", "teoria", "preguntas", "desafios"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSimulatedItemIndex(null);
                      if (tab !== "desafios") {
                        setActiveChallengeFilter("Todos");
                      }
                      if (tab !== "preguntas") {
                        setActivePreguntaFilter("Todos");
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-lg font-bold capitalize transition-all ${
                      activeTab === tab
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-950 dark:text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab === "teoria" ? "Teoría" : tab === "preguntas" ? "Preguntas" : tab === "desafios" ? "Desafíos" : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* A. PESTAÑA: GENERAL (Fase F.2) */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50/20 border border-indigo-100 dark:border-indigo-950/40 rounded-xl">
                  <h3 className="text-sm font-bold text-indigo-600 flex items-center gap-2 mb-1.5">
                    <Settings className="h-4 w-4" /> Reglas de Negocio del Módulo
                  </h3>
                  <p className="text-xs text-slate-500">Configura los requisitos de maestría y paso pedagógico para este bloque.</p>
                </div>

                {isLoadingConfigs ? (
                  <p className="text-slate-400 text-xs">Cargando configuraciones...</p>
                ) : moduleConfigs.length === 0 ? (
                  <p className="text-slate-400 text-xs">No se encontraron configuraciones para este bloque.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {moduleConfigs.map(c => (
                      <div key={c.id} className="p-4 border rounded-xl dark:border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2 dark:border-zinc-800">
                          <span className="font-bold text-sm text-indigo-600 capitalize">{c.operacion}</span>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded dark:bg-zinc-800">ID: {c.id}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-slate-400 block font-semibold uppercase">Req. Maestría</label>
                            <input
                              type="number"
                              className="border p-2 rounded-lg w-full dark:bg-zinc-800 dark:border-zinc-700"
                              defaultValue={c.cantidad_requerida}
                              onBlur={e => handleUpdateConfig(c.id, "cantidad_requerida", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 block font-semibold uppercase">% Aprobación</label>
                            <input
                              type="number"
                              className="border p-2 rounded-lg w-full dark:bg-zinc-800 dark:border-zinc-700"
                              defaultValue={c.porcentaje_aprobacion}
                              onBlur={e => handleUpdateConfig(c.id, "porcentaje_aprobacion", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 block font-semibold uppercase">Feedback</label>
                            <select
                              className="border p-2 rounded-lg w-full dark:bg-zinc-800 dark:border-zinc-700"
                              value={c.tipo_feedback}
                              onChange={e => handleUpdateConfig(c.id, "tipo_feedback", e.target.value)}
                            >
                              <option value="simple">Simple</option>
                              <option value="detallado">Detallado</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-slate-400 block font-semibold uppercase">Cronómetro</label>
                            <select
                              className="border p-2 rounded-lg w-full dark:bg-zinc-800 dark:border-zinc-700"
                              value={c.usa_cronometro ? "true" : "false"}
                              onChange={e => handleUpdateConfig(c.id, "usa_cronometro", e.target.value === "true")}
                            >
                              <option value="false">No usa</option>
                              <option value="true">Usa</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* B. PESTAÑA: TEORÍA (Fase F.3) */}
            {activeTab === "teoria" && (
              <div className="space-y-6">
                {isLoadingTeoria ? (
                  <div className="py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
                ) : (
                  <div className="space-y-6">
                    {/* Información General de la Teoría */}
                    <div className="border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/10 rounded-2xl p-5 space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2 dark:border-zinc-800">
                        <HelpCircle className="h-4 w-4 text-indigo-500" /> Información General
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-slate-500">Título de Teoría</label>
                          <input 
                            type="text" 
                            className="w-full border p-2.5 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm" 
                            value={theoryTitle}
                            onChange={e => setTheoryTitle(e.target.value)}
                            placeholder="Ej: Sumas Simples"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-slate-500">Texto de Descubrimiento (Pedagógico)</label>
                          <textarea 
                            rows={4}
                            className="w-full border p-3 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm" 
                            value={theoryText}
                            onChange={e => setTheoryText(e.target.value)}
                            placeholder="Guion y explicación de aprendizaje..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase text-slate-500">Advertencia / Tip del Tutor (Opcional)</label>
                          <input 
                            type="text" 
                            className="w-full border p-2.5 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-sm" 
                            value={theoryWarning}
                            onChange={e => setTheoryWarning(e.target.value)}
                            placeholder="Evita trampas comunes..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sección 1: Diccionario Pedagógico */}
                    <div className="border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/10 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2.5 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-indigo-500" /> Diccionario Pedagógico (Glosario)
                        </h3>
                        <button
                          type="button"
                          onClick={() => setDiccionarioList([...diccionarioList, { termino: "", definicion: "" }])}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100/70 transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" /> Agregar Término
                        </button>
                      </div>

                      {diccionarioList.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">No hay términos definidos en el glosario.</p>
                      ) : (
                        <div className="space-y-3">
                          {diccionarioList.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                <input
                                  type="text"
                                  placeholder="Término (ej: Ignorar)"
                                  className="border p-2.5 rounded-xl text-xs dark:bg-zinc-800 dark:border-zinc-700 w-full font-semibold"
                                  value={item.termino}
                                  onChange={e => {
                                    const newList = [...diccionarioList];
                                    newList[idx].termino = e.target.value;
                                    setDiccionarioList(newList);
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Definición o explicación del término..."
                                  className="border p-2.5 rounded-xl text-xs dark:bg-zinc-800 dark:border-zinc-700 w-full"
                                  value={item.definicion}
                                  onChange={e => {
                                    const newList = [...diccionarioList];
                                    newList[idx].definicion = e.target.value;
                                    setDiccionarioList(newList);
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setDiccionarioList(diccionarioList.filter((_, i) => i !== idx))}
                                className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all self-center"
                                title="Eliminar Término"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sección 2: Ejemplos Guiados */}
                    <div className="border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/10 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2.5 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Play className="h-4 w-4 text-emerald-500" /> Ejemplos Guiados (Paso a Paso)
                        </h3>
                        <button
                          type="button"
                          onClick={() => setTheoryEjemplos([...theoryEjemplos, { enunciado: "", pasos: [] }])}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100/70 transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" /> Agregar Ejemplo
                        </button>
                      </div>

                      {theoryEjemplos.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">No hay ejemplos guiados registrados.</p>
                      ) : (
                        <div className="space-y-6">
                          {theoryEjemplos.map((ej, idx) => (
                            <div key={idx} className="p-4 border rounded-xl dark:border-zinc-850 bg-white dark:bg-zinc-900/50 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">EJEMPLO #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => setTheoryEjemplos(theoryEjemplos.filter((_, i) => i !== idx))}
                                  className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 rounded-lg transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Eliminar Ejemplo
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase text-slate-400">Enunciado del Ejemplo</label>
                                <textarea
                                  rows={2}
                                  placeholder="Introduce el enunciado completo del ejemplo..."
                                  className="w-full border p-2.5 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-xs"
                                  value={ej.enunciado}
                                  onChange={e => {
                                    const newEjs = [...theoryEjemplos];
                                    newEjs[idx].enunciado = e.target.value;
                                    setTheoryEjemplos(newEjs);
                                  }}
                                />
                              </div>

                              {/* Pasos del Ejemplo */}
                              <div className="space-y-3 pl-4 border-l-2 border-emerald-500/30">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-bold uppercase text-slate-400">Pasos Explicativos</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newEjs = [...theoryEjemplos];
                                      const pasos = newEjs[idx].pasos || [];
                                      const nextOrder = pasos.length + 1;
                                      newEjs[idx].pasos = [...pasos, { orden: nextOrder, texto: "" }];
                                      setTheoryEjemplos(newEjs);
                                    }}
                                    className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-600 font-bold"
                                  >
                                    <Plus className="h-3 w-3" /> Agregar Paso
                                  </button>
                                </div>

                                {(ej.pasos || []).length === 0 ? (
                                  <p className="text-[10px] text-slate-400 italic">No hay pasos explicativos en este ejemplo.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {(ej.pasos || []).map((paso: any, pIdx: number) => (
                                      <div key={pIdx} className="flex gap-2 items-center">
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg shrink-0">
                                          Paso {paso.orden || pIdx + 1}
                                        </span>
                                        <input
                                          type="text"
                                          placeholder="Explicación del paso (soporta html básico)..."
                                          className="w-full border p-2 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-xs"
                                          value={paso.texto}
                                          onChange={e => {
                                            const newEjs = [...theoryEjemplos];
                                            newEjs[idx].pasos[pIdx].texto = e.target.value;
                                            setTheoryEjemplos(newEjs);
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newEjs = [...theoryEjemplos];
                                            const filteredPasos = newEjs[idx].pasos.filter((_: any, i: number) => i !== pIdx);
                                            newEjs[idx].pasos = filteredPasos.map((p: any, i: number) => ({
                                              ...p,
                                              orden: i + 1
                                            }));
                                            setTheoryEjemplos(newEjs);
                                          }}
                                          className="text-red-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sección 3: Ejercicios Prácticos (Interactivos) */}
                    <div className="border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/10 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2.5 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <Award className="h-4 w-4 text-violet-500" /> Ejercicios Prácticos (Entrenamiento)
                        </h3>
                        <button
                          type="button"
                          onClick={() => setTheoryInteractivos([...theoryInteractivos, { enunciado: "", respuesta: "", feedback_acierto: "", feedback_error: "" }])}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-bold hover:bg-violet-100/70 transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" /> Agregar Ejercicio
                        </button>
                      </div>

                      {theoryInteractivos.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">No hay ejercicios prácticos registrados.</p>
                      ) : (
                        <div className="space-y-6">
                          {theoryInteractivos.map((inter, idx) => (
                            <div key={idx} className="p-4 border rounded-xl dark:border-zinc-850 bg-white dark:bg-zinc-900/50 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-violet-600 dark:text-violet-400">EJERCICIO #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => setTheoryInteractivos(theoryInteractivos.filter((_, i) => i !== idx))}
                                  className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 rounded-lg transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Eliminar Ejercicio
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                  <label className="text-[11px] font-bold uppercase text-slate-400">Enunciado del Ejercicio</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Introduce la pregunta para el alumno..."
                                    className="w-full border p-2.5 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-xs"
                                    value={inter.enunciado}
                                    onChange={e => {
                                      const newInters = [...theoryInteractivos];
                                      newInters[idx].enunciado = e.target.value;
                                      setTheoryInteractivos(newInters);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold uppercase text-slate-400">Respuesta Correcta</label>
                                  <input
                                    type="text"
                                    placeholder="Ej: 5"
                                    className="w-full border p-2.5 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-xs font-bold"
                                    value={inter.respuesta}
                                    onChange={e => {
                                      const newInters = [...theoryInteractivos];
                                      newInters[idx].respuesta = e.target.value;
                                      setTheoryInteractivos(newInters);
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Feedback Acierto (¡Bien hecho!)</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Explicación cuando acierte..."
                                    className="w-full border p-2.5 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-xs"
                                    value={inter.feedback_acierto}
                                    onChange={e => {
                                      const newInters = [...theoryInteractivos];
                                      newInters[idx].feedback_acierto = e.target.value;
                                      setTheoryInteractivos(newInters);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold uppercase text-red-500 dark:text-red-400">Feedback Error (Recomendación)</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Guía para cuando falle..."
                                    className="w-full border p-2.5 rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-xs"
                                    value={inter.feedback_error}
                                    onChange={e => {
                                      const newInters = [...theoryInteractivos];
                                      newInters[idx].feedback_error = e.target.value;
                                      setTheoryInteractivos(newInters);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botón de Guardar */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        onClick={handleSaveTeoria}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <Save className="h-4 w-4" /> Guardar Teoría
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* C. PESTAÑA: PREGUNTAS (Listado y Simulador) */}
            {activeTab === "preguntas" && (
              <div className="space-y-4">
                {/* Sub-pestañas de Segmentación de Preguntas */}
                <div className="flex flex-wrap gap-2 mb-2 p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 w-fit border border-slate-100 dark:border-zinc-800">
                  {(["Todos", "Nivel 1", "Nivel 2", "Nivel 3"] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActivePreguntaFilter(filter);
                        setSimulatedItemIndex(null);
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activePreguntaFilter === filter
                          ? "bg-white text-indigo-600 shadow-sm border-b-2 border-indigo-600 dark:bg-zinc-900 dark:text-indigo-400 dark:border-indigo-500"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {filter === "Nivel 1" ? "Nivel 1: Básico" : 
                       filter === "Nivel 2" ? "Nivel 2: Intermedio" : 
                       filter === "Nivel 3" ? "Nivel 3: Avanzado" : "Todos"}
                    </button>
                  ))}
                </div>
                {isLoadingPreguntas ? (
                  <div className="py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
                ) : modulePreguntas.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No hay preguntas registradas en este módulo.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border dark:border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:border-zinc-800 dark:bg-zinc-950/50">
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Enunciado</th>
                          <th className="px-4 py-3">Respuesta</th>
                          <th className="px-4 py-3">Operación</th>
                          <th className="px-4 py-3 text-center">Estado</th>
                          <th className="px-4 py-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-zinc-800">
                        {modulePreguntas.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                            <td className="px-4 py-3 font-mono text-xs">#{p.id}</td>
                            <td className="px-4 py-3 max-w-xs truncate">{p.enunciado}</td>
                            <td className="px-4 py-3 font-bold text-emerald-600">{p.respuesta_correcta}</td>
                            <td className="px-4 py-3 capitalize text-xs">{p.operacion}</td>
                            <td className="px-4 py-3 text-center">
                              {p.revisado_admin ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold dark:bg-emerald-950/20">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Revisada
                                </span>
                              ) : (
                                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-semibold dark:bg-zinc-800 dark:text-slate-400">
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => {
                                    setSimulatedItemIndex(idx);
                                    setSelectedAnswer(null);
                                  }} 
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-800 rounded transition-colors" 
                                  title="Simular WYSIWYG"
                                >
                                  <Eye className="h-4.5 w-4.5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedPreguntaForEdit(p);
                                    setIsFormOpen(true);
                                  }} 
                                  className="p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded transition-colors" 
                                  title="Editar"
                                >
                                  <Edit3 className="h-4.5 w-4.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeletePregunta(p.id)} 
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800 rounded transition-colors" 
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* D. PESTAÑA: DESAFÍOS (Fase F.1) */}
            {activeTab === "desafios" && (
              <div className="space-y-4">
                {/* Sub-pestañas de Segmentación de Desafíos */}
                <div className="flex flex-wrap gap-2 mb-2 p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 w-fit border border-slate-100 dark:border-zinc-800">
                  {(["Todos", "Desafío 1", "Desafío 2", "Maestría"] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveChallengeFilter(filter);
                        setSimulatedItemIndex(null);
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeChallengeFilter === filter
                          ? "bg-white text-indigo-600 shadow-sm border-b-2 border-indigo-600 dark:bg-zinc-900 dark:text-indigo-400 dark:border-indigo-500"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {filter === "Desafío 1" ? "Desafío 1: Estándar" : 
                       filter === "Desafío 2" ? "Desafío 2: Avanzada" : 
                       filter === "Maestría" ? "Desafío Final: Maestría" : "Todos"}
                    </button>
                  ))}
                </div>

                {isLoadingPreguntas ? (
                  <div className="py-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" /></div>
                ) : moduleDesafios.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No hay desafíos registrados en este módulo.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border dark:border-zinc-800">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:border-zinc-800 dark:bg-zinc-950/50">
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Enunciado</th>
                          <th className="px-4 py-3">Respuesta</th>
                          <th className="px-4 py-3">Operación</th>
                          <th className="px-4 py-3 text-center">Estado</th>
                          <th className="px-4 py-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-zinc-800">
                        {moduleDesafios.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                            <td className="px-4 py-3 font-mono text-xs">#{p.id}</td>
                            <td className="px-4 py-3 max-w-xs truncate">{p.enunciado}</td>
                            <td className="px-4 py-3 font-bold text-emerald-600">{p.respuesta_correcta}</td>
                            <td className="px-4 py-3 capitalize text-xs">{p.operacion}</td>
                            <td className="px-4 py-3 text-center">
                              {p.revisado_admin ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold dark:bg-emerald-950/20">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Revisada
                                </span>
                              ) : (
                                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-semibold dark:bg-zinc-800 dark:text-slate-400">
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => {
                                    setSimulatedItemIndex(idx);
                                    setSelectedAnswer(null);
                                  }} 
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-800 rounded transition-colors" 
                                  title="Simular WYSIWYG"
                                >
                                  <Eye className="h-4.5 w-4.5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedPreguntaForEdit(p);
                                    setIsFormOpen(true);
                                  }} 
                                  className="p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded transition-colors" 
                                  title="Editar"
                                >
                                  <Edit3 className="h-4.5 w-4.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeletePregunta(p.id)} 
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800 rounded transition-colors" 
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODO SIMULACIÓN ALUMNO (WYSIWYG) - MODAL (Fase F.4) */}
      {simulatedItemIndex !== null && simulationList[simulatedItemIndex] && (() => {
        const item = simulationList[simulatedItemIndex];
        const next = () => {
          if (simulatedItemIndex < simulationList.length - 1) {
            setSimulatedItemIndex(simulatedItemIndex + 1);
            setSelectedAnswer(null);
          }
        };
        const prev = () => {
          if (simulatedItemIndex > 0) {
            setSimulatedItemIndex(simulatedItemIndex - 1);
            setSelectedAnswer(null);
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSimulatedItemIndex(null)} />

            {/* Simulador Container */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl dark:bg-zinc-900 border dark:border-zinc-800 text-slate-900 dark:text-white transition-all">
              {/* Barra de Control Superior */}
              <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                <button 
                  onClick={prev} 
                  disabled={simulatedItemIndex === 0}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-center flex-1">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Simulador Alumno</span>
                  <span className="text-sm font-bold">
                    {simulatedItemIndex + 1} de {simulationList.length} en cola
                  </span>
                </div>
                <button 
                  onClick={next} 
                  disabled={simulatedItemIndex === simulationList.length - 1}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Área Central: Simulador del Dispositivo Infantil */}
              <div className="p-6 bg-slate-50 dark:bg-zinc-950/30 flex items-center justify-center">
                <div className="w-full max-w-sm border-4 border-slate-900 rounded-3xl bg-[#ecf9ff] dark:bg-zinc-900 overflow-hidden shadow-lg p-5 aspect-[9/16] flex flex-col justify-between text-slate-800 dark:text-slate-100">
                  {/* Info Header Simulado */}
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>LogicaKids Pro</span>
                    <span className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 px-2 py-0.5 rounded-full">⭐ 150</span>
                  </div>

                  {/* Enunciado Simulado */}
                  <div className="bg-white dark:bg-zinc-800 border-2 border-slate-900 dark:border-zinc-700 p-4 rounded-2xl shadow-sm my-4 flex-1 flex items-center justify-center text-center">
                    <p className="text-sm font-bold leading-relaxed">{item.enunciado}</p>
                  </div>

                  {/* Alternativas en Grilla Simulado */}
                  <div className="space-y-2 mt-auto">
                    {item.alternativas && item.alternativas.length > 0 ? (
                       <div className="grid grid-cols-2 gap-2">
                        {item.alternativas.map((alt: any) => {
                          const isSelected = selectedAnswer === alt.texto;
                          const isCorrect = alt.es_correcta;
                          let btnStyle = "bg-white border-slate-300 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700";
                          if (isSelected) {
                            btnStyle = isCorrect
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : "bg-red-500 border-red-600 text-white";
                          }
                          return (
                            <button
                              key={alt.id || alt.texto}
                              onClick={() => setSelectedAnswer(alt.texto)}
                              className={`p-3 rounded-xl border-2 font-bold text-xs shadow-sm transition-all text-center ${btnStyle}`}
                            >
                              {alt.texto}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      // Campo numérico para respuestas directas
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full text-center border-2 border-slate-900 dark:border-zinc-700 p-3 rounded-xl bg-white dark:bg-zinc-800 font-bold"
                          placeholder="Tu respuesta numérica..."
                          value={selectedAnswer || ""}
                          onChange={e => setSelectedAnswer(e.target.value)}
                        />
                        {selectedAnswer && (
                          <div className={`text-center font-bold text-xs p-2 rounded-lg ${
                            selectedAnswer.trim() === item.respuesta_correcta.trim()
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {selectedAnswer.trim() === item.respuesta_correcta.trim() ? "¡Correcto! 🎉" : "Incorrecto 😢"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fila de Control Inferior: Acciones del Admin */}
              <div className="p-4 border-t dark:border-zinc-800 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
                    checked={item.revisado_admin}
                    onChange={e => handleToggleRevision(item, e.target.checked)}
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Aprobada y revisada por el Admin
                  </span>
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedPreguntaForEdit(item);
                      setIsFormOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 border rounded-xl hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-xs font-bold transition-colors"
                  >
                    <Edit3 className="h-4 w-4" /> Editar
                  </button>
                  <button 
                    onClick={() => handleDeletePregunta(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <PreguntaForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPreguntaForEdit(null);
        }} 
        initialData={selectedPreguntaForEdit}
        defaultFaseId={faseId}
        defaultSeccion={moduloId * 100}
        defaultOperacion={null}
      />
    </div>
  );
};