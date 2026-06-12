import React, { useState, useEffect, useMemo } from 'react';

interface Props {
  slices: number; // Denominador
  initialSombreados?: number[]; // Para modo pasivo
  interactive?: boolean; // Permite hacer clic
  onChange?: (selectedCount: number) => void; // Callback para modo interactivo
  color?: string; // Color neón primario
  hideText?: boolean; // Oculta el texto interno
  shape?: 'circle' | 'square' | 'pentagon' | 'hexagon'; // Nueva propiedad de forma
}

const getPolygonPoints = (sides: number, cx: number, cy: number, r: number) => {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

export const PizzaFractionVisualizer: React.FC<Props> = ({
  slices = 8,
  initialSombreados = [],
  interactive = false,
  onChange,
  color = '#A855F7',
  hideText = false,
  shape = 'circle',
}) => {
  const [sombreados, setSombreados] = useState<number[]>(initialSombreados);

  const initialSombreadosStr = JSON.stringify(initialSombreados);
  useEffect(() => {
    setSombreados(initialSombreados);
  }, [initialSombreadosStr]);

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
  const r = 80; // slightly adjusted radius for margins

  const clipId = useMemo(() => `shape-clip-${Math.random().toString(36).substring(2, 9)}`, [shape]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg 
        width="200" 
        height="200" 
        viewBox="0 0 200 200"
        className="drop-shadow-[0_10px_20px_rgba(168,85,247,0.15)]"
      >
        <defs>
          <clipPath id={clipId}>
            {shape === 'circle' && <circle cx={cx} cy={cy} r={r} />}
            {shape === 'pentagon' && <polygon points={getPolygonPoints(5, cx, cy, r)} />}
            {shape === 'hexagon' && <polygon points={getPolygonPoints(6, cx, cy, r)} />}
          </clipPath>
        </defs>

        {/* Crust background */}
        {shape === 'circle' && (
          <circle 
            cx={cx} 
            cy={cy} 
            r={r + 5} 
            fill="none" 
            stroke="#451a75" 
            strokeWidth="6" 
            className="opacity-40"
          />
        )}
        {shape === 'square' && (
          <rect 
            x="20" 
            y="20" 
            width="160" 
            height="160" 
            rx="8"
            fill="none" 
            stroke="#451a75" 
            strokeWidth="6" 
            className="opacity-40"
          />
        )}
        {shape === 'pentagon' && (
          <polygon 
            points={getPolygonPoints(5, cx, cy, r + 5)} 
            fill="none" 
            stroke="#451a75" 
            strokeWidth="6" 
            className="opacity-40"
          />
        )}
        {shape === 'hexagon' && (
          <polygon 
            points={getPolygonPoints(6, cx, cy, r + 5)} 
            fill="none" 
            stroke="#451a75" 
            strokeWidth="6" 
            className="opacity-40"
          />
        )}
        
        {/* Slices group */}
        <g clipPath={shape !== 'square' ? `url(#${clipId})` : undefined}>
          {shape === 'circle' && <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.03)" />}
          {shape === 'square' && <rect x="20" y="20" width="160" height="160" rx="8" fill="rgba(255,255,255,0.03)" />}
          {shape === 'pentagon' && <polygon points={getPolygonPoints(5, cx, cy, r)} fill="rgba(255,255,255,0.03)" />}
          {shape === 'hexagon' && <polygon points={getPolygonPoints(6, cx, cy, r)} fill="rgba(255,255,255,0.03)" />}

          {Array.from({ length: slices }).map((_, i) => {
            const isSelected = sombreados.includes(i);
            let path = '';
            
            if (shape === 'square') {
              const w = 160 / slices;
              const xStart = 20 + i * w;
              path = `M ${xStart} 20 L ${xStart + w} 20 L ${xStart + w} 180 L ${xStart} 180 Z`;
            } else {
              const angleStart = (i * 2 * Math.PI) / slices - Math.PI / 2;
              const angleEnd = ((i + 1) * 2 * Math.PI) / slices - Math.PI / 2;
              
              const R_large = 130;
              const x1 = cx + R_large * Math.cos(angleStart);
              const y1 = cy + R_large * Math.sin(angleStart);
              const x2 = cx + R_large * Math.cos(angleEnd);
              const y2 = cy + R_large * Math.sin(angleEnd);
              
              const largeArcFlag = slices === 1 ? 1 : 0;
              path = `M ${cx} ${cy} L ${x1} ${y1} A ${R_large} ${R_large} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            }

            return (
              <path
                key={i}
                d={path}
                fill={isSelected ? `${color}dd` : 'transparent'}
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
        </g>

        {/* Center dot (for radial shapes) */}
        {shape !== 'square' && (
          <circle 
            cx={cx} 
            cy={cy} 
            r="6" 
            fill="#1e1b4b" 
            stroke="rgba(255,255,255,0.3)" 
            strokeWidth="2" 
          />
        )}
      </svg>

      {interactive && !hideText && (
        <div className="mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">
          Fracción elegida: <span style={{ color }} className="text-xl">{sombreados.length}</span> / <span className="text-xl">{slices}</span>
        </div>
      )}
    </div>
  );
};
