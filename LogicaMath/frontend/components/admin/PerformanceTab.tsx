import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, User, Shield, Check, Unlock, RotateCcw, 
  AlertTriangle, ChevronDown, ChevronUp, Loader2,
  CheckCircle2, CircleDot, Circle, Layers
} from 'lucide-react';
import { 
  searchAlumnos, getAlumnoProgress, overrideAlumnoProgress, overrideAlumnoProgressBulk,
  AlumnoSearchInfo, getAdminAlumnoInsights
} from '../../services/storageService';
import { PHASE_MAPS, LevelMap } from './phaseMaps';

// ─── Helper: compute aggregate status from a list of level records ─────────────
type ProgressState = 'APROBADO' | 'EN_PROGRESO' | 'BLOQUEADO';

const normalizeState = (raw: string | undefined | null): ProgressState => {
  if (!raw) return 'BLOQUEADO';
  const upper = raw.toUpperCase().replace(' ', '_');
  if (upper === 'APROBADO') return 'APROBADO';
  if (upper === 'EN_PROGRESO') return 'EN_PROGRESO';
  return 'BLOQUEADO';
};

function computeAggregateStatus(levels: LevelMap[], alumnoProgress: any[]): ProgressState {
  if (levels.length === 0) return 'BLOQUEADO';
  const states = levels.map((lvl) => {
    const prog = alumnoProgress.find(
      (p) => p.fase_id === 0 && p.seccion === lvl.seccion && p.operacion === lvl.operacion
    );
    return prog ? normalizeState(prog.estado) : 'BLOQUEADO';
  });
  if (states.every((s) => s === 'APROBADO')) return 'APROBADO';
  if (states.every((s) => s === 'BLOQUEADO')) return 'BLOQUEADO';
  return 'EN_PROGRESO';
}

function computeAggregateStatusForPhase(faseId: number, levels: LevelMap[], alumnoProgress: any[]): ProgressState {
  if (levels.length === 0) return 'BLOQUEADO';
  const states = levels.map((lvl) => {
    const prog = alumnoProgress.find(
      (p) => p.fase_id === faseId && p.seccion === lvl.seccion && p.operacion === lvl.operacion
    );
    return prog ? normalizeState(prog.estado) : 'BLOQUEADO';
  });
  if (states.every((s) => s === 'APROBADO')) return 'APROBADO';
  if (states.every((s) => s === 'BLOQUEADO')) return 'BLOQUEADO';
  return 'EN_PROGRESO';
}

