import React from 'react';

interface Props {
  inputValue: string; // Valor ingresado actualmente por el alumno
  total: number; // El total de la pregunta para calcular el porcentaje
  color?: string; // Color de acento del líquido
}

export const PercentageThermometer: React.FC<Props> = ({
  inputValue = '',
  total = 100,
  color = '#EF4444', // Rojo carmesí vivo por defecto
}) => {
  // Convert current input value to float
  const numericVal = parseFloat(inputValue) || 0;
  
  // Calculate represented percentage
  const percentage = total > 0 ? Math.round((numericVal / total) * 100) : 0;
  
  // Clamp percentage between 0 and 100 for visualizer fill height
  const fillHeight = Math.min(100, Math.max(0, percentage));

  // Ticks coordinates (representing 100%, 75%, 50%, 25%, 0%)
  const scalePoints = [100, 75, 50, 25, 0];

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 bg-slate-950/20 border border-white/5 rounded-[2.5rem] shadow-2xl">
      <div className="grid grid-cols-2 gap-8 items-center w-full max-w-md">
        
        {/* PANEL IZQUIERDO: Termómetro y Píldora de Porcentaje */}
        <div className="flex flex-col items-center justify-center">
          
          {/* Fila del Termómetro y Escala */}
          <div className="flex items-center gap-4 h-64">
            
            {/* Cápsula del Termómetro (rounded-full) */}
            <div className="relative w-14 h-56 bg-slate-950/70 border border-slate-800 rounded-full flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Líquido de Llenado con transición suave */}
              <div
                style={{
                  height: `${fillHeight}%`,
                  background: `linear-gradient(180deg, ${color} 0%, #be123c 100%)`,
                  boxShadow: `0 0 20px ${color}60`,
                  transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="w-full absolute bottom-0 left-0 rounded-b-full"
              />

              {/* Ticks horizontales grabados dentro del tubo */}
              <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none z-10">
                {scalePoints.map((pt) => (
                  <div 
                    key={pt} 
                    className="w-full h-[1px] bg-white/10" 
                    style={{ opacity: pt === 100 || pt === 0 ? 0.3 : 0.6 }}
                  />
                ))}
              </div>
            </div>

            {/* Escala de Porcentajes a la derecha */}
            <div className="flex flex-col justify-between h-56 py-4 text-xs font-black text-slate-500 tracking-wider">
              {scalePoints.map((pt) => (
                <div key={pt} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-[1.5px] bg-slate-700" />
                  <span className={fillHeight >= pt ? 'text-rose-500 transition-colors duration-300' : 'text-slate-500'}>
                    {pt}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Píldora de Porcentaje Actual en tiempo real */}
          <div className="mt-6 px-5 py-2 bg-rose-500/5 border border-rose-500/25 rounded-2xl flex items-center justify-center min-w-[80px] shadow-sm">
            <span className="text-rose-500 text-lg font-black tracking-tight select-none">
              {percentage}%
            </span>
          </div>
        </div>

        {/* PANEL DERECHO: Display de Confirmación */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 select-none">
            CONFIRMAR RESULTADO
          </span>
          
          <div className="w-full bg-slate-950/40 border border-slate-800 rounded-3xl p-6 min-h-[100px] flex items-center justify-center shadow-inner relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-transparent pointer-events-none" />
            
            <span className="text-5xl font-black font-display text-white tracking-tight select-all">
              {inputValue || '0'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
