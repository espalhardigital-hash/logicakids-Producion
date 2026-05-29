import React, { useState, useEffect } from 'react';

interface Props {
  slices: number; // Denominador
  initialSombreados?: number[]; // Para modo pasivo
  interactive?: boolean; // Permite hacer clic
  onChange?: (selectedCount: number) => void; // Callback para modo interactivo
  color?: string; // Color neón primario
}

export const PizzaFractionVisualizer: React.FC<Props> = ({
  slices = 8,
  initialSombreados = [],
  interactive = false,
  onChange,
  color = '#A855F7',
}) => {
  const [sombreados, setSombreados] = useState<number[]>(initialSombreados);

  useEffect(() => {
    setSombreados(initialSombreados);
  }, [initialSombreados]);

  const handleSliceClick = (index: number) => {
    if (!interactive) return;
    
    let next: number[];
    if (sombreados.includes(index)) {
      next = sombreados.filter(i => i !== index);
    } else {
      next = [...sombreados, index];
    }
    
    setSombreados(next);
    if (onChange) {
      onChange(next.length);
    }
  };

  const cx = 100;
  const cy = 100;
  const r = 85;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg 
        width="200" 
        height="200" 
        viewBox="0 0 200 200"
        className="drop-shadow-[0_10px_20px_rgba(168,85,247,0.15)]"
      >
        {/* Crust background */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={r + 5} 
          fill="none" 
          stroke="#451a75" 
          strokeWidth="6" 
          className="opacity-40"
        />
        
        {/* Slices */}
        {Array.from({ length: slices }).map((_, i) => {
          const angleStart = (i * 2 * Math.PI) / slices - Math.PI / 2;
          const angleEnd = ((i + 1) * 2 * Math.PI) / slices - Math.PI / 2;
          
          const x1 = cx + r * Math.cos(angleStart);
          const y1 = cy + r * Math.sin(angleStart);
          const x2 = cx + r * Math.cos(angleEnd);
          const y2 = cy + r * Math.sin(angleEnd);
          
          const isSelected = sombreados.includes(i);
          const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

          return (
            <path
              key={i}
              d={path}
              fill={isSelected ? `${color}dd` : 'rgba(255,255,255,0.03)'}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
              onClick={() => handleSliceClick(i)}
              style={{
                cursor: interactive ? 'pointer' : 'default',
                transition: 'fill 0.2s ease, transform 0.1s ease',
              }}
              className="hover:brightness-110 active:scale-[0.98]"
            />
          );
        })}

        {/* Center dot */}
        <circle 
          cx={cx} 
          cy={cy} 
          r="6" 
          fill="#1e1b4b" 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="2" 
        />
      </svg>

      {interactive && (
        <div className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">
          Fracción elegida: <span style={{ color }} className="text-xl">{sombreados.length}</span> / <span className="text-xl">{slices}</span>
        </div>
      )}
    </div>
  );
};
