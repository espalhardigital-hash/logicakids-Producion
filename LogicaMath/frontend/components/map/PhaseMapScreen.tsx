import React, { useState, Component, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, Brain, BookOpen, PieChart, Square, Box, Map, Lightbulb, GraduationCap, User as UserIcon, X, HelpCircle } from 'lucide-react';
import { User } from '../../types';
import { getAvatarUrl, getCurrentUserFull } from '../../services/storageService';

// React Error Boundary specifically designed to catch icon rendering failures
class SafeIconErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  props!: { children: React.ReactNode; fallback: React.ReactNode };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("SafeIconErrorBoundary caught an icon rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface SafeIconProps {
  icon: React.ComponentType<any>;
  size?: number;
  className?: string;
}

// High-robustness component ensuring Lucide errors never crash the journey map
function SafeIcon({ icon: Icon, size = 24, className = '', ...props }: SafeIconProps) {
  const defaultFallback = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`animate-pulse ${className}`}
      style={{ width: size, height: size }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );

  return (
    <SafeIconErrorBoundary fallback={defaultFallback}>
      <Icon size={size} className={className} {...props} />
    </SafeIconErrorBoundary>
  );
}

interface PhaseMapScreenProps {
  user: User;
  onSelectPhase: (phaseIndex: number) => void;
  onLogout: () => void;
  onGoProfile: () => void;
  onGoStats: () => void;
  onGoAdmin?: () => void;
}

