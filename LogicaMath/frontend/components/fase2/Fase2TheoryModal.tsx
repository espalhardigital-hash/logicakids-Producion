import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Fase2Lectura } from './Fase2Types';
import './Fase2Styles.css';

interface Fase2TheoryModalProps {
  readingData: Fase2Lectura;
  moduleColor: string;
  onClose: () => void;
}

export const Fase2TheoryModal: React.FC<Fase2TheoryModalProps> = ({
  readingData,
  moduleColor,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, { isCorrect: boolean; message: string }>>({});
  
  const totalSteps = 3;

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

  const allInteractivesCorrect = () => {
    if (!readingData.interactivos || readingData.interactivos.length === 0) return true;
    for (let i = 0; i < readingData.interactivos.length; i++) {
      if (!feedback[i] || !feedback[i].isCorrect) return false;
    }
    return true;
  };

  const canGoNext = currentStep !== 1 || allInteractivesCorrect();

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
          <h2>✨ {readingData.titulo} 🦸🏽‍♂️</h2>
          <div className="f2-step-indicator">
            Paso {currentStep + 1} de {totalSteps}
          </div>
        </div>
        
        <div className="f2-reading-body flashcard-body">
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 0 && (
              <motion.div
                key="step0"
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
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="f2-flashcard-content"
              >
                {readingData.ejemplos && readingData.ejemplos.length > 0 && (
                  <div className="f2-reading-examples">
                    <h3>Ejemplos Guiados:</h3>
                    {readingData.ejemplos.map((ex, idx) => (
                      <div key={idx} className="f2-example-box">
                        <div className="f2-ex-q">{ex.enunciado}</div>
                        {ex.pasos ? (
                          <div className="f2-ex-steps">
                            {ex.pasos.map(paso => (
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
                )}

                {readingData.interactivos && readingData.interactivos.length > 0 && (
                  <div className="f2-reading-interactive">
                    <h3>¡Tu turno! Completa los ejercicios:</h3>
                    {readingData.interactivos.map((int, idx) => {
                      const qText = int.enunciado || int.pregunta;
                      const isCorrect = feedback[idx]?.isCorrect;
                      return (
                        <div key={idx} className={`f2-interactive-box ${isCorrect ? 'correct' : ''} ${feedback[idx] && !isCorrect ? 'error' : ''}`}>
                          <div className="f2-int-q">{qText}</div>
                          {int.pasos && (
                            <div className="f2-ex-steps">
                              {int.pasos.map(paso => {
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
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="f2-flashcard-content"
              >
                {readingData.tip_pedagogico && (
                  <div className="f2-reading-tip highlighted" style={{ borderLeftColor: moduleColor }}>
                    <strong>👾 Tip Pedagógico:</strong> {readingData.tip_pedagogico}
                  </div>
                )}
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
