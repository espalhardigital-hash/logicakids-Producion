import React, { useState, useEffect, useRef } from 'react';
import { GameStats, Question, GameCategory, Difficulty, UserSettings } from '../../types';
import { generateQuestion, calculateTimeLimit } from '../../services/mathService';
import { Clock, CheckCircle2, XCircle, LogOut, Delete, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  category: GameCategory;
  difficulty: Difficulty;
  userSettings?: UserSettings;
  adminConfig?: import('../../types').PedagogyConfig | null;
  modularConfigs?: import('../../types').ConfiguracionProgreso[];
  faseId?: number;
  seccion?: number;
  onEndGame: (stats: GameStats) => void;
  onExit: () => void;
}

type FeedbackState = 'none' | 'correct' | 'incorrect';

const FALLBACK_TOTAL_QUESTIONS = 5;

const CATEGORY_LABELS: Record<GameCategory, string> = {
  addition: 'Sumas',
  subtraction: 'Restas',
  multiplication: 'Tablas',
  division: 'División',
  mixed_add_sub: 'Suma y Resta',
  mixed_mult_add: 'Mult + Oper',
  all_mixed: 'Experto',
  challenge: 'Desafío Mix',
  logic_sequences: 'Secuencias',
  logic_patterns: 'Patrones',
  logic_puzzles: 'Acertijos',
  gym: 'Gimnasio Mental',
  tables_action: 'Tablas en Acción',
  store: 'Tienda Matemática',
  detective: 'Detective',
  builder: 'Constructor',
  challenge_fase2: 'Desafío Mix F2'
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Nivel 1',
  easy_medium: 'Nivel 2',
  medium: 'Nivel 3',
  medium_hard: 'Nivel 4',
  hard: 'Nivel 5',
  random_tables: 'Aleatorio'
};

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

