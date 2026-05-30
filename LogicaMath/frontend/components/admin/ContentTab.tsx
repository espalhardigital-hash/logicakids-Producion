import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit, Save, FileText, Loader2, X, 
  Settings, ToggleRight, ToggleLeft, Shield, BookOpen,
  Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Award, AlertTriangle, Check
} from 'lucide-react';
import { 
  deletePregunta, createPregunta, updatePregunta,
  saveNivelTeoria 
} from '../../services/storageService';
import { PHASE_MAPS } from './phaseMaps';
import { useAdminContent } from './useAdminContent';

const ContentTab: React.FC = () => {
  // Navigation / Tabs State
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'questions'>('theory');

  // Hook for Content Logic
  const {
    mgrFaseId, setMgrFaseId,
    mgrModuloId, setMgrModuloId,
    mgrLevelId, setMgrLevelId,
    questions, setQuestions,
    theory, setTheory,
    loading: loadingQuestions // shared loading state
  } = useAdminContent();

  const loadingTheory = loadingQuestions;
  const [savingTheory, setSavingTheory] = useState(false);

  // Collapse sections states
  const [expandTheoryCore, setExpandTheoryCore] = useState(true);
  const [expandGlosario, setExpandGlosario] = useState(true);
  const [expandEjemplos, setExpandEjemplos] = useState(true);

  // Toast & Confirm Dialog State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Question Pagination & Filter State
  const [questionsPerPage, setQuestionsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [questionSearchQuery, setQuestionSearchQuery] = useState<string>('');

  // Modal / Form State
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Auto-clear Toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ show: true, title, message, onConfirm });
  };

  // Load handled by useAdminContent hook

  // Reset pagination & search filters when selector or items per page change
  useEffect(() => {
    setCurrentPage(1);
    setQuestionSearchQuery('');
  }, [mgrFaseId, mgrModuloId, mgrLevelId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [questionsPerPage]);

  // Save Theory Changes
  const handleSaveTheory = async () => {
    if (!theory) return;
    setSavingTheory(true);
    try {
      await saveNivelTeoria(theory);
      showToast("¡Teoría guardada exitosamente!", "success");
    } catch (e) {
      console.error(e);
      showToast("Error al guardar la teoría.", "error");
    } finally {
      setSavingTheory(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId: number) => {
    showConfirm(
      "Eliminar Pregunta",
      "¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.",
      async () => {
        try {
          await deletePregunta(qId);
          setQuestions(prev => prev.filter(q => q.id !== qId));
          showToast("Pregunta eliminada exitosamente.", "success");
        } catch (e) {
          console.error(e);
          showToast("Error al eliminar la pregunta.", "error");
        }
      }
    );
  };

  // Save Question Form
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
        showToast("Pregunta actualizada exitosamente.", "success");
      } else {
        // Create
        const created = await createPregunta(payload);
        setQuestions(prev => [...prev, created]);
        showToast("Pregunta creada exitosamente.", "success");
      }
      setShowQuestionModal(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
      showToast("Error al guardar la pregunta.", "error");
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

  // Filter questions by search query
  const filteredQuestions = questions.filter(q => 
    q.enunciado.toLowerCase().includes(questionSearchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const paginatedQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  // Interactive Exercises editing helpers
  const handleAddInteractive = () => {
    const newInteractives = [...(theory?.interactivos || [])];
    newInteractives.push({
      enunciado: "Nuevo Ejercicio",
      pasos: [
        { orden: 1, texto: "Paso 1 del ejercicio" }
      ],
      respuesta: "",
      feedback_acierto: "¡Excelente!",
      feedback_error: "Inténtalo de nuevo."
    });
    setTheory((prev: any) => ({ ...prev, interactivos: newInteractives }));
  };

  const handleDeleteInteractive = (idx: number) => {
    showConfirm(
      "Eliminar Ejercicio Interactivo",
      "¿Estás seguro de que deseas eliminar este ejercicio interactivo de la teoría?",
      () => {
        const newInteractives = (theory?.interactivos || []).filter((_: any, i: number) => i !== idx);
        setTheory((prev: any) => ({ ...prev, interactivos: newInteractives }));
        showToast("Ejercicio removido de la teoría.", "success");
      }
    );
  };

  const handleUpdateInteractive = (idx: number, field: string, value: any) => {
    const newInteractives = [...(theory?.interactivos || [])];
    newInteractives[idx] = {
      ...newInteractives[idx],
      [field]: value
    };
    setTheory((prev: any) => ({ ...prev, interactivos: newInteractives }));
  };

  const handleAddInteractiveStep = (intIdx: number) => {
    const newInteractives = [...(theory?.interactivos || [])];
    const steps = [...(newInteractives[intIdx].pasos || [])];
    steps.push({ orden: steps.length + 1, texto: "Siguiente paso" });
    newInteractives[intIdx] = {
      ...newInteractives[intIdx],
      pasos: steps
    };
    setTheory((prev: any) => ({ ...prev, interactivos: newInteractives }));
  };

  const handleUpdateInteractiveStepText = (intIdx: number, stepIdx: number, value: string) => {
    const newInteractives = [...(theory?.interactivos || [])];
    const steps = [...newInteractives[intIdx].pasos];
    steps[stepIdx] = {
      ...steps[stepIdx],
      texto: value
    };
    newInteractives[intIdx] = {
      ...newInteractives[intIdx],
      pasos: steps
    };
    setTheory((prev: any) => ({ ...prev, interactivos: newInteractives }));
  };

  const handleDeleteInteractiveStep = (intIdx: number, stepIdx: number) => {
    const newInteractives = [...(theory?.interactivos || [])];
    const steps = newInteractives[intIdx].pasos.filter((_: any, i: number) => i !== stepIdx)
      .map((s: any, idx: number) => ({ ...s, orden: idx + 1 }));
    newInteractives[intIdx] = {
      ...newInteractives[intIdx],
      pasos: steps
    };
    setTheory((prev: any) => ({ ...prev, interactivos: newInteractives }));
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900 dark:text-white select-none">
      
      {/* Top Header Panel */}
      <div className="flex items-center justify-between glass-card p-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-[#f3f4f6] flex items-center gap-3">
            <div className="p-2.5 bg-[#007AFF]/20 rounded-2xl border border-[#007AFF]/30">
              <BookOpen className="text-[#007AFF]" size={24} />
            </div>
            Banco de Preguntas y Teoría
          </h2>
          <p className="text-slate-500 dark:text-[#8E8E93] text-sm mt-1 font-medium">
            Administra las preguntas del plan de estudios y el material teórico de cada nivel.
          </p>
        </div>
        <div>
          <button 
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="glass-button flex items-center gap-2 text-sm"
          >
            <ToggleRight className="hidden dark:block text-blue-400" size={20} />
            <ToggleLeft className="block dark:hidden text-slate-400" size={20} />
            Tema
          </button>
</div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex border-b border-slate-200 dark:border-white/10 w-full gap-2 md:gap-4 glass-panel p-2 rounded-t-[1.5rem] border-t border-x">
        <button
          onClick={() => setActiveSubTab('theory')}
          className={`pb-3 pt-2 px-6 font-black text-base relative transition-all cursor-pointer ${
            activeSubTab === 'theory' 
              ? 'text-slate-900 dark:text-white font-extrabold' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/5 rounded-xl'
          }`}
        >
          {activeSubTab === 'theory' && (
            <motion.div 
              layoutId="activeSubTab-pill" 
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] rounded-full"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}
          <span className="flex items-center gap-2">
            <FileText size={16} />
            Contenido Teórico
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('questions')}
          className={`pb-3 pt-2 px-6 font-black text-base relative transition-all cursor-pointer ${
            activeSubTab === 'questions' 
              ? 'text-slate-900 dark:text-white font-extrabold' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/5 rounded-xl'
          }`}
        >
          {activeSubTab === 'questions' && (
            <motion.div 
              layoutId="activeSubTab-pill" 
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] rounded-full"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}
          <span className="flex items-center gap-2">
            <Settings size={16} />
            Banco de Preguntas
          </span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Selectors */}
        <div className="lg:col-span-1 glass-card p-5 flex flex-col gap-5">
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#8E8E93] uppercase tracking-wider px-2">Selector de Nivel</h3>
          
          {/* Phase selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-2">Fase</label>
            <select
              value={mgrFaseId}
              onChange={(e) => {
                const fid = parseInt(e.target.value);
                setMgrFaseId(fid);
                const phase = PHASE_MAPS.find(p => p.id === fid);
                if (phase?.modules && phase.modules.length > 0) {
                  setMgrModuloId(phase.modules[0].id);
                  setMgrLevelId(phase.modules[0].levels[0]?.id || 1);
                } else if (phase?.levels && phase.levels.length > 0) {
                  setMgrModuloId(0);
                  setMgrLevelId(phase.levels[0].id);
                } else {
                  setMgrModuloId(1);
                  setMgrLevelId(1);
                }
              }}
              className="bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {PHASE_MAPS.map(p => (
                <option key={p.id} value={p.id}>{p.name.split(':')[0]}</option>
              ))}
            </select>
          </div>

          {/* Module selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-2">Módulo</label>
            <select
              value={mgrModuloId}
              onChange={(e) => {
                const mid = parseInt(e.target.value);
                setMgrModuloId(mid);
                setMgrLevelId(1);
              }}
              className="bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {(PHASE_MAPS.find(p => p.id === mgrFaseId)?.modules || []).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Level selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-2">Nivel / Desafío</label>
            <select
              value={mgrLevelId}
              onChange={(e) => setMgrLevelId(parseInt(e.target.value))}
              className="bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {PHASE_MAPS.find(p => p.id === mgrFaseId)?.modules.find(m => m.id === mgrModuloId)?.levels.map(l => (
                <option key={l.id} value={l.id}>{l.isChallenge ? 'Desafío' : 'Nivel'} {l.id}: {l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs Content */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* TAB A: THEORY / CONCEPTS EDITOR */}
            {activeSubTab === 'theory' && (
              <motion.div
                key="theory-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {/* Global theory save action panel */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel border border-white/5 p-4 rounded-2xl">
                  <span className="text-sm font-black text-slate-600 dark:text-slate-300">
                    Estás editando la teoría de: <span className="text-purple-400">{PHASE_MAPS.find(p => p.id === mgrFaseId)?.name.split(':')[0]} / {PHASE_MAPS.find(p => p.id === mgrFaseId)?.modules.find(m => m.id === mgrModuloId)?.levels.find(l => l.id === mgrLevelId)?.name}</span>
                  </span>
                  <button
                    onClick={handleSaveTheory}
                    disabled={loadingTheory || savingTheory}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-sm font-black flex items-center gap-1.5 shadow-md shadow-purple-900/10 active:scale-95 transition-all cursor-pointer self-end sm:self-center"
                  >
                    {savingTheory ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Guardar Cambios de Teoría
                  </button>
                </div>

                {loadingTheory ? (
                  <div className="bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.2rem] p-10 flex justify-center shadow-2xl">
                    <Loader2 className="animate-spin text-purple-400" size={32} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    
                    {/* SECTION 1: CORE THEORY FIELDS (Collapsible) */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                      <div 
                        onClick={() => setExpandTheoryCore(!expandTheoryCore)}
                        className="flex justify-between items-center cursor-pointer select-none group"
                      >
                        <h4 className="text-base font-black text-slate-600 dark:text-slate-300 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                          <FileText size={18} className="text-purple-400" />
                          1. Información de Teoría Principal
                        </h4>
                        {expandTheoryCore ? <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />}
                      </div>

                      <AnimatePresence initial={false}>
                        {expandTheoryCore && (
                          <motion.div
                            key="theory-core-body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left fields */}
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Título de Teoría</label>
                                    <input
                                      type="text"
                                      value={theory?.titulo || ""}
                                      onChange={(e) => setTheory((prev: any) => ({ ...prev, titulo: e.target.value }))}
                                      className="bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                                    />
                                  </div>
                                  
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Texto Descubrimiento</label>
                                    <textarea
                                      rows={4}
                                      value={theory?.texto_descubrimiento || ""}
                                      onChange={(e) => setTheory((prev: any) => ({ ...prev, texto_descubrimiento: e.target.value }))}
                                      className="bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none"
                                    />
                                  </div>
                                </div>

                                {/* Right fields */}
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tip Pedagógico / Advertencia</label>
                                    <textarea
                                      rows={7}
                                      value={theory?.advertencia || ""}
                                      onChange={(e) => setTheory((prev: any) => ({ ...prev, advertencia: e.target.value }))}
                                      className="bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* SECTION 2: GLOSSARY / DICTIONARY (Collapsible) */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                      <div 
                        onClick={() => setExpandGlosario(!expandGlosario)}
                        className="flex justify-between items-center cursor-pointer select-none group"
                      >
                        <h4 className="text-base font-black text-slate-600 dark:text-slate-300 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                          <Settings size={18} className="text-purple-400" />
                          2. Glosario / Vocabulario del Nivel
                        </h4>
                        <div className="flex items-center gap-3">
                          {expandGlosario && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newDict = { ...(theory?.diccionario || {}) };
                                let suffix = 1;
                                while (newDict[`Nuevo Término ${suffix}`]) suffix++;
                                newDict[`Nuevo Término ${suffix}`] = "Definición del término.";
                                setTheory((prev: any) => ({ ...prev, diccionario: newDict }));
                              }}
                              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-slate-900 dark:text-white rounded-lg border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Plus size={12} /> Agregar Término
                            </button>
                          )}
                          {expandGlosario ? <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />}
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {expandGlosario && (
                          <motion.div
                            key="theory-glosario-body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(theory?.diccionario || {}).map(([term, def]: [string, any], dIdx) => (
                                  <div key={dIdx} className="flex gap-2 bg-white/80 dark:bg-slate-950/20 border border-white/5 p-3 rounded-xl items-start">
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
                                        className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs font-black text-purple-300 focus:outline-none focus:border-purple-500/50"
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
                                        className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newDict = { ...(theory.diccionario || {}) };
                                        delete newDict[term];
                                        setTheory((prev: any) => ({ ...prev, diccionario: newDict }));
                                      }}
                                      className="p-2 bg-red-500/10 hover:bg-red-500 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg transition-colors cursor-pointer"
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* SECTION 3: EXAMPLES & INTERACTIVE EXERCISES (Collapsible) */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                      <div 
                        onClick={() => setExpandEjemplos(!expandEjemplos)}
                        className="flex justify-between items-center cursor-pointer select-none group"
                      >
                        <h4 className="text-base font-black text-slate-600 dark:text-slate-300 group-hover:text-purple-400 transition-colors flex items-center gap-2">
                          <Award size={18} className="text-purple-400" />
                          3. Secuencia Didáctica (Ejemplos y Ejercicios)
                        </h4>
                        {expandEjemplos ? <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />}
                      </div>

                      <AnimatePresence initial={false}>
                        {expandEjemplos && (
                          <motion.div
                            key="theory-ejemplos-body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-white/5 flex flex-col gap-6">
                              
                              {/* SUB-SECTION 3A: EXAMPLES (Guided explanation) */}
                              <div className="flex flex-col gap-4 glass-panel/20 border border-white/5 p-4 rounded-3xl">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <h5 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    3A. Ejemplos del Nivel (Explicativos / Guiados)
                                  </h5>
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
                                    className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-slate-900 dark:text-white rounded-lg border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Plus size={10} /> Agregar Ejemplo
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(theory?.ejemplos || []).map((ex: any, eIdx: number) => (
                                    <div key={eIdx} className="bg-white/80 dark:bg-slate-950/20 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 relative">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-purple-400">Ejemplo #{eIdx + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newExamples = (theory.ejemplos || []).filter((_: any, i: number) => i !== eIdx);
                                            setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                          }}
                                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>

                                      <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Enunciado del Ejemplo</label>
                                        <input
                                          type="text"
                                          value={ex.enunciado || ""}
                                          onChange={(e) => {
                                            const newExamples = [...theory.ejemplos];
                                            newExamples[eIdx] = { ...ex, enunciado: e.target.value };
                                            setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                          }}
                                          className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                      </div>

                                      <div className="flex flex-col gap-2 bg-white/80 dark:bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pasos del Ejemplo</label>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newExamples = [...theory.ejemplos];
                                              const steps = [...(ex.pasos || [])];
                                              steps.push({ orden: steps.length + 1, texto: "Siguiente paso" });
                                              newExamples[eIdx] = { ...ex, pasos: steps };
                                              setTheory((prev: any) => ({ ...prev, ejemplos: newExamples }));
                                            }}
                                            className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500 hover:text-slate-900 dark:text-white text-purple-400 rounded text-[9px] font-bold flex items-center gap-0.5 border border-purple-500/20 cursor-pointer"
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
                                                className="flex-1 bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
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
                                                className="p-1.5 hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
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
                                                className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
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

                              {/* SUB-SECTION 3B: INTERACTIVES (Exercise sequence student must answer) */}
                              <div className="flex flex-col gap-4 glass-panel/20 border border-white/5 p-4 rounded-3xl">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <h5 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    3B. Ejercicios Interactivos del Alumno (Secuencia de Evocación)
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={handleAddInteractive}
                                    className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-slate-900 dark:text-white rounded-lg border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Plus size={10} /> Agregar Ejercicio
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(theory?.interactivos || []).map((ex: any, iIdx: number) => (
                                    <div key={iIdx} className="bg-white/80 dark:bg-slate-950/20 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 relative">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-purple-400">Ejercicio Interactivo #{iIdx + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteInteractive(iIdx)}
                                          className="p-1.5 bg-red-500/10 hover:bg-red-500 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>

                                      <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Enunciado del Ejercicio</label>
                                        <input
                                          type="text"
                                          value={ex.enunciado || ""}
                                          onChange={(e) => handleUpdateInteractive(iIdx, "enunciado", e.target.value)}
                                          className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                      </div>

                                      {/* Correct response value */}
                                      <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-green-400 uppercase">Respuesta Correcta Esperada</label>
                                        <input
                                          type="text"
                                          placeholder="Ej: 16"
                                          value={ex.respuesta || ""}
                                          onChange={(e) => handleUpdateInteractive(iIdx, "respuesta", e.target.value)}
                                          className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                                        />
                                      </div>

                                      {/* Steps */}
                                      <div className="flex flex-col gap-2 bg-white/80 dark:bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pasos Resolutivos</label>
                                          <button
                                            type="button"
                                            onClick={() => handleAddInteractiveStep(iIdx)}
                                            className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500 hover:text-slate-900 dark:text-white text-purple-400 rounded text-[9px] font-bold flex items-center gap-0.5 border border-purple-500/20 cursor-pointer"
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
                                                onChange={(e) => handleUpdateInteractiveStepText(iIdx, sIdx, e.target.value)}
                                                className="flex-1 bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteInteractiveStep(iIdx, sIdx)}
                                                className="p-1.5 hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                              >
                                                <X size={10} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Acierto & Error Feedback */}
                                      <div className="flex flex-col gap-2 bg-white/80 dark:bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Feedback al Acertar</label>
                                          <input
                                            type="text"
                                            placeholder="Ej: ¡Excelente! 8 x 2 = 16"
                                            value={ex.feedback_acierto || ""}
                                            onChange={(e) => handleUpdateInteractive(iIdx, "feedback_acierto", e.target.value)}
                                            className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Feedback al Fallar</label>
                                          <input
                                            type="text"
                                            placeholder="Ej: 'El doble' es multiplicar por 2"
                                            value={ex.feedback_error || ""}
                                            onChange={(e) => handleUpdateInteractive(iIdx, "feedback_error", e.target.value)}
                                            className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {(theory?.interactivos || []).length === 0 && (
                                    <p className="text-xs text-slate-500 italic py-2 md:col-span-2">No hay ejercicios interactivos definidos en la teoría de este nivel.</p>
                                  )}
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* TAB B: QUESTIONS LIST & PAGINATION / SEARCH */}
            {activeSubTab === 'questions' && (
              <motion.div
                key="questions-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="glass-card p-6 flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/5 pb-4">
                    <h4 className="text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Settings size={16} className="text-blue-400" /> Banco de Preguntas del Nivel
                    </h4>
                    
                    <button
                      onClick={openNewQuestionModal}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-black flex items-center gap-1.5 shadow-md shadow-blue-900/10 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      Agregar Pregunta
                    </button>
                  </div>

                  {/* Filter and Pagination controls bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 dark:bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    {/* Search input */}
                    <div className="relative w-full sm:w-80">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Buscar pregunta por enunciado..."
                        value={questionSearchQuery}
                        onChange={(e) => setQuestionSearchQuery(e.target.value)}
                        className="w-full bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>

                    {/* Questions per page dropdown */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Mostrar:</label>
                      <select
                        value={questionsPerPage}
                        onChange={(e) => setQuestionsPerPage(parseInt(e.target.value))}
                        className="bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                      >
                        <option value={10}>10 preguntas</option>
                        <option value={20}>20 preguntas</option>
                        <option value={50}>50 preguntas</option>
                      </select>
                    </div>
                  </div>

                  {loadingQuestions ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="animate-spin text-blue-400" size={32} />
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full flex flex-col gap-4">
                      {filteredQuestions.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-10">
                          {questionSearchQuery.trim() !== "" ? "No se encontraron preguntas que coincidan con la búsqueda." : "No hay preguntas registradas en este nivel."}
                        </p>
                      ) : (
                        <>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                                <th className="py-3 px-4">Pregunta / Enunciado</th>
                                <th className="py-3 px-4">Respuesta Correcta</th>
                                <th className="py-3 px-4">Tipo</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedQuestions.map((q) => (
                                <tr key={q.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                                  <td className="py-4 px-4 font-semibold max-w-md truncate">{q.enunciado}</td>
                                  <td className="py-4 px-4 font-bold text-green-400">{q.respuesta_correcta}</td>
                                  <td className="py-4 px-4">
                                    <span className="text-[10px] bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                      {q.tipo_pregunta === 'multiple_opcion' ? 'Opción Múltiple' : 'Numérica'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEditQuestionModal(q)}
                                      className="p-2 hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(q.id)}
                                      className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Pagination Controls */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4 mt-2">
                            <div className="text-xs font-bold text-slate-500">
                              Mostrando {indexOfFirstQuestion + 1} - {Math.min(indexOfLastQuestion, filteredQuestions.length)} de {filteredQuestions.length} preguntas
                            </div>
                            
                            {totalPages > 1 && (
                              <div className="flex items-center gap-1.5">
                                {/* Previous button */}
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className="p-2 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                                >
                                  <ChevronLeft size={14} />
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                  const isActive = currentPage === page;
                                  return (
                                    <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                        isActive 
                                          ? 'bg-blue-600 text-slate-900 dark:text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]' 
                                          : 'bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/10'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  );
                                })}

                                {/* Next button */}
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  className="p-2 rounded-lg bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QUESTION EDIT/CREATE FORM MODAL */}
      <AnimatePresence>
        {showQuestionModal && editingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-slate-200 dark:border-white/10 w-full max-w-xl rounded-[2.2rem] p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-slate-900 dark:text-white select-none"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h4 className="text-xl font-black flex items-center gap-2">
                  <Shield size={20} className="text-blue-400" />
                  {editingQuestion.id ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </h4>
                <button 
                  onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="flex flex-col gap-5">
                
                {/* Enunciado */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Enunciado / Pregunta</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.enunciado}
                    onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, enunciado: e.target.value }))}
                    className="w-full bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Respuesta Correcta */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Respuesta Correcta</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.respuesta_correcta}
                    onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, respuesta_correcta: e.target.value }))}
                    className="w-full bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Tipo de pregunta & Requiere subrayado */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Tipo de Interfaz</label>
                    <select
                      value={editingQuestion.tipo_pregunta}
                      onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, tipo_pregunta: e.target.value }))}
                      className="bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="multiple_opcion">Opción Múltiple</option>
                      <option value="respuesta_numerica">Respuesta Numérica</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-white/80 dark:bg-slate-950/40 border border-white/5 p-3 rounded-xl self-end h-[46px]">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Requiere Subrayado</span>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion((prev: any) => ({ ...prev, requiere_subrayado: !prev.requiere_subrayado }))}
                      className="hover:scale-105 transition-transform cursor-pointer"
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
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Alternativas del Nivel (Opción Múltiple)</label>
                    
                    {editingQuestion.alternativas.map((alt: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-2 bg-white/80 dark:bg-slate-950/20 border border-white/5 p-3 rounded-xl">
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
                            className="flex-1 bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                              alt.es_correcta 
                                ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                                : 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {alt.es_correcta ? 'Correcta' : 'Hacer Correcta'}
                          </button>
                        </div>
                        
                        {!alt.es_correcta && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8 border-t border-white/5 pt-2 mt-1">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tipo de Error</label>
                              <select
                                value={alt.tipo_error || ""}
                                onChange={(e) => {
                                  const newAlts = [...editingQuestion.alternativas];
                                  newAlts[idx] = { ...alt, tipo_error: e.target.value || null };
                                  setEditingQuestion((prev: any) => ({ ...prev, alternativas: newAlts }));
                                }}
                                className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
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
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Feedback / Retroalimentación</label>
                              <input
                                type="text"
                                placeholder="Retroalimentación específica de este error"
                                value={alt.feedback_error || ""}
                                onChange={(e) => {
                                  const newAlts = [...editingQuestion.alternativas];
                                  newAlts[idx] = { ...alt, feedback_error: e.target.value };
                                  setEditingQuestion((prev: any) => ({ ...prev, alternativas: newAlts }));
                                }}
                                className="bg-white/80 dark:bg-slate-950 border border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
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
                    className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all border border-white/5 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuestion}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-black shadow-lg shadow-blue-900/20 disabled:opacity-40 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
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

      {/* Custom Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/85 border-emerald-500/40 text-emerald-200 shadow-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                : 'bg-rose-950/85 border-rose-500/40 text-rose-200 shadow-rose-955/20 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="p-1 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <Check className="text-emerald-400" size={18} />
              </div>
            ) : (
              <div className="p-1 bg-rose-500/20 rounded-lg border border-rose-500/30">
                <X className="text-rose-400" size={18} />
              </div>
            )}
            <span className="font-extrabold text-sm tracking-wide">{toast.message}</span>
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Dialog Modal */}
      <AnimatePresence>
        {confirmDialog.show && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-slate-200 dark:border-white/10 w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col gap-6 text-slate-900 dark:text-white select-none shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-3 text-rose-400 font-black border-b border-white/5 pb-3">
                <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-500/30">
                  <AlertTriangle size={20} />
                </div>
                <h4 className="text-lg">{confirmDialog.title}</h4>
              </div>
              
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                {confirmDialog.message}
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black transition-all border border-white/5 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(prev => ({ ...prev, show: false }));
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black shadow-lg shadow-rose-900/20 active:scale-95 transition-all cursor-pointer"
                >
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ContentTab;
