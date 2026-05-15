import React, { useState, useEffect, useRef } from 'react';
import { GameStats, Question, GameCategory, Difficulty, UserSettings } from '../types';
import { generateQuestion, calculateTimeLimit } from '../services/mathService';
import { Clock, CheckCircle2, XCircle, LogOut, Delete, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  category: GameCategory;
  difficulty: Difficulty;
  userSettings?: UserSettings;
  adminConfig?: import('../types').PedagogyConfig | null;
  onEndGame: (stats: GameStats) => void;
  onExit: () => void;
}

type FeedbackState = 'none' | 'correct' | 'incorrect';

// Default fallback if adminConfig is not loaded
const FALLBACK_TOTAL_QUESTIONS = 50;

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
  logic_puzzles: 'Acertijos'
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

const GameScreen: React.FC<Props> = ({ category, difficulty, userSettings, adminConfig, onEndGame, onExit }) => {
  const totalQuestions = adminConfig?.questionsPerPhase || FALLBACK_TOTAL_QUESTIONS;

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
      // Call onEndGame with the latest stats from ref to avoid stale closure
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
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [feedback, attempt]);

  const loadNextQuestion = (nextAttempt: number) => {
    if (!isMounted.current) return;

    if (nextAttempt >= totalQuestions) {
      setAttempt(nextAttempt);
      return;
    }
    const q = generateQuestion(nextAttempt, category, difficulty);
    const timeLimit = calculateTimeLimit(nextAttempt, difficulty, category, userSettings, adminConfig);

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

  const handleTimeOut = () => {
    clearTimer();
    setFeedback('incorrect');
    updateStats(false, maxTimeForQuestion);

    transitionTimeoutRef.current = setTimeout(() => {
      loadNextQuestion(attempt + 1);
    }, 2000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question || feedback !== 'none') return;

    clearTimer();

    const userAnswer = parseInt(inputValue);
    const timeSpent = maxTimeForQuestion - timeLeft;
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

  if (!question) return <div className="text-white flex items-center justify-center h-full">Cargando desafío...</div>;

  const progressPercentage = (attempt / totalQuestions) * 100;
  const timePercentage = (timeLeft / maxTimeForQuestion) * 100;

  // Determine shake effect
  const isIncorrect = feedback === 'incorrect';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 relative">
      {/* Background ambient light based on feedback */}
      <AnimatePresence>
        {feedback === 'correct' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/20 blur-3xl pointer-events-none z-0"
          />
        )}
        {feedback === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/20 blur-3xl pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      {/* Top Controls */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="flex items-center space-x-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors border border-white/10"
        >
          <LogOut size={18} />
          <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">Abortar Misión</span>
        </motion.button>

        <div className="flex flex-col items-end text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-300">
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <span className="text-brand-primary">{CATEGORY_LABELS[category] || 'Misión'}</span>
            <span className="text-white/20">|</span>
            <span className="text-brand-secondary">{DIFFICULTY_LABELS[difficulty]}</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-300">PREGUNTA {Math.min(attempt + 1, totalQuestions)}/{totalQuestions}</span>
            <span className="text-white font-black ml-1 text-sm">{timeLeft}S</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (Thin) */}
      <div className="w-full max-w-5xl mb-8 z-10">
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
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
          className={`flex-1 w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-2xl border-2 shadow-2xl transition-colors duration-300 ${
            feedback === 'correct' 
              ? 'bg-green-500/10 border-green-400/50 shadow-green-500/20' 
              : feedback === 'incorrect'
                ? 'bg-red-500/10 border-red-400/50 shadow-red-500/20'
                : 'bg-white/5 border-white/10'
          }`}
        >
          {/* Circular Timer behind question */}
          <div className="absolute top-0 left-0 w-full h-2 bg-black/30">
            <motion.div 
              className={`h-full ${timeLeft <= 3 ? 'bg-red-500' : 'bg-brand-primary'}`}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>

          <div className="flex flex-col items-center justify-center min-h-[250px]">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={attempt}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-8 text-center"
              >
                {question.text}
              </motion.h2>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="w-full relative max-w-xs mt-4">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full bg-black/40 text-center text-5xl font-bold text-white py-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all placeholder-white/10 shadow-inner pr-16 ${
                  feedback === 'incorrect' ? 'border-red-500/50 focus:ring-red-500/30 text-red-300' :
                  feedback === 'correct' ? 'border-green-500/50 focus:ring-green-500/30' :
                  'border-white/20 focus:border-brand-primary focus:ring-brand-primary/30'
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
                      <span className="bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                        Era: {question.answer}
                      </span>
                      <XCircle className="text-red-500 w-8 h-8" />
                    </motion.div>
                  )}
                  {feedback === 'correct' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 className="text-green-400 w-8 h-8 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
            
            {/* Stats inside the card */}
            <div className="w-full flex justify-between gap-4 mt-12">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-inner">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Correctas</span>
                <span className="text-2xl font-black text-green-400">{stats.correct}</span>
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-inner">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Errores</span>
                <span className="text-2xl font-black text-red-400">{stats.incorrect}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Virtual Keypad (Visible on md+) */}
        <motion.div 
          variants={keypadVariants}
          initial="hidden"
          animate="show"
          className="hidden md:block w-[320px] shrink-0"
        >
          <div className="grid grid-cols-3 gap-4 p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl">
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
              <motion.button
                variants={keyVariants}
                whileHover={feedback === 'none' ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
                whileTap={feedback === 'none' ? { scale: 0.9 } : {}}
                key={num}
                onClick={() => handleKeypadInput(num)}
                disabled={feedback !== 'none'}
                className="aspect-square rounded-2xl bg-white/5 border border-white/10 text-3xl font-bold text-white transition-colors disabled:opacity-50"
              >
                {num}
              </motion.button>
            ))}

            <motion.button
              variants={keyVariants}
              whileHover={feedback === 'none' ? { scale: 1.1 } : {}}
              whileTap={feedback === 'none' ? { scale: 0.9 } : {}}
              onClick={handleBackspace}
              disabled={feedback !== 'none'}
              className="aspect-square rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Delete size={28} />
            </motion.button>

            <motion.button
              variants={keyVariants}
              whileHover={feedback === 'none' ? { scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
              whileTap={feedback === 'none' ? { scale: 0.9 } : {}}
              onClick={() => handleKeypadInput(0)}
              disabled={feedback !== 'none'}
              className="aspect-square rounded-2xl bg-white/5 border border-white/10 text-3xl font-bold text-white transition-colors disabled:opacity-50"
            >
              0
            </motion.button>

            <motion.button
              variants={keyVariants}
              whileHover={feedback === 'none' ? { scale: 1.1 } : {}}
              whileTap={feedback === 'none' ? { scale: 0.9 } : {}}
              onClick={() => handleSubmit()}
              disabled={feedback !== 'none'}
              className="aspect-square rounded-2xl bg-brand-primary text-white transition-colors disabled:opacity-50 shadow-lg shadow-brand-primary/30 flex items-center justify-center"
            >
              <ArrowRight size={32} />
            </motion.button>
          </div>
          <p className="text-center text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mt-6">Teclado Numérico</p>
        </motion.div>

      </div>
    </div>
  );
};

export default GameScreen;
