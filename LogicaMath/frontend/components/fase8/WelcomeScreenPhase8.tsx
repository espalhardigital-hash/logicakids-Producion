import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { getFaseMetadata, FaseModulo, FaseNivel } from '../fase_generic/faseMetadata';
import { getAvatarUrl } from '../../services/storageService';
import { motion } from 'framer-motion';
import '../fase_generic/FaseGenericStyles.css';

// ── Icons Helper ───────────────────────────────────────────────

const IconMap: Record<string, React.ComponentType<any>> = {
  book: Lucide.BookOpen,
  table: Lucide.Table,
  puzzle: Lucide.Brain,
  globe: Lucide.Globe,
  pie: Lucide.PieChart,
  divide: Lucide.Percent,
  percent: Lucide.Percent,
  beaker: Lucide.HelpCircle,
  border: Lucide.Square,
  grid: Lucide.Grid,
  shapes: Lucide.Shapes,
  monitor: Lucide.Tv,
  cube: Lucide.Box,
  layers: Lucide.Layers,
  compass: Lucide.Compass,
  crosshair: Lucide.Crosshair,
  clock: Lucide.Clock,
  calendar: Lucide.Calendar,
  trending: Lucide.TrendingUp,
  shuffle: Lucide.Shuffle,
  target: Lucide.Target,
  graduation: Lucide.GraduationCap,
};

function DynamicIcon({ name, size = 24, color = '#fff' }: { name: string; size?: number; color?: string }) {
  const IconComponent = IconMap[name] || Lucide.HelpCircle;
  return <IconComponent size={size} color={color} />;
}

// ── Props ──────────────────────────────────────────────────────

interface WelcomeScreenPhase8Props {
  studentName?: string;
  userAvatar?: string;
  userRole?: string;
  onModuleSelect: (moduloId: number, nivelId: number) => void;
  onBack: () => void;
}

