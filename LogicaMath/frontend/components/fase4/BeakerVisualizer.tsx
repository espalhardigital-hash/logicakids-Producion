import React, { useState, useEffect } from 'react';

interface Props {
  divisions: number; // Denominador
  initialLevel?: number; // Para modo pasivo
  interactive?: boolean; // Permite cambiar el nivel
  onChange?: (selectedLevel: number) => void;
  color?: string; // Color del líquido
}

export const BeakerVisualizer: React.FC<Props> = ({
  divisions = 5,
  initialLevel = 0,
  interactive = false,
  onChange,
  color = '#38bdf8', // Liquid blue by default
}) => {
  const [level, setLevel] = useState<number>(initialLevel);

  useEffect(() => {
    setLevel(initialLevel);
  }, [initialLevel]);

  const handleSegmentClick = (segmentIndex: number) => {
    if (!interactive) return;
    const nextLevel = segmentIndex + 1;
    setLevel(nextLevel);
    if (onChange) {
      onChange(nextLevel);
    }
  };

  const height = 200;
  const segmentHeight = height / divisions;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex items-end gap-3">
        {/* The Beaker */}
        <div className="relative flex flex-col items-center">
          {/* Beaker Lip */}
          <div className="w-32 h-4 border-2 border-b-0 border-white/40 rounded-[50%] -mb-2 z-20 relative bg-slate-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]" />
          
          {/* Beaker Body */}
          <div 
            style={{ height: `${height}px` }} 
            className="w-28 bg-white/5 border-x-4 border-b-4 border-white/20 rounded-b-2xl relative overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-sm"
          >
            {/* Liquid level */}
            <div
              style={{
                height: `${(level / divisions) * 100}%`,
                background: `linear-gradient(180deg, ${color}cc 0%, ${color} 100%)`,
                boxShadow: `inset 0 10px 20px rgba(255,255,255,0.2), 0 0 20px ${color}60`,
                transition: 'height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="w-full absolute bottom-0 left-0"
            >
              {/* Liquid surface */}
              {level > 0 && (
                <div 
                  className="absolute top-0 left-0 w-full h-3 -mt-1.5 rounded-[50%] opacity-80"
                  style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)` }}
                />
              )}
            </div>

            {/* Grid segment dividers (interactive/clickable zones) */}
            <div className="absolute inset-0 flex flex-col-reverse">
              {Array.from({ length: divisions }).map((_, idx) => {
                return (
                  <div
                    key={idx}
                    onClick={() => handleSegmentClick(idx)}
                    style={{
                      height: `${segmentHeight}px`,
                      cursor: interactive ? 'pointer' : 'default',
                    }}
                    className="w-full relative z-10 hover:bg-white/10 active:bg-white/20 transition-colors group"
                  >
                     {/* Hover indicator for interactive */}
                     {interactive && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 border border-white/30 transition-opacity pointer-events-none" />
                     )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Labels/Ticks (Graduation marks) */}
        <div className="flex flex-col-reverse justify-between pb-2" style={{ height: `${height}px` }}>
          {Array.from({ length: divisions + 1 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-1" style={{ height: idx === 0 || idx === divisions ? '0px' : `${segmentHeight}px` }}>
              <div className="w-3 h-0.5 bg-white/40" />
              <div className="text-xs font-bold text-slate-400 min-w-[30px]">
                {idx > 0 && idx < divisions && `${idx}/${divisions}`}
                {idx === divisions && "Max"}
                {idx === 0 && "0"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {interactive && (
        <div className="mt-8 text-sm font-black text-slate-400 uppercase tracking-widest bg-slate-900/50 px-6 py-2 rounded-full border border-white/5">
          Nivel elegido: <span style={{ color }} className="text-2xl drop-shadow-md">{level}</span> <span className="text-slate-500 text-lg">/ {divisions}</span>
        </div>
      )}
    </div>
  );
};
