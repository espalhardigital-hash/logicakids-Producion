import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface ClockVisualizerProps {
  timeStr: string; // Format "HH:MM"
  isInteractive?: boolean;
  onTimeChange?: (timeStr: string) => void;
  size?: number;
}

export const ClockVisualizer: React.FC<ClockVisualizerProps> = ({
  timeStr,
  isInteractive = false,
  onTimeChange,
  size = 200,
}) => {
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setHours(h % 12 || 12);
        setMinutes(m);
      }
    }
  }, [timeStr]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    // Calculate angle in degrees (0 is at the top)
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    // We assume the user is adjusting minutes by clicking around the edge
    const newMinutes = Math.round((angle / 360) * 60) % 60;
    setMinutes(newMinutes);
    if (onTimeChange) {
      // Keep same hour
      const hStr = hours.toString().padStart(2, '0');
      const mStr = newMinutes.toString().padStart(2, '0');
      onTimeChange(`${hStr}:${mStr}`);
    }
  };

  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;
  const minuteAngle = minutes * 6;

  const center = size / 2;
  const radius = size / 2 - 10;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className="relative bg-white/10 rounded-full shadow-2xl backdrop-blur-md border border-white/20"
        style={{ width: size, height: size, padding: 10 }}
      >
        <svg 
          width={size - 20} 
          height={size - 20} 
          onClick={handleSvgClick}
          className={isInteractive ? "cursor-pointer" : ""}
        >
          {/* Clock Face Background */}
          <circle cx={center - 10} cy={center - 10} r={radius} fill="rgba(0,0,0,0.3)" />
          <circle cx={center - 10} cy={center - 10} r={radius} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" />
          
          {/* Ticks */}
          {[...Array(12)].map((_, i) => {
            const angle = i * 30 * (Math.PI / 180);
            const x1 = (center - 10) + (radius - 5) * Math.sin(angle);
            const y1 = (center - 10) - (radius - 5) * Math.cos(angle);
            const x2 = (center - 10) + (radius - 15) * Math.sin(angle);
            const y2 = (center - 10) - (radius - 15) * Math.cos(angle);
            return (
              <line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.8)" strokeWidth={i % 3 === 0 ? 4 : 2} strokeLinecap="round" />
            );
          })}

          {/* Minute Hand */}
          <motion.line
            x1={center - 10} y1={center - 10}
            x2={center - 10} y2={(center - 10) - radius * 0.7}
            stroke="#60A5FA" // Blue-400
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ rotate: 0 }}
            animate={{ rotate: minuteAngle }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{ originX: "50%", originY: "50%" }}
          />

          {/* Hour Hand */}
          <motion.line
            x1={center - 10} y1={center - 10}
            x2={center - 10} y2={(center - 10) - radius * 0.45}
            stroke="#F472B6" // Pink-400
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ rotate: 0 }}
            animate={{ rotate: hourAngle }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{ originX: "50%", originY: "50%" }}
          />

          {/* Center Pin */}
          <circle cx={center - 10} cy={center - 10} r="6" fill="#FBBF24" />
        </svg>
      </div>
      
      <div className="mt-4 px-6 py-2 bg-black/30 rounded-2xl border border-white/10 shadow-lg">
        <span className="text-2xl font-mono text-white/90 font-bold tracking-widest">
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};
