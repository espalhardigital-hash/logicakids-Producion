import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, RefreshCw, Server, Shield, Cpu, Activity, ListChecks } from 'lucide-react';

interface Task {
  id: string;
  nombre: string;
  descripcion: string;
  completado: boolean;
}

interface StageData {
  descripcion: string;
  tareas: Task[];
}

interface SreProgress {
  [stageName: string]: StageData;
}

const SRE_ENDPOINT = import.meta.env.VITE_SRE_ENDPOINT ?? 'http://localhost:9323/progreso_sre.json';

const SreTab: React.FC = () => {
  const [data, setData] = useState<SreProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSreData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(SRE_ENDPOINT);
      if (!response.ok) {
        throw new Error(
          `No se pudo conectar al servidor de reportes.\n` +
          `URL: ${SRE_ENDPOINT}\n` +
          `Configura VITE_SRE_ENDPOINT en tu .env si estás en producción.`
        );
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con http://localhost:9323');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSreData();
  }, []);

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'build': return <Cpu className="text-[#007AFF]" size={20} />;
      case 'test': return <Activity className="text-[#10b981]" size={20} />;
      case 'deploy': return <Server className="text-[#8b5cf6]" size={20} />;
      case 'monitor': return <Shield className="text-[#f59e0b]" size={20} />;
      default: return <ListChecks className="text-slate-400" size={20} />;
    }
  };

  // Calculate totals
  let totalTasks = 0;
  let completedTasks = 0;
  if (data) {
    Object.keys(data).forEach(stage => {
      const stageTasks = data[stage].tareas || [];
      totalTasks += stageTasks.length;
      completedTasks += stageTasks.filter(t => t.completado).length;
    });
  }
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-[#007AFF]" /> Principios ENG / SRE & Calidad
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Monitoreo en tiempo real del ciclo de vida y compuertas de calidad ("production-grade or nothing").
          </p>
        </div>
        <button
          onClick={fetchSreData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Cargando métricas de calidad...</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3">
          <AlertTriangle className="text-red-500" size={40} />
          <div>
            <h3 className="font-semibold text-red-500">Servidor de Reportes Desconectado</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-md">
              Asegúrate de tener levantado el servidor Docker en el puerto 9323 (`docker compose up -d test-reports`).
            </p>
          </div>
          <button
            onClick={fetchSreData}
            className="px-4 py-2 bg-[#007AFF] text-white rounded-lg text-xs font-bold hover:bg-[#0062cc] transition-colors"
          >
            Reintentar Conexión
          </button>
        </div>
      )}

      {data && !loading && !error && (
        <>
          {/* Overall Progress Panel */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Progreso del Pipeline</span>
                <h3 className="text-3xl font-extrabold mt-1 text-[#007AFF] dark:text-[#3b82f6]">
                  {overallPercent}% <span className="text-sm font-medium text-slate-500 dark:text-slate-400">({completedTasks} de {totalTasks} Checkpoints aprobados)</span>
                </h3>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-[#007AFF] to-[#00c6ff] h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Grid of Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(data).map((stage) => {
              const stageData = data[stage];
              const stageTasks = stageData.tareas || [];
              const completedStage = stageTasks.filter(t => t.completado).length;
              const stagePercent = stageTasks.length > 0 ? Math.round((completedStage / stageTasks.length) * 100) : 0;

              return (
                <div key={stage} className="glass-card p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      {getStageIcon(stage)}
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{stage}</h4>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-[#007AFF]/10 text-[#007AFF]">
                      {stagePercent}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {stageData.descripcion}
                  </p>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#007AFF] h-full rounded-full" 
                      style={{ width: `${stagePercent}%` }}
                    />
                  </div>

                  <div className="space-y-2.5 mt-2">
                    {stageTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`flex gap-3 p-3 rounded-xl border border-transparent transition-colors ${
                          task.completado 
                            ? 'bg-green-500/5 dark:bg-green-500/5 hover:bg-green-500/10' 
                            : 'bg-amber-500/5 dark:bg-amber-500/5 hover:bg-amber-500/10'
                        }`}
                      >
                        <div className={`mt-0.5 flex-shrink-0`}>
                          {task.completado ? (
                            <CheckCircle2 className="text-[#10b981]" size={16} />
                          ) : (
                            <AlertTriangle className="text-amber-500" size={16} />
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-xs font-semibold ${task.completado ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {task.nombre}
                          </span>
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                            {task.descripcion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SreTab;
