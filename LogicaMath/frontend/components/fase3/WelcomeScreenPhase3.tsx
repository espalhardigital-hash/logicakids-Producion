import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Fase3Styles.css';

export const WelcomeScreenPhase3: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fase3-container flex flex-col items-center justify-center min-h-screen text-center p-6 relative overflow-hidden">
      
      {/* Elementos decorativos cyberpunk */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-[100px] opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500 rounded-full blur-[120px] opacity-20"></div>
      
      <div className="max-w-3xl z-10 bg-slate-900/80 p-10 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Bienvenido a la <span className="text-orange-500">Fase 3</span>
        </h1>
        
        <h2 className="text-2xl text-slate-300 font-semibold mb-6">
          Problemas de Texto y Sistemas Simples
        </h2>
        
        <p className="text-lg text-slate-400 mb-8 leading-relaxed text-justify">
          ¡Atención, Detective Numérico! El monstruo del desorden ha ocultado los números dentro de largas historias y trampas temporales. 
          En esta fase, tu misión es usar el <strong>Cuaderno del Detective</strong> para escanear la verdad, ignorar la basura numérica 
          y construir operaciones lógicas para resolver el misterio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-orange-400 font-bold mb-2 flex items-center">
              <span className="text-2xl mr-2">🔎</span> Escáner de la Verdad
            </h3>
            <p className="text-sm text-slate-400">Encuentra los datos importantes y descarta los distractores.</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <h3 className="text-yellow-400 font-bold mb-2 flex items-center">
              <span className="text-2xl mr-2">⏳</span> Máquina del Tiempo
            </h3>
            <p className="text-sm text-slate-400">Resuelve historias viajando al pasado con operaciones inversas.</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/fase3/play', { state: { moduloId: 1, nivelId: 1 } })}
          className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all transform hover:scale-105"
        >
          INICIAR MISIÓN
        </button>
      </div>
    </div>
  );
};
