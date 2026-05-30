import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFase4Question, submitFase4Answer, getFase4Reading, submitFase4CloseRescue } from './Fase4Service';
import { Fase4Pregunta, Fase4AnswerResult, Fase4Lectura } from './Fase4Types';
import { PizzaFractionVisualizer } from './PizzaFractionVisualizer';
import { ThermometerVisualizer } from './ThermometerVisualizer';
import { PieChartVisualizer } from './PieChartVisualizer';
import { PercentageThermometer } from './PercentageThermometer';
import { Fase4TheoryModal } from './Fase4TheoryModal';
import { CustomKeyboard } from '../common/CustomKeyboard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Key, Sparkles, Trophy, Star, Target, Award, Compass, Clock } from 'lucide-react';
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

const SHAPES = ['circle', 'square', 'pentagon', 'hexagon'] as const;

const getDeterministicShape = (seedText: string): 'circle' | 'square' | 'pentagon' | 'hexagon' => {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = seedText.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SHAPES.length;
  return SHAPES[index];
};

const getFractionForPercentage = (pct: number) => {
  if (pct === 50) return { slices: 2, sombreados: [0] };
  if (pct === 25) return { slices: 4, sombreados: [0] };
  if (pct === 75) return { slices: 4, sombreados: [0, 1, 2] };
  
  for (let den = 2; den <= 20; den++) {
    const val = (pct * den) / 100;
    if (Number.isInteger(val)) {
      return { slices: den, sombreados: Array.from({ length: val }, (_, i) => i) };
    }
  }
  
  const den = 10;
  const num = Math.round((pct * den) / 100);
  return { slices: den, sombreados: Array.from({ length: num }, (_, i) => i) };
};

