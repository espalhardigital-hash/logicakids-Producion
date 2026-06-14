import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Settings, Activity, Menu, X, LogOut, BookOpen, Server, ArrowLeft, Settings2 } from 'lucide-react';
import './admin.css';
import GeneralTab from './GeneralTab';
import PedagogyTab from './PedagogyTab';
import PerformanceTab from './PerformanceTab';
import ContentTab from './ContentTab';
import SystemTab from './SystemTab';
import SreTab from './SreTab';
import { ThemeToggle } from '../theme/ThemeToggle';
import { PhaseMapProvider } from './PhaseMapContext';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

type TabType = 'general' | 'pedagogy' | 'performance' | 'content' | 'system' | 'sre';

const AdminPanel: React.FC<Props> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Tab notification badges (MEJORA-1)
  const [tabBadges, setTabBadges] = useState<Partial<Record<TabType, number>>>({});
  
  // Custom Admin UI Settings
  const [adminScale, setAdminScale] = useState<number>(100);
  const [adminFontFamily, setAdminFontFamily] = useState<string>('');

  // Evaluator Mode — proper React state (BUG-1 fix)
  const [evaluatorMode, setEvaluatorMode] = useState<boolean>(
    () => localStorage.getItem('evaluatorMode') === 'true'
  );

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
    { id: 'sre', label: 'Monitoreo SRE', icon: Shield },
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Cierra sidebar en móvil al seleccionar
  };

  return (
    <div 
      className="apple-admin fixed inset-0 bg-[var(--apple-bg)] text-[var(--apple-text)] overflow-hidden w-full h-full flex custom-scrollbar transition-colors duration-300"
      style={{ fontFamily: adminFontFamily || undefined }}
    >
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
      <ThemeToggle />

      {/* Sidebar - Apple macOS style navigation */}
      <div className={`fixed md:relative z-40 h-full w-64 flex flex-col bg-white/80 dark:bg-[#14151b]/80 backdrop-blur-3xl border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">LogicaKids Pro</p>
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-[14px] tracking-wide relative overflow-hidden group ${
                  isActive 
                    ? 'text-white bg-[#30589d] shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-200'
                }`}
              >
                <span className="relative z-10 flex-1 text-left">{tab.label}</span>
                {tabBadges[tab.id as TabType] && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {tabBadges[tab.id as TabType]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings button */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-3">Configuración visual</p>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-2 px-0 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-[13px] font-medium transition-colors"
          >
            <Settings2 size={14} />
            Ajustes UI
          </button>
        </div>

        {/* Footer Actions — clear visual hierarchy (MEJORA-2) */}
        <div className="p-4 space-y-2">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white text-[13.5px] font-semibold transition-colors"
          >
            <ArrowLeft size={15} />
            Volver al Viaje
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 text-[12px] font-medium transition-colors"
          >
            <LogOut size={13} />
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
            {activeTab === 'sre' && (
              <motion.div key="sre" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <SreTab />
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
              className="bg-white/95 dark:bg-[#162033]/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden text-slate-900 dark:text-[#f3f4f6]"
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

      {/* Settings Modal (UX-2) */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettingsModal(false)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel border border-slate-200 dark:border-white/10 w-full max-w-sm rounded-[1.5rem] p-6 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Settings2 size={18} className="text-blue-400" />
                  Ajustes de Pantalla
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Scale */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[12px] text-slate-500 dark:text-slate-400">Escala de Interfaz</label>
                    <span className="text-[12px] text-[#007AFF] font-medium">{adminScale}%</span>
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

                {/* Font Family */}
                <div>
                  <label className="text-[12px] text-slate-500 dark:text-slate-400 mb-1.5 block">Familia Tipográfica</label>
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

                {/* Evaluator Mode */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Modo Evaluador</label>
                      <p className="text-[10px] text-slate-500 mt-0.5">Permite saltar preguntas sin evaluar para probar el flujo.</p>
                    </div>
                    <label className="ios-switch-container">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={evaluatorMode}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          setEvaluatorMode(newValue);
                          if (newValue) {
                            localStorage.setItem('evaluatorMode', 'true');
                            showAlert('Modo Evaluador Activado', 'Ahora podrás usar el botón "Saltar" en los juegos para probar el flujo.', 'success');
                          } else {
                            localStorage.removeItem('evaluatorMode');
                            showAlert('Modo Evaluador Desactivado', 'El flujo de juego ha vuelto a la normalidad.', 'info');
                          }
                        }}
                      />
                      <div className={`ios-switch ${evaluatorMode ? 'ios-switch-active' : ''}`}>
                        <div className="ios-switch-knob"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminPanelWrapper: React.FC<Props> = (props) => (
  <PhaseMapProvider>
    <AdminPanel {...props} />
  </PhaseMapProvider>
);

export default AdminPanelWrapper;
