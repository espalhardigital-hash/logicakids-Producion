import React, { useState, useEffect } from 'react';

interface Props {
  divisions: number; // Denominador
  initialLevel?: number; // Para modo pasivo
  interactive?: boolean; // Permite cambiar el nivel
  onChange?: (selectedLevel: number) => void;
  color?: string; // Color del líquido
}

export const ThermometerVisualizer: React.FC<Props> = ({
  divisions = 5,
  initialLevel = 0,
  interactive = false,
  onChange,
  color = '#8B5CF6',
}) => {
  const [level, setLevel] = useState<number>(initialLevel);

  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel]);

  const handleSegmentClick = (segmentIndex: number) => {
    if (!interactive) return;
    const nextLevel = segmentIndex + 1; // 1-indexed level
    setLevel(nextLevel);
    if (onChange) {
      onChange(nextLevel);
    }
  };

  // Thermometer rendering variables
  const height = 180;
  const segmentHeight = height / divisions;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-6">
        {/* The Thermometer Visual representation */}
        <div className="relative flex flex-col items-center">
          {/* Outer tube */}
          <div 
            style={{ height: `${height}px` }} 
            className="w-10 bg-slate-950/60 border-2 border-slate-700 rounded-t-full relative overflow-hidden"
          >
            {/* Liquid level */}
            <div
              style={{
                height: `${(level / divisions) * 100}%`,
                background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
                boxShadow: `0 0 15px ${color}50`,
                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="w-full absolute bottom-0 left-0"
            />

            {/* Grid segment dividers (interactive/clickable zones) */}
            {Array.from({ length: divisions }).map((_, idx) => {
              const reverseIdx = divisions - 1 - idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSegmentClick(reverseIdx)}
                  style={{
                    height: `${segmentHeight}px`,
                    borderTop: idx > 0 ? '1px dashed rgba(255,255,255,0.2)' : 'none',
                    cursor: interactive ? 'pointer' : 'default',
                  }}
                  className="w-full relative z-10 flex items-center justify-center text-[10px] text-slate-500 font-bold hover:bg-white/5 active:bg-white/10"
                >
                  {reverseIdx + 1}
                </div>
              );
            })}
          </div>

          {/* Bottom bulb */}
          <div 
            style={{ backgroundColor: color, borderColor: '#334155' }}
            className="w-14 h-14 rounded-full border-2 -mt-2 relative z-0 flex items-center justify-center shadow-lg"
          >
            <div className="w-10 h-10 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Labels/Ticks */}
        <div className="flex flex-col justify-between h-[180px] text-xs font-black text-slate-500 py-1 uppercase tracking-wider">
          <div>Lleno (100%)</div>
          <div>Mitad (50%)</div>
          <div>Vacío (0%)</div>
        </div>
      </div>

      {interactive && (
        <div className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest">
          Nivel elegido: <span style={{ color }} className="text-xl">{level}</span> / <span className="text-xl">{divisions}</span>
        </div>
      )}
    </div>
  );
};
