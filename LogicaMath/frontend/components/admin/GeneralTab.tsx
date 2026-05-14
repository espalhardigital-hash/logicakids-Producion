import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { getAllUsers, saveUser, deleteUser, getStorageUsage, getAllScores, getUserDetailedAnalytics, adminCreateUser, adminChangePassword, getAvatarUrl, deleteScoreById } from '../../services/storageService';
import {
  ArrowLeft, Users, Shield, Activity, Database, Search,
  Edit, Trash2, UserX, UserCheck, Plus, X, Key, Check, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onBack: () => void;
}

const formatFriendlyDate = (dateStr: string, includeTime: boolean = true) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  const formatted = includeTime 
    ? d.toLocaleString('es-ES', options) 
    : d.toLocaleDateString('es-ES', options);

  return formatted
    .replace(/ de /g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const GeneralTab: React.FC<Props> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');

  // Modals State
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAllScoresModal, setShowAllScoresModal] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [statsUser, setStatsUser] = useState<User | null>(null);
  const [userStatsData, setUserStatsData] = useState<any>(null);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: 'date' | 'score', direction: 'asc' | 'desc'}>({key: 'date', direction: 'desc'});

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGamesPlayed: 0,
    storage: '0 KB'
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
    status: 'ACTIVE' as 'ACTIVE' | 'BANNED'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allUsers = await getAllUsers();
    const scores = await getAllScores();

    setUsers(allUsers);
    setAllScores(scores);

    setStats({
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status === 'ACTIVE').length,
      totalGamesPlayed: scores.length,
      storage: getStorageUsage()
    });
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'USER', status: 'ACTIVE' });
    setShowUserModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleViewStats = async (user: User) => {
    setStatsUser(user);
    setUserStatsData(null);
    setShowStatsModal(true);
    
    const data = await getUserDetailedAnalytics(user.username);
    setUserStatsData(data || { history: [], totalGames: 0 });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario permanentemente?')) {
      await deleteUser(id);
      loadData();
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const newUser: User = {
        ...editingUser,
        ...formData,
        password: formData.password || editingUser.password
      };
      await saveUser(newUser);
    } else {
      const result = await adminCreateUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      if (!result.success) {
        alert(result.message || 'Error al crear usuario');
        return;
      }
    }

    setShowUserModal(false);
    loadData();
  };

  const handleChangePassword = (user: User) => {
    setPasswordUserId(user.id);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUserId || !newPassword) return;

    const result = await adminChangePassword(passwordUserId, newPassword);
    if (result.success) {
      alert('Contraseña actualizada correctamente');
      setShowPasswordModal(false);
    } else {
      alert(result.message || 'Error al cambiar contraseña');
    }
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    await saveUser({ ...user, status: newStatus });
    loadData();
  };

  const sortedHistory = React.useMemo(() => {
    if (!userStatsData?.history) return [];
    return [...userStatsData.history].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const dateB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortConfig.direction === 'asc' ? a.score - b.score : b.score - a.score;
      }
    });
  }, [userStatsData?.history, sortConfig]);

  const toggleSort = (key: 'date' | 'score') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col items-center justify-start relative z-10">
      <motion.div 
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="w-full flex flex-col"
      >
        {/* Header removed from GeneralTab */}

        {/* KPI Cards */}
        <motion.div variants={containerVariants} className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Usuarios', value: stats.totalUsers, icon: Users, color: 'blue' },
            { label: 'Partidas', value: stats.totalGamesPlayed, icon: Activity, color: 'green', onClick: () => setShowAllScoresModal(true) },
            { label: 'Activos', value: stats.activeUsers, icon: UserCheck, color: 'amber' },
            { label: 'Storage', value: stats.storage, icon: Database, color: 'purple' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              onClick={item.onClick}
              className={`bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between ${item.onClick ? 'cursor-pointer group' : ''}`}
            >
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-3xl font-black text-white">{item.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                item.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                item.color === 'green' ? 'bg-green-500/10 text-green-400 border border-green-500/20 group-hover:bg-green-500 group-hover:text-white' :
                item.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                <item.icon size={26} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <motion.div variants={itemVariants} className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col flex-1 mb-10">
          
          {/* Toolbar */}
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02]">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Buscar usuario o email..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
              />
            </div>
            <button
              onClick={handleCreate}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center gap-3 text-white font-black shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={22} /> Nuevo Usuario
            </button>
          </div>

          {/* User Table */}
          <div className="flex-1 overflow-auto custom-scrollbar bg-transparent">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-[0.2em] sticky top-0 z-10 border-b border-white/5">
                <tr>
                  <th className="p-6">Usuario</th>
                  <th className="p-6 hidden sm:table-cell">Detalles</th>
                  <th className="p-6">Estado</th>
                  <th className="p-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((user, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={user.id} 
                    className="hover:bg-white/[0.04] transition-all group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center bg-white/5 shadow-2xl relative">
                          {user.avatar ? (
                            <img src={getAvatarUrl(user.avatar)} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-slate-500 text-xl">{user.username[0].toUpperCase()}</span>
                          )}
                          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1e293b] ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                        </div>
                        <div>
                          <div className="font-black text-white text-xl tracking-tight">{user.username}</div>
                          <div className="text-sm font-medium text-slate-400 hidden sm:block">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 hidden sm:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg w-max tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                          {user.role}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Unido el {formatFriendlyDate(user.createdAt, false) || 'Desconocido'}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide ${user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/5'}`}>
                        {user.status === 'ACTIVE' ? 'Activo' : 'Baneado'}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-3 opacity-100 md:opacity-40 md:group-hover:opacity-100 transition-all">
                        {[
                          { icon: BarChart2, color: 'purple', onClick: () => handleViewStats(user), label: 'Estadísticas' },
                          { icon: user.status === 'ACTIVE' ? UserX : UserCheck, color: user.status === 'ACTIVE' ? 'slate' : 'green', onClick: () => toggleStatus(user), label: user.status === 'ACTIVE' ? 'Banear' : 'Activar' },
                          { icon: Edit, color: 'blue', onClick: () => handleEdit(user), label: 'Editar' },
                          { icon: Key, color: 'amber', onClick: () => handleChangePassword(user), label: 'Clave' },
                          { icon: Trash2, color: 'red', onClick: () => handleDelete(user.id), label: 'Borrar' }
                        ].map((btn, bIdx) => (
                          <button 
                            key={bIdx}
                            onClick={btn.onClick} 
                            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                              btn.color === 'purple' ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' :
                              btn.color === 'green' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                              btn.color === 'blue' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' :
                              btn.color === 'amber' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' :
                              btn.color === 'red' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' :
                              'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                            }`} 
                            title={btn.label}
                          >
                            <btn.icon size={20} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-20 flex flex-col items-center justify-center text-slate-500">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Users size={40} className="opacity-20" />
                </div>
                <p className="font-bold text-xl tracking-tight">No se encontraron usuarios</p>
                <p className="text-sm font-medium mt-1">Prueba con otro término de búsqueda</p>
              </div>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* MODAL 1: Create/Edit User */}
      <AnimatePresence>
        {showUserModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] w-full max-w-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white tracking-tight">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                <button onClick={() => setShowUserModal(false)} className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={22} /></button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Nombre de Usuario</label>
                  <input required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600" placeholder="Ej: SuperMath" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Correo Electrónico</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed" disabled={!!editingUser} placeholder="correo@ejemplo.com" />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Contraseña Inicial</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="••••••••" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Rol</label>
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option value="USER" className="bg-slate-900">Usuario</option>
                      <option value="ADMIN" className="bg-slate-900">Administrador</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Estado</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option value="ACTIVE" className="bg-slate-900">Activo</option>
                      <option value="BANNED" className="bg-slate-900">Baneado</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all">
                    <Check size={20} /> Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: User Statistics */}
      <AnimatePresence>
        {showStatsModal && statsUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="bg-white/5 p-10 flex items-center gap-8 border-b border-white/5">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white/10 flex items-center justify-center bg-white/5 shadow-2xl relative group">
                  {statsUser.avatar ? (
                    <img src={getAvatarUrl(statsUser.avatar)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl font-black text-slate-700">{statsUser.username[0].toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-black text-white tracking-tight">{statsUser.username}</h3>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statsUser.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{statsUser.role}</span>
                  </div>
                  <p className="text-slate-400 font-medium mt-1">{statsUser.email}</p>
                </div>
                <button onClick={() => setShowStatsModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 transition-all hover:rotate-90"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-transparent">
                {!userStatsData ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                    <Activity className="animate-pulse mb-8 text-blue-500" size={64} />
                    <p className="font-black text-2xl tracking-tight">Analizando datos...</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        Historial de Rendimiento
                      </h4>
                      <div className="text-slate-500 text-xs font-bold">Total: {sortedHistory.length} partidas</div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02]">
                      <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-white/5 border-b border-white/5">
                          <tr>
                            <th className="p-5 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('date')}>
                              Fecha {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="p-5">Categoría</th>
                            <th className="p-5 text-center">Nivel</th>
                            <th className="p-5 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('score')}>
                              Puntaje {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="p-5 text-center">Errores</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {sortedHistory.map((record: any, idx: number) => (
                            <motion.tr 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              key={record.id} 
                              className="hover:bg-white/[0.03] transition-colors"
                            >
                              <td className="p-5 text-slate-400 font-semibold whitespace-nowrap text-sm">
                                {formatFriendlyDate(record.rawDate || record.date)}
                              </td>
                              <td className="p-5 font-black text-white capitalize tracking-tight">
                                {record.category?.replace(/_/g, ' ') || 'General'}
                              </td>
                              <td className="p-5 text-center">
                                <span className="text-blue-400 font-black text-sm bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                                  {record.difficulty?.replace(/_/g, ' ') || '-'}
                                </span>
                              </td>
                              <td className="p-5 text-center">
                                <span className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-lg ${
                                  record.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                  record.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                  'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {record.score}%
                                </span>
                              </td>
                              <td className="p-5 text-center font-black text-red-500 text-lg">
                                {record.errorCount}
                              </td>
                            </motion.tr>
                          ))}
                          {sortedHistory.length === 0 && (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-600 font-bold italic">Sin registros de actividad aún.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: All Scores */}
      <AnimatePresence>
        {showAllScoresModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 50 }}
              className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-white/5 p-10 flex justify-between items-center border-b border-white/5">
                <div>
                  <h3 className="text-4xl font-black text-white flex items-center gap-5 tracking-tight">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Activity className="text-green-500" size={28} />
                    </div>
                    Registros Globales
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-2 ml-1">Partidas totales registradas en LogicaKids Pro</p>
                </div>
                <button onClick={() => setShowAllScoresModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-transparent">
                <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                  <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] bg-white/5 sticky top-0 z-10 border-b border-white/5">
                      <tr>
                        <th className="p-6">Fecha y Hora</th>
                        <th className="p-6">Usuario</th>
                        <th className="p-6">Categoría</th>
                        <th className="p-6 text-center">Rendimiento</th>
                        <th className="p-6 text-center">Errores</th>
                        <th className="p-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[...allScores].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record: any, idx: number) => (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.01 }}
                          key={record.id} 
                          className="hover:bg-white/[0.04] transition-all group"
                        >
                          <td className="p-6 text-slate-400 font-medium text-sm">
                            {formatFriendlyDate(record.date)}
                          </td>
                          <td className="p-6">
                            <span className="font-black text-blue-400 text-lg tracking-tight group-hover:text-blue-300 transition-colors cursor-default">{record.user}</span>
                          </td>
                          <td className="p-6 font-bold text-white capitalize tracking-wide">
                            {record.category?.replace(/_/g, ' ') || 'General'}
                          </td>
                          <td className="p-6 text-center">
                            <span className={`px-4 py-2 rounded-xl text-xs font-black shadow-xl ${
                              record.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/5' : 
                              record.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/5' : 
                              'bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/5'
                            }`}>
                              {record.score}%
                            </span>
                          </td>
                          <td className="p-6 text-center font-black text-red-500 text-xl">
                            {record.errorCount}
                          </td>
                          <td className="p-6 text-center">
                            <button 
                              onClick={async () => {
                                if (confirm('¿Eliminar esta puntuación permanentemente?')) {
                                  await deleteScoreById(record.id);
                                  loadData();
                                }
                              }}
                              className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-lg active:scale-90"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                      {allScores.length === 0 && (
                        <tr><td colSpan={6} className="p-24 text-center text-slate-600 font-black italic text-xl">Sin actividad registrada en la base de datos</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Change Password */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
              
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white flex items-center gap-4 tracking-tight">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Key className="text-amber-500" size={24} />
                  </div>
                  Cambiar Clave
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={22} /></button>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Nueva Contraseña Segura</label>
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-black text-xl focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-700"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <p className="text-[10px] text-amber-500/60 font-bold px-1 italic">Mínimo 6 caracteres alfanuméricos</p>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(245,158,11,0.3)] transition-all">
                    <Check size={22} /> Actualizar Ahora
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GeneralTab;
