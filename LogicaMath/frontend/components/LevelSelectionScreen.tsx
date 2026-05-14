import React, { useState, useEffect } from 'react';
import { GameCategory, Difficulty, User } from '../types';
import { ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  user: User | null;
  category: GameCategory;
  onBack: () => void;
  onSelectLevel: (difficulty: Difficulty) => void;
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

const LevelSelectionScreen: React.FC<Props> = ({ user, category, onBack, onSelectLevel }) => {
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);
  const [passingScore, setPassingScore] = useState<number>(85); // TODO: get from admin settings if needed

  useEffect(() => {
    // If admin, unlock all levels. Else fetch progress.
    if (user?.role === 'ADMIN') {
      setUnlockedLevel(4); // 0-indexed, so 4 is level 5
    } else {
      import('../services/storageService').then(service => {
        service.getUserProgress().then(progress => {
          const catProgress = progress.find(p => p.category === category);
          setUnlockedLevel(catProgress?.unlocked_level ?? 0);
        });
        
        // Optionally fetch the passing score from settings, if implemented globally
      });
    }
  }, [user, category]);

  const categoryName = CATEGORY_NAMES[category] || 'Operaciones';

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] text-slate-900 overflow-y-auto w-full h-full custom-scrollbar">
      <div className="max-w-5xl mx-auto p-6 md:p-10 flex flex-col min-h-screen">
        
        {/* Header / Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            <span>Volver al menú</span>
          </button>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1A3A] mb-4 tracking-tight">
            Niveles De {categoryName}
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium">
            Supera cada nivel con al menos <span className="font-bold text-blue-600">{passingScore}%</span> para desbloquear el siguiente.
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
            const isUnlocked = levelIndex <= unlockedLevel;
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
                  relative flex flex-col items-center justify-center p-8 rounded-[2rem] w-[160px] h-[200px] transition-all
                  ${isUnlocked 
                    ? 'bg-white border-2 border-blue-500/20 shadow-[0_10px_30px_rgba(59,130,246,0.1)] hover:border-blue-500 hover:shadow-[0_20px_40px_rgba(59,130,246,0.2)] cursor-pointer' 
                    : 'bg-slate-50 border border-slate-100 opacity-70 cursor-not-allowed shadow-sm'
                  }
                `}
              >
                {/* Icon or Number Circle */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-6 text-xl font-black transition-colors
                  ${isUnlocked 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-slate-100 text-slate-400'
                  }
                `}>
                  {isUnlocked ? (levelIndex + 1) : <Lock size={24} />}
                </div>

                <span className={`text-xl font-bold tracking-tight ${isUnlocked ? 'text-[#0B1A3A]' : 'text-slate-400'}`}>
                  Nivel {levelIndex + 1}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
};

export default LevelSelectionScreen;
