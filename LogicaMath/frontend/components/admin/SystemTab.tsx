import React, { useState, useEffect } from 'react';
import { getSystemConfig, updateSystemConfig } from '../../services/storageService';
import { Server, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  showAlert?: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const SystemTab: React.FC<Props> = ({ showAlert }) => {
  const [systemConfig, setSystemConfig] = useState({ vps_host: '', ssh_user: '', database_url: '' });
  const [savingSystemConfig, setSavingSystemConfig] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sysConf = await getSystemConfig();
    setSystemConfig(sysConf);
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

  return (
    <div className="w-full flex flex-col items-center justify-start relative z-10">
      <motion.div initial="hidden" animate="show" variants={containerVariants} className="w-full flex flex-col max-w-4xl mx-auto">
        <motion.div variants={itemVariants} className="w-full glass-card p-8 mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Server size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Conexión de Base de Datos y Servidor</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Configura las credenciales de la base de datos de producción (PostgreSQL) y la VPS.</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveSystemConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">DATABASE_URL (PostgreSQL)</label>
              <input 
                required 
                value={systemConfig.database_url} 
                onChange={e => setSystemConfig({...systemConfig, database_url: e.target.value})}
                className="glass-input text-sm" 
                placeholder="postgresql+asyncpg://user:pass@host:5432/db" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">VPS Host IP</label>
              <input 
                value={systemConfig.vps_host} 
                onChange={e => setSystemConfig({...systemConfig, vps_host: e.target.value})}
                className="glass-input text-sm" 
                placeholder="34.9.51.225" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">SSH User</label>
              <input 
                value={systemConfig.ssh_user} 
                onChange={e => setSystemConfig({...systemConfig, ssh_user: e.target.value})}
                className="glass-input text-sm" 
                placeholder="ssh rominejo@34.9.51.225" 
              />
            </div>
            <div className="flex items-end justify-end md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit" 
                disabled={savingSystemConfig}
                className="glass-button-primary flex items-center gap-2"
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
