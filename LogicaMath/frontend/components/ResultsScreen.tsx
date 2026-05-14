import React from 'react';
import { GameStats } from '../types';
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
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, type: "spring", stiffness: 300, damping: 25 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const ResultsScreen: React.FC<Props> = ({ stats, username, onRestart, onHome, onNextLevel, hasNextLevel, isPass }) => {
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
      className="flex flex-col items-center justify-center w-full max-w-md text-center space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] w-full shadow-2xl relative overflow-hidden">
        {/* Background glow based on pass/fail */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 blur-[80px] rounded-full pointer-events-none ${isPass ? 'bg-brand-primary/40' : 'bg-red-500/30'}`}></div>

        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          {isPass ? <Trophy size={80} className="mx-auto text-yellow-400 mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" /> : <Award size={80} className="mx-auto text-gray-400 mb-6 relative z-10" />}
        </motion.div>
        
        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Misión Completada</h2>
        <p className="text-brand-secondary mb-10 font-bold text-lg">¡Buen trabajo, {username}!</p>

        <div className="space-y-4">
          <motion.div variants={itemVariants} className={`rounded-2xl p-6 flex justify-between items-center shadow-inner ${isPass ? 'bg-brand-primary/20 border border-brand-primary/30' : 'bg-white/5 border border-white/10'}`}>
            <span className="text-gray-300 font-bold uppercase tracking-wider text-sm">Puntuación</span>
            <span className={`text-4xl font-black ${isPass ? 'text-white' : 'text-gray-400'}`}>{score} pts</span>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col shadow-inner">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Aciertos</span>
              <span className="text-3xl font-black text-green-400">{stats.correct}</span>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col shadow-inner">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Fallos</span>
              <span className="text-3xl font-black text-red-400">{stats.incorrect}</span>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Clock size={12} /> Promedio
               </span>
               <span className="text-xl font-bold font-mono text-brand-primary">{avgTime}s</span>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                  <Timer size={12} /> Total
               </span>
               <span className="text-xl font-bold font-mono text-brand-secondary">{formatTotalTime(stats.totalTime)}</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col w-full gap-4">
         {isPass && hasNextLevel && (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNextLevel}
                className="w-full px-6 py-4 bg-green-500 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-shadow flex items-center justify-center space-x-3 overflow-hidden relative group"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">Siguiente Nivel</span>
                <ArrowRight size={24} className="relative z-10" />
            </motion.button>
         )}

         <div className="flex space-x-4 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onHome}
              className="flex-1 px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-colors flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Base</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="flex-1 px-4 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/30 transition-shadow flex items-center justify-center space-x-2"
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
