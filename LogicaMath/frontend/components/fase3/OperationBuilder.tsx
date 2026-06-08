import React, { useState } from 'react';
import './Fase3Styles.css';

interface OperationBuilderProps {
  availableNumbers: number[];
  onSubmit: (result: number) => void;
  onClear: () => void;
  expectedFormat?: string; // e.g. "NUM_OP_NUM"
}

export const OperationBuilder: React.FC<OperationBuilderProps> = ({
  availableNumbers,
  onSubmit,
  onClear,
  expectedFormat = "NUM_OP_NUM"
}) => {
  const [slots, setSlots] = useState<(string | number | null)[]>([null, null, null]);
  const operators = ['+', '-', '×', '÷'];

  const getFirstEmptySlot = () => {
    return slots.findIndex(s => s === null);
  };

  const handleCardClick = (value: string | number) => {
    const emptyIndex = getFirstEmptySlot();
    if (emptyIndex !== -1) {
      const newSlots = [...slots];
      newSlots[emptyIndex] = value;
      setSlots(newSlots);
    }
  };

  const handleSlotClick = (index: number) => {
    // Si el slot tiene contenido, lo limpiamos al hacer clic para "devolver" la tarjeta
    if (slots[index] !== null) {
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
    }
  };

  const handleClearAll = () => {
    setSlots([null, null, null]);
    onClear();
  };

  const calculateResult = () => {
    if (slots.includes(null)) return;
    
    const [num1, op, num2] = slots;
    let result = 0;
    
    const n1 = Number(num1);
    const n2 = Number(num2);

    switch (op) {
      case '+': result = n1 + n2; break;
      case '-': result = n1 - n2; break;
      case '×': result = n1 * n2; break;
      case '÷': result = n1 / n2; break;
    }

    onSubmit(result);
  };

  const isComplete = !slots.includes(null);

  // Filtrar los números que ya están en uso en los slots
  const usedNumbers = slots.filter(s => typeof s === 'number') as number[];
  
  // Clonamos availableNumbers y quitamos las ocurrencias usadas
  let remainingNumbers = [...availableNumbers];
  usedNumbers.forEach(un => {
    const idx = remainingNumbers.indexOf(un);
    if (idx > -1) {
      remainingNumbers.splice(idx, 1);
    }
  });

  return (
    <div className="operation-builder">
      <h3 className="text-center text-slate-300 mb-4 font-semibold uppercase tracking-wider text-sm">
        Constructor de Soluciones
      </h3>
      
      {/* Zona de Slots */}
      <div className="operation-slots">
        {slots.map((slot, index) => (
          <div 
            key={index}
            className={`operation-slot ${slot !== null ? 'filled' : ''} ${getFirstEmptySlot() === index ? 'active-target' : ''}`}
            onClick={() => handleSlotClick(index)}
          >
            {slot !== null ? slot : ''}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button 
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition"
          onClick={handleClearAll}
        >
          Limpiar
        </button>
        {isComplete && (
          <button 
            className="px-6 py-2 bg-orange-500 text-white font-bold rounded shadow-lg shadow-orange-500/30 hover:bg-orange-400 transition"
            onClick={calculateResult}
          >
            Evaluar
          </button>
        )}
      </div>

      {/* Estantería de Datos */}
      <div className="data-shelf mb-6">
        {remainingNumbers.map((num, idx) => (
          <div 
            key={`num-${idx}`} 
            className="data-card"
            onClick={() => handleCardClick(num)}
          >
            {num}
          </div>
        ))}
      </div>

      <div className="data-shelf">
        {operators.map((op, idx) => (
          <div 
            key={`op-${idx}`} 
            className="data-card operator"
            onClick={() => handleCardClick(op)}
          >
            {op}
          </div>
        ))}
      </div>
    </div>
  );
};
