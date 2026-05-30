import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Settings, Activity, Menu, X, LogOut, BookOpen, Server } from 'lucide-react';
import GeneralTab from './GeneralTab';
import PedagogyTab from './PedagogyTab';
import PerformanceTab from './PerformanceTab';
import ContentTab from './ContentTab';
import SystemTab from './SystemTab';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

type TabType = 'general' | 'pedagogy' | 'performance' | 'content' | 'system';

const AdminPanel: React.FC<Props> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Custom Admin UI Settings
  const [adminScale, setAdminScale] = useState<number>(100);
  const [adminFontFamily, setAdminFontFamily] = useState<string>('');

  // Dialog (Modal Alert/Confirm) State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    alertType?: 'info' | 'success' | 'error';
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, alertType: 'info' | 'success' | 'error' = 'info') => {
    setDialogState({
      isOpen: true,
      type: 'alert',
      title,
      message,
      alertType,
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setDialogState({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm,
      onCancel,
    });
  };

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
    { id: 'system', label: 'Servidor y BD', icon: Server },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Cierra sidebar en móvil al seleccionar
  };

  return (
    <div 
      className="apple-admin fixed inset-0 bg-[#0d0e12] text-slate-900 dark:text-[#f3f4f6] overflow-hidden w-full h-full flex custom-scrollbar"
      style={{ fontFamily: adminFontFamily || undefined }}
    >
      {/* Dynamic CSS Scope Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .apple-admin {
          --apple-blue: #007AFF;
          --apple-green: #34C759;
          --apple-gray: #8E8E93;
          --apple-bg: #0d0e12;
          --apple-card: rgba(22, 24, 30, 0.7);
          --apple-border: rgba(255, 255, 255, 0.08);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        }

        /* custom modern scrollbar */
        .apple-admin ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .apple-admin ::-webkit-scrollbar-track {
          background: transparent;
        }
        .apple-admin ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 99px;
        }
        .apple-admin ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Beautiful iOS inputs, selects and textareas override */
        .apple-admin input[type="text"],
        .apple-admin input[type="email"],
        .apple-admin input[type="password"],
        .apple-admin input[type="number"],
        .apple-admin select,
        .apple-admin textarea {
          background: rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 10px !important;
          color: #f3f4f6 !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          outline: none !important;
        }
        .apple-admin input[type="text"]:focus,
        .apple-admin input[type="email"]:focus,
        .apple-admin input[type="password"]:focus,
        .apple-admin input[type="number"]:focus,
        .apple-admin select:focus,
        .apple-admin textarea:focus {
          border-color: var(--apple-blue) !important;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2) !important;
          background: rgba(0, 0, 0, 0.3) !important;
        }

        /* Sleek Apple-style Table headers and rows */
        .apple-admin table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          width: 100% !important;
        }
        .apple-admin th {
          background: rgba(255, 255, 255, 0.02) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
          color: #9ca3af !important;
          font-weight: 500 !important;
          text-transform: none !important;
          font-size: 13px !important;
          padding: 10px 14px !important;
          text-align: left !important;
        }
        .apple-admin td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
          padding: 12px 14px !important;
          font-size: 14px !important;
          color: #d1d5db !important;
        }
        .apple-admin tr:hover td {
          background: rgba(255, 255, 255, 0.02) !important;
        }

        /* Apple cards overrides */
        .apple-admin .glass-card {
          background: var(--apple-card) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid var(--apple-border) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
          border-radius: 16px !important;
        }

        /* iOS Toggle Switch Styles */
        .apple-admin .ios-switch-container {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }
        .apple-admin .ios-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.12);
          border-radius: 99px;
          transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .apple-admin .ios-switch-active {
          background-color: var(--apple-green) !important;
        }
        .apple-admin .ios-switch-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: #ffffff;
          border-radius: 99px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .apple-admin .ios-switch-active .ios-switch-knob {
          transform: translateX(20px);
        }
      ` }} />

      {/* Subtle Ambient Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.3))] pointer-events-none z-0"></div>

      {/* Botón menú móvil */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-6 left-6 z-50 p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg backdrop-blur-xl text-slate-900 dark:text-[#f3f4f6] hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10 transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay Móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-200/40 dark:bg-black/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Apple macOS style navigation */}
      <div className={`fixed md:relative z-40 h-full w-64 flex flex-col bg-[#14151b]/80 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
              <Shield className="text-[#007AFF]" size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-tight leading-none">Administrador</h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-1 uppercase">LogicaKids Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3.5 py-4 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-medium text-[14.5px] tracking-normal relative overflow-hidden group ${
                  isActive 
                    ? 'text-slate-900 dark:text-white bg-[#007AFF]' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-white/5'
                }`}
              >
                <tab.icon size={17} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Controles de Ajuste UI (macOS System Preferences style) */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-white/5 bg-black/10">
          <p className="text-[10px] font-semibold text-slate-500 mb-3 uppercase tracking-wider">Ajustes Visuales</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11.5px] text-slate-500 dark:text-slate-400">Escala</label>
                <span className="text-[11.5px] text-[#007AFF] font-medium">{adminScale}%</span>
              </div>
              <input 
                type="range" 
                min="85" 
                max="135" 
                step="5" 
                value={adminScale} 
                onChange={(e) => setAdminScale(Number(e.target.value))}
                className="w-full h-1 bg-white/80 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
              />
            </div>
            
            <div>
              <label className="text-[11.5px] text-slate-500 dark:text-slate-400 mb-1 block">Familia Tipográfica</label>
              <select 
                value={adminFontFamily} 
                onChange={(e) => setAdminFontFamily(e.target.value)}
                className="w-full bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg p-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors"
                style={{ fontFamily: adminFontFamily || undefined }}
              >
                <option value="">SF Pro Text (Predeterminada)</option>
                <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans</option>
                <option value="'OpenDyslexic', 'Comic Sans MS', sans-serif">Dyslexic-friendly</option>
                <option value="monospace">Monospace (Terminal)</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions (Sleek Apple layout) */}
        <div className="p-4 space-y-2">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-white/15 text-slate-900 dark:text-white text-[13.5px] font-medium transition-colors"
          >
            Volver a Fase 4
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-400 text-[13.5px] font-medium transition-colors"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10 p-6 pt-20 md:p-10 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <GeneralTab onBack={onBack} showConfirm={showConfirm} showAlert={showAlert} />
              </motion.div>
            )}
            {activeTab === 'pedagogy' && (
              <motion.div key="pedagogy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <PedagogyTab showConfirm={showConfirm} showAlert={showAlert} />
              </motion.div>
            )}
            {activeTab === 'performance' && (
              <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <PerformanceTab showConfirm={showConfirm} showAlert={showAlert} />
              </motion.div>
            )}
            {activeTab === 'content' && (
              <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <ContentTab showConfirm={showConfirm} showAlert={showAlert} />
              </motion.div>
            )}
            {activeTab === 'system' && (
              <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <SystemTab showAlert={showAlert} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Apple Sheet Modal Alert/Confirm */}
      <AnimatePresence>
        {dialogState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="bg-[#1e1f26]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden text-slate-900 dark:text-[#f3f4f6]"
            >
              <h4 className="text-[16px] font-semibold mb-2 tracking-tight text-slate-900 dark:text-white">{dialogState.title}</h4>
              <p className="text-slate-600 dark:text-slate-300 text-[13.5px] mb-6 leading-relaxed whitespace-pre-wrap">{dialogState.message}</p>
              
              <div className="flex gap-2 justify-end">
                {dialogState.type === 'confirm' && (
                  <button
                    onClick={() => {
                      if (dialogState.onCancel) dialogState.onCancel();
                      setDialogState(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="px-4 py-2 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-white/5 transition-colors text-[13px]"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={() => {
                    if (dialogState.type === 'confirm' && dialogState.onConfirm) {
                      dialogState.onConfirm();
                    }
                    setDialogState(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold text-slate-900 dark:text-white text-[13px] transition-colors ${
                    dialogState.type === 'confirm'
                      ? 'bg-red-600 hover:bg-red-500'
                      : dialogState.alertType === 'success'
                        ? 'bg-green-600 hover:bg-green-500'
                        : dialogState.alertType === 'error'
                          ? 'bg-red-600 hover:bg-red-500'
                          : 'bg-[#007AFF] hover:bg-[#208bfe]'
                  }`}
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
