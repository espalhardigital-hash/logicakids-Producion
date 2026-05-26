/**
 * WelcomeScreenPhase3.tsx
 * ─────────────────────────────────────────────────────────────
 * Hub de selección de módulos para la Fase 3: Problemas de Texto y Sistemas Simples.
 * Replica el diseño de selección premium con estética Cyberpunk y Dark Space:
 *   - Header con saludo, badge FASE 3, avatar del alumno y puntaje total.
 *   - 5 tarjetas de módulo interactivas con íconos personalizados, estado HSL y barra de progreso.
 *   - Zona de niveles con progresión en cascada.
 *   - Zona de Desafíos por módulo (estándar, avanzado, maestría) con control de timers y vidas.
 *   - Banner del Desafío Mixto de la Fase 3 en la parte inferior.
 */

import React, { useEffect, useState, useCallback } from 'react';
import './Fase3Styles.css';
import { getFase3Dashboard } from './Fase3Service';
import type { Fase3Dashboard, Fase3ModuloInfo } from './Fase3Types';
import { getAvatarUrl } from '../../services/storageService';

// ── Íconos SVG inline para máxima compatibilidad ───────────────────────────

const Icons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  search: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  clock: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  'shopping-cart': ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  package: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
      <polygon points="12 12 21 6.92 21 17.08 12 22.08 12 12" />
      <polygon points="12 2 3 6.92 12 12 21 6.92 12 2" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  'refresh-cw': ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
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

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onModuleSelect: (moduloId: number, nivelId?: number) => void;
  onBack: () => void;
  studentName?: string;
  userAvatar?: string;
  userRole?: string;
}

