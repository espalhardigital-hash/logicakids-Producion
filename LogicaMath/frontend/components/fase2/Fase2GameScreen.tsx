/**
 * Fase2GameScreen.tsx
 * ─────────────────────────────────────────────────────────────
 * Pantalla de juego adaptativa para los 5 módulos de Fase 2.
 *   - Módulos 1-3: Entrada numérica
 *   - Módulo  4  : Selección de tokens (subrayador)
 *   - Módulo  5  : Pasos encadenados (paso 1 → congelado → paso 2)
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Fase2Styles.css';
import { getFase2Question, submitFase2Answer, getFase2Reading } from './Fase2Service';
import { Fase2TheoryModal } from './Fase2TheoryModal';
import type {
  Fase2Pregunta,
  Fase2AnswerResult,
  Fase2Token,
  Fase2Lectura,
} from './Fase2Types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Delete, ArrowRight } from 'lucide-react';
import { getCurrentUserFull } from '../../services/storageService';

// ── Íconos inline ─────────────────────────────────────────────────────────

const IconArrowLeft: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const MODULE_NAMES: Record<number, string> = {
  1: 'Gimnasio Mental',
  2: 'Tablas en Acción',
  3: 'Tienda Matemática',
  4: 'Constructor de Soluciones',
};

const MODULE_COLORS: Record<number, string> = {
  1: '#10B981', 2: '#8B5CF6', 3: '#F59E0B', 4: '#EC4899',
};

interface Props {
  moduloId: number;
  nivelId: number;
  onComplete: () => void;
  onBack: () => void;
}

interface FeedbackState {
  visible: boolean;
  esCorrecta: boolean;
  isError?: boolean;
  errorMessage?: string;
  resultado?: Fase2AnswerResult;
}

const keypadVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.05, type: "spring", stiffness: 300, damping: 20 }
  }
};

const keyVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

// ─── Componente Principal ─────────────────────────────────────────────────

const Fase2GameScreen: React.FC<Props> = ({ moduloId, nivelId, onComplete, onBack }) => {
  const [pregunta, setPregunta]   = useState<Fase2Pregunta | null>(null);
  const [loading, setLoading]     = useState(true);
  const [respuesta, setRespuesta] = useState('');
  const [tokensSeleccionados, setTokensSeleccionados] = useState<number[]>([]);
  const [selectedAltId, setSelectedAltId] = useState<number | null>(null);
  const [paso, setPaso]           = useState<1 | 2>(1);
  const [paso1Valor, setPaso1Valor] = useState<string | null>(null);
  const [feedback, setFeedback]   = useState<FeedbackState>({ visible: false, esCorrecta: false });
  const [isMockMode, setIsMockMode] = useState(false);
  const [progreso, setProgreso]   = useState({ aciertos: 0, intentos: 0, porcentaje: 0 });
  const [shaking, setShaking]     = useState(false);
  const [timer, setTimer]         = useState<number | null>(null);
  const [showReading, setShowReading] = useState(false);
  const [readingData, setReadingData] = useState<Fase2Lectura | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Si el moduloId es 99, es un Desafío Mixto, que no usa teoría
  const isChallenge = moduloId === 99 || (nivelId >= 11 && nivelId <= 13);
  const moduleName  = MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  const moduleColor = MODULE_COLORS[moduloId] ?? '#10B981';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserFull();
        if (user?.avatar) {
          setUserAvatar(user.avatar);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  // ── Cargar pregunta ─────────────────────────────────────────────────────

  const loadPregunta = useCallback(async () => {
    setLoading(true);
    setRespuesta('');
    setTokensSeleccionados([]);
    setSelectedAltId(null);
    setPaso(1);
    setPaso1Valor(null);
    try {
      const data = await getFase2Question(moduloId, nivelId);
      setPregunta(data);
      setIsMockMode(false);
      
      if (isChallenge) {
        const limit = nivelId === 11 ? 25 : nivelId === 12 ? 40 : 50;
        setTimer(limit);
      } else if (data.tiene_cronometro && data.tiempo_limite_segundos) {
        setTimer(data.tiempo_limite_segundos);
      } else {
        setTimer(null);
      }
    } catch {
      // Pregunta de muestra para desarrollo
      setIsMockMode(true);
      const mockQ = MOCK_PREGUNTA(moduloId, nivelId);
      setPregunta(mockQ);
      if (isChallenge) {
        const limit = moduloId === 99 ? 60 : (nivelId === 11 ? 25 : nivelId === 12 ? 40 : 50);
        setTimer(limit);
      } else {
        setTimer(null);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [moduloId, nivelId, isChallenge]);

  useEffect(() => { loadPregunta(); }, [loadPregunta]);

  const handleOpenReading = useCallback(async () => {
    if (isChallenge) return;
    try {
      const data = await getFase2Reading(moduloId, nivelId);
      setReadingData(data);
      setShowReading(true);
    } catch {
      const fallback = MOCK_LECTURA(moduloId, nivelId);
      setReadingData(fallback);
      setShowReading(true);
    }
  }, [moduloId, nivelId, isChallenge]);

  useEffect(() => {
    if (isChallenge) {
      setShowReading(false);
      return;
    }
    const checkAndShowReading = async () => {
      try {
        const data = await getFase2Reading(moduloId, nivelId);
        setReadingData(data);
        setShowReading(true);
      } catch {
        const fallback = MOCK_LECTURA(moduloId, nivelId);
        setReadingData(fallback);
        setShowReading(true);
      }
    };
    checkAndShowReading();
  }, [moduloId, nivelId, isChallenge]);

  // ── Temporizador ────────────────────────────────────────────────────────

  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) { handleSubmit(); return; }
    timerRef.current = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // ── Selección de tokens (mód 4) ─────────────────────────────────────────

  const toggleToken = (token: Fase2Token) => {
    setTokensSeleccionados(prev =>
      prev.includes(token.id)
        ? prev.filter(id => id !== token.id)
        : [...prev, token.id]
    );
  };

  // ── Envío de respuesta ──────────────────────────────────────────────────

  const handleFeedbackClose = useCallback(() => {
    if (feedback.resultado?.early_exit) {
      setFeedback({ visible: false, esCorrecta: false });
      onBack();
      return;
    }

    if (feedback.isError) {
      setFeedback({ visible: false, esCorrecta: false });
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    setFeedback({ visible: false, esCorrecta: false });
    if (feedback.resultado?.bloque_completado) {
      onComplete();
    } else if (feedback.esCorrecta) {
      if (pregunta?.tipo_pregunta === 'constructor_soluciones_chained') {
        if (feedback.resultado?.paso_aprobado === 2 || feedback.resultado?.paso_approved === 2) {
          loadPregunta();
        } else {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      } else {
        loadPregunta();
      }
    } else {
      if (moduloId <= 3 && !isChallenge) {
        loadPregunta();
      } else {
        setRespuesta('');
        setTokensSeleccionados([]);
        setSelectedAltId(null);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [feedback, onBack, onComplete, pregunta, paso, loadPregunta, moduloId, isChallenge]);

  // ── Envío de respuesta ──────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!pregunta) return;

    if (feedback.visible) {
      handleFeedbackClose();
      return;
    }

    stopTimer();

    const payload = {
      modulo_id:  moduloId,
      nivel_id:   nivelId,
      pregunta_id: pregunta.id,
      enunciado_seed: pregunta.enunciado_seed,
      respuesta_dada:          pregunta.tipo_pregunta === 'respuesta_numerica' || pregunta.tipo_pregunta === 'constructor_soluciones_chained' ? respuesta.trim() : undefined,
      alternativa_id:          pregunta.tipo_pregunta === 'multiple_opcion' ? selectedAltId ?? undefined : undefined,
      tokens_seleccionados:    pregunta.tipo_pregunta === 'subrayado_tokens' ? tokensSeleccionados : undefined,
      paso_numero:             pregunta.tipo_pregunta === 'constructor_soluciones_chained' ? paso : undefined,
      tiempo_respuesta_segundos: undefined as number | undefined,
    };

    let resultado: Fase2AnswerResult;
    try {
      resultado = await submitFase2Answer(payload);
      
      setProgreso({
        aciertos:   resultado.aciertos_acumulados,
        intentos:   resultado.intentos_totales,
        porcentaje: resultado.porcentaje_actual,
      });

      if (resultado.early_exit) {
        setFeedback({ visible: true, esCorrecta: false, resultado, isError: false, errorMessage: undefined });
        return;
      }

      if (resultado.es_correcta) {
        if (pregunta.tipo_pregunta === 'constructor_soluciones_chained' && paso === 1) {
          setPaso1Valor(resultado.valor_paso1_congelado ?? respuesta);
          setPaso(2);
          setRespuesta('');
          setFeedback({ visible: true, esCorrecta: true, resultado });
        } else {
          setFeedback({ visible: true, esCorrecta: true, resultado });
          if (resultado.bloque_completado) {
            setTimeout(() => onComplete(), 1500);
          } else {
            // Auto advance on correct answer for inline feedback
            setTimeout(() => {
              setFeedback({ visible: false, esCorrecta: false, isError: false });
              loadPregunta();
            }, 1200);
          }
        }
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 450);
        setFeedback({ visible: true, esCorrecta: false, resultado });
      }
    } catch (error: any) {
      if (isMockMode) {
        resultado = MOCK_RESULTADO(moduloId, respuesta, tokensSeleccionados, pregunta, paso, selectedAltId);
        
        setProgreso({
          aciertos:   resultado.aciertos_acumulados,
          intentos:   resultado.intentos_totales,
          porcentaje: resultado.porcentaje_actual,
        });

        if (resultado.es_correcta) {
          if (pregunta.tipo_pregunta === 'constructor_soluciones_chained' && paso === 1) {
            setPaso1Valor(resultado.valor_paso1_congelado ?? respuesta);
            setPaso(2);
            setRespuesta('');
            setFeedback({ visible: true, esCorrecta: true, resultado });
          } else {
            setFeedback({ visible: true, esCorrecta: true, resultado });
            if (resultado.bloque_completado) {
              setTimeout(() => onComplete(), 1500);
            } else {
              setTimeout(() => {
                setFeedback({ visible: false, esCorrecta: false, isError: false });
                loadPregunta();
              }, 1200);
            }
          }
        } else {
          setShaking(true);
          setTimeout(() => setShaking(false), 450);
          setFeedback({ visible: true, esCorrecta: false, resultado });
        }
      } else {
        setFeedback({
          visible: true,
          esCorrecta: false,
          isError: true,
          errorMessage: error instanceof Error ? error.message : 'No se pudo comunicar con el servidor.',
        });
      }
    }
  }, [pregunta, moduloId, nivelId, respuesta, tokensSeleccionados, paso, selectedAltId, isMockMode, onComplete, feedback, handleFeedbackClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleKeypadInput = (num: string) => {
    if (feedback.visible) return;
    setRespuesta(prev => {
      if (prev.length >= 10) return prev;
      return prev + num;
    });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleComma = () => {
    if (feedback.visible) return;
    setRespuesta(prev => {
      if (prev.includes(',')) return prev;
      return prev + ',';
    });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBackspace = () => {
    if (feedback.visible) return;
    setRespuesta(prev => prev.slice(0, -1));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="f2-game-screen">
        <div className="f2-loading">
          <div className="f2-spinner" style={{ borderTopColor: moduleColor }} />
          <span>Cargando pregunta…</span>
        </div>
      </div>
    );
  }

  if (!pregunta) return null;

  const maxAciertos = isChallenge ? (nivelId === 13 ? 10 : 25) : 15;
  const barWidth = Math.min(100, (progreso.aciertos / maxAciertos) * 100);

  return (
    <div className="f2-game-screen">
      {/* Glow ambiental de feedback */}
      <AnimatePresence>
        {feedback.visible && feedback.esCorrecta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="f2-ambient-glow correct"
          />
        )}
        {feedback.visible && !feedback.esCorrecta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="f2-ambient-glow incorrect"
          />
        )}
      </AnimatePresence>

      {/* ── Header Rediseñado ── */}
      <header className="f2-game-header-modern">
        <button className="f2-header-abort-btn" onClick={onBack} title="Abortar misión">
          <IconArrowLeft />
        </button>

        <div className="f2-header-right-group">
          {!isChallenge && (
            <button 
              className="f2-view-theory-btn-modern" 
              onClick={handleOpenReading}
              title="Ver teoría de este nivel"
            >
              <BookOpen size={14} style={{ marginRight: '4px' }} />
              <span>Teoría</span>
            </button>
          )}

          <div className="f2-header-badge-pill">
            <span className="f2-badge-module" style={{ color: moduleColor }}>
              {moduleName.toUpperCase()}
            </span>
            <span className="f2-badge-divider">|</span>
            <span className="f2-badge-level">
              NIVEL {nivelId}
            </span>
            <span className="f2-badge-divider">|</span>
            <span className="f2-badge-challenge">
              {isChallenge ? 'DESAFÍO' : 'PREGUNTA'} {progreso.aciertos}/{maxAciertos}
            </span>
            {timer !== null && (
              <>
                <span className="f2-badge-divider">|</span>
                <span className="f2-badge-timer" style={{ color: timer <= 5 ? '#EF4444' : '#ffffff' }}>
                  {timer}S
                </span>
              </>
            )}
          </div>
        </div>

        {/* Barra de progreso de ancho completo */}
        <div className="f2-full-width-progress-bar">
          <div
            className="f2-full-width-progress-fill"
            style={{
              width: `${barWidth}%`,
              background: `linear-gradient(90deg, ${moduleColor}80, ${moduleColor})`,
            }}
          />
        </div>
      </header>

      <main className="f2-game-body">
        <div className="f2-game-layout-wrap">
          {/* Tarjeta de Pregunta */}
          <motion.div 
            animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`f2-question-card ${shaking ? 'shake-error' : ''}`}
            style={{ 
              boxShadow: feedback.visible 
                ? (feedback.esCorrecta ? '0 0 0 4px rgba(16, 185, 129, 0.5)' : '0 0 0 4px rgba(239, 68, 68, 0.5)')
                : 'none',
              transition: 'box-shadow 0.3s ease'
            }}
          >
            {/* ─ Respuesta Numérica o Evocación Pura (Módulos 1-3 y Desafío Final) ─ */}
            {pregunta.tipo_pregunta === 'respuesta_numerica' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div className="f2-question-text-box">
                  <div className={pregunta.enunciado.length < 25 ? "f2-question-text short" : "f2-question-text"}>
                    {pregunta.enunciado}
                  </div>
                </div>
                
                <div className="f2-numeric-input-wrap">
                  <div 
                    className={`f2-custom-input-box ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : 'focused'}`}
                    onClick={() => inputRef.current?.focus()}
                  >
                    {/* Hidden input to capture physical keyboard keys */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={respuesta}
                      onChange={e => {
                        if (!feedback.visible) {
                          const val = e.target.value;
                          if (/^[0-9,\-]*$/.test(val)) {
                            setRespuesta(val);
                          }
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      className="f2-hidden-input"
                      autoFocus
                      autoComplete="off"
                      inputMode="none"
                    />
                    
                    <span className="f2-input-value-text">
                      {feedback.visible 
                        ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) 
                        : (respuesta || '?')}
                    </span>
                    
                    {feedback.visible && (
                      <div className="f2-input-status-elements">
                        {feedback.esCorrecta ? (
                          <div className="f2-status-badge correct">
                            <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        ) : (
                          <>
                            <span className="f2-era-pill">
                              Era: {feedback.resultado?.respuesta_correcta}
                            </span>
                            <div className="f2-status-badge incorrect">
                              <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isChallenge && (
                  <div className="f2-scores-container">
                    <div className="f2-score-box correct">
                      <span className="f2-score-label">CORRECTAS</span>
                      <span className="f2-score-value">{progreso.aciertos}</span>
                    </div>
                    <div className="f2-score-box incorrect">
                      <span className="f2-score-label">ERRORES</span>
                      <span className="f2-score-value">{progreso.intentos - progreso.aciertos}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─ Opción Múltiple (Desafíos 1 y 2 - Niveles 11 y 12) ─ */}
            {pregunta.tipo_pregunta === 'multiple_opcion' && pregunta.alternativas && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div className="f2-question-text-box">
                  <div className={pregunta.enunciado.length < 25 ? "f2-question-text short" : "f2-question-text"}>
                    {pregunta.enunciado}
                  </div>
                </div>

                <div className="f2-mc-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '24px' }}>
                  {pregunta.alternativas.map((alt) => {
                    const isSelected = selectedAltId === alt.id;
                    
                    let borderColor = 'rgba(255, 255, 255, 0.08)';
                    let background = 'rgba(255, 255, 255, 0.02)';
                    let textColor = 'var(--f2-text-secondary)';
                    
                    if (isSelected) {
                      borderColor = moduleColor;
                      background = `${moduleColor}15`;
                      textColor = '#ffffff';
                    }
                    
                    if (feedback.visible) {
                      if (isSelected) {
                        if (feedback.esCorrecta) {
                          borderColor = 'var(--f2-correct)';
                          background = 'rgba(16, 185, 129, 0.1)';
                          textColor = 'var(--f2-correct)';
                        } else {
                          borderColor = 'var(--f2-error)';
                          background = 'rgba(239, 68, 68, 0.1)';
                          textColor = 'var(--f2-error)';
                        }
                      }
                      
                      // Check if this alternative has the correct text from feedback
                      const isCorrectText = alt.texto === feedback.resultado?.respuesta_correcta;
                      if (!feedback.esCorrecta && isCorrectText) {
                        borderColor = 'var(--f2-correct)';
                        background = 'rgba(16, 185, 129, 0.1)';
                        textColor = 'var(--f2-correct)';
                      }
                    }
                    
                    return (
                      <motion.button
                        key={alt.id}
                        whileHover={!feedback.visible ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
                        whileTap={!feedback.visible ? { scale: 0.98 } : {}}
                        disabled={feedback.visible}
                        onClick={() => setSelectedAltId(alt.id)}
                        className={`f2-mc-option-btn ${isSelected ? 'selected' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderRadius: '16px',
                          border: `1px solid ${borderColor}`,
                          background: background,
                          color: textColor,
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '1rem',
                          cursor: feedback.visible ? 'default' : 'pointer',
                          transition: 'border-color 0.2s, background-color 0.2s, color 0.2s',
                          textAlign: 'left',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? (feedback.visible ? (feedback.esCorrecta ? 'var(--f2-correct)' : 'var(--f2-error)') : moduleColor) : 'rgba(255,255,255,0.2)'}`,
                          marginRight: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isSelected ? (feedback.visible ? (feedback.esCorrecta ? 'var(--f2-correct)' : 'var(--f2-error)') : moduleColor) : 'transparent',
                        }}>
                          {isSelected && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff' }} />
                          )}
                        </div>
                        <span style={{ flexGrow: 1 }}>{alt.texto}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <motion.button
                    whileHover={!feedback.visible && selectedAltId !== null ? { scale: 1.02 } : {}}
                    whileTap={!feedback.visible && selectedAltId !== null ? { scale: 0.98 } : {}}
                    className="f2-submit-btn"
                    onClick={handleSubmit}
                    disabled={selectedAltId === null && !feedback.visible}
                    style={{
                      display: 'block', // Overriding display:none from f2-submit-btn in css
                      width: '100%',
                      padding: '16px',
                      borderRadius: '16px',
                      background: selectedAltId === null && !feedback.visible
                        ? 'rgba(255, 255, 255, 0.03)' 
                        : feedback.visible
                          ? feedback.esCorrecta
                            ? 'linear-gradient(135deg, var(--f2-correct)cc, var(--f2-correct))'
                            : 'linear-gradient(135deg, var(--f2-error)cc, var(--f2-error))'
                          : `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`,
                      color: selectedAltId === null && !feedback.visible ? 'rgba(255, 255, 255, 0.2)' : 'white',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: selectedAltId === null && !feedback.visible ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedAltId !== null && !feedback.visible 
                        ? `0 8px 24px ${moduleColor}30` 
                        : 'none'
                    }}
                  >
                    {feedback.visible 
                      ? (feedback.esCorrecta ? 'Siguiente Pregunta →' : 'Intentar de nuevo ↺') 
                      : 'Confirmar Respuesta'}
                  </motion.button>
                </div>
              </div>
            )}

            {/* ─ Constructor de Soluciones Chained (Módulo 4) ─ */}
            {pregunta.tipo_pregunta === 'constructor_soluciones_chained' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '20px' }}>
                <div className="f2-question-text-box">
                  <div className={pregunta.enunciado.length < 25 ? "f2-question-text short" : "f2-question-text"}>
                    {pregunta.enunciado}
                  </div>
                </div>

                <div className="f2-chained-steps-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Paso 1 */}
                  <div className={`f2-step-card ${paso === 1 ? 'active' : 'completed'}`} style={{
                    background: paso === 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(16, 185, 129, 0.05)',
                    border: paso === 1 ? `1px solid ${moduleColor}40` : '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: paso === 1 ? moduleColor : '#10B981', letterSpacing: '1px' }}>
                        {paso === 1 ? '🟢 PASO 1: EN PROGRESO' : '✅ PASO 1: COMPLETADO'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: paso === 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', marginBottom: paso === 1 ? '16px' : '0' }}>
                      {pregunta.pasos_encadenados?.[0]?.descripcion ?? 'Resuelve el primer paso.'}
                    </div>

                    {paso === 1 && (
                      <div className="f2-numeric-input-wrap" style={{ marginTop: '12px' }}>
                        <div 
                          className={`f2-custom-input-box ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : 'focused'}`}
                          onClick={() => inputRef.current?.focus()}
                        >
                          <input
                            ref={inputRef}
                            type="text"
                            value={respuesta}
                            onChange={e => {
                              if (!feedback.visible) {
                                const val = e.target.value;
                                if (/^[0-9,\-]*$/.test(val)) {
                                  setRespuesta(val);
                                }
                              }
                            }}
                            onKeyDown={handleKeyDown}
                            className="f2-hidden-input"
                            autoFocus
                            autoComplete="off"
                            inputMode="none"
                          />
                          <span className="f2-input-value-text">
                            {feedback.visible 
                              ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) 
                              : (respuesta || '?')}
                          </span>
                          {feedback.visible && (
                            <div className="f2-input-status-elements">
                              {feedback.esCorrecta ? (
                                <div className="f2-status-badge correct">
                                  <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              ) : (
                                <>
                                  <span className="f2-era-pill">
                                    Era: {feedback.resultado?.respuesta_correcta}
                                  </span>
                                  <div className="f2-status-badge incorrect">
                                    <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {paso === 2 && paso1Valor !== null && (
                      <div style={{ marginTop: '8px', fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>
                        Respuesta: {paso1Valor}
                      </div>
                    )}
                  </div>

                  {/* Paso 2 */}
                  <div className={`f2-step-card ${paso === 2 ? 'active' : 'locked'}`} style={{
                    background: paso === 2 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                    border: paso === 2 ? `1px solid ${moduleColor}40` : '1px solid rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    opacity: paso === 2 ? 1 : 0.4,
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: paso === 2 ? moduleColor : 'rgba(255, 255, 255, 0.4)', letterSpacing: '1px' }}>
                        {paso === 2 ? '🟢 PASO 2: EN PROGRESO' : '🔒 PASO 2: BLOQUEADO'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: paso === 2 ? '#ffffff' : 'rgba(255, 255, 255, 0.4)', marginBottom: paso === 2 ? '16px' : '0' }}>
                      {pregunta.pasos_encadenados?.[1]?.descripcion ?? 'Resuelve el segundo paso.'}
                    </div>

                    {paso === 2 && (
                      <div className="f2-numeric-input-wrap" style={{ marginTop: '12px' }}>
                        <div 
                          className={`f2-custom-input-box ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : 'focused'}`}
                          onClick={() => inputRef.current?.focus()}
                        >
                          <input
                            ref={inputRef}
                            type="text"
                            value={respuesta}
                            onChange={e => {
                              if (!feedback.visible) {
                                const val = e.target.value;
                                if (/^[0-9,\-]*$/.test(val)) {
                                  setRespuesta(val);
                                }
                              }
                            }}
                            onKeyDown={handleKeyDown}
                            className="f2-hidden-input"
                            autoFocus
                            autoComplete="off"
                            inputMode="none"
                          />
                          <span className="f2-input-value-text">
                            {feedback.visible 
                              ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) 
                              : (respuesta || '?')}
                          </span>
                          {feedback.visible && (
                            <div className="f2-input-status-elements">
                              {feedback.esCorrecta ? (
                                <div className="f2-status-badge correct">
                                  <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              ) : (
                                <>
                                  <span className="f2-era-pill">
                                    Era: {feedback.resultado?.respuesta_correcta}
                                  </span>
                                  <div className="f2-status-badge incorrect">
                                    <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!isChallenge && (
                  <div className="f2-scores-container">
                    <div className="f2-score-box correct">
                      <span className="f2-score-label">CORRECTAS</span>
                      <span className="f2-score-value">{progreso.aciertos}</span>
                    </div>
                    <div className="f2-score-box incorrect">
                      <span className="f2-score-label">ERRORES</span>
                      <span className="f2-score-value">{progreso.intentos - progreso.aciertos}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─ Constructor de Soluciones / Subrayado de Tokens (Módulo 4 - Niveles 3 y 4) ─ */}
            {pregunta.tipo_pregunta === 'subrayado_tokens' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div className="f2-question-text-box">
                  <div className={pregunta.enunciado.length < 25 ? "f2-question-text short" : "f2-question-text"}>
                    {pregunta.enunciado}
                  </div>
                </div>
                
                <div className="f2-numeric-input-wrap">
                  <div 
                    className={`f2-custom-input-box ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : 'focused'}`}
                    onClick={() => inputRef.current?.focus()}
                  >
                    {/* Hidden input to capture physical keyboard keys */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={respuesta}
                      onChange={e => {
                        if (!feedback.visible) {
                          const val = e.target.value;
                          if (/^[0-9,\-]*$/.test(val)) {
                            setRespuesta(val);
                          }
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      className="f2-hidden-input"
                      autoFocus
                      autoComplete="off"
                      inputMode="none"
                    />
                    
                    <span className="f2-input-value-text">
                      {feedback.visible 
                        ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) 
                        : (respuesta || '?')}
                    </span>
                    
                    {feedback.visible && (
                      <div className="f2-input-status-elements">
                        {feedback.esCorrecta ? (
                          <div className="f2-status-badge correct">
                            <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        ) : (
                          <>
                            <span className="f2-era-pill">
                              Era: {feedback.resultado?.respuesta_correcta}
                            </span>
                            <div className="f2-status-badge incorrect">
                              <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isChallenge && (
                  <div className="f2-scores-container">
                    <div className="f2-score-box correct">
                      <span className="f2-score-label">CORRECTAS</span>
                      <span className="f2-score-value">{progreso.aciertos}</span>
                    </div>
                    <div className="f2-score-box incorrect">
                      <span className="f2-score-label">ERRORES</span>
                      <span className="f2-score-value">{progreso.intentos - progreso.aciertos}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* ─ FALLBACK BLOCK (Catch-All para tipos desconocidos o errores) ─ */}
            {pregunta.tipo_pregunta !== 'respuesta_numerica' && 
             pregunta.tipo_pregunta !== 'multiple_opcion' && 
             pregunta.tipo_pregunta !== 'constructor_soluciones_chained' && 
             pregunta.tipo_pregunta !== 'subrayado_tokens' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', color: '#ff4b4b', padding: '20px', background: 'rgba(255,0,0,0.1)', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>Error de Renderizado</h3>
                <p style={{ textAlign: 'center', marginBottom: '10px' }}>
                  El componente visual no reconoce el tipo de pregunta enviado por el servidor.
                </p>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px', width: '100%', overflowX: 'auto', fontSize: '0.8rem', color: '#fff' }}>
                  <strong>Tipo recibido:</strong> {pregunta.tipo_pregunta}<br/>
                  <strong>Enunciado:</strong> {pregunta.enunciado || 'N/A'}<br/>
                  <strong>Módulo:</strong> {moduloId}<br/>
                  <strong>Pasos:</strong> {pregunta.pasos_encadenados ? pregunta.pasos_encadenados.length : 'N/A'}
                </div>
              </div>
            )}
          </motion.div>

          {/* Teclado Numérico Virtual (3x4 Layout) */}
          {(pregunta.tipo_pregunta === 'respuesta_numerica' || pregunta.tipo_pregunta === 'constructor_soluciones_chained' || pregunta.tipo_pregunta === 'subrayado_tokens') && (
            <motion.div 
              variants={keypadVariants}
              initial="hidden"
              animate="show"
              className="hidden md:block w-[320px] shrink-0 z-10"
            >
              <div className="grid grid-cols-3 gap-4 p-7 glass-card rounded-[3rem] shadow-2xl dark:shadow-none">
                {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                  <motion.button
                    variants={keyVariants}
                    whileHover={!feedback.visible ? { scale: 1.08, backgroundColor: 'rgba(59,130,246,0.08)' } : {}}
                    whileTap={!feedback.visible ? { scale: 0.92 } : {}}
                    key={num}
                    onClick={() => handleKeypadInput(num.toString())}
                    disabled={feedback.visible}
                    className="aspect-square rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-4xl font-black text-slate-950 dark:text-white transition-all disabled:opacity-30 cursor-pointer font-display flex items-center justify-center shadow-sm"
                  >
                    {num}
                  </motion.button>
                ))}

                <motion.button
                  variants={keyVariants}
                  whileHover={!feedback.visible ? { scale: 1.08 } : {}}
                  whileTap={!feedback.visible ? { scale: 0.92 } : {}}
                  onClick={handleBackspace}
                  disabled={feedback.visible}
                  className="aspect-square rounded-[1.5rem] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <Delete size={28} />
                </motion.button>

                <motion.button
                  variants={keyVariants}
                  whileHover={!feedback.visible ? { scale: 1.08 } : {}}
                  whileTap={!feedback.visible ? { scale: 0.92 } : {}}
                  onClick={() => handleKeypadInput('0')}
                  disabled={feedback.visible}
                  className="aspect-square rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-3xl font-black text-slate-950 dark:text-white transition-colors disabled:opacity-50 cursor-pointer font-display flex items-center justify-center shadow-sm"
                >
                  0
                </motion.button>

                <motion.button
                  variants={keyVariants}
                  whileHover={!feedback.visible ? { scale: 1.08 } : {}}
                  whileTap={!feedback.visible ? { scale: 0.92 } : {}}
                  onClick={() => handleSubmit()}
                  disabled={!feedback.visible && !respuesta.trim()}
                  className="aspect-square rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center cursor-pointer"
                >
                  <ArrowRight size={32} />
                </motion.button>
              </div>
              <p className="text-center text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.3em] mt-6 font-display">Teclado Numérico</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Error Overlay Removido (Ahora es Inline) ── */}
      {/* Si hay error de conexión o API, mostramos un fallback */}
      {feedback.visible && feedback.isError && (
        <div className="f2-feedback-overlay">
          <div className="f2-feedback-card incorrect animate-pop">
            <div className="f2-feedback-emoji">⚠️</div>
            <div className="f2-feedback-title">Error de Conexión</div>
            <div className="f2-feedback-subtitle">
              {feedback.errorMessage || 'No se pudo comunicar con el servidor.'}
            </div>
            <button
              className="f2-feedback-btn incorrect"
              onClick={handleFeedbackClose}
            >
              Volver a intentar
            </button>
          </div>
        </div>
      )}

      {/* ── Overlay de lectura introductoria ── */}
      <AnimatePresence>
        {showReading && readingData && (
          <Fase2TheoryModal
            readingData={readingData}
            moduleColor={moduleColor}
            onClose={() => setShowReading(false)}
            onAbort={onBack}
            userAvatar={userAvatar}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Temporizador Circular
// ─────────────────────────────────────────────────────────────────────────────

const CircularTimer: React.FC<{ current: number; total: number; color: string }> = ({
  current, total, color,
}) => {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - current / total);
  const timerColor = current > total * 0.4 ? color : current > total * 0.2 ? '#F59E0B' : '#EF4444';

  return (
    <div className="f2-timer-wrap">
      <svg className="f2-timer-svg" width="52" height="52" viewBox="0 0 52 52">
        <circle className="f2-timer-bg" cx="26" cy="26" r={r} />
        <circle
          className="f2-timer-fill"
          cx="26" cy="26" r={r}
          stroke={timerColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="f2-timer-text" style={{ color: timerColor }}>{current}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE MUESTRA (desarrollo sin backend)
// ─────────────────────────────────────────────────────────────────────────────

function MOCK_LECTURA(moduloId: number, nivelId: number): Fase2Lectura {
  const readings: Record<string, Fase2Lectura> = {
    '1-1': {
      modulo_id: 1,
      nivel_id: 1,
      titulo: "Escalas: Doble, Mitad y Triple",
      parrafos: [
        "Cuando multiplicamos un número por 2, obtenemos su doble.",
        "Cuando dividimos un número por 2, obtenemos su mitad.",
        "Cuando multiplicamos un número por 3, obtenemos su triple."
      ],
      ejemplos: [{ enunciado: "El doble de 8", respuesta: "8 × 2 = 16" }],
      tip_pedagogico: "Recuerda: 'el doble' siempre multiplica por 2."
    },
    '1-2': {
      modulo_id: 1,
      nivel_id: 2,
      titulo: "Orden de Operaciones",
      parrafos: [
        "Las multiplicaciones y divisiones siempre se resuelven ANTES que las sumas y restas.",
        "Lee la expresión completa antes de empezar a calcular."
      ],
      ejemplos: [{ enunciado: "3 + 2 × 4", respuesta: "Primero: 2 × 4 = 8. Luego: 3 + 8 = 11" }],
      tip_pedagogico: "Piensa en la multiplicación como un 'grupo' que siempre va primero."
    },
    '2-1': {
      modulo_id: 2,
      nivel_id: 1,
      titulo: "Suma y Resta son Inversas",
      parrafos: [
        "Si a + b = c, entonces c - b = a.",
        "Para encontrar un número desconocido en una suma, usa la resta."
      ],
      ejemplos: [{ enunciado: "___ + 5 = 12", respuesta: "12 - 5 = 7" }],
      tip_pedagogico: "Piensa: ¿qué número le falta al total?"
    },
    '3-1': {
      modulo_id: 3,
      nivel_id: 1,
      titulo: "Reconocimiento de Monedas (R$)",
      parrafos: [
        "En Brasil, las monedas son: 5¢, 10¢, 25¢, 50¢ y R$ 1,00.",
        "Para sumar dinero, trabaja en centavos para evitar errores."
      ],
      ejemplos: [{ enunciado: "R$ 0,25 + R$ 0,50", respuesta: "25 + 50 = 75 centavos = R$ 0,75" }],
      tip_pedagogico: "Convierte todo a centavos, suma, y después convierte el resultado a R$."
    }
  };

  const key = `${moduloId}-${nivelId}`;
  return readings[key] || {
    modulo_id: moduloId,
    nivel_id: nivelId,
    titulo: `Módulo ${moduloId} — Nivel ${nivelId}`,
    parrafos: ["Practica con atención y verás que mejorarás rápidamente."],
    tip_pedagogico: "Lee el enunciado dos veces antes de responder."
  };
}

function MOCK_PREGUNTA(moduloId: number, nivelId: number): Fase2Pregunta {
  const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  function getRandomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  const formatReais = (centavos: number): string => {
    const reais = Math.floor(centavos / 100);
    const cents = centavos % 100;
    return `R$ ${reais},${cents.toString().padStart(2, '0')}`;
  };

  const PRODUCTOS = [
    { nombre: "Lápiz", precio: 25 },
    { nombre: "Borracha", precio: 50 },
    { nombre: "Caderno", precio: 350 },
    { nombre: "Caneta", precio: 175 },
    { nombre: "Régua", precio: 225 },
    { nombre: "Apontador", precio: 75 },
    { nombre: "Cola", precio: 150 },
    { nombre: "Tesoura", precio: 400 },
    { nombre: "Estojo", precio: 750 },
    { nombre: "Mochila", precio: 2500 },
  ];

  let enunciado = '';
  let respuestaCorrecta = '';
  let customId = 1000 + moduloId * 100 + nivelId * 10 + getRandomInt(1, 9);

  if (moduloId === 1) {
    if (nivelId === 1) {
      const operacion = getRandomChoice(["doble", "mitad", "triple"]);
      if (operacion === "mitad") {
        const base = getRandomInt(2, 20) * 2;
        enunciado = `¿Cuánto es la mitad de ${base}?`;
        respuestaCorrecta = (base / 2).toString();
      } else if (operacion === "doble") {
        const base = getRandomInt(5, 30);
        enunciado = `¿Cuánto es el doble de ${base}?`;
        respuestaCorrecta = (base * 2).toString();
      } else {
        const base = getRandomInt(3, 20);
        enunciado = `¿Cuánto es el triple de ${base}?`;
        respuestaCorrecta = (base * 3).toString();
      }
    } else if (nivelId === 2) {
      const patron = getRandomChoice(["a + b * c", "a * b + c", "a + b - c * d"]);
      if (patron === "a + b * c") {
        const a = getRandomInt(1, 20);
        const b = getRandomInt(2, 10);
        const c = getRandomInt(2, 8);
        enunciado = `¿Cuánto es ${a} + ${b} × ${c}?`;
        respuestaCorrecta = (a + b * c).toString();
      } else if (patron === "a * b + c") {
        const a = getRandomInt(2, 10);
        const b = getRandomInt(2, 8);
        const c = getRandomInt(1, 20);
        enunciado = `¿Cuánto es ${a} × ${b} + ${c}?`;
        respuestaCorrecta = (a * b + c).toString();
      } else {
        const c = getRandomInt(2, 6);
        const d = getRandomInt(2, 5);
        const a = getRandomInt(c * d + 1, 60);
        const b = getRandomInt(1, 15);
        enunciado = `¿Cuánto es ${a} + ${b} - ${c} × ${d}?`;
        respuestaCorrecta = (a + b - c * d).toString();
      }
    } else { // nivelId === 3
      const plantillas = [
        () => {
          const b = getRandomInt(3, 20);
          const m = getRandomInt(2, 4);
          const textMult = m === 2 ? 'doble' : m === 3 ? 'triple' : 'cuádruple';
          return {
            text: `Ana tiene ${b} canicas. Pedro tiene el ${textMult} que ella. ¿Cuántas canicas tiene Pedro?`,
            ans: (b * m).toString()
          };
        },
        () => {
          const b = getRandomInt(10, 30) * 2;
          return {
            text: `En una fiesta hay ${b} globos. Al final de la fiesta se usó la mitad. ¿Cuántos globos quedaron?`,
            ans: (b / 2).toString()
          };
        },
        () => {
          const b = getRandomInt(5, 15);
          return {
            text: `Una caja tiene ${b} chocolates. Si compramos el triple de cajas, ¿cuántos chocolates tenemos en total?`,
            ans: (b * 3).toString()
          };
        }
      ];
      const selected = getRandomChoice(plantillas)();
      enunciado = selected.text;
      respuestaCorrecta = selected.ans;
    }
  } else if (moduloId === 2) {
    if (nivelId === 1) {
      const a = getRandomInt(5, 40);
      const b = getRandomInt(3, 30);
      const c = a + b;
      const modo = getRandomChoice(["falta_a", "falta_b"]);
      if (modo === "falta_b") {
        enunciado = `Si ${a} + ___ = ${c}, ¿cuánto vale ___?`;
        respuestaCorrecta = b.toString();
      } else {
        enunciado = `Si ___ + ${b} = ${c}, ¿cuánto vale ___?`;
        respuestaCorrecta = a.toString();
      }
    } else if (nivelId === 2) {
      const a = getRandomInt(2, 12);
      const b = getRandomInt(2, 12);
      const c = a * b;
      const modo = getRandomChoice(["falta_factor_a", "falta_factor_b"]);
      if (modo === "falta_factor_b") {
        enunciado = `Si ${a} × ___ = ${c}, ¿cuánto vale ___?`;
        respuestaCorrecta = b.toString();
      } else {
        enunciado = `Si ___ × ${b} = ${c}, ¿cuánto vale ___?`;
        respuestaCorrecta = a.toString();
      }
    } else if (nivelId === 3) {
      const tipo = getRandomChoice(["suma_mixta", "resta_mixta", "mult_division"]);
      if (tipo === "suma_mixta") {
        const total = getRandomInt(15, 80);
        const parte1 = getRandomInt(5, total - 5);
        enunciado = `${parte1} + [ ] = ${total}`;
        respuestaCorrecta = (total - parte1).toString();
      } else if (tipo === "resta_mixta") {
        const a = getRandomInt(20, 80);
        const b = getRandomInt(5, a - 5);
        enunciado = `${a} - [ ] = ${a - b}`;
        respuestaCorrecta = b.toString();
      } else {
        const a = getRandomInt(2, 10);
        const b = getRandomInt(2, 10);
        enunciado = `${a} × [ ] = ${a * b}`;
        respuestaCorrecta = b.toString();
      }
    } else { // nivel 4: Gran Integración (aleatorio nivel 1, 2 o 3)
      const sub = getRandomChoice([1, 2, 3]);
      const subPregunta = MOCK_PREGUNTA(moduloId, sub);
      enunciado = subPregunta.enunciado;
      respuestaCorrecta = subPregunta.respuesta_correcta || '';
    }
  } else if (moduloId === 3) {
    if (nivelId === 1) {
      const monedasOpciones = [5, 10, 25, 50, 100];
      const numMonedas = getRandomInt(3, 5);
      const monedas: number[] = [];
      for (let i = 0; i < numMonedas; i++) {
        monedas.push(getRandomChoice(monedasOpciones));
      }
      const total = monedas.reduce((sum, m) => sum + m, 0);
      enunciado = `¿Cuánto suman estas monedas? ${monedas.map(m => formatReais(m)).join(" + ")}`;
      respuestaCorrecta = formatReais(total);
    } else if (nivelId === 2) {
      const numProd = getRandomInt(2, 3);
      const shuffled = [...PRODUCTOS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numProd);
      const total = selected.reduce((sum, p) => sum + p.precio, 0);
      enunciado = `João compró: ${selected.map(p => `${p.nombre} (${formatReais(p.precio)})`).join(", ")}. ¿Cuánto pagó en total?`;
      respuestaCorrecta = formatReais(total);
    } else if (nivelId === 3) {
      const numProd = getRandomInt(1, 2);
      const shuffled = [...PRODUCTOS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numProd);
      const total = selected.reduce((sum, p) => sum + p.precio, 0);
      const billetes = [100, 200, 500, 1000, 2000, 5000];
      const bill = billetes.find(b => b > total) || 5000;
      enunciado = `María compró: ${selected.map(p => `${p.nombre} (${formatReais(p.precio)})`).join(", ")}. Pagó con ${formatReais(bill)}. ¿Cuánto recibe de vuelto?`;
      respuestaCorrecta = formatReais(bill - total);
    } else { // nivelId === 4
      const bill = getRandomChoice([500, 1000, 1500, 2000]);
      const numProd = getRandomInt(1, 2);
      const shuffled = [...PRODUCTOS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numProd);
      let total = selected.reduce((sum, p) => sum + p.precio, 0);
      if (total === bill) {
        selected[0].precio += 25;
        total += 25;
      }
      if (bill > total) {
        enunciado = `Tienes ${formatReais(bill)}. Compras: ${selected.map(p => `${p.nombre} (${formatReais(p.precio)})`).join(", ")}. ¿Cuánto dinero te sobra?`;
        respuestaCorrecta = formatReais(bill - total);
      } else {
        enunciado = `Tienes ${formatReais(bill)}. Compras: ${selected.map(p => `${p.nombre} (${formatReais(p.precio)})`).join(", ")}. ¿Cuánto dinero te falta?`;
        respuestaCorrecta = formatReais(total - bill);
      }
    }
  } else if (moduloId === 4) {
    return {
      id: 101,
      modulo_id: 4,
      nivel_id: nivelId,
      enunciado: 'Juan tiene 5 manzanas rojas y 3 perros en el parque. Si compra 4 manzanas más, ¿cuántas manzanas tiene en total?',
      tipo_pregunta: 'subrayado_tokens',
      tiene_cronometro: false,
      payload_tokenizado: [
        { id: 1, texto: 'Juan', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 2, texto: 'tiene', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 3, texto: '5', es_dato_relevante: true, categoria: 'cantidad' },
        { id: 4, texto: 'manzanas', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 5, texto: 'rojas', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 6, texto: 'y 3 perros', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 7, texto: 'en el parque', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 8, texto: 'compra', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 9, texto: '4', es_dato_relevante: true, categoria: 'cantidad' },
        { id: 10, texto: 'manzanas más', es_dato_relevante: false, categoria: 'irrelevante' },
      ],
    };
  } else { // moduloId === 5
    return {
      id: 201,
      modulo_id: 5,
      nivel_id: nivelId,
      enunciado: 'Una tienda tiene 24 chocolates. Los vende en cajas de 6. ¿Cuántas cajas puede preparar? ¿Y cuántos chocolates sobrarán?',
      tipo_pregunta: 'constructor_soluciones_chained',
      tiene_cronometro: false,
      pasos_encadenados: [
        { titulo: 'Paso 1', descripcion: '¿Cuántas cajas puede preparar?', respuesta_correcta: '4' },
        { titulo: 'Paso 2', descripcion: '¿Cuántos chocolates sobran?', respuesta_correcta: '0' },
      ],
    };
  }

  return {
    id: customId,
    modulo_id: moduloId,
    nivel_id: nivelId,
    enunciado: enunciado,
    respuesta_correcta: respuestaCorrecta,
    tipo_pregunta: 'respuesta_numerica',
    tiene_cronometro: false,
  };
}

function MOCK_RESULTADO(
  moduloId: number,
  respuesta: string,
  tokens: number[],
  pregunta: Fase2Pregunta,
  paso: number,
  selectedAltId?: number | null
): Fase2AnswerResult {
  let esCorrecta = false;
  let respuestaCorrecta = pregunta.respuesta_correcta ?? '';

  if (pregunta.tipo_pregunta === 'multiple_opcion' && pregunta.alternativas) {
    const correctAlt = pregunta.alternativas.find(a => (a as any).es_correcta);
    esCorrecta = correctAlt ? correctAlt.id === selectedAltId : false;
    respuestaCorrecta = correctAlt ? correctAlt.texto : '';
  } else if (moduloId <= 3) {
    const normUser = respuesta.trim().toLowerCase().replace(',', '.').replace('r$ ', '');
    const normCorrect = respuestaCorrecta.trim().toLowerCase().replace(',', '.').replace('r$ ', '');
    esCorrecta = normUser === normCorrect;
  } else if (moduloId === 4) {
    esCorrecta = JSON.stringify([...tokens].sort()) === JSON.stringify([3, 9]);
    respuestaCorrecta = '3, 9';
  } else if (moduloId === 5) {
    if (paso === 1) {
      esCorrecta = respuesta.trim() === '4';
      respuestaCorrecta = '4';
    } else {
      esCorrecta = respuesta.trim() === '0';
      respuestaCorrecta = '0';
    }
  }

  return {
    es_correcta:           esCorrecta,
    respuesta_correcta:    respuestaCorrecta,
    aciertos_acumulados:   esCorrecta ? 1 : 0,
    intentos_totales:      1,
    porcentaje_actual:     esCorrecta ? 10 : 0,
    bloque_completado:     false,
    fase_completada:       false,
    es_espejo:             false,
    intentos_espejo_actuales: 0,
    intentos_espejo_max:   3,
    soporte_avanzado:      false,
    tokens_correctos:      moduloId === 4 ? [3, 9] : undefined,
    paso_aprobado:         moduloId === 5 ? paso : undefined,
    valor_paso1_congelado: moduloId === 5 && paso === 1 && esCorrecta ? '4' : undefined,
  };
}

export default Fase2GameScreen;
