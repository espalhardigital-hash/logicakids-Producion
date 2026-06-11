/**
 * WelcomeScreenPhase2.tsx
 * ─────────────────────────────────────────────────────────────
 * Hub de selección de módulos para la Fase 6.
 * Replica el diseño de la imagen de referencia:
 *   - Header con saludo, badge FASE 2, avatar y puntaje
 *   - 5 tarjetas de módulo con ícono de color, badge de estado y barra de progreso
 *   - Banner del Desafío Mixto al fondo (disponible cuando todos dominados)
 */

import React, { useEffect, useState, useCallback } from 'react';
import './Fase6Styles.css';
import { getFase6Dashboard } from './Fase6Service';
import type { Fase6Dashboard, Fase6ModuloInfo } from './Fase6Types';
import { getAvatarUrl } from '../../services/storageService';
import { motion } from 'framer-motion';

// ── Íconos SVG inline para no depender de dependencias externas ───────────

const Icons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  activity: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  hash: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  'shopping-bag': ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  search: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  tool: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
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
};

// Estado por módulo → label amigable
const ESTADO_LABELS: Record<string, string> = {
  dominado:    'DOMINADO',
  en_progreso: 'EN PROGRESO',
  bloqueado:   'BLOQUEADO',
};

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onModuleSelect: (moduloId: number, nivelId?: number) => void;
  onBack: () => void;
  studentName?: string;
  userAvatar?: string;
  userRole?: string;
}

