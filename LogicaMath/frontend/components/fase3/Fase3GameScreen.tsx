import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DetectiveNotebook } from './DetectiveNotebook';
import { OperationBuilder } from './OperationBuilder';
import { getFase3Question, submitFase3Answer, getFase3Reading, graduateFase3 } from './Fase3Service';
import { Fase3Pregunta, Fase3AnswerResult, Fase3Lectura } from './Fase3Types';
import { CustomKeyboard } from '../common/CustomKeyboard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Compass, Target, Trophy, Award, Star } from 'lucide-react';
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

// ─── Modales Premium ────────────────────────────────────────────────────────

const Fase3EarlyExitModal: React.FC<{
  moduleColor: string;
  moduloId: number;
  nivelId: number;
  aciertos: number;
  intentos: number;
  onClose: () => void;
}> = ({ moduleColor, moduloId, nivelId, aciertos, intentos, onClose }) => {
  const moduloText = moduloId === 99 ? 'Desafío Mixto' : MODULE_NAMES[moduloId] || `Módulo ${moduloId}`;
  const challengeText = moduloId === 99 
    ? 'Maestría Final' 
    : (nivelId === 11 ? 'Desafío 1: Estándar' : nivelId === 12 ? 'Desafío 2: Avanzado' : 'Desafío Final: Maestría');
  
  const errores = intentos - aciertos;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="f3-feedback-overlay"
      style={{ zIndex: 1100 }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="f3-feedback-card early-exit glass-card"
        style={{ 
          maxWidth: '500px', 
          width: '90%', 
          padding: '40px',
          borderTop: '6px solid #EF4444',
          textAlign: 'center'
        }}
      >
        <div className="f3-feedback-emoji" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>🛡️</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
          ¡Desafío Incompleto!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '20px', fontSize: '1.1rem', lineHeight: 1.5 }}>
          Dado el número de errores acumulados, ya no es posible alcanzar el puntaje mínimo de aprobación para este desafío.
        </p>

        {/* Reporte de Desempeño */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: moduleColor, fontWeight: 700, marginBottom: '4px' }}>
            {moduloText}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
            {challengeText}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '16px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '2px' }}>Aciertos</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981' }}>{aciertos}</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '16px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '2px' }}>Errores</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#EF4444' }}>{errores}</div>
            </div>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '30px', fontSize: '1rem', lineHeight: 1.5 }}>
          ¡No te preocupes! Cada error es una excelente oportunidad para aprender y ser más fuerte. Repasa la teoría, practica con calma y ¡vuelve a intentarlo! Tú puedes lograrlo. 💪🚀
        </p>

        <button
          className="f3-mixed-challenge-btn w-full"
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



