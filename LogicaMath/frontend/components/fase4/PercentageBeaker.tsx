import React from 'react';

interface Props {
  inputValue: string; // Valor ingresado actualmente por el alumno
  total: number; // El total de la pregunta para calcular el porcentaje
  color?: string; // Color de acento del líquido
}

export const PercentageBeaker: React.FC<Props> = ({
  inputValue = '',
  total = 100,
  color = '#10b981', // Verde esmeralda vivo por defecto para porcentaje
}) => {
  const numericVal = parseFloat(inputValue) || 0;
  const percentage = total > 0 ? Math.round((numericVal / total) * 100) : 0;
  const fillHeight = Math.min(100, Math.max(0, percentage));

  const scalePoints = [100, 75, 50, 25, 0];

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 bg-slate-950/20 border border-white/5 rounded-[2.5rem] shadow-2xl">
      <div className="grid grid-cols-2 gap-8 items-center w-full max-w-md">
        
        {/* PANEL IZQUIERDO: Beaker de Porcentaje */}
        <div className="flex flex-col items-center justify-center">
          
          <div className="flex items-end gap-3 h-64 relative pt-4">
            
            {/* Vaso (Beaker) */}
            <div className="relative flex flex-col items-center">
               <div className="w-24 h-3 border-2 border-b-0 border-white/30 rounded-[50%] -mb-1.5 z-20 relative bg-slate-900/80" />
               <div className="relative w-20 h-56 bg-slate-900/40 border-x-4 border-b-4 border-white/10 rounded-b-xl flex flex-col justify-end overflow-hidden shadow-inner backdrop-blur-md">
                 
                 {/* Líquido */}
                 <div
                   style={{
                     height: `${fillHeight}%`,
                     background: `linear-gradient(180deg, ${color}dd 0%, ${color} 100%)`,
                     boxShadow: `inset 0 10px 20px rgba(255,255,255,0.3), 0 0 30px ${color}50`,
                     transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                   }}
                   className="w-full relative"
                 >
                    {percentage > 0 && (
                      <div className="absolute top-0 left-0 w-full h-2 -mt-1 rounded-[50%] bg-white/40" />
                    )}
                 </div>

                 {/* Ticks dentro del tubo */}
                 <div className="absolute inset-0 flex flex-col justify-between py-0 pointer-events-none z-10">
                   {scalePoints.map((pt) => (
                     <div 
                       key={pt} 
                       className="w-full flex items-center justify-between" 
                       style={{ height: pt === 100 || pt === 0 ? '0px' : '1px' }}
                     >
                       <div className="w-3 h-[1px] bg-white/20" />
                       <div className="w-3 h-[1px] bg-white/20" />
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Escala */}
            <div className="flex flex-col justify-between h-56 text-[10px] font-black text-slate-500 tracking-wider">
              {scalePoints.map((pt) => (
                <div key={pt} className="flex items-center gap-1.5" style={{ height: pt === 100 || pt === 0 ? '0px' : '1px' }}>
                  <div className="w-2 h-[2px] bg-slate-700 rounded" />
                  <span className={fillHeight >= pt ? 'text-emerald-400 transition-colors duration-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-slate-600'}>
                    {pt}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 px-6 py-2 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center min-w-[90px] shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${color}, transparent)` }} />
            <span className="text-xl font-black tracking-tight select-none relative z-10" style={{ color: fillHeight > 0 ? color : '#64748b' }}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* PANEL DERECHO: Display de Confirmación */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 select-none">
            RESULTADO DEL CÁLCULO
          </span>
          
          <div className="w-full bg-slate-950 border-2 border-white/5 rounded-3xl p-6 min-h-[120px] flex items-center justify-center shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
            <span className="text-6xl font-black font-display tracking-tight select-all text-white drop-shadow-md">
              {inputValue || '0'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
