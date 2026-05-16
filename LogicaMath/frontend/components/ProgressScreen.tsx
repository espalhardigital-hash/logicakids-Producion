import React, { useState, useEffect } from 'react';
import { ScoreRecord, CategoryProgress, GameCategory } from '../types';
import { getTopScoresByUser, getUserProgress, deleteScoreById } from '../services/storageService';
import { 
  ArrowLeft, Calendar, CheckCircle, XCircle, ChevronDown, ChevronUp, 
  Plus, Minus, X, Divide, Calculator, TrendingUp, Target, Gamepad2, Trash2,
  Sparkles, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  username: string;
  onBack: () => void;
}

const CATEGORY_CONFIG: Record<GameCategory, { label: string; color: string; icon: React.ReactNode; glow: string }> = {
  addition: { label: 'Sumas', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <Plus size={20} />, glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
  subtraction: { label: 'Restas', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <Minus size={20} />, glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' },
  multiplication: { label: 'Tablas', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <X size={20} />, glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]' },
  division: { label: 'División', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: <Divide size={20} />, glow: 'shadow-[0_0_20px_rgba(236,72,153,0.15)]' },
  challenge: { label: 'Desafío Mix', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Calculator size={20} />, glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' }
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Nv.1',
  easy_medium: 'Nv.2',
  medium: 'Nv.3',
  medium_hard: 'Nv.4',
  hard: 'Nv.5',
  mixed: 'Mix'
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ProgressScreen: React.FC<Props> = ({ username, onBack }) => {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [progress, setProgress] = useState<CategoryProgress[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [scoresData, progressData] = await Promise.all([
        getTopScoresByUser(username),
        getUserProgress()
      ]);
      setScores(scoresData);
      setProgress(progressData);
    } catch (e) {
      console.error("Error loading progress data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const handleDeleteScore = async (scoreId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este intento de tu historial?")) return;
    try {
      await deleteScoreById(scoreId);
      await fetchData();
    } catch (e) {
      alert("Error al eliminar el registro: " + e);
    }
  };

  // KPI Calculations
  const totalGames = scores.length;
  const totalCorrect = scores.reduce((sum, s) => sum + s.correctCount, 0);
  const avgScore = totalGames > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames) : 0;

  // Group scores by category
  const scoresByCategory: Record<string, ScoreRecord[]> = {};
  scores.forEach(s => {
    const cat = s.category || 'unknown';
    if (!scoresByCategory[cat]) scoresByCategory[cat] = [];
    scoresByCategory[cat].push(s);
  });

  const playedCategories: GameCategory[] = ['addition', 'subtraction', 'multiplication', 'division', 'challenge'];

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
        <>
          {/* KPI Dashboard */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
            <div className="relative group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.8rem] p-6 transition-all duration-500 hover:border-blue-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
              <Gamepad2 className="text-blue-400 mb-3" size={28} />
              <div className="text-3xl font-black text-white">{totalGames}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Partidas Jugadas</div>
            </div>

            <div className="relative group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.8rem] p-6 transition-all duration-500 hover:border-yellow-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors"></div>
              <TrendingUp className="text-yellow-400 mb-3" size={28} />
              <div className="text-3xl font-black text-white">{avgScore}%</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Precisión Promedio</div>
            </div>

            <div className="relative group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.8rem] p-6 transition-all duration-500 hover:border-emerald-500/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <Target className="text-emerald-400 mb-3" size={28} />
              <div className="text-3xl font-black text-white">{totalCorrect}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Respuestas Correctas</div>
            </div>
          </motion.div>

          {/* Categories Accordion */}
          <motion.div variants={itemVariants} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[400px] relative z-10">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest font-black mb-3">Progreso por Categoría</h3>

            {totalGames === 0 ? (
              <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-12">
                <Award className="mx-auto text-gray-600 mb-3" size={48} />
                <h4 className="text-lg font-bold text-white mb-1">¿Listo para el desafío?</h4>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Aún no has jugado ninguna partida. ¡Entrena en cualquier categoría para comenzar a recopilar estadísticas!</p>
              </div>
            ) : (
              playedCategories.map(catKey => {
                const config = CATEGORY_CONFIG[catKey];
                if (!config) return null;

                const catProgress = progress.find(p => p.category === catKey);
                const catScores = scoresByCategory[catKey] || [];
                const isExpanded = expandedCategory === catKey;

                const catTotalGames = catProgress?.total_games ?? catScores.length;
                const catAccuracy = catProgress && (catProgress.total_correct + catProgress.total_errors > 0)
                  ? Math.round((catProgress.total_correct / (catProgress.total_correct + catProgress.total_errors)) * 100)
                  : catScores.length > 0
                    ? Math.round(catScores.reduce((sum, s) => sum + s.score, 0) / catScores.length)
                    : 0;

                const unlockedLevel = catProgress?.unlocked_level ?? 0;

                return (
                  <div 
                    key={catKey} 
                    className="bg-white/5 border border-white/10 rounded-[1.8rem] overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  >
                    {/* Header Row */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
                      className="w-full p-5 flex items-center justify-between transition-colors text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${config.color} ${config.glow}`}>
                          {config.icon}
                        </div>
                        <div>
                          <div className="text-white font-bold text-lg">{config.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {catTotalGames} {catTotalGames === 1 ? 'partida' : 'partidas'} • {catAccuracy}% precisión
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right hidden sm:block">
                          <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">Nivel {unlockedLevel + 1}</div>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2.5 h-2.5 rounded-full ${i <= unlockedLevel ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-white/10'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 text-gray-400 group-hover:text-white">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </button>

                    {/* Collapsible content (Level Attempts) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/5 bg-black/30"
                        >
                          <div className="p-4 space-y-2.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {catScores.length === 0 ? (
                              <div className="text-center py-4 text-xs text-gray-500 font-medium">
                                No hay intentos guardados en esta categoría aún.
                              </div>
                            ) : (
                              catScores.map(score => (
                                <div 
                                  key={score.id} 
                                  className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl group transition-all duration-300"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold text-gray-300">
                                      {DIFFICULTY_LABELS[score.difficulty || 'easy'] || score.difficulty}
                                    </span>
                                    <span className="text-lg font-black text-white">{score.score}%</span>
                                  </div>

                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3 text-xs font-semibold text-gray-400">
                                      <span className="flex items-center text-emerald-400">
                                        <CheckCircle size={14} className="mr-1 shrink-0" />{score.correctCount}
                                      </span>
                                      <span className="flex items-center text-rose-500">
                                        <XCircle size={14} className="mr-1 shrink-0" />{score.errorCount}
                                      </span>
                                      <span className="hidden md:flex items-center">
                                        <Calendar size={14} className="mr-1 shrink-0" />
                                        {new Date(score.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteScore(score.id); }}
                                      className="md:opacity-0 md:group-hover:opacity-100 p-2 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 rounded-xl transition-all duration-300 active:scale-95 shrink-0"
                                      title="Eliminar partida"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default ProgressScreen;
