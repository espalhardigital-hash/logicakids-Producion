import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Settings, Clock, Layers, ToggleLeft, ToggleRight, 
  CheckCircle, AlertCircle, Loader2, Target, HelpCircle, 
  ChevronRight, ChevronDown, ChevronUp, ShieldAlert, Cpu, Minimize2, Maximize2
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
const fase1Levels = [
  { id: 1, name: "Nivel 1: Fácil" },
  { id: 2, name: "Nivel 2: Medio-Fácil" },
  { id: 3, name: "Nivel 3: Medio" },
  { id: 4, name: "Nivel 4: Medio-Difícil" },
  { id: 5, name: "Nivel 5: Difícil" },
];

const fase1LevelsConTablas = [
  ...fase1Levels,
  { id: 6, name: "Nivel 6: Tablas Aleatorias" }
];

const STATIC_PHASES: StaticPhase[] = [
  {
    id: 1, // Fase 1 (Aritmética Básica)
    name: "Fase 1: Aritmética Básica",
    description: "Sumas, restas, multiplicaciones y divisiones. ¡Calentamiento mental!",
    modules: [
      { seccion: 1, modulo_id: 1, operacion: "suma", name: "Suma Directa", levels: fase1Levels },
      { seccion: 1, modulo_id: 2, operacion: "resta", name: "Resta Directa", levels: fase1Levels },
      { seccion: 1, modulo_id: 3, operacion: "multiplicacion", name: "Multiplicación Directa", levels: fase1LevelsConTablas },
      { seccion: 1, modulo_id: 4, operacion: "division", name: "División Directa", levels: fase1Levels },
      { seccion: 1, modulo_id: 5, operacion: "mixta", name: "Desafío Mixto", levels: fase1Levels }
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
  },
  {
    id: 4,
    name: "Fase 4: Fracciones y Proporciones",
    description: "Comprensión visual y numérica de fracciones, áreas y asimetrías.",
    modules: [
      {
        seccion: 1, modulo_id: 1, operacion: "mixta", name: "Módulo 1: La Fracción Visual",
        levels: [{ id: 1, name: "Lectura de Fracciones" }, { id: 2, name: "Fracciones Equivalentes" }, { id: 3, name: "Áreas y Asimetrías" }],
        challenges: [{ id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 }, { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 }, { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }]
      },
      {
        seccion: 2, modulo_id: 2, operacion: "mixta", name: "Módulo 2: Fracción de Cantidad",
        levels: [{ id: 1, name: "Porciones de un Grupo" }, { id: 2, name: "El Motor de Dos Pasos" }, { id: 3, name: "Lógica del Complemento" }],
        challenges: [{ id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 }, { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 }, { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }]
      },
      {
        seccion: 3, modulo_id: 3, operacion: "mixta", name: "Módulo 3: Porcentajes Rápidos",
        levels: [{ id: 1, name: "Porcentajes Intuitivos" }, { id: 2, name: "Gráficos Circulares" }, { id: 3, name: "Gráficos de Barras" }],
        challenges: [{ id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 }, { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 }, { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }]
      },
      {
        seccion: 4, modulo_id: 4, operacion: "mixta", name: "Módulo 4: Razón y Mezclas",
        levels: [{ id: 1, name: "Razones y Proporciones" }, { id: 2, name: "Reparto de Volúmenes" }, { id: 3, name: "Mezclas Complejas" }],
        challenges: [{ id: 11, name: "Desafío 1 (Estándar)", defaultTime: 60, defaultQty: 20 }, { id: 12, name: "Desafío 2 (Avanzado)", defaultTime: 90, defaultQty: 20 }, { id: 13, name: "Desafío Final (Maestría)", defaultTime: 120, defaultQty: 10 }]
      }
    ]
  },
  {
    id: 5,
    name: "Fase 5: Geometría y Espacio",
    description: "Perímetro, área, volumen y razonamiento espacial lógico.",
    modules: [
      {
        seccion: 1, modulo_id: 1, operacion: "mixta", name: "Módulo 1: Perímetros y Áreas",
        levels: [{ id: 1, name: "Figuras Planas" }, { id: 2, name: "Áreas Compuestas" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      },
      {
        seccion: 2, modulo_id: 2, operacion: "mixta", name: "Módulo 2: Volúmenes y 3D",
        levels: [{ id: 1, name: "Identificación de Cuerpos" }, { id: 2, name: "Cálculo de Volumen" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      }
    ]
  },
  {
    id: 6,
    name: "Fase 6: Álgebra Básica",
    description: "Introducción a variables, patrones y ecuaciones simples.",
    modules: [
      {
        seccion: 1, modulo_id: 1, operacion: "mixta", name: "Módulo 1: Patrones y Secuencias",
        levels: [{ id: 1, name: "Secuencias Numéricas" }, { id: 2, name: "Patrones Geométricos" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      },
      {
        seccion: 2, modulo_id: 2, operacion: "mixta", name: "Módulo 2: Ecuaciones de 1er Grado",
        levels: [{ id: 1, name: "Concepto de Variable" }, { id: 2, name: "Despeje Simple" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      }
    ]
  },
  {
    id: 7,
    name: "Fase 7: Coordenadas y Tiempo",
    description: "Lectura de mapas, coordenadas cartesianas y husos horarios.",
    modules: [
      {
        seccion: 1, modulo_id: 1, operacion: "mixta", name: "Módulo 1: Plano Cartesiano",
        levels: [{ id: 1, name: "Lectura de Coordenadas" }, { id: 2, name: "Desplazamientos" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      },
      {
        seccion: 2, modulo_id: 2, operacion: "mixta", name: "Módulo 2: Medición del Tiempo",
        levels: [{ id: 1, name: "Conversiones de Tiempo" }, { id: 2, name: "Husos Horarios" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      }
    ]
  },
  {
    id: 8,
    name: "Fase 8: Probabilidad y Lógica",
    description: "Análisis combinatorio, probabilidad y problemas de lógica pura.",
    modules: [
      {
        seccion: 1, modulo_id: 1, operacion: "mixta", name: "Módulo 1: Combinatoria",
        levels: [{ id: 1, name: "Arreglos Simples" }, { id: 2, name: "Permutaciones" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      },
      {
        seccion: 2, modulo_id: 2, operacion: "mixta", name: "Módulo 2: Probabilidad Básica",
        levels: [{ id: 1, name: "Sucesos Posibles" }, { id: 2, name: "Eventos Compuestos" }],
        challenges: [{ id: 11, name: "Desafío Estándar", defaultTime: 60, defaultQty: 20 }, { id: 13, name: "Desafío Final", defaultTime: 120, defaultQty: 10 }]
      }
    ]
  },
  {
    id: 9,
    name: "Fase 9: Simulador Pedro II",
    description: "Banco de preguntas y simulacros estilo Colegio Pedro II.",
    modules: [
      {
        seccion: 1, modulo_id: 1, operacion: "mixta", name: "Módulo 1: Simulacros Oficiales",
        levels: [{ id: 1, name: "Exámenes Anteriores" }, { id: 2, name: "Prueba de Velocidad" }],
        challenges: [{ id: 11, name: "Simulacro Completo", defaultTime: 3600, defaultQty: 50 }, { id: 13, name: "Simulacro Maestro", defaultTime: 2400, defaultQty: 50 }]
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
    <div className="flex items-center gap-4 w-full">
      <div className="relative flex-1 group pt-2 select-none">
        {/* Floating tooltip */}
        <div
          className="absolute -top-3 transform -translate-x-1/2 pointer-events-none transition-all duration-100 z-10"
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

      {/* Precision Number Input with +/- buttons */}
      <div className="relative shrink-0 flex items-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden transition-all focus-within:border-blue-500/50">
        <button 
          onClick={() => {
            let newVal = value - (step || 1);
            if (newVal < min) newVal = min;
            onChange(newVal);
          }}
          disabled={disabled || value <= min}
          className="w-8 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          -
        </button>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            if (e.target.value === '') return;
            let val = parseInt(e.target.value);
            if (isNaN(val)) return;
            if (val > max) val = max;
            onChange(val);
          }}
          onBlur={(e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < min) {
               onChange(min);
            }
          }}
          disabled={disabled}
          className="w-14 bg-transparent text-center text-slate-900 dark:text-white text-sm font-black focus:outline-none disabled:opacity-50 appearance-none"
          style={{ MozAppearance: 'textfield' }}
        />
        <button 
          onClick={() => {
            let newVal = value + (step || 1);
            if (newVal > max) newVal = max;
            onChange(newVal);
          }}
          disabled={disabled || value >= max}
          className="w-8 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          +
        </button>
      </div>
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

  // Collapse/Expand all config sections (MEJORA-5)
  const [sectionsCollapsed, setSectionsCollapsed] = useState(false);

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
    if (mod.levels && mod.levels.length > 0) {
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
    if (selectedSubLevelId === null) {
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
        if (isSelectedChallenge && selectedSubLevelId) {
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

        {/* Collapse/Expand All (MEJORA-5) */}
        <button
          onClick={() => setSectionsCollapsed(!sectionsCollapsed)}
          className="px-4 py-3.5 lg:px-5 lg:py-4 rounded-2xl flex items-center gap-2 font-bold text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
          title={sectionsCollapsed ? 'Expandir todas las secciones' : 'Colapsar todas las secciones'}
        >
          {sectionsCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          {sectionsCollapsed ? 'Expandir todo' : 'Colapsar todo'}
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

      {/* ========================================================= */}
      {/* NEW TABS LAYOUT: Level 1 (Global vs Fases) */}
      {/* ========================================================= */}
      <div className="flex bg-white/50 dark:bg-slate-900/40 p-2 rounded-3xl mb-8 shadow-sm border border-slate-200 dark:border-white/10">
        <button 
          onClick={() => { setSelectedPhaseId(0); setSelectedModule(null); }}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm lg:text-base transition-all ${
            selectedPhaseId === 0 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
          }`}
        >
          <Settings size={20} className={selectedPhaseId === 0 ? "animate-[spin_3s_linear_infinite]" : ""} /> 
          Plataforma Global
        </button>
        <button 
          onClick={() => { setSelectedPhaseId(1); setSelectedModule(null); }}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm lg:text-base transition-all ${
            selectedPhaseId > 0 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
          }`}
        >
          <Layers size={20} /> 
          Configuración por Fases
        </button>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* ========================================================= */}
        {/* LEVEL 2 & 3: TABS FOR PHASES AND MODULES */}
        {/* ========================================================= */}
        {selectedPhaseId > 0 && (
          <div className="flex flex-col gap-5 bg-white/50 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-5 rounded-[2.5rem] shadow-xl">
            
            {/* Level 2: Phases (Horizontal Scroll) */}
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 px-1">
              {STATIC_PHASES.map(phase => {
                const hasDraftChanges = isPhaseModified(phase.id);
                return (
                  <button 
                    key={phase.id}
                    onClick={() => { setSelectedPhaseId(phase.id); setSelectedModule(null); }}
                    className={`shrink-0 px-6 py-3 rounded-full font-black text-sm border transition-all flex items-center gap-2 ${
                      selectedPhaseId === phase.id 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    {phase.name.split(':')[0]}
                    {hasDraftChanges && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-full h-px bg-slate-200 dark:bg-white/10" />

            {/* Level 3: Modules */}
            <div className="flex gap-3 flex-wrap px-1">
              <button 
                onClick={() => setSelectedModule(null)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs border transition-all flex items-center gap-2 ${
                  !selectedModule
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
                }`}
              >
                <Settings size={14} /> General (Fase {selectedPhaseId})
              </button>

              {activePhase?.modules.map(mod => {
                const checkModuleIsModified = () => {
                  const modId = mod.modulo_id || 1;
                  const levelIds = mod.levels?.map(l => l.id) || [];
                  const challengeIds = mod.challenges?.map(c => c.id) || [];
                  for (const lid of levelIds) {
                    if (isModuleModified(selectedPhaseId, modId * 100 + lid, mod.operacion)) return true;
                  }
                  for (const cid of challengeIds) {
                    if (isModuleModified(selectedPhaseId, modId * 1000 + cid, 'mixta')) return true;
                  }
                  return false;
                };
                const isModModified = checkModuleIsModified();

                const checkModuleHasActiveOverride = () => {
                  const modId = mod.modulo_id || 1;
                  return draftModularConfigs.some(
                    c => c.fase_id === selectedPhaseId && 
                         (Math.floor(c.seccion / 100) === modId || Math.floor(c.seccion / 1000) === modId) &&
                         c.activo !== false
                  );
                };
                const hasOverride = checkModuleHasActiveOverride();

                return (
                  <button 
                    key={mod.name}
                    onClick={() => setSelectedModule(mod)}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs border transition-all flex items-center gap-2 ${
                      selectedModule?.name === mod.name
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    <Layers size={14} /> {mod.name.split(':')[0]}
                    {isModModified && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-1" />}
                    {hasOverride && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ml-1 cursor-help ${
                          selectedModule?.name === mod.name ? 'bg-white/20' : 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                        }`}
                        title="Este módulo tiene configuración propia que sobreescribe la configuración global de la plataforma"
                      >
                        ⬆ Config propia
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CONTENT PANELS */}
        {/* ========================================================= */}
        <AnimatePresence mode="wait">
          {sectionsCollapsed ? (
            <motion.div
              key="collapsed-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-2xl text-center text-sm text-slate-500 dark:text-slate-400"
            >
              <Minimize2 size={20} className="inline mr-2 opacity-50" />
              Las secciones de configuración están colapsadas. Haz clic en <strong>"Expandir todo"</strong> para verlas.
            </motion.div>
          ) : selectedPhaseId === 0 ? (
            <motion.div
              key="globals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-7 w-full"
            >
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Límites Globales (Plataforma)
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-3">Configuración de Fallbacks Generales</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">Estos valores actúan como fallback unificado para todo el sistema educativo. Si una Fase o Módulo no tiene sobrescritura (override), heredarán estas reglas de operación por defecto.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* SECCIÓN 1: PRÁCTICA LIBRE (Niveles 1-10) */}
                <div className="bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 p-8 rounded-3xl flex flex-col gap-6 shadow-inner">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    Práctica Libre (Niveles 1 a 10)
                  </h4>

                  <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Volumen de Ejercicios</label>
                        <span className="text-base font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 text-center shadow-sm">
                          {draftGlobalConfig.practica_libre.cantidad_requerida} Ejercicios
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

                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Porcentaje Mínimo Aprobación</label>
                        <span className="text-base font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/20 text-center shadow-sm">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Uso de Cronómetro</label>
                            <p className="text-[10px] text-slate-500">Tiempo por pregunta.</p>
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
                          <div className="space-y-2 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">Límite</label>
                              <span className="text-sm font-black text-blue-500">{draftGlobalConfig.practica_libre.tiempo_default_segundos}s</span>
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
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Feedback Pedagógico</label>
                        <div className="flex flex-col gap-2 mt-1">
                          {['simple', 'detallado'].map((ft) => (
                            <button
                              type="button"
                              key={ft}
                              onClick={() => updateGlobalField('practica_libre', 'tipo_feedback', ft)}
                              className={`py-2.5 rounded-xl text-[11px] uppercase tracking-wider font-black border transition-all ${
                                draftGlobalConfig.practica_libre.tipo_feedback === ft
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                                  : 'glass-panel border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {ft === 'simple' ? 'Simple (✔/✘)' : 'Detallado (Tutoría IA)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: ZONA DE DESAFÍOS (Niveles 11-13) */}
                <div className="bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 p-8 rounded-3xl flex flex-col gap-6 shadow-inner">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse" />
                    Zona de Desafíos (Niveles 11 a 13)
                  </h4>

                  <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Volumen de Ejercicios</label>
                        <span className="text-base font-black text-purple-500 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20 text-center shadow-sm">
                          {draftGlobalConfig.desafios.cantidad_requerida} Ejercicios
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

                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Porcentaje Mínimo Aprobación</label>
                        <span className="text-base font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/20 text-center shadow-sm">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Uso de Cronómetro</label>
                            <p className="text-[10px] text-slate-500">Para toda la evaluación.</p>
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

                        <div className="space-y-4" style={{ opacity: draftGlobalConfig.desafios.usa_cronometro ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                          {/* Desafío 1 */}
                          <div className="space-y-1 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Desafío 1 (Estándar)</span>
                              <span className="text-xs font-black text-purple-500">{draftGlobalConfig.desafios.tiempo_default_segundos_11}s</span>
                            </div>
                            <SliderWithTooltip
                              value={draftGlobalConfig.desafios.tiempo_default_segundos_11}
                              min={10} max={200}
                              disabled={!draftGlobalConfig.desafios.usa_cronometro}
                              onChange={(val) => updateGlobalField('desafios', 'tiempo_default_segundos_11', val)}
                              accentColor="bg-purple-500" unit="s" isThermal
                            />
                          </div>

                          {/* Desafío 2 */}
                          <div className="space-y-1 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Desafío 2 (Avanzado)</span>
                              <span className="text-xs font-black text-purple-500">{draftGlobalConfig.desafios.tiempo_default_segundos_12}s</span>
                            </div>
                            <SliderWithTooltip
                              value={draftGlobalConfig.desafios.tiempo_default_segundos_12}
                              min={10} max={200}
                              disabled={!draftGlobalConfig.desafios.usa_cronometro}
                              onChange={(val) => updateGlobalField('desafios', 'tiempo_default_segundos_12', val)}
                              accentColor="bg-purple-500" unit="s" isThermal
                            />
                          </div>

                          {/* Desafío Final */}
                          <div className="space-y-1 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Desafío Final (Maestría)</span>
                              <span className="text-xs font-black text-purple-500">{draftGlobalConfig.desafios.tiempo_default_segundos_13}s</span>
                            </div>
                            <SliderWithTooltip
                              value={draftGlobalConfig.desafios.tiempo_default_segundos_13}
                              min={10} max={200}
                              disabled={!draftGlobalConfig.desafios.usa_cronometro}
                              onChange={(val) => updateGlobalField('desafios', 'tiempo_default_segundos_13', val)}
                              accentColor="bg-purple-500" unit="s" isThermal
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Feedback Pedagógico</label>
                        <div className="flex flex-col gap-2 mt-1">
                          {['simple', 'detallado'].map((ft) => (
                            <button
                              type="button"
                              key={ft}
                              onClick={() => updateGlobalField('desafios', 'tipo_feedback', ft)}
                              className={`py-2.5 rounded-xl text-[11px] uppercase tracking-wider font-black border transition-all ${
                                draftGlobalConfig.desafios.tipo_feedback === ft
                                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                                  : 'glass-panel border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {ft === 'simple' ? 'Simple (✔/✘)' : 'Detallado (Tutoría IA)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !selectedModule ? (
            <motion.div
              key={`phase-${selectedPhaseId}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-8 w-full relative"
            >
              <div className="flex justify-between items-start z-30">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Parámetros por Defecto de Fase
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-3">{activePhase.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">{activePhase.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sobrescribir Global</label>
                  <button 
                    onClick={() => togglePhaseOverride(!activePhaseDefaultRecord)}
                    className="transition-all hover:scale-105"
                  >
                    {activePhaseDefaultRecord ? (
                      <ToggleRight size={38} className="text-blue-500" />
                    ) : (
                      <ToggleLeft size={38} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl min-h-[350px]">
                {/* Glass Esmerilado blur overlay if phase does NOT override global */}
                <AnimatePresence>
                  {!activePhaseDefaultRecord && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/60 dark:bg-slate-950/70 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-8 text-center"
                    >
                      <ShieldAlert className="text-blue-500 mb-4" size={48} strokeWidth={1.5} />
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Heredando de Límites Globales</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md font-medium leading-relaxed">
                        Esta Fase está utilizando las reglas por defecto de la plataforma. Activa el botón <strong>"Sobrescribir Global"</strong> superior si deseas aislar y definir límites exclusivos para esta fase.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-3xl h-full shadow-inner">
                  <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm lg:text-base text-slate-600 dark:text-slate-300 font-bold">Volumen de Ejercicios</label>
                        <span className="text-lg font-black text-blue-500 bg-blue-500/10 px-4 py-1 rounded-xl border border-blue-500/20 shadow-sm">
                          {activePhaseDefaultRecord?.cantidad_requerida ?? draftGlobalConfig.practica_libre.cantidad_requerida}
                        </span>
                      </div>
                      <SliderWithTooltip
                        value={activePhaseDefaultRecord?.cantidad_requerida ?? draftGlobalConfig.practica_libre.cantidad_requerida}
                        min={10} max={120} step={5}
                        disabled={!activePhaseDefaultRecord}
                        onChange={(val) => handleUpdatePhaseDefault('cantidad_requerida', val)}
                        accentColor="bg-blue-500"
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-sm lg:text-base text-slate-600 dark:text-slate-300 font-bold">Porcentaje de Aprobación</label>
                        <span className="text-lg font-black text-green-500 bg-green-500/10 px-4 py-1 rounded-xl border border-green-500/20 shadow-sm">
                          {activePhaseDefaultRecord?.porcentaje_aprobacion ?? draftGlobalConfig.practica_libre.porcentaje_aprobacion}%
                        </span>
                      </div>
                      <SliderWithTooltip
                        value={activePhaseDefaultRecord?.porcentaje_aprobacion ?? draftGlobalConfig.practica_libre.porcentaje_aprobacion}
                        min={50} max={100} step={5}
                        disabled={!activePhaseDefaultRecord}
                        onChange={(val) => handleUpdatePhaseDefault('porcentaje_aprobacion', val)}
                        accentColor="bg-green-500" unit="%"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col gap-6 shadow-sm">
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock size={18} className="text-amber-500" /> Temporizador de Fase Único
                    </h4>
                    <p className="text-xs text-slate-500">
                      Define un temporizador único para todos los niveles de esta fase si deseas evitar configurarlos uno a uno.
                    </p>

                    <div className="space-y-4 mt-auto">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Habilitar Cronómetro de Fase</label>
                        <button 
                          onClick={() => handleUpdatePhaseDefault('usa_cronometro', !(activePhaseDefaultRecord?.usa_cronometro ?? draftGlobalConfig.practica_libre.usa_cronometro))}
                          disabled={!activePhaseDefaultRecord}
                          className="transition-all hover:scale-105 disabled:opacity-30"
                        >
                          <div className={`ios-switch ${activePhaseDefaultRecord?.usa_cronometro ? 'ios-switch-active' : ''}`}>
                            <div className="ios-switch-knob" />
                          </div>
                        </button>
                      </div>

                      {activePhaseDefaultRecord?.usa_cronometro && (
                        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold">Límite por Pregunta</label>
                            <span className="text-lg font-black text-amber-500">
                              {activePhaseDefaultRecord.tiempo_default_segundos || 12}s
                            </span>
                          </div>
                          <SliderWithTooltip
                            value={activePhaseDefaultRecord.tiempo_default_segundos || 12}
                            min={3} max={3600} step={5}
                            disabled={!activePhaseDefaultRecord}
                            onChange={(val) => handleUpdatePhaseDefault('tiempo_default_segundos', val)}
                            accentColor="bg-amber-500" unit="s" isThermal
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`module-${selectedPhaseId}-${selectedModule.name}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-8 w-full relative"
            >
              <div className="flex justify-between items-start z-30">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Configuración de Módulo
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-3 flex items-center flex-wrap gap-2">
                    {selectedModule.name.split(':')[0]}
                    {selectedPhaseId > 1 && selectedSubLevelId && (
                      <span className="text-blue-500 font-black text-2xl">
                        ({isSelectedChallenge ? 'Desafío' : 'Nivel'} {selectedSubLevelId})
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Reglas de evaluación y parámetros exclusivos para este contenido.</p>
                </div>

                <div className="flex flex-col items-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sobrescribir Padre</label>
                  <button 
                    onClick={() => toggleModuleOverride(!activeModuleRecord)}
                    className="transition-all hover:scale-105"
                  >
                    {activeModuleRecord ? (
                      <ToggleRight size={38} className="text-amber-500" />
                    ) : (
                      <ToggleLeft size={38} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative min-h-[400px]">
                
                {/* Glass Esmerilado blur overlay if module does NOT override phase */}
                <AnimatePresence>
                  {!activeModuleRecord && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/60 dark:bg-slate-950/70 backdrop-blur-md z-[60] rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                    >
                      <ShieldAlert className="text-amber-500 mb-4" size={48} strokeWidth={1.5} />
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Heredando de la Fase {selectedPhaseId}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md font-medium leading-relaxed">
                        Este módulo está utilizando las reglas de la Fase a la que pertenece. Activa <strong>"Sobrescribir Padre"</strong> para desvincularlo y crear reglas exclusivas.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sub-item Selector for Fase 2 & 3 */}
                {selectedPhaseId > 1 && (
                  <div className="flex flex-col gap-3 bg-white/80 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200 dark:border-white/5 mb-8 shadow-inner">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Explorar Niveles y Desafíos del Módulo</label>
                    <div className="flex flex-wrap gap-2">
                      {/* Levels */}
                      {selectedModule.levels?.map((lvl) => (
                        <button
                          key={`lvl-${lvl.id}`}
                          onClick={() => { setSelectedSubLevelId(lvl.id); setIsSelectedChallenge(false); }}
                          className={`px-4 py-2 rounded-2xl text-sm font-bold border transition-all ${
                            !isSelectedChallenge && selectedSubLevelId === lvl.id
                              ? 'bg-blue-600 border-blue-500 text-white font-black shadow-md shadow-blue-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50'
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
                          className={`px-4 py-2 rounded-2xl text-sm font-bold border transition-all flex items-center gap-1.5 ${
                            isSelectedChallenge && selectedSubLevelId === ch.id
                              ? 'bg-amber-600 border-amber-500 text-white font-black shadow-md shadow-amber-500/20'
                              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                          }`}
                        >
                          <Target size={14} /> {ch.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Controls */}
                  <div className="flex flex-col gap-8 bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-inner">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm lg:text-base text-slate-600 dark:text-slate-300 font-bold">Volumen de Ejercicios</label>
                        <span className="text-lg font-black text-blue-500 bg-blue-500/10 px-4 py-1 rounded-xl border border-blue-500/20 shadow-sm">
                          {activeModuleRecord?.cantidad_requerida ?? getInheritedQuestionsCount()}
                        </span>
                      </div>
                      <SliderWithTooltip
                        value={activeModuleRecord?.cantidad_requerida ?? getInheritedQuestionsCount()}
                        min={5} max={100} step={5}
                        disabled={!activeModuleRecord}
                        onChange={(val) => handleUpdateModuleField('cantidad_requerida', val)}
                        accentColor="bg-blue-500"
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-sm lg:text-base text-slate-600 dark:text-slate-300 font-bold">Porcentaje de Aprobación</label>
                        <span className="text-lg font-black text-green-500 bg-green-500/10 px-4 py-1 rounded-xl border border-green-500/20 shadow-sm">
                          {activeModuleRecord?.porcentaje_aprobacion ?? getInheritedPassingScore()}%
                        </span>
                      </div>
                      <SliderWithTooltip
                        value={activeModuleRecord?.porcentaje_aprobacion ?? getInheritedPassingScore()}
                        min={50} max={100} step={5}
                        disabled={!activeModuleRecord}
                        onChange={(val) => handleUpdateModuleField('porcentaje_aprobacion', val)}
                        accentColor="bg-green-500" unit="%"
                      />
                    </div>
                  </div>

                  {/* Feedback and Timers */}
                  <div className="flex flex-col gap-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                    {/* Feedback choice */}
                    {!isSelectedChallenge && (
                      <div className="space-y-4">
                        <label className="text-sm text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2">
                          <HelpCircle size={18} className="text-purple-500" /> Tipo de Feedback Pedagógico
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateModuleField('tipo_feedback', 'simple')}
                            disabled={!activeModuleRecord}
                            className={`flex-1 py-3 rounded-2xl border text-xs uppercase tracking-wider font-black transition-all ${
                              (activeModuleRecord?.tipo_feedback ?? getInheritedFeedbackType()) === 'simple'
                                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Simple (✔/✘)
                          </button>
                          <button
                            onClick={() => handleUpdateModuleField('tipo_feedback', 'detallado')}
                            disabled={!activeModuleRecord}
                            className={`flex-1 py-3 rounded-2xl border text-xs uppercase tracking-wider font-black transition-all ${
                              (activeModuleRecord?.tipo_feedback ?? getInheritedFeedbackType()) === 'detallado'
                                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Tutoría IA
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Timer settings */}
                    <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-5 mt-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm text-slate-600 dark:text-slate-300 font-bold">Usar Cronómetro</label>
                          <p className="text-[10px] text-slate-500">Sobrescribir tiempo global.</p>
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
                        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                          <div className="flex justify-between items-center">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold">Límite en Segundos</label>
                            <span className="text-lg font-black text-amber-500">
                              {activeModuleRecord?.tiempo_default_segundos ?? getInheritedTimerForLevel('medium')}s
                            </span>
                          </div>
                          <SliderWithTooltip
                            value={activeModuleRecord?.tiempo_default_segundos ?? getInheritedTimerForLevel('medium')}
                            min={3} max={600} step={5}
                            disabled={!activeModuleRecord}
                            onChange={(val) => handleUpdateModuleField('tiempo_default_segundos', val)}
                            accentColor="bg-amber-500" unit="s" isThermal
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


    </motion.div>
  );
};

export default PedagogyTab;