// ─── Small Status Badge ────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'xs' }> = ({ status, size = 'xs' }) => {
  const normalized = normalizeState(status);
  const configs = {
    APROBADO: { icon: CheckCircle2, text: 'APROBADO', cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    EN_PROGRESO: { icon: CircleDot, text: 'EN PROGRESO', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    BLOQUEADO: { icon: Circle, text: 'BLOQUEADO', cls: 'bg-white/80 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/5' },
  };
  const config = configs[normalized] || configs.BLOQUEADO;
  const { icon: Icon, text, cls } = config;
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[10px]';
  return (
    <span className={`${textSize} font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cls}`}>
      <Icon size={size === 'sm' ? 11 : 9} />
      {text}
    </span>
  );
};

// ─── Bulk Action Buttons ───────────────────────────────────────────────────────
interface BulkActionButtonsProps {
  aggregateStatus: ProgressState;
  loading: boolean;
  onApprove: () => void;
  onUnlock: () => void;
  onLock: () => void;
}

const BulkActionButtons: React.FC<BulkActionButtonsProps> = ({
  aggregateStatus, loading, onApprove, onUnlock, onLock
}) => {
  if (loading) return <Loader2 size={14} className="animate-spin text-blue-400" />;
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {aggregateStatus === 'BLOQUEADO' && (
        <button
          onClick={onUnlock}
          title="Liberar todo"
          className="px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-[10px] font-black text-blue-400 hover:text-slate-900 dark:text-white transition-all flex items-center gap-1 cursor-pointer"
        >
          <Unlock size={9} /> Liberar
        </button>
      )}
      {aggregateStatus !== 'APROBADO' && (
        <button
          onClick={onApprove}
          title="Aprobar todo"
          className="px-2 py-1 rounded-lg bg-green-600/20 hover:bg-green-600 border border-green-500/30 text-[10px] font-black text-green-400 hover:text-slate-900 dark:text-white transition-all flex items-center gap-1 cursor-pointer"
        >
          <Check size={9} /> Aprobar
        </button>
      )}
      {aggregateStatus !== 'BLOQUEADO' && (
        <button
          onClick={onLock}
          title="Restablecer todo"
          className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={9} /> Restablecer
        </button>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
interface PerformanceTabProps {
  showConfirm?: (title: string, message: string, onConfirm: () => void) => void;
  showAlert?: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ showConfirm, showAlert }) => {
  // Search & Alumnos states
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [alumnos, setAlumnos] = useState<AlumnoSearchInfo[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<AlumnoSearchInfo | null>(null);
  
  // Progress states
  const [alumnoProgress, setAlumnoProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [expandedFases, setExpandedFases] = useState<Record<number, boolean>>(() => {
    const defaults: Record<number, boolean> = {};
    PHASE_MAPS.forEach(p => defaults[p.id] = true);
    return defaults;
  });
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Action tracking: "level-{faseId}-{seccion}-{op}" | "module-{faseId}-{modId}" | "fase-{faseId}"
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // AI Modal States
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

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
    setAiReport(null); // Reset AI report when selecting new student
    fetchProgress(alumno.alumno_id);
    // Default: expand all modules
    const defaults: Record<string, boolean> = {};
    PHASE_MAPS.forEach((phase) =>
      phase.modules.forEach((mod) => { defaults[`${phase.id}-${mod.id}`] = true; })
    );
    setExpandedModules(defaults);
  };

  const handleFetchAIInsights = async () => {
    if (!selectedAlumno) return;
    setLoadingAI(true);
    setShowAIModal(true);
    try {
      const report = await getAdminAlumnoInsights(selectedAlumno.alumno_id);
      setAiReport(report);
    } catch (e) {
      console.error(e);
      setAiReport("Ocurrió un error al obtener el informe de IA.");
    } finally {
      setLoadingAI(false);
    }
  };

  // ── Single-level override ──────────────────────────────────────────────────
  const handleApplyOverride = async (
    faseId: number, seccion: number, operacion: string,
    action: 'approve' | 'unlock' | 'lock'
  ) => {
    if (!selectedAlumno) return;
    const actionKey = `level-${faseId}-${seccion}-${operacion}`;
    setActionInProgress(actionKey);
    try {
      await overrideAlumnoProgress(selectedAlumno.alumno_id, { fase_id: faseId, seccion, operacion, action });
      await fetchProgress(selectedAlumno.alumno_id);
    } catch (e) {
      console.error(e);
      if (showAlert) {
        showAlert('Error', 'Error al aplicar la acción sobre el nivel.', 'error');
      } else {
        alert('Error al aplicar la acción.');
      }
    } finally {
      setActionInProgress(null);
    }
  };

  // ── Module-level bulk override ─────────────────────────────────────────────
  const handleModuleBulk = async (
    faseId: number, modId: number, levels: LevelMap[],
    action: 'approve' | 'unlock' | 'lock'
  ) => {
    if (!selectedAlumno) return;
    const actionKey = `module-${faseId}-${modId}`;
    setActionInProgress(actionKey);
    try {
      await overrideAlumnoProgressBulk(selectedAlumno.alumno_id, {
        items: levels.map((lvl) => ({ fase_id: faseId, seccion: lvl.seccion, operacion: lvl.operacion })),
        action
      });
      await fetchProgress(selectedAlumno.alumno_id);
    } catch (e) {
      console.error(e);
      if (showAlert) {
        showAlert('Error', 'Error al aplicar la acción en bloque sobre el módulo.', 'error');
      } else {
        alert('Error al aplicar la acción en bloque.');
      }
    } finally {
      setActionInProgress(null);
    }
  };

  // ── Phase-level bulk override ──────────────────────────────────────────────
  const handleFaseBulk = async (
    faseId: number, allLevels: LevelMap[],
    action: 'approve' | 'unlock' | 'lock'
  ) => {
    if (!selectedAlumno) return;
    const actionKey = `fase-${faseId}`;
    setActionInProgress(actionKey);
    try {
      await overrideAlumnoProgressBulk(selectedAlumno.alumno_id, {
        items: allLevels.map((lvl) => ({ fase_id: faseId, seccion: lvl.seccion, operacion: lvl.operacion })),
        action
      });
      await fetchProgress(selectedAlumno.alumno_id);
    } catch (e) {
      console.error(e);
      if (showAlert) {
        showAlert('Error', 'Error al aplicar la acción masiva sobre la fase.', 'error');
      } else {
        alert('Error al aplicar la acción de fase.');
      }
    } finally {
      setActionInProgress(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-6 text-slate-900 dark:text-white select-none">
      
      {/* Top Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 rounded-[2.2rem] shadow-2xl">
        <div className="w-full">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 rounded-2xl border border-red-500/30">
              <Shield className="text-red-400" size={24} />
            </div>
            Rendimiento Estudiantil Avanzado
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Busca un alumno para gestionar su avance. Usa los controles de Fase y Módulo para acciones masivas.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Student search */}
        <div className="lg:col-span-1 bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-5 rounded-[2.2rem] shadow-2xl flex flex-col gap-4">
          <h3 className="text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-2">Buscador de Alumnos</h3>
          
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-base font-bold placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
            {loadingSearch && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="text-blue-500 animate-spin" size={24} />
              </div>
            )}
            {!loadingSearch && alumnos.length === 0 && searchQuery.trim() !== '' && (
              <p className="text-sm text-slate-500 text-center py-10">No se encontraron alumnos.</p>
            )}
            {!loadingSearch && alumnos.length === 0 && searchQuery.trim() === '' && (
              <p className="text-sm text-slate-500 text-center py-10">Escribe en el buscador para encontrar un alumno.</p>
            )}
            {alumnos.map((a) => {
              const isSelected = selectedAlumno?.id === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => handleSelectAlumno(a)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/20 text-slate-900 dark:text-white border-blue-500/40 shadow-inner' 
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-black">{a.alumno_nombre}</span>
                  <span className="text-xs text-slate-500 font-bold">{a.email}</span>
                  <span className="text-[10px] bg-white/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/5 self-start mt-1 font-bold">
                    Fase Actual: {a.fase_actual_id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed progress */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {!selectedAlumno ? (
            <div className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-12 rounded-[2.2rem] shadow-2xl flex flex-col items-center justify-center text-center min-h-[40vh]">
              <User size={48} className="text-slate-600 mb-4" />
              <h4 className="text-base font-black text-slate-600 dark:text-slate-300">Ningún Alumno Seleccionado</h4>
              <p className="text-sm text-slate-500 max-w-xs mt-1">
                Selecciona un alumno de la lista de la izquierda para ver su rendimiento académico detallado y gestionar sus permisos de fase.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.2rem] shadow-2xl flex flex-col gap-6">
              
              {/* Student profile card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                    <User className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">{selectedAlumno.alumno_nombre}</h4>
                    <p className="text-sm text-slate-500 font-bold">{selectedAlumno.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="glass-panel border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Fase Actual</span>
                    <span className="text-base font-black text-blue-400">Fase {selectedAlumno.fase_actual_id}</span>
                  </div>
                  <div className="glass-panel border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estado</span>
                    <span className="text-base font-black text-green-400">{selectedAlumno.estado}</span>
                  </div>
                  <button
                    onClick={handleFetchAIInsights}
                    className="ml-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <User size={14} /> Consultar IA
                  </button>
                </div>
              </div>

              {/* Progress Drilldown */}
              <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-white/5 pt-4">
                <h4 className="text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Progreso y Control de Maestría</h4>

                {loadingProgress ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="text-blue-500 animate-spin" size={32} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {PHASE_MAPS.map((phase) => {
                      const isExpanded = expandedFases[phase.id];
                      const allFaseLevels = phase.modules.flatMap((m) => m.levels);
                      const faseStatus = computeAggregateStatusForPhase(phase.id, allFaseLevels, alumnoProgress);
                      const faseBulkKey = `fase-${phase.id}`;
                      const faseBulkLoading = actionInProgress === faseBulkKey;

                      return (
                        <div key={phase.id} className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/20 overflow-hidden">

                          {/* Phase header */}
                          <div
                            className="flex justify-between items-center p-4 glass-panel cursor-pointer border-b border-slate-200 dark:border-white/5 hover:glass-panel/60 transition-colors"
                          >
                            {/* Left: expand toggle + name + status */}
                            <div
                              className="flex items-center gap-3 flex-1 min-w-0"
                              onClick={() => setExpandedFases(prev => ({ ...prev, [phase.id]: !prev[phase.id] }))}
                            >
                              {isExpanded ? <ChevronUp size={16} className="text-slate-500 dark:text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />}
                              <Layers size={14} className="text-slate-500 shrink-0" />
                              <span className="text-sm font-black text-slate-900 dark:text-white truncate">{phase.name}</span>
                              <StatusBadge status={faseStatus} size="xs" />
                            </div>

                            {/* Right: bulk action buttons */}
                            <BulkActionButtons
                              aggregateStatus={faseStatus}
                              loading={faseBulkLoading}
                              onApprove={() => handleFaseBulk(phase.id, allFaseLevels, 'approve')}
                              onUnlock={() => handleFaseBulk(phase.id, allFaseLevels, 'unlock')}
                              onLock={() => handleFaseBulk(phase.id, allFaseLevels, 'lock')}
                            />
                          </div>

                          {isExpanded && (
                            <div className="p-4 flex flex-col gap-4">
                              {phase.modules.map((mod) => {
                                const modKey = `${phase.id}-${mod.id}`;
                                const isModExpanded = expandedModules[modKey] ?? true;
                                const modStatus = computeAggregateStatusForPhase(phase.id, mod.levels, alumnoProgress);
                                const moduleBulkKey = `module-${phase.id}-${mod.id}`;
                                const moduleBulkLoading = actionInProgress === moduleBulkKey;

                                return (
                                  <div key={mod.id} className="bg-white/80 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                                    
                                    {/* Module header */}
                                    <div className="flex items-center justify-between p-3 glass-panel/30 border-b border-slate-200 dark:border-white/5 hover:glass-panel/50 transition-colors cursor-pointer">
                                      <div
                                        className="flex items-center gap-2 flex-1 min-w-0"
                                        onClick={() => setExpandedModules(prev => ({ ...prev, [modKey]: !prev[modKey] }))}
                                      >
                                        {isModExpanded ? <ChevronUp size={13} className="text-slate-500 shrink-0" /> : <ChevronDown size={13} className="text-slate-500 shrink-0" />}
                                        <h5 className="text-xs font-black text-slate-600 dark:text-slate-300 truncate">{mod.name}</h5>
                                        <StatusBadge status={modStatus} size="xs" />
                                      </div>
                                      <div className="ml-2 shrink-0">
                                        <BulkActionButtons
                                          aggregateStatus={modStatus}
                                          loading={moduleBulkLoading}
                                          onApprove={() => handleModuleBulk(phase.id, mod.id, mod.levels, 'approve')}
                                          onUnlock={() => handleModuleBulk(phase.id, mod.id, mod.levels, 'unlock')}
                                          onLock={() => handleModuleBulk(phase.id, mod.id, mod.levels, 'lock')}
                                        />
                                      </div>
                                    </div>

                                    {/* Individual levels */}
                                    {isModExpanded && (
                                      <div className="p-3 flex flex-col gap-2">
                                        {mod.levels.map((lvl) => {
                                          const prog = alumnoProgress.find(
                                            (p) => p.fase_id === phase.id && p.seccion === lvl.seccion && p.operacion === lvl.operacion
                                          );
                                          const state = normalizeState(prog ? prog.estado : 'BLOQUEADO');
                                          const pct = prog ? prog.porcentaje_actual : 0;
                                          const isApprovedByAdmin = prog ? prog.aprobado_por_admin : false;
                                          const actionKey = `level-${phase.id}-${lvl.seccion}-${lvl.operacion}`;
                                          const loadingThis = actionInProgress === actionKey;

                                          return (
                                            <div
                                              key={lvl.id}
                                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 glass-panel/20 border border-slate-200 dark:border-white/5 rounded-xl"
                                            >
                                              {/* Level metadata */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <span className={`text-xs font-black ${lvl.isChallenge ? 'text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {lvl.isChallenge ? 'Desafío' : 'Nivel'} {lvl.id}: {lvl.name}
                                                  </span>
                                                  {isApprovedByAdmin && (
                                                    <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-black flex items-center gap-1">
                                                      <AlertTriangle size={10} /> Aprobado por Admin
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <StatusBadge status={state} />
                                                  {state !== 'BLOQUEADO' && (
                                                    <span className="text-xs text-slate-500 font-bold">{pct}% Aciertos</span>
                                                  )}
                                                  {prog && prog.ultimos_errores && prog.ultimos_errores.length > 0 && (
                                                    <div className="flex gap-1 ml-2">
                                                      {prog.ultimos_errores.map((err: any, idx: number) => (
                                                        <span key={idx} className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                                          <AlertTriangle size={8} /> {err.tipo} ({err.count})
                                                        </span>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Individual controls */}
                                              <div className="flex items-center gap-1.5 self-end sm:self-center">
                                                {loadingThis ? (
                                                  <Loader2 size={16} className="animate-spin text-blue-400 mr-4" />
                                                ) : (
                                                  <>
                                                    {state === 'BLOQUEADO' && (
                                                      <button
                                                        onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'unlock')}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-[10px] font-black text-blue-400 hover:text-slate-900 dark:text-white transition-all flex items-center gap-1 cursor-pointer"
                                                      >
                                                        <Unlock size={10} /> Liberar
                                                      </button>
                                                    )}
                                                    {state !== 'APROBADO' && (
                                                      <button
                                                        onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'approve')}
                                                        className="px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600 border border-green-500/30 text-[10px] font-black text-green-400 hover:text-slate-900 dark:text-white transition-all flex items-center gap-1 cursor-pointer"
                                                      >
                                                        <Check size={10} /> Aprobar (90%)
                                                      </button>
                                                    )}
                                                    {state !== 'BLOQUEADO' && (
                                                      <button
                                                        onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'lock')}
                                                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all flex items-center gap-1 cursor-pointer"
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
                                    )}

                                  </div>
                                );
                              })}
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

      </div>

      {/* AI Insights Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-transparent bg-clip-text">Tutor IA: Análisis de Rendimiento</span>
              </h3>
              <button 
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="w-4 h-4 relative">
                  <div className="absolute inset-0 w-full h-0.5 bg-slate-500 rotate-45 top-1/2 -translate-y-1/2 rounded" />
                  <div className="absolute inset-0 w-full h-0.5 bg-slate-500 -rotate-45 top-1/2 -translate-y-1/2 rounded" />
                </div>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingAI ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="text-purple-500 animate-spin" size={40} />
                  <p className="text-slate-500 font-bold text-sm">El Tutor IA está analizando los registros de {selectedAlumno?.alumno_nombre}...</p>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {aiReport}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default PerformanceTab;
