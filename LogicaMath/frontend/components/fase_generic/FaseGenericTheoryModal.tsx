import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';
import { FaseTeoria } from './faseMetadata';
import './FaseGenericStyles.css';

interface FaseGenericTheoryModalProps {
  teoria: FaseTeoria;
  moduloId: number;
  moduloNombre: string;
  nivelId: number;
  moduleColor: string;
  onClose: () => void;
  onAbort?: () => void;
  isInitialReading?: boolean;
}

export const FaseGenericTheoryModal: React.FC<FaseGenericTheoryModalProps> = ({
  teoria,
  moduloId,
  moduloNombre,
  nivelId,
  moduleColor,
  onClose,
  onAbort,
  isInitialReading = true
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, { isCorrect: boolean; message: string }>>({});

  const chunkArray = (arr: any[], size: number) => {
    if (!arr || arr.length === 0) return [];
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const slides = useMemo(() => {
    const s: { type: string; data: any }[] = [];
    s.push({ type: 'intro', data: null });
    
    if (teoria.ejemplos && teoria.ejemplos.length > 0) {
      const chunks = chunkArray(teoria.ejemplos, 1);
      chunks.forEach(c => s.push({ type: 'examples', data: c }));
    } else {
      s.push({ type: 'examples', data: [] });
    }

    if (teoria.interactivos && teoria.interactivos.length > 0) {
      const withIndex = teoria.interactivos.map((item, index) => ({ ...item, globalIndex: index }));
      const chunks = chunkArray(withIndex, 1);
      chunks.forEach(c => s.push({ type: 'interactives', data: c }));
    }

    if (teoria.tip_pedagogico) {
      s.push({ type: 'tip', data: teoria.tip_pedagogico });
    }

    return s;
  }, [teoria]);

  const totalSteps = slides.length;
  const currentSlide = slides[currentStep];

  const handleAnswerChange = (idx: number, val: string) => {
    setAnswers(prev => ({ ...prev, [idx]: val }));
    setFeedback(prev => {
      const newFb = { ...prev };
      delete newFb[idx];
      return newFb;
    });
  };

  const handleVerify = (idx: number, correctRes: string, msgOk: string, msgErr: string) => {
    const val = answers[idx]?.trim();
    if (!val) return;
    
    if (val.toLowerCase() === correctRes.toLowerCase()) {
      setFeedback(prev => ({ ...prev, [idx]: { isCorrect: true, message: msgOk } }));
    } else {
      setFeedback(prev => ({ ...prev, [idx]: { isCorrect: false, message: msgErr } }));
    }
  };

  const canGoNext = useMemo(() => {
    if (currentSlide?.type !== 'interactives') return true;
    const items = currentSlide.data;
    for (let i = 0; i < items.length; i++) {
      const globalIdx = items[i].globalIndex;
      if (!feedback[globalIdx] || !feedback[globalIdx].isCorrect) return false;
    }
    return true;
  }, [currentSlide, feedback]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(0);

  const goToStep = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
  };

  return (
    <div className="fg-reading-overlay">
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="fg-reading-card fg-flashcard-mode"
      >
        <div className="fg-reading-header">
          <div className="fg-reading-icon" style={{ backgroundColor: `${moduleColor}22`, color: moduleColor, flexShrink: 0 }}>
            <BookOpen size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: moduleColor,
              letterSpacing: '1.2px',
              marginBottom: '2px'
            }}>
              Módulo {moduloId}: {moduloNombre} • Nivel {nivelId}
            </div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
               ✨ {teoria.titulo}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {onAbort && (
              <button 
                onClick={onAbort}
                title={isInitialReading ? "Salir del nivel" : "Cerrar Teoría"}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  transition: 'all 0.2s ease'
                }}
                className="fg-abort-btn"
              >
                <LogOut size={16} />
              </button>
            )}
            <div className="fg-step-indicator" style={{ marginTop: 0 }}>
              Paso {currentStep + 1} de {totalSteps}
            </div>
          </div>
        </div>
        
        <div className="fg-flashcard-body">
          <AnimatePresence mode="wait" custom={direction}>
            {currentSlide?.type === 'intro' && (
              <motion.div
                key="intro"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="fg-flashcard-content"
              >
                {teoria.parrafos.map((p, idx) => (
                  <p key={idx} className="fg-reading-p">{p}</p>
                ))}

                {teoria.diccionario && Object.keys(teoria.diccionario).length > 0 && (
                  <div className="fg-reading-dictionary">
                    <h3>📖 EL DICCIONARIO DEL NIVEL:</h3>
                    <div className="fg-dict-grid">
                      {Object.entries(teoria.diccionario).map(([termino, definicion], idx) => (
                        <div key={idx} className="fg-dict-card" style={{ borderColor: `${moduleColor}55` }}>
                          <div className="fg-dict-term" style={{ color: moduleColor }}>{termino}</div>
                          <div className="fg-dict-def">{definicion as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentSlide?.type === 'examples' && (
              <motion.div
                key={`examples-${currentStep}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="fg-flashcard-content"
              >
                {currentSlide.data.length > 0 ? (
                  <div className="fg-reading-examples">
                    <h3>EJEMPLOS GUIADOS:</h3>
                    {currentSlide.data.map((ex: any, idx: number) => (
                      <div key={idx} className="fg-example-box">
                        <div className="fg-ex-q" dangerouslySetInnerHTML={{ __html: ex.enunciado }} />
                        {ex.pasos ? (
                          <div className="fg-ex-steps">
                            {ex.pasos.map((paso: any) => (
                              <div key={paso.orden} className="fg-ex-step">
                                <span className="fg-ex-step-num">{paso.orden}</span>
                                <span dangerouslySetInnerHTML={{ __html: paso.texto }} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="fg-ex-legacy">→ <span style={{ color: moduleColor }} dangerouslySetInnerHTML={{ __html: ex.respuesta }} /></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="fg-reading-p">No hay ejemplos para este nivel. Avanza al siguiente paso.</div>
                )}
              </motion.div>
            )}

            {currentSlide?.type === 'interactives' && (
              <motion.div
                key={`interactives-${currentStep}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="fg-flashcard-content"
              >
                <div className="fg-reading-interactive">
                  <h3>¡Tu turno! Completa los ejercicios:</h3>
                  {currentSlide.data.map((int: any, localIdx: number) => {
                    const idx = int.globalIndex;
                    const qText = int.enunciado || int.pregunta;
                    const isCorrect = feedback[idx]?.isCorrect;
                    const isLocked = localIdx > 0 && !feedback[currentSlide.data[localIdx - 1].globalIndex]?.isCorrect;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`fg-interactive-box ${isCorrect ? 'correct' : ''} ${feedback[idx] && !isCorrect ? 'error' : ''}`}
                        style={isLocked ? { position: 'relative', overflow: 'hidden', minHeight: '110px' } : {}}
                      >
                        <div 
                          className="fg-int-q"
                          style={isLocked ? { filter: 'blur(5px)', opacity: 0.3, pointerEvents: 'none', userSelect: 'none' } : {}}
                        >
                          {qText}
                        </div>
                        
                        {isLocked ? (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(19, 25, 41, 0.85)',
                            zIndex: 10,
                            borderRadius: '12px',
                            gap: '8px',
                            border: '1px dashed rgba(255, 255, 255, 0.15)'
                          }}>
                            <span style={{ fontSize: '1.4rem' }}>🔒</span>
                            <span style={{ fontSize: '0.85rem', color: '#8a9bbf', fontWeight: 650 }}>
                              Completa el ejercicio anterior para desbloquear
                            </span>
                          </div>
                        ) : (
                          <>
                            {int.pasos && (
                              <div className="fg-ex-steps">
                                {int.pasos.map((paso: any) => {
                                  const isInputPaso = paso.texto.includes("= ?");
                                  if (isInputPaso) {
                                    const parts = paso.texto.split("= ?");
                                    return (
                                      <div key={paso.orden} className="fg-ex-step input-step">
                                        <span className="fg-ex-step-num">{paso.orden}</span>
                                        <span>{parts[0]} = </span>
                                        <div className="fg-int-input-group">
                                          <input 
                                            type="text" 
                                            className="fg-int-input"
                                            value={answers[idx] || ''}
                                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                            disabled={isCorrect}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error);
                                            }}
                                          />
                                          {!isCorrect && (
                                            <button 
                                              className="fg-int-verify"
                                              style={{ backgroundColor: moduleColor }}
                                              onClick={() => handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error)}
                                            >
                                              Verificar
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={paso.orden} className="fg-ex-step">
                                      <span className="fg-ex-step-num">{paso.orden}</span>
                                      <span>{paso.texto}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!int.pasos && (
                              <div className="fg-int-input-group legacy">
                                <input 
                                  type="text" 
                                  className="fg-int-input"
                                  value={answers[idx] || ''}
                                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                  disabled={isCorrect}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error);
                                  }}
                                />
                                {!isCorrect && (
                                  <button 
                                    className="fg-int-verify"
                                    style={{ backgroundColor: moduleColor }}
                                    onClick={() => handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error)}
                                  >
                                    Verificar
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {feedback[idx] && (
                              <div className={`fg-int-feedback ${feedback[idx].isCorrect ? 'success' : 'error'}`}>
                                {feedback[idx].isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                <span>{feedback[idx].message}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {currentSlide?.type === 'tip' && (
              <motion.div
                key="tip"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="fg-flashcard-content"
              >
                <div className="fg-reading-tip highlighted">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '1.05rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <span>¡CONSEJO IMPORTANTE!</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#fffbeb', lineHeight: 1.5 }}>
                    {currentSlide.data}
                  </div>
                </div>

                <div className="fg-ready-container">
                  <motion.div 
                    className="fg-ready-rocket"
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🚀
                  </motion.div>
                  <div className="fg-ready-msg">
                    ¡Excelente trabajo!<br />
                    Estás listo para la práctica libre.
                  </div>
                  <div className="fg-ready-stars">
                    {[...Array(5)].map((_, i) => (
                      <motion.span 
                        key={i}
                        className="fg-ready-star"
                        animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="fg-reading-footer">
          <button 
            className="fg-nav-btn" 
            disabled={currentStep === 0}
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft size={18} /> Atrás
          </button>
          
          {currentStep < totalSteps - 1 ? (
            <button 
              className="fg-nav-btn primary" 
              style={{ backgroundColor: moduleColor, opacity: canGoNext ? 1 : 0.5 }}
              disabled={!canGoNext}
              onClick={() => goToStep(currentStep + 1)}
            >
              Siguiente <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="fg-reading-close-btn"
              style={{ background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})` }}
              onClick={onClose}
            >
              ¡Entendido, empezar!
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
