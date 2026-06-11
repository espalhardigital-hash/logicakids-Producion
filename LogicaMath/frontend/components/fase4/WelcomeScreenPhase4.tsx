/**
 * WelcomeScreenPhase4.tsx
 * ─────────────────────────────────────────────────────────────
 * Hub de selección de módulos para la Fase 4: Fracciones, Porcentajes y Proporciones.
 */

import React, { useEffect, useState, useCallback } from 'react';
import './Fase4Styles.css';
import { getFase4Dashboard } from './Fase4Service';
import type { Fase4Dashboard, Fase4ModuloInfo } from './Fase4Types';
import { getAvatarUrl } from '../../services/storageService';
import { motion } from 'framer-motion';

// ── Íconos SVG inline ───────────────────────────────────────────

const Icons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  'pie-chart': ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  divide: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="2" /><line x1="5" y1="12" x2="19" y2="12" /><circle cx="12" cy="18" r="2" />
    </svg>
  ),
  percent: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
  beaker: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12" /><path d="M18 3v13a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V3" /><path d="M6 14h12" />
    </svg>
  ),
  check: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  lock: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  trophy: ({ size = 28, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21" />
      <path d="M4 5h16" /><path d="M19 5v6a7 7 0 01-14 0V5" />
      <path d="M19 5a2 2 0 002-2H3a2 2 0 002 2" />
    </svg>
  ),
  arrow_left: ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  shield: ({ size = 22, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  activity: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

const ESTADO_LABELS: Record<string, string> = {
  dominado:    'DOMINADO',
  en_progreso: 'EN PROGRESO',
  bloqueado:   'BLOQUEADO',
};

interface Props {
  onModuleSelect: (moduloId: number, nivelId?: number) => void;
  onBack: () => void;
  studentName?: string;
  userAvatar?: string;
  userRole?: string;
}

export const WelcomeScreenPhase4: React.FC<Props> = ({
  onModuleSelect,
  onBack,
  studentName = 'Estudiante',
  userAvatar,
  userRole,
}) => {
  const [dashboard, setDashboard] = useState<Fase4Dashboard | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Fase4ModuloInfo | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await getFase4Dashboard();
      
      // -- Si es ADMIN, desbloqueamos todo para pruebas de desarrollo
      if (userRole === 'ADMIN') {
        data = {
          ...data,
          desafio_mixto_disponible: true,
          desafio_mixto_estado: data.desafio_mixto_estado === 'completado' ? 'completado' : 'en_progreso',
          modulos: data.modulos.map(m => ({
            ...m,
            estado: m.estado === 'bloqueado' ? 'en_progreso' : m.estado,
            niveles: m.niveles.map(n => ({
              ...n,
              estado: n.estado === 'bloqueado' ? 'en_progreso' : n.estado,
            }))
          }))
        };
      }
      
      setDashboard(data);
    } catch (e: unknown) {
      console.error('[Fase4] Error de red al cargar dashboard:', e);
      setError('Error de conexión. No se pudo cargar el mapa de misiones.');
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [studentName, userRole]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleModuleClick = (modulo: Fase4ModuloInfo) => {
    if (modulo.estado === 'bloqueado' && userRole !== 'ADMIN') return;
    setSelectedModule(modulo);
  };

  const handleChallengeClick = () => {
    if (!dashboard?.desafio_mixto_disponible) return;
    onModuleSelect(99, 99); // 99, 99 = Desafío Mixto
  };

  if (loading) {
    return (
      <div className="f4-screen-wrapper">
        <div className="f4-loading-spinner-wrap">
          <div className="f4-spinner-element" />
          <span>Cargando Fase 4…</span>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="f4-screen-wrapper">
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', maxWidth: '400px', margin: 'auto' }}>
          <p className="text-red-400 font-bold mb-4">{error || 'No se pudo cargar el mapa de misiones.'}</p>
          <button
            onClick={loadDashboard}
            className="f4-challenge-row-btn"
            style={{ background: '#a855f7', color: '#ffffff', border: 'none' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const nombre = dashboard.alumno_nombre || studentName;

  return (
    <div className="f4-screen-wrapper">
      {/* ── Header Premium ── */}
      <header className="f4-dashboard-header">
        <div className="f4-header-left-wrap">
          <button 
            className="f4-nav-back-btn" 
            onClick={selectedModule ? () => setSelectedModule(null) : onBack} 
            aria-label="Volver"
          >
            <Icons.arrow_left />
          </button>

          <div className="f4-profile-summary">
            <div className="f4-avatar-badge-wrap">
              {userAvatar ? (
                <img src={getAvatarUrl(userAvatar)} alt={nombre} className="f4-avatar-media" />
              ) : (
                <div className="f4-avatar-media-placeholder">
                  <Icons.shield color="#a855f7" size={24} />
                </div>
              )}
            </div>
            <div className="f4-header-greetings-box">
              <div className="f4-greeting-text">
                ¡Hola, {nombre}! <span>👋</span>
              </div>
              <div className="f4-greeting-subtitle">
                <span className="f4-phase-indicator">FASE 4</span>
                <span className="f4-phase-display-name">Fracciones, Porcentajes y Proporciones</span>
              </div>
            </div>
          </div>
        </div>

        <div className="f4-header-right-wrap">
          <div className="f4-score-indicator-badge">
            <span className="f4-score-badge-title">Mi Progreso</span>
            <div className="f4-score-badge-val">
              <Icons.trophy size={18} color="#F59E0B" />
              {dashboard.puntos_totales} pts
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenido Principal ── */}
      <main className="f4-dashboard-content">
        {!selectedModule ? (
          <>
            {/* Grid de los 4 módulos */}
            <div className="f4-modules-grid">
              {dashboard.modulos.map(modulo => (
                <ModuleCard
                  key={modulo.modulo_id}
                  modulo={modulo}
                  onClick={() => handleModuleClick(modulo)}
                  userRole={userRole}
                />
              ))}
            </div>

            {/* Banner Desafío Mixto o Progreso General */}
            {dashboard.desafio_mixto_disponible ? (
              <div className="f4-mixed-challenge-banner active">
                <div className="f4-mixed-challenge-icon">🏆</div>
                <div className="f4-mixed-challenge-text">
                  <div className="f4-mixed-challenge-title">Desafío de Maestría de Fase 4</div>
                  <div className="f4-mixed-challenge-desc">
                    ¡Excelente trabajo! Has completado todas las etapas de la Fase 4. Enfrenta el Desafío final para abrir las puertas a la Fase 5.
                  </div>
                </div>
                <button
                  className="f4-mixed-challenge-btn"
                  onClick={handleChallengeClick}
                >
                  {dashboard.desafio_mixto_estado === 'completado' ? 'Repetir Desafío' : 'Iniciar Desafío'}
                </button>
              </div>
            ) : (() => {
              const totalLevelsPassed = dashboard.modulos.reduce((sum, m) => sum + m.niveles.filter(n => n.estado === 'dominado').length, 0);
              const maxTotalLevels = dashboard.modulos.reduce((sum, m) => sum + m.niveles.length, 0);
              const globalProgressPercent = maxTotalLevels > 0 ? Math.round((totalLevelsPassed / maxTotalLevels) * 100) : 0;

              return (
                <div className="w-full bg-white dark:bg-[#162033] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none transition-all duration-300">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mr-5 shrink-0">
                        <Icons.trophy size={32} color="#3b82f6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 font-display tracking-tight">
                          Tu Camino a la Fase 5
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
                      {dashboard.modulos.map((m) => {
                        const completedCount = m.niveles.filter(n => n.estado === 'dominado').length;
                        const totalCount = m.niveles.length;
                        const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                        return (
                          <div key={m.modulo_id} className="flex flex-col items-center gap-1.5 flex-1 px-2">
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
          <div className="f4-levels-layout-container">
            <div className="f4-levels-nav-wrap">
              <button 
                onClick={() => setSelectedModule(null)}
                className="f4-levels-nav-back"
              >
                <Icons.arrow_left />
                <span>Volver al menú de módulos</span>
              </button>
            </div>

            <div className="f4-levels-layout-header">
              <h1 className="f4-levels-layout-title">
                Módulo {selectedModule.modulo_id}: {selectedModule.nombre}
              </h1>
              <p className="f4-levels-layout-subtitle">
                Supera cada nivel práctico para desbloquear el siguiente reto.
              </p>
            </div>

            {/* Grilla interactiva de Niveles */}
            <div className="f4-levels-grid">
              {selectedModule.niveles.map((nivel) => {
                const isUnlocked = nivel.estado !== 'bloqueado' || userRole === 'ADMIN';
                const isPassed = nivel.estado === 'dominado';
                
                return (
                  <button
                    key={nivel.nivel_id}
                    disabled={!isUnlocked}
                    onClick={() => onModuleSelect(selectedModule.modulo_id, nivel.nivel_id)}
                    className={`f4-level-card-item ${nivel.estado} ${isUnlocked ? 'unlocked' : 'locked'}`}
                    style={{ ['--level-neon-accent' as string]: selectedModule.color }}
                  >
                    <div className="f4-level-card-circle">
                      {isPassed ? (
                        <Icons.check size={24} color="#ffffff" />
                      ) : !isUnlocked ? (
                        <Icons.lock size={18} color="#64748b" />
                      ) : (
                        nivel.nivel_id
                      )}
                    </div>
                    <span className="f4-level-card-name">Nivel {nivel.nivel_id}</span>
                    <span className="f4-level-card-desc">{nivel.nombre}</span>
                  </button>
                );
              })}
            </div>

            {/* Zona de Desafíos del Módulo */}
            <div className="f4-challenges-zone-wrapper">
              <div className="f4-challenges-zone-title-box">
                <Icons.trophy size={22} color="#F59E0B" />
                <h2 className="f4-challenges-zone-title">
                  DESAFÍOS DEL MÓDULO
                </h2>
              </div>
              <p className="f4-challenges-zone-desc">
                Pon a prueba tu agilidad mental. Deberás completar cada desafío rápido e intentar no agotar tus vidas.
              </p>
              
              <div className="f4-challenges-list-container">
                {selectedModule.desafios.map((desafio) => {
                  const allLevelsDominated = selectedModule.niveles.every(n => n.estado === 'dominado');
                  let isDesafioUnlocked = false;
                  
                  if (userRole === 'ADMIN') {
                    isDesafioUnlocked = true;
                  } else if (allLevelsDominated) {
                    if (desafio.desafio_id === 11) {
                      isDesafioUnlocked = true;
                    } else if (desafio.desafio_id === 12) {
                      const d11 = selectedModule.desafios.find(d => d.desafio_id === 11);
                      isDesafioUnlocked = d11?.estado === 'dominado';
                    } else if (desafio.desafio_id === 13) {
                      const d12 = selectedModule.desafios.find(d => d.desafio_id === 12);
                      isDesafioUnlocked = d12?.estado === 'dominado';
                    }
                  }

                  const isPassed = desafio.estado === 'dominado';
                  
                  return (
                    <div
                      key={desafio.desafio_id}
                      className={`f4-challenge-list-row ${desafio.estado} ${isDesafioUnlocked ? 'unlocked' : 'locked'}`}
                      style={{
                        ['--challenge-row-color' as any]: selectedModule.color,
                      }}
                    >
                      <div className="f4-challenge-row-icon">
                        {isPassed ? '✅' : desafio.dificultad === 'maestria' ? '🏆' : desafio.dificultad === 'avanzada' ? '⚡' : '🎯'}
                      </div>

                      <div className="f4-challenge-row-content">
                        <div className="f4-challenge-row-title-line">
                          <h3 className="f4-challenge-row-title">
                            {desafio.nombre}
                          </h3>
                          <span className={`f4-challenge-row-difficulty-badge ${desafio.dificultad}`}>
                            {desafio.dificultad}
                          </span>
                        </div>
                        <div className="f4-challenge-row-meta-stats">
                          <span>⏱️ Límite: {desafio.tiempo_limite}s</span>
                          <span>❌ Vidas: {desafio.max_errores}</span>
                          {isPassed && <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓ Dominado</span>}
                        </div>
                      </div>

                      <button
                        className="f4-challenge-row-btn"
                        disabled={!isDesafioUnlocked}
                        onClick={() => onModuleSelect(selectedModule.modulo_id, desafio.desafio_id)}
                      >
                        {isPassed ? 'Repetir' : isDesafioUnlocked ? 'Jugar' : '🔒 Bloqueado'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface ModuleCardProps {
  modulo: Fase4ModuloInfo;
  onClick: () => void;
  userRole?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  modulo,
  onClick,
  userRole,
}) => {
  const IconComp = Icons[modulo.icono] || Icons.activity;
  const porcentaje = Math.max(0, Math.min(100, modulo.porcentaje_global));
  const isLocked = modulo.estado === 'bloqueado' && userRole !== 'ADMIN';

  return (
    <article
      className={`f4-module-card-item ${modulo.estado}`}
      style={{ ['--module-card-color' as string]: modulo.color }}
      onClick={onClick}
      role={!isLocked ? 'button' : undefined}
    >
      <div
        className="f4-module-card-icon-box"
        style={{ background: isLocked ? 'rgba(255, 255, 255, 0.02)' : `${modulo.color}18` }}
      >
        {isLocked ? (
          <Icons.lock size={26} color="#475569" />
        ) : (
          <IconComp size={26} color={modulo.color} />
        )}
      </div>

      <div className="f4-module-card-title">{modulo.nombre}</div>
      <div className="f4-module-card-desc">{modulo.descripcion}</div>

      <div className={`f4-module-card-status-badge ${modulo.estado}`}>
        {isLocked ? '🔒 BLOQUEADO' : modulo.estado === 'dominado' ? '🏆 DOMINADO' : '⚡ EN PROGRESO'}
      </div>

      <div className="f4-module-card-progress-wrap">
        <div className="f4-module-card-progress-label">
          <span>PROGRESO GLOBAL</span>
          <span>{porcentaje}%</span>
        </div>
        <div className="f4-module-card-progress-track">
          <div
            className="f4-module-card-progress-fill"
            style={{
              width: `${porcentaje}%`,
              background: `linear-gradient(90deg, ${modulo.color}cc, ${modulo.color})`,
            }}
          />
        </div>
      </div>
    </article>
  );
};

export default WelcomeScreenPhase4;