export const WelcomeScreenPhase3: React.FC<Props> = ({
  onModuleSelect,
  onBack,
  studentName = 'Estudiante',
  userAvatar,
  userRole,
}) => {
  const [dashboard, setDashboard] = useState<Fase3Dashboard | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Fase3ModuloInfo | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await getFase3Dashboard();
      
      // -- Si es ADMIN, desbloqueamos todo para pruebas de desarrollo
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
      console.warn('[Fase3] Backend no disponible, usando datos de muestra para el hub.', e);
      let mockData = MOCK_DASHBOARD(studentName);
      if (userRole === 'ADMIN') {
        mockData = {
          ...mockData,
          desafio_mixto_disponible: true,
          desafio_mixto_estado: 'completado',
          modulos: mockData.modulos.map(m => ({
            ...m,
            estado: m.estado === 'bloqueado' ? 'en_progreso' : m.estado,
            niveles: m.niveles.map(n => ({
              ...n,
              estado: n.estado === 'bloqueado' ? 'en_progreso' : n.estado,
            }))
          }))
        };
      }
      setDashboard(mockData);
    } finally {
      setLoading(false);
    }
  }, [studentName, userRole]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleModuleClick = (modulo: Fase3ModuloInfo) => {
    if (modulo.estado === 'bloqueado' && userRole !== 'ADMIN') return;
    setSelectedModule(modulo);
  };

  const handleChallengeClick = () => {
    if (!dashboard?.desafio_mixto_disponible) return;
    onModuleSelect(99, 99); // 99, 99 = Desafío Mixto
  };

  if (loading) {
    return (
      <div className="f3-screen-wrapper">
        <div className="f3-loading-spinner-wrap">
          <div className="f3-spinner-element" />
          <span>Cargando Fase 3…</span>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="f3-screen-wrapper">
        <div className="f3-error-dialog">
          {error || 'No se pudo cargar el mapa de misiones.'}
          <br />
          <button
            onClick={loadDashboard}
            className="f3-retry-btn"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const nombre = dashboard.alumno_nombre || studentName;

  return (
    <div className="f3-screen-wrapper">
      {/* ── Header Premium ── */}
      <header className="f3-dashboard-header">
        <div className="f3-header-left-wrap">
          {/* Botón volver */}
          <button 
            className="f3-nav-back-btn" 
            onClick={selectedModule ? () => setSelectedModule(null) : onBack} 
            aria-label="Volver"
          >
            <Icons.arrow_left />
          </button>

          {/* Avatar y Saludo */}
          <div className="f3-profile-summary">
            <div className="f3-avatar-badge-wrap">
              {userAvatar ? (
                <img src={getAvatarUrl(userAvatar)} alt={nombre} className="f3-avatar-media" />
              ) : (
                <div className="f3-avatar-media-placeholder">
                  <Icons.shield color="#f97316" size={24} />
                </div>
              )}
            </div>
            <div className="f3-header-greetings-box">
              <div className="f3-greeting-text">
                ¡Hola, {nombre}! <span>👋</span>
              </div>
              <div className="f3-greeting-subtitle">
                <span className="f3-phase-indicator">FASE 3</span>
                <span className="f3-phase-display-name">Problemas de Texto y Sistemas Simples</span>
              </div>
            </div>
          </div>
        </div>

        <div className="f3-header-right-wrap">
          {/* Puntos acumulados */}
          <div className="f3-score-indicator-badge">
            <span className="f3-score-badge-title">Mi Progreso</span>
            <div className="f3-score-badge-val">
              <Icons.trophy size={18} color="#F59E0B" />
              {dashboard.puntos_totales} pts
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenido Principal ── */}
      <main className="f3-dashboard-content">
        {!selectedModule ? (
          <>
            {/* Grid de los 5 módulos */}
            <div className="f3-modules-grid">
              {dashboard.modulos.map(modulo => (
                <ModuleCard
                  key={modulo.modulo_id}
                  modulo={modulo}
                  onClick={() => handleModuleClick(modulo)}
                  userRole={userRole}
                />
              ))}
            </div>

            {/* Banner Desafío Mixto de la Fase */}
            <div
              className={`f3-mixed-challenge-banner ${dashboard.desafio_mixto_disponible ? 'active' : 'blocked'}`}
            >
              <div className="f3-mixed-challenge-icon">🏆</div>
              <div className="f3-mixed-challenge-text">
                <div className="f3-mixed-challenge-title">Desafío Mixto de la Fase 3</div>
                <div className="f3-mixed-challenge-desc">
                  {dashboard.desafio_mixto_disponible
                    ? '¡Excelente trabajo! Has completado exitosamente todas las etapas y módulos. Enfrenta el Desafío Mixto final para consagrar tu maestría analítica.'
                    : 'Domina los 5 módulos curriculares para desbloquear esta gran prueba final acumulativa de Razonamiento.'}
                </div>
              </div>
              <button
                className="f3-mixed-challenge-btn"
                onClick={handleChallengeClick}
                disabled={!dashboard.desafio_mixto_disponible}
              >
                {dashboard.desafio_mixto_disponible ? 'Iniciar Desafío Mixto' : '🔒 Bloqueado'}
              </button>
            </div>
          </>
        ) : (
          <div className="f3-levels-layout-container">
            {/* Cabecera del selector de niveles */}
            <div className="f3-levels-nav-wrap">
              <button 
                onClick={() => setSelectedModule(null)}
                className="f3-levels-nav-back"
              >
                <Icons.arrow_left />
                <span>Volver al menú de módulos</span>
              </button>
            </div>

            <div className="f3-levels-layout-header">
              <h1 className="f3-levels-layout-title">
                Módulo {selectedModule.modulo_id}: {selectedModule.nombre}
              </h1>
              <p className="f3-levels-layout-subtitle">
                Supera el <span className="highlight">100% de la batería</span> de cada nivel práctico para desbloquear el siguiente reto.
              </p>
            </div>

            {/* Grilla interactiva de Niveles */}
            <div className="f3-levels-grid">
              {selectedModule.niveles.map((nivel) => {
                const isUnlocked = nivel.estado !== 'bloqueado' || userRole === 'ADMIN';
                const isPassed = nivel.estado === 'dominado';
                
                return (
                  <button
                    key={nivel.nivel_id}
                    disabled={!isUnlocked}
                    onClick={() => onModuleSelect(selectedModule.modulo_id, nivel.nivel_id)}
                    className={`f3-level-card-item ${nivel.estado} ${isUnlocked ? 'unlocked' : 'locked'}`}
                    style={{ ['--level-neon-accent' as string]: selectedModule.color }}
                  >
                    <div className="f3-level-card-circle">
                      {isPassed ? (
                        <Icons.check size={24} color="#ffffff" />
                      ) : !isUnlocked ? (
                        <Icons.lock size={18} color="#64748b" />
                      ) : (
                        nivel.nivel_id
                      )}
                    </div>
                    <span className="f3-level-card-name">Nivel {nivel.nivel_id}</span>
                    <span className="f3-level-card-desc">{nivel.nombre}</span>
                    
                    {isPassed && (
                      <span className="f3-level-passed-indicator">
                        <span className="pulse-ring" />
                        <span className="core-dot" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Zona de Desafíos del Módulo */}
            <div className="f3-challenges-zone-wrapper">
              <div className="f3-challenges-zone-title-box">
                <Icons.trophy size={22} color="#F59E0B" />
                <h2 className="f3-challenges-zone-title">
                  ZONA DE DESAFÍOS DEL MÓDULO
                </h2>
              </div>
              <p className="f3-challenges-zone-desc">
                Pon a prueba tu agilidad bajo presión. Deberás completar cada desafío rápido e intentar no agotar tus vidas.
              </p>
              
              <div className="f3-challenges-list-container">
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
                  const customBg = isDesafioUnlocked
                    ? `linear-gradient(135deg, ${selectedModule.color}cc 0%, ${selectedModule.color} 100%)`
                    : undefined;
                  
                  return (
                    <div
                      key={desafio.desafio_id}
                      className={`f3-challenge-list-row ${desafio.estado} ${isDesafioUnlocked ? 'unlocked' : 'locked'}`}
                      style={{
                        ['--challenge-row-color' as any]: selectedModule.color,
                        background: customBg,
                      }}
                    >
                      {/* Icon */}
                      <div className="f3-challenge-row-icon">
                        {isPassed ? '✅' : desafio.dificultad === 'maestria' ? '🏆' : desafio.dificultad === 'avanzada' ? '⚡' : '🎯'}
                      </div>

                      {/* Content */}
                      <div className="f3-challenge-row-content">
                        <div className="f3-challenge-row-title-line">
                          <h3 className="f3-challenge-row-title">
                            {desafio.nombre}
                          </h3>
                          <span className={`f3-challenge-row-difficulty-badge ${desafio.dificultad}`}>
                            {desafio.dificultad}
                          </span>
                        </div>
                        <div className="f3-challenge-row-meta-stats">
                          <span>⏱️ Límite: {desafio.tiempo_limite}s</span>
                          <span>❌ Intentos tolerados: {desafio.max_errores}</span>
                          {isPassed && <span className="f3-challenge-row-passed-label">✓ Dominado</span>}
                        </div>
                      </div>

                      {/* Launch Button */}
                      <button
                        className="f3-challenge-row-btn"
                        disabled={!isDesafioUnlocked}
                        onClick={() => onModuleSelect(selectedModule.modulo_id, desafio.desafio_id)}
                      >
                        {isPassed ? 'Repetir Desafío' : isDesafioUnlocked ? 'Iniciar Desafío' : '🔒 Bloqueado'}
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
// SUBCOMPONENTE: Tarjeta de Módulo Curricular
// ─────────────────────────────────────────────────────────────────────────────

interface ModuleCardProps {
  modulo: Fase3ModuloInfo;
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
      className={`f3-module-card-item ${modulo.estado} ${userRole === 'ADMIN' ? 'admin-bypass' : ''}`}
      style={{ ['--module-card-color' as string]: modulo.color }}
      onClick={onClick}
      role={!isLocked ? 'button' : undefined}
      tabIndex={!isLocked ? 0 : undefined}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !isLocked) onClick(); }}
      aria-label={`${modulo.nombre} — ${ESTADO_LABELS[modulo.estado]}`}
    >
      {/* Icono con color personalizado */}
      <div
        className="f3-module-card-icon-box"
        style={{ background: isLocked ? 'rgba(255, 255, 255, 0.02)' : `${modulo.color}18` }}
      >
        {isLocked ? (
          <Icons.lock size={26} color="#475569" />
        ) : (
          <IconComp size={26} color={modulo.color} />
        )}
      </div>

      {/* Título y descripción */}
      <div className="f3-module-card-title">{modulo.nombre}</div>
      <div className="f3-module-card-desc">{modulo.descripcion}</div>

      {/* Badge de estado */}
      <div className={`f3-module-card-status-badge ${modulo.estado}`}>
        {isLocked ? '🔒 BLOQUEADO' : modulo.estado === 'dominado' ? '🏆 DOMINADO' : '⚡ EN PROGRESO'}
      </div>

      {/* Progreso */}
      <div className="f3-module-card-progress-wrap">
        <div className="f3-module-card-progress-label">
          <span>PROGRESO GLOBAL</span>
          <span>{porcentaje}%</span>
        </div>
        <div className="f3-module-card-progress-track">
          <div
            className="f3-module-card-progress-fill"
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

// ─────────────────────────────────────────────────────────────────────────────
// DATOS MOCK DE RESERVA (Cuando el backend no responde o se está configurando)
// ─────────────────────────────────────────────────────────────────────────────

function MOCK_DASHBOARD(nombre: string): Fase3Dashboard {
  const makeNivelesMock = (moduloId: number, isDomAll = false) => {
    const nombresNiveles: Record<number, string[]> = {
      1: ["Aislamiento de Variables Críticas", "Datos Útiles vs. Datos Basura", "Descarte por Incongruencia"],
      2: ["Operaciones Cronológicas", "Álgebra Retrospectiva", "Mutaciones Sucesivas"],
      3: ["Comparación de Carritos", "Grilla de Doble Entrada", "Álgebra Visual"],
      4: ["Agrupación Visual", "Análisis de Resto", "Sucesión Circular"],
      5: ["Visualización de Saltos y Empaques", "Encuentros Periódicos - MCM", "División Máxima Exacta - MCD"]
    };

    const lista = nombresNiveles[moduloId] || ["Nivel Práctico 1", "Nivel Práctico 2", "Nivel Práctico 3"];

    return Array.from({ length: 3 }, (_, i) => i + 1).map(id => ({
      nivel_id: id,
      nombre: lista[id - 1],
      descripcion: `Explicación conceptual del nivel práctico ${id}`,
      estado: (isDomAll ? 'dominado' : id === 1 ? 'en_progreso' : 'bloqueado') as 'dominado' | 'en_progreso' | 'bloqueado',
      porcentaje: isDomAll ? 100 : id === 1 ? 50 : 0,
      aciertos: isDomAll ? 15 : id === 1 ? 7 : 0,
      requeridos: 15,
      usa_cronometro: false,
    }));
  };

  const makeDesafiosMock = (moduloId: number, isDomAll = false) => {
    return [
      { desafio_id: 11, nombre: 'Desafío 1: Estándar', dificultad: 'estandar' as const, estado: (isDomAll ? 'en_progreso' : 'bloqueado') as any, porcentaje: 0, aciertos: 0, requeridos: 20, tiempo_limite: 25, max_errores: 3 },
      { desafio_id: 12, nombre: 'Desafío 2: Avanzado', dificultad: 'avanzada' as const, estado: 'bloqueado' as any, porcentaje: 0, aciertos: 0, requeridos: 20, tiempo_limite: 40, max_errores: 3 },
      { desafio_id: 13, nombre: 'Desafío Final: Maestría', dificultad: 'maestria' as const, estado: 'bloqueado' as any, porcentaje: 0, aciertos: 0, requeridos: 10, tiempo_limite: 50, max_errores: 2 },
    ];
  };

  const metadataModulos = [
    { id: 1, nombre: 'El Detective Literario',   desc: 'Filtrado de datos basura, distractores y modelado del problema.', icono: 'search',        color: '#F97316', estado: 'en_progreso' as const, pct: 15 },
    { id: 2, nombre: 'Secuencia Temporal',  desc: 'Cronología de eventos y análisis retrospectivo.',  icono: 'clock',         color: '#EAB308', estado: 'bloqueado'   as const, pct: 0 },
    { id: 3, nombre: 'Deducción de Precios', desc: 'Introducción intuitiva a sistemas de ecuaciones.', icono: 'shopping-cart', color: '#3B82F6', estado: 'bloqueado'   as const, pct: 0 },
    { id: 4, nombre: 'Reparto y Residuos', desc: 'Algoritmo de la división, agrupamiento y patrones modulares.', icono: 'package',       color: '#A855F7', estado: 'bloqueado'   as const, pct: 0 },
    { id: 5, nombre: 'Ciclos y Agrupaciones Máximas', desc: 'Múltiplos, divisores y aplicaciones narrativas (MCM y MCD).', icono: 'refresh-cw', color: '#10B981', estado: 'bloqueado'   as const, pct: 0 },
  ];

  return {
    alumno_nombre: nombre,
    puntos_totales: 15,
    modulos: metadataModulos.map(m => ({
      modulo_id: m.id,
      nombre: m.nombre,
      descripcion: m.desc,
      icono: m.icono,
      color: m.color,
      estado: m.estado,
      porcentaje_global: m.pct,
      niveles: makeNivelesMock(m.id, (m.estado as string) === 'dominado'),
      desafios: makeDesafiosMock(m.id, (m.estado as string) === 'dominado'),
    })),
    desafio_mixto_disponible: false,
    desafio_mixto_estado: 'bloqueado',
  };
}

export default WelcomeScreenPhase3;
