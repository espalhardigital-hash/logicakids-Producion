import React from 'react';
import { motion } from 'motion/react';
import { Lock, Zap, Brain, BookOpen, PieChart, Square, Box, Map, Lightbulb, GraduationCap, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface GeneralMapProps {
  user: User;
  onSelectPhase: (phaseIndex: number) => void;
  onLogout: () => void;
}

export default function GeneralMap({ user, onSelectPhase, onLogout }: GeneralMapProps) {
  const currentPhase = (user.current_phase || 0) + 1; // The max phase unlocked by the user

  const phases = [
    {
      index: 1,
      title: 'Aritmética Básica',
      description: 'Sumas, restas, multiplicaciones y divisiones.',
      icon: Zap,
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/50'
    },
    {
      index: 2,
      title: 'Desarrollo Numérico y Razonamiento',
      description: 'Cálculo mental, sistema monetario y lectura matemática.',
      icon: Brain,
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/50'
    },
    {
      index: 3,
      title: 'Problemas de Texto',
      description: 'Lectura, interpretación, elección de operación y problemas combinados.',
      icon: BookOpen,
      color: 'bg-orange-500',
      shadow: 'shadow-orange-500/50'
    },
    {
      index: 4,
      title: 'Fracciones, Porcentajes y Gráficos',
      description: 'Relación parte-todo, métricas y visualización de datos.',
      icon: PieChart,
      color: 'bg-purple-500',
      shadow: 'shadow-purple-500/50'
    },
    {
      index: 5,
      title: 'Geometría Plana',
      description: 'Figuras, áreas, perímetros y comprensión espacial bidimensional.',
      icon: Square,
      color: 'bg-rose-500',
      shadow: 'shadow-rose-500/50'
    },
    {
      index: 6,
      title: 'Geometría Espacial',
      description: 'Visualización 3D, prismas, cilindros y cálculo de volumen.',
      icon: Box,
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-500/50'
    },
    {
      index: 7,
      title: 'Coordenadas y Desplazamientos',
      description: 'Mapas, rutas, plano cartesiano y orientación.',
      icon: Map,
      color: 'bg-teal-500',
      shadow: 'shadow-teal-500/50'
    },
    {
      index: 8,
      title: 'Probabilidad, Combinatoria y Lógica',
      description: 'Casos posibles, patrones y razonamiento abstracto.',
      icon: Lightbulb,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/50'
    },
    {
      index: 9,
      title: 'Simulados Pedro II',
      description: 'Práctica para examen real, correcciones e identificador de errores.',
      icon: GraduationCap,
      color: 'bg-yellow-600',
      shadow: 'shadow-yellow-600/50'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans pb-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

      <header className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col md:flex-row items-center justify-between z-10 relative gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-display font-black text-white mb-2 tracking-tight">Tu Viaje Matemático</h1>
          <p className="text-slate-400 font-medium">Fase Actual: {currentPhase}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer group bg-slate-800/50 hover:bg-slate-800 py-2 px-4 rounded-full transition-colors border border-transparent hover:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden group-hover:border-blue-500 transition-colors">
               <UserIcon className="text-slate-400 group-hover:text-blue-400 transition-colors" size={20} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-white font-bold leading-tight">{user.username}</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors">Ver Perfil</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-2.5 rounded-full bg-slate-800 text-slate-300 font-bold hover:bg-red-500/20 hover:text-red-400 transition-colors border border-slate-700 w-full sm:w-auto"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 relative z-10">
        <div className="flex flex-col gap-12 relative">
          {/* Timeline connecting line */}
          <div className="absolute left-1/2 top-4 bottom-4 w-1.5 bg-slate-800 -translate-x-1/2 rounded-full hidden md:block" />

          {phases.map((phase, i) => {
            const isUnlocked = phase.index <= currentPhase;
            const alignRight = i % 2 !== 0;

            return (
              <motion.div 
                key={phase.index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-center ${alignRight ? 'md:flex-row-reverse' : 'md:flex-row'} flex-col gap-6 md:gap-12 w-full`}
              >
                {/* Timeline node */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 z-10">
                  {isUnlocked ? (
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  ) : (
                    <Lock size={16} className="text-slate-600" />
                  )}
                </div>

                {/* Card Container */}
                <div className="w-full md:w-1/2 flex justify-center">
                   <div 
                     onClick={() => isUnlocked && onSelectPhase(phase.index)}
                     className={`w-full max-w-[360px] p-6 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden group
                       ${isUnlocked 
                         ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-800' 
                         : 'bg-slate-900/50 border-slate-800/50 opacity-60 cursor-not-allowed'}
                     `}
                   >
                      {/* Inner glow effect on hover if unlocked */}
                      {isUnlocked && (
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${phase.color}`} />
                      )}

                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${isUnlocked ? `${phase.color} text-white shadow-lg ${phase.shadow}` : 'bg-slate-800 text-slate-500'}`}>
                          <phase.icon size={28} />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                            Fase {phase.index}
                          </span>
                          {!isUnlocked && (
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 justify-end">
                              <Lock size={12} /> Bloqueado
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className={`text-2xl font-display font-black mb-2 relative z-10 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                        {phase.title}
                      </h3>
                      <p className={`text-sm leading-relaxed relative z-10 ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                        {phase.description}
                      </p>

                      {isUnlocked && (
                         <div className="mt-8 relative z-10">
                           <button className="w-full py-3 rounded-xl bg-slate-700/50 text-white font-bold group-hover:bg-blue-500 transition-colors">
                             Entrar a Fase {phase.index}
                           </button>
                         </div>
                      )}
                   </div>
                </div>
                
                {/* Empty space for alignment */}
                <div className="hidden md:block w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
