/**
 * Fase2GameScreen.tsx
 * ─────────────────────────────────────────────────────────────
 * Pantalla de juego adaptativa para los 5 módulos de Fase 2.
 *   - Módulos 1-3: Entrada numérica
 *   - Módulo  4  : Selección de tokens (subrayador)
 *   - Módulo  5  : Pasos encadenados (paso 1 → congelado → paso 2)
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Fase2Styles.css';
import { getFase2Question, submitFase2Answer } from './Fase2Service';
import type {
  Fase2Pregunta,
  Fase2AnswerResult,
  Fase2Token,
} from './Fase2Types';

// ── Íconos inline ─────────────────────────────────────────────────────────

const IconArrowLeft: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const MODULE_NAMES: Record<number, string> = {
  1: 'Gimnasio Mental',
  2: 'Tablas en Acción',
  3: 'Tienda Matemática',
  4: 'Detective',
  5: 'Constructor',
};

const MODULE_COLORS: Record<number, string> = {
  1: '#10B981', 2: '#8B5CF6', 3: '#F59E0B', 4: '#3B82F6', 5: '#EC4899',
};

interface Props {
  moduloId: number;
  nivelId: number;
  onComplete: () => void;
  onBack: () => void;
}

// ─── Estado de feedback ───────────────────────────────────────────────────

type FeedbackState = {
  visible: boolean;
  esCorrecta: boolean;
  resultado?: Fase2AnswerResult;
};

// ─────────────────────────────────────────────────────────────────────────────

const Fase2GameScreen: React.FC<Props> = ({ moduloId, nivelId, onComplete, onBack }) => {
  const [pregunta, setPregunta]   = useState<Fase2Pregunta | null>(null);
  const [loading, setLoading]     = useState(true);
  const [respuesta, setRespuesta] = useState('');
  const [tokensSeleccionados, setTokensSeleccionados] = useState<number[]>([]);
  const [paso, setPaso]           = useState<1 | 2>(1);
  const [paso1Valor, setPaso1Valor] = useState<string | null>(null);
  const [feedback, setFeedback]   = useState<FeedbackState>({ visible: false, esCorrecta: false });
  const [progreso, setProgreso]   = useState({ aciertos: 0, intentos: 0, porcentaje: 0 });
  const [shaking, setShaking]     = useState(false);
  const [timer, setTimer]         = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const moduleName  = MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  const moduleColor = MODULE_COLORS[moduloId] ?? '#10B981';

  // ── Cargar pregunta ─────────────────────────────────────────────────────

  const loadPregunta = useCallback(async () => {
    setLoading(true);
    setRespuesta('');
    setTokensSeleccionados([]);
    setPaso(1);
    setPaso1Valor(null);
    try {
      const data = await getFase2Question(moduloId, nivelId);
      setPregunta(data);
      if (data.tiene_cronometro && data.tiempo_limite_segundos) {
        setTimer(data.tiempo_limite_segundos);
      }
    } catch {
      // Pregunta de muestra para desarrollo
      setPregunta(MOCK_PREGUNTA(moduloId, nivelId));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [moduloId, nivelId]);

  useEffect(() => { loadPregunta(); }, [loadPregunta]);

  // ── Temporizador ────────────────────────────────────────────────────────

  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) { handleSubmit(); return; }
    timerRef.current = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // ── Selección de tokens (mód 4) ─────────────────────────────────────────

  const toggleToken = (token: Fase2Token) => {
    setTokensSeleccionados(prev =>
      prev.includes(token.id)
        ? prev.filter(id => id !== token.id)
        : [...prev, token.id]
    );
  };

  // ── Envío de respuesta ──────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!pregunta) return;
    stopTimer();

    const payload = {
      modulo_id:  moduloId,
      nivel_id:   nivelId,
      pregunta_id: pregunta.id,
      respuesta_dada:          moduloId <= 3 ? respuesta.trim() : undefined,
      tokens_seleccionados:    moduloId === 4 ? tokensSeleccionados : undefined,
      paso_numero:             moduloId === 5 ? paso : undefined,
      tiempo_respuesta_segundos: undefined as number | undefined,
    };

    let resultado: Fase2AnswerResult;
    try {
      resultado = await submitFase2Answer(payload);
    } catch {
      resultado = MOCK_RESULTADO(moduloId, respuesta, tokensSeleccionados, pregunta, paso);
    }

    setProgreso({
      aciertos:   resultado.aciertos_acumulados,
      intentos:   resultado.intentos_totales,
      porcentaje: resultado.porcentaje_actual,
    });

    if (resultado.es_correcta) {
      // Módulo 5: manejar paso a paso
      if (moduloId === 5 && paso === 1) {
        setPaso1Valor(resultado.valor_paso1_congelado ?? respuesta);
        setPaso(2);
        setRespuesta('');
        setFeedback({ visible: true, esCorrecta: true, resultado });
      } else {
        setFeedback({ visible: true, esCorrecta: true, resultado });
        if (resultado.bloque_completado) {
          setTimeout(() => onComplete(), 1800);
        }
      }
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      setFeedback({ visible: true, esCorrecta: false, resultado });
    }
  }, [pregunta, moduloId, nivelId, respuesta, tokensSeleccionados, paso, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleFeedbackClose = () => {
    setFeedback({ visible: false, esCorrecta: false });
    if (feedback.resultado?.bloque_completado) {
      onComplete();
    } else if (feedback.esCorrecta && moduloId === 5 && paso === 2) {
      loadPregunta(); // Nueva pregunta completa de mód 5
    } else if (feedback.esCorrecta) {
      loadPregunta();
    } else {
      // Error: en mód 1-3 se genera nueva variante automáticamente
      if (moduloId <= 3) {
        loadPregunta();
      } else {
        setRespuesta('');
        setTokensSeleccionados([]);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="f2-game-screen">
        <div className="f2-loading">
          <div className="f2-spinner" style={{ borderTopColor: moduleColor }} />
          <span>Cargando pregunta…</span>
        </div>
      </div>
    );
  }

  if (!pregunta) return null;

  const maxAciertos = 10; // TODO: obtener de config
  const barWidth = Math.min(100, (progreso.aciertos / maxAciertos) * 100);

  return (
    <div className="f2-game-screen">
      {/* ── Header ── */}
      <header className="f2-game-header">
        <button className="f2-back-btn" onClick={onBack} aria-label="Volver">
          <IconArrowLeft />
        </button>

        <div className="f2-game-header-info">
          <div className="f2-game-module-name" style={{ color: moduleColor }}>
            {moduleName}
          </div>
          <div className="f2-game-level-name">Nivel {nivelId}</div>
        </div>

        {/* Barra de progreso */}
        <div className="f2-game-progress-wrap">
          <div className="f2-game-progress-info">
            <span>Progreso</span>
            <span style={{ color: moduleColor }}>{progreso.aciertos}/{maxAciertos}</span>
          </div>
          <div className="f2-game-progress-track">
            <div
              className="f2-game-progress-fill"
              style={{
                width: `${barWidth}%`,
                background: `linear-gradient(90deg, ${moduleColor}99, ${moduleColor})`,
              }}
            />
          </div>
        </div>

        {/* Temporizador circular */}
        {timer !== null && pregunta.tiene_cronometro && pregunta.tiempo_limite_segundos && (
          <CircularTimer
            current={timer}
            total={pregunta.tiempo_limite_segundos}
            color={moduleColor}
          />
        )}
      </header>

      {/* ── Cuerpo ── */}
      <main className="f2-game-body">
        <div className={`f2-question-card ${shaking ? 'shake-error' : ''}`}>
          <div className="f2-question-label">
            PREGUNTA — MÓDULO {moduloId}, NIVEL {nivelId}
          </div>
          <div className="f2-question-text">{pregunta.enunciado}</div>

          {/* ─ Módulos 1-3: entrada numérica ─ */}
          {moduloId <= 3 && (
            <div className="f2-numeric-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="f2-numeric-input"
                placeholder="Tu respuesta…"
                value={respuesta}
                onChange={e => setRespuesta(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
              />
              <button
                className="f2-submit-btn"
                onClick={handleSubmit}
                disabled={!respuesta.trim()}
                style={{ background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})` }}
              >
                ✓ Confirmar
              </button>
            </div>
          )}

          {/* ─ Módulo 4: tokens subrayables ─ */}
          {moduloId === 4 && pregunta.payload_tokenizado && (
            <>
              <div className="f2-tokens-wrap">
                {pregunta.payload_tokenizado.map(token => (
                  <span
                    key={token.id}
                    className={`f2-token ${tokensSeleccionados.includes(token.id) ? 'selected' : ''}`}
                    onClick={() => toggleToken(token)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleToken(token); }}
                  >
                    {token.texto}
                  </span>
                ))}
              </div>
              <div className="f2-tokens-actions">
                <button
                  className="f2-submit-btn"
                  onClick={handleSubmit}
                  disabled={tokensSeleccionados.length === 0}
                  style={{ background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})` }}
                >
                  🔍 Validar selección
                </button>
              </div>
            </>
          )}

          {/* ─ Módulo 5: pasos encadenados ─ */}
          {moduloId === 5 && (
            <div className="f2-chained-wrap">
              {/* Paso 1 */}
              <div className={`f2-step-panel ${paso === 1 ? 'active' : 'frozen'}`}>
                <div className="f2-step-label">
                  {paso === 1 ? '🔵 PASO 1 — ACTIVO' : '✅ PASO 1 — COMPLETADO'}
                </div>
                <div className="f2-step-desc">
                  {pregunta.pasos_encadenados?.[0]?.descripcion ?? 'Resuelve el primer paso del problema.'}
                </div>
                {paso === 1 ? (
                  <div className="f2-numeric-input-wrap">
                    <input
                      ref={inputRef}
                      type="text"
                      className="f2-numeric-input"
                      placeholder="Resultado del paso 1…"
                      value={respuesta}
                      onChange={e => setRespuesta(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <button
                      className="f2-submit-btn"
                      onClick={handleSubmit}
                      disabled={!respuesta.trim()}
                      style={{ background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})` }}
                    >
                      Siguiente →
                    </button>
                  </div>
                ) : (
                  <div className="f2-step-frozen-value">= {paso1Valor}</div>
                )}
              </div>

              {/* Paso 2 */}
              <div className={`f2-step-panel ${paso === 2 ? 'active' : 'pending'}`}>
                <div className="f2-step-label">⬜ PASO 2</div>
                <div className="f2-step-desc">
                  {pregunta.pasos_encadenados?.[1]?.descripcion ?? 'Usa el resultado anterior para el paso 2.'}
                </div>
                {paso === 2 && (
                  <div className="f2-numeric-input-wrap">
                    <input
                      type="text"
                      className="f2-numeric-input"
                      placeholder="Resultado final…"
                      value={respuesta}
                      onChange={e => setRespuesta(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                    <button
                      className="f2-submit-btn"
                      onClick={handleSubmit}
                      disabled={!respuesta.trim()}
                      style={{ background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})` }}
                    >
                      ✓ Finalizar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Overlay de feedback ── */}
      {feedback.visible && (
        <div className="f2-feedback-overlay">
          <div className={`f2-feedback-card ${feedback.esCorrecta ? 'correct' : 'incorrect'}`}>
            <div className="f2-feedback-emoji">
              {feedback.esCorrecta ? '🎉' : '💪'}
            </div>
            <div className="f2-feedback-title">
              {feedback.esCorrecta ? '¡Correcto!' : '¡Casi!'}
            </div>
            <div className="f2-feedback-subtitle">
              {feedback.esCorrecta
                ? moduloId === 5 && paso === 1
                  ? 'Paso 1 completado. ¡Ahora resuelve el Paso 2!'
                  : '¡Excelente trabajo! Sigue así.'
                : `La respuesta era: ${feedback.resultado?.respuesta_correcta ?? '–'}`}
            </div>

            {/* Info Bucle Espejo */}
            {!feedback.esCorrecta && feedback.resultado?.es_espejo && (
              <div className="f2-feedback-espejo">
                {feedback.resultado.soporte_avanzado
                  ? '🧩 ¿Necesitas ayuda? El sistema te mostrará una explicación detallada en la siguiente pregunta.'
                  : `🔄 Intento ${feedback.resultado.intentos_espejo_actuales}/${feedback.resultado.intentos_espejo_max} — ¡Tú puedes lograrlo!`}
              </div>
            )}

            <button
              className={`f2-feedback-btn ${feedback.esCorrecta ? 'correct' : 'incorrect'}`}
              onClick={handleFeedbackClose}
              style={feedback.esCorrecta ? { background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})` } : undefined}
            >
              {feedback.esCorrecta
                ? feedback.resultado?.bloque_completado ? '🏆 ¡Nivel Dominado!' : 'Siguiente pregunta →'
                : 'Intentar de nuevo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Temporizador Circular
// ─────────────────────────────────────────────────────────────────────────────

const CircularTimer: React.FC<{ current: number; total: number; color: string }> = ({
  current, total, color,
}) => {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - current / total);
  const timerColor = current > total * 0.4 ? color : current > total * 0.2 ? '#F59E0B' : '#EF4444';

  return (
    <div className="f2-timer-wrap">
      <svg className="f2-timer-svg" width="52" height="52" viewBox="0 0 52 52">
        <circle className="f2-timer-bg" cx="26" cy="26" r={r} />
        <circle
          className="f2-timer-fill"
          cx="26" cy="26" r={r}
          stroke={timerColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="f2-timer-text" style={{ color: timerColor }}>{current}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE MUESTRA (desarrollo sin backend)
// ─────────────────────────────────────────────────────────────────────────────

function MOCK_PREGUNTA(moduloId: number, nivelId: number): Fase2Pregunta {
  if (moduloId === 4) {
    return {
      id: 101,
      modulo_id: 4,
      nivel_id: nivelId,
      enunciado: 'Juan tiene 5 manzanas rojas y 3 perros en el parque. Si compra 4 manzanas más, ¿cuántas manzanas tiene en total?',
      tipo_pregunta: 'subrayado_tokens',
      tiene_cronometro: false,
      payload_tokenizado: [
        { id: 1, texto: 'Juan', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 2, texto: 'tiene', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 3, texto: '5', es_dato_relevante: true, categoria: 'cantidad' },
        { id: 4, texto: 'manzanas', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 5, texto: 'rojas', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 6, texto: 'y 3 perros', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 7, texto: 'en el parque', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 8, texto: 'compra', es_dato_relevante: false, categoria: 'irrelevante' },
        { id: 9, texto: '4', es_dato_relevante: true, categoria: 'cantidad' },
        { id: 10, texto: 'manzanas más', es_dato_relevante: false, categoria: 'irrelevante' },
      ],
    };
  }
  if (moduloId === 5) {
    return {
      id: 201,
      modulo_id: 5,
      nivel_id: nivelId,
      enunciado: 'Una tienda tiene 24 chocolates. Los vende en cajas de 6. ¿Cuántas cajas puede preparar? ¿Y cuántos chocolates sobrarán?',
      tipo_pregunta: 'constructor_soluciones_chained',
      tiene_cronometro: false,
      pasos_encadenados: [
        { titulo: 'Paso 1', descripcion: '¿Cuántas cajas puede preparar?', respuesta_correcta: '4' },
        { titulo: 'Paso 2', descripcion: '¿Cuántos chocolates sobran?', respuesta_correcta: '0' },
      ],
    };
  }
  return {
    modulo_id: moduloId,
    nivel_id: nivelId,
    enunciado: moduloId === 1 ? '¿Cuánto es el doble de 17?' :
               moduloId === 2 ? '¿Cuánto es 5 × ___ = 35?' :
               '¿Cuánto suman R$ 0,50 + R$ 1,25?',
    tipo_pregunta: 'respuesta_numerica',
    tiene_cronometro: false,
  };
}

function MOCK_RESULTADO(
  moduloId: number,
  respuesta: string,
  tokens: number[],
  pregunta: Fase2Pregunta,
  paso: number
): Fase2AnswerResult {
  let esCorrecta = false;
  if (moduloId <= 3) esCorrecta = respuesta.trim() === '34';
  if (moduloId === 4) esCorrecta = JSON.stringify([...tokens].sort()) === JSON.stringify([3, 9]);
  if (moduloId === 5 && paso === 1) esCorrecta = respuesta.trim() === '4';
  if (moduloId === 5 && paso === 2) esCorrecta = respuesta.trim() === '0';

  return {
    es_correcta:           esCorrecta,
    respuesta_correcta:    moduloId <= 3 ? '34' : moduloId === 5 && paso === 1 ? '4' : '0',
    aciertos_acumulados:   esCorrecta ? 1 : 0,
    intentos_totales:      1,
    porcentaje_actual:     esCorrecta ? 10 : 0,
    bloque_completado:     false,
    fase_completada:       false,
    es_espejo:             false,
    intentos_espejo_actuales: 0,
    intentos_espejo_max:   3,
    soporte_avanzado:      false,
    tokens_correctos:      moduloId === 4 ? [3, 9] : undefined,
    paso_aprobado:         moduloId === 5 ? paso : undefined,
    valor_paso1_congelado: moduloId === 5 && paso === 1 && esCorrecta ? '4' : undefined,
  };
}

export default Fase2GameScreen;
