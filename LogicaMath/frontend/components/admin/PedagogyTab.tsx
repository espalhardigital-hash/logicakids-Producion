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
// INTERFACES
// ==========================================
interface StaticSubLevel {
  id: number;
  name: string;
}

interface StaticChallenge {
  id: number;
  name: string;
  defaultTime: number;
  defaultQty: number;
}

interface StaticModule {
  seccion: number; // For Fase 1, it's 1. For Fase 2/3, it's the modulo index
  modulo_id?: number;
  operacion: string;
  name: string;
  levels?: StaticSubLevel[];
  challenges?: StaticChallenge[];
}

interface StaticPhase {
  id: number; // DB fase_id (Fase 1 = 1, Fase 2 = 2, Fase 3 = 3)
  name: string;
  description: string;
  modules: StaticModule[];
}

// ==========================================
// STATIC MAP OF PEDAGOGICAL FASES
// ==========================================
const STATIC_PHASES: StaticPhase[] = [
  {
    id: 1, // Fase 1 (Aritmética Básica)
    name: "Fase 1: Aritmética Básica",
    description: "Sumas, restas, multiplicaciones y divisiones. ¡Calentamiento mental!",
    modules: [
      { seccion: 1, operacion: "suma", name: "Suma Directa" },
      { seccion: 1, operacion: "resta", name: "Resta Directa" },
      { seccion: 1, operacion: "multiplicacion", name: "Multiplicación Directa" },
      { seccion: 1, operacion: "division", name: "División Directa" }
    ]
  },
  {
    id: 2, // Fase 2 (Desarrollo Numérico)
    name: "Fase 2: Desarrollo Numérico",
    description: "Cálculo mental rápido, sistema monetario real y problemas matemáticos iniciales.",
    modules: [
      {
        seccion: 1,
        modulo_id: 1,
        operacion: "suma",
        name: "Módulo 1: Gimnasio Numérico Mental",
        levels: [
          { id: 1, name: "Multiplicadores de Tamaño" },
          { id: 2, name: "Jerarquía Lógica" },
          { id: 3, name: "Traducción Lógica" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 25, defaultQty: 25 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 40, defaultQty: 25 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 50, defaultQty: 10 }
        ]
      },
      {
        seccion: 2,
        modulo_id: 2,
        operacion: "multiplicacion",
        name: "Módulo 2: Tablas en Acción",
        levels: [
          { id: 1, name: "Suma e Inversa" },
          { id: 2, name: "Multiplicación e Inversa" },
          { id: 3, name: "El Número Faltante" },
          { id: 4, name: "Gran Integración" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 25, defaultQty: 25 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 40, defaultQty: 25 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 50, defaultQty: 10 }
        ]
      },
      {
        seccion: 3,
        modulo_id: 3,
        operacion: "mixta",
        name: "Módulo 3: Tienda Matemática",
        levels: [
          { id: 1, name: "Reconozco el Dinero" },
          { id: 2, name: "Pago y Cambio" },
          { id: 3, name: "Carrito de Compras" },
          { id: 4, name: "Comprador Inteligente" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 25, defaultQty: 25 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 40, defaultQty: 25 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 50, defaultQty: 10 }
        ]
      },
      {
        seccion: 4,
        modulo_id: 4,
        operacion: "mixta",
        name: "Módulo 4: Constructor de Soluciones",
        levels: [
          { id: 1, name: "Dos Pasos Guiados" },
          { id: 2, name: "Encadenamiento" },
          { id: 3, name: "Error de Arrastre" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 25, defaultQty: 25 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 40, defaultQty: 25 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 50, defaultQty: 10 }
        ]
      }
    ]
  },
  {
    id: 3, // Fase 3 (Problemas de Texto)
    name: "Fase 3: Problemas de Texto",
    description: "Selección de datos, elección reflexiva de operación y resolución de problemas de texto complejos.",
    modules: [
      {
        seccion: 1,
        modulo_id: 1,
        operacion: "mixta",
        name: "Módulo 1: El Escáner de la Verdad",
        levels: [
          { id: 1, name: "El Lápiz Mágico" },
          { id: 2, name: "El Escudo Anti-Basura" },
          { id: 3, name: "El Laberinto Numérico" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }
        ]
      },
      {
        seccion: 2,
        modulo_id: 2,
        operacion: "mixta",
        name: "Módulo 2: La Máquina del Tiempo",
        levels: [
          { id: 1, name: "El Reloj hacia Adelante" },
          { id: 2, name: "El Reloj en Reversa" },
          { id: 3, name: "El Tiempo Multiplicado" },
          { id: 4, name: "El Laberinto del Tiempo" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }
        ]
      },
      {
        seccion: 3,
        modulo_id: 3,
        operacion: "mixta",
        name: "Módulo 3: El Ojo del Comerciante",
        levels: [
          { id: 1, name: "El Enigma de los Carritos" },
          { id: 2, name: "Cruce de Datos" },
          { id: 3, name: "El Código Oculto" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }
        ]
      },
      {
        seccion: 4,
        modulo_id: 4,
        operacion: "mixta",
        name: "Módulo 4: El Maestro del Empaque",
        levels: [
          { id: 1, name: "El Reparto Perfecto" },
          { id: 2, name: "Las Piezas Sobrantes" },
          { id: 3, name: "El Ciclo Infinito" }
        ],
        challenges: [
          { id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 },
          { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 },
          { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }
        ]
      }
    ]
  }
];

