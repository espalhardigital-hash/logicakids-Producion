import React, { useState, useEffect } from 'react';
import { getSystemConfig, updateSystemConfig } from '../../services/storageService';
import { Server, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  showAlert?: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
} as const;

const SystemTab: React.FC<Props> = ({ showAlert }) => {
  const [systemConfig, setSystemConfig] = useState({ vps_host: '', ssh_user: '', database_url: '' });
  const [showDbUrl, setShowDbUrl] = useState(false);
  const [savingSystemConfig, setSavingSystemConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sysConf = await getSystemConfig();
      setSystemConfig(sysConf);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSystemConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSystemConfig(true);
    try {
      const res = await updateSystemConfig(systemConfig);
      if (showAlert) showAlert('Configuración Guardada', res.message, 'success');
      else alert(res.message);
    } catch (err: any) {
      if (showAlert) showAlert('Error', err.message || 'Error al guardar', 'error');
      else alert(err.message || 'Error al guardar');
    } finally {
      setSavingSystemConfig(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start relative z-10">
      <motion.div initial="hidden" animate="show" variants={containerVariants} className="w-full flex flex-col max-w-4xl mx-auto">
        <motion.div variants={itemVariants} className="w-full bg-white dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl mb-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-[1.2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
              <Server size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Servidor y BD</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Configura las credenciales de la base de datos de producción (PostgreSQL) y la VPS.</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveSystemConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">DATABASE_URL (PostgreSQL)</label>
              <div className="relative">
                <input 
                  required 
                  type={showDbUrl ? "text" : "password"}
                  value={systemConfig.database_url} 
                  onChange={e => setSystemConfig({...systemConfig, database_url: e.target.value})}
                  className="w-full pr-12" 
                  placeholder="postgresql+asyncpg://user:pass@host:5432/db" 
                />
                <button
                  type="button"
                  onClick={() => setShowDbUrl(!showDbUrl)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showDbUrl ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">VPS Host IP</label>
              <input 
                type="text"
                value={systemConfig.vps_host} 
                onChange={e => setSystemConfig({...systemConfig, vps_host: e.target.value})}
                className="w-full" 
                placeholder="34.9.51.225" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">SSH User</label>
              <input 
                type="text"
                value={systemConfig.ssh_user} 
                onChange={e => setSystemConfig({...systemConfig, ssh_user: e.target.value})}
                className="w-full" 
                placeholder="ssh rominejo@34.9.51.225" 
              />
            </div>
            <div className="flex items-end justify-end md:col-span-2 pt-6 mt-4 border-t border-slate-200 dark:border-white/5">
              <button 
                type="submit" 
                disabled={savingSystemConfig}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center gap-3 text-white font-black shadow-[0_5px_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {savingSystemConfig ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
                {savingSystemConfig ? 'Guardando...' : 'Guardar y Reconectar'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SystemTab;
