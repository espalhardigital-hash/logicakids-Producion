import React, { useState, useEffect } from 'react';
import { GameCategory, User } from '../../types';
import { Plus, Minus, X as CloseIcon, Divide, Trophy, Sparkles, Shield, Lock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '../../services/storageService';

interface Props {
  user: User | null;
  onSelectCategory: (category: GameCategory) => void;
  onLogout: () => void;
  onGoAdmin?: () => void;
  onGoProfile?: () => void;
  onGoStats?: () => void;
  onBackMap?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const WelcomeScreen: React.FC<Props> = ({ user, onSelectCategory, onLogout, onGoAdmin, onGoProfile, onGoStats, onBackMap }) => {
  const [progress, setProgress] = useState<import('../../types').CategoryProgress[]>([]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      import('../../services/storageService').then(service => {
        service.getUserProgress().then(setProgress);
      });
    }
  }, [user]);

  const getCategoryLevel = (categoryId: GameCategory) => {
    if (!user) return 1;
    if (user.role === 'ADMIN') return 6; // Nivel 6 para dar el 100%
    const catProgress = progress.find(p => p.category === categoryId);
    return catProgress?.unlocked_level ?? 1; // Si no hay progreso, el Nivel 1 está desbloqueado
  };

  const handleCategoryClick = (categoryId: GameCategory) => {
    onSelectCategory(categoryId);
  };

  // Categories displayed in the main grid including the ultimate challenge
  const categories: { id: GameCategory; label: string; icon: React.ReactNode; color: string; textColor: string }[] = [
    { id: 'addition', label: 'Sumas', icon: <Plus size={24} className="text-white" />, color: 'bg-[#10B981]', textColor: 'text-[#10B981]' },
    { id: 'subtraction', label: 'Restas', icon: <Minus size={24} className="text-white" />, color: 'bg-[#F97316]', textColor: 'text-[#F97316]' },
    { id: 'multiplication', label: 'Tablas', icon: <CloseIcon size={24} className="text-white" />, color: 'bg-[#A855F7]', textColor: 'text-[#A855F7]' },
    { id: 'division', label: 'Divisiones', icon: <Divide size={24} className="text-white" />, color: 'bg-[#3B82F6]', textColor: 'text-[#3B82F6]' },
    { id: 'challenge', label: 'Desafío Mixto', icon: <Sparkles size={24} className="text-white" />, color: 'bg-gradient-to-r from-amber-500 to-orange-500', textColor: 'text-amber-500' }
  ];

  // Sequential unlock order for basic disciplines
  const unlockOrder: GameCategory[] = ['addition', 'subtraction', 'multiplication', 'division'];

  const isCategoryLocked = (categoryId: GameCategory): boolean => {
    if (user?.role === 'ADMIN') return false;
    if (categoryId === 'challenge') {
      return remainingLevels > 0;
    }
    const idx = unlockOrder.indexOf(categoryId);
    if (idx === 0) return false; // Sumas is always unlocked
    const prevCat = unlockOrder[idx - 1];
    return (getCategoryLevel(prevCat) - 1) < 4; // Requires previous level 4 cleared (at least 4 passed levels)
  };

  // Calculate global progress based on passed levels
  const basicCategories: GameCategory[] = ['addition', 'subtraction', 'multiplication', 'division'];
  let totalLevelsPassed = 0;
  basicCategories.forEach(cat => {
    const level = getCategoryLevel(cat);
    // Solo sumamos los niveles SUPERADOS (nivel actual - 1)
    totalLevelsPassed += Math.min(Math.max(0, level - 1), 5);
  });
  const maxTotalLevels = 20; // 4 categories * 5 levels
  const globalProgressPercent = Math.round((totalLevelsPassed / maxTotalLevels) * 100);
  const remainingLevels = maxTotalLevels - totalLevelsPassed;

  const currentPhaseId = user?.fase_actual_id ?? 1;

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-white overflow-y-auto w-full h-full custom-scrollbar transition-colors duration-300">
      {/* Background decorations - Ambient Glow */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col items-center justify-start min-h-screen relative z-10"
      >
        {/* Header Bar */}
        <motion.div variants={itemVariants} className="w-full flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Plus size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">LogicaKids Pro</h1>
          </div>
          
          {/* User Avatar Button */}
          <button
            onClick={onGoProfile}
            className="flex items-center space-x-3.5 group relative text-left hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
            title="Mi Perfil"
          >
            <div className="hidden sm:block text-right">
              <p className="text-slate-900 dark:text-white font-black text-base tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-none font-display">
                {user?.username ? user.username.toLowerCase() : 'invitado'}
              </p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-blue-500 transition-all duration-300 shadow-md">
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
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-[#070b14]"></div>
            </div>
          </button>
        </motion.div>

        {/* Welcome Card */}
        <motion.div variants={itemVariants} className="w-full bg-white dark:bg-[#162033] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mb-8 flex flex-col md:flex-row justify-between items-center transition-all duration-300">
          <div className="flex flex-col items-start mb-4 md:mb-0">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center font-display">
              ¡Hola, {user?.username ? user.username.split(/[_.\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Invitado'}! <span className="ml-2 text-3xl">👋</span>
            </h2>
            <div className="flex items-center text-slate-600 dark:text-slate-300 font-medium">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mr-3">
                FASE {currentPhaseId}
              </span>
              <span className="text-sm">
                {currentPhaseId >= 1 ? 'Dominando las bases matemáticas' : 'Aprendizaje por Dominio'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {user?.role === 'ADMIN' && onGoAdmin && (
              <button
                onClick={onGoAdmin}
                className="p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 rounded-2xl text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors border border-purple-200/30 shadow-sm cursor-pointer"
                title="Panel Admin"
              >
                <Shield size={20} />
              </button>
            )}
            <button 
              onClick={onGoStats}
              className="flex flex-col items-end hover:scale-105 active:scale-95 transition-transform group cursor-pointer"
              title="Mi Progreso"
            >
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider mb-1 uppercase font-display">MI PROGRESO</span>
              <div className="flex items-center text-amber-500 bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 px-4 py-2 rounded-2xl group-hover:bg-amber-500/20 transition-all shadow-sm">
                <Trophy size={22} className="mr-2 animate-pulse" />
                <span className="text-3xl font-black font-display leading-none">{totalLevelsPassed}</span>
              </div>
            </button>
            
            {onBackMap && (
              <button
                onClick={onBackMap}
                className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors border-none cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="Volver al Mapa General"
              >
                <ArrowLeft size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Categories Grid (Symmetrical 5-Column Layout on Desktop) */}
        <motion.div variants={containerVariants} className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {categories.map((cat) => {
            const levelIdx = getCategoryLevel(cat.id);
            const passedLevels = Math.max(0, levelIdx - 1); // Cuántos ha superado
            const currentLevel = Math.min(levelIdx, 5); // Nivel que se muestra en el texto
            const progressPercent = Math.min((passedLevels / 5) * 100, 100); // % basado en superados
            const isLocked = isCategoryLocked(cat.id);
            const isDominated = !isLocked && progressPercent === 100;

            return (
              <motion.button
                variants={itemVariants}
                whileHover={!isLocked ? { scale: 1.03, y: -5 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => !isLocked && handleCategoryClick(cat.id)}
                key={cat.id}
                disabled={isLocked}
                className={`relative rounded-[2.5rem] p-8 border flex flex-col items-start text-left transition-all duration-300 overflow-hidden group
                  ${isLocked 
                    ? 'bg-white/90 border-slate-200/80 dark:bg-[#162033]/95 dark:border-slate-800/70 opacity-90 cursor-not-allowed shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80' 
                    : 'bg-white border-slate-100 shadow-xl dark:bg-[#162033] dark:border-slate-800 dark:shadow-none hover:shadow-2xl hover:border-blue-500/30 dark:hover:border-blue-500/30 cursor-pointer'}`}
              >
                {/* Premium Inner Accent Glow on Hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 blur-[40px] ${cat.color} pointer-events-none`} />

                <div className={`relative w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mb-6 shadow-md transition-all duration-300 z-10`}>
                  {cat.icon}
                  {isLocked && (
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-50 border border-amber-200 dark:bg-amber-950/80 dark:border-amber-900 rounded-full p-1.5 shadow-lg flex items-center justify-center animate-pulse">
                      <Lock size={12} className="text-amber-500 dark:text-amber-400" />
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white mb-4 z-10">{cat.label}</h3>

                {isLocked ? (
                  <div className="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-amber-200/20 dark:border-amber-500/20 font-sans flex items-center gap-1 shadow-sm z-10">
                    <Lock size={11} className="text-amber-500" />
                    Bloqueado
                  </div>
                ) : cat.id === 'challenge' ? (
                  isDominated ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-wider mb-8 font-sans z-10">
                      <span>Examen Completado</span>
                      <span className="text-amber-500 dark:text-amber-400 font-black text-sm">✓</span>
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-amber-200/20 dark:border-amber-500/20 font-sans z-10">
                      Examen Final
                    </div>
                  )
                ) : isDominated ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider mb-8 font-sans z-10">
                    <span>Dominado</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-black text-sm">✓</span>
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-blue-200/20 dark:border-blue-500/20 font-sans z-10">
                    Nivel {currentLevel} de 5
                  </div>
                )}

                <div className="w-full mt-auto z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider">PROGRESO</span>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Bottom Banner (Fills horizontally and presents progress or challenge launch) */}
        <motion.div variants={itemVariants} className="w-full">
          {remainingLevels === 0 || user?.role === 'ADMIN' ? (
            /* Premium Banner for Dominating all 4 basic disciplines -> Ready for Challenge */
            <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_45px_rgba(37,99,235,0.35)] flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 relative overflow-hidden group">
              {/* Soft visual background bubbles */}
              <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mr-5 shrink-0 border border-white/20 shadow-inner">
                  <Trophy size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1 font-display tracking-tight">
                    Tu Camino a la Fase {currentPhaseId + 1}
                  </h3>
                  <p className="text-blue-100 text-sm leading-relaxed font-medium max-w-xl">
                    ¡Has dominado las 4 disciplinas! Ahora debes superar el Desafío Mixto final para avanzar a la Fase {currentPhaseId + 1}.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleCategoryClick('challenge')}
                className="px-8 py-3.5 bg-white hover:bg-slate-50 text-blue-600 font-bold rounded-2xl shadow-lg transition-all shrink-0 text-base font-sans cursor-pointer active:scale-95"
              >
                Iniciar Prueba Final
              </button>
            </div>
          ) : (
            /* Progress Banner showing outstanding levels to unlock challenge */
            <div className="w-full bg-white dark:bg-[#162033] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mr-5 shrink-0">
                    <Trophy size={32} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 font-display tracking-tight">
                      Tu Camino a la Fase {currentPhaseId + 1}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                      Completa los 5 niveles en las 4 disciplinas para desbloquear el Desafío Mixto y avanzar de fase.
                    </p>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center shrink-0 shadow-sm">
                  <span className="text-3xl font-black font-display leading-none">{globalProgressPercent}%</span>
                  <span className="text-[9px] font-black tracking-wider mt-1 uppercase font-display">Progreso</span>
                </div>
              </div>

              {/* General Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2 font-sans">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">PROGRESO GENERAL DE LA FASE</span>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">{totalLevelsPassed} / {maxTotalLevels} Niveles</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${globalProgressPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>

                {/* Per-category mini indicators */}
                <div className="flex justify-between mt-4">
                  {basicCategories.map((cat) => {
                    const lvl = getCategoryLevel(cat);
                    const passedLvl = Math.max(0, lvl - 1);
                    const pct = Math.min((passedLvl / 5) * 100, 100);
                    const labels: Record<string, string> = { addition: 'Sumas', subtraction: 'Restas', multiplication: 'Tablas', division: 'Divisiones' };
                    return (
                      <div key={cat} className="flex flex-col items-center gap-1.5 w-1/4 px-2">
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500/80 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">{labels[cat]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
