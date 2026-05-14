import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, Clock, Layers, ToggleLeft, ToggleRight } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const PedagogyTab: React.FC = () => {
  // Mock state para la demostración
  const [questionsPerPhase, setQuestionsPerPhase] = useState(50);
  const [timers, setTimers] = useState({
    easy: 15,
    easy_medium: 12,
    medium: 10,
    medium_hard: 8,
    hard: 5,
  });
  const [useTimer, setUseTimer] = useState(true);
  const [passingScore, setPassingScore] = useState(85);

  const handleSave = () => {
    alert("Configuración Pedagógica Guardada Correctamente");
  };

  return (
    <motion.div variants={itemVariants} className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Settings className="text-blue-400" size={24} />
            </div>
            Configuración Pedagógica
          </h2>
          <p className="text-slate-400 text-sm mt-1">Ajusta los parámetros del juego, tiempos y cantidad de preguntas.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center gap-2 text-white font-bold shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          <Save size={20} /> Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parámetros Generales */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col gap-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="text-purple-400" size={22} /> Volumen de Ejercicios
          </h3>
          
          <div className="space-y-4">
            <label className="text-sm text-slate-300 font-bold flex justify-between">
              Preguntas requeridas por Fase/Bloque
              <span className="text-blue-400">{questionsPerPhase} Preguntas</span>
            </label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="5"
              value={questionsPerPhase}
              onChange={(e) => setQuestionsPerPhase(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-slate-500">Determina cuántas preguntas correctas necesita un alumno para superar una sección.</p>
          </div>

          <div className="mt-4 pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-slate-300 font-bold">Uso de Cronómetro Global</label>
                <p className="text-xs text-slate-500 mt-1">Activa o desactiva la presión de tiempo en las fases iniciales.</p>
              </div>
              <button onClick={() => setUseTimer(!useTimer)} className="text-blue-400 transition-all hover:scale-110">
                {useTimer ? <ToggleRight size={40} className="text-blue-500" /> : <ToggleLeft size={40} className="text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-white/5 space-y-4">
            <label className="text-sm text-slate-300 font-bold flex justify-between">
              Porcentaje para Aprobar
              <span className="text-green-400">{passingScore}%</span>
            </label>
            <input 
              type="range" 
              min="50" 
              max="100" 
              step="5"
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <p className="text-xs text-slate-500">Mínimo de respuestas correctas requeridas para desbloquear el siguiente nivel.</p>
          </div>
        </motion.div>

        {/* Tiempos por Nivel */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col gap-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Clock className="text-amber-400" size={22} /> Tiempos por Nivel
          </h3>
          
          <div className="space-y-6">
            {[
              { id: 'easy', label: 'Nivel 1 (Fácil)', color: 'text-green-400' },
              { id: 'easy_medium', label: 'Nivel 2 (Medio Fácil)', color: 'text-emerald-400' },
              { id: 'medium', label: 'Nivel 3 (Medio)', color: 'text-amber-400' },
              { id: 'medium_hard', label: 'Nivel 4 (Medio Difícil)', color: 'text-orange-400' },
              { id: 'hard', label: 'Nivel 5 (Difícil)', color: 'text-red-400' },
            ].map((level) => (
              <div key={level.id} className="space-y-2 flex flex-col opacity-100 transition-opacity" style={{ opacity: useTimer ? 1 : 0.4 }}>
                <div className="flex justify-between items-center">
                  <label className={`text-sm font-bold ${level.color}`}>{level.label}</label>
                  <span className="text-white font-black bg-white/10 px-3 py-1 rounded-lg border border-white/5">
                    {timers[level.id as keyof typeof timers]}s
                  </span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="60" 
                  value={timers[level.id as keyof typeof timers]}
                  onChange={(e) => setTimers({ ...timers, [level.id]: parseInt(e.target.value) })}
                  disabled={!useTimer}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PedagogyTab;
