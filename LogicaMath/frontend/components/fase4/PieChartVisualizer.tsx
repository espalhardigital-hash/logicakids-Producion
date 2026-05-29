import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PieChart } from 'lucide-react';

interface Props {
  pctA: number; // Porcentaje categoría A (p.ej. Manzanas Rojas)
  pctB: number; // Porcentaje categoría B (p.ej. Manzanas Verdes)
  pctC: number; // Porcentaje categoría C (p.ej. Uvas - Respuesta)
  categorias: string[]; // ['Manzanas Rojas', 'Manzanas Verdes', 'Uvas']
  interactive?: boolean; // Permite clics
  onChange?: (selectedValue: number) => void; // Al seleccionar un valor
  color?: string; // Color neón
}

export const PieChartVisualizer: React.FC<Props> = ({
  pctA = 40,
  pctB = 35,
  pctC = 25,
  categorias = ['Rojas', 'Verdes', 'Uvas'],
  interactive = true,
  onChange,
  color = '#A855F7',
}) => {
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Opciones disponibles para seleccionar
  const OPTIONS = [10, 20, 25, 30, 35, 40, 50, 60];

  const handleOptionClick = (val: number) => {
    setSelectedPercentage(val);
    setShowSelector(false);
    if (onChange) {
      onChange(val);
    }
  };

  const cx = 100;
  const cy = 100;
  const r = 80;

  // Renderiza un sector SVG
  const renderSlice = (startPct: number, endPct: number, fillColor: string, index: number, isTarget: boolean) => {
    const startAngle = startPct * 3.6;
    const endAngle = endPct * 3.6;
    const angle = endAngle - startAngle;

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    // Calcular punto medio para etiquetas
    const midAngle = startAngle + angle / 2;
    const midRad = (midAngle - 90) * Math.PI / 180;
    const labelR = r * 0.6;
    const lx = cx + labelR * Math.cos(midRad);
    const ly = cy + labelR * Math.sin(midRad);

    const isSelected = isTarget && showSelector;

    return (
      <g 
        key={index}
        onClick={() => {
          if (interactive && isTarget) {
            setShowSelector(true);
          }
        }}
        style={{ cursor: interactive && isTarget ? 'pointer' : 'default' }}
        className="group"
      >
        <path
          d={path}
          fill={fillColor}
          stroke="rgba(7, 11, 25, 0.8)"
          strokeWidth="3"
          style={{
            transformOrigin: '100px 100px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: isSelected ? `drop-shadow(0 0 8px ${color})` : 'none',
          }}
          className="hover:brightness-110 hover:scale-[1.03] active:scale-[0.98]"
        />
        {/* Label percentage */}
        <text
          x={lx}
          y={ly}
          fill="#ffffff"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ 
            pointerEvents: 'none', 
            textShadow: '0 2px 4px rgba(0,0,0,0.8)' 
          }}
        >
          {isTarget 
            ? (selectedPercentage !== null ? `${selectedPercentage}%` : '?') 
            : `${endPct - startPct}%`
          }
        </text>
      </g>
    );
  };

  // Acumuladores de porcentajes
  const limitA = pctA;
  const limitB = pctA + pctB;

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="relative">
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200"
          className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
        >
          {/* Outer glow circle */}
          <circle 
            cx={cx} 
            cy={cy} 
            r={r + 4} 
            fill="none" 
            stroke="rgba(168, 85, 247, 0.15)" 
            strokeWidth="3" 
          />

          {/* Slices: A (Rojas), B (Verdes), C (Uvas - Incógnita) */}
          {renderSlice(0, limitA, '#A855F7', 0, false)}       {/* Accent color A */}
          {renderSlice(limitA, limitB, '#7C3AED', 1, false)}   {/* Accent color B */}
          {renderSlice(limitB, 100, selectedPercentage !== null ? '#10B981' : 'rgba(255,255,255,0.06)', 2, true)} {/* Target slice C */}

          {/* Center axle lock */}
          <circle 
            cx={cx} 
            cy={cy} 
            r="8" 
            fill="#070b19" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2" 
          />
        </svg>

        {/* Float bubble hint to click target */}
        {interactive && selectedPercentage === null && !showSelector && (
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-[82%] -translate-y-1/2 bg-purple-500 text-white font-black text-[10px] py-1 px-2.5 rounded-full border border-white/20 shadow-lg tracking-wider"
          >
            👉 ¡TÓCAME!
          </motion.div>
        )}
      </div>

      {/* Legend showing category splits */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center bg-slate-900/60 border border-white/5 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3.5 h-3.5 rounded-md" style={{ background: '#A855F7' }} />
          <span className="text-slate-300 font-bold">{categorias[0]}: {pctA}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3.5 h-3.5 rounded-md" style={{ background: '#7C3AED' }} />
          <span className="text-slate-300 font-bold">{categorias[1]}: {pctB}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3.5 h-3.5 rounded-md border border-dashed border-purple-500" style={{ background: selectedPercentage !== null ? '#10B981' : 'rgba(255,255,255,0.06)' }} />
          <span className="text-slate-100 font-black">
            {categorias[2]}: {selectedPercentage !== null ? `${selectedPercentage}%` : '¿?'}
          </span>
        </div>
      </div>

      {/* Popover Selection list */}
      <AnimatePresence>
        {showSelector && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mt-6 w-full max-w-sm p-4 bg-slate-950/95 border border-purple-500/30 rounded-3xl backdrop-blur-md shadow-2xl z-20 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-wider mb-3">
              <PieChart size={14} /> Selecciona el Porcentaje para {categorias[2]}
            </div>

            <div className="grid grid-cols-4 gap-2 w-full">
              {OPTIONS.map((val) => {
                const isFraction = val === 25 || val === 50;
                const fractionLabel = val === 25 ? '1/4 (25%)' : val === 50 ? '1/2 (50%)' : `${val}%`;

                return (
                  <button
                    key={val}
                    onClick={() => handleOptionClick(val)}
                    className="py-2.5 px-1 bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/40 rounded-xl text-white font-black text-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5"
                  >
                    <span>{fractionLabel}</span>
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setShowSelector(false)}
              className="mt-3 text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