const GameScreen: React.FC<Props> = ({ 
  category, difficulty, userSettings, adminConfig, 
  modularConfigs, faseId, seccion, onEndGame, onExit 
}) => {
  // Resolve active parameters applying inheritance:
  // Module specific -> Phase default -> Platform Global
  const resolveActiveParams = () => {
    const levelKeys = ['easy', 'easy_medium', 'medium', 'medium_hard', 'hard'];
    const activeLevelKey = levelKeys.includes(difficulty) ? difficulty : 'medium';

    // Base fallback is global config
    let resolvedQuestions = adminConfig?.questionsPerPhase || FALLBACK_TOTAL_QUESTIONS;
    let resolvedUseTimer = adminConfig?.useTimer !== false;
    let resolvedTimer = adminConfig?.timers?.[activeLevelKey as keyof typeof adminConfig.timers] || 12;
    let resolvedPassing = adminConfig?.passingScore || 85;
    let resolvedFeedback = 'simple';

    const fId = faseId || 1;
    const sec = seccion || 1;
    const oper = category === 'addition' ? 'suma' : 
                 category === 'subtraction' ? 'resta' : 
                 category === 'multiplication' ? 'multiplicacion' : 
                 category === 'division' ? 'division' : 'mixta';

    if (modularConfigs) {
      // 1. Look for Phase Default (seccion = 0)
      const phaseDefault = modularConfigs.find(c => c.fase_id === fId && c.seccion === 0 && c.activo !== false);
      if (phaseDefault) {
        resolvedQuestions = phaseDefault.cantidad_requerida;
        resolvedUseTimer = phaseDefault.usa_cronometro;
        resolvedTimer = phaseDefault.tiempo_default_segundos || resolvedTimer;
        resolvedPassing = phaseDefault.porcentaje_aprobacion;
        resolvedFeedback = phaseDefault.tipo_feedback;
      }

      // 2. Look for Module Specific
      const moduleConfig = modularConfigs.find(c => c.fase_id === fId && c.seccion === sec && c.operacion === oper && c.activo !== false);
      if (moduleConfig) {
        resolvedQuestions = moduleConfig.cantidad_requerida;
        resolvedUseTimer = moduleConfig.usa_cronometro;
        resolvedTimer = moduleConfig.tiempo_default_segundos || resolvedTimer;
        resolvedPassing = moduleConfig.porcentaje_aprobacion;
        resolvedFeedback = moduleConfig.tipo_feedback;
      }
    }

    if (!resolvedUseTimer) {
      resolvedTimer = 999;
    }

    return {
      questionsCount: resolvedQuestions,
      useTimer: resolvedUseTimer,
      timeLimitSeconds: resolvedTimer,
      passingScore: resolvedPassing,
      feedbackType: resolvedFeedback
    };
  };

  const activeParams = resolveActiveParams();
  const totalQuestions = activeParams.questionsCount;

  const [attempt, setAttempt] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(10);
  const [stats, setStats] = useState<GameStats>({ correct: 0, incorrect: 0, totalTime: 0 });
  const statsRef = useRef<GameStats>({ correct: 0, incorrect: 0, totalTime: 0 });
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [maxTimeForQuestion, setMaxTimeForQuestion] = useState(10);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    loadNextQuestion(0);

    return () => {
      isMounted.current = false;
      clearTimer();
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (attempt >= totalQuestions) {
      onEndGame(statsRef.current);
    }
  }, [attempt, onEndGame, totalQuestions]);

  const updateStats = (isCorrect: boolean, timeSpent: number) => {
    const newStats = {
      correct: statsRef.current.correct + (isCorrect ? 1 : 0),
      incorrect: statsRef.current.incorrect + (isCorrect ? 0 : 1),
      totalTime: statsRef.current.totalTime + timeSpent
    };
    statsRef.current = newStats;
    setStats(newStats);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (feedback !== 'none') {
      clearTimer();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearTimer();
  }, [feedback, attempt]);

  useEffect(() => {
    if (timeLeft === 0 && feedback === 'none') {
      handleTimeOut();
    }
  }, [timeLeft, feedback]);

  const loadNextQuestion = async (nextAttempt: number) => {
    if (!isMounted.current) return;

    if (nextAttempt >= totalQuestions) {
      setAttempt(nextAttempt);
      return;
    }

    const isOnline = !!localStorage.getItem('auth_token');

    if (isOnline) {
      try {
        const { getPedagogiaDashboard } = await import('../../services/storageService');
        const res = await getPedagogiaDashboard();
        if (res && res.siguiente_pregunta) {
          const sp = res.siguiente_pregunta;
          const q: Question = {
            id: sp.id,
            text: sp.enunciado,
            answer: 0 // El servidor tiene la respuesta correcta
          };
          const timeLimit = sp.tiene_cronometro && sp.tiempo_limite_segundos ? sp.tiempo_limite_segundos : 999;

          setQuestion(q);
          setAttempt(nextAttempt);
          setMaxTimeForQuestion(timeLimit);
          setTimeLeft(timeLimit);
          setInputValue('');
          setFeedback('none');

          setTimeout(() => {
            if (isMounted.current) {
              inputRef.current?.focus();
            }
          }, 100);
          return;
        }
      } catch (err) {
        console.error("Error loading server question, falling back to local:", err);
      }
    }

    // Fallback Offline / Invitado
    const q = generateQuestion(nextAttempt, category, difficulty);
    const timeLimit = activeParams.useTimer ? activeParams.timeLimitSeconds : 999;

    setQuestion(q);
    setAttempt(nextAttempt);
    setMaxTimeForQuestion(timeLimit);
    setTimeLeft(timeLimit);
    setInputValue('');
    setFeedback('none');

    setTimeout(() => {
      if (isMounted.current) {
        inputRef.current?.focus();
      }
    }, 100);
  };

  const handleTimeOut = async () => {
    clearTimer();
    setFeedback('incorrect');
    updateStats(false, maxTimeForQuestion);

    const isOnline = !!localStorage.getItem('auth_token') && question?.id !== undefined;

    if (isOnline) {
      try {
        const { responderPreguntaPedagogica } = await import('../../services/storageService');
        const res = await responderPreguntaPedagogica({
          pregunta_id: question!.id!,
          respuesta_dada: '', // Vacío representa respuesta incorrecta por tiempo agotado
          tiempo_respuesta_segundos: maxTimeForQuestion
        });

        // Revelar respuesta correcta enviada por el servidor
        setQuestion(prev => prev ? { ...prev, answer: parseInt(res.respuesta_correcta) || 0 } : null);

        if (res.bloque_completado || res.fase_completada) {
          transitionTimeoutRef.current = setTimeout(() => {
            onEndGame(statsRef.current);
          }, 2000);
          return;
        }
      } catch (err) {
        console.error("Error submitting timeout to server:", err);
      }
    }

    transitionTimeoutRef.current = setTimeout(() => {
      loadNextQuestion(attempt + 1);
    }, 2000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question || feedback !== 'none') return;

    clearTimer();

    const isOnline = !!localStorage.getItem('auth_token') && question.id !== undefined;
    const timeSpent = maxTimeForQuestion - timeLeft;

    if (isOnline) {
      try {
        const { responderPreguntaPedagogica } = await import('../../services/storageService');
        const res = await responderPreguntaPedagogica({
          pregunta_id: question.id!,
          respuesta_dada: inputValue.trim(),
          tiempo_respuesta_segundos: timeSpent
        });

        if (res.es_correcta) {
          setFeedback('correct');
          updateStats(true, timeSpent);

          if (res.bloque_completado || res.fase_completada) {
            transitionTimeoutRef.current = setTimeout(() => {
              onEndGame(statsRef.current);
            }, 1000);
            return;
          }

          transitionTimeoutRef.current = setTimeout(() => {
            loadNextQuestion(attempt + 1);
          }, 1000);
        } else {
          setFeedback('incorrect');
          
          // Revelar respuesta correcta enviada por el servidor
          setQuestion(prev => prev ? { ...prev, answer: parseInt(res.respuesta_correcta) || 0 } : null);

          updateStats(false, timeSpent);

          if (res.bloque_completado || res.fase_completada) {
            transitionTimeoutRef.current = setTimeout(() => {
              onEndGame(statsRef.current);
            }, 2000);
            return;
          }

          transitionTimeoutRef.current = setTimeout(() => {
            loadNextQuestion(attempt + 1);
          }, 2000);
        }
        return;
      } catch (err) {
        console.error("Error submitting answer to server, falling back to local validation:", err);
      }
    }

    // Fallback Offline / Invitado
    const userAnswer = parseInt(inputValue);
    const isCorrect = !isNaN(userAnswer) && userAnswer === question.answer;

    if (isCorrect) {
      setFeedback('correct');
      updateStats(true, timeSpent);
      transitionTimeoutRef.current = setTimeout(() => {
        loadNextQuestion(attempt + 1);
      }, 1000);
    } else {
      setFeedback('incorrect');
      updateStats(false, timeSpent);
      transitionTimeoutRef.current = setTimeout(() => {
        loadNextQuestion(attempt + 1);
      }, 2000);
    }
  };

  const handleKeypadInput = (num: number) => {
    if (feedback !== 'none') return;
    setInputValue(prev => {
      if (prev.length >= 6) return prev;
      return prev + num.toString();
    });
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    if (feedback !== 'none') return;
    setInputValue(prev => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  if (!question) return <div className="text-slate-900 dark:text-white flex items-center justify-center h-full font-black font-display text-xl">Cargando desafío...</div>;

  const progressPercentage = (attempt / totalQuestions) * 100;
  const timePercentage = (timeLeft / maxTimeForQuestion) * 100;

  const isIncorrect = feedback === 'incorrect';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 relative text-slate-900 dark:text-white font-sans transition-colors duration-300 z-10">
      {/* Background ambient light based on feedback */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/10 dark:bg-green-500/20 blur-3xl pointer-events-none z-0"
          />
        )}
        {feedback === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 blur-3xl pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      {/* Top Controls */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 z-10">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onExit}
          className="flex items-center space-x-2 glass-button px-5 py-2.5 rounded-2xl transition-all cursor-pointer font-sans"
        >
          <LogOut size={18} />
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Abortar Misión</span>
        </motion.button>

        <div className="flex flex-col items-end text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-3 glass-card px-5 py-3 rounded-2xl shadow-xl">
            <span className="text-blue-600 dark:text-blue-400 font-bold font-display">{CATEGORY_LABELS[category] || 'Misión'}</span>
            <span className="text-slate-200 dark:text-slate-700">|</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold font-display">{DIFFICULTY_LABELS[difficulty]}</span>
            <span className="text-slate-200 dark:text-slate-700">|</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">DESAFÍO {Math.min(attempt + 1, totalQuestions)}/{totalQuestions}</span>
            <span className="text-slate-900 dark:text-white font-black ml-1 text-base font-display">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-5xl mb-8 z-10">
        <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: "spring", stiffness: 100 }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-5xl z-10">
        
        {/* LEFT: Question Box */}
        <motion.div 
          animate={isIncorrect ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`flex-1 w-full max-w-xl rounded-[3rem] p-8 md:p-14 relative overflow-hidden glass-card transition-all duration-500 ${
            feedback === 'correct' 
              ? 'ring-4 ring-green-500/50 shadow-green-500/10' 
              : feedback === 'incorrect'
                ? 'ring-4 ring-red-500/50 shadow-red-500/10'
                : 'ring-1 ring-slate-100 dark:ring-white/10 shadow-2xl dark:shadow-none'
          }`}
        >
          {/* Circular Timer behind question */}
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-black/35">
            <motion.div 
              className={`h-full ${timeLeft <= 3 ? 'bg-red-500' : 'bg-blue-600 dark:bg-blue-500'}`}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>

          <div className="flex flex-col items-center justify-center min-h-[250px]">
            {/* Display Board for Equation with dynamic background */}
            <div className="w-full bg-slate-50 dark:bg-slate-950/40 rounded-3xl py-8 px-4 flex items-center justify-center mb-8 border border-slate-200/80 dark:border-slate-800/50 shadow-inner">
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={attempt}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-7xl md:text-8xl font-black text-slate-950 dark:text-white tracking-tighter text-center font-display"
                >
                  {question.text}
                </motion.h2>
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="w-full relative max-w-xs mt-4">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full bg-white dark:bg-[#0a0f1c]/40 text-center text-5xl font-black text-slate-950 dark:text-white py-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all placeholder-slate-350 dark:placeholder-white/10 shadow-inner pr-16 ${
                  feedback === 'incorrect' ? 'border-red-500/50 focus:ring-red-500/30 text-red-600 dark:text-red-400' :
                  feedback === 'correct' ? 'border-green-500/50 focus:ring-green-500/30' :
                  'border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20 dark:focus:ring-blue-500/20'
                }`}
                placeholder="?"
                autoFocus
                disabled={feedback !== 'none'}
              />
              
              {/* Overlays inside the input */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                <AnimatePresence>
                  {feedback === 'incorrect' && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex items-center gap-2">
                      <span className="bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap font-display">
                        Era: {question.answer}
                      </span>
                      <XCircle className="text-red-500 w-8 h-8" />
                    </motion.div>
                  )}
                  {feedback === 'correct' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 className="text-green-500 dark:text-green-400 w-8 h-8 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
            
            {/* Stats inside the card */}
            <div className="w-full flex justify-between gap-4 mt-12">
              <div className="flex-1 bg-slate-50 border border-slate-250/60 dark:bg-slate-900/40 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-inner transition-colors duration-300">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1 font-display">Correctas</span>
                <span className="text-2xl font-black text-green-600 dark:text-green-400 font-display">{stats.correct}</span>
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-250/60 dark:bg-slate-900/40 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-inner transition-colors duration-300">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1 font-display">Errores</span>
                <span className="text-2xl font-black text-red-600 dark:text-red-400 font-display">{stats.incorrect}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Virtual Keypad */}
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
                whileHover={feedback === 'none' ? { scale: 1.08, backgroundColor: 'rgba(59,130,246,0.08)' } : {}}
                whileTap={feedback === 'none' ? { scale: 0.92 } : {}}
                key={num}
                onClick={() => handleKeypadInput(num)}
                disabled={feedback !== 'none'}
                className="aspect-square rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-4xl font-black text-slate-950 dark:text-white transition-all disabled:opacity-30 cursor-pointer font-display flex items-center justify-center shadow-sm"
              >
                {num}
              </motion.button>
            ))}

            <motion.button
              variants={keyVariants}
              whileHover={feedback === 'none' ? { scale: 1.08 } : {}}
              whileTap={feedback === 'none' ? { scale: 0.92 } : {}}
              onClick={handleBackspace}
              disabled={feedback !== 'none'}
              className="aspect-square rounded-[1.5rem] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-sm"
            >
              <Delete size={28} />
            </motion.button>

            <motion.button
              variants={keyVariants}
              whileHover={feedback === 'none' ? { scale: 1.08 } : {}}
              whileTap={feedback === 'none' ? { scale: 0.92 } : {}}
              onClick={() => handleKeypadInput(0)}
              disabled={feedback !== 'none'}
              className="aspect-square rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-3xl font-black text-slate-950 dark:text-white transition-colors disabled:opacity-50 cursor-pointer font-display flex items-center justify-center shadow-sm"
            >
              0
            </motion.button>

            <motion.button
              variants={keyVariants}
              whileHover={feedback === 'none' ? { scale: 1.08 } : {}}
              whileTap={feedback === 'none' ? { scale: 0.92 } : {}}
              onClick={() => handleSubmit()}
              disabled={feedback !== 'none'}
              className="aspect-square rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center cursor-pointer"
            >
              <ArrowRight size={32} />
            </motion.button>
          </div>
          <p className="text-center text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.3em] mt-6 font-display">Teclado Numérico</p>
        </motion.div>

      </div>
    </div>
  );
};

export default GameScreen;
