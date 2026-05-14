import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, Clock, Layers, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, Loader2, Percent, Target } from 'lucide-react';
import { getIdToken } from '../../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface PedagogyConfig {
  questionsPerPhase: number;
  timers: {
    easy: number;
    easy_medium: number;
    medium: number;
    medium_hard: number;
    hard: number;
  };
  useTimer: boolean;
  passingScore: number;
}

const DEFAULT_CONFIG: PedagogyConfig = {
  questionsPerPhase: 50,
  timers: { easy: 10, easy_medium: 12, medium: 14, medium_hard: 16, hard: 18 },
  useTimer: true,
  passingScore: 85,
};

// Slider with live tooltip showing current value
const SliderWithTooltip: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  accentColor: string;
  unit?: string;
}> = ({ value, min, max, step = 1, onChange, disabled = false, accentColor, unit = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full group pt-2">
      {/* Floating tooltip */}
      <div
        className="absolute -top-1 transform -translate-x-1/2 pointer-events-none transition-all"
        style={{ left: `${percentage}%` }}
      >
        <div className={`bg-white text-slate-900 font-black text-xs px-2.5 py-1 rounded-lg shadow-xl border border-white/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity`}>
          {value}{unit}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      </div>

      {/* Track background with filled portion */}
      <div className="relative w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-150 ${accentColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Invisible range input on top */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      {/* Custom thumb indicator */}
      <div
        className="absolute top-2 w-5 h-5 -mt-[5px] -ml-2.5 rounded-full border-[3px] border-white bg-slate-900 shadow-lg pointer-events-none transition-all"
        style={{ left: `${percentage}%` }}
      />

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-slate-600 font-bold">{min}{unit}</span>
        <span className="text-[9px] text-slate-600 font-bold">{max}{unit}</span>
      </div>
    </div>
  );
};

const PedagogyTab: React.FC = () => {
  const [config, setConfig] = useState<PedagogyConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<PedagogyConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        const merged = { ...DEFAULT_CONFIG, ...data, timers: { ...DEFAULT_CONFIG.timers, ...(data.timers || {}) } };
        setConfig(merged);
        setSavedConfig(merged);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const token = await getIdToken();
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveStatus('success');
        setSavedConfig({ ...config });
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  const updateTimer = (key: keyof PedagogyConfig['timers'], value: number) => {
    setConfig(prev => ({ ...prev, timers: { ...prev.timers, [key]: value } }));
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-500 animate-spin" size={48} />
          <p className="text-slate-400 font-bold text-sm">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Settings className="text-blue-400" size={24} />
            </div>
            Configuración Pedagógica
          </h2>
          <p className="text-slate-400 text-sm mt-1">Ajusta los parámetros del juego, tiempos y cantidad de preguntas.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 ${
            saveStatus === 'success'
              ? 'bg-green-600 hover:bg-green-500'
              : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500'
          } text-white`}
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> :
           saveStatus === 'success' ? <CheckCircle size={20} /> :
           saveStatus === 'error' ? <AlertCircle size={20} /> :
           <Save size={20} />}
          {saving ? 'Guardando...' :
           saveStatus === 'success' ? '¡Guardado!' :
           saveStatus === 'error' ? 'Error' :
           hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
        </button>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-3 flex items-center gap-3"
        >
          <AlertCircle size={18} className="text-amber-400" />
          <span className="text-amber-300 text-sm font-bold">Tienes cambios sin guardar</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: General Parameters */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col gap-8">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="text-purple-400" size={22} /> Volumen de Ejercicios
          </h3>

          {/* Questions Per Phase */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-slate-300 font-bold">Preguntas por Fase/Bloque</label>
              <span className="text-xl font-black text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-xl border border-blue-500/20 min-w-[90px] text-center">
                {config.questionsPerPhase}
              </span>
            </div>
            <SliderWithTooltip
              value={config.questionsPerPhase}
              min={10}
              max={100}
              step={5}
              onChange={(val) => setConfig(prev => ({ ...prev, questionsPerPhase: val }))}
              accentColor="bg-blue-500"
            />
            <p className="text-xs text-slate-500">Cuántas preguntas necesita un alumno para superar una sección.</p>
          </div>

          {/* Timer Toggle */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-slate-300 font-bold">Cronómetro Global</label>
                <p className="text-xs text-slate-500 mt-1">Activa o desactiva la presión de tiempo.</p>
              </div>
              <button onClick={() => setConfig(prev => ({ ...prev, useTimer: !prev.useTimer }))} className="text-blue-400 transition-all hover:scale-110">
                {config.useTimer ? <ToggleRight size={44} className="text-blue-500" /> : <ToggleLeft size={44} className="text-slate-600" />}
              </button>
            </div>
          </div>

          {/* Passing Score */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-slate-300 font-bold flex items-center gap-2">
                <Target size={16} className="text-green-400" /> Porcentaje para Aprobar
              </label>
              <span className="text-xl font-black text-green-400 bg-green-500/10 px-4 py-1.5 rounded-xl border border-green-500/20 min-w-[80px] text-center">
                {config.passingScore}%
              </span>
            </div>
            <SliderWithTooltip
              value={config.passingScore}
              min={50}
              max={100}
              step={5}
              onChange={(val) => setConfig(prev => ({ ...prev, passingScore: val }))}
              accentColor="bg-green-500"
              unit="%"
            />
            <p className="text-xs text-slate-500">Mínimo de respuestas correctas para desbloquear el siguiente nivel.</p>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Timer Settings */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col gap-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Clock className="text-amber-400" size={22} /> Tiempos por Nivel
          </h3>

          <div className="space-y-7" style={{ opacity: config.useTimer ? 1 : 0.35, transition: 'opacity 0.3s' }}>
            {([
              { id: 'easy' as const, label: 'Nivel 1 (Fácil)', color: 'text-green-400', accent: 'bg-green-500' },
              { id: 'easy_medium' as const, label: 'Nivel 2 (Medio Fácil)', color: 'text-emerald-400', accent: 'bg-emerald-500' },
              { id: 'medium' as const, label: 'Nivel 3 (Medio)', color: 'text-amber-400', accent: 'bg-amber-500' },
              { id: 'medium_hard' as const, label: 'Nivel 4 (Medio Difícil)', color: 'text-orange-400', accent: 'bg-orange-500' },
              { id: 'hard' as const, label: 'Nivel 5 (Difícil)', color: 'text-red-400', accent: 'bg-red-500' },
            ]).map((level) => (
              <div key={level.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`text-sm font-bold ${level.color}`}>{level.label}</label>
                  <span className="text-lg font-black text-white bg-white/10 px-4 py-1 rounded-xl border border-white/5 min-w-[70px] text-center">
                    {config.timers[level.id]}s
                  </span>
                </div>
                <SliderWithTooltip
                  value={config.timers[level.id]}
                  min={3}
                  max={60}
                  onChange={(val) => updateTimer(level.id, val)}
                  disabled={!config.useTimer}
                  accentColor={level.accent}
                  unit="s"
                />
              </div>
            ))}
          </div>

          {!config.useTimer && (
            <div className="mt-2 bg-slate-800/50 border border-white/5 rounded-2xl p-4 text-center">
              <p className="text-slate-500 text-xs font-bold">⏸️ Cronómetro desactivado — los tiempos no se aplicarán</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PedagogyTab;
