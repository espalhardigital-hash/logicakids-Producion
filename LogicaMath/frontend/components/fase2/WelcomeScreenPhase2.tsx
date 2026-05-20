/**
 * WelcomeScreenPhase2.tsx
 * ─────────────────────────────────────────────────────────────
 * Hub de selección de módulos para la Fase 2.
 * Replica el diseño de la imagen de referencia:
 *   - Header con saludo, badge FASE 2, avatar y puntaje
 *   - 5 tarjetas de módulo con ícono de color, badge de estado y barra de progreso
 *   - Banner del Desafío Mixto al fondo (disponible cuando todos dominados)
 */

import React, { useEffect, useState, useCallback } from 'react';
import './Fase2Styles.css';
import { getFase2Dashboard } from './Fase2Service';
import type { Fase2Dashboard, Fase2ModuloInfo } from './Fase2Types';

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
  userRole?: string;
}

const WelcomeScreenPhase2: React.FC<Props> = ({
  onModuleSelect,
  onBack,
  studentName = 'Estudiante',
  userRole,
}) => {
  const [dashboard, setDashboard] = useState<Fase2Dashboard | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await getFase2Dashboard();
      
      // -- Si es ADMIN, desbloqueamos todo para pruebas
      if (userRole === 'ADMIN') {
        data = {
          ...data,
          desafio_mixto_disponible: true,
          desafio_mixto_estado: 'dominado',
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
      // En desarrollo o sin backend, usar datos de muestra
      let mockData = MOCK_DASHBOARD(studentName);
      if (userRole === 'ADMIN') {
        mockData = {
          ...mockData,
          desafio_mixto_disponible: true,
          desafio_mixto_estado: 'dominado',
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
      console.warn('[Fase2] Backend no disponible, usando datos de muestra.', e);
    } finally {
      setLoading(false);
    }
  }, [studentName, userRole]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleModuleClick = (modulo: Fase2ModuloInfo) => {
    if (modulo.estado === 'bloqueado') return;
    // Seleccionar el primer nivel no dominado (o el primero si todos dominados)
    const nivelActivo = modulo.niveles.find(n => n.estado !== 'dominado') ?? modulo.niveles[0];
    onModuleSelect(modulo.modulo_id, nivelActivo?.nivel_id ?? 1);
  };

  const handleChallengeClick = () => {
    if (!dashboard?.desafio_mixto_disponible) return;
    onModuleSelect(0, 0); // 0,0 = Desafío Mixto
  };

  if (loading) {
    return (
      <div className="f2-screen">
        <div className="f2-loading">
          <div className="f2-spinner" />
          <span>Cargando Fase 2…</span>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="f2-screen">
        <div className="f2-error-box">
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
    <div className="f2-screen">
      {/* ── Header ── */}
      <header className="f2-header">
        <div className="f2-header-left">
          <div className="f2-header-greeting">
            ¡Hola, {nombre}! <span>👋</span>
          </div>
          <div className="f2-header-subtitle">
            <span className="f2-badge-fase">FASE 2</span>
            <span className="f2-header-fasename">Desarrollo Numérico y Razonamiento</span>
          </div>
        </div>

        <div className="f2-header-right">
          {/* Avatar placeholder */}
          <button className="f2-avatar-btn" aria-label="Mi perfil">
            <Icons.shield color="#8B5CF6" />
          </button>

          {/* Puntaje */}
          <div className="f2-score-badge">
            <span className="f2-score-label">Mi Progreso</span>
            <div className="f2-score-value">
              <Icons.trophy size={18} color="#F59E0B" />
              {dashboard.puntos_totales}
            </div>
          </div>

          {/* Botón volver */}
          <button className="f2-back-btn" onClick={onBack} aria-label="Volver">
            <Icons.arrow_left />
          </button>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="f2-content">
        {/* Grid de 5 módulos */}
        <div className="f2-modules-grid">
          {dashboard.modulos.map(modulo => (
            <ModuleCard
              key={modulo.modulo_id}
              modulo={modulo}
              onClick={() => handleModuleClick(modulo)}
              userRole={userRole}
              onLevelSelect={(moduloId, nivelId) => onModuleSelect(moduloId, nivelId)}
            />
          ))}
        </div>

        {/* Banner Desafío Mixto */}
        <div
          className={`f2-challenge-banner ${dashboard.desafio_mixto_disponible ? '' : 'bloqueado'}`}
        >
          <div className="f2-challenge-icon">🏆</div>
          <div className="f2-challenge-text">
            <div className="f2-challenge-title">Desafío Mixto de la Fase 2</div>
            <div className="f2-challenge-desc">
              {dashboard.desafio_mixto_disponible
                ? '¡Has completado exitosamente todos los módulos! Es momento de resolver el Desafío Mixto y demostrar tu maestría en Razonamiento Matemático.'
                : 'Domina todos los módulos para desbloquear el Desafío Mixto y demostrar tu maestría.'}
            </div>
          </div>
          <button
            className="f2-challenge-btn"
            onClick={handleChallengeClick}
            disabled={!dashboard.desafio_mixto_disponible}
          >
            {dashboard.desafio_mixto_disponible ? 'Iniciar Desafío Mixto' : '🔒 Bloqueado'}
          </button>
        </div>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Tarjeta de módulo
// ─────────────────────────────────────────────────────────────────────────────

const ModuleCard: React.FC<{ modulo: Fase2ModuloInfo; onClick: () => void; userRole?: string; onLevelSelect: (moduloId: number, nivelId: number) => void }> = ({
  modulo,
  onClick,
  userRole,
  onLevelSelect,
}) => {
  const IconComp = Icons[modulo.icono] || Icons.activity;
  const porcentaje = Math.max(0, Math.min(100, modulo.porcentaje_global));

  return (
    <article
      className={`f2-module-card ${modulo.estado}`}
      style={{ ['--card-color' as string]: modulo.color }}
      onClick={userRole === 'ADMIN' ? undefined : onClick}
      role={modulo.estado !== 'bloqueado' ? 'button' : undefined}
      tabIndex={modulo.estado !== 'bloqueado' ? 0 : undefined}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && userRole !== 'ADMIN') onClick(); }}
      aria-label={`${modulo.nombre} — ${ESTADO_LABELS[modulo.estado]}`}
    >
      {/* Ícono con color de módulo */}
      <div
        className="f2-module-icon"
        style={{ background: `${modulo.color}22` }}
      >
        <IconComp size={26} color={modulo.color} />
      </div>

      {/* Nombre y descripción */}
      <div className="f2-module-name">{modulo.nombre}</div>
      <div className="f2-module-desc">{modulo.descripcion}</div>

      {/* Badge de estado */}
      <div className={`f2-module-status-badge ${modulo.estado}`}>
        {modulo.estado === 'dominado'    && <Icons.check size={12} color="#10B981" />}
        {modulo.estado === 'bloqueado'   && <Icons.lock  size={12} color="#6b7280" />}
        {ESTADO_LABELS[modulo.estado]}
      </div>

      {/* Admin Level Selector */}
      {userRole === 'ADMIN' && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', zIndex: 10, position: 'relative' }}>
          <span style={{ fontSize: '10px', color: '#9CA3AF', width: '100%', textTransform: 'uppercase', fontWeight: 'bold' }}>Admin: Test Levels</span>
          {modulo.niveles.map((n) => (
            <button
              key={n.nivel_id}
              onClick={(e) => { e.stopPropagation(); onLevelSelect(modulo.modulo_id, n.nivel_id); }}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px', padding: '4px 8px', color: '#fff', fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              L{n.nivel_id}
            </button>
          ))}
        </div>
      )}

      {/* Barra de progreso */}
      <div className="f2-module-progress-section" onClick={userRole === 'ADMIN' ? onClick : undefined} style={{ cursor: userRole === 'ADMIN' ? 'pointer' : 'inherit' }}>
        <div className="f2-module-progress-label">
          <span>PROGRESO</span>
          <span>{porcentaje}%</span>
        </div>
        <div className="f2-progress-bar-track">
          <div
            className="f2-progress-bar-fill"
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
// DATOS DE MUESTRA (usado cuando el backend no está disponible)
// ─────────────────────────────────────────────────────────────────────────────

function MOCK_DASHBOARD(nombre: string): Fase2Dashboard {
  const makeNiveles = (domAll = false) =>
    [1, 2, 3].map(id => ({
      nivel_id: id,
      nombre: `Nivel ${id}`,
      descripcion: `Descripción del nivel ${id}`,
      estado: (domAll ? 'dominado' : id === 1 ? 'en_progreso' : 'bloqueado') as 'dominado' | 'en_progreso' | 'bloqueado',
      porcentaje: domAll ? 100 : id === 1 ? 45 : 0,
      aciertos: domAll ? 10 : id === 1 ? 5 : 0,
      requeridos: 10,
      usa_cronometro: false,
    }));

  const modulos = [
    { id: 1, nombre: 'Gimnasio Mental',   desc: 'Cálculo mental ultra veloz, dobles y mitades.', icono: 'activity',    color: '#10B981', estado: 'dominado'    as const, pct: 100 },
    { id: 2, nombre: 'Tablas en Acción',  desc: 'Tablas de multiplicar y operaciones inversas.',  icono: 'hash',        color: '#8B5CF6', estado: 'dominado'    as const, pct: 100 },
    { id: 3, nombre: 'Tienda Matemática', desc: 'Cálculo de cambio, billetes y precios en R$.', icono: 'shopping-bag', color: '#F59E0B', estado: 'dominado'    as const, pct: 100 },
    { id: 4, nombre: 'Detective',         desc: 'Aislar distractores con subrayador interactivo.', icono: 'search',    color: '#3B82F6', estado: 'en_progreso'  as const, pct: 60  },
    { id: 5, nombre: 'Constructor',       desc: 'Problemas de múltiples pasos conectados.',        icono: 'tool',      color: '#EC4899', estado: 'bloqueado'   as const, pct: 0   },
  ];

  return {
    alumno_nombre: nombre,
    puntos_totales: 25,
    modulos: modulos.map(m => ({
      modulo_id: m.id,
      nombre: m.nombre,
      descripcion: m.desc,
      icono: m.icono,
      color: m.color,
      estado: m.estado,
      porcentaje_global: m.pct,
      niveles: makeNiveles(m.estado === 'dominado'),
    })),
    desafio_mixto_disponible: false,
    desafio_mixto_estado: 'bloqueado',
  };
}

export default WelcomeScreenPhase2;
