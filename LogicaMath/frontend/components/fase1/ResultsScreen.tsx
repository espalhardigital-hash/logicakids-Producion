import React from 'react';
import { GameStats } from '../../types';
import { RefreshCcw, Home, Award, ArrowRight, Clock, Timer, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  stats: GameStats;
  username: string;
  onRestart: () => void;
  onHome: () => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
  isPass: boolean;
  category: string;
  adminConfig?: import('../../types').PedagogyConfig | null;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, type: 'spring' as const, stiffness: 300, damping: 25 } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
} as const;

const ResultsScreen: React.FC<Props> = ({ stats, username, onRestart, onHome, onNextLevel, hasNextLevel, isPass, category, adminConfig }) => {
  const [aiAnalysis, setAiAnalysis] = React.useState<string | null>(null);
  const [loadingAi, setLoadingAi] = React.useState(false);

  const fetchAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const { getAIAnalysis } = await import('../../services/storageService');
      const analysis = await getAIAnalysis(category);
      setAiAnalysis(analysis);
    } catch (error) {
      setAiAnalysis("No se pudo obtener el análisis en este momento.");
    } finally {
      setLoadingAi(false);
    }
  };

  React.useEffect(() => {
    fetchAiAnalysis();
  }, [category]);

  const totalQuestions = stats.correct + stats.incorrect;
  const score = totalQuestions > 0 ? Math.round((stats.correct / totalQuestions) * 100) : 0;
  const avgTime = totalQuestions > 0 ? (stats.totalTime / totalQuestions).toFixed(2) : "0.00";

  const formatTotalTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants} 
      className="flex flex-col items-center justify-center w-full max-w-md text-center space-y-6 px-4 py-8"
    >
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 dark:bg-[#162033] dark:border-slate-800 p-8 md:p-10 rounded-[3rem] w-full shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Background glow based on pass/fail */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 blur-[80px] rounded-full pointer-events-none ${isPass ? 'bg-green-500/20 dark:bg-green-500/10' : 'bg-red-500/20 dark:bg-red-500/10'}`}></div>

        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          {isPass ? <Trophy size={80} className="mx-auto text-yellow-400 mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce" /> : <Award size={80} className="mx-auto text-slate-400 mb-6 relative z-10" />}
        </motion.div>
        
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-display">Misión Completada</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-8 font-bold text-lg font-sans">¡Buen trabajo, {username}!</p>

        <div className="space-y-4">
          <motion.div variants={itemVariants} className={`rounded-2xl p-6 flex justify-between items-center shadow-inner ${isPass ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50' : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-sm font-display">Puntuación</span>
            <span className={`text-4xl font-black font-display ${isPass ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>{score}%</span>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-slate-50 border border-slate-200 dark:bg-[#0a0f1c] dark:border-slate-800/60 rounded-2xl p-4 flex flex-col shadow-inner transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1 font-display">Aciertos</span>
              <span className="text-3xl font-black text-green-600 dark:text-green-400 font-display">{stats.correct}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-slate-50 border border-slate-200 dark:bg-[#0a0f1c] dark:border-slate-800/60 rounded-2xl p-4 flex flex-col shadow-inner transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1 font-display">Fallos</span>
              <span className="text-3xl font-black text-red-600 dark:text-red-400 font-display">{stats.incorrect}</span>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-slate-50 border border-slate-200 dark:bg-[#0a0f1c] dark:border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner transition-colors">
               <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1 font-display">
                  <Clock size={12} /> Promedio
               </span>
               <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{avgTime}s</span>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-slate-50 border border-slate-200 dark:bg-[#0a0f1c] dark:border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner transition-colors">
               <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1 font-display">
                  <Timer size={12} /> Total
               </span>
               <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">{formatTotalTime(stats.totalTime)}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* AI Tutor Section */}
      <motion.div variants={itemVariants} className="w-full bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-md border border-blue-200 dark:border-blue-900/30 p-6 rounded-3xl text-left relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10">
          <Award size={64} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2 font-display">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Tutor IA LogicaKids
        </h3>
        
        {loadingAi ? (
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-blue-400/10 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-blue-400/10 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-blue-400/10 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <div className="text-blue-900 dark:text-blue-100 text-sm leading-relaxed font-medium whitespace-pre-wrap font-sans">
            {aiAnalysis || "Preparando análisis pedagógico..."}
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col w-full gap-4">
         {isPass && hasNextLevel && (
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNextLevel}
                className="w-full px-6 py-4 bg-green-500 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center space-x-3 overflow-hidden relative group cursor-pointer font-sans"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">Siguiente Nivel</span>
                <ArrowRight size={24} className="relative z-10" />
            </motion.button>
         )}

         <div className="flex space-x-4 w-full">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onHome}
              className="flex-1 px-4 py-4 bg-white hover:bg-slate-50 dark:bg-[#162033] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white font-bold rounded-2xl transition-colors flex items-center justify-center space-x-2 cursor-pointer font-sans"
            >
              <Home size={20} />
              <span>Base</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRestart}
              className="flex-1 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-shadow flex items-center justify-center space-x-2 cursor-pointer font-sans"
            >
              <RefreshCcw size={20} />
              <span>Reintentar</span>
            </motion.button>
         </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsScreen;