const Fase3CompletionModal: React.FC<{
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
        titulo: '¡Héroe de la Fase 3! 🎉',
        mensaje: '¡Has dominado todos los desafíos de la Fase 3 de Fracciones! Tu razonamiento cuantitativo y velocidad de cálculo son excepcionales. ¡Listo para brillar!',
        accion: 'Completar Fase 3 🚀'
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
      className="f3-feedback-overlay"
      style={{ zIndex: 1100 }}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="f3-feedback-card completion glass-card"
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
          className="f3-feedback-emoji" 
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
          className="f3-mixed-challenge-btn w-full"
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


const Fase3PhaseGraduationModal: React.FC<{
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
      className="f3-feedback-overlay"
      style={{ zIndex: 1200, background: 'rgba(7, 11, 25, 0.96)' }}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="f3-feedback-card graduation glass-card"
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
          className="f3-feedback-emoji" 
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
          ¡Has completado y dominado con éxito toda la **Fase 3: Razonamiento y Lógica**! Eres oficialmente un maestro de las proporciones en LogicaKids. 🛡️✨
        </motion.p>

        {/* Infografía: El Gran Viaje de Fase 3 */}
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
            Tu Mapa de Ruta Conquistado - Fase 3
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
          className="f3-mixed-challenge-btn w-full py-4 text-xl"
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


export const Fase3GameScreen: React.FC<{ isEvaluatorMode?: boolean }> = ({ isEvaluatorMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const moduloId = Number(location.state?.moduloId || '1');
  const nivelId = Number(location.state?.nivelId || '1');
  
  const isChallenge = moduloId === 99 || (nivelId >= 11 && nivelId <= 13);
  // maxAciertos is dynamic — comes from the API (cantidad_requerida set by Admin)
  const [maxAciertos, setMaxAciertos] = useState<number>(isChallenge ? (nivelId === 13 ? 10 : 20) : 15);
  const moduleName = MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  const moduleColor = MODULE_COLORS[moduloId] ?? '#F97316';

  const maxErroresPermitidos = useMemo(() => {
    if (!isChallenge) return 0;
    const porcAprobacion = 90;
    let minAciertosReq = maxAciertos;
    for (let c = 0; c <= maxAciertos; c++) {
      if (Math.floor((c / maxAciertos) * 100) >= porcAprobacion) {
        minAciertosReq = c;
        break;
      }
    }
    return maxAciertos - minAciertosReq;
  }, [isChallenge, maxAciertos]);

  // Premium splash welcome control
  const [showSplash, setShowSplash] = useState(true);
  const [countdown, setCountdown] = useState(8);

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
    if (moduloId === 99) return "Desafío Mixto de la Fase 3";
    return MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  }, [moduloId]);

  const displayTimeLimit = useMemo(() => {
    if (pregunta && !pregunta.tiene_cronometro) return "Sin límite";
    if (pregunta?.tiene_cronometro && pregunta?.tiempo_limite_segundos) {
      return `${pregunta.tiempo_limite_segundos}s / pregunta`;
    }
    if (isChallenge) {
      if (moduloId === 99) return "90s / pregunta";
      return nivelId === 11 ? "30s / pregunta" : nivelId === 12 ? "45s / pregunta" : "60s / pregunta";
    }
    return "15s / pregunta";
  }, [moduloId, nivelId, pregunta, isChallenge]);

  const displayQuestionsCount = maxAciertos;

  // Temporizador interactivo de Splash con omisión por teclado o clic
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
    if (isChallenge && !isEvaluatorMode) return;
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
      // Sync dynamic required count from backend
      if (q.cantidad_requerida) setMaxAciertos(q.cantidad_requerida);
      
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
    if (timer === null || showReading || showSplash) return;
    if (timer <= 0) { handleSubmit(); return; }
    timerRef.current = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer, showReading, showSplash]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimer(null);
  };

  const handleEvaluatorSkip = useCallback(() => {
    if (feedback.visible) return;
    setProgreso(prev => {
      const newAciertos = prev.aciertos + 1;
      const newIntentos = prev.intentos + 1;
      if (newAciertos >= maxAciertos) {
        setShowCompletion(true);
      }
      return {
        aciertos: newAciertos,
        intentos: newIntentos,
        porcentaje: (newAciertos / maxAciertos) * 100
      };
    });
    setFeedback({
      visible: true,
      esCorrecta: true,
      resultado: {
        es_correcta: true,
        respuesta_correcta: 'Skipped',
        aciertos_acumulados: progreso.aciertos + 1,
        intentos_totales: progreso.intentos + 1,
        porcentaje_actual: ((progreso.aciertos + 1) / maxAciertos) * 100
      }
    });
    setTimeout(() => {
      setFeedback({ visible: false, esCorrecta: false });
      setRespuesta('');
      setSelectedAltId(null);
      if (pregunta?.tiene_cronometro && pregunta?.tiempo_limite_segundos) {
        setTimer(pregunta.tiempo_limite_segundos);
      }
      loadNextQuestion(); // Move to next question automatically
    }, 500);
  }, [feedback.visible, maxAciertos, progreso, pregunta]);

  const handleFeedbackClose = useCallback(() => {
    console.log("handleFeedbackClose triggered! feedback.resultado:", feedback.resultado);
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
      console.log("Setting showGraduation to true");
      setShowGraduation(true);
      return;
    }

    if (feedback.resultado?.bloque_completado) {
      console.log("Setting showCompletion to true");
      setShowCompletion(true);
      return;
    }

    if (feedback.esCorrecta || isChallenge) {
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

  useEffect(() => {
    console.log("Completion useEffect evaluated. feedback.visible:", feedback.visible, "feedback.esCorrecta:", feedback.esCorrecta, "bloque_completado:", feedback.resultado?.bloque_completado);
    if (feedback.visible && feedback.esCorrecta && (feedback.resultado?.fase_completada || feedback.resultado?.bloque_completado)) {
      console.log("Scheduling completion timeout for 2000ms");
      const timer = setTimeout(() => {
        console.log("Completion timeout fired!");
        handleFeedbackClose();
      }, 2000);
      return () => {
        console.log("Completion timeout cleared!");
        clearTimeout(timer);
      };
    }
  }, [feedback, handleFeedbackClose]);

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
        if (resultado.fase_completada || resultado.bloque_completado) {
          // Modal will be shown in handleFeedbackClose when user clicks "Siguiente"
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
        if (isChallenge) {
          setTimeout(() => handleFeedbackClose(), 1800);
        }
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
      {/* Welcome Splash Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            className="f3-start-splash-overlay" 
            onClick={() => setShowSplash(false)}
          >
            {isChallenge ? (
              <motion.div 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }} 
                className="f3-splash-container-premium"
              >
                <div className="f3-splash-badge-premium" style={{ color: moduleColor }}>
                  ¡Desafío Especial!
                </div>
                <h1 className="f3-splash-title-premium">{challengeName}</h1>
                
                {/* Metadatos en cuadrícula premium */}
                <div className="f3-splash-metadata-grid">
                  <div className="f3-splash-meta-card">
                    <div className="f3-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      {moduloId === 99 ? (
                        <Trophy size={22} style={{ color: '#F59E0B' }} />
                      ) : (
                        <Compass size={22} style={{ color: moduleColor }} />
                      )}
                    </div>
                    <span className="f3-splash-meta-label">Módulo</span>
                    <span className="f3-splash-meta-value">{displayModuleName}</span>
                  </div>

                  <div className="f3-splash-meta-card">
                    <div className="f3-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      <Target size={22} style={{ color: moduleColor }} />
                    </div>
                    <span className="f3-splash-meta-label">Preguntas</span>
                    <span className="f3-splash-meta-value">{displayQuestionsCount} a superar</span>
                  </div>

                  {displayTimeLimit !== "Sin límite" && (
                    <div className="f3-splash-meta-card">
                      <div className="f3-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                        <Clock size={22} style={{ color: moduleColor }} />
                      </div>
                      <span className="f3-splash-meta-label">Tiempo</span>
                      <span className="f3-splash-meta-value">{displayTimeLimit}</span>
                    </div>
                  )}
                </div>

                {/* Animación de cuenta regresiva circular */}
                <div className="f3-splash-countdown-wrapper">
                  <svg className="f3-splash-countdown-svg" viewBox="0 0 100 100">
                    <circle className="f3-splash-countdown-bg" cx="50" cy="50" r="45" />
                    <motion.circle 
                      className="f3-splash-countdown-progress" 
                      cx="50" cy="50" r="45"
                      initial={{ pathLength: 1 }}
                      animate={{ pathLength: 0 }}
                      transition={{ duration: 8, ease: 'linear' }}
                      style={{ stroke: moduleColor }}
                    />
                  </svg>
                  <div className="f3-splash-countdown-number">{countdown}</div>
                </div>

                <div className="f3-splash-hint-premium mt-4">
                  Haz clic o presiona cualquier tecla para comenzar ahora
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }} 
                className="f3-splash-content"
              >
                <div className="f3-splash-badge" style={{ color: moduleColor }}>
                  ENTRENAMIENTO LIBRE
                </div>
                <h1 className="f3-splash-title">{moduleName}</h1>
                <div className="f3-splash-level" style={{ background: `${moduleColor}20`, borderColor: `${moduleColor}40` }}>
                  {`NIVEL ${nivelId}`}
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }} 
                  transition={{ duration: 1.5, repeat: Infinity }} 
                  className="f3-splash-hint"
                >
                  Toca para comenzar
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
          {isEvaluatorMode && (
            <button 
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-2xl transition-all cursor-pointer shadow-sm text-white font-sans text-xs font-black mr-2 uppercase" 
              onClick={handleEvaluatorSkip} 
              title="Saltar pregunta (Modo Evaluador)"
            >
              <span>⏭️ Saltar</span>
            </button>
          )}
          {(!isChallenge || isEvaluatorMode) && (
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
            {isChallenge && (
              <>
                <span className="f3-badge-divider">|</span>
                <span className="f3-badge-errors animate-pulse" style={{ color: (progreso.intentos - progreso.aciertos) >= maxErroresPermitidos ? '#EF4444' : '#F59E0B', fontWeight: 800 }}>
                  ERRORES: {progreso.intentos - progreso.aciertos}/{maxErroresPermitidos}
                </span>
              </>
            )}
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
                  <div className="f3-question-text" dangerouslySetInnerHTML={{ __html: pregunta.enunciado }} />
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
                onNumberPress={(num) => !(feedback.visible && feedback.esCorrecta) && setRespuesta(p => p.length < 10 ? p + num : p)}
                onDelete={() => !(feedback.visible && feedback.esCorrecta) && setRespuesta(p => p.slice(0, -1))}
                onSubmit={() => !(feedback.visible && feedback.esCorrecta) && handleSubmit()}
                disabled={feedback.visible && feedback.esCorrecta}
                submitDisabled={respuesta.length === 0}
              />
            </div>
          )}

          {pregunta.tipo_pregunta === 'multiple_opcion' && pregunta.alternativas && (
            <motion.div animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} className={`f3-question-card ${shaking ? 'shake-error' : ''} max-w-3xl mx-auto w-full`} style={{ borderColor: feedback.visible ? (feedback.esCorrecta ? '#10B981' : '#EF4444') : '#1e293b' }}>
              <div className="f3-question-text-box mb-8">
                <div className="f3-question-text" dangerouslySetInnerHTML={{ __html: pregunta.enunciado }} />
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
                  {feedback.visible ? ((feedback.esCorrecta || isChallenge) ? 'Siguiente Pregunta →' : 'Intentar de nuevo ↺') : 'Confirmar Respuesta'}
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
            onAbort={() => navigate('/welcome-fase3')} 
            isInitialReading={isInitialReading} 
            userAvatar={userAvatar} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEarlyExit && (
          <Fase3EarlyExitModal 
            moduleColor={moduleColor} 
            moduloId={moduloId}
            nivelId={nivelId}
            aciertos={progreso.aciertos}
            intentos={progreso.intentos}
            onClose={() => navigate('/welcome-fase3')} 
          />
        )}
        {showCompletion && (
          <Fase3CompletionModal 
            moduloId={moduloId} 
            nivelId={nivelId} 
            isChallenge={isChallenge} 
            moduleColor={moduleColor} 
            progreso={progreso} 
            onClose={() => navigate('/welcome-fase3')} 
          />
        )}
        {showGraduation && (
          <Fase3PhaseGraduationModal
            studentName={studentName}
            onClose={async () => {
              try {
                await graduateFase3();
              } catch (e) {
                console.error(e);
              }
              setShowGraduation(false);
              navigate('/map');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
