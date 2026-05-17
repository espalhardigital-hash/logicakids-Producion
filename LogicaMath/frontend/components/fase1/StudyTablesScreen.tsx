import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Calculator, PlayCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  onPractice: () => void;
}

const StudyTablesScreen: React.FC<Props> = ({ onBack, onPractice }) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Numbers 1 to 12
  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-2xl flex flex-col h-[85vh] animate-fade-in relative z-10 px-4">
      {/* Header */}
      <div className="flex items-center mb-4 px-2">
        <button 
          onClick={() => selectedTable ? setSelectedTable(null) : onBack()}
          className="p-2 bg-white hover:bg-slate-50 dark:bg-[#162033] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full transition-colors mr-4 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="text-slate-700 dark:text-white" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <BookOpen className="text-pink-500" />
            {selectedTable ? `Tabla del ${selectedTable}` : 'Estudiar Tablas'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
            {selectedTable ? 'Repasa los resultados.' : 'Selecciona una tabla o practica aleatoriamente.'}
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl p-6 relative flex flex-col transition-colors duration-300">
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        {!selectedTable ? (
          <div className="flex flex-col h-full relative z-10">
            {/* Grid View */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar mb-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-2">
                {tables.map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedTable(num)}
                    className="aspect-square bg-slate-50 dark:bg-[#0a0f1c] hover:bg-slate-100 dark:hover:bg-slate-950 border-2 border-slate-200/60 dark:border-slate-800 hover:border-pink-500/50 dark:hover:border-pink-500/50 rounded-2xl flex flex-col items-center justify-center transition-all group cursor-pointer"
                  >
                    <span className="text-4xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform font-display">{num}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-black mt-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 font-display">Tabla</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Random Practice Button */}
            <button
              onClick={onPractice}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl shadow-lg border border-white/10 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.01] group cursor-pointer"
            >
              <PlayCircle className="group-hover:animate-pulse" size={24} />
              <div className="text-left font-sans">
                <span className="block text-lg font-bold leading-none">Practicar Aleatorio (Quiz)</span>
                <span className="text-xs text-pink-200">Preguntas mixtas del 1 al 12</span>
              </div>
            </button>
          </div>
        ) : (
          // Detail View (The actual table)
          <div className="h-full flex flex-col relative z-10">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((multiplier) => (
                  <div 
                    key={multiplier}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 hover:border-pink-500/20 dark:hover:border-pink-500/20 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2 text-xl font-bold text-slate-700 dark:text-gray-300">
                      <span>{selectedTable}</span>
                      <span className="text-pink-500 font-black">×</span>
                      <span>{multiplier}</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
                      = {selectedTable * multiplier}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick action footer */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-center">
                <p className="text-slate-500 dark:text-gray-400 text-sm flex items-center gap-2 font-sans">
                    <Calculator size={16} />
                    ¡Memorízala y luego juega al modo Multiplicación!
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTablesScreen;