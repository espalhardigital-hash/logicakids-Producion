import React, { useState, useEffect } from 'react';
import { GameCategory, User } from '../types';
import { Plus, Minus, X, Divide, LogOut, Trophy, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '../services/storageService';

interface Props {
  user: User | null;
  onSelectCategory: (category: GameCategory) => void;
  onLogout: () => void;
  onGoAdmin?: () => void;
  onGoProfile?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};



const WelcomeScreen: React.FC<Props> = ({ user, onSelectCategory, onLogout, onGoAdmin, onGoProfile }) => {
  const [progress, setProgress] = useState<import('../types').CategoryProgress[]>([]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      import('../services/storageService').then(service => {
        service.getUserProgress().then(setProgress);
      });
    }
  }, [user]);

  const getCategoryLevel = (categoryId: GameCategory) => {
    if (!user) return 0;
    if (user.role === 'ADMIN') return 4; // Max level
    const catProgress = progress.find(p => p.category === categoryId);
    return catProgress?.unlocked_level ?? 0;
  };

  const handleCategoryClick = (categoryId: GameCategory) => {
    onSelectCategory(categoryId);
  };

  const categories: { id: GameCategory; label: string; icon: React.ReactNode; color: string; textColor: string }[] = [
    { id: 'addition', label: 'Sumas', icon: <Plus size={24} className="text-white" />, color: 'bg-[#10B981]', textColor: 'text-[#10B981]' },
    { id: 'subtraction', label: 'Restas', icon: <Minus size={24} className="text-white" />, color: 'bg-[#F97316]', textColor: 'text-[#F97316]' },
    { id: 'multiplication', label: 'Tablas', icon: <X size={24} className="text-white" />, color: 'bg-[#A855F7]', textColor: 'text-[#A855F7]' },
    { id: 'division', label: 'Divisiones', icon: <Divide size={24} className="text-white" />, color: 'bg-[#3B82F6]', textColor: 'text-[#3B82F6]' },
    { id: 'challenge', label: 'Desafío Mixto', icon: <Sparkles size={24} className="text-white" />, color: 'bg-[#EC4899]', textColor: 'text-[#EC4899]' },
  ];

  const isCategoryLocked = (categoryId: GameCategory) => {
    if (categoryId === 'challenge') {
      // Challenge unlocks only if all other categories are at Level 5 (index 4)
      const otherCategories: GameCategory[] = ['addition', 'subtraction', 'multiplication', 'division'];
      return otherCategories.some(cat => getCategoryLevel(cat) < 4);
    }
    return false;
  };

  // Calculate global progress
  let totalLevelsUnlocked = 0;
  categories.forEach(cat => {
    totalLevelsUnlocked += Math.min(getCategoryLevel(cat.id), 5);
  });
  const maxTotalLevels = 20; // 4 categories * 5 levels
  const remainingLevels = maxTotalLevels - totalLevelsUnlocked;

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] text-slate-900 overflow-y-auto w-full h-full custom-scrollbar">
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="max-w-5xl mx-auto p-6 md:p-10 flex flex-col items-center justify-start min-h-screen"
      >
        {/* Header Bar */}
        <motion.div variants={itemVariants} className="w-full flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Plus size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Matemáticas Pro</h1>
          </div>
          {/* User Avatar Button */}
          <button
            onClick={onGoProfile}
            className="relative group"
            title="Mi Perfil"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-blue-500 transition-all duration-300 shadow-md">
              {user?.avatar ? (
                <img src={getAvatarUrl(user.avatar)} alt={user?.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-lg font-black text-white">
                    {user?.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
          </button>
        </motion.div>

        {/* Welcome Card */}
        <motion.div variants={itemVariants} className="w-full bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex flex-col md:flex-row justify-between items-center border border-slate-100">
          <div className="flex flex-col items-start mb-4 md:mb-0">
            <h2 className="text-4xl font-black text-slate-800 mb-2 flex items-center">
              ¡Hola, {user?.username ? user.username.toLowerCase() : 'invitado'}! <span className="ml-2 text-3xl">👋</span>
            </h2>
            <div className="flex items-center text-slate-500 font-medium">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mr-3">
                {user?.fase_actual_id === 2 ? 'FASE 1' : 'FASE 0'}
              </span>
              <span className="text-sm">
                {user?.fase_actual_id === 2 ? 'Aprendizaje por Dominio' : 'Dominando las bases matemáticas'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {user?.role === 'ADMIN' && onGoAdmin && (
              <button
                onClick={onGoAdmin}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl text-purple-500 hover:text-purple-700 transition-colors border border-purple-100"
                title="Panel Admin"
              >
                <Shield size={20} />
              </button>
            )}
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 tracking-wider mb-1">TOTAL ESTRELLAS</span>
              <div className="flex items-center text-amber-500">
                <Trophy size={24} className="mr-2" />
                <span className="text-3xl font-black">0</span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors border border-slate-100"
            >
              <LogOut size={20} />
            </button>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div variants={containerVariants} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          {categories.map((cat) => {
            const levelIdx = getCategoryLevel(cat.id);
            const currentLevel = Math.min(levelIdx + 1, 5); // Display level 1-5
            const progressPercent = Math.min((levelIdx / 5) * 100, 100);
            const isLocked = isCategoryLocked(cat.id);

            return (
              <motion.button
                variants={itemVariants}
                whileHover={!isLocked ? { scale: 1.03, y: -5 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => !isLocked && handleCategoryClick(cat.id)}
                key={cat.id}
                disabled={isLocked}
                className={`bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-start text-left transition-all ${isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]'}`}
              >
                <div className={`w-16 h-16 rounded-2xl ${isLocked ? 'bg-slate-300' : cat.color} flex items-center justify-center mb-6 shadow-sm`}>
                  {isLocked ? <Plus size={24} className="text-white opacity-50 rotate-45" /> : cat.icon}
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-4">{cat.label}</h3>

                {cat.id === 'challenge' ? (
                  <div className={`${isLocked ? 'bg-slate-100 text-slate-500' : 'bg-pink-50 text-pink-600'} text-[10px] font-bold px-4 py-1.5 rounded-full mb-8 uppercase tracking-wider`}>
                    {isLocked ? 'Desafío Bloqueado' : '¡Reto Final!'}
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full mb-8">
                    Nivel {currentLevel} de 5
                  </div>
                )}

                <div className="w-full mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">PROGRESO</span>
                    <span className="text-[10px] font-bold text-slate-400">{cat.id === 'challenge' ? (isLocked ? '0%' : '100%') : `${progressPercent}%`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isLocked ? 'bg-slate-200' : cat.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${cat.id === 'challenge' ? (isLocked ? 0 : 100) : progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Bottom Banner */}
        <motion.div variants={itemVariants} className="w-full bg-blue-600 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-[0_20px_40px_rgba(37,99,235,0.2)]">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mr-6 shrink-0 border border-white/10">
              <Trophy size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {remainingLevels === 0 ? '¡Listo para el Desafío!' : 'Tu Camino a la Fase 1'}
              </h3>
              <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
                {remainingLevels === 0
                  ? 'Has dominado las bases. Supera el Desafío Mixto para avanzar a la Fase 1.'
                  : 'Completa los 5 niveles en las 4 disciplinas para desbloquear el Desafío Mixto y avanzar de fase.'}
              </p>
            </div>
          </div>

          <div className="w-24 h-24 rounded-3xl bg-white/10 flex flex-col items-center justify-center shrink-0 border border-white/10">
            <span className="text-3xl font-black text-white mb-1">{remainingLevels}</span>
            <span className="text-[9px] font-bold text-blue-200 tracking-wider">FALTANTES</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
