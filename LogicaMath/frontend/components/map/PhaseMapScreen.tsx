import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, Brain, BookOpen, PieChart, Square, Box, Map, Lightbulb, GraduationCap, User as UserIcon, X, HelpCircle } from 'lucide-react';
import { User } from '../../types';
import { getAvatarUrl } from '../../services/storageService';

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
  const currentPhase = user.fase_actual_id || 1; // Sync with database field, fallback to Phase 1
  const [lockedModalPhase, setLockedModalPhase] = useState<{ index: number; title: string } | null>(null);

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
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#070A13] text-slate-50 font-sans pb-20 relative overflow-hidden">
      {/* Background decorations - Ambient Glow Distributed along Scroll height */}
      <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-15%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[55%] left-[-15%] w-[500px] h-[500px] bg-teal-600/8 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[600px] h-[600px] bg-pink-600/8 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Dashboard Header Bar */}
      <header className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col md:flex-row items-center justify-between z-10 relative gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-900/50">
              LogicaKids
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Tu Viaje Matemático</h1>
          <p className="text-slate-400 font-medium">Fase Actual: {currentPhase}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
          {/* User Profile Button */}
          <div 
            onClick={onGoProfile}
            className="flex items-center gap-3.5 cursor-pointer group bg-slate-800/50 hover:bg-slate-800 p-1.5 pr-6 rounded-full transition-all border border-transparent hover:border-slate-700/80 w-full sm:w-auto justify-center sm:justify-start hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden group-hover:border-blue-500 transition-all duration-300 shadow-inner">
              {user.avatar ? (
                <img 
                  src={getAvatarUrl(user.avatar)} 
                  alt={user.username} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <SafeIcon icon={UserIcon} className="text-slate-400 group-hover:text-blue-400 transition-colors" size={24} />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-white font-black text-base tracking-tight group-hover:text-blue-400 transition-colors leading-none">
                {user.username}
              </p>
            </div>
          </div>

          {/* Statistics Button */}
          <button 
            onClick={onGoStats}
            className="px-6 py-2.5 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700/60 hover:border-slate-600 transition-colors w-full sm:w-auto"
          >
            Estadísticas
          </button>

          {/* Admin Panel Button if admin */}
          {user.role === 'ADMIN' && onGoAdmin && (
            <button 
              onClick={onGoAdmin}
              className="px-6 py-2.5 rounded-full bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 font-bold border border-purple-800/60 hover:border-purple-700 transition-colors w-full sm:w-auto"
            >
              Admin Panel
            </button>
          )}

          {/* Logout Button */}
          <button 
            onClick={onLogout}
            className="px-6 py-2.5 rounded-full bg-slate-800 text-slate-300 font-bold hover:bg-red-500/20 hover:text-red-400 transition-colors border border-slate-700/80 w-full sm:w-auto"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Journey Map Main Timeline */}
      <main className="max-w-4xl mx-auto px-4 mt-8 relative z-10">
        <div className="flex flex-col gap-16 relative">
          {/* Central Connecting Timeline Line (Desktop Only) */}
          <div className="absolute left-1/2 top-4 bottom-4 w-1.5 bg-slate-800 -translate-x-1/2 rounded-full hidden md:block" />

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
              const isUnlocked = phase.index <= currentPhase;
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
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 z-10">
                    {isUnlocked ? (
                      <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
                    ) : (
                      <SafeIcon icon={Lock} size={16} className="text-slate-600" />
                    )}
                  </div>

                  {/* Card Container */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    <div 
                      onClick={() => handleCardClick(phase, isUnlocked)}
                      className={`w-full max-w-[380px] p-6 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden group
                        ${isUnlocked 
                          ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-500 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-800' 
                          : 'bg-slate-900/50 border-slate-800/50 cursor-not-allowed'}
                      `}
                    >
                      {/* Premium Inner Accent Glow on Hover */}
                      {isUnlocked && (
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${phase.color}`} />
                      )}

                      {/* Header block within card */}
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 ${phase.color} text-white shadow-lg ${phase.shadow}`}>
                          <SafeIcon icon={phase.icon} size={28} />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                            Fase {phase.index}
                          </span>
                          {!isUnlocked && (
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 justify-end">
                              <SafeIcon icon={Lock} size={12} /> Bloqueado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Phase Title */}
                      <h3 className={`text-2xl font-black mb-2 relative z-10 md:text-3xl ${isUnlocked ? 'text-white' : 'text-slate-200'}`}>
                        {phase.title}
                      </h3>
                      
                      {/* Phase Description */}
                      <p className={`text-sm leading-relaxed relative z-10 ${isUnlocked ? 'text-slate-300' : 'text-slate-400'}`}>
                        {phase.description}
                      </p>

                      {/* Symmetrical Button Layout */}
                      {!isUnlocked ? (
                        <div className="mt-8 relative z-10">
                          <button disabled className="w-full py-3 rounded-xl bg-slate-800/40 text-slate-500 font-bold border border-slate-800/60 cursor-not-allowed flex items-center justify-center gap-2">
                            <SafeIcon icon={Lock} size={14} /> Fase Resguardada
                          </button>
                        </div>
                      ) : (
                        <div className="mt-8 relative z-10">
                          <button className="w-full py-3 rounded-xl bg-slate-700/50 text-white font-bold group-hover:bg-blue-500 transition-colors">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 p-8 rounded-[2.5rem] max-w-md w-full text-center relative shadow-2xl"
            >
              <button 
                onClick={() => setLockedModalPhase(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
              >
                <SafeIcon icon={X} size={18} />
              </button>

              <div className="w-20 h-20 bg-slate-900 border-2 border-slate-700/80 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-lg animate-bounce">
                <SafeIcon icon={Lock} size={36} className="text-amber-500" />
              </div>

              <h3 className="text-2xl font-black text-white mb-3">Fase Resguardada</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Para acceder a la <span className="font-bold text-amber-400">Fase {lockedModalPhase.index}: {lockedModalPhase.title}</span>, primero debes completar y aprobar todas las fases anteriores de tu viaje matemático.
              </p>

              <button 
                onClick={() => setLockedModalPhase(null)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
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
