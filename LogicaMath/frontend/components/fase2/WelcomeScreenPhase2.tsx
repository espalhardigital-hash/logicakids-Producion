import React, { useState, useEffect } from 'react';
import { GameCategory, User } from '../../types';
import { Activity, Hash, ShoppingBag, Search, Wrench, Trophy, Sparkles, Shield, Lock, ArrowLeft } from 'lucide-react';
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

const WelcomeScreenPhase2: React.FC<Props> = ({
  user,
  onSelectCategory,
  onLogout,
  onGoAdmin,
  onGoProfile,
  onGoStats,
  onBackMap
}) => {
  const [progress, setProgress] = useState<import('../../types').CategoryProgress[]>([]);
  const [previewModule, setPreviewModule] = useState<{ id: string; label: string; desc: string } | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      import('../../services/storageService').then(service => {
        service.getUserProgress().then(setProgress);
      });
    }
  }, [user]);

  const getCategoryLevel = (categoryId: GameCategory) => {
    if (!user) return 0;
    if (user.role === 'ADMIN') return 5; // Max level for ADMIN (100% completed)
    const catProgress = progress.find(p => p.category === categoryId);
    return catProgress?.unlocked_level ?? 0;
  };

  const handleCategoryClick = (categoryId: GameCategory) => {
    // If it's the challenge, proceed
    if (categoryId === 'challenge_fase2') {
      onSelectCategory(categoryId);
      return;
    }
    // Show a beautiful mockup/sandbox preview modal for Phase 2 question modules
    const modMap: Record<string, { label: string; desc: string }> = {
      gym: {
        label: 'Gimnasio Numérico Mental',
        desc: 'Módulo de cálculo veloz: sumas, restas, dobles, mitades y operaciones combinadas con prioridad algebraica (Fase 2).'
      },
      tables_action: {
        label: 'Tablas en Acción',
        desc: 'Domina las tablas de multiplicar de forma práctica, encontrando factores faltantes y resolviendo operaciones inversas.'
      },
      store: {
        label: 'Tienda Matemática',
        desc: 'Simula compras reales en R$, calcula vueltos y sumas con decimales redondeados para evitar errores de precisión.'
      },
      detective: {
        label: 'Detective de Problemas',
        desc: 'Identifica y subraya datos esenciales y distractores narrativos utilizando el subrayador interactivo inteligente.'
      },
      builder: {
        label: 'Constructor de Soluciones',
        desc: 'Conecta múltiples pasos lógicos en secuencia, donde la salida de cada operación alimenta la siguiente.'
      }
    };
    const details = modMap[categoryId];
    if (details) {
      setPreviewModule({ id: categoryId, ...details });
    } else {
      onSelectCategory(categoryId);
    }
  };

  // Categories displayed in the main grid including the ultimate challenge of Phase 2
  const categories: { id: GameCategory; label: string; icon: React.ReactNode; color: string; textColor: string; description: string }[] = [
    { 
      id: 'gym', 
      label: 'Gimnasio Mental', 
      icon: <Activity size={24} className="text-white animate-pulse" />, 
      color: 'bg-[#10B981]', 
      textColor: 'text-[#10B981]',
      description: 'Cálculo mental ultra veloz, dobles y mitades.'
    },
    { 
      id: 'tables_action', 
      label: 'Tablas en Acción', 
      icon: <Hash size={24} className="text-white" />, 
      color: 'bg-[#A855F7]', 
      textColor: 'text-[#A855F7]',
      description: 'Tablas de multiplicar y operaciones inversas.'
    },
    { 
      id: 'store', 
      label: 'Tienda Matemática', 
      icon: <ShoppingBag size={24} className="text-white" />, 
      color: 'bg-[#F97316]', 
      textColor: 'text-[#F97316]',
      description: 'Cálculo de cambio, billetes y precios en R$.'
    },
    { 
      id: 'detective', 
      label: 'Detective', 
      icon: <Search size={24} className="text-white" />, 
      color: 'bg-[#3B82F6]', 
      textColor: 'text-[#3B82F6]',
      description: 'Aislar distractores con subrayador interactivo.'
    },
    { 
      id: 'builder', 
      label: 'Constructor', 
      icon: <Wrench size={24} className="text-white" />, 
      color: 'bg-[#EC4899]', 
      textColor: 'text-[#EC4899]',
      description: 'Problemas de múltiples pasos conectados.'
    }
  ];

  // Sequential unlock order for Phase 2 disciplines
  const unlockOrder: GameCategory[] = ['gym', 'tables_action', 'store', 'detective', 'builder'];

  const isCategoryLocked = (categoryId: GameCategory): boolean => {
    if (user?.role === 'ADMIN') return false;
    if (categoryId === 'challenge_fase2') {
      return remainingLevels > 0;
    }
    const idx = unlockOrder.indexOf(categoryId);
    if (idx === 0) return false; // First module is always unlocked
    const prevCat = unlockOrder[idx - 1];
    return getCategoryLevel(prevCat) < 4; // Requires previous level 4 cleared
  };

  // Calculate global progress for Phase 2 (5 categories * 5 levels = 20)
  const basicCategories: GameCategory[] = ['gym', 'tables_action', 'store', 'detective', 'builder'];
  let totalLevelsUnlocked = 0;
  basicCategories.forEach(cat => {
    totalLevelsUnlocked += Math.min(getCategoryLevel(cat), 5);
  });
  const maxTotalLevels = 25; // 5 categories * 5 levels
  const globalProgressPercent = Math.round((totalLevelsUnlocked / maxTotalLevels) * 100);
  const remainingLevels = maxTotalLevels - totalLevelsUnlocked;

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-white overflow-y-auto w-full h-full custom-scrollbar transition-colors duration-300">
      {/* Background decorations - Ambient Glow */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col items-center justify-start min-h-screen relative z-10"
      >
        {/* Header Bar */}
        <motion.div variants={itemVariants} className="w-full flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <Activity size={20} className="text-white" />
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
              <p className="text-slate-900 dark:text-white font-black text-base tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-none font-display">
                {user?.username ? user.username.toLowerCase() : 'invitado'}
              </p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-emerald-500 transition-all duration-300 shadow-md">
                {user?.avatar ? (
                  <img src={getAvatarUrl(user.avatar)} alt={user?.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
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
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full mr-3">
                FASE 2
              </span>
              <span className="text-sm">
                Desarrollo Numérico y Razonamiento
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
              <div className="flex items-center text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 px-4 py-2 rounded-2xl group-hover:bg-emerald-500/20 transition-all shadow-sm">
                <Trophy size={22} className="mr-2 animate-pulse" />
                <span className="text-3xl font-black font-display leading-none">{totalLevelsUnlocked}</span>
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
            const currentLevel = Math.min(levelIdx + 1, 5); // Display level 1-5
            const progressPercent = Math.min((levelIdx / 5) * 100, 100);
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
                    : 'bg-white border-slate-100 shadow-xl dark:bg-[#162033] dark:border-slate-800 dark:shadow-none hover:shadow-2xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30 cursor-pointer'}`}
              >
                {/* Premium Inner Glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 blur-[40px] ${cat.color} pointer-events-none`} />

                <div className={`relative w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mb-6 shadow-md transition-all duration-300 z-10`}>
                  {cat.icon}
                  {isLocked && (
                    <div className="absolute -top-1.5 -right-1.5 bg-amber-50 border border-amber-200 dark:bg-amber-950/80 dark:border-amber-900 rounded-full p-1.5 shadow-lg flex items-center justify-center animate-pulse">
                      <Lock size={12} className="text-amber-500 dark:text-amber-400" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black font-display text-slate-800 dark:text-white mb-2 z-10">{cat.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 z-10 grow">{cat.description}</p>

                {isLocked ? (
                  <div className="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-amber-200/20 dark:border-amber-500/20 font-sans flex items-center gap-1 shadow-sm z-10">
                    <Lock size={11} className="text-amber-500" />
                    Bloqueado
                  </div>
                ) : isDominated ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider mb-8 font-sans z-10">
                    <span>Dominado</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-black text-sm">✓</span>
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-emerald-200/20 dark:border-emerald-500/20 font-sans z-10">
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

        {/* Bottom Banner */}
        <motion.div variants={itemVariants} className="w-full">
          {remainingLevels === 0 || user?.role === 'ADMIN' ? (
            /* Premium Banner for Dominating Phase 2 */
            <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_45px_rgba(16,185,129,0.35)] flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mr-5 shrink-0 border border-white/20 shadow-inner">
                  <Trophy size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1 font-display tracking-tight">
                    Desafío Mixto de la Fase 2
                  </h3>
                  <p className="text-emerald-100 text-sm leading-relaxed font-medium max-w-xl">
                    ¡Has completado exitosamente todos los módulos! Es momento de resolver el Desafío Mixto y demostrar tu maestría en Razonamiento Matemático.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleCategoryClick('challenge_fase2')}
                className="px-8 py-3.5 bg-white hover:bg-slate-50 text-emerald-600 font-bold rounded-2xl shadow-lg transition-all shrink-0 text-base font-sans cursor-pointer active:scale-95"
              >
                Iniciar Desafío Mixto
              </button>
            </div>
          ) : (
            /* Progress Banner showing outstanding levels */
            <div className="w-full bg-white dark:bg-[#162033] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center mr-5 shrink-0">
                    <Trophy size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 font-display tracking-tight">
                      Tu Camino al Desafío Mixto
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
                      Completa los 5 niveles en los 5 módulos de Razonamiento para desbloquear el examen final de la Fase 2.
                    </p>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display leading-none">{globalProgressPercent}%</span>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{totalLevelsUnlocked} de {maxTotalLevels} Niveles</p>
                </div>
              </div>

              {/* Progress track */}
              <div className="relative w-full">
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                    style={{ width: `${globalProgressPercent}%` }}
                  ></div>
                </div>
                
                {/* Horizontal tracks for children modules */}
                <div className="grid grid-cols-5 gap-2 text-center text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider">
                  <div>GIMNASIO</div>
                  <div>TABLAS</div>
                  <div>TIENDA</div>
                  <div>DETECTIVE</div>
                  <div>CONSTRUCTOR</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Module Description Preview Modal */}
      <AnimatePresence>
        {previewModule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-slate-200 dark:bg-[#162033] dark:border-slate-800 p-8 rounded-[2.5rem] max-w-md w-full text-center relative shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-100 dark:bg-[#070b14] dark:border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-lg">
                <Sparkles size={36} className="text-emerald-500 animate-pulse" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 font-display">
                {previewModule.label}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-sans">
                {previewModule.desc}
              </p>
              
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/30 text-amber-700 dark:text-amber-400 p-4 rounded-2xl text-xs mb-6 text-left leading-relaxed">
                🚀 <strong>Próximamente:</strong> Las plantillas estructuradas JSONB y el generador de base de datos asíncrono para este módulo se integrarán en la siguiente etapa del proyecto.
              </div>

              <button 
                onClick={() => setPreviewModule(null)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all cursor-pointer font-sans"
              >
                ¡Entendido, volver al menú!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomeScreenPhase2;
