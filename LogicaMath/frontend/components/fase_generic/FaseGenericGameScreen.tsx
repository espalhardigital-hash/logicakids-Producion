import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFaseMetadata, FasePregunta } from './faseMetadata';
import { getAvatarUrl } from '../../services/storageService';
import './FaseGenericStyles.css';

// Framer motion variants
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

// SVG Icon Arrow Left
const IconArrowLeft: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function FaseGenericGameScreen() {
  const { faseId: paramFaseId, moduloId: paramModuloId, nivelId: paramNivelId } = useParams<{
    faseId: string;
    moduloId: string;
    nivelId: string;
  }>();

  const navigate = useNavigate();

  const faseId = Number(paramFaseId || '4');
  const moduloId = Number(paramModuloId || '1');
  const nivelId = Number(paramNivelId || '1');

  const metadata = getFaseMetadata(faseId);

  // States
  const [showReading, setShowReading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [answersLog, setAnswersLog] = useState<{ questionId: number; isCorrect: boolean }[]>([]);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [challengeQuestions, setChallengeQuestions] = useState<FasePregunta[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset states on level/fase load
  useEffect(() => {
    setShowReading(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setNumericAnswer('');
    setFeedback(null);
    setAnswersLog([]);
    setLevelCompleted(false);
  }, [faseId, moduloId, nivelId]);

  // Load avatar and user details
  useEffect(() => {
    try {
      const userStr = sessionStorage.getItem('lk_user') || localStorage.getItem('lk_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u?.avatar) {
          setUserAvatar(u.avatar);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Generate randomized questions for the final challenge if moduloId === 99
  useEffect(() => {
    if (moduloId === 99 && metadata) {
      const pool = metadata.modulos.flatMap(m => m.niveles.flatMap(n => n.preguntas));
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(15, pool.length));
      setChallengeQuestions(selected);
    } else {
      setChallengeQuestions([]);
    }
  }, [faseId, moduloId, nivelId, metadata]);

  // Construct virtual modulo and level if moduloId === 99 (Desafío de Maestría)
  const modulo = moduloId === 99 
    ? {
        moduloId: 99,
        nombre: 'Desafío de Maestría',
        color: metadata?.colorPrimario || '#6366F1',
        icono: 'target',
        descripcion: 'Evaluación general de la fase'
      }
    : metadata?.modulos.find(m => m.moduloId === moduloId);

  const nivel = moduloId === 99
    ? {
        nivelId: 1,
        nombre: 'Desafío de Maestría',
        descripcion: 'Demuestra tu dominio en toda la fase.',
        teoria: {
          titulo: 'Desafío Final de Maestría',
          parrafos: [
            'Este desafío pondrá a prueba todo lo que has aprendido en los distintos módulos de esta fase.',
            'Para completarlo con éxito y obtener tu insignia, debes responder correctamente al menos el 90% de las preguntas.',
            '¡Mucho éxito, tú puedes lograrlo!'
          ],
          tip_pedagogico: 'Tómate tu tiempo para leer cada pregunta detenidamente antes de responder.'
        },
        preguntas: challengeQuestions
      }
    : (modulo && 'niveles' in modulo ? (modulo as any).niveles.find((n: any) => n.nivelId === nivelId) : undefined);

  // Focus hidden input for numeric question
  useEffect(() => {
    const isNumeric = currentQuestion?.tipo === 'numerico';
    if (!showReading && !levelCompleted && isNumeric) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [showReading, levelCompleted, currentQuestionIndex, challengeQuestions]);

  if (!metadata || !modulo || !nivel || (moduloId === 99 && challengeQuestions.length === 0)) {
    return (
      <div className="fg-screen">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', color: '#f8fafc' }}>
            {!metadata ? 'Fase no encontrada' : 'Cargando Desafío...'}
          </h2>
          <button onClick={() => navigate(`/welcome-fase/${faseId}`)} className="fg-submit-btn" style={{ maxWidth: '200px', margin: '20px auto' }}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = moduloId === 99 
    ? challengeQuestions[currentQuestionIndex] 
    : nivel.preguntas[currentQuestionIndex];

  const totalQuestions = moduloId === 99 ? challengeQuestions.length : nivel.preguntas.length;

  const currentAciertos = answersLog.filter(a => a.isCorrect).length;
  const currentErrores = answersLog.filter(a => !a.isCorrect).length;
  const barWidth = Math.min(100, Math.max(0, Math.round((currentQuestionIndex / totalQuestions) * 100)));

  const handleOptionSelect = (option: string) => {
    if (feedback) return;
    setSelectedOption(option);
  };

  const handleKeypadInput = (num: string) => {
    if (feedback) return;
    setNumericAnswer(prev => {
      if (prev.length >= 8) return prev;
      return prev + num;
    });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBackspace = () => {
    if (feedback) return;
    setNumericAnswer(prev => prev.slice(0, -1));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    setNumericAnswer('');

    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Completed all questions in the level
      const correctCount = answersLog.filter(a => a.isCorrect).length;
      const successRate = correctCount / totalQuestions;

      if (successRate >= 0.9 || userRoleIsAdmin()) {
        saveProgress(moduloId, nivelId);
      }
      setLevelCompleted(true);
    }
  };

  const handleSubmit = () => {
    if (feedback) {
      handleNext();
      return;
    }

    let userAnswer = '';
    if (currentQuestion.tipo === 'opcion_multiple') {
      if (!selectedOption) return;
      userAnswer = selectedOption;
    } else {
      if (!numericAnswer.trim()) return;
      userAnswer = numericAnswer.trim();
    }

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.respuesta_correcta.toLowerCase().trim();
    
    setFeedback({
      isCorrect,
      message: isCorrect ? '¡Excelente trabajo! ¡Respuesta correcta! 🎉' : 'Vuelve a intentarlo, ¡tú puedes! 💪',
    });

    setAnswersLog(prev => [...prev, { questionId: currentQuestion.id, isCorrect }]);

    if (isCorrect) {
      // Auto-advance correct answers after 1.2 seconds
      setTimeout(() => {
        handleNext();
      }, 1200);
    } else {
      // Shake card
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const hasInput = currentQuestion.tipo === 'opcion_multiple' ? selectedOption !== null : numericAnswer.trim() !== '';
      if (feedback || hasInput) {
        handleSubmit();
      }
    }
  };

  const userRoleIsAdmin = () => {
    try {
      const userStr = sessionStorage.getItem('lk_user') || localStorage.getItem('lk_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        return u.role === 'ADMIN';
      }
    } catch {}
    return false;
  };

  const saveProgress = (mId: number, nId: number) => {
    try {
      const key = `lk_fase_progress_${faseId}`;
      const saved = localStorage.getItem(key);
      const progress = saved ? JSON.parse(saved) : {};
      progress[`${mId}_${nId}`] = true;
      localStorage.setItem(key, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress', e);
    }
  };

  return (
    <div 
      className="fg-screen"
      style={{
        ['--phase-color-primary' as any]: metadata.colorPrimario,
        ['--phase-color-secondary' as any]: metadata.colorSecundario,
        ['--module-accent' as any]: modulo.color,
      }}
    >
      {/* Ambient glows of feedback */}
      <AnimatePresence>
        {feedback && feedback.isCorrect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fg-ambient-glow correct"
          />
        )}
        {feedback && !feedback.isCorrect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fg-ambient-glow incorrect"
          />
        )}
      </AnimatePresence>

      {/* ── Theory Modal ── */}
      {showReading && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px'
          }}
        >
          <div 
            style={{
              background: '#0c1322',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '32px',
              maxWidth: '650px',
              width: '100%',
              padding: '36px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              maxHeight: '95vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="fg-theory-avatar-container">
                <div className="fg-theory-avatar-placeholder" style={{ background: `${modulo.color}15`, borderRadius: '14px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lucide.BookOpen size={24} color={modulo.color} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                {nivel.teoria.titulo}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {nivel.teoria.parrafos.map((p, index) => (
                <p 
                  key={index}
                  style={{
                    fontSize: '1.05rem',
                    lineHeight: '1.6',
                    color: '#94a3b8',
                    margin: 0
                  }}
                >
                  {p}
                </p>
              ))}

              {nivel.teoria.ejemplos && nivel.teoria.ejemplos.length > 0 && (
                <div 
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginTop: '8px'
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', color: '#64748b', marginTop: 0, marginBottom: '12px', letterSpacing: '0.5px' }}>
                    Ejemplo Resuelto
                  </h4>
                  {nivel.teoria.ejemplos.map((ex, index) => (
                    <div 
                      key={index}
                      style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.5 }}
                    >
                      <span style={{ color: '#94a3b8' }}>Problema: </span>{ex.enunciado}
                      <br />
                      <span style={{ color: modulo.color }}>Respuesta: </span>{ex.respuesta}
                    </div>
                  ))}
                </div>
              )}

              {nivel.teoria.tip_pedagogico && (
                <div 
                  className="fg-theory-tip-box"
                  style={{
                    borderLeft: `4px solid ${modulo.color}`,
                    background: `${modulo.color}10`,
                    padding: '16px',
                    borderRadius: '0 16px 16px 0',
                    fontSize: '0.95rem',
                    color: '#f8fafc',
                    fontWeight: 650,
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginTop: '12px'
                  }}
                >
                  <Lucide.Sparkles size={20} color={modulo.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ color: modulo.color, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>TIP DE APRENDIZAJE</span>
                    {nivel.teoria.tip_pedagogico}
                  </div>
                </div>
              )}
            </div>

            <button 
              className="fg-submit-btn"
              onClick={() => setShowReading(false)}
              style={{ background: modulo.color }}
            >
              ¡Entendido, a Jugar!
            </button>
          </div>
        </div>
      )}

      {/* ── Header Unificado ── */}
      <header className="fg-game-header-modern">
        <button className="fg-header-abort-btn" onClick={() => navigate(`/welcome-fase/${faseId}`)} title="Salir del nivel">
          <Lucide.LogOut size={18} />
          <span>SALIR DEL NIVEL</span>
        </button>
        <div className="fg-header-right-group">
          {moduloId !== 0 && (
            <button 
              className="fg-view-theory-btn-modern" 
              onClick={() => setShowReading(true)}
              title="Ver teoría"
            >
              <Lucide.BookOpen size={14} style={{ marginRight: '4px' }} />
              <span>Teoría</span>
            </button>
          )}

          <div className="fg-header-badge-pill">
            <span className="fg-badge-module" style={{ color: modulo.color }}>
              {modulo.nombre.toUpperCase()}
            </span>
            <span className="fg-badge-divider">|</span>
            <span className="fg-badge-level">
              NIVEL {nivelId}
            </span>
            <span className="fg-badge-divider">|</span>
            <span className="fg-badge-challenge">
              PREGUNTA {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* Full-width horizontal progress bar */}
        <div className="fg-full-width-progress-bar">
          <div
            className="fg-full-width-progress-fill"
            style={{
              width: `${barWidth}%`,
              background: `linear-gradient(90deg, ${modulo.color}80, ${modulo.color})`,
            }}
          />
        </div>
      </header>

      {/* ── Game Layout ── */}
      <main className="fg-game-body">
        {levelCompleted ? (
          /* Level Completed View */
          <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '500px', margin: '60px auto 0 auto' }}>
            <div 
              style={{
                width: '96px',
                height: '96px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                animation: 'fgPop 0.4s ease'
              }}
            >
              <Lucide.Trophy size={48} color="#10B981" />
            </div>
            
            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '12px', color: '#ffffff' }}>
              ¡Desafío Terminado!
            </h3>
            
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '32px' }}>
              Has contestado correctamente {answersLog.filter(a => a.isCorrect).length} de {totalQuestions} preguntas.
            </p>

            <button 
              className="fg-submit-btn"
              onClick={() => navigate(`/welcome-fase/${faseId}`)}
              style={{ background: modulo.color }}
            >
              Volver al Menú
            </button>
          </div>
        ) : (
          /* Active Question View */
          <div className="fg-game-layout-wrap">
            {/* Tarjeta de Pregunta (Left Column) */}
            <motion.div 
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`fg-question-card ${shaking ? 'shake-error' : ''}`}
              style={{ 
                boxShadow: feedback 
                  ? (feedback.isCorrect ? '0 0 0 4px rgba(16, 185, 129, 0.5)' : '0 0 0 4px rgba(239, 68, 68, 0.5)')
                  : 'none',
                transition: 'box-shadow 0.3s ease'
              }}
            >
              {currentQuestion.tipo === 'opcion_multiple' ? (
                /* Multiple Choice Layout */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div className="fg-question-text-box">
                    <div className={currentQuestion.enunciado.length < 25 ? "fg-question-text short" : "fg-question-text"}>
                      {currentQuestion.enunciado}
                    </div>
                  </div>

                  <div className="fg-options-grid">
                    {currentQuestion.opciones?.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      let optionClass = "fg-option-btn";
                      if (isSelected) optionClass += " selected";
                      if (feedback) {
                        if (option === currentQuestion.respuesta_correcta) {
                          optionClass += " correct-highlight";
                        } else if (isSelected) {
                          optionClass += " incorrect-highlight";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          className={optionClass}
                          onClick={() => handleOptionSelect(option)}
                          disabled={!!feedback}
                        >
                          <span className="fg-option-indicator">{String.fromCharCode(65 + idx)}</span>
                          <span className="fg-option-text">{option}</span>
                          {feedback && option === currentQuestion.respuesta_correcta && (
                            <Lucide.Check size={18} color="#10B981" style={{ marginLeft: 'auto' }} />
                          )}
                          {feedback && isSelected && option !== currentQuestion.respuesta_correcta && (
                            <Lucide.X size={18} color="#EF4444" style={{ marginLeft: 'auto' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="fg-scores-container">
                    <div className="fg-score-box correct">
                      <span className="fg-score-label">CORRECTAS</span>
                      <span className="fg-score-value">{currentAciertos}</span>
                    </div>
                    <div className="fg-score-box incorrect">
                      <span className="fg-score-label">ERRORES</span>
                      <span className="fg-score-value">{currentErrores}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Numeric Layout */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div className="fg-question-text-box">
                    <div className={currentQuestion.enunciado.length < 25 ? "fg-question-text short" : "fg-question-text"}>
                      {currentQuestion.enunciado}
                    </div>
                  </div>

                  <div className="fg-numeric-input-wrap">
                    <div 
                      className={`fg-custom-input-box ${feedback ? (feedback.isCorrect ? 'correct' : 'incorrect') : 'focused'}`}
                      onClick={() => inputRef.current?.focus()}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={numericAnswer}
                        onChange={e => {
                          if (!feedback) {
                            const val = e.target.value;
                            if (/^[0-9,\-]*$/.test(val)) {
                              setNumericAnswer(val);
                            }
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        className="fg-hidden-input"
                        autoFocus
                        autoComplete="off"
                        inputMode="none"
                      />

                      <span className="fg-input-value-text">
                        {feedback 
                          ? (feedback.isCorrect ? (currentQuestion.respuesta_correcta || numericAnswer) : (numericAnswer || '?')) 
                          : (numericAnswer || '?')}
                      </span>

                      {feedback && (
                        <div className="fg-input-status-elements">
                          {feedback.isCorrect ? (
                            <div className="fg-status-badge correct">
                              <svg className="fg-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          ) : (
                            <>
                              <span className="fg-era-pill">
                                Era: {currentQuestion.respuesta_correcta}
                              </span>
                              <div className="fg-status-badge incorrect">
                                <svg className="fg-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="fg-scores-container">
                    <div className="fg-score-box correct">
                      <span className="fg-score-label">CORRECTAS</span>
                      <span className="fg-score-value">{currentAciertos}</span>
                    </div>
                    <div className="fg-score-box incorrect">
                      <span className="fg-score-label">ERRORES</span>
                      <span className="fg-score-value">{currentErrores}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Virtual Numeric Keypad (Right Column - only for numeric questions) */}
            {currentQuestion.tipo === 'numerico' && (
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
                      whileHover={!feedback ? { scale: 1.08, backgroundColor: 'rgba(59,130,246,0.08)' } : {}}
                      whileTap={!feedback ? { scale: 0.92 } : {}}
                      key={num}
                      onClick={() => handleKeypadInput(num.toString())}
                      disabled={!!feedback}
                      className="aspect-square rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-4xl font-black text-slate-950 dark:text-white transition-all disabled:opacity-30 cursor-pointer font-display flex items-center justify-center shadow-sm"
                    >
                      {num}
                    </motion.button>
                  ))}

                  <motion.button
                    variants={keyVariants}
                    whileHover={!feedback ? { scale: 1.08 } : {}}
                    whileTap={!feedback ? { scale: 0.92 } : {}}
                    onClick={handleBackspace}
                    disabled={!!feedback}
                    className="aspect-square rounded-[1.5rem] bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Lucide.Delete size={28} />
                  </motion.button>

                  <motion.button
                    variants={keyVariants}
                    whileHover={!feedback ? { scale: 1.08 } : {}}
                    whileTap={!feedback ? { scale: 0.92 } : {}}
                    onClick={() => handleKeypadInput('0')}
                    disabled={!!feedback}
                    className="aspect-square rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-3xl font-black text-slate-950 dark:text-white transition-colors disabled:opacity-50 cursor-pointer font-display flex items-center justify-center shadow-sm"
                  >
                    0
                  </motion.button>

                  <motion.button
                    variants={keyVariants}
                    whileHover={!feedback ? { scale: 1.08 } : {}}
                    whileTap={!feedback ? { scale: 0.92 } : {}}
                    onClick={() => handleSubmit()}
                    disabled={!feedback && !numericAnswer.trim()}
                    className="aspect-square rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center cursor-pointer"
                  >
                    <Lucide.ArrowRight size={32} />
                  </motion.button>
                </div>
                <p className="text-center text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.3em] mt-6 font-display">Teclado Numérico</p>
              </motion.div>
            )}

            {/* Confirm Button for Multiple Choice Questions (displayed under/centered) */}
            {currentQuestion.tipo === 'opcion_multiple' && (
              <div className="fg-mc-confirm-wrapper">
                <button 
                  className="fg-mc-confirm-btn"
                  onClick={() => handleSubmit()}
                  disabled={!feedback && !selectedOption}
                  style={{
                    background: feedback 
                      ? (feedback.isCorrect ? '#10B981' : '#EF4444') 
                      : (selectedOption ? modulo.color : 'rgba(255,255,255,0.05)'),
                    boxShadow: selectedOption && !feedback ? `0 0 20px ${modulo.color}40` : 'none'
                  }}
                >
                  {feedback ? 'Continuar' : 'Comprobar Respuesta'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
