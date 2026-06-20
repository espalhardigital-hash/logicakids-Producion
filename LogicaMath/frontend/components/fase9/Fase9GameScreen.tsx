import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSimuladoStore } from '../../store/simuladoStore';
import { Flag, Clock, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, Send } from 'lucide-react';
import api from '../../services/api';

const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const Fase9GameScreen: React.FC = () => {
  const { moduloId, nivelId } = useParams();
  const navigate = useNavigate();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const {
    sessionId,
    preguntas,
    respuestas,
    marcadoresRevision,
    tiempoRestanteSegundos,
    estado,
    iniciarSimulado,
    seleccionarRespuesta,
    toggleMarcador,
    tickTiempo,
    entregarSimulado,
    resultados
  } = useSimuladoStore();

  useEffect(() => {
    if (moduloId && nivelId && estado === 'NO_INICIADO') {
      iniciarSimulado(parseInt(moduloId), parseInt(nivelId));
    }
  }, [moduloId, nivelId, estado, iniciarSimulado]);

  useEffect(() => {
    if (estado === 'EN_CURSO') {
      const timer = setInterval(() => {
        tickTiempo();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [estado, tickTiempo]);

  useEffect(() => {
    if (estado === 'FINALIZADO' && resultados) {
      // Navegar a los resultados
      navigate(`/fase/9/resultados`, { state: { resultados, moduloId, nivelId } });
    }
  }, [estado, resultados, navigate, moduloId, nivelId]);

  if (estado === 'CARGANDO' || estado === 'NO_INICIADO') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
        <p className="ml-4 text-slate-300 font-medium text-lg">Preparando Simulacro Pedro II...</p>
      </div>
    );
  }

  if (!preguntas || preguntas.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-100">Simulacro no disponible</h2>
        <p className="text-slate-400 mt-2">Ocurrió un error al cargar las preguntas.</p>
        <button onClick={() => navigate('/welcome-fase9')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const currentQ = preguntas[currentQIndex];
  const isMarked = marcadoresRevision.includes(currentQ.id);
  const selectedAlt = respuestas[currentQ.id];
  
  // Timer color logic
  let timerColor = "text-slate-200 bg-slate-800 border-slate-700";
  if (tiempoRestanteSegundos < 60) {
    timerColor = "text-red-100 bg-red-900/50 border-red-500/50 animate-pulse";
  } else if (tiempoRestanteSegundos < 300) {
    timerColor = "text-orange-100 bg-orange-900/50 border-orange-500/50";
  }

  const handleEntregar = async () => {
    await entregarSimulado();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-sm flex items-center justify-between px-4 sm:px-8 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <span className="font-bold text-white text-lg tracking-wider">PII</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg hidden sm:block text-slate-100">Simulacro Pedro II</h1>
            <p className="text-xs text-slate-400">Modo Examen Estricto</p>
          </div>
        </div>
        
        {/* CRONÓMETRO */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${timerColor} transition-colors duration-500`}>
          <Clock className="w-5 h-5" />
          <span className="font-mono font-bold text-xl tracking-wider">
            {formatTime(tiempoRestanteSegundos)}
          </span>
        </div>
        
        {/* BOTÓN ENTREGAR */}
        <button 
          onClick={() => setShowConfirmSubmit(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-600/30 active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:block">Entregar</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* PANEL IZQUIERDO: GRID DE NAVEGACIÓN */}
        <div className="md:w-72 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto flex-shrink-0 flex flex-col hidden md:flex">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Preguntas ({preguntas.length})</h3>
          <div className="grid grid-cols-4 gap-3">
            {preguntas.map((q, idx) => {
              const answered = !!respuestas[q.id];
              const flagged = marcadoresRevision.includes(q.id);
              const active = idx === currentQIndex;
              
              let btnClass = "relative w-12 h-12 rounded-full font-bold text-sm flex items-center justify-center transition-all duration-200 border-2 ";
              
              if (active) {
                btnClass += "ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 scale-110 z-10";
              } else if (flagged) {
                btnClass += "border-orange-500 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20";
              } else if (answered) {
                btnClass += "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600";
              } else {
                btnClass += "border-slate-800 bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-slate-400";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={btnClass}
                >
                  {idx + 1}
                  {flagged && (
                    <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-0.5">
                      <Flag className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    </div>
                  )}
                  {answered && !flagged && !active && (
                    <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-800/50 space-y-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border-2 border-slate-600 bg-slate-700"></div>
              <span>Respondida</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-orange-500/10"></div>
              <span>Para revisión</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full border-2 border-slate-800 bg-slate-800/50"></div>
              <span>Sin responder</span>
            </div>
          </div>
        </div>

        {/* ÁREA CENTRAL: PREGUNTA Y ALTERNATIVAS */}
        <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
          <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col">
            
            {/* Controles superiores de pregunta */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-black text-slate-300">Questão {currentQIndex + 1}</span>
              </div>
              <button
                onClick={() => toggleMarcador(currentQ.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all border ${
                  isMarked 
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <Flag className={`w-4 h-4 ${isMarked ? 'fill-orange-400' : ''}`} />
                <span className="font-medium">{isMarked ? 'Marcada' : 'Revisar después'}</span>
              </button>
            </div>

            {/* Enunciado (sin animaciones lúdicas) */}
            <div className="prose prose-invert max-w-none mb-10">
              <p className="text-xl leading-relaxed text-slate-200 whitespace-pre-wrap font-serif">
                {currentQ.enunciado}
              </p>
            </div>

            {/* Alternativas */}
            <div className="space-y-4 mt-auto mb-12">
              {currentQ.alternativas.map((alt) => {
                const isSelected = selectedAlt === alt.id;
                return (
                  <button
                    key={alt.id}
                    onClick={() => seleccionarRespuesta(currentQ.id, alt.id)}
                    className={`fg-alternative-button w-full text-left p-5 rounded-xl border-2 transition-all flex items-start space-x-4 group ${
                      isSelected 
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-100 shadow-inner' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600 group-hover:border-slate-400'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                    </div>
                    <span className="text-lg leading-tight font-medium pt-0.5">{alt.texto}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* BARRA DE NAVEGACIÓN INFERIOR MOBILE & NEXT/PREV */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 sticky bottom-0 z-40 mt-auto">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setCurrentQIndex(i => Math.max(0, i - 1))}
                disabled={currentQIndex === 0}
                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              
              <div className="text-slate-400 font-medium">
                {currentQIndex + 1} de {preguntas.length}
              </div>

              <button
                onClick={() => {
                  if (currentQIndex < preguntas.length - 1) {
                    setCurrentQIndex(i => i + 1);
                  } else {
                    setShowConfirmSubmit(true);
                  }
                }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-bold transition-all shadow-md shadow-indigo-900/20 active:scale-95"
              >
                <span className="hidden sm:inline">{currentQIndex === preguntas.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-2">¿Entregar Simulacro?</h2>
            
            <div className="my-6 space-y-3">
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400">Respondidas</span>
                <span className="font-bold text-emerald-400">{Object.keys(respuestas).length} / {preguntas.length}</span>
              </div>
              
              {marcadoresRevision.length > 0 && (
                <div className="flex justify-between items-center bg-orange-900/10 p-3 rounded-lg border border-orange-500/20">
                  <span className="text-orange-400/80">Para revisión</span>
                  <span className="font-bold text-orange-400 flex items-center gap-1">
                    <Flag className="w-4 h-4 fill-orange-400" /> {marcadoresRevision.length}
                  </span>
                </div>
              )}
              
              {Object.keys(respuestas).length < preguntas.length && (
                <div className="flex items-start space-x-3 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg mt-4">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Aún tienes preguntas sin responder. Se calificarán como incorrectas.</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                disabled={estado === 'FINALIZANDO'}
              >
                Volver
              </button>
              <button
                onClick={handleEntregar}
                disabled={estado === 'FINALIZANDO'}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors flex justify-center items-center"
              >
                {estado === 'FINALIZANDO' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Entregar Examen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
