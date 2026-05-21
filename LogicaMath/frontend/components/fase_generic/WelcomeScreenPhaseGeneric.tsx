import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { getFaseMetadata, FaseModulo, FaseNivel } from './faseMetadata';
import './FaseGenericStyles.css';

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

interface WelcomeScreenPhaseGenericProps {
  studentName?: string;
  userRole?: string;
  onModuleSelect: (moduloId: number, nivelId: number, faseId: number) => void;
  onBack: () => void;
}

export default function WelcomeScreenPhaseGeneric({
  studentName = 'Estudiante',
  userRole,
  onModuleSelect,
  onBack,
}: WelcomeScreenPhaseGenericProps) {
  const { faseId: paramFaseId } = useParams<{ faseId: string }>();
  const faseId = Number(paramFaseId || '4');

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
      console.error('[WelcomeScreenPhaseGeneric] Error loading progress', e);
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
    if (userRole === 'ADMIN') return true;
    if (nivel.nivelId === 1) return true; // Level 1 is always unlocked

    // Level N is unlocked if level N-1 is completed
    const prevKey = `${modulo.moduloId}_${nivel.nivelId - 1}`;
    return !!completedLevels[prevKey];
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
        <div>
          <div className="fg-header-greeting">
            ¡Hola, {studentName}! <span>👋</span>
          </div>
          <div className="fg-header-subtitle">
            <span className="fg-badge-fase">FASE {faseId}</span>
            <span className="fg-header-fasename">{metadata.nombre}</span>
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

          <button onClick={handleBackClick} className="fg-back-btn" aria-label="Volver">
            <Lucide.ArrowLeft size={20} />
          </button>
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
                    onClick={() => handleModuleClick(modulo)}
                  >
                    <div 
                      className="fg-module-icon"
                      style={{ background: unlocked ? `${modulo.color}15` : 'rgba(255,255,255,0.02)' }}
                    >
                      <DynamicIcon name={modulo.icono} color={unlocked ? modulo.color : '#64748b'} />
                    </div>

                    <h3 className="fg-module-name">{modulo.nombre}</h3>
                    <p className="fg-module-desc">{modulo.descripcion}</p>

                    {/* Progress Bar */}
                    {unlocked ? (
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
                              background: `linear-gradient(90deg, ${modulo.color}b3, ${modulo.color})` 
                            }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Lucide.Lock size={14} />
                        <span>MÓDULO BLOQUEADO</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* General Evaluation Banner */}
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
                disabled={userRole !== 'ADMIN' && metadata.modulos.some(m => getModuleProgress(m) < 100)}
                onClick={() => onModuleSelect(0, 0, faseId)}
              >
                {userRole === 'ADMIN' || !metadata.modulos.some(m => getModuleProgress(m) < 100) ? 'Iniciar Desafío' : '🔒 Completar módulos'}
              </button>
            </div>
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

                return (
                  <div
                    key={nivel.nivelId}
                    className={`fg-level-card ${unlocked ? 'unlocked' : 'locked'}`}
                    onClick={() => unlocked && onModuleSelect(selectedModule.moduloId, nivel.nivelId, faseId)}
                  >
                    <div className="fg-level-circle">
                      {completed ? (
                        <Lucide.Check size={32} color="#10B981" />
                      ) : !unlocked ? (
                        <Lucide.Lock size={24} color="#64748b" />
                      ) : (
                        nivel.nivelId
                      )}
                    </div>

                    <h4 className="fg-level-title">Nivel {nivel.nivelId}</h4>
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
