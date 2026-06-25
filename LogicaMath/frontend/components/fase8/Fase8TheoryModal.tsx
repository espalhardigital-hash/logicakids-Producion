import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';
import { Fase8Lectura } from './Fase8Types';
import { formatContent, fixEncoding } from '../../services/textService';
import { getAvatarUrl } from '../../services/storageService';
import './Fase8Styles.css';

interface Fase8TheoryModalProps {
  readingData: Fase8Lectura;
  moduleColor: string;
  onClose: () => void;
  onAbort?: () => void;
  userAvatar?: string;
  isInitialReading?: boolean;
}

const MODULE_NAMES: Record<number, string> = {
  1: 'Gimnasio Mental',
  2: 'Tablas en Acción',
  3: 'Tienda Matemática',
  4: 'Constructor de Soluciones',
  5: 'Desafío Lógico',
};

export const Fase8TheoryModal: React.FC<Fase8TheoryModalProps> = ({
  readingData,
  moduleColor,
  onClose,
  onAbort,
  userAvatar,
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
    
    if (readingData.ejemplos && readingData.ejemplos.length > 0) {
      const chunks = chunkArray(readingData.ejemplos, 1);
      chunks.forEach(c => s.push({ type: 'examples', data: c }));
    } else {
      s.push({ type: 'examples', data: [] });
    }

    if (readingData.interactivos && readingData.interactivos.length > 0) {
      const withIndex = readingData.interactivos.map((item, index) => ({ ...item, globalIndex: index }));
      const chunks = chunkArray(withIndex, 1);
      chunks.forEach(c => s.push({ type: 'interactives', data: c }));
    }

    if (readingData.tip_pedagogico) {
      s.push({ type: 'tip', data: readingData.tip_pedagogico });
    }

    return s;
  }, [readingData]);

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
    
    if (val === correctRes) {
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

  // Animations (Slide)
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
    <div className="f8-reading-overlay">
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="f8-reading-card flashcard-mode"
      >
        <div className="f8-reading-header">
          <div className="f8-reading-icon" style={{ backgroundColor: `${moduleColor}22`, color: moduleColor, flexShrink: 0 }}>
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
              Módulo {readingData.modulo_id}: {MODULE_NAMES[readingData.modulo_id] || 'Cálculo'} • Nivel {readingData.nivel_id}
            </div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
               ✨ {fixEncoding(readingData.titulo)}
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
                className="f8-abort-btn"
              >
                <LogOut size={16} />
              </button>
            )}
            <div className="f8-step-indicator" style={{ marginTop: 0 }}>
              Paso {currentStep + 1} de {totalSteps}
            </div>
          </div>
        </div>
        
        <div className="f8-reading-body flashcard-body">
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
                className="f8-flashcard-content"
              >
                {readingData.parrafos.map((p, idx) => (
                  <p key={idx} className="f8-reading-p" dangerouslySetInnerHTML={{ __html: formatContent(p) }} />
                ))}

                {readingData.diccionario && Object.keys(readingData.diccionario).length > 0 && (
                  <div className="f8-reading-dictionary">
                    <h3>📖 EL DICCIONARIO DEL NIVEL:</h3>
                    <div className="f8-dict-grid">
                      {Object.entries(readingData.diccionario).map(([termino, definicion], idx) => (
                        <div key={idx} className="f8-dict-card" style={{ borderColor: `${moduleColor}55` }}>
                          <div className="f8-dict-term" style={{ color: moduleColor }} dangerouslySetInnerHTML={{ __html: formatContent(termino) }} />
                          <div className="f8-dict-def" dangerouslySetInnerHTML={{ __html: formatContent(definicion as string) }} />
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
                className="f8-flashcard-content"
              >
                {currentSlide.data.length > 0 ? (
                  <div className="f8-reading-examples">
                    <h3>EJEMPLOS GUIADOS:</h3>
                    {currentSlide.data.map((ex: any, idx: number) => (
                      <div key={idx} className="f8-example-box">
                        <div className="f8-ex-q" dangerouslySetInnerHTML={{ __html: ex.enunciado }} />
                        {ex.pasos ? (
                          <div className="f8-ex-steps">
                            {ex.pasos.map((paso: any) => (
                              <div key={paso.orden} className="f8-ex-step">
                                <span className="f8-ex-step-num">{paso.orden}</span>
                                <span dangerouslySetInnerHTML={{ __html: paso.texto }} />
                              </div>
                            ))}
                          </div>
                        ) : (
                           <div className="f8-ex-legacy">→ <span style={{ color: moduleColor }} dangerouslySetInnerHTML={{ __html: ex.respuesta }} /></div>
                        )}
                      </div>
                    ))}
                  </div>

                ) : (
                  <div className="f8-reading-p">No hay ejemplos para este nivel. Avanza al siguiente paso.</div>
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
                className="f8-flashcard-content"
              >
                <div className="f8-reading-interactive">
                  <h3>¡Tu turno! Completa los ejercicios:</h3>
                  {currentSlide.data.map((int: any, localIdx: number) => {
                    const idx = int.globalIndex;
                    const qText = int.enunciado || int.pregunta;
                    const isCorrect = feedback[idx]?.isCorrect;
                    const isLocked = localIdx > 0 && !feedback[currentSlide.data[localIdx - 1].globalIndex]?.isCorrect;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`f8-interactive-box ${isCorrect ? 'correct' : ''} ${feedback[idx] && !isCorrect ? 'error' : ''}`}
                        style={isLocked ? { position: 'relative', overflow: 'hidden', minHeight: '110px' } : {}}
                      >
                        <div 
                          className="f8-int-q"
                          style={isLocked ? { filter: 'blur(5px)', opacity: 0.3, pointerEvents: 'none', userSelect: 'none' } : {}}
                          dangerouslySetInnerHTML={{ __html: qText }}
                        />
                        
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
                              <div className="f8-ex-steps">
                                {int.pasos.map((paso: any) => {
                                  const isInputPaso = paso.texto.includes("= ?");
                                  if (isInputPaso) {
                                    const parts = paso.texto.split("= ?");
                                    return (
                                      <div key={paso.orden} className="f8-ex-step input-step">
                                        <span className="f8-ex-step-num">{paso.orden}</span>
                                        <span>{parts[0]} = </span>
                                        <div className="f8-int-input-group">
                                          <input 
                                            type="number" 
                                            className="f8-int-input"
                                            value={answers[idx] || ''}
                                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                            disabled={isCorrect}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error);
                                            }}
                                          />
                                          {!isCorrect && (
                                            <button 
                                              className="f8-int-verify"
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
                                    <div key={paso.orden} className="f8-ex-step">
                                      <span className="f8-ex-step-num">{paso.orden}</span>
                                      <span>{paso.texto}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!int.pasos && (
                              <div className="f8-int-input-group legacy">
                                <input 
                                  type="text" 
                                  className="f8-int-input"
                                  value={answers[idx] || ''}
                                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                  disabled={isCorrect}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error);
                                  }}
                                />
                                {!isCorrect && (
                                  <button 
                                    className="f8-int-verify"
                                    style={{ backgroundColor: moduleColor }}
                                    onClick={() => handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error)}
                                  >
                                    Verificar
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {feedback[idx] && (
                              <div className={`f8-int-feedback ${feedback[idx].isCorrect ? 'success' : 'error'}`}>
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
                className="f8-flashcard-content"
              >
                <div className="f8-reading-tip highlighted">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '1.05rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <span>¡CONSEJO IMPORTANTE!</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#fffbeb', lineHeight: 1.5 }}>
                    {currentSlide.data}
                  </div>
                </div>

                <div className="f8-ready-container">
                  <motion.div 
                    className="f8-ready-rocket"
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
                  <div className="f8-ready-msg">
                    ¡Excelente trabajo!<br />
                    Estás listo para la práctica libre.
                  </div>
                  <div className="f8-ready-stars">
                    {[...Array(5)].map((_, i) => (
                      <motion.span 
                        key={i}
                        className="f8-ready-star"
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
        
        <div className="f8-reading-footer">
          <button 
            className="f8-nav-btn" 
            disabled={currentStep === 0}
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft size={18} /> Atrás
          </button>
          
          {currentStep < totalSteps - 1 ? (
            <button 
              className="f8-nav-btn primary" 
              style={{ backgroundColor: moduleColor, opacity: canGoNext ? 1 : 0.5 }}
              disabled={!canGoNext}
              onClick={() => goToStep(currentStep + 1)}
            >
              Siguiente <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="f8-reading-close-btn"
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
