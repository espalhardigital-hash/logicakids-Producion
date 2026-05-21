import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';
import { Fase2Lectura } from './Fase2Types';
import './Fase2Styles.css';

interface Fase2TheoryModalProps {
  readingData: Fase2Lectura;
  moduleColor: string;
  onClose: () => void;
  onAbort?: () => void;
}

export const Fase2TheoryModal: React.FC<Fase2TheoryModalProps> = ({
  readingData,
  moduleColor,
  onClose,
  onAbort
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
    <div className="f2-reading-overlay">
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="f2-reading-card flashcard-mode"
      >
        <div className="f2-reading-header">
          <div className="f2-reading-icon" style={{ backgroundColor: `${moduleColor}22`, color: moduleColor }}>
            <BookOpen size={24} />
          </div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             ✨ {readingData.titulo} <span style={{ fontSize: '2rem' }}>🧑‍🚀</span>
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onAbort && (
              <button 
                onClick={onAbort}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                <LogOut size={14} /> Abortar
              </button>
            )}
            <div className="f2-step-indicator">
              Paso {currentStep + 1} de {totalSteps}
            </div>
          </div>
        </div>
        
        <div className="f2-reading-body flashcard-body">
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
                className="f2-flashcard-content"
              >
                {readingData.parrafos.map((p, idx) => (
                  <p key={idx} className="f2-reading-p">{p}</p>
                ))}

                {readingData.diccionario && Object.keys(readingData.diccionario).length > 0 && (
                  <div className="f2-reading-dictionary">
                    <h3>📖 EL DICCIONARIO DEL NIVEL:</h3>
                    <div className="f2-dict-grid">
                      {Object.entries(readingData.diccionario).map(([termino, definicion], idx) => (
                        <div key={idx} className="f2-dict-card" style={{ borderColor: `${moduleColor}55` }}>
                          <div className="f2-dict-term" style={{ color: moduleColor }}>{termino}</div>
                          <div className="f2-dict-def">{definicion as string}</div>
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
                className="f2-flashcard-content"
              >
                {currentSlide.data.length > 0 ? (
                  <div className="f2-reading-examples">
                    <h3>EJEMPLOS GUIADOS:</h3>
                    {currentSlide.data.map((ex: any, idx: number) => (
                      <div key={idx} className="f2-example-box">
                        <div className="f2-ex-q">{ex.enunciado}</div>
                        {ex.pasos ? (
                          <div className="f2-ex-steps">
                            {ex.pasos.map((paso: any) => (
                              <div key={paso.orden} className="f2-ex-step">
                                <span className="f2-ex-step-num">{paso.orden}</span>
                                <span>{paso.texto}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                           <div className="f2-ex-legacy">→ <span style={{ color: moduleColor }}>{ex.respuesta}</span></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="f2-reading-p">No hay ejemplos para este nivel. Avanza al siguiente paso.</div>
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
                className="f2-flashcard-content"
              >
                <div className="f2-reading-interactive">
                  <h3>¡Tu turno! Completa los ejercicios:</h3>
                  {currentSlide.data.map((int: any) => {
                    const idx = int.globalIndex;
                    const qText = int.enunciado || int.pregunta;
                    const isCorrect = feedback[idx]?.isCorrect;
                    return (
                      <div key={idx} className={`f2-interactive-box ${isCorrect ? 'correct' : ''} ${feedback[idx] && !isCorrect ? 'error' : ''}`}>
                        <div className="f2-int-q">{qText}</div>
                        {int.pasos && (
                          <div className="f2-ex-steps">
                            {int.pasos.map((paso: any) => {
                              const isInputPaso = paso.texto.includes("= ?");
                              if (isInputPaso) {
                                const parts = paso.texto.split("= ?");
                                return (
                                  <div key={paso.orden} className="f2-ex-step input-step">
                                    <span className="f2-ex-step-num">{paso.orden}</span>
                                    <span>{parts[0]} = </span>
                                    <div className="f2-int-input-group">
                                      <input 
                                        type="number" 
                                        className="f2-int-input"
                                        value={answers[idx] || ''}
                                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                        disabled={isCorrect}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error);
                                        }}
                                      />
                                      {!isCorrect && (
                                        <button 
                                          className="f2-int-verify"
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
                                <div key={paso.orden} className="f2-ex-step">
                                  <span className="f2-ex-step-num">{paso.orden}</span>
                                  <span>{paso.texto}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {!int.pasos && (
                          <div className="f2-int-input-group legacy">
                            <input 
                              type="text" 
                              className="f2-int-input"
                              value={answers[idx] || ''}
                              onChange={(e) => handleAnswerChange(idx, e.target.value)}
                              disabled={isCorrect}
                            />
                            {!isCorrect && (
                              <button 
                                className="f2-int-verify"
                                style={{ backgroundColor: moduleColor }}
                                onClick={() => handleVerify(idx, int.respuesta, int.feedback_acierto, int.feedback_error)}
                              >
                                Verificar
                              </button>
                            )}
                          </div>
                        )}
                        
                        {feedback[idx] && (
                          <div className={`f2-int-feedback ${feedback[idx].isCorrect ? 'success' : 'error'}`}>
                            {feedback[idx].isCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            <span>{feedback[idx].message}</span>
                          </div>
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
                className="f2-flashcard-content"
              >
                <div className="f2-reading-tip highlighted" style={{ borderLeftColor: moduleColor }}>
                  <strong>👾 Tip Pedagógico:</strong> {currentSlide.data}
                </div>
                <div className="f2-ready-msg">
                  ¡Excelente trabajo! Estás listo para enfrentarte a la batería de práctica libre.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="f2-reading-footer">
          <button 
            className="f2-nav-btn" 
            disabled={currentStep === 0}
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft size={18} /> Atrás
          </button>
          
          {currentStep < totalSteps - 1 ? (
            <button 
              className="f2-nav-btn primary" 
              style={{ backgroundColor: moduleColor, opacity: canGoNext ? 1 : 0.5 }}
              disabled={!canGoNext}
              onClick={() => goToStep(currentStep + 1)}
            >
              Siguiente <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              className="f2-reading-close-btn"
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
