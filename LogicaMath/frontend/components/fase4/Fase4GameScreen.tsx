import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFase4Question, submitFase4Answer, getFase4Reading, submitFase4CloseRescue } from './Fase4Service';
import { Fase4Pregunta, Fase4AnswerResult, Fase4Lectura } from './Fase4Types';
import { PizzaFractionVisualizer } from './PizzaFractionVisualizer';
import { ThermometerVisualizer } from './ThermometerVisualizer';
import { CustomKeyboard } from '../common/CustomKeyboard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Key, Sparkles } from 'lucide-react';
import { getCurrentUserFull } from '../../services/storageService';
import './Fase4Styles.css';

const MODULE_NAMES: Record<number, string> = {
  1: 'La Fracción Visual',
  2: 'Fracción de Cantidad',
  3: 'Porcentajes Rápidos y Promedios',
  4: 'Razón y Mezclas',
};

const MODULE_COLORS: Record<number, string> = {
  1: '#A855F7', // Púrpura neón
  2: '#C084FC', // Púrpura brillante
  3: '#7C3AED', // Púrpura oscuro
  4: '#6D28D9', // Púrpura profundo
};

interface FeedbackState {
  visible: boolean;
  esCorrecta: boolean;
  isError?: boolean;
  errorMessage?: string;
  resultado?: Fase4AnswerResult;
}

