import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Settings, Clock, Layers, ToggleLeft, ToggleRight, 
  CheckCircle, AlertCircle, Loader2, Target, HelpCircle, 
  ChevronRight, ChevronDown, ShieldAlert, Cpu
} from 'lucide-react';
import { 
  getAdminSettings, saveAdminSettings, 
  getModularConfigs, saveModularConfig, createModularConfig 
} from '../../services/storageService';
import { PedagogyConfig, ConfiguracionProgreso } from '../../types';

// ==========================================
// STATIC MAP OF 10 PEDAGOGICAL FASES (Fase 0 to 9)
// ==========================================
interface StaticModule {
  seccion: number;
  operacion: string;
  name: string;
}

interface StaticPhase {
  id: number; // DB fase_id mapping (Fase 0 = 1, Fase 1 = 2, etc.)
  name: string;
  description: string;
  modules: StaticModule[];
}

const STATIC_PHASES: StaticPhase[] = [
  {
    id: 1, // Fase 0
    name: "Fase 0: Operaciones Elementales",
    description: "Cálculo mental libre y dinámico con generación algorítmica. Superación de 5 niveles por operación.",
    modules: [
      { seccion: 1, operacion: "suma", name: "Suma" },
      { seccion: 1, operacion: "resta", name: "Resta" },
      { seccion: 1, operacion: "multiplicacion", name: "Multiplicación" },
      { seccion: 1, operacion: "division", name: "División" }
    ]
  },
  {
    id: 2, // Fase 1
    name: "Fase 1: Operaciones Básicas",
    description: "Aprendizaje por dominio con banco de preguntas fijas dividida en tres disciplinas de complejidad creciente.",
    modules: [
      { seccion: 1, operacion: "suma", name: "Sección 1: Suma Directa" },
      { seccion: 1, operacion: "resta", name: "Sección 1: Resta Directa" },
      { seccion: 1, operacion: "multiplicacion", name: "Sección 1: Multiplicación Directa" },
      { seccion: 1, operacion: "division", name: "Sección 1: División Directa" },
      { seccion: 2, operacion: "suma", name: "Sección 2: Suma Inferencia" },
      { seccion: 2, operacion: "resta", name: "Sección 2: Resta Inferencia" },
      { seccion: 2, operacion: "multiplicacion", name: "Sección 2: Multiplicación Inferencia" },
      { seccion: 2, operacion: "division", name: "Sección 2: División Inferencia" },
      { seccion: 3, operacion: "mixta", name: "Sección 3: Combinación Mixta" }
    ]
  },
  {
    id: 3, // Fase 2
    name: "Fase 2: Desarrollo Numérico",
    description: "Cálculo mental rápido, sistema monetario real y problemas matemáticos iniciales.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Cálculo Mental Rápido" },
      { seccion: 2, operacion: "mixta", name: "Sistema Monetario" },
      { seccion: 3, operacion: "mixta", name: "Lectura y Planteo" }
    ]
  },
  {
    id: 4, // Fase 3
    name: "Fase 3: Problemas de Texto",
    description: "Selección de datos, elección reflexiva de operación y resolución de problemas de texto complejos.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Selección de Datos" },
      { seccion: 2, operacion: "mixta", name: "Elección de Operación" },
      { seccion: 3, operacion: "mixta", name: "Problemas Multietapa" }
    ]
  },
  {
    id: 5, // Fase 4
    name: "Fase 4: Fracciones y Gráficos",
    description: "Identificación de fracciones visuales, porcentajes básicos e interpretación de gráficos.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Fracciones Visuales" },
      { seccion: 2, operacion: "mixta", name: "Porcentajes Básicos" },
      { seccion: 3, operacion: "mixta", name: "Lectura de Tablas y Gráficos" }
    ]
  },
  {
    id: 6, // Fase 5
    name: "Fase 5: Geometría Plana",
    description: "Figuras geométricas en 2D, cálculo de área y perímetro, y Tangram interactivo por tiempo total.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Figuras en 2D" },
      { seccion: 2, operacion: "mixta", name: "Cálculo de Área y Perímetro" },
      { seccion: 3, operacion: "mixta", name: "Tangram Interactivo" }
    ]
  },
  {
    id: 7, // Fase 6
    name: "Fase 6: Geometría Espacial",
    description: "Reconocimiento de cuerpos tridimensionales, conteo de bloques y cálculo de volúmenes de prismas.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Cuerpos 3D" },
      { seccion: 2, operacion: "mixta", name: "Conteo de Bloques" },
      { seccion: 3, operacion: "mixta", name: "Volumen de Prismas" }
    ]
  },
  {
    id: 8, // Fase 7
    name: "Fase 7: Coordenadas",
    description: "Navegación en el plano cartesiano, pares ordenados y movimientos dirigidos en cuadrícula.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Plano Cartesiano" },
      { seccion: 2, operacion: "mixta", name: "Ubicación de Pares Ordenados" },
      { seccion: 3, operacion: "mixta", name: "Desplazamientos en Grid" }
    ]
  },
  {
    id: 9, // Fase 8
    name: "Fase 8: Probabilidad y Lógica",
    description: "Casos favorables y posibles, razonamiento lógico deductivo, combinatoria y secuencias.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Probabilidad Básica" },
      { seccion: 2, operacion: "mixta", name: "Combinatoria y Conteo" },
      { seccion: 3, operacion: "mixta", name: "Secuencias Lógicas" }
    ]
  },
  {
    id: 10, // Fase 9
    name: "Fase 9: Simulados Pedro II",
    description: "Simulacros cortos de entrenamiento y exámenes oficiales completos con tiempo global.",
    modules: [
      { seccion: 1, operacion: "mixta", name: "Simulados Cortos" },
      { seccion: 2, operacion: "mixta", name: "Exámenes Completos Pedro II" }
    ]
  }
];

