import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Lucide from 'lucide-react';
import { getFaseMetadata, FaseNivel } from './faseMetadata';
import './FaseGenericStyles.css';

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
  const modulo = metadata?.modulos.find(m => m.moduloId === moduloId);
  const nivel = modulo?.niveles.find(n => n.nivelId === nivelId);

  // States
  const [showReading, setShowReading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [answersLog, setAnswersLog] = useState<{ questionId: number; isCorrect: boolean }[]>([]);
  const [levelCompleted, setLevelCompleted] = useState(false);

  // Reset states on level load
  useEffect(() => {
    setShowReading(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setNumericAnswer('');
    setFeedback(null);
    setAnswersLog([]);
    setLevelCompleted(false);
  }, [faseId, moduloId, nivelId]);

  if (!metadata || !modulo || !nivel) {
    return (
      <div className="fg-screen">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>Nivel no encontrado</h2>
          <button onClick={() => navigate(`/welcome-fase/${faseId}`)} className="fg-eval-btn">Volver</button>
        </div>
      </div>
    );
  }

  const currentQuestion = nivel.preguntas[currentQuestionIndex];
  const progressPercent = Math.round((currentQuestionIndex / nivel.preguntas.length) * 100);

  const handleOptionSelect = (option: string) => {
    if (feedback) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (feedback) return;

    let userAnswer = '';
    if (currentQuestion.tipo === 'opcion_multiple') {
      if (!selectedOption) return;
      userAnswer = selectedOption;
    } else {
      if (!numericAnswer.trim()) return;
      userAnswer = numericAnswer.trim();
    }

    const isCorrect = userAnswer.toLowerCase() === currentQuestion.respuesta_correcta.toLowerCase();
    
    setFeedback({
      isCorrect,
      message: isCorrect ? '¡Excelente trabajo! ¡Respuesta correcta! 🎉' : 'Vuelve a intentarlo, ¡tú puedes! 💪',
    });

    setAnswersLog(prev => [...prev, { questionId: currentQuestion.id, isCorrect }]);
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    setNumericAnswer('');

    if (currentQuestionIndex + 1 < nivel.preguntas.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Completed all questions in the level
      const correctCount = answersLog.filter(a => a.isCorrect).length;
      const successRate = correctCount / nivel.preguntas.length;

      if (successRate >= 0.9 || userRoleIsAdmin()) {
        // Unlock progress
        saveProgress(moduloId, nivelId);
      }
      setLevelCompleted(true);
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
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div 
                style={{
                  background: `${modulo.color}15`,
                  borderRadius: '14px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lucide.BookOpen size={24} color={modulo.color} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
                {nivel.teoria.titulo}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {nivel.teoria.parrafos.map((p, index) => (
                <p 
                  key={index}
                  style={{
                    fontSize: '1rem',
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
                  style={{
                    borderLeft: `4px solid #10B981`,
                    background: 'rgba(16, 185, 129, 0.03)',
                    padding: '12px 16px',
                    borderRadius: '0 12px 12px 0',
                    fontSize: '0.9rem',
                    color: '#a7f3d0',
                    fontWeight: 600,
                    lineHeight: 1.4
                  }}
                >
                  💡 Tip: {nivel.teoria.tip_pedagogico}
                </div>
              )}
            </div>

            <button 
              className="fg-submit-btn"
              onClick={() => setShowReading(false)}
            >
              ¡Entendido, a Jugar!
            </button>
          </div>
        </div>
      )}

      {/* ── Game Layout ── */}
      <div className="fg-game-container">
        {/* Game Header */}
        <div className="fg-game-header">
          <div className="fg-game-progress-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              <span>PROGRESO</span>
              <span>Pregunta {currentQuestionIndex + 1} de {nivel.preguntas.length}</span>
            </div>
            <div className="fg-progress-track">
              <div className="fg-progress-fill" style={{ width: `${progressPercent}%`, background: modulo.color }} />
            </div>
          </div>

          <button 
            onClick={() => navigate(`/welcome-fase/${faseId}`)}
            className="fg-back-btn" 
            aria-label="Volver"
          >
            <Lucide.X size={20} />
          </button>
        </div>

        {/* Level Complete / Feedback Screen */}
        {levelCompleted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
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
            
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>
              ¡Desafío Terminado!
            </h3>
            
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '32px' }}>
              Has contestado correctamente {answersLog.filter(a => a.isCorrect).length} de {nivel.preguntas.length} preguntas.
            </p>

            <button 
              className="fg-submit-btn"
              onClick={() => navigate(`/welcome-fase/${faseId}`)}
            >
              Volver al Menú
            </button>
          </div>
        ) : (
          /* Active Question View */
          <div>
            <div className="fg-game-question-text">
              {currentQuestion.enunciado}
            </div>

            {/* Answer Input Area */}
            {currentQuestion.tipo === 'opcion_multiple' ? (
              <div className="fg-options-grid">
                {currentQuestion.opciones?.map((option, idx) => (
                  <button
                    key={idx}
                    className={`fg-option-btn ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={!!feedback}
                  >
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="number"
                className="fg-input-field"
                placeholder="Escribe tu respuesta aquí..."
                value={numericAnswer}
                onChange={(e) => setNumericAnswer(e.target.value)}
                disabled={!!feedback}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && numericAnswer.trim() && !feedback) {
                    handleSubmit();
                  }
                }}
              />
            )}

            {/* Feedback message */}
            {feedback && (
              <div className={`fg-feedback-box ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                {feedback.isCorrect ? (
                  <Lucide.Check size={20} />
                ) : (
                  <Lucide.AlertCircle size={20} />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Submit / Next Button */}
            {feedback ? (
              <button className="fg-submit-btn" onClick={handleNext}>
                Continuar
              </button>
            ) : (
              <button 
                className="fg-submit-btn" 
                onClick={handleSubmit}
                disabled={currentQuestion.tipo === 'opcion_multiple' ? !selectedOption : !numericAnswer.trim()}
              >
                Comprobar Respuesta
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
