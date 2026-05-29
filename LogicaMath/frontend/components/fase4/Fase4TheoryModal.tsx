import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft, LogOut, Sparkles } from 'lucide-react';
import { Fase4Lectura } from './Fase4Types';
import { PizzaFractionVisualizer } from './PizzaFractionVisualizer';
import { PieChartVisualizer } from './PieChartVisualizer';
import './Fase4Styles.css';

interface Fase4TheoryModalProps {
  readingData: Fase4Lectura;
  moduleColor: string;
  onClose: () => void;
  onAbort?: () => void;
  isInitialReading?: boolean;
}

const MODULE_NAMES: Record<number, string> = {
  1: 'La Fracción Visual',
  2: 'Fracción de Cantidad',
  3: 'Porcentajes Rápidos y Promedios',
  4: 'Razón y Mezclas',
};

export const Fase4TheoryModal: React.FC<Fase4TheoryModalProps> = ({
  readingData,
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
    
    if (readingData.ejemplos && readingData.ejemplos.length > 0) {
      const chunks = chunkArray(readingData.ejemplos, 2);
      chunks.forEach(c => s.push({ type: 'examples', data: c }));
    } else {
      s.push({ type: 'examples', data: [] });
    }

    if (readingData.interactivos && readingData.interactivos.length > 0) {
      const withIndex = readingData.interactivos.map((item, index) => ({ ...item, globalIndex: index }));
      const chunks = chunkArray(withIndex, 2);
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
    
    // Normalize comparison: remove spaces, lowercase, replace commas with dots
    const cleanVal = val.toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
    const cleanCorrect = correctRes.toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
    
    if (cleanVal === cleanCorrect) {
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

  const [direction, setDirection] = useState(0);

  const goToStep = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="f4-reading-overlay">
      <motion.div 
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="f4-reading-card"
        style={{ '--neon-accent-color': moduleColor } as React.CSSProperties}
      >
        {/* Header */}
        <div className="f4-reading-header">
          <div className="f4-reading-icon" style={{ backgroundColor: `${moduleColor}18`, color: moduleColor }}>
            <BookOpen size={22} />
          </div>
          <div className="f4-reading-header-content">
            <div className="f4-reading-badge" style={{ color: moduleColor }}>
              MÓDULO {readingData.modulo_id}: {MODULE_NAMES[readingData.modulo_id] || 'Fracciones'} • NIVEL {readingData.nivel_id}
            </div>
            <h2 className="f4-reading-title">
               💡 {readingData.titulo}
            </h2>
          </div>
          
          <div className="f4-reading-header-controls">
            {onAbort && (
              <button 
                onClick={onAbort}
                title={isInitialReading ? "Salir del nivel" : "Cerrar Teoría"}
                className="f4-abort-btn"
              >
                <LogOut size={16} />
              </button>
            )}
            <div className="f4-step-indicator">
              Paso {currentStep + 1} de {totalSteps}
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="f4-reading-body">
          <AnimatePresence mode="wait" custom={direction}>
            {currentSlide?.type === 'intro' && (
              <motion.div
                key="intro"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="f4-flashcard-content"
              >
                {readingData.parrafos.map((p, idx) => (
                  <p key={idx} className="f4-reading-p">{p}</p>
                ))}

                {readingData.diccionario && Object.keys(readingData.diccionario).length > 0 && (
                  <div className="f4-reading-dictionary">
                    <h3>🔍 DICCIONARIO MATEMÁTICO:</h3>
                    <div className="f4-dict-grid">
                      {Object.entries(readingData.diccionario).map(([termino, definicion], idx) => (
                        <div key={idx} className="f4-dict-card" style={{ borderColor: `${moduleColor}33` }}>
                          <div className="f4-dict-term" style={{ color: moduleColor }}>{termino}</div>
                          <div className="f4-dict-def">{definicion as string}</div>
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
                transition={{ duration: 0.25 }}
                className="f4-flashcard-content"
              >
                {currentSlide.data.length > 0 ? (
                  <div className="f4-reading-examples">
                    <h3>📐 EJEMPLOS ILUSTRADOS:</h3>
                    {currentSlide.data.map((ex: any, idx: number) => {
                      let fractionVisualizer = null;
                      if (readingData.modulo_id === 1) {
                         const textToSearch = (ex.respuesta || ex.enunciado || '');
                         const match = textToSearch.match(/(\d+)\/(\d+)/);
                         if (match) {
                            const num = parseInt(match[1], 10);
                            const den = parseInt(match[2], 10);
                            if (num <= den && den <= 12) {
                               const sombreados = Array.from({length: num}, (_, i) => i);
                               fractionVisualizer = (
                                  <div className="flex justify-center my-4 scale-[0.8] origin-top">
                                     <PizzaFractionVisualizer slices={den} initialSombreados={sombreados} color={moduleColor} interactive={false} hideText={true} />
                                  </div>
                               );
                            }
                         }
                      } else if (readingData.modulo_id === 3) {
                         const match = (ex.respuesta || ex.enunciado || '').match(/(\d+)%/);
                         if (match) {
                            const pct = parseInt(match[1], 10);
                            fractionVisualizer = (
                               <div className="flex justify-center my-4 scale-[0.8] origin-top">
                                  <PieChartVisualizer pctA={100 - pct} pctB={0} pctC={pct} categorias={['Resto', '', 'Interés']} color={moduleColor} interactive={false} />
                               </div>
                            );
                         }
                      }
                      
                      return (
                        <div key={idx} className="f4-example-box" style={{ borderLeftColor: moduleColor }}>
                          {fractionVisualizer}
                          <div className="f4-ex-q" dangerouslySetInnerHTML={{ __html: ex.enunciado }} />
                          {ex.pasos ? (
                            <div className="f4-ex-steps">
                              {ex.pasos.map((paso: any) => (
                                <div key={paso.orden} className="f4-ex-step">
                                  <span className="f4-ex-step-num" style={{ color: moduleColor, backgroundColor: `${moduleColor}12` }}>{paso.orden}</span>
                                  <span className="f4-ex-step-text" dangerouslySetInnerHTML={{ __html: paso.texto }} />
                                </div>
                              ))}
                            </div>
                          ) : (
                             <div className="f4-ex-legacy">Respuesta → <span style={{ color: moduleColor, fontWeight: 800 }} dangerouslySetInnerHTML={{ __html: ex.respuesta }} /></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="f4-reading-p text-center opacity-70">
                    Sigue adelante para repasar conceptos prácticos e interactivos.
                  </div>
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
                transition={{ duration: 0.25 }}
                className="f4-flashcard-content"
              >
                <div className="f4-reading-interactive">
                  <h3>🎯 ENTRENAMIENTO RÁPIDO: Completa para avanzar</h3>
                  {currentSlide.data.map((int: any, localIdx: number) => {
                    const idx = int.globalIndex;
                    const qText = int.enunciado || int.pregunta;
                    const isCorrect = feedback[idx]?.isCorrect;
                    const isLocked = localIdx > 0 && !feedback[currentSlide.data[localIdx - 1].globalIndex]?.isCorrect;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`f4-interactive-box ${isCorrect ? 'correct' : ''} ${feedback[idx] && !isCorrect ? 'error' : ''}`}
                        style={isLocked ? { position: 'relative', overflow: 'hidden', minHeight: '110px' } : {}}
                      >
                        <div 
                          className="f4-int-q"
                          style={isLocked ? { filter: 'blur(5px)', opacity: 0.3, pointerEvents: 'none', userSelect: 'none' } : {}}
                        >
                          {qText}
                        </div>
                        
                        {isLocked ? (
                          <div className="f4-interactive-locked-overlay">
                            <span>🔒</span>
                            <span>Completa el ejercicio anterior para desbloquear</span>
                          </div>
                        ) : (
                          <>
                            {int.pasos && (
                              <div className="f4-ex-steps">
                                {int.pasos.map((paso: any) => {
                                  const isInputPaso = paso.texto.includes("= ?");
                                  if (isInputPaso) {
                                    const parts = paso.texto.split("= ?");
                                    return (
                                      <div key={paso.orden} className="f4-ex-step input-step">
                                        <span className="f4-ex-step-num" style={{ color: moduleColor, backgroundColor: `${moduleColor}12` }}>{paso.orden}</span>
                                        <span className="f4-ex-step-text">{parts[0]} = </span>
                                        <div className="f4-int-input-group">
                                          <input 
                                            type="text" 
                                            className="f4-int-input"
                                            value={answers[idx] || ''}
                                            onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                            disabled={isCorrect}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error);
                                            }}
                                            autoComplete="off"
                                          />
                                          {!isCorrect && (
                                            <button 
                                              className="f4-int-verify"
                                              style={{ background: moduleColor }}
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
                                    <div key={paso.orden} className="f4-ex-step">
                                      <span className="f4-ex-step-num" style={{ color: moduleColor, backgroundColor: `${moduleColor}12` }}>{paso.orden}</span>
                                      <span className="f4-ex-step-text">{paso.texto}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {!int.pasos && (
                              <div className="f4-int-input-group legacy">
                                <input 
                                  type="text" 
                                  className="f4-int-input"
                                  value={answers[idx] || ''}
                                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                  disabled={isCorrect}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error);
                                  }}
                                  autoComplete="off"
                                />
                                {!isCorrect && (
                                  <button 
                                    className="f4-int-verify"
                                    style={{ background: moduleColor }}
                                    onClick={() => handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error)}
                                  >
                                    Verificar
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {feedback[idx] && (
                              <div className={`f4-int-feedback ${feedback[idx].isCorrect ? 'success' : 'error'}`}>
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
                transition={{ duration: 0.25 }}
                className="f4-flashcard-content"
              >
                <div className="f4-reading-tip highlighted">
                  <div className="f4-tip-title-box">
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <span>¡ANÁLISIS DE MISIÓN ADVERSA!</span>
                  </div>
                  <div className="f4-tip-text">
                    {currentSlide.data}
                  </div>
                </div>

                <div className="f4-ready-container">
                  <motion.div 
                    className="f4-ready-rocket"
                    animate={{ 
                      y: [0, -12, 0],
                      rotate: [0, 4, -4, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🚀
                  </motion.div>
                  <div className="f4-ready-msg">
                    ¡Excelente preparación!<br />
                    El sistema de fracciones está listo. ¡Es hora de jugar!
                  </div>
                  <div className="f4-ready-stars">
                    {[...Array(5)].map((_, i) => (
                      <motion.span 
                        key={i}
                        className="f4-ready-star"
                        animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.8 + i * 0.4, repeat: Infinity }}
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
        
        {/* Footer */}
        <div className="f4-reading-footer">
          <button 
            className="f4-nav-btn" 
            disabled={currentStep === 0}
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft size={18} /> Atrás
          </button>
          
          {currentStep < totalSteps - 1 ? (
            <button 
              className="f4-nav-btn primary" 
              style={{ background: moduleColor, opacity: canGoNext ? 1 : 0.5 }}
              disabled={!canGoNext}
              onClick={() => goToStep(currentStep + 1)}
            >
              Siguiente <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="f4-reading-close-btn"
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
