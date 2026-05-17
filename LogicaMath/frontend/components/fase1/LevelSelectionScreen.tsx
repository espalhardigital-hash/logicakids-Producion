import React, { useState, useEffect } from 'react';
import { GameCategory, Difficulty, User } from '../../types';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  user: User | null;
  category: GameCategory;
  onBack: () => void;
  onSelectLevel: (difficulty: Difficulty) => void;
  adminConfig?: import('../../types').PedagogyConfig | null;
}

const CATEGORY_NAMES: Record<string, string> = {
  addition: 'Sumas',
  subtraction: 'Restas',
  multiplication: 'Tablas',
  division: 'Divisiones',
  challenge: 'Desafío Mixto'
};

const difficultyOrder: Difficulty[] = ['easy', 'easy_medium', 'medium', 'medium_hard', 'hard'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const LevelSelectionScreen: React.FC<Props> = ({ user, category, onBack, onSelectLevel, adminConfig }) => {
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);
  const [passingScore, setPassingScore] = useState<number>(90);

  useEffect(() => {
    if (adminConfig) {
      setPassingScore(adminConfig.passingScore);
    }
  }, [adminConfig]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      setUnlockedLevel(6); // Cambiar a 6 para que todos los 5 niveles aparezcan superados
    } else {
      import('../../services/storageService').then(service => {
        service.getUserProgress().then(progress => {
          const catProgress = progress.find(p => p.category === category);
          // Cambiar el ?? 0 por ?? 1 (El nivel 1 es el mínimo desbloqueado)
          setUnlockedLevel(catProgress?.unlocked_level ?? 1); 
        });
      });
    }
  }, [user, category]);

  const categoryName = CATEGORY_NAMES[category] || 'Operaciones';

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-white overflow-y-auto w-full h-full custom-scrollbar transition-colors duration-300">
      {/* Background decorations - Ambient Glow */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto p-6 md:p-10 flex flex-col min-h-screen relative z-10">
        
        {/* Header / Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-bold border-none bg-transparent cursor-pointer group font-sans"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver al menú</span>
          </button>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1A3A] dark:text-white mb-4 tracking-tight font-display">
            Niveles De {categoryName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium font-sans">
            Supera cada nivel con al menos <span className="font-bold text-blue-600 dark:text-blue-400">{passingScore}%</span> para desbloquear el siguiente.
          </p>
        </motion.div>

        {/* Levels Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-6"
        >
          {[0, 1, 2, 3, 4].map((levelIndex) => {
            // NUEVA LÓGICA:
            // Desbloqueado si el índice es menor al nivel actual (ej: index 0 < nivel 1 = true)
            const isUnlocked = levelIndex < unlockedLevel; 
            // Superado solo si el índice es menor al nivel anterior (nivel actual - 1)
            const isPassed = levelIndex < (unlockedLevel - 1); 
            const diff = difficultyOrder[levelIndex];

            return (
              <motion.button
                variants={itemVariants}
                whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                key={levelIndex}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(diff)}
                className={`
                  relative flex flex-col items-center justify-center p-8 rounded-[2rem] w-[160px] h-[200px] border transition-all
                  ${isUnlocked 
                    ? isPassed
                      ? 'bg-emerald-50/40 border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.04)] hover:border-emerald-500 hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] cursor-pointer dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:hover:border-emerald-500'
                      : 'bg-white border-blue-500/20 shadow-[0_10px_30px_rgba(59,130,246,0.06)] hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] cursor-pointer dark:bg-[#162033] dark:border-slate-800 dark:hover:border-blue-500' 
                    : 'bg-slate-100 border-slate-200 opacity-70 dark:bg-[#0a0f1c] dark:border-slate-800/40 dark:shadow-none cursor-not-allowed shadow-sm'
                  }
                `}
              >
                {/* Icon or Number Circle */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-6 text-xl font-black transition-colors
                  ${isUnlocked 
                    ? isPassed
                      ? 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-emerald-50'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                  }
                `}>
                  {isUnlocked 
                    ? isPassed 
                      ? <Check size={28} strokeWidth={3} /> 
                      : (levelIndex + 1) 
                    : <Lock size={20} />
                  }
                </div>

                <span className={`text-xl font-bold tracking-tight font-display 
                  ${isUnlocked 
                    ? isPassed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-[#0B1A3A] dark:text-white' 
                    : 'text-slate-400 dark:text-slate-600'
                  }
                `}>
                  Nivel {levelIndex + 1}
                </span>

                {/* Symmetrical Pulsing Indicator for Passed Levels */}
                {isPassed && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
};

export default LevelSelectionScreen;
