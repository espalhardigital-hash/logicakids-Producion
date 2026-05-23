import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, Award, Shield, Check, Unlock, Lock, RotateCcw, 
  AlertTriangle, Edit, Trash2, Plus, BookOpen, ChevronDown, 
  ChevronUp, Loader2, Save, FileText, X, Settings, ToggleLeft, ToggleRight
} from 'lucide-react';
import { 
  searchAlumnos, getAlumnoProgress, overrideAlumnoProgress,
  getPreguntasByLevel, deletePregunta, createPregunta, updatePregunta,
  getNivelTeoria, saveNivelTeoria, AlumnoSearchInfo
} from '../../services/storageService';

// ============================================================
// STATIC DATA CORRESPONDENCE FOR MAPPING
// ============================================================
interface LevelMap {
  id: number;
  name: string;
  seccion: number;
  operacion: string;
  isChallenge?: boolean;
}

interface ModuleMap {
  id: number;
  name: string;
  levels: LevelMap[];
}

interface PhaseMap {
  id: number;
  name: string;
  modules: ModuleMap[];
}

const PHASE_MAPS: PhaseMap[] = [
  {
    id: 1,
    name: "Fase 1: Aritmética Básica",
    modules: [
      {
        id: 1,
        name: "Operaciones Directas",
        levels: [
          { id: 1, name: "Suma Directa", seccion: 1, operacion: "suma" },
          { id: 2, name: "Resta Directa", seccion: 1, operacion: "resta" },
          { id: 3, name: "Multiplicación Directa", seccion: 1, operacion: "multiplicacion" },
          { id: 4, name: "División Directa", seccion: 1, operacion: "division" }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Fase 2: Desarrollo Numérico",
    modules: [
      {
        id: 1,
        name: "Módulo 1: Gimnasio Numérico Mental",
        levels: [
          { id: 1, name: "Multiplicadores de Tamaño", seccion: 101, operacion: "suma" },
          { id: 2, name: "Jerarquía Lógica", seccion: 102, operacion: "suma" },
          { id: 3, name: "Traducción Lógica", seccion: 103, operacion: "suma" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 1011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 1012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 1013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: Tablas en Acción",
        levels: [
          { id: 1, name: "Suma e Inversa", seccion: 201, operacion: "multiplicacion" },
          { id: 2, name: "Multiplicación e Inversa", seccion: 202, operacion: "multiplicacion" },
          { id: 3, name: "El Número Faltante", seccion: 203, operacion: "multiplicacion" },
          { id: 4, name: "Gran Integración", seccion: 204, operacion: "multiplicacion" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 2011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 2012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 2013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: Tienda Matemática",
        levels: [
          { id: 1, name: "Reconozco el Dinero", seccion: 301, operacion: "mixta" },
          { id: 2, name: "Pago y Cambio", seccion: 302, operacion: "mixta" },
          { id: 3, name: "Carrito de Compras", seccion: 303, operacion: "mixta" },
          { id: 4, name: "Comprador Inteligente", seccion: 304, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 3011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 3012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 3013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: Constructor de Soluciones",
        levels: [
          { id: 1, name: "Dos Pasos Guiados", seccion: 401, operacion: "mixta" },
          { id: 2, name: "Encadenamiento", seccion: 402, operacion: "mixta" },
          { id: 3, name: "Error de Arrastre", seccion: 403, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 4011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 4012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 4013, operacion: "mixta", isChallenge: true }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Fase 3: Problemas de Texto",
    modules: [
      {
        id: 1,
        name: "Módulo 1: El Escáner de la Verdad",
        levels: [
          { id: 1, name: "El Lápiz Mágico", seccion: 101, operacion: "mixta" },
          { id: 2, name: "El Escudo Anti-Basura", seccion: 102, operacion: "mixta" },
          { id: 3, name: "El Laberinto Numérico", seccion: 103, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 1011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 1012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 1013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 2,
        name: "Módulo 2: La Máquina del Tiempo",
        levels: [
          { id: 1, name: "El Reloj hacia Adelante", seccion: 201, operacion: "mixta" },
          { id: 2, name: "El Reloj en Reversa", seccion: 202, operacion: "mixta" },
          { id: 3, name: "El Tiempo Multiplicado", seccion: 203, operacion: "mixta" },
          { id: 4, name: "El Laberinto del Tiempo", seccion: 204, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 2011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 2012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 2013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 3,
        name: "Módulo 3: El Ojo del Comerciante",
        levels: [
          { id: 1, name: "El Enigma de los Carritos", seccion: 301, operacion: "mixta" },
          { id: 2, name: "Cruce de Datos", seccion: 302, operacion: "mixta" },
          { id: 3, name: "El Código Oculto", seccion: 303, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 3011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 3012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 3013, operacion: "mixta", isChallenge: true }
        ]
      },
      {
        id: 4,
        name: "Módulo 4: El Maestro del Empaque",
        levels: [
          { id: 1, name: "El Reparto Perfecto", seccion: 401, operacion: "mixta" },
          { id: 2, name: "Las Piezas Sobrantes", seccion: 402, operacion: "mixta" },
          { id: 3, name: "El Ciclo Infinito", seccion: 403, operacion: "mixta" },
          { id: 11, name: "Desafío 1 (Estándar)", seccion: 4011, operacion: "mixta", isChallenge: true },
          { id: 12, name: "Desafío 2 (Avanzado)", seccion: 4012, operacion: "mixta", isChallenge: true },
          { id: 13, name: "Desafío Final (Maestría)", seccion: 4013, operacion: "mixta", isChallenge: true }
        ]
      }
    ]
  }
];

const PerformanceTab: React.FC = () => {
  // Search & Alumnos states
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [alumnos, setAlumnos] = useState<AlumnoSearchInfo[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<AlumnoSearchInfo | null>(null);
  
  // Progress states
  const [alumnoProgress, setAlumnoProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [expandedFases, setExpandedFases] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });
  const [actionInProgress, setActionInProgress] = useState<string | null>(null); // e.g. "fase-seccion-operacion"

  // Content Management View Toggle
  const [showContentManager, setShowContentManager] = useState(false);
  const [mgrFaseId, setMgrFaseId] = useState<number>(1);
  const [mgrModuloId, setMgrModuloId] = useState<number>(1);
  const [mgrLevelId, setMgrLevelId] = useState<number>(1);

  // Content Management data
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [theory, setTheory] = useState<any | null>(null);
  const [loadingTheory, setLoadingTheory] = useState(false);
  const [savingTheory, setSavingTheory] = useState(false);

  // Question Form modal state
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null); // null for new, populated for editing
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Search trigger on input change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setAlumnos([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await searchAlumnos(searchQuery);
      setAlumnos(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Fetch student progress
  const fetchProgress = async (alumnoId: number) => {
    setLoadingProgress(true);
    try {
      const res = await getAlumnoProgress(alumnoId);
      setAlumnoProgress(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleSelectAlumno = (alumno: AlumnoSearchInfo) => {
    setSelectedAlumno(alumno);
    fetchProgress(alumno.alumno_id);
  };

  // Apply override
  const handleApplyOverride = async (faseId: number, seccion: number, operacion: string, action: 'approve' | 'unlock' | 'lock') => {
    if (!selectedAlumno) return;
    const actionKey = `${faseId}-${seccion}-${operacion}`;
    setActionInProgress(actionKey);
    try {
      await overrideAlumnoProgress(selectedAlumno.alumno_id, {
        fase_id: faseId,
        seccion,
        operacion,
        action
      });
      // refresh progress
      await fetchProgress(selectedAlumno.alumno_id);
    } catch (e) {
      console.error(e);
      alert("Error al aplicar la acción.");
    } finally {
      setActionInProgress(null);
    }
  };

  // Fetch Questions and Theory for Content Manager
  const loadContentManagerData = async (faseId: number, moduloId: number, levelId: number) => {
    setLoadingQuestions(true);
    setLoadingTheory(true);
    
    // Resolve DB section and operation
    const phase = PHASE_MAPS.find(p => p.id === faseId);
    const mod = phase?.modules.find(m => m.id === moduloId);
    const lvl = mod?.levels.find(l => l.id === levelId);

    if (!lvl) {
      setLoadingQuestions(false);
      setLoadingTheory(false);
      return;
    }

    try {
      // 1. Get Questions
      const questionsRes = await getPreguntasByLevel(faseId, lvl.seccion, lvl.operacion);
      setQuestions(questionsRes);
      
      // 2. Get Theory
      const theoryRes = await getNivelTeoria(faseId, moduloId, levelId);
      setTheory(theoryRes || {
        fase_id: faseId,
        modulo_id: moduloId,
        nivel_id: levelId,
        titulo: "",
        texto_descubrimiento: "",
        advertencia: "",
        diccionario: {},
        ejemplos: [],
        interactivos: []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuestions(false);
      setLoadingTheory(false);
    }
  };

  useEffect(() => {
    if (showContentManager) {
      loadContentManagerData(mgrFaseId, mgrModuloId, mgrLevelId);
    }
  }, [showContentManager, mgrFaseId, mgrModuloId, mgrLevelId]);

  // Handle save theory
  const handleSaveTheory = async () => {
    if (!theory) return;
    setSavingTheory(true);
    try {
      await saveNivelTeoria(theory);
      alert("¡Teoría guardada exitosamente!");
    } catch (e) {
      console.error(e);
      alert("Error al guardar la teoría.");
    } finally {
      setSavingTheory(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (qId: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta pregunta?")) return;
    try {
      await deletePregunta(qId);
      setQuestions(prev => prev.filter(q => q.id !== qId));
    } catch (e) {
      console.error(e);
      alert("Error al eliminar la pregunta.");
    }
  };

  // Save question (Edit/New)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    setSavingQuestion(true);

    const phase = PHASE_MAPS.find(p => p.id === mgrFaseId);
    const mod = phase?.modules.find(m => m.id === mgrModuloId);
    const lvl = mod?.levels.find(l => l.id === mgrLevelId);
    if (!lvl) return;

    const payload = {
      ...editingQuestion,
      fase_id: mgrFaseId,
      seccion: lvl.seccion,
      operacion: lvl.operacion
    };

    try {
      if (editingQuestion.id) {
        // Update
        const updated = await updatePregunta(editingQuestion.id, payload);
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q));
      } else {
        // Create
        const created = await createPregunta(payload);
        setQuestions(prev => [...prev, created]);
      }
      setShowQuestionModal(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la pregunta.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const openNewQuestionModal = () => {
    setEditingQuestion({
      enunciado: "",
      respuesta_correcta: "",
      tipo_pregunta: "multiple_opcion",
      requiere_subrayado: false,
      alternativas: [
        { texto: "", es_correcta: true, orden: 1 },
        { texto: "", es_correcta: false, orden: 2 },
        { texto: "", es_correcta: false, orden: 3 },
        { texto: "", es_correcta: false, orden: 4 }
      ]
    });
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (q: any) => {
    // Make sure alternatives exist and map properly
    const alts = q.alternativas && q.alternativas.length > 0 
      ? JSON.parse(JSON.stringify(q.alternativas)) 
      : [
          { texto: "", es_correcta: true, orden: 1 },
          { texto: "", es_correcta: false, orden: 2 },
          { texto: "", es_correcta: false, orden: 3 },
          { texto: "", es_correcta: false, orden: 4 }
        ];
    setEditingQuestion({
      id: q.id,
      enunciado: q.enunciado,
      respuesta_correcta: q.respuesta_correcta,
      tipo_pregunta: q.tipo_pregunta || "multiple_opcion",
      requiere_subrayado: q.requiere_subrayado || false,
      alternativas: alts
    });
    setShowQuestionModal(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-white select-none">
      
      {/* Top Header Panel */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 rounded-2xl border border-red-500/30">
              <Shield className="text-red-400" size={24} />
            </div>
            Rendimiento Estudiantil Avanzado
          </h2>
          <p className="text-slate-400 text-sm mt-1">Busca un alumno para gestionar su avance o interactuar con el banco de preguntas y teoría.</p>
        </div>

        <button
          onClick={() => setShowContentManager(!showContentManager)}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg transition-all hover:scale-105 active:scale-95 ${
            showContentManager 
              ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
              : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
          }`}
        >
          {showContentManager ? <User size={18} /> : <BookOpen size={18} />}
          {showContentManager ? 'Ver Rendimiento Alumnos' : 'Gestionar Banco Preguntas / Teoría'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* MAIN PANEL A: STUDENT PERFORMANCE */}
        {!showContentManager ? (
          <motion.div 
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            {/* Left Column: Student search */}
            <div className="lg:col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.2rem] shadow-2xl flex flex-col gap-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Buscador de Alumnos</h3>
              
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-base font-bold placeholder-slate-500 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Student list */}
              <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {loadingSearch && (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="text-blue-500 animate-spin" size={24} />
                  </div>
                )}
                
                {!loadingSearch && alumnos.length === 0 && searchQuery.trim() !== "" && (
                  <p className="text-sm text-slate-500 text-center py-10">No se encontraron alumnos.</p>
                )}

                {!loadingSearch && alumnos.length === 0 && searchQuery.trim() === "" && (
                  <p className="text-sm text-slate-500 text-center py-10">Escribe en el buscador para encontrar un alumno.</p>
                )}

                {alumnos.map((a) => {
                  const isSelected = selectedAlumno?.id === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => handleSelectAlumno(a)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1 ${
                        isSelected 
                          ? 'bg-blue-600/20 text-white border-blue-500/40 shadow-inner' 
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm font-black">{a.alumno_nombre}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{a.email}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5 self-start mt-1">
                        Fase Actual: {a.fase_actual_id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed student progress & overrides */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {!selectedAlumno ? (
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[2.2rem] shadow-2xl flex flex-col items-center justify-center text-center min-h-[40vh]">
                  <User size={48} className="text-slate-600 mb-4" />
                  <h4 className="text-base font-black text-slate-300">Ningún Alumno Seleccionado</h4>
                  <p className="text-sm text-slate-500 max-w-xs mt-1">
                    Selecciona un alumno de la lista de la izquierda para ver su rendimiento académico detallado y gestionar sus permisos de fase.
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-6">
                  
                  {/* Selected student profile card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                        <User className="text-blue-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white">{selectedAlumno.alumno_nombre}</h4>
                        <p className="text-sm text-slate-500 font-bold">{selectedAlumno.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Fase Actual</span>
                        <span className="text-base font-black text-blue-400">Fase {selectedAlumno.fase_actual_id}</span>
                      </div>
                      <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Estado</span>
                        <span className="text-base font-black text-green-400">{selectedAlumno.estado}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Drilldown */}
                  <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Progreso y Control de Maestría</h4>

                    {loadingProgress ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="text-blue-500 animate-spin" size={32} />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        
                        {PHASE_MAPS.map((phase) => {
                          const isExpanded = expandedFases[phase.id];
                          return (
                            <div key={phase.id} className="rounded-3xl border border-white/5 bg-slate-950/20 overflow-hidden">
                              
                              {/* Phase header */}
                              <div 
                                onClick={() => setExpandedFases(prev => ({ ...prev, [phase.id]: !prev[phase.id] }))}
                                className="flex justify-between items-center p-4 bg-slate-900/40 cursor-pointer border-b border-white/5 hover:bg-slate-900/60"
                              >
                                <span className="text-sm font-black text-white">{phase.name}</span>
                                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                              </div>

                              {isExpanded && (
                                <div className="p-4 flex flex-col gap-4">
                                  {phase.modules.map((mod) => (
                                    <div key={mod.id} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                                      <h5 className="text-[11px] font-black text-slate-400 border-b border-white/5 pb-1.5">{mod.name}</h5>
                                      
                                      <div className="flex flex-col gap-2">
                                        {mod.levels.map((lvl) => {
                                          // Find progress entry
                                          const prog = alumnoProgress.find(
                                            p => p.fase_id === phase.id && p.seccion === lvl.seccion && p.operacion === lvl.operacion
                                          );
                                          
                                          const state = prog ? prog.estado : "BLOQUEADO";
                                          const pct = prog ? prog.porcentaje_actual : 0;
                                          const isApprovedByAdmin = prog ? prog.aprobado_por_admin : false;
                                          const actionKey = `${phase.id}-${lvl.seccion}-${lvl.operacion}`;
                                          const loadingThis = actionInProgress === actionKey;

                                          return (
                                            <div key={lvl.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/20 border border-white/5 rounded-xl">
                                              
                                              {/* Level metadata */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <span className={`text-[10px] font-black ${lvl.isChallenge ? 'text-amber-400' : 'text-slate-300'}`}>
                                                    {lvl.isChallenge ? 'Desafío' : 'Nivel'} {lvl.id}: {lvl.name}
                                                  </span>
                                                  {isApprovedByAdmin && (
                                                    <span className="text-[8px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-black flex items-center gap-1">
                                                      <AlertTriangle size={8} /> Aprobado por Admin
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                                                    state === 'APROBADO' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    state === 'EN_PROGRESO' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    'bg-slate-800 text-slate-500 border border-white/5'
                                                  }`}>
                                                    {state}
                                                  </span>
                                                  {state !== 'BLOQUEADO' && (
                                                    <span className="text-[9px] text-slate-500 font-bold">{pct}% Aciertos</span>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Controls buttons */}
                                              <div className="flex items-center gap-1.5 self-end sm:self-center">
                                                {loadingThis ? (
                                                  <Loader2 size={16} className="animate-spin text-blue-400 mr-4" />
                                                ) : (
                                                  <>
                                                    {/* Unlock button */}
                                                    {state === 'BLOQUEADO' && (
                                                      <button
                                                        onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'unlock')}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-[9px] font-black text-blue-400 hover:text-white transition-all flex items-center gap-1"
                                                      >
                                                        <Unlock size={10} /> Liberar
                                                      </button>
                                                    )}
                                                    
                                                    {/* Approve button */}
                                                    {state !== 'APROBADO' && (
                                                      <button
                                                        onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'approve')}
                                                        className="px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600 border border-green-500/30 text-[9px] font-black text-green-400 hover:text-white transition-all flex items-center gap-1"
                                                      >
                                                        <Check size={10} /> Aprobar (90%)
                                                      </button>
                                                    )}

                                                    {/* Reset/Lock button */}
                                                    {state !== 'BLOQUEADO' && (
                                                      <button
                                                        onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'lock')}
                                                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-[9px] font-black text-slate-400 hover:text-white transition-all flex items-center gap-1"
                                                      >
                                                        <RotateCcw size={10} /> Restablecer
                                                      </button>
                                                    )}
                                                  </>
                                                )}
                                              </div>

                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            </div>
                          );
                        })}

                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </motion.div>
        ) : (
          
          /* MAIN PANEL B: DATABASE CONTENT MANAGER */
          <motion.div 
            key="manager"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start"
          >
            {/* Phase / Module / Level Selectors */}
            <div className="lg:col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.2rem] shadow-2xl flex flex-col gap-5">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Selector de Nivel</h3>
              
              {/* Phase selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider px-2">Fase</label>
                <select
                  value={mgrFaseId}
                  onChange={(e) => {
                    const fid = parseInt(e.target.value);
                    setMgrFaseId(fid);
                    setMgrModuloId(1);
                    setMgrLevelId(1);
                  }}
                  className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                >
                  {PHASE_MAPS.map(p => (
                    <option key={p.id} value={p.id}>{p.name.split(':')[0]}</option>
                  ))}
                </select>
              </div>

              {/* Module selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider px-2">Módulo</label>
                <select
                  value={mgrModuloId}
                  onChange={(e) => {
                    const mid = parseInt(e.target.value);
                    setMgrModuloId(mid);
                    setMgrLevelId(1);
                  }}
                  className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                >
                  {PHASE_MAPS.find(p => p.id === mgrFaseId)?.modules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Level selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider px-2">Nivel / Desafío</label>
                <select
                  value={mgrLevelId}
                  onChange={(e) => setMgrLevelId(parseInt(e.target.value))}
                  className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                >
                  {PHASE_MAPS.find(p => p.id === mgrFaseId)?.modules.find(m => m.id === mgrModuloId)?.levels.map(l => (
                    <option key={l.id} value={l.id}>{l.isChallenge ? 'Desafío' : 'Nivel'} {l.id}: {l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions Table & Theory Form */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* SECTION 1: THEORY / CONCEPTS EDITOR */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-purple-400" /> Contenido Teórico (Flashcards)
                  </h4>
                  <button
                    onClick={handleSaveTheory}
                    disabled={loadingTheory || savingTheory}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-sm font-black flex items-center gap-1.5 shadow-md shadow-purple-900/10 active:scale-95 transition-all"
                  >
                    {savingTheory ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Guardar Teoría
                  </button>
                </div>

                {loadingTheory ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-purple-400" size={24} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left fields */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Título de Teoría</label>
                          <input
                            type="text"
                            value={theory?.titulo || ""}
                            onChange={(e) => setTheory((prev: any) => ({ ...prev, titulo: e.target.value }))}
                            className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Texto Descubrimiento</label>
                          <textarea
                            rows={3}
                            value={theory?.texto_descubrimiento || ""}
                            onChange={(e) => setTheory((prev: any) => ({ ...prev, texto_descubrimiento: e.target.value }))}
                            className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50 resize-none"
                          />
                        </div>
                      </div>

                      {/* Right fields */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Tip Pedagógico / Advertencia</label>
                          <textarea
                            rows={6}
                            value={theory?.advertencia || ""}
                            onChange={(e) => setTheory((prev: any) => ({ ...prev, advertencia: e.target.value }))}
                            className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* DICCIONARIO / GLOSARIO */}
                    <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Glosario / Diccionario del Nivel</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newDict = { ...(theory?.diccionario || {}) };
                            let suffix = 1;
                            while (newDict[`Nuevo Término ${suffix}`]) suffix++;
                            newDict[`Nuevo Término ${suffix}`] = "Definición del término.";
                            setTheory((prev: any) => ({ ...prev, diccionario: newDict }));
                          }}
                          className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Plus size={10} /> Agregar Término
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(theory?.diccionario || {}).map(([term, def]: [string, any], dIdx) => (
                          <div key={dIdx} className="flex gap-2 bg-slate-950/20 border border-white/5 p-2 rounded-xl items-start">
                            <div className="flex-1 flex flex-col gap-1.5">
                              <input
                                type="text"
                                placeholder="Término"
                                value={term}
                                onChange={(e) => {
                                  const newKey = e.target.value;
                                  if (!newKey) return;
                                  const newDict: Record<string, any> = {};
                                  for (const [k, v] of Object.entries(theory.diccionario)) {
                                    if (k === term) {
                                      newDict[newKey] = v;
                                    } else {
                                      newDict[k] = v;
                                    }
                                  }
                                  setTheory((prev: any) => ({ ...prev, diccionario: newDict }));
                                }}
                                className="bg-slate-950 border border-white/5 rounded-lg p-2 text-xs font-black text-purple-300 focus:outline-none focus:border-purple-500/50"
                              />
                              <textarea
                                rows={2}
                                placeholder="Definición"
                                value={def}
                                onChange={(e) => {
                                  const newDict = { ...(theory.diccionario || {}) };
                                  newDict[term] = e.target.value;
                                  setTheory((prev: any) => ({ ...prev, diccionario: newDict }));
                                }}
                                className="bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newDict = { ...(theory.diccionario || {}) };
                                delete newDict[term];
                                setTheory((prev: any) => ({ ...prev, diccionario: newDict }));
                              }}
                              className="p-2 bg-red-500/10 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        {Object.keys(theory?.diccionario || {}).length === 0 && (
                          <p className="text-xs text-slate-500 italic py-2 md:col-span-2">No hay términos definidos en el glosario de este nivel.</p>
                        )}
                      </div>
                    </div>

                    {/* EJEMPLOS */}
                    <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Ejemplos del Nivel</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newExamples = [...(theory?.ejemplos || [])];
                            newExamples.push({
                              enunciado: "Nuevo Ejemplo",
                              pasos: [
                                { orden: 1, texto: "Paso 1 del ejemplo" }
                              ]
                            });
                            setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                          }}
                          className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Plus size={10} /> Agregar Ejemplo
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(theory?.ejemplos || []).map((ex: any, eIdx: number) => (
                          <div key={eIdx} className="bg-slate-950/20 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-purple-400">Ejemplo #{eIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newExamples = (theory.ejemplos || []).filter((_: any, i: number) => i !== eIdx);
                                  setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                }}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Enunciado del Ejemplo</label>
                              <input
                                type="text"
                                value={ex.enunciado || ""}
                                onChange={(e) => {
                                  const newExamples = [...theory.ejemplos];
                                  newExamples[eIdx] = { ...ex, enunciado: e.target.value };
                                  setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                }}
                                className="bg-slate-950 border border-white/5 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                              />
                            </div>

                            <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Pasos del Ejemplo</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newExamples = [...theory.ejemplos];
                                    const steps = [...(ex.pasos || [])];
                                    steps.push({ orden: steps.length + 1, texto: "Siguiente paso" });
                                    newExamples[eIdx] = { ...ex, pasos: steps };
                                    setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                  }}
                                  className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-400 rounded text-[9px] font-bold flex items-center gap-0.5 border border-purple-500/20"
                                >
                                  <Plus size={8} /> Añadir Paso
                                </button>
                              </div>

                              <div className="flex flex-col gap-2">
                                {(ex.pasos || []).map((step: any, sIdx: number) => (
                                  <div key={sIdx} className="flex gap-2 items-center">
                                    <span className="text-xs font-bold text-slate-500">{step.orden}</span>
                                    <input
                                      type="text"
                                      value={step.texto || ""}
                                      onChange={(e) => {
                                        const newExamples = [...theory.ejemplos];
                                        const steps = [...ex.pasos];
                                        steps[sIdx] = { ...step, texto: e.target.value };
                                        newExamples[eIdx] = { ...ex, pasos: steps };
                                        setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                      }}
                                      className="flex-1 bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newExamples = [...theory.ejemplos];
                                        const steps = ex.pasos.filter((_: any, i: number) => i !== sIdx)
                                          .map((s: any, idx: number) => ({ ...s, orden: idx + 1 }));
                                        newExamples[eIdx] = { ...ex, pasos: steps };
                                        setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                      }}
                                      className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                                {(ex.pasos || []).length === 0 && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] text-slate-500 italic">No hay pasos, se usará la respuesta legacy directa:</span>
                                    <input
                                      type="text"
                                      placeholder="Respuesta directa (ej: 18)"
                                      value={ex.respuesta || ""}
                                      onChange={(e) => {
                                        const newExamples = [...theory.ejemplos];
                                        newExamples[eIdx] = { ...ex, respuesta: e.target.value };
                                        setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                      }}
                                      className="bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(theory?.ejemplos || []).length === 0 && (
                          <p className="text-xs text-slate-500 italic py-2 md:col-span-2">No hay ejemplos resueltos en este nivel.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: QUESTIONS LIST */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings size={14} className="text-blue-400" /> Banco de Preguntas del Nivel
                  </h4>
                  
                  <button
                    onClick={openNewQuestionModal}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-black flex items-center gap-1.5 shadow-md shadow-blue-900/10 active:scale-95 transition-all"
                  >
                    <Plus size={12} />
                    Agregar Pregunta
                  </button>
                </div>

                {loadingQuestions ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-400" size={32} />
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    {questions.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-10">No hay preguntas registradas en este nivel.</p>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                            <th className="py-3 px-4">Pregunta / Enunciado</th>
                            <th className="py-3 px-4">Respuesta Correcta</th>
                            <th className="py-3 px-4">Tipo</th>
                            <th className="py-3 px-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {questions.map((q) => (
                            <tr key={q.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                              <td className="py-4 px-4 font-semibold max-w-md truncate">{q.enunciado}</td>
                              <td className="py-4 px-4 font-bold text-green-400">{q.respuesta_correcta}</td>
                              <td className="py-4 px-4">
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                  {q.tipo_pregunta}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditQuestionModal(q)}
                                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUESTION EDIT/CREATE FORM MODAL */}
      <AnimatePresence>
        {showQuestionModal && editingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.2rem] p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-white select-none"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h4 className="text-xl font-black flex items-center gap-2">
                  <Shield size={18} className="text-blue-400" />
                  {editingQuestion.id ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </h4>
                <button 
                  onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="flex flex-col gap-5">
                
                {/* Enunciado */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Enunciado / Pregunta</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.enunciado}
                    onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, enunciado: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Respuesta Correcta */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Respuesta Correcta</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.respuesta_correcta}
                    onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, respuesta_correcta: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Tipo de pregunta & Requiere subrayado */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Tipo de Interfaz</label>
                    <select
                      value={editingQuestion.tipo_pregunta}
                      onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, tipo_pregunta: e.target.value }))}
                      className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="multiple_opcion">Opción Múltiple</option>
                      <option value="respuesta_numerica">Respuesta Numérica</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950/40 border border-white/5 p-3 rounded-xl self-end h-[42px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Requiere Subrayado</span>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion((prev: any) => ({ ...prev, requiere_subrayado: !prev.requiere_subrayado }))}
                      className="hover:scale-105 transition-transform"
                    >
                      {editingQuestion.requiere_subrayado ? (
                        <ToggleRight size={32} className="text-blue-400" />
                      ) : (
                        <ToggleLeft size={32} className="text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Alternatives editor (only if Multiple Choice) */}
                {editingQuestion.tipo_pregunta === "multiple_opcion" && (
                  <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Alternativas del Nivel (Opción Múltiple)</label>
                    
                    {editingQuestion.alternativas.map((alt: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-2 bg-slate-950/20 border border-white/5 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-500 w-5 text-center">#{idx + 1}</span>
                          <input
                            type="text"
                            required
                            placeholder={`Texto de la opción ${idx + 1}`}
                            value={alt.texto}
                            onChange={(e) => {
                              const newAlts = [...editingQuestion.alternativas];
                              newAlts[idx] = { ...alt, texto: e.target.value };
                              // If this option is correct, sync response_correcta
                              let updateCorrectObj: any = {};
                              if (alt.es_correcta) {
                                updateCorrectObj.respuesta_correcta = e.target.value;
                              }
                              setEditingQuestion((prev: any) => ({
                                ...prev,
                                alternativas: newAlts,
                                ...updateCorrectObj
                              }));
                            }}
                            className="flex-1 bg-slate-950 border border-white/5 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAlts = editingQuestion.alternativas.map((a: any, i: number) => ({
                                ...a,
                                es_correcta: i === idx,
                                tipo_error: i === idx ? null : a.tipo_error,
                                feedback_error: i === idx ? null : a.feedback_error
                              }));
                              setEditingQuestion((prev: any) => ({
                                ...prev,
                                alternativas: newAlts,
                                respuesta_correcta: alt.texto
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                              alt.es_correcta 
                                ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {alt.es_correcta ? 'Correcta' : 'Hacer Correcta'}
                          </button>
                        </div>
                        
                        {!alt.es_correcta && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8 border-t border-white/5 pt-2 mt-1">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Error</label>
                              <select
                                value={alt.tipo_error || ""}
                                onChange={(e) => {
                                  const newAlts = [...editingQuestion.alternativas];
                                  newAlts[idx] = { ...alt, tipo_error: e.target.value || null };
                                  setEditingQuestion((prev: any) => ({ ...prev, alternativas: newAlts }));
                                }}
                                className="bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                              >
                                <option value="">-- Sin Tipo de Error --</option>
                                <option value="calculo">Cálculo</option>
                                <option value="lectura">Lectura</option>
                                <option value="atencion">Atención</option>
                                <option value="operacion_incorrecta">Operación Incorrecta</option>
                                <option value="no_identifica_datos">No Identifica Datos</option>
                                <option value="problema_incompleto">Problema Incompleto</option>
                                <option value="tabuada">Tabuada</option>
                                <option value="division">División</option>
                                <option value="valor_posicional">Valor Posicional</option>
                                <option value="troco">Troco</option>
                                <option value="inferencia">Inferencia</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Feedback / Retroalimentación</label>
                              <input
                                type="text"
                                placeholder="Retroalimentación específica de este error"
                                value={alt.feedback_error || ""}
                                onChange={(e) => {
                                  const newAlts = [...editingQuestion.alternativas];
                                  newAlts[idx] = { ...alt, feedback_error: e.target.value };
                                  setEditingQuestion((prev: any) => ({ ...prev, alternativas: newAlts }));
                                }}
                                className="bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Save / Cancel */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
                    className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all border border-white/5 text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuestion}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black shadow-lg shadow-blue-900/20 disabled:opacity-40 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    {savingQuestion ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {editingQuestion.id ? 'Guardar Cambios' : 'Crear Pregunta'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PerformanceTab;