const DEFAULT_GLOBAL_CONFIG: PedagogyConfig = {
  practica_libre: {
    cantidad_requerida: 15,
    porcentaje_aprobacion: 80,
    usa_cronometro: false,
    tiempo_default_segundos: 15,
    tipo_feedback: 'simple',
  },
  desafios: {
    cantidad_requerida: 20,
    porcentaje_aprobacion: 90,
    usa_cronometro: true,
    tiempo_default_segundos_11: 25,
    tiempo_default_segundos_12: 40,
    tiempo_default_segundos_13: 50,
    tipo_feedback: 'simple',
  },
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
  isThermal?: boolean;
}> = ({ value, min, max, step = 1, onChange, disabled = false, accentColor, unit = '', isThermal = false }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const getThermalColor = () => {
    if (percentage < 25) return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'; // High cognitive load / low time
    if (percentage < 50) return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
    if (percentage < 75) return 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]';
    return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'; // Relaxed / high time
  };

  const activeColor = isThermal ? getThermalColor() : accentColor;

  return (
    <div className="relative w-full group pt-2 select-none">
      {/* Floating tooltip */}
      <div
        className="absolute -top-3 transform -translate-x-1/2 pointer-events-none transition-all duration-100 z-30"
        style={{ left: `${percentage}%` }}
      >
        <div className={`glass-panel border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-black text-sm px-2 py-0.5 rounded shadow-xl whitespace-nowrap ${isThermal ? 'transition-colors duration-300' : ''}`}>
          {value}{unit}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
        </div>
      </div>

      {/* Track background */}
      <div className="relative w-full h-2 bg-white/80 dark:bg-slate-800/80 rounded-full overflow-hidden">
        {/* Filled portion */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-150 ${disabled ? 'bg-slate-600' : activeColor}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 -ml-2 rounded-full border-2 border-white bg-white/80 dark:bg-slate-950 shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none z-20 transition-transform ${disabled ? 'scale-75 opacity-55' : 'group-hover:scale-110'}`}
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
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1); // Fase 1 by default (DB id = 1)
  const [selectedModule, setSelectedModule] = useState<StaticModule | null>(null); // null means Phase selected
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 1: true });

  // Sub-navigation inside Module for Fase 2/3
  const [selectedSubLevelId, setSelectedSubLevelId] = useState<number | null>(null);
  const [isSelectedChallenge, setIsSelectedChallenge] = useState<boolean>(false);

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
        const mergedGlobal: PedagogyConfig = {
          practica_libre: { ...DEFAULT_GLOBAL_CONFIG.practica_libre, ...(settingsData.practica_libre || {}) },
          desafios: { ...DEFAULT_GLOBAL_CONFIG.desafios, ...(settingsData.desafios || {}) }
        };
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
    setSelectedSubLevelId(null);
    setIsSelectedChallenge(false);
  };

  const selectModule = (phaseId: number, mod: StaticModule) => {
    setSelectedPhaseId(phaseId);
    setSelectedModule(mod);
    if (phaseId > 1 && mod.levels && mod.levels.length > 0) {
      setSelectedSubLevelId(mod.levels[0].id);
      setIsSelectedChallenge(false);
    } else {
      setSelectedSubLevelId(null);
      setIsSelectedChallenge(false);
    }
  };

  // Resolve custom records (active draft)
  const activePhase = STATIC_PHASES.find(p => p.id === selectedPhaseId) || STATIC_PHASES[0];

  // Search if a custom override exists for the active selected Phase & Module
  // 1. Phase Default Record (stored in DB as seccion = 0, operacion = 'mixta')
  const activePhaseDefaultRecord = draftModularConfigs.find(
    c => c.fase_id === selectedPhaseId && c.seccion === 0 && c.operacion === 'mixta' && c.activo !== false
  );

  // Mapped DB keys for selected sub-item
  const getSelectedSubItemKeys = () => {
    if (!selectedModule) return { seccion: 0, operacion: '' };
    if (selectedPhaseId === 1 || selectedSubLevelId === null) {
      return { seccion: selectedModule.seccion, operacion: selectedModule.operacion };
    }
    const modId = selectedModule.modulo_id || 1;
    let oper = selectedModule.operacion;
    if (isSelectedChallenge) {
      return { seccion: modId * 1000 + selectedSubLevelId, operacion: 'mixta' };
    } else {
      return { seccion: modId * 100 + selectedSubLevelId, operacion: oper };
    }
  };

  const { seccion: activeSeccion, operacion: activeOperacion } = getSelectedSubItemKeys();

  // 2. Module Specific Record
  const activeModuleRecord = selectedModule ? draftModularConfigs.find(
    c => c.fase_id === selectedPhaseId && 
         c.seccion === activeSeccion && 
         c.operacion === activeOperacion && 
         c.activo !== false
  ) : null;

  // Resolve current active parameters applying inheritance:
  // Module specific -> Phase default -> Platform Global
  const getInheritedQuestionsCount = (): number => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.cantidad_requerida;
    return isSelectedChallenge 
      ? draftGlobalConfig.desafios.cantidad_requerida
      : draftGlobalConfig.practica_libre.cantidad_requerida;
  };

  const getInheritedPassingScore = (): number => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.porcentaje_aprobacion;
    return isSelectedChallenge 
      ? draftGlobalConfig.desafios.porcentaje_aprobacion
      : draftGlobalConfig.practica_libre.porcentaje_aprobacion;
  };

  const getInheritedUseTimer = (): boolean => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.usa_cronometro;
    return isSelectedChallenge 
      ? draftGlobalConfig.desafios.usa_cronometro
      : draftGlobalConfig.practica_libre.usa_cronometro;
  };

  const getInheritedFeedbackType = (): string => {
    if (activePhaseDefaultRecord) return activePhaseDefaultRecord.tipo_feedback;
    return isSelectedChallenge 
      ? draftGlobalConfig.desafios.tipo_feedback
      : draftGlobalConfig.practica_libre.tipo_feedback;
  };

  const getInheritedTimerForLevel = (levelKey: 'easy' | 'easy_medium' | 'medium' | 'medium_hard' | 'hard'): number => {
    if (activePhaseDefaultRecord && activePhaseDefaultRecord.tiempo_default_segundos !== null) {
      return activePhaseDefaultRecord.tiempo_default_segundos;
    }
    if (isSelectedChallenge) {
      if (selectedSubLevelId === 11) return draftGlobalConfig.desafios.tiempo_default_segundos_11;
      if (selectedSubLevelId === 12) return draftGlobalConfig.desafios.tiempo_default_segundos_12;
      if (selectedSubLevelId === 13) return draftGlobalConfig.desafios.tiempo_default_segundos_13;
      return 25;
    }
    return draftGlobalConfig.practica_libre.tiempo_default_segundos;
  };

  // Handle Updates
  const updateGlobalField = (section: 'practica_libre' | 'desafios', field: string, val: any) => {
    setDraftGlobalConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: val
      }
    }));
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
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: 0,
          operacion: 'mixta',
          cantidad_requerida: field === 'cantidad_requerida' ? val : draftGlobalConfig.practica_libre.cantidad_requerida,
          porcentaje_aprobacion: field === 'porcentaje_aprobacion' ? val : draftGlobalConfig.practica_libre.porcentaje_aprobacion,
          orden_desbloqueo: 0,
          tipo_feedback: field === 'tipo_feedback' ? val : draftGlobalConfig.practica_libre.tipo_feedback,
          usa_cronometro: field === 'usa_cronometro' ? val : draftGlobalConfig.practica_libre.usa_cronometro,
          tiempo_default_segundos: field === 'tiempo_default_segundos' ? val : draftGlobalConfig.practica_libre.tiempo_default_segundos,
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
             c.seccion === activeSeccion && 
             c.operacion === activeOperacion
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [field]: val, activo: true };
        return updated;
      } else {
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: activeSeccion,
          operacion: activeOperacion,
          cantidad_requerida: field === 'cantidad_requerida' ? val : getInheritedQuestionsCount(),
          porcentaje_aprobacion: field === 'porcentaje_aprobacion' ? val : getInheritedPassingScore(),
          orden_desbloqueo: isSelectedChallenge ? (selectedSubLevelId || 11) : (selectedSubLevelId || 1),
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
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: 0,
          operacion: 'mixta',
          cantidad_requerida: draftGlobalConfig.practica_libre.cantidad_requerida,
          porcentaje_aprobacion: draftGlobalConfig.practica_libre.porcentaje_aprobacion,
          orden_desbloqueo: 0,
          tipo_feedback: draftGlobalConfig.practica_libre.tipo_feedback,
          usa_cronometro: draftGlobalConfig.practica_libre.usa_cronometro,
          tiempo_default_segundos: draftGlobalConfig.practica_libre.tiempo_default_segundos,
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
             c.seccion === activeSeccion && 
             c.operacion === activeOperacion
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], activo: enable };
        return updated;
      } else if (enable) {
        // Fallback for default values if challenge is selected
        let defaultTime = getInheritedTimerForLevel('medium');
        let defaultQty = getInheritedQuestionsCount();
        if (selectedPhaseId > 1 && isSelectedChallenge && selectedSubLevelId) {
          const chDef = selectedModule.challenges?.find(c => c.id === selectedSubLevelId);
          if (chDef) {
            defaultTime = chDef.defaultTime;
            defaultQty = chDef.defaultQty;
          }
        }
        
        const newRecord: ConfiguracionProgreso = {
          fase_id: selectedPhaseId,
          seccion: activeSeccion,
          operacion: activeOperacion,
          cantidad_requerida: defaultQty,
          porcentaje_aprobacion: isSelectedChallenge ? 90 : getInheritedPassingScore(),
          orden_desbloqueo: isSelectedChallenge ? (selectedSubLevelId || 11) : (selectedSubLevelId || 1),
          tipo_feedback: isSelectedChallenge ? 'simple' : getInheritedFeedbackType(),
          usa_cronometro: isSelectedChallenge ? true : getInheritedUseTimer(),
          tiempo_default_segundos: defaultTime,
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

  // Check if a specific phase or module node has pending draft changes
  const isPhaseModified = (phaseId: number): boolean => {
    const originalPhaseRecord = dbModularConfigs.find(c => c.fase_id === phaseId && c.seccion === 0 && c.operacion === 'mixta');
    const draftPhaseRecord = draftModularConfigs.find(c => c.fase_id === phaseId && c.seccion === 0 && c.operacion === 'mixta');
    if (JSON.stringify(originalPhaseRecord) !== JSON.stringify(draftPhaseRecord)) return true;

    const phaseModules = STATIC_PHASES.find(p => p.id === phaseId)?.modules || [];
    for (const mod of phaseModules) {
      if (phaseId === 1) {
        if (isModuleModified(phaseId, mod.seccion, mod.operacion)) return true;
      } else {
        const modId = mod.modulo_id || 1;
        const levelIds = mod.levels?.map(l => l.id) || [];
        const challengeIds = mod.challenges?.map(c => c.id) || [];
        for (const lid of levelIds) {
          if (isModuleModified(phaseId, modId * 100 + lid, mod.operacion)) return true;
        }
        for (const cid of challengeIds) {
          if (isModuleModified(phaseId, modId * 1000 + cid, 'mixta')) return true;
        }
      }
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
      for (const draft of draftModularConfigs) {
        const original = dbModularConfigs.find(
          c => c.fase_id === draft.fase_id && 
               c.seccion === draft.seccion && 
               c.operacion === draft.operacion
        );

        if (!original) {
          await createModularConfig(draft);
        } else if (JSON.stringify(original) !== JSON.stringify(draft)) {
          if (original.id) {
            await saveModularConfig(original.id, draft);
          }
        }
      }

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
          <p className="text-slate-500 dark:text-slate-400 font-bold text-base">Cargando base de datos pedagógica...</p>
        </div>
      </div>
    );
  }

  const changesExist = hasChanges();

  return (
    <motion.div variants={itemVariants} className="w-full flex flex-col gap-6 lg:gap-10 select-none">
      
      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 lg:p-10 rounded-[2.2rem] lg:rounded-[3rem] shadow-2xl">
        <div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white flex items-center gap-3 lg:gap-5">
            <div className="p-2.5 bg-blue-500/20 rounded-2xl border border-blue-500/30">
              <Cpu className="text-blue-400" size={24} />
            </div>
            Gestión Pedagógica Avanzada
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm lg:text-base xl:text-lg mt-2 lg:mt-3 leading-relaxed">Configuración jerárquica con sistema de herencia para las fases del Viaje Matemático.</p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || !changesExist}
          className={`px-6 py-3.5 lg:px-8 lg:py-4 lg:text-lg rounded-2xl flex items-center gap-2 lg:gap-3 font-black shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 ${
            saveStatus === 'success'
              ? 'bg-green-600 hover:bg-green-500'
              : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
          } text-slate-900 dark:text-white`}
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
          <span className="text-amber-300 text-sm font-black">
            Tienes modificaciones pendientes sin sincronizar. Presiona "Guardar Cambios" para aplicar a la base de datos.
          </span>
        </motion.div>
      )}

      {/* MAIN SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-start">
        
        {/* LEFT COLUMN: Hierarchical Accordion Tree */}
        <div className="lg:col-span-1 bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-5 lg:p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-4 lg:gap-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm lg:text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Viaje del Alumno</h3>
            <span className="text-[10px] lg:text-xs bg-white/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 px-2 py-0.5 lg:px-3 lg:py-1 rounded-full font-bold">{STATIC_PHASES.length} Fases</span>
          </div>

          <div className="flex flex-col gap-2.5 lg:gap-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* PLATFORM GLOBAL CONFIG NODE */}
            <button
              onClick={() => { setSelectedPhaseId(0); setSelectedModule(null); }}
              className={`w-full flex items-center gap-3 lg:gap-4 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl border transition-all text-left ${
                selectedPhaseId === 0 
                  ? 'bg-blue-600/20 text-slate-900 dark:text-white border-blue-500/40 shadow-inner' 
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10'
              }`}
            >
              <Settings size={18} className={selectedPhaseId === 0 ? "text-blue-400 animate-spin" : "text-slate-500 dark:text-slate-400"} />
              <div className="flex-1">
                <span className="text-sm lg:text-base font-black leading-tight">Límites Globales (Plataforma)</span>
                <p className="text-[9px] lg:text-[11px] text-slate-500 mt-1 lg:mt-1.5 font-bold leading-snug">Valores por defecto ante fallbacks</p>
              </div>
            </button>

            <div className="w-full h-px bg-slate-100 dark:bg-white/10 my-1" />

            {/* FASES TREE NODES */}
            {STATIC_PHASES.map((phase) => {
              const isExpanded = expandedPhases[phase.id];
              const isSelected = selectedPhaseId === phase.id && selectedModule === null;
              const hasDraftChanges = isPhaseModified(phase.id);

              return (
                <div key={phase.id} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/20 overflow-hidden">
                  
                  {/* Phase Row */}
                  <div 
                    className={`flex items-center justify-between p-3 lg:p-4 cursor-pointer transition-all hover:bg-white dark:bg-white/5 ${
                      isSelected ? 'bg-blue-500/10 border-b border-slate-200 dark:border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 lg:gap-4 flex-1" onClick={() => selectPhase(phase.id)}>
                      <Layers size={18} className={isSelected ? "text-blue-400" : "text-slate-500 dark:text-slate-400"} />
                      <span className={`text-sm lg:text-base font-black transition-colors ${
                        isSelected ? 'text-blue-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {phase.name.split(':')[0]}
                      </span>
                      {hasDraftChanges && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <button 
                      onClick={() => togglePhaseExpand(phase.id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all"
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
                        className="bg-black/20 border-t border-slate-200 dark:border-white/5 pl-5 py-2 pr-2 flex flex-col gap-1.5"
                      >
                        {phase.modules.map((mod, mIdx) => {
                          const isModSelected = selectedPhaseId === phase.id && 
                                                selectedModule?.name === mod.name;
                          
                          // Check if it has override record in draft
                          const checkModuleHasOverride = () => {
                            if (phase.id === 1) {
                              return draftModularConfigs.some(
                                c => c.fase_id === phase.id && 
                                     c.seccion === mod.seccion && 
                                     c.operacion === mod.operacion && 
                                     c.activo !== false
                              );
                            }
                            const modId = mod.modulo_id || 1;
                            return draftModularConfigs.some(
                              c => c.fase_id === phase.id && 
                                   (Math.floor(c.seccion / 100) === modId || Math.floor(c.seccion / 1000) === modId) &&
                                   c.activo !== false
                            );
                          };
                          const hasOverride = checkModuleHasOverride();

                          const checkModuleIsModified = () => {
                            if (phase.id === 1) {
                              return isModuleModified(phase.id, mod.seccion, mod.operacion);
                            }
                            const modId = mod.modulo_id || 1;
                            const levelIds = mod.levels?.map(l => l.id) || [];
                            const challengeIds = mod.challenges?.map(c => c.id) || [];
                            for (const lid of levelIds) {
                              if (isModuleModified(phase.id, modId * 100 + lid, mod.operacion)) return true;
                            }
                            for (const cid of challengeIds) {
                              if (isModuleModified(phase.id, modId * 1000 + cid, 'mixta')) return true;
                            }
                            return false;
                          };
                          const isModModified = checkModuleIsModified();

                          return (
                            <button
                              key={mIdx}
                              onClick={() => selectModule(phase.id, mod)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between ${
                                isModSelected 
                                  ? 'bg-blue-500/20 text-slate-900 dark:text-white border border-blue-500/30 font-black' 
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200 hover:bg-white dark:bg-white/5'
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
                className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-7"
              >
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Límites Globales (Fases estructuradas 2 a 8)
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">Configuración de Fallbacks Generales</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Estos valores actúan como fallback para las Fases 2 a 8 si no existe un override específico en la fase, módulo o nivel.</p>
                </div>

                <div className="flex flex-col gap-8">
                  {/* SECCIÓN 1: PRÁCTICA LIBRE (Niveles 1-10) */}
                  <div className="bg-white/80 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-5">
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Práctica Libre (Niveles 1 a 10)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Vol & Pct */}
                      <div className="flex flex-col gap-5">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Volumen de Ejercicios</label>
                            <span className="text-base font-black text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20 text-center">
                              {draftGlobalConfig.practica_libre.cantidad_requerida}
                            </span>
                          </div>
                          <SliderWithTooltip
                            value={draftGlobalConfig.practica_libre.cantidad_requerida}
                            min={5}
                            max={60}
                            step={1}
                            onChange={(val) => updateGlobalField('practica_libre', 'cantidad_requerida', val)}
                            accentColor="bg-blue-500"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Porcentaje Mínimo Aprobación</label>
                            <span className="text-base font-black text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-lg border border-green-500/20 text-center">
                              {draftGlobalConfig.practica_libre.porcentaje_aprobacion}%
                            </span>
                          </div>
                          <SliderWithTooltip
                            value={draftGlobalConfig.practica_libre.porcentaje_aprobacion}
                            min={50}
                            max={100}
                            step={5}
                            onChange={(val) => updateGlobalField('practica_libre', 'porcentaje_aprobacion', val)}
                            accentColor="bg-green-500"
                            unit="%"
                          />
                        </div>
                      </div>

                      {/* Right: Cronometro, Timer, Feedback */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Uso de Cronómetro</label>
                            <p className="text-[10px] text-slate-500">¿Tiene límite de tiempo por pregunta?</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => updateGlobalField('practica_libre', 'usa_cronometro', !draftGlobalConfig.practica_libre.usa_cronometro)} 
                            className="transition-all hover:scale-105"
                          >
                            <div className={`ios-switch ${draftGlobalConfig.practica_libre.usa_cronometro ? 'ios-switch-active' : ''}`}>
                              <div className="ios-switch-knob" />
                            </div>
                          </button>
                        </div>

                        {draftGlobalConfig.practica_libre.usa_cronometro && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Tiempo Límite por Pregunta</label>
                              <span className="text-sm font-black text-blue-400">{draftGlobalConfig.practica_libre.tiempo_default_segundos}s</span>
                            </div>
                            <SliderWithTooltip
                              value={draftGlobalConfig.practica_libre.tiempo_default_segundos}
                              min={3}
                              max={60}
                              onChange={(val) => updateGlobalField('practica_libre', 'tiempo_default_segundos', val)}
                              accentColor="bg-blue-500"
                              unit="s"
                              isThermal
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold block">Feedback Pedagógico</label>
                          <div className="flex gap-2">
                            {['simple', 'detallado'].map((ft) => (
                              <button
                                type="button"
                                key={ft}
                                onClick={() => updateGlobalField('practica_libre', 'tipo_feedback', ft)}
                                className={`flex-1 py-2 rounded-xl text-sm font-black border transition-all ${
                                  draftGlobalConfig.practica_libre.tipo_feedback === ft
                                    ? 'bg-blue-600 border-blue-500 text-slate-900 dark:text-white shadow-md'
                                    : 'glass-panel border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {ft === 'simple' ? 'Simple' : 'Detallado'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: ZONA DE DESAFÍOS (Niveles 11-13) */}
                  <div className="bg-white/80 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-5">
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      Zona de Desafíos (Niveles 11 a 13)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Vol, Pct, Feedback, Cronometro toggle */}
                      <div className="flex flex-col gap-5">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Volumen de Ejercicios</label>
                            <span className="text-base font-black text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20 text-center">
                              {draftGlobalConfig.desafios.cantidad_requerida}
                            </span>
                          </div>
                          <SliderWithTooltip
                            value={draftGlobalConfig.desafios.cantidad_requerida}
                            min={5}
                            max={60}
                            step={1}
                            onChange={(val) => updateGlobalField('desafios', 'cantidad_requerida', val)}
                            accentColor="bg-purple-500"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Porcentaje Mínimo Aprobación</label>
                            <span className="text-base font-black text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-lg border border-green-500/20 text-center">
                              {draftGlobalConfig.desafios.porcentaje_aprobacion}%
                            </span>
                          </div>
                          <SliderWithTooltip
                            value={draftGlobalConfig.desafios.porcentaje_aprobacion}
                            min={50}
                            max={100}
                            step={5}
                            onChange={(val) => updateGlobalField('desafios', 'porcentaje_aprobacion', val)}
                            accentColor="bg-green-500"
                            unit="%"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Uso de Cronómetro</label>
                            <p className="text-[10px] text-slate-500">¿Tienen límite de tiempo los desafíos?</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => updateGlobalField('desafios', 'usa_cronometro', !draftGlobalConfig.desafios.usa_cronometro)} 
                            className="transition-all hover:scale-105"
                          >
                            <div className={`ios-switch ${draftGlobalConfig.desafios.usa_cronometro ? 'ios-switch-active' : ''}`}>
                              <div className="ios-switch-knob" />
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Right: Individual Timers for Desafíos */}
                      <div className="flex flex-col gap-4">
                        <div className="space-y-3" style={{ opacity: draftGlobalConfig.desafios.usa_cronometro ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tiempos Límite por Desafío</span>
                          
                          {/* Desafío 1 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Desafío 1 (Estándar)</span>
                              <span className="text-sm font-black text-purple-400">{draftGlobalConfig.desafios.tiempo_default_segundos_11}s</span>
                            </div>
                            <SliderWithTooltip
                              value={draftGlobalConfig.desafios.tiempo_default_segundos_11}
                              min={10}
                              max={200}
                              disabled={!draftGlobalConfig.desafios.usa_cronometro}
                              onChange={(val) => updateGlobalField('desafios', 'tiempo_default_segundos_11', val)}
                              accentColor="bg-purple-500"
                              unit="s"
                              isThermal
                            />
                          </div>

                          {/* Desafío 2 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Desafío 2 (Avanzado)</span>
                              <span className="text-sm font-black text-purple-400">{draftGlobalConfig.desafios.tiempo_default_segundos_12}s</span>
                            </div>
                            <SliderWithTooltip
                              value={draftGlobalConfig.desafios.tiempo_default_segundos_12}
                              min={10}
                              max={200}
                              disabled={!draftGlobalConfig.desafios.usa_cronometro}
                              onChange={(val) => updateGlobalField('desafios', 'tiempo_default_segundos_12', val)}
                              accentColor="bg-purple-500"
                              unit="s"
                              isThermal
                            />
                          </div>

                          {/* Desafío Final */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Desafío Final (Maestría)</span>
                              <span className="text-sm font-black text-purple-400">{draftGlobalConfig.desafios.tiempo_default_segundos_13}s</span>
                            </div>
                            <SliderWithTooltip
                              value={draftGlobalConfig.desafios.tiempo_default_segundos_13}
                              min={10}
                              max={200}
                              disabled={!draftGlobalConfig.desafios.usa_cronometro}
                              onChange={(val) => updateGlobalField('desafios', 'tiempo_default_segundos_13', val)}
                              accentColor="bg-purple-500"
                              unit="s"
                              isThermal
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold block">Feedback Pedagógico</label>
                          <div className="flex gap-2">
                            {['simple', 'detallado'].map((ft) => (
                              <button
                                type="button"
                                key={ft}
                                onClick={() => updateGlobalField('desafios', 'tipo_feedback', ft)}
                                className={`flex-1 py-2 rounded-xl text-sm font-black border transition-all ${
                                  draftGlobalConfig.desafios.tipo_feedback === ft
                                    ? 'bg-purple-600 border-purple-500 text-slate-900 dark:text-white shadow-md'
                                    : 'glass-panel border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {ft === 'simple' ? 'Simple' : 'Detallado'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
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
                className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      Parámetros por Defecto de Fase
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">{activePhase.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{activePhase.description}</p>
                  </div>

                  {/* Override platform defaults toggle */}
                  <div className="flex flex-col items-end gap-1.5 glass-panel p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sobrescribir Global</label>
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

                <div className="relative pt-4 border-t border-slate-200 dark:border-white/5 min-h-[300px]">
                  
                  {/* Glass Esmerilado blur overlay if phase does NOT override global */}
                  <AnimatePresence>
                    {!activePhaseDefaultRecord && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md z-20 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-slate-200 dark:border-white/5 shadow-inner"
                      >
                        <ShieldAlert className="text-blue-400 mb-2" size={28} />
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Heredando de Límites Globales</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mt-1">
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
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Volumen de Ejercicios de Fase</label>
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

                      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Porcentaje de Aprobación</label>
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
                    <div className="bg-white/80 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 p-5 rounded-3xl flex flex-col gap-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock size={14} className="text-amber-400" /> Temporizador de Fase Único
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Puedes definir un temporizador único en segundos para todos los niveles de esta fase. Deja en 0 o desactiva para heredar los niveles individuales de dificultad globales.
                      </p>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Habilitar Cronómetro de Fase</label>
                            <p className="text-[9px] text-slate-500">Uso local para esta fase.</p>
                          </div>
                          <button 
                            onClick={() => handleUpdatePhaseDefault('usa_cronometro', !(activePhaseDefaultRecord?.usa_cronometro ?? draftGlobalConfig.useTimer))}
                            disabled={!activePhaseDefaultRecord}
                            className="transition-all hover:scale-105 disabled:opacity-30"
                          >
                            <div className={`ios-switch ${activePhaseDefaultRecord?.usa_cronometro ? 'ios-switch-active' : ''}`}>
                              <div className="ios-switch-knob" />
                            </div>
                          </button>
                        </div>

                        {activePhaseDefaultRecord?.usa_cronometro && (
                          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Segundos Límite del Juego</label>
                              <span className="text-base font-black text-amber-400">
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
                              isThermal
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
                key={`module-${selectedPhaseId}-${selectedModule.name}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      Configuración de Módulo
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                      {selectedModule.name}
                      {selectedPhaseId > 1 && selectedSubLevelId && (
                        <span className="text-blue-400 ml-2 text-base font-black">
                          ({isSelectedChallenge ? 'Desafío' : 'Nivel'} {selectedSubLevelId})
                        </span>
                      )}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configuración personalizada aplicable a esta disciplina en la Fase {selectedPhaseId}.</p>
                  </div>

                  {/* Override parent default toggle */}
                  <div className="flex flex-col items-end gap-1.5 glass-panel p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                    <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sobrescribir Padre</label>
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

                <div className="relative pt-4 border-t border-slate-200 dark:border-white/5 min-h-[300px]">
                  
                  {/* Glass Esmerilado blur overlay if module does NOT override phase */}
                  <AnimatePresence>
                    {!activeModuleRecord && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md z-20 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-slate-200 dark:border-white/5 shadow-inner"
                      >
                        <ShieldAlert className="text-amber-400 mb-2" size={28} />
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Heredando de la Fase {selectedPhaseId}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                          Este nivel/desafío está usando los valores por defecto de la Fase superior. Activa el toggle <strong>"Sobrescribir Padre"</strong> superior para definir límites exclusivos.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sub-item Selector for Fase 2 & 3 */}
                  {selectedPhaseId > 1 && (
                    <div className="flex flex-col gap-2 glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/5 mb-6">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Selecciona Nivel o Desafío a Configurar</label>
                      <div className="flex flex-wrap gap-2">
                        {/* Levels */}
                        {selectedModule.levels?.map((lvl) => (
                          <button
                            key={`lvl-${lvl.id}`}
                            onClick={() => { setSelectedSubLevelId(lvl.id); setIsSelectedChallenge(false); }}
                            className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                              !isSelectedChallenge && selectedSubLevelId === lvl.id
                                ? 'bg-blue-600 border-blue-500 text-slate-900 dark:text-white font-black'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                            }`}
                          >
                            Nivel {lvl.id}: {lvl.name}
                          </button>
                        ))}
                        {/* Challenges */}
                        {selectedModule.challenges?.map((ch) => (
                          <button
                            key={`ch-${ch.id}`}
                            onClick={() => { setSelectedSubLevelId(ch.id); setIsSelectedChallenge(true); }}
                            className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                              isSelectedChallenge && selectedSubLevelId === ch.id
                                ? 'bg-amber-600 border-amber-500 text-slate-900 dark:text-white font-black'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                            }`}
                          >
                            {ch.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Controls */}
                    <div className="flex flex-col gap-6">
                      {/* Questions Count */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Cantidad de Preguntas</label>
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
                      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Porcentaje de Aprobación</label>
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
                    <div className="flex flex-col gap-5 bg-white/80 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 p-5 rounded-3xl">
                      {/* Feedback choice */}
                      {!isSelectedChallenge && (
                        <div className="space-y-3">
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                            <HelpCircle size={14} className="text-purple-400" /> Tipo de Feedback Pedagógico
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleUpdateModuleField('tipo_feedback', 'simple')}
                              disabled={!activeModuleRecord}
                              className={`px-3 py-2.5 rounded-xl border text-[10px] font-black transition-all ${
                                (activeModuleRecord?.tipo_feedback ?? getInheritedFeedbackType()) === 'simple'
                                  ? 'bg-purple-500/20 border-purple-500/40 text-slate-900 dark:text-white'
                                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              Simple (✔/✘)
                            </button>
                            <button
                              onClick={() => handleUpdateModuleField('tipo_feedback', 'detallado')}
                              disabled={!activeModuleRecord}
                              className={`px-3 py-2.5 rounded-xl border text-[10px] font-black transition-all ${
                                (activeModuleRecord?.tipo_feedback ?? getInheritedFeedbackType()) === 'detallado'
                                  ? 'bg-purple-500/20 border-purple-500/40 text-slate-900 dark:text-white'
                                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              Tutoría IA / Espejo
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Timer settings */}
                      <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Usar Cronómetro</label>
                            <p className="text-[9px] text-slate-500">Cronómetro específico local.</p>
                          </div>
                          <button 
                            onClick={() => handleUpdateModuleField('usa_cronometro', !(activeModuleRecord?.usa_cronometro ?? getInheritedUseTimer()))}
                            disabled={!activeModuleRecord}
                            className="transition-all hover:scale-105 disabled:opacity-30"
                          >
                            <div className={`ios-switch ${(activeModuleRecord?.usa_cronometro ?? getInheritedUseTimer()) ? 'ios-switch-active' : ''}`}>
                              <div className="ios-switch-knob" />
                            </div>
                          </button>
                        </div>

                        {(activeModuleRecord?.usa_cronometro ?? getInheritedUseTimer()) && (
                          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Tiempo Límite en Segundos</label>
                              <span className="text-base font-black text-amber-400">
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
                              isThermal
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
