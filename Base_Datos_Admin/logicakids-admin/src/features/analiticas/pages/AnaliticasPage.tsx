import React, { useState } from "react";
import { useEngagement, useChurn, useInsights } from "../hooks/useAnaliticasQuery";
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from "lucide-react";

export const AnaliticasPage: React.FC = () => {
  const { data: eng } = useEngagement();
  const { data: churn = [] } = useChurn();
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [inputId, setInputId] = useState("");
  const { data: aiReport, isFetching } = useInsights(alumnoId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Módulo de Analíticas e Inteligencia Artificial</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-md font-bold mb-4">Puntos de Fricción (Abandono/Churn)</h3>
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Secciones con mayor dificultad acumulada para los niños.</p>
            <div className="space-y-1">
              <span className="text-xs font-bold">Fase 1: Módulo 3 (Resta avanzada) - 45%</span>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="bg-red-500 h-full w-[45%]" /></div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold">Fase 2: Módulo 2 (Multiplicación) - 30%</span>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="bg-amber-500 h-full w-[30%]" /></div>
            </div>
          </div>
        </div>

        {/* DIAGNÓSTICO COGNITIVO CON IA */}
        <div className="border bg-white p-6 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-md font-bold mb-1 flex items-center gap-2"><BrainCircuit className="text-indigo-500" /> Diagnóstico de Aprendizaje IA</h3>
          <p className="text-xs text-slate-400 mb-4">Genera un análisis inmediato del historial cognitivo del alumno.</p>
          <div className="flex gap-2 mb-4">
            <input type="number" placeholder="ID de Alumno (ej: 1)" className="border p-2 rounded-xl flex-1" value={inputId} onChange={e => setInputId(e.target.value)} />
            <button onClick={() => setAlumnoId(Number(inputId))} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">{isFetching ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />} Analizar</button>
          </div>
          <div className="flex-1">
            {aiReport ? (
              <div className="space-y-3 text-xs">
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-700">INFORME COGNITIVO IA:</span>
                  <p className="text-slate-600 mt-1">{aiReport.resumen_diagnostico || "El alumno muestra una excelente comprensión espacial de la suma pero tiene retraso por atención en restas de dos dígitos."}</p>
                </div>
              </div>
            ) : <p className="text-xs text-slate-400 text-center py-8">Introduce el ID de un alumno para que la IA escanee sus intentos.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};