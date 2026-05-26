import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, ArrowRight, X } from 'lucide-react';
import type { Fase2Pregunta, Fase2AnswerResult, Fase2AnswerResult as ResultType } from './Fase2Types';
import { submitFase2Answer } from './Fase2Service';

interface Props {
  pregunta: Fase2Pregunta;
  moduleColor: string;
  onClose: (result?: Fase2AnswerResult) => void;
  lastCorrectAnswer?: string;
  lastQuestionEnunciado?: string;
  lastWrongAnswer?: string;
}

export const Fase2MirrorModal: React.FC<Props> = ({ 
  pregunta, 
  moduleColor, 
  onClose,
  lastCorrectAnswer,
  lastQuestionEnunciado,
  lastWrongAnswer
}) => {
  const [respuesta, setRespuesta] = useState('');
  const [feedback, setFeedback] = useState<{
    visible: boolean;
    esCorrecta: boolean;
    resultado?: Fase2AnswerResult;
  }>({ visible: false, esCorrecta: false });
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resetear estado cuando cambie la pregunta (para pasar a la siguiente variante)
  useEffect(() => {
    setRespuesta('');
    setFeedback({ visible: false, esCorrecta: false });
    setShaking(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [pregunta.id]);

  const handleKeypadInput = (num: string) => {
    if (feedback.visible) return;
    setRespuesta(prev => (prev.length >= 10 ? prev : prev + num));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBackspace = () => {
    if (feedback.visible) return;
    setRespuesta(prev => prev.slice(0, -1));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = async () => {
    if (!respuesta.trim() || feedback.visible) return;

    try {
      const result = await submitFase2Answer({
        modulo_id: pregunta.modulo_id,
        nivel_id: pregunta.nivel_id,
        pregunta_id: pregunta.id,
        enunciado_seed: pregunta.enunciado_seed,
        respuesta_dada: respuesta.trim(),
      });

      if (result.es_correcta) {
        setFeedback({ visible: true, esCorrecta: true, resultado: result });
        setTimeout(() => onClose(result), 1500);
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 450);
        setFeedback({ visible: true, esCorrecta: false, resultado: result });
        if (result.soporte_avanzado) {
          // Si llegamos al rescate, cerramos el espejo para que el padre muestre el rescate
          setTimeout(() => onClose(result), 1500);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="f2-feedback-overlay mirror-modal-overlay"
      style={{ zIndex: 1100 }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="f2-mirror-modal-card glass-card"
        style={{ 
          maxWidth: '800px', 
          width: '95%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '30px',
          border: `2px solid ${moduleColor}40`,
          position: 'relative'
        }}
      >
        <button 
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
          onClick={() => onClose()}
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-2">
          <div className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            ¡SEGUNDA OPORTUNIDAD!
          </div>
          <div className="text-white/40 text-xs font-bold">
            Vamos a repasar juntos el concepto
          </div>
        </div>

        {lastCorrectAnswer && (
          <div className="f2-mirror-reveal-box bg-green-500/10 border border-green-500/20 p-4 rounded-2xl mb-2">
            <span className="text-green-500 font-bold text-sm block mb-1">REPASO:</span>
            {lastQuestionEnunciado && (
              <div className="text-white/60 text-sm mb-2 italic">
                Pregunta anterior: "{lastQuestionEnunciado}"
              </div>
            )}
            {lastWrongAnswer && (
              <div className="text-red-400 text-sm mb-2">
                Tú respondiste: <span className="font-bold line-through">{lastWrongAnswer}</span>
              </div>
            )}
            <span className="text-white text-lg">La respuesta correcta era: <strong>{lastCorrectAnswer}</strong></span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <motion.div 
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-8"
            >
              <h2 className="text-center text-2xl md:text-3xl font-black text-white mb-8 leading-tight">
                {pregunta.enunciado}
              </h2>

              <div className="f2-numeric-input-wrap mb-4">
                <div 
                  className={`f2-custom-input-box ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : 'focused'}`}
                  onClick={() => inputRef.current?.focus()}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={respuesta}
                    onChange={e => !feedback.visible && /^[0-9,\-]*$/.test(e.target.value) && setRespuesta(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="f2-hidden-input"
                    autoFocus
                  />
                  <span className="f2-input-value-text text-4xl">
                    {feedback.visible 
                      ? (feedback.resultado?.respuesta_correcta || respuesta) 
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
                          <span className="f2-era-pill">Era: {feedback.resultado?.respuesta_correcta}</span>
                          <div className="f2-status-badge incorrect">
                            <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {feedback.visible && !feedback.esCorrecta && !feedback.resultado?.soporte_avanzado && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full mt-4 p-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                  onClick={() => onClose(feedback.resultado)}
                >
                  ¡Intentar de nuevo! →
                </motion.button>
              )}
            </motion.div>
          </div>

          <div className="w-[280px] shrink-0">
            <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-[2rem]">
              <div className="grid grid-cols-3 gap-3">
                {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                  <button 
                    key={num} 
                    onClick={() => handleKeypadInput(num.toString())}
                    className="aspect-square rounded-2xl bg-white/10 text-white text-xl font-black flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button 
                  key="comma" 
                  onClick={() => handleKeypadInput(',')}
                  className="aspect-square rounded-2xl bg-white/10 text-white text-xl font-black flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  ,
                </button>
                <button 
                  key="0" 
                  onClick={() => handleKeypadInput('0')}
                  className="aspect-square rounded-2xl bg-white/10 text-white text-xl font-black flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  0
                </button>
                <button key="back" onClick={handleBackspace} className="aspect-square rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                  <Delete size={20} />
                </button>
              </div>
              <button 
                key="go" 
                onClick={handleSubmit} 
                disabled={!respuesta.trim() || feedback.visible}
                className="w-full py-4 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {feedback.visible ? 'Continuar' : 'Confirmar'} <ArrowRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
