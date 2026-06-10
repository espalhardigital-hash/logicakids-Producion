import React from 'react';
import { motion } from 'framer-motion';

export interface ThermometerVisualizerProps {
  value: number; // Value to display
  min?: number;  // Minimum scale
  max?: number;  // Maximum scale
  unit?: string; // e.g. "°C", "%", "L"
  color?: string; // Fill color (default red)
  height?: number; // Visual height
}

export const ThermometerVisualizer: React.FC<ThermometerVisualizerProps> = ({
  value,
  min = 0,
  max = 100,
  unit = "°C",
  color = "#EF4444", // Red-500
  height = 300,
}) => {
  // Ensure value is within bounds
  const clampedValue = Math.max(min, Math.min(max, value));
  
  // Calculate percentage fill
  const range = max - min;
  const percentage = range === 0 ? 0 : ((clampedValue - min) / range) * 100;

  // Render scale marks (5 main marks)
  const steps = 5;
  const stepValue = range / steps;
  
  return (
    <div className="flex justify-center items-center p-4">
      <div className="flex gap-4 items-end" style={{ height: height + 60 }}>
        
        {/* Scale labels (Left side) */}
        <div className="flex flex-col justify-between items-end h-[80%] pb-10 text-white/70 font-mono text-sm">
          {[...Array(steps + 1)].map((_, i) => (
            <span key={i}>{Math.round(max - (i * stepValue))}</span>
          ))}
        </div>

        {/* Thermometer Body */}
        <div className="relative flex flex-col items-center">
          {/* Glass Tube */}
          <div 
            className="w-8 bg-white/10 rounded-t-full border-2 border-white/30 backdrop-blur-sm relative z-10 overflow-hidden"
            style={{ height }}
          >
            {/* Liquid Fill */}
            <motion.div
              className="absolute bottom-0 w-full"
              style={{ backgroundColor: color }}
              initial={{ height: "0%" }}
              animate={{ height: `${percentage}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
            {/* Shine effect */}
            <div className="absolute top-0 left-1 w-2 h-full bg-gradient-to-b from-white/30 to-transparent rounded-full" />
          </div>

          {/* Glass Bulb (Bottom) */}
          <div className="relative -mt-4 z-20">
            <div className="w-16 h-16 bg-white/10 rounded-full border-2 border-white/30 backdrop-blur-sm flex items-center justify-center">
              <div 
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            {/* Bulb shine */}
            <div className="absolute top-2 left-3 w-4 h-4 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Current Reading Label */}
      <div className="ml-8 px-6 py-4 bg-black/30 rounded-2xl border border-white/10 shadow-lg text-center">
        <span className="block text-sm text-white/50 uppercase tracking-wider mb-1">Lectura</span>
        <span className="text-4xl font-mono text-white font-bold" style={{ color }}>
          {value}{unit}
        </span>
      </div>
    </div>
  );
};
