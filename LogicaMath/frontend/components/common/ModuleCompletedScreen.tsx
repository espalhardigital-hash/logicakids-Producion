import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target } from 'lucide-react';
import './ModuleCompletedScreen.css';

export interface ModuleCompletedScreenProps {
  points: number;
  precision: number;
  moduleName?: string;
  onContinue: () => void;
}

interface SparkleParticle {
  id: number;
  color: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const useCountUp = (end: number, duration: number = 800, delay: number = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let timerId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        timerId = window.requestAnimationFrame(step);
      }
    };

    const delayTimer = setTimeout(() => {
      timerId = window.requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (timerId) window.cancelAnimationFrame(timerId);
    };
  }, [end, duration, delay]);

  return count;
};

export const ModuleCompletedScreen: React.FC<ModuleCompletedScreenProps> = ({
  points,
  precision,
  moduleName = 'Módulo',
  onContinue
}) => {
  const animatedPoints = useCountUp(points, 1000, 1000);
  const animatedPrecision = useCountUp(precision, 1000, 1200);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);

  useEffect(() => {
    const colors = ['#FFC800', '#58CC02', '#FF5E97', '#84D8FF', '#FF8E53', '#FFFFFF'];
    const pList: SparkleParticle[] = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24 + (Math.random() * 15 - 7.5);
      const distance = 80 + Math.random() * 60;
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      const y = Math.sin((angle * Math.PI) / 180) * distance;
      return {
        id: i,
        color: colors[i % colors.length],
        x,
        y,
        size: 6 + Math.random() * 10,
        delay: 0.3 + Math.random() * 0.4
      };
    });
    setParticles(pList);
  }, []);

  return (
    <div className="mcs-overlay">
      <div className="mcs-container">
        <div className="mcs-character-stage">
          <div className="mcs-sparks-container">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="mcs-sparkle"
                style={{
                  backgroundColor: p.color,
                  width: p.size,
                  height: p.size,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 0.9,
                  ease: 'easeOut',
                  delay: p.delay
                }}
              />
            ))}
          </div>

          <motion.div
            className="mcs-mascot-container"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 15,
              delay: 0.1
            }}
          >
            <svg
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <circle cx="80" cy="85" r="50" fill="#FF8E53" />
              <path d="M48 48C48 38 60 42 60 52C60 62 48 58 48 48Z" fill="#FFA372" />
              <path d="M48 48C50 40 58 43 58 50C58 57 50 55 48 48Z" fill="#FF5E97" />
              <path d="M112 48C112 38 100 42 100 52C100 62 112 58 112 48Z" fill="#FFA372" />
              <path d="M112 48C110 40 102 43 102 50C102 57 110 55 112 48Z" fill="#FF5E97" />
              <path d="M80 35L80 47" stroke="#333333" strokeWidth="4" strokeLinecap="round" />
              <path d="M72 38L75 46" stroke="#333333" strokeWidth="4" strokeLinecap="round" />
              <path d="M88 38L85 46" stroke="#333333" strokeWidth="4" strokeLinecap="round" />
              <path d="M30 80C36 80 40 83 42 85" stroke="#333333" strokeWidth="4" strokeLinecap="round" />
              <path d="M31 89C37 88 40 90 42 92" stroke="#333333" strokeWidth="4" strokeLinecap="round" />
              <path d="M130 80C124 80 120 83 118 85" stroke="#333333" strokeWidth="4" strokeLinecap="round" />
              <path d="M129 89C123 88 120 90 118 92" stroke="#333333" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="60" cy="80" rx="8" ry="10" fill="#333333" />
              <ellipse cx="100" cy="80" rx="8" ry="10" fill="#333333" />
              <circle cx="57" cy="77" r="3" fill="#FFFFFF" />
              <circle cx="97" cy="77" r="3" fill="#FFFFFF" />
              <circle cx="48" cy="92" r="6" fill="#FF5E97" opacity="0.6" />
              <circle cx="112" cy="92" r="6" fill="#FF5E97" opacity="0.6" />
              <ellipse cx="80" cy="95" rx="14" ry="10" fill="#FFFFFF" />
              <polygon points="76,91 84,91 80,95" fill="#333333" />
              <path d="M74 97C77 101 80 101 80 97C80 101 83 101 86 97" stroke="#333333" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
        </div>

        <motion.h1
          className="mcs-title"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
        >
          ¡Completaste el módulo!
        </motion.h1>

        <motion.p
          className="mcs-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
        >
          {moduleName} superado con éxito
        </motion.p>

        <div className="mcs-stats-grid">
          <motion.div
            className="mcs-card points-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 14,
              delay: 0.8
            }}
          >
            <span className="mcs-card-title">Puntos Totales</span>
            <div className="mcs-card-content">
              <span className="mcs-card-icon">
                <Zap size={30} fill="#583000" stroke="none" />
              </span>
              <span className="mcs-card-value">{animatedPoints}</span>
            </div>
          </motion.div>

          <motion.div
            className="mcs-card precision-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 14,
              delay: 0.9
            }}
          >
            <span className="mcs-card-title">¡Muy Bien!</span>
            <div className="mcs-card-content">
              <span className="mcs-card-icon">
                <Target size={30} strokeWidth={3} />
              </span>
              <span className="mcs-card-value">{animatedPrecision}%</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mcs-button-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 1.2 }}
        >
          <button className="mcs-continue-btn" onClick={onContinue}>
            Continuar
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ModuleCompletedScreen;