export default function WelcomeScreenPhase8({
  studentName = 'Estudiante',
  userAvatar,
  userRole,
  onModuleSelect,
  onBack,
}: WelcomeScreenPhase8Props) {
  const faseId = 8;

  const [selectedModule, setSelectedModule] = useState<FaseModulo | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Record<string, boolean>>({});

  const metadata = getFaseMetadata(faseId);

  // Load completed levels progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lk_fase_progress_${faseId}`);
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }
    } catch (e) {
      console.error('[WelcomeScreenPhase8] Error loading progress', e);
    }
  }, [faseId]);

  if (!metadata) {
    return (
      <div className="fg-screen">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>Fase no encontrada</h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px' }}>La Fase {faseId} aún no tiene metadatos configurados.</p>
          <button onClick={onBack} className="fg-eval-btn">Volver al Mapa</button>
        </div>
      </div>
    );
  }

  // Check if a level is unlocked
  const isLevelUnlocked = (modulo: FaseModulo, nivel: FaseNivel) => {
    return true; // FORCE UNLOCK
  };

  // Check if a module is unlocked (Module 1 is always unlocked, others unlocked if previous module is completed)
  const isModuleUnlocked = (modulo: FaseModulo) => {
    if (userRole === 'ADMIN') return true;
    if (modulo.moduloId === 1) return true;

    // Check if the previous module's last level (Level 3) is completed
    const prevModule = metadata.modulos.find(m => m.moduloId === modulo.moduloId - 1);
    if (!prevModule) return true;
    const prevLastLevelKey = `${prevModule.moduloId}_3`;
    return !!completedLevels[prevLastLevelKey];
  };

  // Calculate global module progress percentage
  const getModuleProgress = (modulo: FaseModulo) => {
    const total = modulo.niveles.length;
    const completed = modulo.niveles.filter(n => completedLevels[`${modulo.moduloId}_${n.nivelId}`]).length;
    return Math.round((completed / total) * 100);
  };

  const handleModuleClick = (modulo: FaseModulo) => {
    if (!isModuleUnlocked(modulo)) return;
    setSelectedModule(modulo);
  };

  const handleBackClick = () => {
    if (selectedModule) {
      setSelectedModule(null);
    } else {
      onBack();
    }
  };

  const isEvalLocked = false;

  return (
    <div 
      className="fg-screen"
      style={{
        ['--phase-color-primary' as any]: metadata.colorPrimario,
        ['--phase-color-secondary' as any]: metadata.colorSecundario,
        ['--phase-color-glow' as any]: `${metadata.colorPrimario}0d`,
      }}
    >
      {/* ── Header ── */}
      <header className="fg-header">
        <div className="fg-header-left-side">
          {/* Botón volver en la esquina izquierda */}
          <button 
            className="fg-back-btn" 
            onClick={handleBackClick} 
            aria-label="Volver"
          >
            <Lucide.ArrowLeft size={20} />
          </button>

          {/* Avatar y Saludo */}
          <div className="fg-header-profile">
            <div className="fg-avatar-container">
              {userAvatar ? (
                <img src={getAvatarUrl(userAvatar)} alt={studentName} className="fg-avatar-img" />
              ) : (
                <div className="fg-avatar-placeholder">
                  <Lucide.Shield color={metadata.colorPrimario} size={24} />
                </div>
              )}
            </div>
            <div className="fg-header-user-info">
              <div className="fg-header-greeting">
                ¡Hola, {studentName}! <span>👋</span>
              </div>
              <div className="fg-header-subtitle">
                <span className="fg-badge-fase">FASE {faseId}</span>
                <span className="fg-header-fasename">{metadata.nombre}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="fg-header-right">
          {/* Progress trophy indicator */}
          <div 
            style={{
              background: 'rgba(22, 32, 51, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Lucide.Trophy size={18} color="#F59E0B" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
              {Object.values(completedLevels).filter(Boolean).length * 10} pts
            </span>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="fg-content">
        {!selectedModule ? (
          <>
            {/* Grid of Modules */}
            <div className="fg-modules-grid">
              {metadata.modulos.map((modulo) => {
                const unlocked = isModuleUnlocked(modulo);
                const progress = getModuleProgress(modulo);
                
                return (
                  <div
                    key={modulo.moduloId}
                    className={`fg-module-card ${unlocked ? 'unlocked' : 'locked'}`}
                    style={{ ['--card-accent' as any]: modulo.color }}
                    onClick={() => unlocked && handleModuleClick(modulo)}
                    role={unlocked ? 'button' : undefined}
                    tabIndex={unlocked ? 0 : undefined}
                    onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && unlocked) handleModuleClick(modulo); }}
                  >
                    <div 
                      className="fg-module-icon"
                      style={{ background: unlocked ? `${modulo.color}15` : 'rgba(255,255,255,0.02)' }}
                    >
                      {unlocked ? (
                        <DynamicIcon name={modulo.icono} color={modulo.color} />
                      ) : (
                        <Lucide.Lock size={24} color="#64748b" />
                      )}
                    </div>

                    <h3 className="fg-module-name">{modulo.nombre}</h3>
                    <p className="fg-module-desc">{modulo.descripcion}</p>

                    {/* Progress Bar */}
                    <div className="fg-module-progress">
                      <div className="fg-module-progress-label">
                        <span>PROGRESO</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="fg-progress-track">
                        <div 
                          className="fg-progress-fill" 
                          style={{ 
                            width: `${progress}%`,
                            background: unlocked
                              ? `linear-gradient(90deg, ${modulo.color}b3, ${modulo.color})`
                              : 'rgba(255, 255, 255, 0.1)'
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* General Evaluation Banner or General Progress Card */}
            {!isEvalLocked ? (
              <div className="fg-evaluation-card">
                <div>
                  <h3 className="fg-eval-title">Desafío Final de Maestría</h3>
                  <p className="fg-eval-desc">
                    Demuestra tu completo dominio en la Fase {faseId} resolviendo el Desafío de entrada pura.
                    Necesitarás una maestría del 90% para obtener tu insignia.
                  </p>
                </div>
                <button 
                  className="fg-eval-btn"
                  onClick={() => onModuleSelect(99, 99)}
                >
                  Iniciar Desafío
                </button>
              </div>
            ) : (() => {
              const totalLevelsPassed = metadata.modulos.reduce((sum, m) => sum + m.niveles.filter(n => completedLevels[`${m.moduloId}_${n.nivelId}`]).length, 0);
              const maxTotalLevels = metadata.modulos.reduce((sum, m) => sum + m.niveles.length, 0);
              const globalProgressPercent = maxTotalLevels > 0 ? Math.round((totalLevelsPassed / maxTotalLevels) * 100) : 0;

              return (
                <div className="w-full bg-white dark:bg-[#162033] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none transition-all duration-300">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mr-5 shrink-0">
                        <Lucide.Trophy size={32} color="#3b82f6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 font-display tracking-tight">
                          Tu Camino a la Fase {faseId + 1}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                          Completa todos los niveles de práctica en cada módulo para desbloquear el Desafío Mixto y avanzar de fase.
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
                      {metadata.modulos.map((m) => {
                        const completedCount = m.niveles.filter(n => completedLevels[`${m.moduloId}_${n.nivelId}`]).length;
                        const totalCount = m.niveles.length;
                        const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                        return (
                          <div key={m.moduloId} className="flex flex-col items-center gap-1.5 flex-1 px-2">
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: m.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase text-center">{m.nombre}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          /* Levels Sub-view */
          <div 
            className="fg-levels-container"
            style={{ ['--module-accent' as any]: selectedModule.color }}
          >
            {/* Volver al menu de modulos */}
            <button onClick={() => setSelectedModule(null)} className="fg-levels-back-btn">
              <Lucide.ArrowLeft size={16} />
              <span>Volver a módulos</span>
            </button>

            <div className="fg-levels-header">
              <h2 className="fg-levels-title">Niveles de {selectedModule.nombre}</h2>
              <p className="fg-levels-subtitle">Supera cada nivel con al menos 90% para avanzar.</p>
            </div>

            <div className="fg-levels-grid">
              {selectedModule.niveles.map((nivel) => {
                const unlocked = isLevelUnlocked(selectedModule, nivel);
                const completed = !!completedLevels[`${selectedModule.moduloId}_${nivel.nivelId}`];
                const isDesafio = nivel.nombre.toLowerCase().includes('desafío');

                return (
                  <div
                    key={nivel.nivelId}
                    className={`fg-level-card ${unlocked ? 'unlocked' : 'locked'} ${isDesafio ? 'desafio-card' : ''}`}
                    onClick={() => unlocked && onModuleSelect(selectedModule.moduloId, nivel.nivelId)}
                    style={isDesafio ? { border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.05)' } : {}}
                  >
                    <div className="fg-level-circle" style={isDesafio ? { background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)' } : {}}>
                      {completed ? (
                        <Lucide.Check size={32} color="#10B981" />
                      ) : !unlocked ? (
                        <Lucide.Lock size={24} color="#64748b" />
                      ) : isDesafio ? (
                        <Lucide.Shield size={28} color="#F59E0B" />
                      ) : (
                        nivel.nivelId
                      )}
                    </div>

                    <h4 className="fg-level-title" style={isDesafio ? { color: '#FCD34D' } : {}}>
                      {isDesafio ? 'Evaluación' : `Nivel ${nivel.nivelId}`}
                    </h4>
                    <p className="fg-level-desc">{nivel.nombre}</p>

                    {/* Status Badge */}
                    {completed && (
                      <div className="fg-level-status">
                        <span 
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#34D399',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            padding: '4px 8px',
                            borderRadius: '9999px'
                          }}
                        >
                          Dominado
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