const WelcomeScreenPhase6: React.FC<Props> = ({
  onModuleSelect,
  onBack,
  studentName = 'Estudiante',
  userAvatar,
  userRole,
}) => {
  const [dashboard, setDashboard] = useState<Fase6Dashboard | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Fase6ModuloInfo | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await getFase6Dashboard();
      
      // -- Si es ADMIN, desbloqueamos todo para pruebas
      if (userRole === 'ADMIN') {
        data = {
          ...data,
          desafio_mixto_disponible: true,
          desafio_mixto_estado: 'completado',
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
      console.error('[Fase6] Error loading dashboard from backend.', e);
      setError('No se pudo conectar con el servidor. Por favor, verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [studentName, userRole]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleModuleClick = (modulo: Fase6ModuloInfo) => {
    if (modulo.estado === 'bloqueado' && userRole !== 'ADMIN') return;
    setSelectedModule(modulo);
  };

  const handleChallengeClick = () => {
    if (!dashboard?.desafio_mixto_disponible) return;
    onModuleSelect(99, 99); // 99,99 = Desafío Mixto
  };

  if (loading) {
    return (
      <div className="f6-screen">
        <div className="f6-loading">
          <div className="f6-spinner" />
          <span>Cargando Fase 6…</span>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="f6-screen">
        <div className="f6-error-box">
          {error || 'No se pudo cargar el dashboard.'}
          <br />
          <button
            onClick={loadDashboard}
            style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const nombre = dashboard.alumno_nombre || studentName;

  return (
    <div className="f6-screen">
      {/* ── Header ── */}
      <header className="f6-header">
        <div className="f6-header-left-side">
          {/* Botón volver en la esquina izquierda */}
          <button 
            className="f6-back-btn" 
            onClick={selectedModule ? () => setSelectedModule(null) : onBack} 
            aria-label="Volver"
          >
            <Icons.arrow_left />
          </button>

          {/* Avatar y Saludo */}
          <div className="f6-header-profile">
            <div className="f6-avatar-container">
              {userAvatar ? (
                <img src={getAvatarUrl(userAvatar)} alt={nombre} className="f6-avatar-img" />
              ) : (
                <div className="f6-avatar-placeholder">
                  <Icons.shield color="#8B5CF6" size={24} />
                </div>
              )}
            </div>
            <div className="f6-header-user-info">
              <div className="f6-header-greeting">
                ¡Hola, {nombre}! <span>👋</span>
              </div>
              <div className="f6-header-subtitle">
                <span className="f6-badge-fase">FASE 6</span>
                <span className="f6-header-fasename">Geometría Espacial, Volumen y Magnitudes Físicas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="f6-header-right">
          {/* Puntaje */}
          <div className="f6-score-badge">
            <span className="f6-score-label">Mi Progreso</span>
            <div className="f6-score-value">
              <Icons.trophy size={18} color="#F59E0B" />
              {dashboard.puntos_totales}
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="f6-content">
        {!selectedModule ? (
          <>
            {/* Grid de 5 módulos */}
            <div className="f6-modules-grid">
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
              <div className="f6-challenge-banner">
                <div className="f6-challenge-icon">🏆</div>
                <div className="f6-challenge-text">
                  <div className="f6-challenge-title">Desafío Mixto de la Fase 6</div>
                  <div className="f6-challenge-desc">
                    ¡Has completado exitosamente todos los módulos! Es momento de resolver el Desafío Mixto y demostrar tu maestría en Razonamiento Matemático.
                  </div>
                </div>
                <button
                  className="f6-challenge-btn"
                  onClick={handleChallengeClick}
                >
                  Iniciar Desafío Mixto
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
                          Tu Camino a la Fase 7
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
          <div className="f6-levels-container">
            {/* Botón Volver al menú */}
            <div className="f6-levels-back-wrap">
              <button 
                onClick={() => setSelectedModule(null)}
                className="f6-levels-back-btn"
              >
                <Icons.arrow_left />
                <span>Volver al menú</span>
              </button>
            </div>

            {/* Título de niveles */}
            <div className="f6-levels-header">
              <h1 className="f6-levels-title">
                Niveles De {selectedModule.nombre}
              </h1>
              <p className="f6-levels-subtitle">
                Completa el <span className="highlight">100%</span> de cada nivel de práctica para desbloquear el siguiente.
              </p>
            </div>

            {/* Grid de Niveles */}
            <div className="f6-levels-grid">
              {selectedModule.niveles.map((nivel) => {
                const isUnlocked = nivel.estado !== 'bloqueado' || userRole === 'ADMIN';
                const isPassed = nivel.estado === 'dominado';
                
                return (
                  <button
                    key={nivel.nivel_id}
                    disabled={!isUnlocked}
                    onClick={() => onModuleSelect(selectedModule.modulo_id, nivel.nivel_id)}
                    className={`f6-level-card ${nivel.estado} ${isUnlocked ? 'unlocked' : 'locked'}`}
                    style={{ ['--level-accent' as string]: selectedModule.color }}
                  >
                    <div className="f6-level-circle">
                      {isPassed ? (
                        <Icons.check size={24} color="#ffffff" />
                      ) : !isUnlocked ? (
                        <Icons.lock size={18} color="#9CA3AF" />
                      ) : (
                        nivel.nivel_id
                      )}
                    </div>
                    <span className="f6-level-title">Nivel {nivel.nivel_id}</span>
                    
                    {isPassed && (
                      <span className="f6-level-ping-wrap">
                        <span className="f6-level-ping-pulse" />
                        <span className="f6-level-ping-dot" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Zona de Desafíos */}
            <div className="f6-challenge-zone">
              <div className="f6-challenge-zone-title-wrapper">
                <Icons.trophy size={22} color="#F59E0B" />
                <h2 className="f6-challenge-zone-title">
                  ZONA DE DESAFÍOS
                </h2>
              </div>
              <p className="f6-challenge-zone-subtitle">
                Pon a prueba tu velocidad y precisión. Completa todos los niveles de práctica para desbloquear la evaluación.
              </p>
              
              <div className="f6-challenge-zone-list">
                {(selectedModule.desafios || []).map((desafio) => {
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
                  
                  if (isPassed) {
                      isDesafioUnlocked = true;
                  }
                  const bgGradient = isDesafioUnlocked
                    ? `linear-gradient(135deg, ${selectedModule.color}cc 0%, ${selectedModule.color} 100%)`
                    : undefined;
                  
                  return (
                    <div
                      key={desafio.desafio_id}
                      className={`f6-challenge-bar ${desafio.estado} ${isDesafioUnlocked ? 'unlocked' : 'locked'}`}
                      style={{
                        ['--challenge-color' as any]: selectedModule.color,
                        background: bgGradient,
                      }}
                    >
                      {/* Left: Icon */}
                      <div className="f6-challenge-bar-icon">
                        {isPassed ? '✅' : desafio.dificultad === 'maestria' ? '🏆' : desafio.dificultad === 'avanzada' ? '⚡' : '🎯'}
                      </div>

                      {/* Middle: Content info */}
                      <div className="f6-challenge-bar-text">
                        <div className="f6-challenge-bar-title-row">
                          <h3 className="f6-challenge-bar-title">
                            {desafio.nombre}
                          </h3>
                          <span className={`f6-challenge-bar-badge ${desafio.dificultad}`}>
                            {desafio.dificultad}
                          </span>
                        </div>
                        <div className="f6-challenge-bar-meta">
                          <span>⏱️ Límite: {desafio.tiempo_limite}s</span>
                          <span>❌ Errores máx: {desafio.max_errores}</span>
                          {isPassed && <span style={{ color: '#a7f3d0', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>✓ Dominado</span>}
                        </div>
                      </div>

                      {/* Right: Button */}
                      <button
                        className="f6-challenge-bar-btn"
                        disabled={!isDesafioUnlocked}
                        onClick={() => onModuleSelect(selectedModule.modulo_id, desafio.desafio_id)}
                      >
                        {isPassed ? 'Iniciar de nuevo' : isDesafioUnlocked ? 'Iniciar Desafío' : '🔒 Bloqueado'}
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

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Tarjeta de módulo
// ─────────────────────────────────────────────────────────────────────────────

const ModuleCard: React.FC<{ modulo: Fase6ModuloInfo; onClick: () => void; userRole?: string }> = ({
  modulo,
  onClick,
  userRole,
}) => {
  const IconComp = Icons[modulo.icono] || Icons.activity;
  const porcentaje = Math.max(0, Math.min(100, modulo.porcentaje_global));
  const isLocked = modulo.estado === 'bloqueado' && userRole !== 'ADMIN';

  return (
    <article
      className={`f6-module-card ${modulo.estado} ${userRole === 'ADMIN' ? 'admin-unlocked' : ''}`}
      style={{ ['--card-color' as string]: modulo.color }}
      onClick={onClick}
      role={!isLocked ? 'button' : undefined}
      tabIndex={!isLocked ? 0 : undefined}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !isLocked) onClick(); }}
      aria-label={`${modulo.nombre} — ${ESTADO_LABELS[modulo.estado]}`}
    >
      {/* Ícono con color de módulo */}
      <div
        className="f6-module-icon"
        style={{ background: isLocked ? 'rgba(255, 255, 255, 0.02)' : `${modulo.color}22` }}
      >
        {isLocked ? (
          <Icons.lock size={26} color="#6b7280" />
        ) : (
          <IconComp size={26} color={modulo.color} />
        )}
      </div>

      {/* Nombre y descripción */}
      <div className="f6-module-name">{modulo.nombre}</div>
      <div className="f6-module-desc">{modulo.descripcion}</div>

      {/* Barra de progreso */}
      <div className="f6-module-progress-section">
        <div className="f6-module-progress-label">
          <span>PROGRESO</span>
          <span>{porcentaje}%</span>
        </div>
        <div className="f6-progress-bar-track">
          <div
            className="f6-progress-bar-fill"
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


export default WelcomeScreenPhase6;
