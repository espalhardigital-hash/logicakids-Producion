/**
 * Fase2GameScreen.tsx
 * ─────────────────────────────────────────────────────────────
 * Pantalla de juego adaptativa para los 5 módulos de Fase 2.
 *   - Módulos 1-3: Entrada numérica
 *   - Módulo  4  : Selección de tokens (subrayador)
 *   - Módulo  5  : Pasos encadenados (paso 1 → congelado → paso 2)
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './Fase2Styles.css';
import { getFase2Question, submitFase2Answer, getFase2Reading, closeFase2Rescate } from './Fase2Service';
import { Fase2TheoryModal } from './Fase2TheoryModal';
import { Fase2MirrorModal } from './Fase2MirrorModal';
import type {
  Fase2Pregunta,
  Fase2AnswerResult,
  Fase2Token,
  Fase2Lectura,
} from './Fase2Types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Delete, ArrowRight, Trophy, Star, Target, Award, Compass, Clock } from 'lucide-react';
import { getCurrentUserFull } from '../../services/storageService';
import { useNavigate } from 'react-router-dom';

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
  4: 'Constructor de Soluciones',
};

const MODULE_COLORS: Record<number, string> = {
  1: '#10B981', 2: '#8B5CF6', 3: '#F59E0B', 4: '#EC4899',
};

interface Props {
  moduloId: number;
  nivelId: number;
  onComplete: () => void;
  onBack: () => void;
}

interface FeedbackState {
  visible: boolean;
  esCorrecta: boolean;
  isError?: boolean;
  errorMessage?: string;
  resultado?: Fase2AnswerResult;
}

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

// ─── Componente: Modal de Rescate (Explicación Profunda) ──────────────────

const Fase2RescateModal: React.FC<{
  explicacion: any;
  moduleColor: string;
  onClose: () => void;
}> = ({ explicacion, moduleColor, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="f2-feedback-overlay"
      style={{ zIndex: 1000 }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="f2-feedback-card rescate glass-card"
        style={{ 
          maxWidth: '550px', 
          width: '90%', 
          padding: '40px',
          borderTop: `6px solid ${moduleColor}`
        }}
      >
        <div className="f2-feedback-emoji" style={{ fontSize: '3rem', marginBottom: '20px' }}>💡</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>
          {explicacion.titulo || '¡Vamos a repasar!'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px', fontSize: '1.1rem' }}>
          No te preocupes, el Bucle Espejo está aquí para ayudarte a entender el concepto.
        </p>

        <div className="f2-rescate-pasos" style={{ textAlign: 'left', marginBottom: '40px' }}>
          {explicacion.pasos?.map((p: any, idx: number) => (
            <div key={idx} style={{ 
              display: 'flex', 
              gap: '15px', 
              marginBottom: '15px', 
              background: 'rgba(255,255,255,0.03)',
              padding: '15px',
              borderRadius: '12px',
              borderLeft: `4px solid ${moduleColor}80`
            }}>
              <span style={{ fontWeight: 900, color: moduleColor }}>{p.orden || (idx + 1)}.</span>
              <span style={{ color: '#fff', lineHeight: 1.4 }}>{p.texto}</span>
            </div>
          ))}
        </div>

        <button
          className="f2-submit-btn"
          onClick={onClose}
          style={{
            display: 'block',
            width: '100%',
            padding: '18px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`,
            color: 'white',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${moduleColor}30`
          }}
        >
          ¡Entendido, continuar! →
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente: Modal de Salida Temprana (Early Exit) ─────────────────────

const Fase2EarlyExitModal: React.FC<{
  moduleColor: string;
  onClose: () => void;
}> = ({ moduleColor, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="f2-feedback-overlay"
      style={{ zIndex: 1000 }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="f2-feedback-card early-exit glass-card"
        style={{ 
          maxWidth: '500px', 
          width: '90%', 
          padding: '40px',
          borderTop: '6px solid #EF4444',
          textAlign: 'center'
        }}
      >
        <div className="f2-feedback-emoji" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>🛡️</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
          ¡Desafío Incompleto!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '20px', fontSize: '1.1rem', lineHeight: 1.5 }}>
          Dado el número de errores acumulados, ya no es posible alcanzar el puntaje mínimo de aprobación (90%) para este desafío.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '30px', fontSize: '1rem', lineHeight: 1.5 }}>
          ¡No te preocupes! Los errores son una excelente oportunidad para aprender y mejorar. Repasa la teoría, practica un poco más en los niveles de entrenamiento y ¡vuelve a intentarlo! Tú puedes lograrlo. 💪🚀
        </p>

        <button
          className="f2-submit-btn"
          onClick={onClose}
          style={{
            display: 'flex',
            width: '100%',
            padding: '18px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`,
            color: 'white',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${moduleColor}30`,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Entendido, volver a intentar 👍
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente: Modal de Logros / Nivel Completado (Completion Modal) ───

const Fase2CompletionModal: React.FC<{
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
        titulo: '¡Héroe de la Fase 2! 🎉',
        mensaje: '¡Has dominado por completo todos los desafíos de la Fase 2! Tu agilidad de cálculo y razonamiento numérico son extraordinarios. ¡Prepárate para la Fase 3!',
        accion: 'Avanzar a Fase 3 🚀'
      };
    }
    
    if (isChallenge) {
      if (nivelId === 13) {
        return {
          titulo: '¡Módulo Dominado! 🏆',
          mensaje: '¡Increíble! Has superado el Desafío de Maestría y dominado el módulo al 100%. Sigue demostrando tu ingenio en el siguiente módulo de la Fase.',
          accion: 'Siguiente Módulo 🚀'
        };
      } else {
        return {
          titulo: '¡Desafío Superado! ⭐',
          mensaje: `¡Excelente precisión! Lograste superar este desafío con gran destreza. Prepárate para desbloquear la siguiente dificultad.`,
          accion: `Desafío ${nivelId - 9} 🚀`
        };
      }
    } else {
      const totalLevels = (moduloId === 2 || moduloId === 3) ? 4 : 3;
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

  // Framer Motion variants
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
      className="f2-feedback-overlay"
      style={{ zIndex: 1100 }}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="f2-feedback-card completion glass-card"
        style={{ 
          maxWidth: '550px', 
          width: '92%', 
          padding: '40px',
          borderTop: `6px solid ${moduleColor}`,
          textAlign: 'center'
        }}
      >
        {/* Corona / Trofeo Animado */}
        <motion.div 
          variants={itemVariants}
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="f2-feedback-emoji" 
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
          className="f2-submit-btn"
          onClick={onClose}
          style={{
            display: 'flex',
            width: '100%',
            padding: '18px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`,
            color: 'white',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${moduleColor}30`,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {rec.accion}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente: Modal de Graduación de Fase (Phase Graduation Modal) ──────

const Fase2PhaseGraduationModal: React.FC<{
  studentName: string;
  onClose: () => void;
}> = ({ studentName, onClose }) => {
  // Framer motion variants
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
      className="f2-feedback-overlay"
      style={{ zIndex: 1200, background: 'rgba(7, 11, 20, 0.95)' }}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="f2-feedback-card graduation glass-card"
        style={{ 
          maxWidth: '650px', 
          width: '92%', 
          padding: '45px 35px',
          borderTop: '6px solid #10B981',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.15)',
          overflowY: 'auto',
          maxHeight: '90vh'
        }}
      >
        <motion.div 
          variants={itemVariants}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 360] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          className="f2-feedback-emoji" 
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
          ¡Has completado y dominado con éxito toda la **Fase 2: Desarrollo Numérico y Razonamiento**! Eres oficialmente un héroe matemático de LogicaKids Pro. 🛡️✨
        </motion.p>

        {/* Infografía: El Gran Viaje de Fase 2 */}
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
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', marginBottom: '24px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} style={{ color: '#10B981' }} />
            Tu Mapa de Ruta Conquistado
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10px' }}>
            {/* Línea Conectora */}
            <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '4px', background: 'linear-gradient(90deg, #10B981, #8B5CF6, #F59E0B, #EC4899)', zIndex: 0, opacity: 0.6, borderRadius: '2px' }} />

            {/* Nodo 1: Mód 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 1</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Gimnasio Mental</span>
            </div>

            {/* Nodo 2: Mód 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 2</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Tablas en Acción</span>
            </div>

            {/* Nodo 3: Mód 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 3</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Tienda</span>
            </div>

            {/* Nodo 4: Mód 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '22%' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)', border: '3px solid #fff' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', marginTop: '10px', textAlign: 'center' }}>Módulo 4</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2px' }}>Constructor</span>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas Históricas del Logro */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px', 
            marginBottom: '40px' 
          }}
        >
          {/* Card 1: Niveles Superados */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Award size={36} style={{ color: '#10B981' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>26 / 26</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Niveles Superados</div>
            </div>
          </div>

          {/* Card 2: Módulos Dominados */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Trophy size={36} style={{ color: '#F59E0B' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>4 / 4</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Módulos Dominados</div>
            </div>
          </div>

          {/* Card 3: Ejercicios Resueltos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Star size={36} style={{ color: '#8B5CF6' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>300+</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Ejercicios Logrados</div>
            </div>
          </div>

          {/* Card 4: Conceptos Dominados */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px' }}>
            <Target size={36} style={{ color: '#EC4899' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>12+</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Conceptos Clave</div>
            </div>
          </div>
        </motion.div>

        {/* Botón de Lanzamiento de Fase 3 */}
        <motion.button
          variants={itemVariants}
          className="f2-submit-btn"
          onClick={onClose}
          style={{
            display: 'flex',
            width: '100%',
            padding: '20px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #10B981cc, #10B981)',
            color: 'white',
            border: 'none',
            fontWeight: 900,
            fontSize: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          ¡Avanzar al Siguiente Nivel / Fase 3! 🚀
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────

const Fase2GameScreen: React.FC<Props> = ({ moduloId, nivelId, onComplete, onBack }) => {
  // 1-22: State Hooks
  const [showSplash, setShowSplash] = useState(true);
  const [pregunta, setPregunta]   = useState<Fase2Pregunta | null>(null);
  const [loading, setLoading]     = useState(true);
  const [respuesta, setRespuesta] = useState('');
  const [tokensSeleccionados, setTokensSeleccionados] = useState<number[]>([]);
  const [selectedAltId, setSelectedAltId] = useState<number | null>(null);
  const [paso, setPaso]           = useState<1 | 2>(1);
  const [paso1Valor, setPaso1Valor] = useState<string | null>(null);
  const [feedback, setFeedback]   = useState<FeedbackState>({ visible: false, esCorrecta: false });
  const [isMockMode, setIsMockMode] = useState(false);
  const [progreso, setProgreso]   = useState({ aciertos: 0, intentos: 0, porcentaje: 0 });
  const [shaking, setShaking]     = useState(false);
  const [timer, setTimer]         = useState<number | null>(null);
  const [maxTimer, setMaxTimer]   = useState<number>(1);
  const [showReading, setShowReading] = useState(false);
  const [isInitialReading, setIsInitialReading] = useState(true);
  const [readingData, setReadingData] = useState<Fase2Lectura | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [showRescate, setShowRescate] = useState(false);
  const [showMirrorModal, setShowMirrorModal] = useState(false);
  const [mirrorPregunta, setMirrorPregunta] = useState<Fase2Pregunta | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | undefined>(undefined);
  const [lastQuestionEnunciado, setLastQuestionEnunciado] = useState<string | undefined>(undefined);
  const [lastWrongAnswer, setLastWrongAnswer] = useState<string | undefined>(undefined);
  const [showEarlyExit, setShowEarlyExit] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isFaseCompletada, setIsFaseCompletada] = useState(false);
  const [studentName, setStudentName] = useState('Estudiante');
  const [showGraduation, setShowGraduation] = useState(false);

  // 23: Navigation
  const navigate = useNavigate();

  // 24-26: Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoized values
  const isChallenge = useMemo(() => moduloId === 99 || (nivelId >= 11 && nivelId <= 13), [moduloId, nivelId]);
  const moduleName  = useMemo(() => MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`, [moduloId]);
  const moduleColor = useMemo(() => MODULE_COLORS[moduloId] ?? '#10B981', [moduloId]);
  // maxAciertos is dynamic — set by Admin via ConfiguracionProgreso, updated from API response
  const [maxAciertos, setMaxAciertos] = useState<number>(moduloId === 99 ? 20 : (nivelId >= 11 && nivelId <= 13 ? (nivelId === 13 ? 10 : 25) : 15));
  const barWidth    = useMemo(() => Math.min(100, (progreso.aciertos / maxAciertos) * 100), [progreso.aciertos, maxAciertos]);

  // Premium splash memos
  const challengeName = useMemo(() => {
    if (moduloId === 99) return "Maestría Final";
    if (nivelId === 11) return "Desafío 1: Estándar";
    if (nivelId === 12) return "Desafío 2: Avanzado";
    if (nivelId === 13) return "Desafío Final: Maestría";
    return `Desafío - Nivel ${nivelId}`;
  }, [moduloId, nivelId]);

  const displayModuleName = useMemo(() => {
    if (moduloId === 99) return "Desafío Mixto de la Fase 2";
    return MODULE_NAMES[moduloId] ?? `Módulo ${moduloId}`;
  }, [moduloId]);

  const displayTimeLimit = useMemo(() => {
    if (moduloId === 99) return 90;
    if (moduloId === 3 || moduloId === 4) {
      return nivelId === 11 ? 30 : nivelId === 12 ? 45 : 60;
    }
    return nivelId === 11 ? 25 : nivelId === 12 ? 40 : 50;
  }, [moduloId, nivelId]);

  const displayQuestionsCount = maxAciertos;

  const [countdown, setCountdown] = useState(8);

  // 27: Splash Effect
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

      // Keydown override to dismiss splash instantly
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

  // 28: User Profile Effect
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserFull();
        if (user?.username) setStudentName(user.username);
        if (user?.avatar) setUserAvatar(user.avatar);
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  // 29: loadPregunta
  const loadPregunta = useCallback(async (isFirstLoad: boolean = false, resetProgress: boolean = false) => {
    if (isFirstLoad) setLoading(true);
    
    setRespuesta('');
    setTokensSeleccionados([]);
    setSelectedAltId(null);
    setPaso(1);
    setPaso1Valor(null);
    
    try {
      const data = await getFase2Question(moduloId, nivelId, resetProgress);
      
      setProgreso({
        aciertos: data.aciertos_acumulados,
        intentos: data.intentos_totales,
        porcentaje: data.porcentaje_actual,
      });

      if (data.datos_numericos?.es_espejo) {
        setMirrorPregunta(data);
        setShowMirrorModal(true);
        setPregunta(data); // <-- FIX: Set it to data so the background UI renders behind the modal
        setLoading(false);
        return;
      }

      setPregunta(data);
      setShowMirrorModal(false);
      setMirrorPregunta(null);
      setIsMockMode(false);
      // Sync dynamic required count from backend config
      if (data.cantidad_requerida) setMaxAciertos(data.cantidad_requerida);
      
      if (isChallenge) {
        const fallbackLimit = moduloId === 99 ? 90 : (moduloId === 3 || moduloId === 4 ? (nivelId === 11 ? 30 : nivelId === 12 ? 45 : 60) : (nivelId === 11 ? 25 : nivelId === 12 ? 40 : 50));
        const limit = data.tiempo_limite_segundos || fallbackLimit;
        setTimer(limit);
        setMaxTimer(limit);
      } else if (data.tiene_cronometro && data.tiempo_limite_segundos) {
        setTimer(data.tiempo_limite_segundos);
        setMaxTimer(data.tiempo_limite_segundos);
      } else {
        setTimer(null);
      }
    } catch {
      setIsMockMode(true);
      const mockQ = MOCK_PREGUNTA(moduloId, nivelId);
      setPregunta(mockQ);
      if (isChallenge) {
        const limit = moduloId === 99 ? 90 : (moduloId === 3 || moduloId === 4 ? (nivelId === 11 ? 30 : nivelId === 12 ? 45 : 60) : (nivelId === 11 ? 25 : nivelId === 12 ? 40 : 50));
        setTimer(limit);
        setMaxTimer(limit);
      } else {
        setTimer(null);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [moduloId, nivelId, isChallenge]);

  // 30: handleFeedbackClose
  const handleFeedbackClose = useCallback(() => {
    if (feedback.resultado?.early_exit) {
      setFeedback({ visible: false, esCorrecta: false });
      setShowEarlyExit(true);
      return;
    }

    if (feedback.isError) {
      setFeedback({ visible: false, esCorrecta: false });
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    if (feedback.resultado?.fase_completada) {
      setFeedback({ visible: false, esCorrecta: false });
      setShowGraduation(true);
      return;
    }

    if (feedback.resultado?.bloque_completado) {
      setFeedback({ visible: false, esCorrecta: false });
      setShowCompletion(true);
      return;
    }

    setFeedback({ visible: false, esCorrecta: false });

    if (feedback.esCorrecta) {
      if (pregunta?.tipo_pregunta === 'constructor_soluciones_chained') {
        if (feedback.resultado?.paso_aprobado === 2 || feedback.resultado?.paso_approved === 2) {
          loadPregunta();
        } else {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      } else {
        loadPregunta();
      }
    } else {
      if (feedback.resultado?.soporte_avanzado) {
        setShowRescate(true);
      } else if (isChallenge) { 
        loadPregunta(); 
      } else if (feedback.resultado?.es_espejo) {
        setLastCorrectAnswer(feedback.resultado?.respuesta_correcta);
        loadPregunta();
      } else {
        setRespuesta('');
        setTokensSeleccionados([]);
        setSelectedAltId(null);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [feedback, onBack, onComplete, pregunta, paso, loadPregunta, isChallenge, navigate, setShowEarlyExit, setShowCompletion, setIsFaseCompletada, setShowGraduation]);

  // 31: stopTimer
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  // 32: handleSubmit
  const handleSubmit = useCallback(async () => {
    if (!pregunta) return;
    if (feedback.visible) {
      handleFeedbackClose();
      return;
    }

    stopTimer();

    const payload = {
      modulo_id:  moduloId,
      nivel_id:   nivelId,
      pregunta_id: pregunta.id,
      respuesta_dada:          pregunta.tipo_pregunta === 'respuesta_numerica' || pregunta.tipo_pregunta === 'constructor_soluciones_chained' ? respuesta.trim() : undefined,
      alternativa_id:          pregunta.tipo_pregunta === 'multiple_opcion' ? selectedAltId ?? undefined : undefined,
      tokens_seleccionados:    pregunta.tipo_pregunta === 'subrayado_tokens' ? tokensSeleccionados : undefined,
      paso_numero:             pregunta.tipo_pregunta === 'constructor_soluciones_chained' ? paso : undefined,
    };

    try {
      const resultado = await submitFase2Answer(payload);
      setProgreso({
        aciertos:   resultado.aciertos_acumulados,
        intentos:   resultado.intentos_totales,
        porcentaje: resultado.porcentaje_actual,
      });

      if (resultado.early_exit) {
        setFeedback({ visible: true, esCorrecta: false, resultado });
        return;
      }

      if (resultado.es_correcta) {
        if (pregunta.tipo_pregunta === 'constructor_soluciones_chained' && paso === 1) {
          setPaso1Valor(resultado.valor_paso1_congelado || respuesta);
          setPaso(2);
          setRespuesta('');
          setFeedback({ visible: true, esCorrecta: true, resultado });
        } else {
          setFeedback({ visible: true, esCorrecta: true, resultado });
          if (resultado.fase_completada || resultado.bloque_completado) {
            // Wait for feedback display
          } else {
            setTimeout(() => {
              setFeedback({ visible: false, esCorrecta: false });
              loadPregunta();
            }, 500);
          }
        }
      } else {
        setShaking(true);
        setTimeout(() => setShaking(false), 450);
        setFeedback({ visible: true, esCorrecta: false, resultado });
        if (!isChallenge && resultado.es_espejo) {
          setLastQuestionEnunciado(pregunta.enunciado);
          setLastWrongAnswer(respuesta || String(selectedAltId || ''));
        }
        if (isChallenge) {
          setTimeout(() => handleFeedbackClose(), 1500);
        }
      }
    } catch (error: any) {
      setFeedback({
        visible: true,
        esCorrecta: false,
        isError: true,
        errorMessage: error.message || 'Error al enviar respuesta',
      });
    }
  }, [pregunta, moduloId, nivelId, respuesta, tokensSeleccionados, paso, selectedAltId, loadPregunta, feedback.visible, handleFeedbackClose, stopTimer, isChallenge]);

  // 33: Initial Load Effect
  useEffect(() => { loadPregunta(true, false); }, [loadPregunta]);

  // 34: handleOpenReading
  const handleOpenReading = useCallback(async () => {
    if (isChallenge) return;
    setIsInitialReading(false);
    try {
      const data = await getFase2Reading(moduloId, nivelId);
      setReadingData(data);
      setShowReading(true);
    } catch {
      setReadingData(MOCK_LECTURA(moduloId, nivelId));
      setShowReading(true);
    }
  }, [moduloId, nivelId, isChallenge]);

  // 35: checkAndShowReading Effect
  useEffect(() => {
    if (isChallenge) {
      setShowReading(false);
      return;
    }
    const check = async () => {
      setIsInitialReading(true);
      try {
        const data = await getFase2Reading(moduloId, nivelId);
        setReadingData(data);
        setShowReading(true);
      } catch {
        setReadingData(MOCK_LECTURA(moduloId, nivelId));
        setShowReading(true);
      }
    };
    check();
  }, [moduloId, nivelId, isChallenge]);

  // 36: Timer Effect
  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) { 
      handleSubmit(); 
      return; 
    }
    timerRef.current = setInterval(() => setTimer(t => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer, handleSubmit]);


  // ── Helpers ───────────────────────────────────────────────────────────────

  const toggleToken = (token: Fase2Token) => {
    setTokensSeleccionados(prev =>
      prev.includes(token.id) ? prev.filter(id => id !== token.id) : [...prev, token.id]
    );
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="f2-game-screen">
      {/* SplashScreen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            transition={{ duration: 0.3 }}
            className="f2-start-splash-overlay" 
            onClick={() => setShowSplash(false)}
          >
            {isChallenge ? (
              <motion.div 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }} 
                className="f2-splash-container-premium"
              >
                <div className="f2-splash-badge-premium" style={{ color: moduleColor }}>
                  ¡Desafío Especial!
                </div>
                <h1 className="f2-splash-title-premium">{challengeName}</h1>
                
                {/* Metadatos en cuadrícula premium */}
                <div className="f2-splash-metadata-grid">
                  <div className="f2-splash-meta-card">
                    <div className="f2-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      {moduloId === 99 ? (
                        <Trophy size={22} style={{ color: '#F59E0B' }} />
                      ) : (
                        <Compass size={22} style={{ color: moduleColor }} />
                      )}
                    </div>
                    <span className="f2-splash-meta-label">Módulo</span>
                    <span className="f2-splash-meta-value">{displayModuleName}</span>
                  </div>

                  <div className="f2-splash-meta-card">
                    <div className="f2-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      <Target size={22} style={{ color: moduleColor }} />
                    </div>
                    <span className="f2-splash-meta-label">Preguntas</span>
                    <span className="f2-splash-meta-value">{displayQuestionsCount} a superar</span>
                  </div>

                  <div className="f2-splash-meta-card">
                    <div className="f2-splash-meta-icon" style={{ background: `${moduleColor}15` }}>
                      <Clock size={22} style={{ color: moduleColor }} />
                    </div>
                    <span className="f2-splash-meta-label">Tiempo</span>
                    <span className="f2-splash-meta-value">{displayTimeLimit}s / pregunta</span>
                  </div>
                </div>

                {/* Animación de cuenta regresiva circular */}
                <div className="f2-splash-countdown-wrapper">
                  <svg className="f2-splash-countdown-svg" viewBox="0 0 100 100">
                    <circle className="f2-splash-countdown-bg" cx="50" cy="50" r="45" />
                    <motion.circle 
                      className="f2-splash-countdown-progress" 
                      cx="50" cy="50" r="45"
                      initial={{ pathLength: 1 }}
                      animate={{ pathLength: 0 }}
                      transition={{ duration: 8, ease: 'linear' }}
                      style={{ stroke: moduleColor }}
                    />
                  </svg>
                  <div className="f2-splash-countdown-number">{countdown}</div>
                </div>

                <div className="f2-splash-hint-premium mt-4">
                  Haz clic o presiona cualquier tecla para comenzar ahora
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 }} 
                className="f2-splash-content"
              >
                <div className="f2-splash-badge" style={{ color: moduleColor }}>
                  ENTRENAMIENTO LIBRE
                </div>
                <h1 className="f2-splash-title">{moduleName}</h1>
                <div className="f2-splash-level" style={{ background: `${moduleColor}20`, borderColor: `${moduleColor}40` }}>
                  {`NIVEL ${nivelId}`}
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }} 
                  transition={{ duration: 1.5, repeat: Infinity }} 
                  className="f2-splash-hint"
                >
                  Toca para comenzar
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="f2-loading">
          <div className="f2-spinner" style={{ borderTopColor: moduleColor }} />
          <span>Cargando pregunta…</span>
        </div>
      ) : !pregunta && !showMirrorModal && !showReading ? (
        <div className="f2-loading">
          <div className="f2-spinner" style={{ borderTopColor: moduleColor }} />
          <span>Preparando siguiente desafío…</span>
        </div>
      ) : pregunta ? (
        <>
          <AnimatePresence>
            {feedback.visible && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`f2-ambient-glow ${feedback.esCorrecta ? 'correct' : 'incorrect'}`}
              />
            )}
          </AnimatePresence>

          <header className="f2-game-header-modern">
            <button className="f2-header-abort-btn" onClick={onBack} title="Salir del nivel"><IconArrowLeft /></button>
            <div className="f2-header-right-group">
              {!isChallenge && (
                <button className="f2-view-theory-btn-modern" onClick={handleOpenReading} title="Ver teoría">
                  <BookOpen size={14} style={{ marginRight: '4px' }} /><span>Teoría</span>
                </button>
              )}
              <div className="f2-header-badge-pill">
                <span className="f2-badge-module" style={{ color: moduleColor }}>{moduleName.toUpperCase()}</span>
                <span className="f2-badge-divider">|</span>
                <span className="f2-badge-level">FASE 2</span>
                <span className="f2-badge-divider">|</span>
                <span className="f2-badge-level">MÓDULO {moduloId === 99 ? 'MAESTRÍA' : moduloId}</span>
                <span className="f2-badge-divider">|</span>
                <span className="f2-badge-level">NIVEL {nivelId}</span>
                <span className="f2-badge-divider">|</span>
                <span className="f2-badge-challenge">{isChallenge ? 'DESAFÍO' : 'PROGRESO'} {progreso.aciertos}/{maxAciertos}</span>
                {timer !== null && (
                  <><span className="f2-badge-divider">|</span><span className="f2-badge-timer" style={{ color: timer <= 5 ? '#EF4444' : '#ffffff' }}>{timer}S</span></>
                )}
              </div>
            </div>
            <div className="f2-full-width-progress-bar">
              <div className="f2-full-width-progress-fill" style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${moduleColor}80, ${moduleColor})` }} />
            </div>
            {timer !== null && (
              <div className="f2-timer-progress-bar" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <div className="f2-full-width-progress-fill" style={{ width: `${(timer / maxTimer) * 100}%`, background: timer <= 5 ? '#EF4444' : 'linear-gradient(90deg, #3B82F6, #10B981)', height: '100%' }} />
              </div>
            )}
          </header>

          <main className="f2-game-body">
            <div className="f2-game-layout-wrap">
              <motion.div animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}
                className={`f2-question-card ${shaking ? 'shake-error' : ''}`}
                style={{ boxShadow: feedback.visible ? (feedback.esCorrecta ? '0 0 0 4px rgba(16, 185, 129, 0.5)' : '0 0 0 4px rgba(239, 68, 68, 0.5)') : 'none' }}
              >
                {/* Contenido adaptativo */}
                {pregunta.tipo_pregunta === 'respuesta_numerica' && (
                  <div className="flex flex-col h-full justify-between">
                    <div className="f2-question-text-box"><div className={(pregunta.enunciado || '').length < 25 ? "f2-question-text short" : "f2-question-text"}>{pregunta.enunciado}</div></div>
                    <div className="f2-numeric-input-wrap">
                      <div className={`f2-custom-input-box ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : 'focused'}`} onClick={() => inputRef.current?.focus()}>
                        <input ref={inputRef} type="text" value={respuesta} onChange={e => !feedback.visible && /^[0-9,.\-]*$/.test(e.target.value) && setRespuesta(e.target.value)} onKeyDown={handleKeyDown} className="f2-hidden-input" autoFocus autoComplete="off" inputMode="none" />
                        <span className="f2-input-value-text">{feedback.visible ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) : (respuesta || '?')}</span>
                        {feedback.visible && (
                          <div className="f2-input-status-elements">
                            {feedback.esCorrecta ? <div className="f2-status-badge correct"><svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg></div> :
                              <><span className="f2-era-pill">Era: {feedback.resultado?.respuesta_correcta}</span><div className="f2-status-badge incorrect"><svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></div></>
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón de Confirmar / Continuar inline en la tarjeta */}
                    <button 
                      className="f2-submit-btn mt-6 w-full" 
                      onClick={handleSubmit} 
                      disabled={!feedback.visible && !respuesta.trim()} 
                      style={{ 
                        background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`, 
                        padding: '16px', 
                        borderRadius: '16px', 
                        color: '#fff', 
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {feedback.visible ? 'Continuar →' : 'Confirmar'}
                    </button>

                    {!isChallenge && <div className="f2-scores-container"><div className="f2-score-box correct"><span className="f2-score-label">CORRECTAS</span><span className="f2-score-value">{progreso.aciertos}</span></div><div className="f2-score-box incorrect"><span className="f2-score-label">ERRORES</span><span className="f2-score-value">{feedback.resultado?.errores_sesion ?? (progreso.intentos - progreso.aciertos)}</span></div></div>}
                  </div>
                )}
                {/* Otros tipos (constructor, tokens, etc) simplificados para brevedad pero funcionales */}
                {pregunta.tipo_pregunta === 'multiple_opcion' && (
                  <div className="flex flex-col h-full justify-between">
                     <div className="f2-question-text-box"><div className="f2-question-text">{pregunta.enunciado}</div></div>
                     <div className="grid gap-3 mt-6">
                       {pregunta.alternativas?.map(alt => (
                         <button key={alt.id} disabled={feedback.visible} onClick={() => setSelectedAltId(alt.id)}
                           className={`f2-mc-option-btn ${selectedAltId === alt.id ? 'selected' : ''}`}
                           style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: selectedAltId === alt.id ? `${moduleColor}20` : 'rgba(255,255,255,0.02)', textAlign: 'left', color: '#fff' }}
                         >
                           {alt.texto}
                         </button>
                       ))}
                     </div>
                     <button 
                       className="f2-submit-btn mt-6 w-full" 
                       onClick={handleSubmit} 
                       disabled={!feedback.visible && selectedAltId === null} 
                       style={{ 
                         background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`, 
                         padding: '16px', 
                         borderRadius: '16px', 
                         color: '#fff', 
                         fontWeight: 800,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         gap: '8px'
                       }}
                     >
                        {feedback.visible ? 'Continuar →' : 'Confirmar'}
                     </button>
                  </div>
                )}
                {pregunta.tipo_pregunta === 'constructor_soluciones_chained' && (
                  <div className="flex flex-col h-full justify-between gap-4">
                    <div className="f2-question-text-box">
                      <div className="f2-question-text">{cleanEnunciado(pregunta.enunciado)}</div>
                    </div>

                    <div className="flex flex-col gap-4 my-2">
                      {/* Paso 1 */}
                      <div 
                        className={`p-4 rounded-2xl border transition-all duration-300 ${
                          paso === 1 
                            ? 'bg-white/5 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]' 
                            : 'bg-green-500/5 border-green-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                              paso === 1 
                                ? 'bg-pink-500/20 text-pink-400' 
                                : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            Paso 1: {pregunta.pasos_encadenados?.[0]?.titulo || 'Cálculo Inicial'}
                          </span>
                          {paso > 1 && (
                            <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
                              ✓ Completado
                            </span>
                          )}
                        </div>
                        <p className="text-white/80 text-sm mb-3">
                          {pregunta.pasos_encadenados?.[0]?.descripcion || 'Resuelve el primer paso.'}
                        </p>
                        
                        {paso === 1 ? (
                          <div className={`f2-custom-input-box focused ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : ''}`} onClick={() => inputRef.current?.focus()}>
                            <input 
                              ref={inputRef} 
                              type="text" 
                              value={respuesta} 
                              onChange={e => !feedback.visible && /^[0-9,.\-]*$/.test(e.target.value) && setRespuesta(e.target.value)} 
                              onKeyDown={handleKeyDown} 
                              className="f2-hidden-input" 
                              autoFocus 
                              autoComplete="off" 
                              inputMode="none" 
                            />
                            <span className="f2-input-value-text">{feedback.visible ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) : (respuesta || '?')}</span>
                            {feedback.visible && (
                              <div className="f2-input-status-elements">
                                {feedback.esCorrecta ? (
                                  <div className="f2-status-badge correct">
                                    <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                                  </div>
                                ) : (
                                  <>
                                    <span className="f2-era-pill">Era: {feedback.resultado?.respuesta_correcta}</span>
                                    <div className="f2-status-badge incorrect">
                                      <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="f2-custom-input-box correct opacity-80 pointer-events-none">
                            <span className="f2-input-value-text">{paso1Valor}</span>
                            <div className="f2-input-status-elements">
                              <div className="f2-status-badge correct">
                                <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Paso 2 */}
                      {paso === 2 && (
                        <div 
                          className="p-4 rounded-2xl border border-pink-500/30 bg-white/5 shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-pink-500/20 text-pink-400 font-black">
                              Paso 2: {pregunta.pasos_encadenados?.[1]?.titulo || 'Resultado Final'}
                            </span>
                          </div>
                          <p className="text-white/80 text-sm mb-3">
                            {pregunta.pasos_encadenados?.[1]?.descripcion || 'Resuelve el paso final.'}
                          </p>

                          <div className={`f2-custom-input-box focused ${feedback.visible ? (feedback.esCorrecta ? 'correct' : 'incorrect') : ''}`} onClick={() => inputRef.current?.focus()}>
                            <input 
                              ref={inputRef} 
                              type="text" 
                              value={respuesta} 
                              onChange={e => !feedback.visible && /^[0-9,.\-]*$/.test(e.target.value) && setRespuesta(e.target.value)} 
                              onKeyDown={handleKeyDown} 
                              className="f2-hidden-input" 
                              autoFocus 
                              autoComplete="off" 
                              inputMode="none" 
                            />
                            <span className="f2-input-value-text">{feedback.visible ? (feedback.esCorrecta ? (feedback.resultado?.respuesta_correcta || respuesta) : (respuesta || '?')) : (respuesta || '?')}</span>
                            {feedback.visible && (
                              <div className="f2-input-status-elements">
                                {feedback.esCorrecta ? (
                                  <div className="f2-status-badge correct">
                                    <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                                  </div>
                                ) : (
                                  <>
                                    <span className="f2-era-pill">Era: {feedback.resultado?.respuesta_correcta}</span>
                                    <div className="f2-status-badge incorrect">
                                      <svg className="f2-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón de Confirmar / Continuar inline en la tarjeta */}
                    <button 
                      className="f2-submit-btn mt-6 w-full" 
                      onClick={handleSubmit} 
                      disabled={!feedback.visible && !respuesta.trim()} 
                      style={{ 
                        background: `linear-gradient(135deg, ${moduleColor}cc, ${moduleColor})`, 
                        padding: '16px', 
                        borderRadius: '16px', 
                        color: '#fff', 
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {feedback.visible ? 'Continuar →' : 'Confirmar'}
                    </button>

                    {!isChallenge && <div className="f2-scores-container"><div className="f2-score-box correct"><span className="f2-score-label">CORRECTAS</span><span className="f2-score-value">{progreso.aciertos}</span></div><div className="f2-score-box incorrect"><span className="f2-score-label">ERRORES</span><span className="f2-score-value">{feedback.resultado?.errores_sesion ?? (progreso.intentos - progreso.aciertos)}</span></div></div>}
                  </div>
                )}
                {/* Fallback */}
                {pregunta.tipo_pregunta === 'subrayado_tokens' && (
                   <div className="flex flex-col h-full items-center justify-center p-10 text-center">
                     <p className="text-xl font-bold mb-4">Módulo en Construcción</p>
                     <p className="opacity-70">El tipo {pregunta.tipo_pregunta} estará disponible en la próxima actualización.</p>
                     <button className="mt-8 px-6 py-3 bg-white/10 rounded-xl" onClick={loadPregunta}>Saltar pregunta</button>
                   </div>
                )}
              </motion.div>

              {/* Teclado Numérico */}
              {(pregunta.tipo_pregunta === 'respuesta_numerica' || pregunta.tipo_pregunta === 'constructor_soluciones_chained') && (
                <motion.div variants={keypadVariants} initial="hidden" animate="show" className="w-full max-w-[320px] md:w-[320px] shrink-0 z-10 mx-auto md:mx-0 mt-4 md:mt-0">
                  <div className="flex flex-col gap-4 p-7 glass-card rounded-[3rem]">
                     <div className="grid grid-cols-3 gap-4">
                       {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                         <button key={num} onClick={() => handleKeypadInput(num.toString())} disabled={feedback.visible} className="aspect-square rounded-[1.5rem] bg-white/5 border border-white/10 text-4xl font-black text-white">{num}</button>
                       ))}
                       <button onClick={() => handleKeypadInput('.')} disabled={feedback.visible} className="aspect-square rounded-[1.5rem] bg-white/5 border border-white/10 text-4xl font-black text-white">.</button>
                       <button onClick={() => handleKeypadInput('0')} disabled={feedback.visible} className="aspect-square rounded-[1.5rem] bg-white/5 border border-white/10 text-4xl font-black text-white">0</button>
                       <button onClick={handleBackspace} disabled={feedback.visible} className="aspect-square rounded-[1.5rem] bg-red-500/10 text-red-400 flex items-center justify-center"><Delete size={28} /></button>
                     </div>
                     <button onClick={handleSubmit} disabled={!feedback.visible && !respuesta.trim()} className="w-full py-4 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center font-bold text-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                       {feedback.visible ? 'Continuar' : 'Confirmar'} <ArrowRight size={24} className="ml-2"/>
                     </button>
                  </div>
                </motion.div>
              )}
            </div>
          </main>
        </>
      ) : null}

      {/* Modals */}
      <AnimatePresence>
        {showReading && readingData && (
          <Fase2TheoryModal readingData={readingData} moduleColor={moduleColor} onClose={() => setShowReading(false)} onAbort={() => isInitialReading ? onBack() : setShowReading(false)} isInitialReading={isInitialReading} userAvatar={userAvatar} />
        )}
        {showRescate && feedback.resultado?.explicacion && (
          <Fase2RescateModal explicacion={feedback.resultado.explicacion} moduleColor={moduleColor} onClose={async () => {
            if (pregunta?.id) try { await closeFase2Rescate(moduloId, nivelId, pregunta.id); } catch(e){}
            setShowRescate(false); loadPregunta();
          }} />
        )}
        {showMirrorModal && mirrorPregunta && (
          <Fase2MirrorModal pregunta={mirrorPregunta} moduleColor={moduleColor} lastCorrectAnswer={lastCorrectAnswer} lastQuestionEnunciado={lastQuestionEnunciado} lastWrongAnswer={lastWrongAnswer} onClose={(res) => {
            if (res) {
              setProgreso({ aciertos: res.aciertos_acumulados, intentos: res.intentos_totales, porcentaje: res.porcentaje_actual });
              if (res.soporte_avanzado) { setFeedback({ visible: true, esCorrecta: false, resultado: res }); setShowRescate(true); setShowMirrorModal(false); }
              else { setShowMirrorModal(false); loadPregunta(); }
            } else setShowMirrorModal(false);
          }} />
        )}
        {showEarlyExit && (
          <Fase2EarlyExitModal moduleColor={moduleColor} onClose={() => { setShowEarlyExit(false); onBack(); }} />
        )}
        {showGraduation && (
          <Fase2PhaseGraduationModal studentName={studentName} onClose={() => { setShowGraduation(false); navigate('/map'); }} />
        )}
        {showCompletion && (
          <Fase2CompletionModal 
            moduloId={moduloId}
            nivelId={nivelId}
            isChallenge={isChallenge}
            moduleColor={moduleColor}
            progreso={{
              aciertos: progreso.aciertos,
              intentos: progreso.intentos,
              porcentaje: progreso.porcentaje
            }}
            onClose={() => {
              setShowCompletion(false);
              if (isFaseCompletada) {
                navigate('/map');
              } else {
                onComplete();
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Helpers de Desarrollo ──────────────────────────────────────────────────

function cleanEnunciado(enunciado: string): string {
  const qIndex = enunciado.lastIndexOf('¿');
  if (qIndex !== -1) {
    let cleanText = enunciado.substring(0, qIndex).trim();
    if (cleanText.endsWith(',')) {
      cleanText = cleanText.substring(0, cleanText.length - 1) + '.';
    }
    return cleanText;
  }
  return enunciado;
}

function MOCK_LECTURA(moduloId: number, nivelId: number): Fase2Lectura {
  return { modulo_id: moduloId, nivel_id: nivelId, titulo: `Nivel ${nivelId}`, parrafos: ["Cargando contenido..."], tip_pedagogico: "Atención al enunciado." };
}

function MOCK_PREGUNTA(moduloId: number, nivelId: number): Fase2Pregunta {
  return { id: 999, modulo_id: moduloId, nivel_id: nivelId, enunciado: "¿Cuánto es 2 + 2?", respuesta_correcta: "4", tipo_pregunta: 'respuesta_numerica', tiene_cronometro: false };
}

export default Fase2GameScreen;
