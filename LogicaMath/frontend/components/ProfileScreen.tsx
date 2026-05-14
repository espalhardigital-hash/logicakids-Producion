import React, { useState, useRef } from 'react';
import { User, Difficulty } from '../types';
import { saveUser, uploadAvatar, getAvatarUrl, updateOwnProfile } from '../services/storageService';
import { ArrowLeft, Camera, Save, Settings, User as UserIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  'easy': 'Nivel 1 (Fácil)',
  'easy_medium': 'Nivel 2',
  'medium': 'Nivel 3 (Medio)',
  'medium_hard': 'Nivel 4',
  'hard': 'Nivel 5 (Difícil)',
  'random_tables': 'Tablas Aleatorias'
};

const defaultTimers: Record<Difficulty, number> = {
  'easy': 10,
  'easy_medium': 12,
  'medium': 14,
  'medium_hard': 16,
  'hard': 18,
  'random_tables': 15
};

const ProfileScreen: React.FC<Props> = ({ user, onUpdateUser, onBack }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    password: '',
    confirmPassword: '',
  });

  const [timers, setTimers] = useState<Partial<Record<Difficulty, number>>>(
    user.settings?.customTimers || {}
  );

  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle', message: ''
  });

  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const handlePasswordToggle = () => {
    setIsEditingPassword(!isEditingPassword);
    if (isEditingPassword) {
      setFormData({ ...formData, password: '', confirmPassword: '' });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'La imagen es demasiado grande (Máx 5MB)' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewAvatar(reader.result as string);
    reader.readAsDataURL(file);
    setPendingFile(file);
  };

  const handleTimerChange = (diff: Difficulty, val: number) => {
    setTimers(prev => ({ ...prev, [diff]: val }));
  };

  const resetTimer = (diff: Difficulty) => {
    setTimers(prev => {
      const updated = { ...prev };
      delete updated[diff];
      return updated;
    });
  };

  const handleSave = async () => {
    setStatus({ type: 'loading', message: 'Procesando cambios...' });

    try {
      // 1. Avatar upload
      let finalAvatarUrl = formData.avatar || user.avatar || '';
      if (pendingFile) {
        setStatus({ type: 'loading', message: 'Subiendo imagen de perfil...' });
        try {
          finalAvatarUrl = await uploadAvatar(pendingFile);
        } catch (err: any) {
          setStatus({ type: 'error', message: `Error al subir imagen: ${err.message}` });
          return;
        }
      }

      // 2. Profile + credentials update
      const profilePayload: { username?: string; email?: string; new_password?: string } = {};
      if (formData.username !== user.username) profilePayload.username = formData.username;
      if (formData.email !== user.email) profilePayload.email = formData.email;
      if (formData.password) {
        if (formData.password.length < 6) {
          setStatus({ type: 'error', message: 'La contraseña debe tener mínimo 6 caracteres' });
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setStatus({ type: 'error', message: 'Las contraseñas no coinciden' });
          return;
        }
        profilePayload.new_password = formData.password;
      }

      if (Object.keys(profilePayload).length > 0) {
        const res = await updateOwnProfile(profilePayload);
        if (!res.success) {
          setStatus({ type: 'error', message: res.message || 'Error al actualizar credenciales' });
          return;
        }
      }

      // 3. Save avatar + settings
      const updatedUser: User = {
        ...user,
        username: formData.username,
        email: formData.email,
        avatar: finalAvatarUrl,
        settings: { ...user.settings, customTimers: timers }
      };

      await saveUser(updatedUser);
      onUpdateUser(updatedUser);
      setPendingFile(null);
      setFormData(d => ({ ...d, password: '', confirmPassword: '' }));
      setStatus({ type: 'success', message: '¡Cambios guardados correctamente!' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3500);

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error inesperado al guardar' });
    }
  };

  const currentAvatar = previewAvatar || getAvatarUrl(user.avatar);

  return (
    <div className="fixed inset-0 bg-[#0B1A3A] text-white overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto p-6 md:p-10 min-h-screen"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black tracking-tight">Mi Perfil y Configuración</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">

          {/* ── LEFT: Personal Info ── */}
          <div className="md:w-2/5 bg-black/20 p-8 flex flex-col items-center gap-6 border-b md:border-b-0 md:border-r border-white/10">
            {/* Avatar */}
            <div
              className="relative group cursor-pointer mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-blue-500 transition-all duration-300 bg-slate-800 flex items-center justify-center shadow-xl">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <span className="text-5xl font-black text-white">{user.username[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-xs text-white font-bold">Cambiar</span>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <p className="text-xs text-slate-500 -mt-3">Haz clic en la imagen para cambiarla</p>

            {/* Fields */}
            <div className="w-full space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Nombre</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:bg-white/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:bg-white/10 outline-none transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Nueva Contraseña</label>
                  <button 
                    onClick={handlePasswordToggle}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isEditingPassword ? 'Cancelar' : 'Cambiar clave'}
                  </button>
                </div>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={!isEditingPassword}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isEditingPassword ? "Escribe tu nueva contraseña" : "••••••••"}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:bg-white/10 outline-none transition-all ${!isEditingPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              {formData.password && isEditingPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1 block">Confirmar Contraseña</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:bg-white/10 outline-none transition-all"
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Study Settings ── */}
          <div className="md:w-3/5 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <Settings size={20} />
              <h2 className="font-black text-lg">Configuración de Estudio</h2>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
              <p className="text-sm text-blue-200 leading-relaxed">
                Ajusta el tiempo límite por pregunta según la dificultad.
              </p>
              <p className="text-xs text-blue-300/60 mt-1">(Mínimo 3s - Máximo 60s. "Default" usa el valor estándar de la plataforma)</p>
            </div>

            <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {(Object.keys(difficultyLabels) as Difficulty[]).map((diff) => {
                const customVal = timers[diff];
                const displayVal = customVal ?? defaultTimers[diff];
                const isCustom = customVal !== undefined;

                return (
                  <div key={diff} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-300">{difficultyLabels[diff]}</label>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black px-3 py-1 rounded-lg ${isCustom ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400'}`}>
                          {isCustom ? `${displayVal} s` : 'Default s'}
                        </span>
                        {isCustom && (
                          <button
                            onClick={() => resetTimer(diff)}
                            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                            title="Restablecer"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-slate-600 shrink-0" />
                      <input
                        type="range"
                        min="3"
                        max="60"
                        step="1"
                        value={displayVal}
                        onChange={(e) => handleTimerChange(diff, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button + Status */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
              <AnimatePresence mode="wait">
                {status.type !== 'idle' && (
                  <motion.span
                    key={status.message}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm font-semibold ${
                      status.type === 'success' ? 'text-green-400' :
                      status.type === 'error' ? 'text-red-400' : 'text-blue-300 animate-pulse'
                    }`}
                  >
                    {status.message}
                  </motion.span>
                )}
              </AnimatePresence>

              <button
                onClick={handleSave}
                disabled={status.type === 'loading'}
                className="ml-auto flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black rounded-2xl shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {status.type === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileScreen;