export default function PhaseMapScreen({
  user,
  onSelectPhase,
  onLogout,
  onGoProfile,
  onGoStats,
  onGoAdmin
}: PhaseMapScreenProps) {
  const [currentPhase, setCurrentPhase] = useState(user.fase_actual_id || 1);
  const [lockedModalPhase, setLockedModalPhase] = useState<{ index: number; title: string } | null>(null);

  useEffect(() => {
    // Always refresh the current phase from backend when map loads
    const fetchLatestPhase = async () => {
      try {
        const dbUser = await getCurrentUserFull();
        if (dbUser && dbUser.fase_actual_id) {
          setCurrentPhase(dbUser.fase_actual_id);
        }
      } catch (err) {
        console.error("Error refreshing user phase on map:", err);
      }
    };
    fetchLatestPhase();
  }, []);

  const phases = [
    {
      index: 1,
      title: 'Aritmética Básica',
      description: 'Sumas, restas, multiplicaciones y divisiones. ¡Calentamiento mental!',
      icon: Zap,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      shadow: 'shadow-blue-500/50',
      ringColor: 'group-hover:border-blue-500/50'
    },
    {
      index: 2,
      title: 'Desarrollo Numérico y Razonamiento',
      description: 'Cálculo mental, comprensión del sistema monetario y lectura de problemas.',
      icon: Brain,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      shadow: 'shadow-emerald-500/50',
      ringColor: 'group-hover:border-emerald-500/50'
    },
    {
      index: 3,
      title: 'Problemas de Texto',
      description: 'Aprende a leer, interpretar y estructurar datos para resolver problemas matemáticos.',
      icon: BookOpen,
      color: 'bg-orange-500',
      textColor: 'text-orange-400',
      shadow: 'shadow-orange-500/50',
      ringColor: 'group-hover:border-orange-500/50'
    },
    {
      index: 4,
      title: 'Fracciones, Porcentajes y Gráficos',
      description: 'Trabaja la relación parte-todo mediante fracciones simples, porcentajes y gráficos.',
      icon: PieChart,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      shadow: 'shadow-purple-500/50',
      ringColor: 'group-hover:border-purple-500/50'
    },
    {
      index: 5,
      title: 'Geometría Plana',
      description: 'Preparación para ejercicios espaciales utilizando figuras bidimensionales y Tangram.',
      icon: Square,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      shadow: 'shadow-rose-500/50',
      ringColor: 'group-hover:border-rose-500/50'
    },
    {
      index: 6,
      title: 'Geometría Espacial',
      description: 'Desarrolla visualización 3D interactuando con sólidos y calculando bloques.',
      icon: Box,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400',
      shadow: 'shadow-indigo-500/50',
      ringColor: 'group-hover:border-indigo-500/50'
    },
    {
      index: 7,
      title: 'Coordenadas y Desplazamientos',
      description: 'Plano cartesiano, pares ordenados y nociones de lateralidad / direcciones.',
      icon: Map,
      color: 'bg-teal-500',
      textColor: 'text-teal-400',
      shadow: 'shadow-teal-500/50',
      ringColor: 'group-hover:border-teal-500/50'
    },
    {
      index: 8,
      title: 'Probabilidad, Combinatoria y Lógica',
      description: 'Razonamiento estructurado: identificar casos favorables, secuencias y múltiplos/divisores.',
      icon: Lightbulb,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      shadow: 'shadow-amber-500/50',
      ringColor: 'group-hover:border-amber-500/50'
    },
    {
      index: 9,
      title: 'Simulados Pedro II',
      description: 'Preparación decisiva para el formato real del examen con simulacros completos.',
      icon: GraduationCap,
      color: 'bg-yellow-600',
      textColor: 'text-yellow-500',
      shadow: 'shadow-yellow-600/50',
      ringColor: 'group-hover:border-yellow-600/50'
    }
  ];

  const handleCardClick = (phase: typeof phases[0], isUnlocked: boolean) => {
    if (isUnlocked) {
      onSelectPhase(phase.index);
    } else {
      setLockedModalPhase({ index: phase.index, title: phase.title });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-white font-sans pb-20 relative overflow-hidden transition-colors duration-300">
      {/* Background decorations - Ambient Glow */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Dashboard Header Bar */}
      <header className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col md:flex-row items-center justify-between z-10 relative gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-500/30 dark:text-blue-400">
              LogicaKids
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight font-display">Tu Viaje Matemático</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Fase Actual: {currentPhase}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          {/* User Profile Button */}
          <div 
            onClick={onGoProfile}
            className="flex items-center gap-3.5 cursor-pointer group bg-white border border-slate-200 dark:bg-[#162033] dark:border-slate-800 p-1.5 pr-6 rounded-full transition-all w-full sm:w-auto justify-center sm:justify-start hover:shadow-lg active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-100 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-blue-500 transition-all duration-300 shadow-inner">
              {user.avatar ? (
                <img 
                  src={getAvatarUrl(user.avatar)} 
                  alt={user.username} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <SafeIcon icon={UserIcon} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" size={24} />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-slate-900 dark:text-white font-black text-base tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-none font-display">
                {user.username}
              </p>
            </div>
          </div>

          {/* Statistics Button */}
          <button 
            onClick={onGoStats}
            className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:bg-[#162033] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors w-full sm:w-auto font-bold cursor-pointer font-sans"
          >
            Estadísticas
          </button>

          {/* Admin Panel Button if admin */}
          {user.role === 'ADMIN' && onGoAdmin && (
            <button 
              onClick={onGoAdmin}
              className="px-6 py-2.5 rounded-full bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-100 dark:bg-[#1d162b] dark:border-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-950/60 transition-colors w-full sm:w-auto font-bold cursor-pointer font-sans"
            >
              Admin Panel
            </button>
          )}

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:bg-[#162033] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900/50 transition-colors w-full sm:w-auto font-bold cursor-pointer font-sans"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Journey Map Main Timeline */}
      <main className="max-w-4xl mx-auto px-4 mt-8 relative z-10">
        <div className="flex flex-col gap-16 relative">
          {/* Central Connecting Timeline Line (Desktop Only) */}
          <div className="absolute left-1/2 top-4 bottom-4 w-1.5 bg-slate-200 dark:bg-slate-800/50 -translate-x-1/2 rounded-full hidden md:block" />

          {/* Staggered Animation Wrapper */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="flex flex-col gap-12"
          >
            {phases.map((phase, i) => {
              const isUnlocked = user.role === 'ADMIN' || phase.index <= currentPhase;
              const isPhaseDominated = user.role === 'ADMIN' || phase.index < currentPhase;
              const alignRight = i % 2 !== 0;

              return (
                <motion.div 
                  key={phase.index}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0 }
                  }}
                  className={`relative flex items-center ${alignRight ? 'md:flex-row-reverse' : 'md:flex-row'} flex-col gap-6 md:gap-12 w-full`}
                >
                  {/* Timeline Central Node Bubble (Desktop Only) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border-4 border-slate-200 dark:bg-[#070b14] dark:border-slate-800 z-10">
                    {isUnlocked ? (
                      <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] dark:shadow-[0_0_15px_rgba(59,130,246,0.9)] animate-pulse" />
                    ) : (
                      <SafeIcon icon={Lock} size={16} className="text-amber-500 dark:text-amber-400/80 animate-pulse" />
                    )}
                  </div>

                  {/* Card Container */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    <div 
                      onClick={() => handleCardClick(phase, isUnlocked)}
                      className={`w-full max-w-[380px] p-6 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group
                        ${isUnlocked 
                          ? 'bg-white border-slate-100 hover:bg-slate-50 hover:border-blue-500/50 hover:shadow-xl dark:bg-[#162033] dark:border-slate-800 dark:hover:bg-[#1a263d] dark:hover:border-blue-500/50 cursor-pointer hover:-translate-y-2' 
                          : 'bg-white/95 border-slate-200/80 dark:bg-[#162033]/90 dark:border-slate-800/70 shadow-md cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-700/80'}
                      `}
                    >
                      {/* Premium Inner Accent Glow on Hover */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 blur-[50px] ${phase.color} pointer-events-none`} />

                      {/* Header block within card */}
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 ${phase.color} text-white shadow-lg`}>
                          <SafeIcon icon={phase.icon} size={28} />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1 font-display">
                            Fase {phase.index}
                          </span>
                          {isPhaseDominated ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50 font-extrabold text-[10px] uppercase tracking-wider">
                              ✓ Dominada ✅
                            </span>
                          ) : !isUnlocked && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50 font-extrabold text-[10px] uppercase tracking-wider shadow-sm animate-pulse">
                              <SafeIcon icon={Lock} size={10} /> Bloqueada 🔒
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Phase Title */}
                      <h3 className="text-2xl font-black mb-2 relative z-10 md:text-3xl font-display text-slate-900 dark:text-white">
                        {phase.title}
                      </h3>
                      
                      {/* Phase Description */}
                      <p className="text-sm leading-relaxed relative z-10 text-slate-600 dark:text-slate-300">
                        {phase.description}
                      </p>

                      {/* Symmetrical Button Layout */}
                      {!isUnlocked ? (
                        <div className="mt-8 relative z-10">
                          <button disabled className="w-full py-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400 font-extrabold cursor-not-allowed flex items-center justify-center gap-2 font-sans transition-all">
                            <SafeIcon icon={Lock} size={14} className="text-amber-500 animate-pulse" /> Fase Resguardada
                          </button>
                        </div>
                      ) : isPhaseDominated ? (
                        <div className="mt-8 relative z-10">
                          <button className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-950/60 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans">
                            <span>✓</span> Repasar Fase (Dominada) ✅
                          </button>
                        </div>
                      ) : (
                        <div className="mt-8 relative z-10">
                          <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-200 dark:shadow-none dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] cursor-pointer font-sans">
                            Entrar a Fase {phase.index}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Empty space for alignment (Desktop Only) */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>

      {/* Lock Warning Modal (When clicking a locked phase) */}
      <AnimatePresence>
        {lockedModalPhase && (
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
              <button 
                onClick={() => setLockedModalPhase(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white transition-all cursor-pointer"
              >
                <SafeIcon icon={X} size={18} />
              </button>

              <div className="w-20 h-20 bg-slate-100 border-2 border-slate-200 dark:bg-[#070b14] dark:border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-lg animate-bounce">
                <SafeIcon icon={Lock} size={36} className="text-amber-500" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 font-display">Fase Resguardada</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-sans">
                Para acceder a la <span className="font-bold text-amber-500">Fase {lockedModalPhase.index}: {lockedModalPhase.title}</span>, primero debes completar y aprobar todas las fases anteriores de tu viaje matemático.
              </p>

              <button 
                onClick={() => setLockedModalPhase(null)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all cursor-pointer font-sans"
              >
                ¡Entendido, a seguir entrenando!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