const DEFAULT_GLOBAL_CONFIG: PedagogyConfig = {
  questionsPerPhase: 50,
  timers: { easy: 10, easy_medium: 12, medium: 14, medium_hard: 16, hard: 18 },
  useTimer: true,
  passingScore: 90,
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// ==========================================
// PRESET SLIDER WITH FLOATING TOOLTIP
// ==========================================
const SliderWithTooltip: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  accentColor: string;
  unit?: string;
}> = ({ value, min, max, step = 1, onChange, disabled = false, accentColor, unit = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full group pt-2 select-none">
      {/* Floating tooltip */}
      <div
        className="absolute -top-3 transform -translate-x-1/2 pointer-events-none transition-all duration-100 z-30"
        style={{ left: `${percentage}%` }}
      >
        <div className="bg-slate-900 border border-white/20 text-white font-black text-xs px-2 py-0.5 rounded shadow-xl whitespace-nowrap">
          {value}{unit}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
        </div>
      </div>

      {/* Track background */}
      <div className="relative w-full h-2 bg-slate-800/80 rounded-full">
        {/* Filled portion */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-150 ${disabled ? 'bg-slate-600' : accentColor}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 -ml-2 rounded-full border-2 border-white bg-slate-950 shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none z-20 transition-transform ${disabled ? 'scale-75 opacity-55' : 'group-hover:scale-110'}`}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Invisible range input on top */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="absolute top-2 left-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed z-30"
      />
    </div>
  );
};

// ==========================================
// CORE COMPONENT
// ==========================================
const PedagogyTab: React.FC = () => {
  // Navigation
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1); // Fase 0 by default
  const [selectedModule, setSelectedModule] = useState<StaticModule | null>(null); // null means Phase selected
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 1: true });

  // Main config states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [globalConfig, setGlobalConfig] = useState<PedagogyConfig>(DEFAULT_GLOBAL_CONFIG);
  const [dbModularConfigs, setDbModularConfigs] = useState<ConfiguracionProgreso[]>([]);

  // Draft editing states (local modifications tracking)
  const [draftGlobalConfig, setDraftGlobalConfig] = useState<PedagogyConfig>(DEFAULT_GLOBAL_CONFIG);
  const [draftModularConfigs, setDraftModularConfigs] = useState<ConfiguracionProgreso[]>([]);

  // Load configs on mount
  useEffect(() => {
    loadAllConfigs();
  }, []);

  const loadAllConfigs = async () => {
    try {
      setLoading(true);
      const [settingsData, modularData] = await Promise.all([
        getAdminSettings(),
        getModularConfigs()
      ]);

      if (settingsData) {
        const mergedGlobal = { ...DEFAULT_GLOBAL_CONFIG, ...settingsData, timers: { ...DEFAULT_GLOBAL_CONFIG.timers, ...(settingsData.timers || {}) } };
        setGlobalConfig(mergedGlobal);
        setDraftGlobalConfig(mergedGlobal);
      }
      if (modularData) {
        setDbModularConfigs(modularData);
        setDraftModularConfigs(JSON.parse(JSON.stringify(modularData))); // deep copy
      }
    } catch (error) {
      console.error("Failed to load platform configurations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle tree accordion
  const togglePhaseExpand = (phaseId: number) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  // Selectors
  const selectPhase = (phaseId: number) => {
    setSelectedPhaseId(phaseId);
    setSelectedModule(null);
  };

  const selectModule = (phaseId: number, mod: StaticModule) => {
    setSelectedPhaseId(phaseId);
    setSelectedModule(mod);
  };

  // Resolve custom records (active draft)
  const activePhase = STATIC_PHASES.find(p => p.id === selectedPhaseId) || STATIC_PHASES[0];

  // Search if a custom override exists for the active selected Phase & Module
  // 1. Phase Default Record (stored in DB as seccion = 0, operacion = 'mixta')
  const activePhaseDefaultRecord = draftModularConfigs.find(
    c => c.fase_id === selectedPhaseId && c.seccion === 0 && c.operacion === 'mixta' && c.activo !== false
  );

  // 2. Module Specific Record
  const activeModuleRecord = selectedModule ? draftModularConfigs.find(
    c => c.fase_id === selectedPhaseId && 
         c.seccion === selectedModule.seccion && 
         c.operacion === selectedModule.operacion && 
         c.activo !== false
  ) : null;

  // Resolve current active parameters applying inheritance:
  // Module specific -> Phase default -> Platform Global
  const getInheritedQuestionsCount = (): number => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.cantidad_requerida;
    return draftGlobalConfig.questionsPerPhase;
  };

  const getInheritedPassingScore = (): number => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.porcentaje_aprobacion;
    return draftGlobalConfig.passingScore;
  };

  const getInheritedUseTimer = (): boolean => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.usa_cronometro;
    return draftGlobalConfig.useTimer;
  };

  const getInheritedFeedbackType = (): string => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.tipo_feedback;
    return 'simple';
  };

  const getInheritedTimerForLevel = (levelKey: 'easy' | 'easy_medium' | 'medium' | 'medium_hard' | 'hard'): number => {
    if (activePhaseDefaultRecord && activePhaseDefaultRecord.tiempo_default_segundos !== null) {
      // If the phase default record has a single timer override
      return activePhaseDefaultRecord.tiempo_default_segundos;
    }
    return draftGlobalConfig.timers[levelKey] || 12;
  };

  // Handle Updates
  const updateGlobalTimer = (key: keyof PedagogyConfig['timers'], val: number) => {
    setDraftGlobalConfig(prev => ({
      ...prev,
      timers: { ...prev.timers, [key]: val }
    }));
  };

  const updateGlobalField = (field: keyof PedagogyConfig, val: any) => {
    setDraftGlobalConfig(prev => ({ ...prev, [field]: val }));
  };

  // Update or Create Phase Default Override
  const handleUpdatePhaseDefault = (field: keyof ConfiguracionProgreso, val: any) => {
    setDraftModularConfigs(prev => {
      const idx = prev.findIndex(c => c.fase_id === selectedPhaseId && c.seccion === 0 && c.operacion === 'mixta');
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [field]: val, activo: true };
        return updated;
      } else {
        // Create new draft phase default
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: 0,
          operacion: 'mixta',
          cantidad_requerida: field === 'cantidad_requerida' ? val : draftGlobalConfig.questionsPerPhase,
          porcentaje_aprobacion: field === 'porcentaje_aprobacion' ? val : draftGlobalConfig.passingScore,
          orden_desbloqueo: 0,
          tipo_feedback: field === 'tipo_feedback' ? val : 'simple',
          usa_cronometro: field === 'usa_cronometro' ? val : draftGlobalConfig.useTimer,
          tiempo_default_segundos: field === 'tiempo_default_segundos' ? val : draftGlobalConfig.timers.medium,
          activo: true
        };
        return [...prev, newRecord];
      }
    });
  };

  // Update or Create Module Specific Override
  const handleUpdateModuleField = (field: keyof ConfiguracionProgreso, val: any) => {
    if (!selectedModule) return;
    setDraftModularConfigs(prev => {
      const idx = prev.findIndex(
        c => c.fase_id === selectedPhaseId && 
             c.seccion === selectedModule.seccion && 
             c.operacion === selectedModule.operacion
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [field]: val, activo: true };
        return updated;
      } else {
        // Create new draft module override based on inherited values
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: selectedModule.seccion,
          operacion: selectedModule.operacion,
          cantidad_requerida: field === 'cantidad_requerida' ? val : getInheritedQuestionsCount(),
          porcentaje_aprobacion: field === 'porcentaje_aprobacion' ? val : getInheritedPassingScore(),
          orden_desbloqueo: selectedModule.seccion,
          tipo_feedback: field === 'tipo_feedback' ? val : getInheritedFeedbackType(),
          usa_cronometro: field === 'usa_cronometro' ? val : getInheritedUseTimer(),
          tiempo_default_segundos: field === 'tiempo_default_segundos' ? val : getInheritedTimerForLevel('medium'),
          activo: true
        };
        return [...prev, newRecord];
      }
    });
  };

  // Toggle Overrides (Switching active/inactive)
  const togglePhaseOverride = (enable: boolean) => {
    setDraftModularConfigs(prev => {
      const idx = prev.findIndex(c => c.fase_id === selectedPhaseId && c.seccion === 0 && c.operacion === 'mixta');
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], activo: enable };
        return updated;
      } else if (enable) {
        // Create new draft with defaults
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: 0,
          operacion: 'mixta',
          cantidad_requerida: draftGlobalConfig.questionsPerPhase,
          porcentaje_aprobacion: draftGlobalConfig.passingScore,
          orden_desbloqueo: 0,
          tipo_feedback: 'simple',
          usa_cronometro: draftGlobalConfig.useTimer,
          tiempo_default_segundos: draftGlobalConfig.timers.medium,
          activo: true
        };
        return [...prev, newRecord];
      }
      return prev;
    });
  };

  const toggleModuleOverride = (enable: boolean) => {
    if (!selectedModule) return;
    setDraftModularConfigs(prev => {
      const idx = prev.findIndex(
        c => c.fase_id === selectedPhaseId && 
             c.seccion === selectedModule.seccion && 
             c.operacion === selectedModule.operacion
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], activo: enable };
        return updated;
      } else if (enable) {
        // Create new module specific draft inheriting from phase
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: selectedModule.seccion,
          operacion: selectedModule.operacion,
          cantidad_requerida: getInheritedQuestionsCount(),
          porcentaje_aprobacion: getInheritedPassingScore(),
          orden_desbloqueo: selectedModule.seccion,
          tipo_feedback: getInheritedFeedbackType(),
          usa_cronometro: getInheritedUseTimer(),
          tiempo_default_segundos: getInheritedTimerForLevel('medium'),
          activo: true
        };
        return [...prev, newRecord];
      }
      return prev;
    });
  };

  // Compare draft vs database to check for changes
  const hasChanges = () => {
    const globalChanged = JSON.stringify(globalConfig) !== JSON.stringify(draftGlobalConfig);
    const modularChanged = JSON.stringify(dbModularConfigs) !== JSON.stringify(draftModularConfigs);
    return globalChanged || modularChanged;
  };

  // Check if a specific phase or module node has pending draft changes (color tree indicator)
  const isPhaseModified = (phaseId: number): boolean => {
    // 1. Check phase default changes
    const originalPhaseRecord = dbModularConfigs.find(c => c.fase_id === phaseId && c.seccion === 0 && c.operacion === 'mixta');
    const draftPhaseRecord = draftModularConfigs.find(c => c.fase_id === phaseId && c.seccion === 0 && c.operacion === 'mixta');
    if (JSON.stringify(originalPhaseRecord) !== JSON.stringify(draftPhaseRecord)) return true;

    // 2. Check modules changes in this phase
    const phaseModules = STATIC_PHASES.find(p => p.id === phaseId)?.modules || [];
    for (const mod of phaseModules) {
      const origMod = dbModularConfigs.find(c => c.fase_id === phaseId && c.seccion === mod.seccion && c.operacion === mod.operacion);
      const draftMod = draftModularConfigs.find(c => c.fase_id === phaseId && c.seccion === mod.seccion && c.operacion === mod.operacion);
      if (JSON.stringify(origMod) !== JSON.stringify(draftMod)) return true;
    }
    return false;
  };

  const isModuleModified = (phaseId: number, seccion: number, operacion: string): boolean => {
    const orig = dbModularConfigs.find(c => c.fase_id === phaseId && c.seccion === seccion && c.operacion === operacion);
    const draft = draftModularConfigs.find(c => c.fase_id === phaseId && c.seccion === seccion && c.operacion === operacion);
    return JSON.stringify(orig) !== JSON.stringify(draft);
  };

  // Save All Changes (Pushing to backend)
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      // 1. Save Global Settings
      const globalChanged = JSON.stringify(globalConfig) !== JSON.stringify(draftGlobalConfig);
      if (globalChanged) {
        await saveAdminSettings(draftGlobalConfig);
        setGlobalConfig({ ...draftGlobalConfig });
      }

      // 2. Save Modular configurations
      // Find new, modified, or toggled modular configs
      for (const draft of draftModularConfigs) {
        const original = dbModularConfigs.find(
          c => c.fase_id === draft.fase_id && 
               c.seccion === draft.seccion && 
               c.operacion === draft.operacion
        );

        if (!original) {
          // New override record
          await createModularConfig(draft);
        } else if (JSON.stringify(original) !== JSON.stringify(draft)) {
          // Modified override record
          if (original.id) {
            await saveModularConfig(original.id, draft);
          }
        }
      }

      // Sync and reload database state
      const reloadedData = await getModularConfigs();
      if (reloadedData) {
        setDbModularConfigs(reloadedData);
        setDraftModularConfigs(JSON.parse(JSON.stringify(reloadedData)));
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Failed to save advanced settings:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-40 select-none">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-500 animate-spin" size={48} />
          <p className="text-slate-400 font-bold text-sm">Cargando base de datos pedagógica...</p>
        </div>
      </div>
    );
  }

  const changesExist = hasChanges();

  return (
    <motion.div variants={itemVariants} className="w-full flex flex-col gap-6 select-none">
      
      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-2xl border border-blue-500/30">
              <Cpu className="text-blue-400" size={24} />
            </div>
            Gestión Pedagógica Avanzada
          </h2>
          <p className="text-slate-400 text-xs mt-1">Configuración jerárquica con sistema de herencia para las 9 fases del Viaje Matemático.</p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || !changesExist}
          className={`px-6 py-3.5 rounded-2xl flex items-center gap-2 font-black shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 ${
            saveStatus === 'success'
              ? 'bg-green-600 hover:bg-green-500'
              : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
          } text-white`}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> :
           saveStatus === 'success' ? <CheckCircle size={18} /> :
           saveStatus === 'error' ? <AlertCircle size={18} /> :
           <Save size={18} />}
          {saving ? 'Guardando en BD...' :
           saveStatus === 'success' ? '¡Todo Guardado!' :
           saveStatus === 'error' ? 'Error al guardar' :
           changesExist ? 'Guardar Cambios' : 'Sin Cambios'}
        </button>
      </div>

      {/* Floating changes alert */}
      {changesExist && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-3.5 flex items-center gap-3"
        >
          <AlertCircle size={18} className="text-amber-400" />
          <span className="text-amber-300 text-xs font-black">
            Tienes modificaciones pendientes sin sincronizar. Presiona "Guardar Cambios" para aplicar a la base de datos.
          </span>
        </motion.div>
      )}

      {/* MAIN SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Hierarchical Accordion Tree */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.2rem] shadow-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Viaje del Alumno</h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-white/5 px-2 py-0.5 rounded-full font-bold">10 Fases</span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
            
            {/* PLATFORM GLOBAL CONFIG NODE */}
            <button
              onClick={() => { setSelectedPhaseId(0); setSelectedModule(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                selectedPhaseId === 0 
                  ? 'bg-blue-600/20 text-white border-blue-500/40 shadow-inner' 
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Settings size={16} className={selectedPhaseId === 0 ? "text-blue-400 animate-spin" : "text-slate-400"} />
              <div className="flex-1">
                <span className="text-xs font-black">Límites Globales (Plataforma)</span>
                <p className="text-[9px] text-slate-500 mt-0.5 font-bold">Valores por defecto ante fallbacks</p>
              </div>
            </button>

            <div className="w-full h-px bg-white/10 my-1" />

            {/* FASES TREE NODES */}
            {STATIC_PHASES.map((phase) => {
              const isExpanded = expandedPhases[phase.id];
              const isSelected = selectedPhaseId === phase.id && selectedModule === null;
              const hasDraftChanges = isPhaseModified(phase.id);

              return (
                <div key={phase.id} className="rounded-2xl border border-white/5 bg-slate-950/20 overflow-hidden">
                  
                  {/* Phase Row */}
                  <div 
                    className={`flex items-center justify-between p-3 cursor-pointer transition-all hover:bg-white/5 ${
                      isSelected ? 'bg-blue-500/10 border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1" onClick={() => selectPhase(phase.id)}>
                      <Layers size={15} className={isSelected ? "text-blue-400" : "text-slate-400"} />
                      <span className={`text-xs font-black transition-colors ${
                        isSelected ? 'text-blue-400' : 'text-white'
                      }`}>
                        {phase.name.split(':')[0]}
                      </span>
                      {hasDraftChanges && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <button 
                      onClick={() => togglePhaseExpand(phase.id)}
                      className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>

                  {/* Modules in Phase */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="bg-black/20 border-t border-white/5 pl-5 py-2 pr-2 flex flex-col gap-1.5"
                      >
                        {phase.modules.map((mod, mIdx) => {
                          const isModSelected = selectedPhaseId === phase.id && 
                                                selectedModule?.seccion === mod.seccion && 
                                                selectedModule?.operacion === mod.operacion;
                          
                          // Check if it has override record in draft
                          const hasOverride = draftModularConfigs.some(
                            c => c.fase_id === phase.id && 
                                 c.seccion === mod.seccion && 
                                 c.operacion === mod.operacion && 
                                 c.activo !== false
                          );
                          const isModModified = isModuleModified(phase.id, mod.seccion, mod.operacion);

                          return (
                            <button
                              key={mIdx}
                              onClick={() => selectModule(phase.id, mod)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between ${
                                isModSelected 
                                  ? 'bg-blue-500/20 text-white border border-blue-500/30 font-black' 
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              }`}
                            >
                              <span className="truncate pr-2">{mod.name}</span>
                              <div className="flex items-center gap-1.5">
                                {isModModified && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                )}
                                {hasOverride && (
                                  <span className="text-[8px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-black">
                                    Override
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Contextual Panel (Drilldown Detail) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AnimatePresence mode="wait">

            {/* VIEW A: PLATFORM GLOBALS */}
            {selectedPhaseId === 0 && (
              <motion.div
                key="globals"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-7"
              >
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Límites Globales de la Plataforma
                  </div>
                  <h3 className="text-xl font-black text-white mt-3">Configuración de Fallbacks Generales</h3>
                  <p className="text-slate-400 text-xs mt-1">Estos valores actúan como fallback en caso de que una fase o módulo no posea un override específico.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  {/* Left Parameter Inputs */}
                  <div className="flex flex-col gap-6">
                    {/* Questions Volume */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-300 font-bold">Volumen de Ejercicios por Fase</label>
                        <span className="text-base font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 min-w-[70px] text-center">
                          {draftGlobalConfig.questionsPerPhase}
                        </span>
                      </div>
                      <SliderWithTooltip
                        value={draftGlobalConfig.questionsPerPhase}
                        min={10}
                        max={120}
                        step={5}
                        onChange={(val) => updateGlobalField('questionsPerPhase', val)}
                        accentColor="bg-blue-500"
                      />
                    </div>

                    {/* Passing Score percentage */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-300 font-bold">Porcentaje Mínimo de Aprobación</label>
                        <span className="text-base font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/20 min-w-[65px] text-center">
                          {draftGlobalConfig.passingScore}%
                        </span>
                      </div>
                      <SliderWithTooltip
                        value={draftGlobalConfig.passingScore}
                        min={50}
                        max={100}
                        step={5}
                        onChange={(val) => updateGlobalField('passingScore', val)}
                        accentColor="bg-green-500"
                        unit="%"
                      />
                    </div>

                    {/* Use Timer Switch */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <label className="text-xs text-slate-300 font-bold">Uso de Cronómetro Global</label>
                        <p className="text-[10px] text-slate-500">Habilita o deshabilita la presión de tiempo general.</p>
                      </div>
                      <button 
                        onClick={() => updateGlobalField('useTimer', !draftGlobalConfig.useTimer)} 
                        className="transition-all hover:scale-105"
                      >
                        {draftGlobalConfig.useTimer ? (
                          <ToggleRight size={38} className="text-blue-500" />
                        ) : (
                          <ToggleLeft size={38} className="text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Parameter Inputs: Timers */}
                  <div className="flex flex-col gap-5 bg-slate-950/20 border border-white/5 p-5 rounded-3xl">
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <Clock size={14} className="text-amber-400" /> Tiempos Base de Dificultad (1 a 5)
                    </h4>

                    <div className="space-y-4" style={{ opacity: draftGlobalConfig.useTimer ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                      {([
                        { id: 'easy' as const, label: 'Nivel 1 (Fácil)', color: 'text-green-400', accent: 'bg-green-500' },
                        { id: 'easy_medium' as const, label: 'Nivel 2 (Medio Fácil)', color: 'text-emerald-400', accent: 'bg-emerald-500' },
                        { id: 'medium' as const, label: 'Nivel 3 (Medio)', color: 'text-amber-400', accent: 'bg-amber-500' },
                        { id: 'medium_hard' as const, label: 'Nivel 4 (Medio Difícil)', color: 'text-orange-400', accent: 'bg-orange-500' },
                        { id: 'hard' as const, label: 'Nivel 5 (Difícil)', color: 'text-red-400', accent: 'bg-red-500' },
                      ]).map((level) => (
                        <div key={level.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold ${level.color}`}>{level.label}</span>
                            <span className="text-xs font-black text-slate-300">{draftGlobalConfig.timers[level.id]}s</span>
                          </div>
                          <SliderWithTooltip
                            value={draftGlobalConfig.timers[level.id]}
                            min={3}
                            max={60}
                            disabled={!draftGlobalConfig.useTimer}
                            onChange={(val) => updateGlobalTimer(level.id, val)}
                            accentColor={level.accent}
                            unit="s"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW B: PHASE DEFAULT SETTINGS */}
            {selectedPhaseId > 0 && !selectedModule && (
              <motion.div
                key={`phase-${selectedPhaseId}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      Parámetros por Defecto de Fase
                    </div>
                    <h3 className="text-xl font-black text-white mt-3">{activePhase.name}</h3>
                    <p className="text-slate-400 text-xs mt-1">{activePhase.description}</p>
                  </div>

                  {/* Override platform defaults toggle */}
                  <div className="flex flex-col items-end gap-1.5 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sobrescribir Global</label>
                    <button 
                      onClick={() => togglePhaseOverride(!activePhaseDefaultRecord)}
                      className="transition-all hover:scale-105"
                    >
                      {activePhaseDefaultRecord ? (
                        <ToggleRight size={34} className="text-blue-400" />
                      ) : (
                        <ToggleLeft size={34} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative pt-4 border-t border-white/5 min-h-[300px]">
                  
                  {/* Glass Esmerilado blur overlay if phase does NOT override global */}
                  <AnimatePresence>
                    {!activePhaseDefaultRecord && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-20 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/5 shadow-inner"
                      >
                        <ShieldAlert className="text-blue-400 mb-2" size={28} />
                        <h4 className="text-xs font-black text-white">Heredando de Límites Globales</h4>
                        <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                          Esta Fase está utilizando las reglas por defecto del sistema. Activa el toggle <strong>"Sobrescribir Global"</strong> para definir límites de volumen o tiempo propios para esta fase.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parameters sliders */}
                    <div className="flex flex-col gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-slate-300 font-bold">Volumen de Ejercicios de Fase</label>
                          <span className="text-base font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
                            {activePhaseDefaultRecord?.cantidad_requerida ?? draftGlobalConfig.questionsPerPhase}
                          </span>
                        </div>
                        <SliderWithTooltip
                          value={activePhaseDefaultRecord?.cantidad_requerida ?? draftGlobalConfig.questionsPerPhase}
                          min={10}
                          max={120}
                          step={5}
                          disabled={!activePhaseDefaultRecord}
                          onChange={(val) => handleUpdatePhaseDefault('cantidad_requerida', val)}
                          accentColor="bg-blue-500"
                        />
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-slate-300 font-bold">Porcentaje de Aprobación</label>
                          <span className="text-base font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/20">
                            {activePhaseDefaultRecord?.porcentaje_aprobacion ?? draftGlobalConfig.passingScore}%
                          </span>
                        </div>
                        <SliderWithTooltip
                          value={activePhaseDefaultRecord?.porcentaje_aprobacion ?? draftGlobalConfig.passingScore}
                          min={50}
                          max={100}
                          step={5}
                          disabled={!activePhaseDefaultRecord}
                          onChange={(val) => handleUpdatePhaseDefault('porcentaje_aprobacion', val)}
                          accentColor="bg-green-500"
                          unit="%"
                        />
                      </div>
                    </div>

                    {/* Single default timer override input */}
                    <div className="bg-slate-950/20 border border-white/5 p-5 rounded-3xl flex flex-col gap-4">
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <Clock size={14} className="text-amber-400" /> Temporizador de Fase Único
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Puedes definir un temporizador único en segundos para todos los niveles de esta fase. Deja en 0 o desactiva para heredar los niveles individuales de dificultad globales.
                      </p>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs text-slate-300 font-bold">Habilitar Cronómetro de Fase</label>
                            <p className="text-[9px] text-slate-500">Uso local para esta fase.</p>
                          </div>
                          <button 
                            onClick={() => handleUpdatePhaseDefault('usa_cronometro', !(activePhaseDefaultRecord?.usa_cronometro ?? draftGlobalConfig.useTimer))}
                            disabled={!activePhaseDefaultRecord}
                            className="transition-all hover:scale-105 disabled:opacity-30"
                          >
                            {activePhaseDefaultRecord?.usa_cronometro ? (
                              <ToggleRight size={36} className="text-blue-400" />
                            ) : (
                              <ToggleLeft size={36} className="text-slate-600" />
                            )}
                          </button>
                        </div>

                        {activePhaseDefaultRecord?.usa_cronometro && (
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-slate-400 font-bold">Segundos Límite del Juego</label>
                              <span className="text-sm font-black text-amber-400">
                                {activePhaseDefaultRecord.tiempo_default_segundos || 12}s
                              </span>
                            </div>
                            <SliderWithTooltip
                              value={activePhaseDefaultRecord.tiempo_default_segundos || 12}
                              min={3}
                              max={3600}
                              step={5}
                              disabled={!activePhaseDefaultRecord}
                              onChange={(val) => handleUpdatePhaseDefault('tiempo_default_segundos', val)}
                              accentColor="bg-amber-500"
                              unit="s"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* VIEW C: MODULE SPECIFIC SETTINGS */}
            {selectedPhaseId > 0 && selectedModule && (
              <motion.div
                key={`module-${selectedPhaseId}-${selectedModule.seccion}-${selectedModule.operacion}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Configuración de Módulo
                    </div>
                    <h3 className="text-xl font-black text-white mt-3">{selectedModule.name}</h3>
                    <p className="text-slate-400 text-xs mt-1">Configuración personalizada aplicable a esta disciplina en la Fase {selectedPhaseId - 1}.</p>
                  </div>

                  {/* Override parent default toggle */}
                  <div className="flex flex-col items-end gap-1.5 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sobrescribir Padre</label>
                    <button 
                      onClick={() => toggleModuleOverride(!activeModuleRecord)}
                      className="transition-all hover:scale-105"
                    >
                      {activeModuleRecord ? (
                        <ToggleRight size={34} className="text-amber-400" />
                      ) : (
                        <ToggleLeft size={34} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative pt-4 border-t border-white/5 min-h-[300px]">
                  
                  {/* Glass Esmerilado blur overlay if module does NOT override phase */}
                  <AnimatePresence>
                    {!activeModuleRecord && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md z-20 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/5 shadow-inner"
                      >
                        <ShieldAlert className="text-amber-400 mb-2" size={28} />
                        <h4 className="text-xs font-black text-white">Heredando de la Fase {selectedPhaseId - 1}</h4>
                        <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                          Este módulo está usando los valores por defecto de la Fase superior. Activa el toggle <strong>"Sobrescribir Padre"</strong> superior para definir límites exclusivos.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Controls */}
                    <div className="flex flex-col gap-6">
                      {/* Questions Count */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-slate-300 font-bold">Cantidad de Preguntas</label>
                          <span className="text-base font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
                            {activeModuleRecord?.cantidad_requerida ?? getInheritedQuestionsCount()}
                          </span>
                        </div>
                        <SliderWithTooltip
                          value={activeModuleRecord?.cantidad_requerida ?? getInheritedQuestionsCount()}
                          min={5}
                          max={100}
                          step={5}
                          disabled={!activeModuleRecord}
                          onChange={(val) => handleUpdateModuleField('cantidad_requerida', val)}
                          accentColor="bg-blue-500"
                        />
                      </div>

                      {/* Passing Score */}
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-slate-300 font-bold">Porcentaje de Aprobación</label>
                          <span className="text-base font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/20">
                            {activeModuleRecord?.porcentaje_aprobacion ?? getInheritedPassingScore()}%
                          </span>
                        </div>
                        <SliderWithTooltip
                          value={activeModuleRecord?.porcentaje_aprobacion ?? getInheritedPassingScore()}
                          min={50}
                          max={100}
                          step={5}
                          disabled={!activeModuleRecord}
                          onChange={(val) => handleUpdateModuleField('porcentaje_aprobacion', val)}
                          accentColor="bg-green-500"
                          unit="%"
                        />
                      </div>
                    </div>

                    {/* Feedback and Timers */}
                    <div className="flex flex-col gap-5 bg-slate-950/20 border border-white/5 p-5 rounded-3xl">
                      {/* Feedback choice */}
                      <div className="space-y-3">
                        <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                          <HelpCircle size={14} className="text-purple-400" /> Tipo de Feedback Pedagógico
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleUpdateModuleField('tipo_feedback', 'simple')}
                            disabled={!activeModuleRecord}
                            className={`px-3 py-2.5 rounded-xl border text-[10px] font-black transition-all ${
                              (activeModuleRecord?.tipo_feedback ?? getInheritedFeedbackType()) === 'simple'
                                ? 'bg-purple-500/20 border-purple-500/40 text-white'
                                : 'bg-white/5 border-white/10 text-slate-400'
                            }`}
                          >
                            Simple (✔/✘)
                          </button>
                          <button
                            onClick={() => handleUpdateModuleField('tipo_feedback', 'detallado')}
                            disabled={!activeModuleRecord}
                            className={`px-3 py-2.5 rounded-xl border text-[10px] font-black transition-all ${
                              (activeModuleRecord?.tipo_feedback ?? getInheritedFeedbackType()) === 'detallado'
                                ? 'bg-purple-500/20 border-purple-500/40 text-white animate-pulse'
                                : 'bg-white/5 border-white/10 text-slate-400'
                            }`}
                          >
                            Tutoría IA
                          </button>
                        </div>
                      </div>

                      {/* Timer settings */}
                      <div className="pt-3 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs text-slate-300 font-bold">Usar Cronómetro de Módulo</label>
                            <p className="text-[9px] text-slate-500">Cronómetro específico local.</p>
                          </div>
                          <button 
                            onClick={() => handleUpdateModuleField('usa_cronometro', !(activeModuleRecord?.usa_cronometro ?? getInheritedUseTimer()))}
                            disabled={!activeModuleRecord}
                            className="transition-all hover:scale-105 disabled:opacity-30"
                          >
                            {(activeModuleRecord?.usa_cronometro ?? getInheritedUseTimer()) ? (
                              <ToggleRight size={36} className="text-blue-400" />
                            ) : (
                              <ToggleLeft size={36} className="text-slate-600" />
                            )}
                          </button>
                        </div>

                        {(activeModuleRecord?.usa_cronometro ?? getInheritedUseTimer()) && (
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-slate-400 font-bold">Tiempo Límite en Segundos</label>
                              <span className="text-sm font-black text-amber-400">
                                {activeModuleRecord?.tiempo_default_segundos ?? getInheritedTimerForLevel('medium')}s
                              </span>
                            </div>
                            <SliderWithTooltip
                              value={activeModuleRecord?.tiempo_default_segundos ?? getInheritedTimerForLevel('medium')}
                              min={3}
                              max={600}
                              step={5}
                              disabled={!activeModuleRecord}
                              onChange={(val) => handleUpdateModuleField('tiempo_default_segundos', val)}
                              accentColor="bg-amber-500"
                              unit="s"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </motion.div>
  );
};

export default PedagogyTab;