// ─── Componente: Modal de Salida Temprana (Early Exit) ─────────────────────
const Fase4EarlyExitModal: React.FC<{
  moduleColor: string;
  onClose: () => void;
}> = ({ moduleColor, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="f4-feedback-overlay"
      style={{ zIndex: 1100 }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="f4-feedback-card early-exit glass-card"
        style={{ 
          maxWidth: '500px', 
          width: '90%', 
          padding: '40px',
          borderTop: '6px solid #EF4444',
          textAlign: 'center'
        }}
      >
        <div className="f4-feedback-emoji" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>🛡️</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
          ¡Desafío Incompleto!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '20px', fontSize: '1.1rem', lineHeight: 1.5 }}>
          Dado el número de errores acumulados, ya no es posible alcanzar el puntaje mínimo de aprobación para este desafío.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '30px', fontSize: '1rem', lineHeight: 1.5 }}>
          ¡No te preocupes! Cada error es una excelente oportunidad para aprender y ser más fuerte. Repasa la teoría, practica con calma y ¡vuelve a intentarlo! Tú puedes lograrlo. 💪🚀
        </p>

        <button
          className="f4-mixed-challenge-btn w-full"
          onClick={onClose}
          style={{
            background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`,
            boxShadow: `0 8px 24px ${moduleColor}30`,
          }}
        >
          Entendido, volver a intentar 👍
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente: Modal de Logros / Nivel Completado (Completion Modal) ───
const Fase4CompletionModal: React.FC<{
  moduloId: number;
  nivelId: number;
  isChallenge: boolean;
  moduleColor: string;
  progreso: { aciertos: number; intentos: number; porcentaje: number };
  onClose: () => void;
}> = ({ moduloId, nivelId, isChallenge, moduleColor, progreso, onClose }) => {
  const precision = progreso.intentos > 0 ? Math.round((progreso.aciertos / progreso.intentos) * 100) : 100;
  const rec = useMemo(() => {
    if (moduloId === 99) {
      return {
        titulo: '¡Héroe de la Fase 4! 🎉',
        mensaje: '¡Has dominado todos los desafíos de la Fase 4 de Fracciones! Tu razonamiento cuantitativo y velocidad de cálculo son excepcionales. ¡Listo para brillar!',
        accion: 'Completar Fase 4 🚀'
      };
    }
    
    if (isChallenge) {
      if (nivelId === 13) {
        return {
          titulo: '¡Módulo Dominado! 🏆',
          mensaje: '¡Increíble! Has superado el Desafío de Maestría y dominado la sección al 100%. Sigue demostrando tu ingenio en el siguiente módulo de la Fase.',
          accion: 'Siguiente Módulo 🚀'
        };
      } else {
        return {
          titulo: '¡Desafío Superado! ⭐',
          mensaje: '¡Excelente precisión! Lograste superar este desafío con gran destreza. Prepárate para desbloquear la siguiente dificultad.',
          accion: `Desafío ${nivelId - 9} 🚀`
        };
      }
    } else {
      const totalLevels = (moduloId === 1 || moduloId === 4) ? 3 : 4; // Config standard
      if (nivelId === totalLevels) {
        return {
          titulo: '¡Práctica Finalizada! 💪',
          mensaje: '¡Batería de entrenamiento completada al 100%! Ya estás listo para el reto supremo: superar la zona de desafíos del módulo.',
          accion: 'Ir a Desafío 1 🚀'
        };
      } else {
        return {
          titulo: '¡Siguiente Nivel Desbloqueado! 🚀',
          mensaje: `¡Buen entrenamiento! Has completado con éxito este nivel y el Nivel ${nivelId + 1} ya está disponible para ti.`,
          accion: `Ir al Nivel ${nivelId + 1} 🚀`
        };
      }
    }
  }, [moduloId, nivelId, isChallenge]);

  const levelText = isChallenge 
    ? (nivelId === 13 ? 'Desafío Final: Maestría' : `Desafío ${nivelId - 10}`) 
    : `Nivel ${nivelId}`;

  const moduleText = MODULE_NAMES[moduloId] || `Módulo ${moduloId}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="f4-feedback-overlay"
      style={{ zIndex: 1100 }}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="f4-feedback-card completion glass-card"
        style={{ 
          maxWidth: '550px', 
          width: '92%', 
          padding: '40px',
          borderTop: `6px solid ${moduleColor}`,
          textAlign: 'center'
        }}
      >
        <motion.div 
          variants={itemVariants}
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="f4-feedback-emoji" 
          style={{ fontSize: '4.5rem', marginBottom: '20px' }}
        >
          🏆
        </motion.div>

        <motion.h2 
          variants={itemVariants}
          style={{ fontSize: '2.1rem', fontWeight: 900, color: '#fff', marginBottom: '8px' }}
        >
          {isChallenge ? '¡Desafío Superado!' : '¡Nivel Completado!'}
        </motion.h2>

        <motion.p 
          variants={itemVariants}
          style={{ fontSize: '1.1rem', color: moduleColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', fontWeight: 700 }}
        >
          {moduleText} — {levelText}
        </motion.p>

        {/* Grid de Logros */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px', 
            marginBottom: '32px' 
          }}
        >
          {/* Card 1: Aciertos */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 8px' }}>
            <Award size={24} style={{ color: '#F59E0B', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px' }}>Aciertos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>{progreso.aciertos}</div>
          </div>

          {/* Card 2: Precisión */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 8px' }}>
            <Target size={24} style={{ color: '#10B981', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px' }}>Precisión</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>{precision}%</div>
          </div>

          {/* Card 3: Puntos */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 8px' }}>
            <Star size={24} style={{ color: '#8B5CF6', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '4px' }}>Puntos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fbbf24' }}>+{isChallenge ? '250' : '100'}</div>
          </div>
        </motion.div>

        {/* Caja de Recomendación */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            background: 'rgba(255,255,255,0.02)', 
            borderLeft: `4px solid ${moduleColor}`, 
            borderRadius: '12px', 
            padding: '20px', 
            textAlign: 'left', 
            marginBottom: '32px' 
          }}
        >
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', marginBottom: '6px' }}>{rec.titulo}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.45 }}>{rec.mensaje}</div>
        </motion.div>

        {/* Botón de Continuación */}
        <motion.button
          variants={itemVariants}
          className="f4-mixed-challenge-btn w-full"
          onClick={onClose}
          style={{
            background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`,
            boxShadow: `0 8px 24px ${moduleColor}30`,
          }}
        >
          {rec.accion}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente: Modal de Graduación de Fase (Phase Graduation Modal) ──────
const Fase4PhaseGraduationModal: React.FC<{
  studentName: string;
  onClose: () => void;
}> = ({ studentName, onClose }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.15, duration: 0.5, type: 'spring' }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="f4-feedback-overlay"
      style={{ zIndex: 1200, background: 'rgba(7, 11, 25, 0.96)' }}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="f4-feedback-card graduation glass-card"
        style={{ 
          maxWidth: '650px', 
          width: '92%', 
          padding: '45px 35px',
          borderTop: '6px solid #10B981',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.25)',
          overflowY: 'auto',
          maxHeight: '90vh'
        }}
      >
        <motion.div 
          variants={itemVariants}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 360] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          className="f4-feedback-emoji" 
          style={{ fontSize: '5rem', marginBottom: '20px' }}
        >
          👑
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          style={{ fontSize: '2.3rem', fontWeight: 900, color: '#fff', marginBottom: '10px', textShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
        >
          ¡Felicidades, {studentName}! 🎉
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '35px', maxWidth: '500px', margin: '0 auto 35px' }}
        >
          ¡Has completado y dominado con éxito toda la **Fase 4: Fracciones y Razones**! Eres oficialmente un maestro de las proporciones en LogicaKids. 🛡️✨
        </motion.p>

        {/* Infografía: El Gran Viaje de Fase 4 */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: '24px', 
            padding: '24px', 
            marginBottom: '35px',
            position: 'relative'
          }}
        >
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Compass size={20} style={{ color: '#10B981' }} />
            Tu Mapa de Ruta Conquistado - Fase 4
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10px' }}>
            {/* Línea Conectora */}
            <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '4px', background: 'linear-gradient(90deg, #A855F7, #C084FC, #7C3AED, #6D28D9)', zIndex: 0, opacity: 0.6, borderRadius: '2px' }} />

            {/* Módulo 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 1</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Visual</span>
            </div>

            {/* Módulo 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(192, 132, 252, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 2</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Cantidad</span>
            </div>

            {/* Módulo 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 3</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Porcentaje</span>
            </div>

            {/* Módulo 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(109, 40, 217, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 4</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Razón</span>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas de Graduación */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px', 
            marginBottom: '40px' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Award size={36} style={{ color: '#10B981' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>26 / 26</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Niveles Superados</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Trophy size={36} style={{ color: '#F59E0B' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>4 / 4</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Módulos Dominados</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Star size={36} style={{ color: '#A855F7' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>300+</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Ejercicios Logrados</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Target size={36} style={{ color: '#EC4899' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Conceptos Dominados</div>
            </div>
          </div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          className="f4-mixed-challenge-btn w-full py-4 text-xl"
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #10B981cc, #10B981)',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
          }}
        >
          ¡Avanzar a la Siguiente Fase! 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente Principal ──────────────────────────────────────────────────
export const Fase4GameScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const moduloId = Number(location.state?.moduloId || '1');
  const nivelId = Number(location.state?.nivelId || '1');
  
  const isChallenge = moduloId === 99 || (nivelId >= 11 && nivelId <= 13);
  const [maxAciertos, setMaxAciertos] = useState<number>(isChallenge ? (nivelId === 13 ? 10 : 20) : 15);
  const moduleName = MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  const moduleColor = MODULE_COLORS[moduloId] ?? '#A855F7';

  // Splash welcome control
  const [showSplash, setShowSplash] = useState(true);
  const [countdown, setCountdown] = useState(8);
  const [pregunta, setPregunta] = useState<Fase4Pregunta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Respuestas
  const [respuestaNum, setRespuestaNum] = useState('');
  const [respuestaDen, setRespuestaDen] = useState('');
  const [activeInputField, setActiveInputField] = useState<'num' | 'den'>('num');
  const [interactiveSelectedCount, setInteractiveSelectedCount] = useState<number>(0);

  const [timer, setTimer] = useState<number | null>(null);
  const [maxTimer, setMaxTimer] = useState<number>(1);
  const [progreso, setProgreso] = useState({ aciertos: 0, intentos: 0, porcentaje: 0 });
  const [feedback, setFeedback] = useState<FeedbackState>({ visible: false, esCorrecta: false });
  const [shaking, setShaking] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modals state
  const [showReading, setShowReading] = useState(false);
  const [isInitialReading, setIsInitialReading] = useState(true);
  const [readingData, setReadingData] = useState<Fase4Lectura | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [studentName, setStudentName] = useState('Estudiante');

  const [showEarlyExit, setShowEarlyExit] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showGraduation, setShowGraduation] = useState(false);

  // Memos de metadatos para la pantalla Splash Premium
  const challengeName = useMemo(() => {
    if (moduloId === 99) return "Maestría Final";
    if (nivelId === 11) return "Desafío 1: Estándar";
    if (nivelId === 12) return "Desafío 2: Avanzado";
    if (nivelId === 13) return "Desafío Final: Maestría";
    return `Desafío - Nivel ${nivelId}`;
  }, [moduloId, nivelId]);

  const displayModuleName = useMemo(() => {
    if (moduloId === 99) return "Desafío Mixto de la Fase 4";
    return MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  }, [moduloId]);

  const displayTimeLimit = useMemo(() => {
    if (pregunta?.tiene_cronometro && pregunta?.tiempo_limite_segundos) {
      return pregunta.tiempo_limite_segundos;
    }
    return moduloId === 99 ? 60 : (nivelId === 11 ? 25 : nivelId === 12 ? 40 : 50);
  }, [moduloId, nivelId, pregunta]);

  const displayQuestionsCount = maxAciertos;

  // Temporizador interactivo de Splash con 8s countdown e instant bypass
  useEffect(() => {
    if (showSplash) {
      let intervalId: ReturnType<typeof setInterval>;
      let timeoutId: ReturnType<typeof setTimeout>;

      if (isChallenge) {
        setCountdown(8);
        intervalId = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(intervalId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        timeoutId = setTimeout(() => {
          setShowSplash(false);
        }, 8000);
      } else {
        timeoutId = setTimeout(() => {
          setShowSplash(false);
        }, 2500);
      }

      const handleGlobalKeyDown = () => {
        setShowSplash(false);
      };
      window.addEventListener('keydown', handleGlobalKeyDown);

      return () => {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [showSplash, isChallenge]);

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
    if (timer === null || showReading || showSplash) return;
    if (timer <= 0) { handleSubmit(); return; }
    timerRef.current = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer, showReading, showSplash]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleFeedbackClose = useCallback(() => {
    if (feedback.resultado?.early_exit) {
      setFeedback({ visible: false, esCorrecta: false });
      setShowEarlyExit(true);
      return;
    }

    if (feedback.isError) {
      setFeedback({ visible: false, esCorrecta: false });
      return;
    }

    setFeedback({ visible: false, esCorrecta: false });

    if (feedback.resultado?.fase_completada) {
      setShowGraduation(true);
      return;
    }

    if (feedback.resultado?.bloque_completado) {
      setShowCompletion(true);
      return;
    }

    if (feedback.esCorrecta || isChallenge) {
      loadNextQuestion();
    } else {
      if (feedback.resultado?.es_espejo) {
        setTimeout(() => loadNextQuestion(), 1200);
      } else {
        setRespuestaNum('');
        setRespuestaDen('');
      }
    }
  }, [feedback, navigate, isChallenge, loadNextQuestion]);

  const handleSubmit = useCallback(async (customAnswer?: string) => {
    if (!pregunta) return;
    if (feedback.visible) {
      handleFeedbackClose();
      return;
    }

    stopTimer();

    // Determinar la respuesta a enviar
    let finalAnswer = '';
    
    const isInteractivePizza = pregunta.datos_numericos?.tipo_visual === 'pizza' && !!pregunta.datos_numericos?.es_interactivo;
    if (isInteractivePizza && customAnswer === undefined) {
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

    let alternativaId: number | undefined = undefined;
    if (pregunta.tipo_pregunta === 'multiple_opcion' && pregunta.alternativas) {
      const match = pregunta.alternativas.find(alt => alt.texto === finalAnswer);
      if (match) {
        alternativaId = match.id;
      }
    }

    const payload = {
      modulo_id: moduloId,
      nivel_id: nivelId,
      pregunta_id: pregunta.id,
      respuesta_dada: finalAnswer.trim() || undefined,
      alternativa_id: alternativaId,
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
        if (resultado.fase_completada || resultado.bloque_completado) {
          // Wait for tutor card before showing gorgeous trophies
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
  }, [pregunta, moduloId, nivelId, respuestaNum, respuestaDen, interactiveSelectedCount, timer, feedback, handleFeedbackClose]);

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
  const isFractionAnswer = (pregunta.respuesta_correcta ?? '').includes('/');
  const showFractionInput = isFractionAnswer || pregunta.datos_numericos?.tipo_visual === 'pizza';
  const isInteractiveLayout = (pregunta.datos_numericos?.tipo_visual === 'pizza' || pregunta.datos_numericos?.tipo_visual === 'pie') && !!pregunta.datos_numericos?.es_interactivo;

  return (
    <div className="f4-screen-wrapper" style={{ ['--module-accent' as any]: moduleColor }}>
      {/* Welcome Splash Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            className="f4-start-splash-overlay" 
            onClick={() => setShowSplash(false)}
          >
            {isChallenge ? (
              <motion.div 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }} 
                className="f4-splash-container-premium"
              >
                <div className="f4-splash-badge-premium" style={{ color: moduleColor }}>
                  ¡Desafío Especial!
                </div>
                <h1 className="f4-splash-title-premium">{challengeName}</h1>
                
                {/* Metadatos en cuadrícula premium */}
                <div className="f4-splash-metadata-grid">
                  <div className="f4-splash-meta-card">
                    <div className="f4-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      {moduloId === 99 ? (
                        <Trophy size={22} style={{ color: '#F59E0B' }} />
                      ) : (
                        <Compass size={22} style={{ color: moduleColor }} />
                      )}
                    </div>
                    <span className="f4-splash-meta-label">Módulo</span>
                    <span className="f4-splash-meta-value">{displayModuleName}</span>
                  </div>

                  <div className="f4-splash-meta-card">
                    <div className="f4-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      <Target size={22} style={{ color: moduleColor }} />
                    </div>
                    <span className="f4-splash-meta-label">Preguntas</span>
                    <span className="f4-splash-meta-value">{displayQuestionsCount} a superar</span>
                  </div>

                  <div className="f4-splash-meta-card">
                    <div className="f4-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      <Clock size={22} style={{ color: moduleColor }} />
                    </div>
                    <span className="f4-splash-meta-label">Tiempo</span>
                    <span className="f4-splash-meta-value">{displayTimeLimit}s / pregunta</span>
                  </div>
                </div>

                {/* Animación de cuenta regresiva circular */}
                <div className="f4-splash-countdown-wrapper">
                  <svg className="f4-splash-countdown-svg" viewBox="0 0 100 100">
                    <circle className="f4-splash-countdown-bg" cx="50" cy="50" r="45" />
                    <motion.circle 
                      className="f4-splash-countdown-progress" 
                      cx="50" cy="50" r="45"
                      initial={{ pathLength: 1 }}
                      animate={{ pathLength: 0 }}
                      transition={{ duration: 8, ease: 'linear' }}
                      style={{ stroke: moduleColor }}
                    />
                  </svg>
                  <div className="f4-splash-countdown-number">{countdown}</div>
                </div>

                <div className="f4-splash-hint-premium mt-4">
                  Haz clic o presiona cualquier tecla para comenzar ahora
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }} 
                className="f4-splash-content"
              >
                <div className="f4-splash-badge" style={{ color: moduleColor }}>
                  ENTRENAMIENTO LIBRE
                </div>
                <h1 className="f4-splash-title">{moduleName}</h1>
                <div className="f4-splash-level" style={{ background: `${moduleColor}20`, borderColor: `${moduleColor}40` }}>
                  {`NIVEL ${nivelId}`}
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }} 
                  transition={{ duration: 1.5, repeat: Infinity }} 
                  className="f4-splash-hint"
                >
                  Toca para comenzar
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient backgrounds */}
      <AnimatePresence>
        {feedback.visible && feedback.esCorrecta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fg-ambient-glow correct" />
        )}
        {feedback.visible && !feedback.esCorrecta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fg-ambient-glow incorrect" />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="f4-game-header-modern">
        <button 
          className="f4-nav-back-btn text-red-400 border-red-500/20" 
          onClick={() => navigate('/welcome-fase4')}
        >
          <ArrowLeft size={18} />
        </button>

        <div className="f4-header-right-group">
          {!isChallenge && (
            <button 
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-purple-500/20 px-4 py-2 rounded-2xl transition-all cursor-pointer text-purple-400 text-xs font-black" 
              onClick={handleOpenReading}
            >
              <BookOpen size={14} />
              <span>TEORÍA</span>
            </button>
          )}

          <div className="f4-header-badge-pill">
            <span className="f4-badge-module" style={{ color: moduleColor }}>
              {moduleName.toUpperCase()}
            </span>
            <span className="f4-badge-divider">|</span>
            <span className="f4-badge-level">FASE 4</span>
            <span className="f4-badge-divider">|</span>
            <span className="f4-badge-challenge">
              {isChallenge ? 'DESAFÍO' : 'PROGRESO'} {progreso.aciertos}/{maxAciertos}
            </span>
            {timer !== null && (
              <>
                <span className="f4-badge-divider">|</span>
                <span className="f4-badge-timer" style={{ color: timer <= 5 ? '#EF4444' : '#ffffff' }}>
                  {timer}S
                </span>
              </>
            )}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="f4-full-width-progress-bar">
          <div 
            className="f4-full-width-progress-fill"
            style={{ 
              width: `${barWidth}%`, 
              background: `linear-gradient(90deg, ${moduleColor}80, ${moduleColor})`,
              boxShadow: `0 0 10px ${moduleColor}`
            }} 
          />
        </div>

        {/* Chronometer visual helper */}
        {timer !== null && (
          <div className="f4-timer-progress-bar">
            <div 
              className="f4-full-width-progress-fill" 
              style={{ 
                width: `${(timer / maxTimer) * 100}%`, 
                background: timer <= 5 ? '#EF4444' : 'linear-gradient(90deg, #8B5CF6, #EC4899)', 
                height: '100%' 
              }} 
            />
          </div>
        )}
      </header>

      {/* Main game board */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 z-10 relative">
        <AnimatePresence>
          {feedback.visible && feedback.resultado?.es_espejo && !feedback.esCorrecta && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center max-w-md"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {isInteractiveLayout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-4xl min-h-[400px]">
            {/* Left Column: Interactive Visualizer */}
            <motion.div 
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} 
              transition={{ duration: 0.4 }}
              className={`flex flex-col items-center justify-center bg-slate-900/40 border p-8 rounded-[2.5rem] min-h-[350px] ${
                shaking ? 'shake-error' : ''
              }`}
              style={{ 
                borderColor: feedback.visible 
                  ? (feedback.esCorrecta ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)') 
                  : 'rgba(255, 255, 255, 0.05)',
                boxShadow: feedback.visible 
                  ? (feedback.esCorrecta ? '0 0 25px rgba(16, 185, 129, 0.15)' : '0 0 25px rgba(239, 68, 68, 0.15)') 
                  : 'none'
              }}
            >
              {pregunta.datos_numericos?.tipo_visual === 'pizza' ? (
                <>
                  <PizzaFractionVisualizer
                    slices={pregunta.datos_numericos?.cortes || 8}
                    initialSombreados={pregunta.datos_numericos?.sombreados || []}
                    interactive={true}
                    hideText={true}
                    onChange={(selectedCount) => {
                      setRespuestaNum(selectedCount.toString());
                      setRespuestaDen((pregunta.datos_numericos?.cortes || 8).toString());
                      setInteractiveSelectedCount(selectedCount);
                    }}
                    color={moduleColor}
                    shape={getDeterministicShape(pregunta.enunciado)}
                  />

                  {/* Progress Indicator Pill */}
                  <div 
                    className="mt-4 px-6 py-2 bg-slate-950/60 border border-purple-500/20 rounded-full font-sans font-black tracking-widest text-center shadow-lg"
                    style={{ minWidth: '100px' }}
                  >
                    <span style={{ color: moduleColor }} className="text-2xl font-black">
                      {interactiveSelectedCount}
                    </span>
                    <span className="text-slate-400 text-xl font-bold mx-2">/</span>
                    <span className="text-slate-200 text-2xl font-black">
                      {pregunta.datos_numericos?.cortes || 8}
                    </span>
                  </div>

                  {/* Description Challenge Label */}
                  <div className="mt-6 text-center">
                    <span className="text-slate-400 text-xs font-black tracking-[0.2em] block mb-2">
                      SOMBREA EXACTAMENTE LA FRACCIÓN:
                    </span>
                    <span 
                      style={{ color: moduleColor, textShadow: `0 0 15px ${moduleColor}60` }} 
                      className="text-4xl font-sans font-black tracking-wider block"
                    >
                      {pregunta.respuesta_correcta}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <PieChartVisualizer
                    pctA={pregunta.datos_numericos?.pct_a || 40}
                    pctB={pregunta.datos_numericos?.pct_b || 35}
                    pctC={pregunta.datos_numericos?.pct_c || 25}
                    categorias={pregunta.datos_numericos?.categorias || ['Rojas', 'Verdes', 'Uvas']}
                    interactive={true}
                    onChange={(value) => {
                      setRespuestaNum(value.toString());
                    }}
                    color={moduleColor}
                  />
                  <div className="mt-6 text-center">
                    <span className="text-slate-400 text-xs font-black tracking-[0.2em] block mb-2">
                      PORCENTAJE SELECCIONADO:
                    </span>
                    <span 
                      style={{ color: moduleColor, textShadow: `0 0 15px ${moduleColor}60` }} 
                      className="text-4xl font-sans font-black tracking-wider block"
                    >
                      {respuestaNum ? `${respuestaNum}%` : '?'}
                    </span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Right Column: Giant Purple Confirmation Button */}
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={() => handleSubmit()}
                disabled={feedback.visible}
                className="group relative flex items-center justify-center gap-4 w-full max-w-md py-8 px-10 bg-purple-600 hover:bg-purple-500 text-white font-sans font-black text-4xl rounded-[2.5rem] shadow-[0_12px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_35px_rgba(168,85,247,0.6)] border-4 border-purple-400/20 hover:border-purple-300/30 transform active:scale-[0.95] transition-all duration-150 cursor-pointer overflow-hidden"
              >
                {/* Micro-sparkle ambient hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                <span>CONFIRMAR</span>
                
                {/* Integrated checkmark circle */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-transparent flex-shrink-0">
                  <span className="text-white text-2xl font-black">✓</span>
                </div>
              </button>

              {/* Embedded score widgets for normal module questions */}
              {!isChallenge && (
                <div className="f4-scores-container max-w-[400px] mt-8 w-full">
                  <div className="f4-score-box correct">
                    <span className="f4-score-label">CORRECTAS</span>
                    <span className="f4-score-value">{progreso.aciertos}</span>
                  </div>
                  <div className="f4-score-box incorrect">
                    <span className="f4-score-label">ERRORES</span>
                    <span className="f4-score-value">{progreso.intentos - progreso.aciertos}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-4xl">
            {/* Visual representations card */}
            <motion.div 
              animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} 
              transition={{ duration: 0.4 }}
              className={`flex flex-col items-center justify-center bg-slate-900/40 border p-8 rounded-[2.5rem] min-h-[300px] ${
                shaking ? 'shake-error' : ''
              }`}
              style={{ 
                borderColor: feedback.visible 
                  ? (feedback.esCorrecta ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)') 
                  : 'rgba(255, 255, 255, 0.05)',
                boxShadow: feedback.visible 
                  ? (feedback.esCorrecta ? '0 0 25px rgba(16, 185, 129, 0.15)' : '0 0 25px rgba(239, 68, 68, 0.15)') 
                  : 'none'
              }}
            >
              {pregunta.datos_numericos?.tipo_visual === 'pizza' ? (
                moduloId === 1 && nivelId === 2 && pregunta.datos_numericos?.num_base !== undefined ? (
                  (() => {
                    const num_base = pregunta.datos_numericos.num_base;
                    const den_base = pregunta.datos_numericos.den_base;
                    const factor = pregunta.datos_numericos.factor;
                    const num_eq = num_base * factor;
                    const den_eq = den_base * factor;
                    const shape = getDeterministicShape(pregunta.enunciado);
                    return (
                      <div className="flex items-center justify-center gap-6 my-4 scale-[0.9] origin-top">
                        <div className="flex flex-col items-center">
                          <PizzaFractionVisualizer
                            slices={den_base}
                            initialSombreados={Array.from({ length: num_base }, (_, i) => i)}
                            interactive={false}
                            hideText={true}
                            color={moduleColor}
                            shape={shape}
                          />
                          <span className="text-slate-300 font-black text-lg">{num_base}/{den_base}</span>
                        </div>
                        <div className="text-4xl font-black text-purple-400" style={{ color: moduleColor }}>=</div>
                        <div className="flex flex-col items-center">
                          <PizzaFractionVisualizer
                            slices={den_eq}
                            initialSombreados={Array.from({ length: num_eq }, (_, i) => i)}
                            interactive={false}
                            hideText={true}
                            color={moduleColor}
                            shape={shape}
                          />
                          <span className="text-slate-300 font-black text-lg">{num_eq}/{den_eq}</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <PizzaFractionVisualizer
                    slices={pregunta.datos_numericos?.cortes || 8}
                    initialSombreados={pregunta.datos_numericos?.sombreados || []}
                    interactive={!!pregunta.datos_numericos?.es_interactivo}
                    onChange={(selectedCount) => {
                      setRespuestaNum(selectedCount.toString());
                      setRespuestaDen((pregunta.datos_numericos?.cortes || 8).toString());
                      setInteractiveSelectedCount(selectedCount);
                    }}
                    color={moduleColor}
                    shape={getDeterministicShape(pregunta.enunciado)}
                  />
                )
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
                    setInteractiveSelectedCount(selectedLevel);
                  }}
                  color={moduleColor}
                />
              ) : pregunta.datos_numericos?.tipo_visual === 'pie' ? (
                <PieChartVisualizer
                  pctA={pregunta.datos_numericos?.pct_a || 40}
                  pctB={pregunta.datos_numericos?.pct_b || 35}
                  pctC={pregunta.datos_numericos?.pct_c || 25}
                  categorias={pregunta.datos_numericos?.categorias || ['Rojas', 'Verdes', 'Uvas']}
                  interactive={!!pregunta.datos_numericos?.es_interactivo}
                  onChange={(value) => {
                    setRespuestaNum(value.toString());
                  }}
                  color={moduleColor}
                />
              ) : pregunta.datos_numericos?.tipo_visual === 'percentage_thermometer' ? (
                (() => {
                  const pct = pregunta.datos_numericos?.pct || 50;
                  const { slices, sombreados } = getFractionForPercentage(pct);
                  const shape = getDeterministicShape(pregunta.enunciado);
                  return (
                    <div className="flex flex-col items-center justify-center my-4 scale-[0.9] origin-top">
                      <PizzaFractionVisualizer
                        slices={slices}
                        initialSombreados={sombreados}
                        interactive={false}
                        hideText={true}
                        color={moduleColor}
                        shape={shape}
                      />
                      <div className="text-2xl font-black text-slate-300 mt-2">{pct}%</div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center font-display text-4xl font-black text-white p-4">
                  🍕 🧪
                </div>
              )}
              
              <p className="text-lg font-bold text-center mt-6 text-slate-200">
                {pregunta.enunciado}
              </p>
            </motion.div>

            {/* Interactive input area */}
            <div className="flex flex-col items-center justify-center">
              {pregunta.tipo_pregunta === 'multiple_opcion' && pregunta.alternativas ? (
                <div className="w-full space-y-4">
                  {pregunta.alternativas.map(alt => (
                    <button
                      key={alt.id}
                      onClick={() => handleAltSelect(alt.texto)}
                      disabled={feedback.visible}
                      className="w-full py-5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-2xl font-black text-xl text-left text-white transition-all active:scale-[0.98] cursor-pointer"
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
              
              {/* Embedded score widgets */}
              {!isChallenge && (
                <div className="f4-scores-container max-w-[400px]">
                  <div className="f4-score-box correct">
                    <span className="f4-score-label">CORRECTAS</span>
                    <span className="f4-score-value">{progreso.aciertos}</span>
                  </div>
                  <div className="f4-score-box incorrect">
                    <span className="f4-score-label">ERRORES</span>
                    <span className="f4-score-value">{progreso.intentos - progreso.aciertos}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Tutor Feedback Overlay */}
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
              {feedback.esCorrecta 
                ? '¡Excelente trabajo! 🎉' 
                : isChallenge 
                  ? 'Respuesta incorrecta ➔' 
                  : 'Vuelve a intentarlo ↺'}
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
              className={`px-8 py-4 text-white font-black text-lg rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer ${
                feedback.esCorrecta ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {feedback.resultado?.early_exit ? 'Volver al Menú' : 'Continuar'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Rich Theory Modal */}
      <AnimatePresence>
        {showReading && readingData && (
          <Fase4TheoryModal
            readingData={readingData}
            moduleColor={moduleColor}
            onClose={() => setShowReading(false)}
            onAbort={() => setShowReading(false)}
            isInitialReading={isInitialReading}
          />
        )}
      </AnimatePresence>

      {/* Early Exit Modal */}
      <AnimatePresence>
        {showEarlyExit && (
          <Fase4EarlyExitModal 
            moduleColor={moduleColor} 
            onClose={() => {
              setShowEarlyExit(false);
              navigate('/welcome-fase4');
            }} 
          />
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletion && (
          <Fase4CompletionModal
            moduloId={moduloId}
            nivelId={nivelId}
            isChallenge={isChallenge}
            moduleColor={moduleColor}
            progreso={progreso}
            onClose={() => {
              setShowCompletion(false);
              navigate('/welcome-fase4');
            }}
          />
        )}
      </AnimatePresence>

      {/* Graduation Modal */}
      <AnimatePresence>
        {showGraduation && (
          <Fase4PhaseGraduationModal
            studentName={studentName}
            onClose={() => {
              setShowGraduation(false);
              navigate('/map');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fase4GameScreen;
