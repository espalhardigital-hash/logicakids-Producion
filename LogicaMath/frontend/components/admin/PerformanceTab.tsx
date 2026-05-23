import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, User, Shield, Check, Unlock, RotateCcw, 
  AlertTriangle, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { 
  searchAlumnos, getAlumnoProgress, overrideAlumnoProgress,
  AlumnoSearchInfo
} from '../../services/storageService';
import { PHASE_MAPS } from './phaseMaps';

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

  return (
    <div className="w-full flex flex-col gap-6 text-white select-none">
      
      {/* Top Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.2rem] shadow-2xl">
        <div className="w-full">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 rounded-2xl border border-red-500/30">
              <Shield className="text-red-400" size={24} />
            </div>
            Rendimiento Estudiantil Avanzado
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Busca un alumno para gestionar su avance y configurar sus permisos de fase.
          </p>
        </div>
      </div>

      {/* Main Grid: Student search and detailed progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Student search */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.2rem] shadow-2xl flex flex-col gap-4">
          <h3 className="text-base font-black text-slate-400 uppercase tracking-widest px-2">Buscador de Alumnos</h3>
          
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
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600/20 text-white border-blue-500/40 shadow-inner' 
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-sm font-black">{a.alumno_nombre}</span>
                  <span className="text-xs text-slate-500 font-bold">{a.email}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/5 self-start mt-1 font-bold">
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
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Fase Actual</span>
                    <span className="text-base font-black text-blue-400">Fase {selectedAlumno.fase_actual_id}</span>
                  </div>
                  <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Estado</span>
                    <span className="text-base font-black text-green-400">{selectedAlumno.estado}</span>
                  </div>
                </div>
              </div>

              {/* Progress Drilldown */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                <h4 className="text-base font-black text-slate-400 uppercase tracking-widest px-1">Progreso y Control de Maestría</h4>

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
                                  <h5 className="text-xs font-black text-slate-400 border-b border-white/5 pb-1.5">{mod.name}</h5>
                                  
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
                                              <span className={`text-xs font-black ${lvl.isChallenge ? 'text-amber-400' : 'text-slate-300'}`}>
                                                {lvl.isChallenge ? 'Desafío' : 'Nivel'} {lvl.id}: {lvl.name}
                                              </span>
                                              {isApprovedByAdmin && (
                                                <span className="text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-black flex items-center gap-1">
                                                  <AlertTriangle size={10} /> Aprobado por Admin
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                state === 'APROBADO' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                state === 'EN_PROGRESO' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                'bg-slate-800 text-slate-500 border border-white/5'
                                              }`}>
                                                {state}
                                              </span>
                                              {state !== 'BLOQUEADO' && (
                                                <span className="text-xs text-slate-500 font-bold">{pct}% Aciertos</span>
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
                                                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-[10px] font-black text-blue-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                                                  >
                                                    <Unlock size={10} /> Liberar
                                                  </button>
                                                )}
                                                
                                                {/* Approve button */}
                                                {state !== 'APROBADO' && (
                                                  <button
                                                    onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'approve')}
                                                    className="px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600 border border-green-500/30 text-[10px] font-black text-green-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                                                  >
                                                    <Check size={10} /> Aprobar (90%)
                                                  </button>
                                                )}

                                                {/* Reset/Lock button */}
                                                {state !== 'BLOQUEADO' && (
                                                  <button
                                                    onClick={() => handleApplyOverride(phase.id, lvl.seccion, lvl.operacion, 'lock')}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-[10px] font-black text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
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

      </div>

    </div>
  );
};

export default PerformanceTab;
