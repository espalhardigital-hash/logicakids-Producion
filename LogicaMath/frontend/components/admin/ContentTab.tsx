import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit, Save, FileText, Loader2, X, 
  Settings, ToggleRight, ToggleLeft, Shield, BookOpen,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  getPreguntasByLevel, deletePregunta, createPregunta, updatePregunta,
  getNivelTeoria, saveNivelTeoria 
} from '../../services/storageService';
import { PHASE_MAPS } from './phaseMaps';

const ContentTab: React.FC = () => {
  // Navigation / Tabs State
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'questions'>('theory');

  // Selectors State
  const [mgrFaseId, setMgrFaseId] = useState<number>(2); // Default to Phase 2 to match screenshots
  const [mgrModuloId, setMgrModuloId] = useState<number>(1);
  const [mgrLevelId, setMgrLevelId] = useState<number>(1);

  // Content Data State
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [theory, setTheory] = useState<any | null>(null);
  const [loadingTheory, setLoadingTheory] = useState(false);
  const [savingTheory, setSavingTheory] = useState(false);

  // Question Pagination & Filter State
  const [questionsPerPage, setQuestionsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [questionSearchQuery, setQuestionSearchQuery] = useState<string>('');

  // Modal / Form State
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Fetch Questions and Theory
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
    loadContentManagerData(mgrFaseId, mgrModuloId, mgrLevelId);
  }, [mgrFaseId, mgrModuloId, mgrLevelId]);

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
      alert("¡Teoría guardada exitosamente!");
    } catch (e) {
      console.error(e);
      alert("Error al guardar la teoría.");
    } finally {
      setSavingTheory(false);
    }
  };

  // Delete Question
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

  return (
    <div className="w-full flex flex-col gap-6 text-white select-none">
      
      {/* Top Header Panel */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-2xl border border-blue-500/30">
              <BookOpen className="text-blue-400" size={24} />
            </div>
            Banco de Preguntas y Teoría
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Administra las preguntas del plan de estudios y el material teórico de cada nivel.
          </p>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex border-b border-white/10 w-full gap-2 md:gap-4 bg-slate-900/40 p-2 rounded-t-[1.5rem] border-t border-x">
        <button
          onClick={() => setActiveSubTab('theory')}
          className={`pb-3 pt-2 px-6 font-black text-base relative transition-all cursor-pointer ${
            activeSubTab === 'theory' 
              ? 'text-white font-extrabold' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 rounded-xl'
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
              ? 'text-white font-extrabold' 
              : 'text-slate-400 hover:text-white hover:bg-white/5 rounded-xl'
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
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.2rem] shadow-2xl flex flex-col gap-5">
          <h3 className="text-base font-black text-slate-400 uppercase tracking-widest px-2">Selector de Nivel</h3>
          
          {/* Phase selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-2">Fase</label>
            <select
              value={mgrFaseId}
              onChange={(e) => {
                const fid = parseInt(e.target.value);
                setMgrFaseId(fid);
                setMgrModuloId(1);
                setMgrLevelId(1);
              }}
              className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
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
              className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {PHASE_MAPS.find(p => p.id === mgrFaseId)?.modules.map(m => (
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
              className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              {PHASE_MAPS.find(p => p.id === mgrFaseId)?.modules.find(m => m.id === mgrModuloId)?.levels.map(l => (
                <option key={l.id} value={l.id}>{l.isChallenge ? 'Desafío' : 'Nivel'} {l.id}: {l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs Content */}
        <div className="lg:col-span-3">
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
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h4 className="text-base font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={16} className="text-purple-400" /> Contenido Teórico (Flashcards)
                    </h4>
                    <button
                      onClick={handleSaveTheory}
                      disabled={loadingTheory || savingTheory}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-sm font-black flex items-center gap-1.5 shadow-md shadow-purple-900/10 active:scale-95 transition-all cursor-pointer"
                    >
                      {savingTheory ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
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
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">Título de Teoría</label>
                            <input
                              type="text"
                              value={theory?.titulo || ""}
                              onChange={(e) => setTheory((prev: any) => ({ ...prev, titulo: e.target.value }))}
                              className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">Texto Descubrimiento</label>
                            <textarea
                              rows={3}
                              value={theory?.texto_descubrimiento || ""}
                              onChange={(e) => setTheory((prev: any) => ({ ...prev, texto_descubrimiento: e.target.value }))}
                              className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50 resize-none"
                            />
                          </div>
                        </div>

                        {/* Right fields */}
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">Tip Pedagógico / Advertencia</label>
                            <textarea
                              rows={6}
                              value={theory?.advertencia || ""}
                              onChange={(e) => setTheory((prev: any) => ({ ...prev, advertencia: e.target.value }))}
                              className="bg-slate-950/60 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50 resize-none"
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
                            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Plus size={12} /> Agregar Término
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
                                className="p-2 bg-red-500/10 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
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
                            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Plus size={12} /> Agregar Ejemplo
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
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              <div className="flex flex-col gap-1.5">
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
                                    className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-400 rounded text-[9px] font-bold flex items-center gap-0.5 border border-purple-500/20 cursor-pointer"
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
                                        className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
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
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/5 pb-4">
                    <h4 className="text-base font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
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
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    {/* Search input */}
                    <div className="relative w-full sm:w-80">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Buscar pregunta por enunciado..."
                        value={questionSearchQuery}
                        onChange={(e) => setQuestionSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold placeholder-slate-500 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>

                    {/* Questions per page dropdown */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <label className="text-xs font-bold text-slate-400">Mostrar:</label>
                      <select
                        value={questionsPerPage}
                        onChange={(e) => setQuestionsPerPage(parseInt(e.target.value))}
                        className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
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
                              <tr className="border-b border-white/10 text-xs font-black uppercase text-slate-400">
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
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                      {q.tipo_pregunta === 'multiple_opcion' ? 'Opción Múltiple' : 'Numérica'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEditQuestionModal(q)}
                                      className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(q.id)}
                                      className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
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
                                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-slate-400 transition-all cursor-pointer"
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
                                          ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]' 
                                          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
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
                                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-slate-400 transition-all cursor-pointer"
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
              className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.2rem] p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-white select-none"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h4 className="text-xl font-black flex items-center gap-2">
                  <Shield size={20} className="text-blue-400" />
                  {editingQuestion.id ? 'Editar Pregunta' : 'Nueva Pregunta'}
                </h4>
                <button 
                  onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="flex flex-col gap-5">
                
                {/* Enunciado */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Enunciado / Pregunta</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.enunciado}
                    onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, enunciado: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Respuesta Correcta */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Respuesta Correcta</label>
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
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-400 uppercase">Tipo de Interfaz</label>
                    <select
                      value={editingQuestion.tipo_pregunta}
                      onChange={(e) => setEditingQuestion((prev: any) => ({ ...prev, tipo_pregunta: e.target.value }))}
                      className="bg-slate-950 border border-white/10 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="multiple_opcion">Opción Múltiple</option>
                      <option value="respuesta_numerica">Respuesta Numérica</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950/40 border border-white/5 p-3 rounded-xl self-end h-[46px]">
                    <span className="text-xs font-black text-slate-400 uppercase">Requiere Subrayado</span>
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
                    <label className="text-xs font-black text-slate-400 uppercase">Alternativas del Nivel (Opción Múltiple)</label>
                    
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
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
                            <div className="flex flex-col gap-1.5">
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
                            <div className="flex flex-col gap-1.5">
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
                    className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-all border border-white/5 text-slate-300 cursor-pointer"
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

    </div>
  );
};

export default ContentTab;
