import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetectiveNotebook } from './DetectiveNotebook';
import { OperationBuilder } from './OperationBuilder';
import { getFase3Question, submitFase3Answer, getFase3Reading } from './Fase3Service';
import { Fase3Pregunta, Fase3AnswerResult, Fase3Lectura } from './Fase3Types';
import { CustomKeyboard } from '../common/CustomKeyboard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getCurrentUserFull } from '../../services/storageService';
import { Fase3TheoryModal } from './Fase3TheoryModal';
import './Fase3Styles.css';

const MODULE_NAMES: Record<number, string> = {
  1: 'Detective Literario',
  2: 'Secuencia Temporal',
  3: 'Deducción de Precios',
  4: 'Reparto y Residuos',
  5: 'Ciclos y Agrupaciones Máximas',
};

const MODULE_COLORS: Record<number, string> = {
  1: '#F97316', // Orange
  2: '#EAB308', // Yellow
  3: '#3B82F6', // Blue
  4: '#A855F7', // Purple
  5: '#10B981', // Emerald Green
};

interface FeedbackState {
  visible: boolean;
  esCorrecta: boolean;
  isError?: boolean;
  errorMessage?: string;
  resultado?: Fase3AnswerResult;
}

export const Fase3GameScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const moduloId = Number(location.state?.moduloId || '1');
  const nivelId = Number(location.state?.nivelId || '1');
  
  const isChallenge = moduloId === 99 || (nivelId >= 11 && nivelId <= 13);
  const maxAciertos = isChallenge ? (nivelId === 13 ? 10 : 20) : 15;
  const moduleName = MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  const moduleColor = MODULE_COLORS[moduloId] ?? '#F97316';

  const [pregunta, setPregunta] = useState<Fase3Pregunta | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [respuesta, setRespuesta] = useState('');
  const [selectedAltId, setSelectedAltId] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);

  const [timer, setTimer] = useState<number | null>(null);
  const [maxTimer, setMaxTimer] = useState<number>(1);
  const [progreso, setProgreso] = useState({ aciertos: 0, intentos: 0, porcentaje: 0 });
  const [feedback, setFeedback] = useState<FeedbackState>({ visible: false, esCorrecta: false });
  const [shaking, setShaking] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showReading, setShowReading] = useState(false);
  const [isInitialReading, setIsInitialReading] = useState(true);
  const [readingData, setReadingData] = useState<Fase3Lectura | null>(null);
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

  // Automatic Theory Modal Loading
  useEffect(() => {
    if (isChallenge) {
      setShowReading(false);
      return;
    }
    const check = async () => {
      setIsInitialReading(true);
      try {
        const data = await getFase3Reading(moduloId, nivelId);
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
      const data = await getFase3Reading(moduloId, nivelId);
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
    setRespuesta('');
    setSelectedAltId(null);
    setAvailableNumbers([]);
    try {
      const q = await getFase3Question(moduloId, nivelId);
      if (q && q.tipo_pregunta) {
        q.tipo_pregunta = q.tipo_pregunta.toLowerCase() as any;
      }
      setPregunta(q);
      
      if (q.tiene_cronometro && q.tiempo_limite_segundos) {
        setTimer(q.tiene_cronometro && !showReading ? q.tiempo_limite_segundos : null);
        setMaxTimer(q.tiempo_limite_segundos);
      } else {
        setTimer(null);
      }

      if (q.datos_numericos?.tokens) {
        setTokens(q.datos_numericos.tokens);
      } else {
        setTokens([q.enunciado]);
        setAvailableNumbers(extractNumbers(q.enunciado));
      }
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractNumbers = (text: string): number[] => {
    const nums = text.match(/\d+/g);
    return nums ? nums.map(Number) : [];
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
      navigate('/welcome-fase3');
      return;
    }

    if (feedback.isError) {
      setFeedback({ visible: false, esCorrecta: false });
      return;
    }

    setFeedback({ visible: false, esCorrecta: false });

    if (feedback.resultado?.fase_completada) {
      alert("¡Felicidades! Has dominado todos los niveles y desafíos de la Fase 3. ¡Fase 4 desbloqueada!");
      navigate('/map');
      return;
    }

    if (feedback.resultado?.bloque_completado) {
      navigate('/welcome-fase3');
    } else if (feedback.esCorrecta) {
      loadNextQuestion();
    } else {
      if (feedback.resultado?.es_espejo) {
        setTimeout(() => loadNextQuestion(), 1500);
      } else {
        setRespuesta('');
        setSelectedAltId(null);
      }
    }
  }, [feedback, navigate]);

  const handleSubmit = useCallback(async (customAnswer?: string | number) => {
    if (!pregunta) return;
    if (feedback.visible) {
      handleFeedbackClose();
      return;
    }

    stopTimer();

    const finalAnswer = customAnswer !== undefined ? String(customAnswer) : respuesta;

    const payload = {
      modulo_id: moduloId,
      nivel_id: nivelId,
      pregunta_id: pregunta.id,
      respuesta_dada: finalAnswer.trim() || undefined,
      alternativa_id: selectedAltId ?? undefined,
      tiempo_respuesta_segundos: timer ? (pregunta.tiempo_limite_segundos || 0) - timer : 15,
    };

    try {
      const resultado = await submitFase3Answer(payload);
      
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
            alert("¡Felicidades! Has dominado todos los niveles y desafíos de la Fase 3. ¡Fase 4 desbloqueada!");
            navigate('/map');
          }, 1500);
        } else if (resultado.bloque_completado) {
          setTimeout(() => navigate('/welcome-fase3'), 1500);
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
  }, [pregunta, moduloId, nivelId, respuesta, selectedAltId, timer, feedback, handleFeedbackClose, navigate]);

  const handleDataFound = (num: number) => {
    setAvailableNumbers(prev => [...prev, num]);
  };

  if (loading) {
    return (
      <div className="f3-game-screen">
        <div className="f3-loading">
          <div className="f3-spinner" style={{ borderTopColor: moduleColor }} />
          <span>Cargando misión...</span>
        </div>
      </div>
    );
  }

  if (!pregunta) return null;

  const barWidth = Math.min(100, (progreso.aciertos / maxAciertos) * 100);

  return (
    <div className="f3-game-screen">
      <AnimatePresence>
        {feedback.visible && feedback.esCorrecta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="f3-ambient-glow correct" />
        )}
        {feedback.visible && !feedback.esCorrecta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="f3-ambient-glow incorrect" />
        )}
      </AnimatePresence>

      <header className="f3-game-header-modern">
        <button className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-red-500/20 px-4 py-2 rounded-2xl transition-all cursor-pointer shadow-sm text-red-400 font-sans" onClick={() => navigate('/welcome-fase3')}>
          <ArrowLeft size={18} />
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">SALIR DEL NIVEL</span>
        </button>

        <div className="f3-header-right-group">
          {!isChallenge && (
            <button 
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-blue-500/20 px-4 py-2 rounded-2xl transition-all cursor-pointer shadow-sm text-blue-400 font-sans text-xs font-black mr-2 animate-pulse" 
              onClick={handleOpenReading} 
              title="Ver teoría"
            >
              <BookOpen size={14} />
              <span>TEORÍA</span>
            </button>
          )}
          <div className="f3-header-badge-pill">
            <span className="f3-badge-module" style={{ color: moduleColor }}>{moduleName.toUpperCase()}</span>
            <span className="f3-badge-divider">|</span>
            <span className="f3-badge-level">FASE 3</span>
            <span className="f3-badge-divider">|</span>
            <span className="f3-badge-level">MÓDULO {moduloId === 99 ? 'MAESTRÍA' : moduloId}</span>
            <span className="f3-badge-divider">|</span>
            <span className="f3-badge-level">NIVEL {nivelId}</span>
            <span className="f3-badge-divider">|</span>
            <span className="f3-badge-challenge">{isChallenge ? 'DESAFÍO' : 'PREGUNTA'} {progreso.aciertos}/{maxAciertos}</span>
            {timer !== null && (
              <>
                <span className="f3-badge-divider">|</span>
                <span className="f3-badge-timer" style={{ color: timer <= 5 ? '#EF4444' : '#ffffff' }}>{timer}S</span>
              </>
            )}
          </div>
        </div>

        <div className="f3-full-width-progress-bar">
          <div className="f3-full-width-progress-fill" style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${moduleColor}80, ${moduleColor})` }} />
        </div>
        {timer !== null && (
          <div className="f3-timer-progress-bar" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div className="f3-full-width-progress-fill" style={{ width: `${(timer / maxTimer) * 100}%`, background: timer <= 5 ? '#EF4444' : 'linear-gradient(90deg, #3B82F6, #10B981)', height: '100%' }} />
          </div>
        )}
      </header>

      <main className="f3-game-body" style={{ padding: '20px' }}>
        <div className="max-w-6xl mx-auto w-full">
          {feedback.visible && feedback.resultado?.es_espejo && !feedback.esCorrecta && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mirror-loop-alert mb-6">
              <h4>Bucle Espejo Activado</h4>
              <p>¡Ups! Analiza el feedback. ¡Aquí tienes una oportunidad espejo!</p>
            </motion.div>
          )}

          {pregunta.tipo_pregunta === 'constructor_operaciones' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} className={`f3-question-card ${shaking ? 'shake-error' : ''}`} style={{ borderColor: feedback.visible ? (feedback.esCorrecta ? '#10B981' : '#EF4444') : '#1e293b' }}>
                <DetectiveNotebook textSegments={tokens} onDataFound={handleDataFound} />
              </motion.div>
              <div className="flex flex-col justify-end">
                <OperationBuilder availableNumbers={availableNumbers} onSubmit={handleSubmit} onClear={() => {}} />
              </div>
            </div>
          )}

          {pregunta.tipo_pregunta === 'respuesta_numerica' && (
            <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-2xl mx-auto">
              <motion.div animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} className={`f3-question-card ${shaking ? 'shake-error' : ''} w-full`} style={{ borderColor: feedback.visible ? (feedback.esCorrecta ? '#10B981' : '#EF4444') : '#1e293b' }}>
                <div className="f3-question-text-box">
                  <div className="f3-question-text">{pregunta.enunciado}</div>
                </div>
                <div className="f3-numeric-input-wrap mt-6">
                  <div className={`f3-custom-input-box ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : 'focused'}`}>
                    <span className="f3-input-value-text">
                      {feedback.visible ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) : (respuesta || '?')}
                    </span>
                  </div>
                </div>
              </motion.div>
              <CustomKeyboard
                onNumberPress={(num) => !feedback.visible && setRespuesta(p => p.length < 10 ? p + num : p)}
                onDelete={() => !feedback.visible && setRespuesta(p => p.slice(0, -1))}
                onSubmit={() => !feedback.visible && handleSubmit()}
                disabled={feedback.visible}
                submitDisabled={respuesta.length === 0}
              />
            </div>
          )}

          {pregunta.tipo_pregunta === 'multiple_opcion' && pregunta.alternativas && (
            <motion.div animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} className={`f3-question-card ${shaking ? 'shake-error' : ''} max-w-3xl mx-auto w-full`} style={{ borderColor: feedback.visible ? (feedback.esCorrecta ? '#10B981' : '#EF4444') : '#1e293b' }}>
              <div className="f3-question-text-box mb-8">
                <div className="f3-question-text">{pregunta.enunciado}</div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {pregunta.alternativas.map(alt => {
                  const isSelected = selectedAltId === alt.id;
                  let borderColor = 'rgba(255, 255, 255, 0.08)';
                  let background = 'rgba(255, 255, 255, 0.02)';
                  let textColor = 'var(--f3-text-secondary, #8a9bbf)';
                  if (isSelected) {
                    borderColor = moduleColor;
                    background = `${moduleColor}15`;
                    textColor = '#ffffff';
                  }
                  if (feedback.visible) {
                    if (isSelected) {
                      borderColor = feedback.esCorrecta ? '#10B981' : '#EF4444';
                      background = feedback.esCorrecta ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                      textColor = feedback.esCorrecta ? '#10B981' : '#EF4444';
                    }
                    if (!feedback.esCorrecta && alt.texto === feedback.resultado?.respuesta_correcta) {
                      borderColor = '#10B981';
                      background = 'rgba(16, 185, 129, 0.1)';
                      textColor = '#10B981';
                    }
                  }
                  return (
                    <motion.button key={alt.id} onClick={() => setSelectedAltId(alt.id)} disabled={feedback.visible} className="flex items-center p-5 rounded-2xl border text-left cursor-pointer transition-all" style={{ borderColor, background, color: textColor, fontWeight: isSelected ? 700 : 500 }}>
                      <div className="w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center" style={{ borderColor: isSelected ? (feedback.visible ? (feedback.esCorrecta ? '#10B981' : '#EF4444') : moduleColor) : 'rgba(255,255,255,0.2)' }}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="flex-grow">{alt.texto}</span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="mt-8">
                <motion.button onClick={() => handleSubmit()} disabled={selectedAltId === null && !feedback.visible} className="w-full p-4 rounded-2xl font-bold text-lg text-white transition-all cursor-pointer" style={{ background: selectedAltId === null && !feedback.visible ? 'rgba(255, 255, 255, 0.05)' : feedback.visible ? (feedback.esCorrecta ? '#10B981' : '#EF4444') : moduleColor }}>
                  {feedback.visible ? (feedback.esCorrecta ? 'Siguiente Pregunta →' : 'Intentar de nuevo ↺') : 'Confirmar Respuesta'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {feedback.visible && feedback.isError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-center">
              {feedback.errorMessage}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showReading && readingData && (
          <Fase3TheoryModal 
            readingData={readingData} 
            moduleColor={moduleColor} 
            onClose={() => setShowReading(false)} 
            onAbort={() => isInitialReading ? navigate('/welcome-fase3') : setShowReading(false)} 
            isInitialReading={isInitialReading} 
            userAvatar={userAvatar} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