export const Fase4GameScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const moduloId = Number(location.state?.moduloId || '1');
  const nivelId = Number(location.state?.nivelId || '1');
  
  const isChallenge = moduloId === 99 || (nivelId >= 11 && nivelId <= 13);
  // maxAciertos comes dynamically from the API (set by Admin via ConfiguracionProgreso)
  const [maxAciertos, setMaxAciertos] = useState<number>(isChallenge ? (nivelId === 13 ? 10 : 20) : 15);
  const moduleName = MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  const moduleColor = MODULE_COLORS[moduloId] ?? '#A855F7';

  const [pregunta, setPregunta] = useState<Fase4Pregunta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Respuestas
  const [respuestaNum, setRespuestaNum] = useState(''); // Para numerador o respuestas simples
  const [respuestaDen, setRespuestaDen] = useState(''); // Para denominador
  const [activeInputField, setActiveInputField] = useState<'num' | 'den'>('num');
  
  // Interactive selected count
  const [interactiveSelectedCount, setInteractiveSelectedCount] = useState<number>(0);

  const [timer, setTimer] = useState<number | null>(null);
  const [maxTimer, setMaxTimer] = useState<number>(1);
  const [progreso, setProgreso] = useState({ aciertos: 0, intentos: 0, porcentaje: 0 });
  const [feedback, setFeedback] = useState<FeedbackState>({ visible: false, esCorrecta: false });
  const [shaking, setShaking] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showReading, setShowReading] = useState(false);
  const [isInitialReading, setIsInitialReading] = useState(true);
  const [readingData, setReadingData] = useState<Fase4Lectura | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [studentName, setStudentName] = useState('Estudiante');

  // Load User Details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserFull();
        if (user?.username) setStudentName(user.username);
        if (user?.avatar) setUserAvatar(user.avatar);
      } catch (e) {
        console.error("Error loading user profile:", e);
      }
    };
    fetchUser();
  }, []);

  // Automatic Theory Loading
  useEffect(() => {
    if (isChallenge) {
      setShowReading(false);
      return;
    }
    const check = async () => {
      setIsInitialReading(true);
      try {
        const data = await getFase4Reading(moduloId, nivelId);
        setReadingData(data);
        setShowReading(true);
      } catch (err) {
        console.error("Error loading theory:", err);
      }
    };
    check();
  }, [moduloId, nivelId, isChallenge]);

  // Manual Theory Opener
  const handleOpenReading = useCallback(async () => {
    if (isChallenge) return;
    setIsInitialReading(false);
    try {
      const data = await getFase4Reading(moduloId, nivelId);
      setReadingData(data);
      setShowReading(true);
    } catch (err) {
      console.error("Error loading theory:", err);
    }
  }, [moduloId, nivelId, isChallenge]);

  useEffect(() => {
    loadNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduloId, nivelId]);

  const loadNextQuestion = async () => {
    setLoading(true);
    setRespuestaNum('');
    setRespuestaDen('');
    setActiveInputField('num');
    setInteractiveSelectedCount(0);
    try {
      const q = await getFase4Question(moduloId, nivelId);
      setPregunta(q);
      // Sync dynamic required count and current progress from backend
      if (q.cantidad_requerida) setMaxAciertos(q.cantidad_requerida);
      if (q.aciertos_acumulados !== undefined) {
        setProgreso(prev => ({
          ...prev,
          aciertos: q.aciertos_acumulados!,
          intentos: q.intentos_totales ?? prev.intentos,
          porcentaje: q.porcentaje_actual ?? prev.porcentaje,
        }));
      }
      
      if (q.tiene_cronometro && q.tiempo_limite_segundos) {
        setTimer(q.tiene_cronometro && !showReading ? q.tiempo_limite_segundos : null);
        setMaxTimer(q.tiempo_limite_segundos);
      } else {
        setTimer(null);
      }
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timer === null || showReading) return;
    if (timer <= 0) { handleSubmit(); return; }
    timerRef.current = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer, showReading]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleFeedbackClose = useCallback(() => {
    if (feedback.resultado?.early_exit) {
      setFeedback({ visible: false, esCorrecta: false });
      navigate('/welcome-fase4');
      return;
    }

    if (feedback.isError) {
      setFeedback({ visible: false, esCorrecta: false });
      return;
    }

    setFeedback({ visible: false, esCorrecta: false });

    if (feedback.resultado?.fase_completada) {
      alert("¡Felicidades! Has dominado la Fase 4 de Fracciones y avanzas a la Fase 5.");
      navigate('/map');
      return;
    }

    if (feedback.resultado?.bloque_completado) {
      navigate('/welcome-fase4');
    } else if (feedback.esCorrecta) {
      loadNextQuestion();
    } else {
      if (feedback.resultado?.es_espejo) {
        setTimeout(() => loadNextQuestion(), 1500);
      } else {
        setRespuestaNum('');
        setRespuestaDen('');
      }
    }
  }, [feedback, navigate]);

  const handleSubmit = useCallback(async (customAnswer?: string) => {
    if (!pregunta) return;
    if (feedback.visible) {
      handleFeedbackClose();
      return;
    }

    stopTimer();

    // Determinar la respuesta a enviar
    let finalAnswer = '';
    
    // Si es interactivo y responde interactivo:
    const isInteractivePizza = pregunta.datos_numericos?.tipo_visual === 'pizza' && moduloId === 1 && nivelId === 1;
    if (isInteractivePizza && customAnswer === undefined) {
      // Tomamos el numerador del input y denominador de la pizza cortes
      const numVal = respuestaNum.trim();
      const denVal = respuestaDen.trim();
      if (numVal && denVal) {
        finalAnswer = `${numVal}/${denVal}`;
      } else {
        finalAnswer = `${interactiveSelectedCount}/${pregunta.datos_numericos?.cortes || 8}`;
      }
    } else {
      const numVal = respuestaNum.trim();
      const denVal = respuestaDen.trim();
      if (denVal) {
        finalAnswer = `${numVal}/${denVal}`;
      } else {
        finalAnswer = numVal;
      }
    }

    if (customAnswer !== undefined) {
      finalAnswer = customAnswer;
    }

    const payload = {
      modulo_id: moduloId,
      nivel_id: nivelId,
      pregunta_id: pregunta.id,
      respuesta_dada: finalAnswer.trim() || undefined,
      tiempo_respuesta_segundos: timer ? (pregunta.tiempo_limite_segundos || 0) - timer : 15,
    };

    try {
      const resultado = await submitFase4Answer(payload);
      
      setProgreso({
        aciertos: resultado.aciertos_acumulados,
        intentos: resultado.intentos_totales,
        porcentaje: resultado.porcentaje_actual,
      });

      if (resultado.early_exit) {
        setFeedback({ visible: true, esCorrecta: false, resultado });
        return;
      }

      if (resultado.es_correcta) {
        setFeedback({ visible: true, esCorrecta: true, resultado });
        if (resultado.fase_completada) {
          setTimeout(() => {
            alert("¡Felicidades! Has completado exitosamente la Fase 4 de Fracciones. ¡Fase 5 desbloqueada!");
            navigate('/map');
          }, 1500);
        } else if (resultado.bloque_completado) {
          setTimeout(() => navigate('/welcome-fase4'), 1500);
        } else {
          setTimeout(() => {
            setFeedback({ visible: false, esCorrecta: false });
            loadNextQuestion();
          }, 1200);
        }
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 450);
        setFeedback({ visible: true, esCorrecta: false, resultado });
      }
    } catch (error: any) {
      setFeedback({
        visible: true,
        esCorrecta: false,
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'No se pudo comunicar con el servidor.',
      });
    }
  }, [pregunta, moduloId, nivelId, respuestaNum, respuestaDen, interactiveSelectedCount, timer, feedback, handleFeedbackClose, navigate]);

  const handleBypassRescue = async () => {
    try {
      setLoading(true);
      const res = await submitFase4CloseRescue(moduloId, nivelId);
      if (res.success) {
        setFeedback({ visible: false, esCorrecta: false });
        loadNextQuestion();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAltSelect = (textoAlt: string) => {
    if (feedback.visible) return;
    handleSubmit(textoAlt);
  };

  const handleNumberPress = (num: string) => {
    if (feedback.visible) return;
    if (activeInputField === 'num') {
      setRespuestaNum(prev => prev.length < 5 ? prev + num : prev);
    } else {
      setRespuestaDen(prev => prev.length < 5 ? prev + num : prev);
    }
  };

  const handleDelete = () => {
    if (feedback.visible) return;
    if (activeInputField === 'num') {
      setRespuestaNum(prev => prev.slice(0, -1));
    } else {
      setRespuestaDen(prev => prev.slice(0, -1));
    }
  };

  if (loading) {
    return (
      <div className="f4-screen-wrapper">
        <div className="f4-loading-spinner-wrap">
          <div className="f4-spinner-element" style={{ borderTopColor: moduleColor }} />
          <span>Cargando misión...</span>
        </div>
      </div>
    );
  }

  if (!pregunta) return null;

  const barWidth = Math.min(100, (progreso.aciertos / maxAciertos) * 100);
  
  // Determinar si la pregunta requiere una entrada en formato fracción (contiene "/")
  const isFractionAnswer = (pregunta.respuesta_correcta ?? '').includes('/');
  // Fallback for interactive pizza — numerator/denominator input always
  const showFractionInput = isFractionAnswer || pregunta.datos_numericos?.tipo_visual === 'pizza';
  return (
    <div className="f4-screen-wrapper" style={{ ['--module-accent' as any]: moduleColor }}>
      <AnimatePresence>
        {feedback.visible && feedback.esCorrecta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fg-ambient-glow correct" />
        )}
        {feedback.visible && !feedback.esCorrecta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fg-ambient-glow incorrect" />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="f4-dashboard-header">
        <button 
          className="f4-nav-back-btn text-red-400 border-red-500/20" 
          onClick={() => navigate('/welcome-fase4')}
        >
          <ArrowLeft size={18} />
        </button>

        <div className="f4-header-right-group flex items-center gap-4">
          {!isChallenge && (
            <button 
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-purple-500/20 px-4 py-2 rounded-2xl transition-all cursor-pointer text-purple-400 text-xs font-black" 
              onClick={handleOpenReading}
            >
              <BookOpen size={14} />
              <span>TEORÍA</span>
            </button>
          )}

          <div className="f4-score-indicator-badge py-1.5 px-4">
            <span className="f4-badge-module font-black uppercase text-xs" style={{ color: moduleColor }}>
              {moduleName}
            </span>
            <span className="text-slate-600 mx-2">|</span>
            <span className="text-slate-400 text-xs font-bold">
              PREGUNTA {progreso.aciertos}/{maxAciertos}
            </span>
            {timer !== null && (
              <>
                <span className="text-slate-600 mx-2">|</span>
                <span className="text-red-400 text-xs font-black animate-pulse">{timer}s</span>
              </>
            )}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="f4-module-card-progress-track absolute bottom-0 left-0 w-full h-1.5 bg-slate-900">
          <div 
            className="f4-module-card-progress-fill h-full transition-all duration-300"
            style={{ 
              width: `${barWidth}%`, 
              background: `linear-gradient(90deg, ${moduleColor}80, ${moduleColor})`,
              boxShadow: `0 0 10px ${moduleColor}`
            }} 
          />
        </div>
      </header>

      {/* Main game board */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {feedback.visible && feedback.resultado?.es_espejo && !feedback.esCorrecta && (
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center max-w-md">
            <div className="flex items-center justify-center gap-2 text-purple-400 font-black mb-1">
              <Sparkles size={18} /> BUCLE ESPEJO ACTIVADO
            </div>
            <p className="text-slate-400 text-xs">
              ¡No te preocupes! Aquí tienes una oportunidad similar para consolidar tu aprendizaje.
            </p>
            <button 
              onClick={handleBypassRescue} 
              className="mt-3 px-4 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all"
            >
              Saltar esta pregunta (Bypass)
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-4xl">
          {/* Visual representations (Pizza, Thermometer, or text card) */}
          <div className="flex flex-col items-center justify-center bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] min-h-[300px]">
            {pregunta.datos_numericos?.tipo_visual === 'pizza' ? (
              <PizzaFractionVisualizer
                slices={pregunta.datos_numericos?.cortes || 8}
                initialSombreados={pregunta.datos_numericos?.sombreados || []}
                interactive={!!pregunta.datos_numericos?.es_interactivo}
                onChange={(selectedCount) => {
                  setRespuestaNum(selectedCount.toString());
                  setRespuestaDen((pregunta.datos_numericos?.cortes || 8).toString());
                }}
                color={moduleColor}
              />
            ) : pregunta.datos_numericos?.tipo_visual === 'thermometer' ? (
              <ThermometerVisualizer
                divisions={pregunta.datos_numericos?.cortes || 5}
                initialLevel={pregunta.datos_numericos?.nivel || 0}
                interactive={!!pregunta.datos_numericos?.es_interactivo}
                onChange={(selectedLevel) => {
                  if (isFractionAnswer) {
                    setRespuestaNum(selectedLevel.toString());
                    setRespuestaDen((pregunta.datos_numericos?.cortes || 5).toString());
                  } else {
                    setRespuestaNum(selectedLevel.toString());
                  }
                }}
                color={moduleColor}
              />
            ) : (
              <div className="text-center font-display text-4xl font-black text-white p-4">
                🍕 🧪
              </div>
            )}
            
            <p className="text-lg font-bold text-center mt-6 text-slate-200">
              {pregunta.enunciado}
            </p>
          </div>

          {/* Interactive input area */}
          <div className="flex flex-col items-center justify-center">
            {pregunta.tipo_pregunta === 'multiple_opcion' && pregunta.alternativas ? (
              <div className="w-full space-y-4">
                {pregunta.alternativas.map(alt => (
                  <button
                    key={alt.id}
                    onClick={() => handleAltSelect(alt.texto)}
                    disabled={feedback.visible}
                    className="w-full py-5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-2xl font-black text-xl text-left text-white transition-all active:scale-[0.98]"
                  >
                    {alt.texto}
                  </button>
                ))}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-8">
                {/* Custom inputs */}
                {showFractionInput ? (
                  <div className="f4-fraction-input-box">
                    <input
                      type="text"
                      readOnly
                      placeholder="?"
                      value={respuestaNum}
                      onClick={() => setActiveInputField('num')}
                      className={`f4-fraction-input-field ${activeInputField === 'num' ? 'focused' : ''}`}
                    />
                    <div className="f4-fraction-line" />
                    <input
                      type="text"
                      readOnly
                      placeholder="?"
                      value={respuestaDen}
                      onClick={() => setActiveInputField('den')}
                      className={`f4-fraction-input-field ${activeInputField === 'den' ? 'focused' : ''}`}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[200px]">
                    <input
                      type="text"
                      readOnly
                      placeholder="Respuesta"
                      value={respuestaNum}
                      className="w-full bg-white/5 border border-purple-500/30 rounded-2xl p-5 text-center text-white font-black text-2xl outline-none"
                    />
                  </div>
                )}

                {/* Keypad */}
                <CustomKeyboard
                  onNumberPress={handleNumberPress}
                  onDelete={handleDelete}
                  onSubmit={() => handleSubmit()}
                  disabled={feedback.visible}
                  submitDisabled={showFractionInput ? (!respuestaNum || !respuestaDen) : !respuestaNum}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback.visible && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-0 left-0 w-full p-8 z-50 flex flex-col items-center text-center ${
              feedback.esCorrecta 
                ? 'bg-emerald-950/95 border-t border-emerald-500/30' 
                : 'bg-red-950/95 border-t border-red-500/30'
            }`}
          >
            <h4 className="text-3xl font-black mb-3">
              {feedback.esCorrecta ? '¡Excelente trabajo! 🎉' : 'Vuelve a intentarlo ↺'}
            </h4>
            <p className="text-lg text-slate-300 max-w-xl mb-6">
              {feedback.resultado?.feedback_tutor}
            </p>
            {feedback.resultado?.explicacion_profunda && (
              <div 
                className="mb-6 p-4 rounded-xl bg-white/5 text-sm text-left max-w-xl font-mono leading-relaxed"
                dangerouslySetInnerHTML={{ __html: feedback.resultado.explicacion_profunda }}
              />
            )}
            <button
              onClick={handleFeedbackClose}
              className={`px-8 py-4 text-white font-black text-lg rounded-2xl transition-all shadow-lg active:scale-95 ${
                feedback.esCorrecta ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {feedback.resultado?.early_exit ? 'Volver al Menú' : 'Continuar'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theory modal */}
      <AnimatePresence>
        {showReading && readingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-slate-900/95 border border-white/10 p-10 rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-500"></div>
              
              <h3 className="text-3xl font-black text-white flex items-center gap-4 mb-6">
                <BookOpen className="text-purple-400" size={28} />
                {readingData.titulo}
              </h3>

              <div className="space-y-4 text-slate-300 text-base leading-relaxed mb-8">
                {readingData.parrafos.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}

                {readingData.tip_pedagogico && (
                  <div className="p-4 bg-purple-500/10 border-l-4 border-purple-500 rounded-r-xl flex gap-3 text-sm text-purple-200 font-bold">
                    <Sparkles className="shrink-0 mt-0.5" size={16} />
                    <div>{readingData.tip_pedagogico}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowReading(false)}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-base transition-all"
              >
                ¡Entendido, a Jugar!
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Fase4GameScreen;
