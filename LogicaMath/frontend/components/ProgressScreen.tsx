import React, { useState, useEffect } from 'react';
import { ProgressSummary, AcademicBlockProgress, StudentAttemptSummary } from '../types';
import { getUserProgressSummary, getUserProgressBlocks, getUserProgressHistory } from '../services/storageService';
import { 
  ArrowLeft, Calendar, CheckCircle, XCircle, ChevronDown, ChevronUp, 
  Plus, Minus, X, Divide, Calculator, TrendingUp, Target, Gamepad2, Clock,
  Sparkles, Award, Lock, Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  username: string;
  onBack: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ProgressScreen: React.FC<Props> = ({ username, onBack }) => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [blocks, setBlocks] = useState<AcademicBlockProgress[]>([]);
  const [history, setHistory] = useState<StudentAttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Accordion expanded states
  const [expandedFase, setExpandedFase] = useState<number | null>(null);
  const [expandedModulo, setExpandedModulo] = useState<string | null>(null); // "faseId-moduloId"
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null); // "faseId-seccion-operacion"

  const fetchData = async () => {
    try {
      const [summaryData, blocksData, historyData] = await Promise.all([
        getUserProgressSummary(),
        getUserProgressBlocks(),
        getUserProgressHistory()
      ]);
      setSummary(summaryData);
      setBlocks(blocksData || []);
      setHistory(historyData || []);
    } catch (e) {
      console.error("Error loading progress data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="w-full max-w-4xl bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col min-h-[650px] relative overflow-hidden"
    >
      {/* Premium Decorative elements inside card */}
      <div className="absolute top-[-20%] right-[-20%] w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack} 
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Award className="text-yellow-400 animate-pulse" size={22} />
              <h2 className="text-3xl font-black text-white tracking-tight">Mi Progreso</h2>
            </div>
            <p className="text-sm text-gray-400 font-medium mt-0.5">Reporte de rendimiento para: {username.toLowerCase()}</p>
          </div>
        </div>

        <div className="px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles size={14} />
          <span>LogicaKids Pro v0.1.1</span>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <p className="text-gray-400 font-medium">Cargando analíticas...</p>
        </div>
      ) : (
        <>          {/* KPI Dashboard */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
            <div className="relative group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.8rem] p-6 transition-all duration-500 hover:border-yellow-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors"></div>
              <Award className="text-yellow-400 mb-3" size={28} />
              <div className="text-3xl font-black text-white">
                {summary?.total_bloques_aprobados ?? 0}
                <span className="text-sm font-bold text-gray-500 ml-1">/ {blocks.length}</span>
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Bloques Aprobados</div>
            </div>

            <div className="relative group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.8rem] p-6 transition-all duration-500 hover:border-blue-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
              <TrendingUp className="text-blue-400 mb-3" size={28} />
              <div className="text-3xl font-black text-white">{summary?.precision_promedio ?? 0}%</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Precisión Promedio</div>
            </div>

            <div className="relative group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.8rem] p-6 transition-all duration-500 hover:border-emerald-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <Clock className="text-emerald-400 mb-3" size={28} />
              <div className="text-3xl font-black text-white">
                {Math.round((summary?.tiempo_total_segundos || 0) / 60)} <span className="text-sm font-bold text-gray-500">min</span>
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Tiempo de Estudio</div>
            </div>
          </motion.div>

          {/* Categories Accordion -> Fase/Modulo/Bloque Accordion */}
          <motion.div variants={itemVariants} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[400px] relative z-10">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest font-black mb-3">Progreso del Estudiante</h3>

            {blocks.length === 0 ? (
              <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-12">
                <Award className="mx-auto text-gray-600 mb-3" size={48} />
                <h4 className="text-lg font-bold text-white mb-1">Cargando progreso...</h4>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Si eres un alumno nuevo, tu tutor te asignará una fase para comenzar.</p>
              </div>
            ) : (
              (() => {
                const groupedProgress: Record<number, {
                  faseTitulo: string;
                  modulos: Record<number, {
                    moduloTitulo: string;
                    blocks: AcademicBlockProgress[];
                  }>;
                }> = {};

                blocks.forEach(block => {
                  if (!groupedProgress[block.fase_id]) {
                    groupedProgress[block.fase_id] = {
                      faseTitulo: block.fase_titulo,
                      modulos: {}
                    };
                  }
                  const mId = block.modulo_id;
                  if (!groupedProgress[block.fase_id].modulos[mId]) {
                    groupedProgress[block.fase_id].modulos[mId] = {
                      moduloTitulo: block.modulo_titulo,
                      blocks: []
                    };
                  }
                  groupedProgress[block.fase_id].modulos[mId].blocks.push(block);
                });

                return Object.keys(groupedProgress).map(faseKey => {
                  const faseId = parseInt(faseKey);
                  const fase = groupedProgress[faseId];
                  const isFaseExpanded = expandedFase === faseId;

                  return (
                    <div key={faseId} className="bg-white/5 border border-white/10 rounded-[1.8rem] overflow-hidden transition-all duration-300">
                      {/* Fase Header */}
                      <button
                        onClick={() => setExpandedFase(isFaseExpanded ? null : faseId)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <Award className="text-yellow-400" size={24} />
                          <span className="font-black text-xl text-white">{fase.faseTitulo}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 text-gray-400">
                          {isFaseExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </button>

                      {/* Fase Collapsible */}
                      {isFaseExpanded && (
                        <div className="p-5 pt-0 border-t border-white/5 bg-black/20 space-y-4">
                          {Object.keys(fase.modulos).map(modKey => {
                            const modId = parseInt(modKey);
                            const modulo = fase.modulos[modId];
                            const moduloUniqueKey = `${faseId}-${modId}`;
                            const isModExpanded = expandedModulo === moduloUniqueKey;

                            return (
                              <div key={modId} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden mt-3">
                                {/* Modulo Header */}
                                <button
                                  onClick={() => setExpandedModulo(isModExpanded ? null : moduloUniqueKey)}
                                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all duration-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">Módulo {modId}</span>
                                    <span className="font-bold text-base text-slate-200">{modulo.moduloTitulo}</span>
                                  </div>
                                  <div className="text-gray-400">
                                    {isModExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </div>
                                </button>

                                {/* Modulo Collapsible */}
                                {isModExpanded && (
                                  <div className="p-4 pt-0 border-t border-white/5 bg-black/10 space-y-3">
                                    {modulo.blocks.map(block => {
                                      const blockUniqueKey = `${block.fase_id}-${block.seccion}-${block.operacion}`;
                                      const isBlockExpanded = expandedBlock === blockUniqueKey;
                                      
                                      const isApproved = block.estado === 'APROBADO';
                                      const isInProgress = block.estado === 'EN_PROGRESO';
                                      const isBlocked = block.estado === 'BLOQUEADO';
                                      
                                      const isTutorApproved = block.aprobado_por_admin;
                                      const isTutorUnlocked = block.desbloqueado_por_admin;
                                      const isTutorOverridden = isTutorApproved || isTutorUnlocked;

                                      let cardStyle = "border-white/5 opacity-50";
                                      let statusBadge = (
                                        <span className="text-[10px] font-black bg-white/5 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
                                          Bloqueado
                                        </span>
                                      );

                                      if (isApproved) {
                                        if (isTutorApproved) {
                                          cardStyle = "border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-cyan-950/10 hover:border-cyan-500/50";
                                          statusBadge = (
                                            <span className="text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                              <Sparkles size={12} /> Aprobado por el Tutor
                                            </span>
                                          );
                                        } else {
                                          cardStyle = "border-yellow-500/30 shadow-[0_0_15px_rgba(250,204,21,0.15)] bg-yellow-500/5 hover:border-yellow-500/50";
                                          statusBadge = (
                                            <span className="text-[10px] font-black bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                              <Sparkles size={12} /> Aprobado
                                            </span>
                                          );
                                        }
                                      } else if (isInProgress) {
                                        if (isTutorUnlocked) {
                                          cardStyle = "border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-cyan-950/5 hover:border-cyan-500/50";
                                          statusBadge = (
                                            <span className="text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                              <Unlock size={12} /> Habilitado por el Tutor
                                            </span>
                                          );
                                        } else {
                                          cardStyle = "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40";
                                          statusBadge = (
                                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                              En Progreso
                                            </span>
                                          );
                                        }
                                      }

                                      const titleText = block.nivel_titulo || block.desafio_titulo || `Bloque ${block.seccion}`;
                                      const opLabel = block.operacion.charAt(0).toUpperCase() + block.operacion.slice(1);
                                      const blockAttempts = history.filter(h => h.fase_id === block.fase_id && h.seccion === block.seccion && h.operacion === block.operacion);

                                      return (
                                        <div 
                                          key={blockUniqueKey}
                                          className={`border rounded-2xl p-5 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 ${cardStyle} mt-2.5`}
                                        >
                                          <button
                                            onClick={() => !isBlocked && setExpandedBlock(isBlockExpanded ? null : blockUniqueKey)}
                                            disabled={isBlocked}
                                            className={`w-full flex justify-between items-start text-left ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer group/block'}`}
                                          >
                                            <div>
                                              <h4 className="font-extrabold text-base text-white group-hover/block:text-blue-400 transition-colors flex items-center gap-2">
                                                {titleText}
                                                {isApproved && !isTutorApproved && (
                                                  <Award size={16} className="text-yellow-400 shrink-0" />
                                                )}
                                              </h4>
                                              <span className="text-xs text-slate-400 capitalize">{opLabel}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              {statusBadge}
                                              {!isBlocked && (
                                                <div className="text-gray-400 group-hover/block:text-white transition-colors">
                                                  {isBlockExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                              )}
                                            </div>
                                          </button>

                                          {/* Progress bar for EN_PROGRESO */}
                                          {isInProgress && (
                                            <div className="mt-3 space-y-1">
                                              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                                <span>COMPLETITUD</span>
                                                <span>{block.completitud_actual}%</span>
                                              </div>
                                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                  className={`h-full rounded-full transition-all duration-550 ${isTutorUnlocked ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-blue-500'}`} 
                                                  style={{ width: `${block.completitud_actual}%` }} 
                                                />
                                              </div>
                                            </div>
                                          )}

                                          {/* Metrics Summary (Not Blocked) */}
                                          {!isBlocked && block.intentos_totales > 0 && (
                                            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                                              <div>
                                                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Aciertos</span>
                                                <span className="font-extrabold text-slate-200 text-sm">{block.aciertos_acumulados} / {block.intentos_totales}</span>
                                              </div>
                                              <div>
                                                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Precisión</span>
                                                <span className={`font-extrabold text-sm ${block.porcentaje_actual >= 80 ? 'text-emerald-400' : block.porcentaje_actual >= 60 ? 'text-yellow-400' : 'text-rose-400'}`}>
                                                  {block.porcentaje_actual}%
                                                </span>
                                              </div>
                                            </div>
                                          )}

                                          {/* Collapsible details (Audits & Sessions) */}
                                          {isBlockExpanded && !isBlocked && (
                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                              
                                              {/* Tutor override audit box */}
                                              {isTutorOverridden && (
                                                <div className="p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-xs space-y-1.5 text-cyan-200 backdrop-blur-md">
                                                  <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                                                    <Sparkles size={12} />
                                                    <span>Autorización Académica</span>
                                                  </div>
                                                  <p><span className="text-cyan-400/60 font-semibold">Supervisor:</span> Dirección Académica LogicaKids</p>
                                                  <p><span className="text-cyan-400/60 font-semibold">Motivo:</span> {block.override_motivo || (isTutorApproved ? "Aprobación directa por el tutor" : "Habilitado por el tutor")}</p>
                                                  {block.override_fecha && (
                                                    <p><span className="text-cyan-400/60 font-semibold">Fecha:</span> {new Date(block.override_fecha).toLocaleDateString(undefined, {
                                                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}</p>
                                                  )}
                                                </div>
                                              )}

                                              {/* Session attempt history list */}
                                              <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2 flex items-center gap-1">
                                                  <Calendar size={12} /> Historial de Sesiones
                                                </p>
                                                {blockAttempts.length === 0 ? (
                                                  <p className="text-xs text-slate-500 italic">No hay intentos registrados en este nivel.</p>
                                                ) : (
                                                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                                                    {blockAttempts.map((attempt) => {
                                                      const isApprovedAttempt = attempt.estado_resultado === 'APROBADO' || attempt.estado_resultado === 'ADMIN_APPROVE';
                                                      return (
                                                        <div 
                                                          key={attempt.id} 
                                                          className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 text-xs"
                                                        >
                                                          <div className="flex items-center space-x-3.5">
                                                            <span className={`w-2 h-2 rounded-full ${isApprovedAttempt ? 'bg-emerald-550 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                                                            <span className="font-extrabold text-slate-200">{attempt.porcentaje}% acierto</span>
                                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                                                              {attempt.tipo_pool}
                                                            </span>
                                                          </div>
                                                          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                                                            <span>{attempt.aciertos} aciertos</span>
                                                            <span>{attempt.tiempo_promedio_segundos}s/preg</span>
                                                            <span>
                                                              {new Date(attempt.fecha_fin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
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
                  );
                });
              })()
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default ProgressScreen;
