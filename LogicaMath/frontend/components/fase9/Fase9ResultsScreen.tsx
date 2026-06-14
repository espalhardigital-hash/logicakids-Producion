import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSimuladoStore } from '../../store/simuladoStore';
import { ArrowLeft, Target, AlertCircle, PlayCircle, Trophy, BookOpen } from 'lucide-react';

export const Fase9ResultsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const { preguntas, sessionId } = useSimuladoStore();

  if (!state || !state.resultados) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-300">No hay resultados disponibles</h2>
          <button 
            onClick={() => navigate('/fase/9/dashboard')} 
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { resultados, moduloId, nivelId } = state;
  const { puntaje, total, porcentaje, errores } = resultados;

  // Determine performance color and message
  let perfColor = "text-emerald-500";
  let bgPerfColor = "bg-emerald-500/10 border-emerald-500/20";
  let message = "¡Excelente Trabajo!";
  let subMessage = "Estás listo para el examen real.";

  if (porcentaje < 50) {
    perfColor = "text-red-500";
    bgPerfColor = "bg-red-500/10 border-red-500/20";
    message = "Necesitamos Repasar";
    subMessage = "Revisa tus errores con el Tutor IA.";
  } else if (porcentaje < 80) {
    perfColor = "text-yellow-500";
    bgPerfColor = "bg-yellow-500/10 border-yellow-500/20";
    message = "Buen Progreso";
    subMessage = "Sigue practicando para alcanzar la maestría.";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header simple */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/fase/9/dashboard')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Clínica de Errores</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta de Score General */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
            <div className={`absolute top-0 w-full h-2 ${bgPerfColor.split(' ')[0].replace('/10', '')}`}></div>
            
            <div className="relative w-40 h-40 flex items-center justify-center mb-6 mt-4">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <circle 
                  cx="80" cy="80" r="70" 
                  className={`stroke-current ${perfColor} transition-all duration-1000 ease-out`} 
                  strokeWidth="12" 
                  strokeDasharray="439.8" 
                  strokeDashoffset={439.8 - (439.8 * porcentaje) / 100}
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>
              <div className="text-4xl font-black text-white">{Math.round(porcentaje)}<span className="text-xl text-slate-500">%</span></div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{message}</h2>
            <p className="text-slate-400 mb-6">{subMessage}</p>

            <div className={`w-full p-4 rounded-xl border flex justify-around items-center ${bgPerfColor}`}>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aciertos</p>
                <p className={`text-2xl font-bold ${perfColor}`}>{puntaje}</p>
              </div>
              <div className="w-px h-10 bg-slate-700/50"></div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-300">{total}</p>
              </div>
            </div>
          </div>

          {/* Lista de Errores */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <Target className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Preguntas a Reforzar</h3>
                <p className="text-sm text-slate-400">{errores.length} conceptos requieren revisión</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {errores.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
                  <Trophy className="w-16 h-16 text-yellow-500/50 mb-4" />
                  <h4 className="text-lg font-bold text-slate-300">¡Examen Perfecto!</h4>
                  <p className="text-slate-500 mt-2 max-w-sm">No cometiste ningún error en este simulacro. Tienes dominio total sobre estos conceptos.</p>
                </div>
              ) : (
                errores.map((err: any, idx: number) => {
                  const q = preguntas.find((p) => String(p.id) === String(err.pregunta_id));
                  if (!q) return null;
                  
                  return (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-800">
                          Q
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 line-clamp-2 text-sm leading-relaxed mb-3">
                            {q.enunciado}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-md border border-indigo-500/20 text-xs font-bold transition-colors">
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Tutor IA</span>
                            </button>
                            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-md border border-slate-700 text-xs font-bold transition-colors">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Ver Teoría</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {errores.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-800">
                <button className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2">
                  <PlayCircle className="w-5 h-5" />
                  <span>Iniciar Camino del Maestro (Corregir Todos)</span>
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};
