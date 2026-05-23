import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Settings, Activity, Menu, X, LogOut, BookOpen } from 'lucide-react';
import GeneralTab from './GeneralTab';
import PedagogyTab from './PedagogyTab';
import PerformanceTab from './PerformanceTab';
import ContentTab from './ContentTab';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

type TabType = 'general' | 'pedagogy' | 'performance' | 'content';

const AdminPanel: React.FC<Props> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Custom Admin UI Settings
  const [adminScale, setAdminScale] = useState<number>(100);
  const [adminFontFamily, setAdminFontFamily] = useState<string>('');

  useEffect(() => {
    const savedScale = localStorage.getItem('adminScale');
    const savedFont = localStorage.getItem('adminFontFamily');
    if (savedScale) setAdminScale(Number(savedScale));
    if (savedFont) setAdminFontFamily(savedFont);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminScale', adminScale.toString());
    localStorage.setItem('adminFontFamily', adminFontFamily);
    
    const html = document.documentElement;
    const originalFontSize = html.style.fontSize;
    html.style.fontSize = `${adminScale}%`;

    return () => {
      html.style.fontSize = originalFontSize;
    };
  }, [adminScale, adminFontFamily]);

  const tabs = [
    { id: 'general', label: 'Vista General', icon: LayoutDashboard },
    { id: 'pedagogy', label: 'Config. Pedagógica', icon: Settings },
    { id: 'performance', label: 'Rendimiento Estudiantil', icon: Activity },
    { id: 'content', label: 'Banco de Preguntas', icon: BookOpen },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Cierra sidebar en móvil al seleccionar
  };

  return (
    <div 
      className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-gray-950 to-black text-white overflow-hidden w-full h-full flex custom-scrollbar"
      style={{ fontFamily: adminFontFamily || undefined }}
    >
      {/* Elementos Decorativos */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Botón menú móvil */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-6 left-6 z-50 p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl text-white"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay Móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed md:relative z-40 h-full w-72 flex flex-col bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-red-500/20 rounded-2xl border border-red-500/30">
              <Shield className="text-red-500" size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">Admin Pro</h2>
              <p className="text-sm font-bold text-blue-400 tracking-widest uppercase">LogicaKids</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-base tracking-wide relative overflow-hidden group ${
                  isActive 
                    ? 'text-white bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill" 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon size={20} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Controles de Ajuste UI (Solo Admin) */}
        <div className="px-5 py-4 mt-2 border-t border-white/10 bg-black/20">
          <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Ajustes Visuales</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400">Escala de Interfaz</label>
                <span className="text-xs text-blue-400 font-bold">{adminScale}%</span>
              </div>
              <input 
                type="range" 
                min="80" 
                max="150" 
                step="5" 
                value={adminScale} 
                onChange={(e) => setAdminScale(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tipo de Fuente</label>
              <select 
                value={adminFontFamily} 
                onChange={(e) => setAdminFontFamily(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                style={{ fontFamily: adminFontFamily || undefined }}
              >
                <option value="">Predeterminada (Outfit)</option>
                <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans</option>
                <option value="'OpenDyslexic', 'Comic Sans MS', sans-serif">Alta Legibilidad</option>
                <option value="monospace">Monospace (Terminal)</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="'Times New Roman', Times, serif">Serif Clásica</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-base font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            Ir a Pruebas (Jugar)
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-sm font-bold transition-all"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10 p-6 pt-20 md:p-10 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <GeneralTab onBack={onBack} />
              </motion.div>
            )}
            {activeTab === 'pedagogy' && (
              <motion.div key="pedagogy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <PedagogyTab />
              </motion.div>
            )}
            {activeTab === 'performance' && (
              <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <PerformanceTab />
              </motion.div>
            )}
            {activeTab === 'content' && (
              <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <ContentTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
