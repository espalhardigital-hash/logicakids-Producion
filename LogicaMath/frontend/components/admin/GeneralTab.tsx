import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { getAllUsers, saveUser, deleteUser, getStorageUsage, getAllScores, getUserDetailedAnalytics, adminCreateUser, adminChangePassword, getAvatarUrl, deleteScoreById, getEngagementAnalytics, getChurnAnalytics, anonymizeUser } from '../../services/storageService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  ArrowLeft, Users, Shield, Activity, Database, Search,
  Edit, Trash2, UserX, UserCheck, Plus, X, Key, Check, BarChart2, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onBack: () => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void) => void;
  showAlert?: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
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

const GeneralTab: React.FC<Props> = ({ onBack, showConfirm, showAlert }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  // Modals State
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAllScoresModal, setShowAllScoresModal] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [statsUser, setStatsUser] = useState<User | null>(null);
  const [userStatsData, setUserStatsData] = useState<any>(null);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any>(null);
  const [churnData, setChurnData] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: 'date' | 'score', direction: 'asc' | 'desc'}>({key: 'date', direction: 'desc'});
  
  const [userSortConfig, setUserSortConfig] = useState<{
    key: 'username' | 'email' | 'status' | 'role' | 'created_at';
    dir: 'asc' | 'desc';
  }>({ key: 'created_at', dir: 'desc' });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGamesPlayed: 0,
    storage: '0 KB',
    usersDelta: 12,
    gamesDelta: 5,
    activeDelta: 0
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
    status: 'ACTIVE' as 'ACTIVE' | 'BANNED'
  });

  useEffect(() => {
    // Debounce the loadData to avoid too many requests while typing
    const timeout = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, filter, userSortConfig]);

  const loadData = async () => {
    const skip = (currentPage - 1) * limit;
    const paginatedUsers = await getAllUsers(skip, limit, filter, userSortConfig.key, userSortConfig.dir);
    const scores = await getAllScores();
    const engagement = await getEngagementAnalytics();
    const churn = await getChurnAnalytics();
    
    setEngagementData(engagement);
    setChurnData(churn);
    setUsers(paginatedUsers.data);
    setTotalPages(Math.ceil(paginatedUsers.total / limit) || 1);
    setAllScores(scores);
    
    setStats({
      totalUsers: paginatedUsers.total,
      activeUsers: paginatedUsers.data.filter(u => u.status === 'ACTIVE').length,
      totalGamesPlayed: scores.length,
      storage: getStorageUsage(),
      usersDelta: 12,
      gamesDelta: 5,
      activeDelta: 0
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
    const performDelete = async () => {
      await deleteUser(id);
      loadData();
    };
    if (showConfirm) {
      showConfirm(
        'Confirmar Eliminación',
        '¿Estás seguro de eliminar este usuario permanentemente? Esta acción no se puede deshacer.',
        performDelete
      );
    } else if (window.confirm('¿Estás seguro de eliminar este usuario permanentemente?')) {
      performDelete();
    }
  };

  const handleAnonymize = async (id: string) => {
    const performAnonymize = async () => {
      await anonymizeUser(id);
      loadData();
    };
    if (showConfirm) {
      showConfirm(
        'Derecho al Olvido (Anonimizar)',
        '¿Estás seguro de anonimizar este usuario? Se eliminarán sus datos personales pero sus métricas se conservarán para las estadísticas globales. Esta acción no se puede deshacer.',
        performAnonymize
      );
    } else if (window.confirm('¿Estás seguro de anonimizar este usuario? Sus datos personales serán eliminados.')) {
      performAnonymize();
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
        if (showAlert) {
          showAlert('Error de Creación', result.message || 'Error al crear usuario', 'error');
        } else {
          alert(result.message || 'Error al crear usuario');
        }
        return;
      }
    }

    setShowUserModal(false);
    loadData();
  };

  const handleChangePassword = (user: User) => {
    setPasswordUserId(user.id);
    setNewPassword('');
    setShowPasswordText(false);
    setShowPasswordModal(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUserId || !newPassword) return;

    const result = await adminChangePassword(passwordUserId, newPassword);
    if (result.success) {
      if (showAlert) {
        showAlert('Contraseña Actualizada', 'La contraseña ha sido actualizada correctamente.', 'success');
      } else {
        alert('Contraseña actualizada correctamente');
      }
      setShowPasswordModal(false);
    } else {
      if (showAlert) {
        showAlert('Error', result.message || 'Error al cambiar contraseña', 'error');
      } else {
        alert(result.message || 'Error al cambiar contraseña');
      }
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

  const toggleUserSort = (key: typeof userSortConfig.key) => {
    setUserSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const finalUsers = users; // Sorting is now done on the server!

  return (
    <div className="w-full flex flex-col items-center justify-start relative z-10">
      <motion.div 
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="w-full flex flex-col"
      >
        {/* Apple Style Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vista General de Administrador</h2>
        </div>

        {/* Resumen de Métricas & Engagement */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Users className="text-blue-500" size={24} />
              </div>
              {stats.usersDelta > 0 && (
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                  +{stats.usersDelta}%
                </span>
              )}
            </div>
            <h3 className="text-[14px] font-medium text-slate-500 dark:text-slate-400 mb-1">Usuarios Totales</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {engagementData?.total_users || stats.totalUsers}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <Activity className="text-emerald-500" size={24} />
              </div>
              <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                MAU: {engagementData?.mau || 0}
              </span>
            </div>
            <h3 className="text-[14px] font-medium text-slate-500 dark:text-slate-400 mb-1">Activos Diarios (DAU)</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {engagementData?.dau || stats.activeUsers}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <BarChart2 className="text-orange-500" size={24} />
              </div>
            </div>
            <h3 className="text-[14px] font-medium text-slate-500 dark:text-slate-400 mb-1">Tasa de Abandono (Churn)</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {engagementData?.churn_rate || 0}%
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <Database className="text-purple-500" size={24} />
              </div>
            </div>
            <h3 className="text-[14px] font-medium text-slate-500 dark:text-slate-400 mb-1">Partidas Jugadas</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {stats.totalGamesPlayed}
            </p>
          </motion.div>
        </div>

        {/* Gráfico de Churn por Fase */}
        {churnData && churnData.length > 0 && (
          <motion.div variants={itemVariants} className="w-full bg-white dark:bg-[#1A1A1A] p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm mb-8">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-6">Abandono por Fase (Fricción)</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={churnData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="fase_id" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="churned_users" name="Usuarios Perdidos" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <motion.div variants={itemVariants} className="w-full flex flex-col flex-1 mb-10">
          
          {/* Toolbar */}
          <div className="flex flex-col mb-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Gestión de Usuarios</h3>
            <div className="flex justify-between items-center w-full">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500" size={14} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 dark:border-white/10 rounded-none py-1.5 pl-8 pr-4 text-slate-700 dark:text-slate-200 text-[13px] focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="text-[13px] text-slate-500 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
                  Ordenar ↕
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-1.5 bg-[#2b4b8b] hover:bg-blue-600 rounded-lg flex items-center justify-center gap-2 text-blue-100 font-medium text-[13px] transition-all"
                >
                  + Nuevo Usuario
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="text-slate-500 dark:text-slate-300 text-[13px] font-semibold border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-2 font-medium cursor-pointer" onClick={() => toggleUserSort('username')}>
                    Usuario {userSortConfig.key === 'username' && (userSortConfig.dir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-2 font-medium cursor-pointer" onClick={() => toggleUserSort('email')}>
                    Email / Rol {userSortConfig.key === 'email' && (userSortConfig.dir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-2 font-medium cursor-pointer" onClick={() => toggleUserSort('status')}>
                    Estado {userSortConfig.key === 'status' && (userSortConfig.dir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-2 font-medium text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {finalUsers.map((user, index) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    key={user.id} 
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-[#1e2e4f] text-blue-600 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center tracking-wider">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-[13px] text-slate-500 dark:text-slate-400">
                        {user.email} - {user.role}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500'}`}>
                        {user.status === 'ACTIVE' ? 'Activo' : 'Baneado'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <button className="p-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors tooltip-trigger" title="Ver Estadísticas" onClick={() => handleViewStats(user)}>
                          <BarChart2 size={15} />
                        </button>
                        <button className="p-1.5 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" title="Cambiar Contraseña" onClick={() => { setPasswordUserId(user.id); setNewPassword(''); setShowPasswordText(false); setShowPasswordModal(true); }}>
                          <Key size={15} />
                        </button>
                        <button className="p-1.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" title="Editar" onClick={() => handleEdit(user)}>
                          <Edit size={15} />
                        </button>
                        <button className="p-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors" title={user.status === 'ACTIVE' ? "Suspender Usuario" : "Activar Usuario"} onClick={() => toggleStatus(user)}>
                          {user.status === 'ACTIVE' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button className="p-1.5 hover:text-purple-500 dark:hover:text-purple-400 transition-colors tooltip-trigger" title="Derecho al Olvido (Anonimizar)" onClick={() => handleAnonymize(user.id)}>
                          <EyeOff size={15} />
                        </button>
                        <button className="p-1.5 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Eliminar" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {finalUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Users className="text-slate-400" size={28} />
                </div>
                <p className="text-[15px] font-semibold text-slate-700 dark:text-white mb-2">
                  {filter ? 'No se encontraron resultados' : 'Aún no hay usuarios'}
                </p>
                <p className="text-[13px] text-slate-500 mb-5">
                  {filter
                    ? `No coincide ningún usuario con "${filter}"`
                    : 'Crea el primer usuario para comenzar a usar LogicaKids Pro'}
                </p>
                {!filter && (
                  <button
                    onClick={handleCreate}
                    className="px-5 py-2.5 bg-[#007AFF] hover:bg-blue-500 text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-colors"
                  >
                    + Crear primer usuario
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <span className="text-[13px] text-slate-500">Página {currentPage} de {totalPages} ({stats.totalUsers} usuarios)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
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
              className="glass-panel/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-10 rounded-[3rem] w-full max-w-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                <button onClick={() => setShowUserModal(false)} className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all"><X size={22} /></button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Nombre de Usuario</label>
                  <input required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white text-base font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600" placeholder="Ej: SuperMath" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Correo Electrónico</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white text-base font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed" disabled={!!editingUser} placeholder="correo@ejemplo.com" />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Contraseña Inicial</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white text-base font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="••••••••" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Rol</label>
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white text-base font-bold focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option value="USER" className="glass-panel">Usuario</option>
                      <option value="ADMIN" className="glass-panel">Administrador</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Estado</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white text-base font-bold focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option value="ACTIVE" className="glass-panel">Activo</option>
                      <option value="BANNED" className="glass-panel">Baneado</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-white/5 text-base transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all">
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
              className="glass-panel/90 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="bg-white dark:bg-white/5 p-10 flex items-center gap-8 border-b border-slate-200 dark:border-white/5">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-200 dark:border-white/10 flex items-center justify-center bg-white dark:bg-white/5 shadow-2xl relative group">
                  {statsUser.avatar ? (
                    <img src={getAvatarUrl(statsUser.avatar)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl font-black text-slate-700">{statsUser.username[0].toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{statsUser.username}</h3>
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${statsUser.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{statsUser.role}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-base font-medium mt-1">{statsUser.email}</p>
                </div>
                <button onClick={() => setShowStatsModal(false)} className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all hover:rotate-90"><X size={24} /></button>
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
                      <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        Historial de Rendimiento
                      </h4>
                      <div className="text-slate-500 text-sm font-bold">Total: {sortedHistory.length} partidas</div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                      <table className="w-full text-left border-collapse">
                        <thead className="text-xs text-slate-500 uppercase font-black tracking-widest bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                          <tr>
                            <th className="p-5 cursor-pointer hover:text-slate-900 dark:text-white transition-colors" onClick={() => toggleSort('date')}>
                              Fecha {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="p-5">Categoría</th>
                            <th className="p-5 text-center">Nivel</th>
                            <th className="p-5 text-center cursor-pointer hover:text-slate-900 dark:text-white transition-colors" onClick={() => toggleSort('score')}>
                              Puntaje {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="p-5 text-center">Errores</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                          {sortedHistory.map((record: any, idx: number) => (
                            <motion.tr 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              key={record.id} 
                              className="hover:bg-slate-50 dark:bg-white/[0.03] transition-colors"
                            >
                              <td className="p-5 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap text-base">
                                {formatFriendlyDate(record.rawDate || record.date)}
                              </td>
                              <td className="p-5 font-black text-slate-900 dark:text-white text-base capitalize tracking-tight">
                                {record.category?.replace(/_/g, ' ') || 'General'}
                              </td>
                              <td className="p-5 text-center">
                                <span className="text-blue-400 font-black text-base bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                                  {record.difficulty?.replace(/_/g, ' ') || '-'}
                                </span>
                              </td>
                              <td className="p-5 text-center">
                                <span className={`px-4 py-1.5 rounded-xl text-sm font-black shadow-lg ${
                                  record.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                  record.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                  'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {record.score}%
                                </span>
                              </td>
                              <td className="p-5 text-center font-black text-red-500 text-xl">
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
              className="glass-panel/90 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-white dark:bg-white/5 p-10 flex justify-between items-center border-b border-slate-200 dark:border-white/5">
                <div>
                  <h3 className="text-5xl font-black text-slate-900 dark:text-white flex items-center gap-5 tracking-tight">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Activity className="text-green-500" size={28} />
                    </div>
                    Registros Globales
                  </h3>
                  <p className="text-slate-500 text-base font-medium mt-2 ml-1">Partidas totales registradas en LogicaKids Pro</p>
                </div>
                <button onClick={() => setShowAllScoresModal(false)} className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-transparent">
                <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                  <table className="w-full text-left border-collapse">
                    <thead className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] bg-white dark:bg-white/5 sticky top-0 z-10 border-b border-slate-200 dark:border-white/5">
                      <tr>
                        <th className="p-6">Fecha y Hora</th>
                        <th className="p-6">Usuario</th>
                        <th className="p-6">Categoría</th>
                        <th className="p-6 text-center">Rendimiento</th>
                        <th className="p-6 text-center">Errores</th>
                        <th className="p-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {[...allScores].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record: any, idx: number) => (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.01 }}
                          key={record.id} 
                          className="hover:bg-slate-100 dark:bg-white/[0.04] transition-all group"
                        >
                          <td className="p-6 text-slate-500 dark:text-slate-400 font-medium text-base">
                            {formatFriendlyDate(record.date)}
                          </td>
                          <td className="p-6">
                            <span className="font-black text-blue-400 text-xl tracking-tight group-hover:text-blue-300 transition-colors cursor-default">{record.user}</span>
                          </td>
                          <td className="p-6 font-bold text-slate-900 dark:text-white text-base capitalize tracking-wide">
                            {record.category?.replace(/_/g, ' ') || 'General'}
                          </td>
                          <td className="p-6 text-center">
                            <span className={`px-4 py-2 rounded-xl text-sm font-black shadow-xl ${
                              record.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/5' : 
                              record.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/5' : 
                              'bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/5'
                            }`}>
                              {record.score}%
                            </span>
                          </td>
                          <td className="p-6 text-center font-black text-red-500 text-2xl">
                            {record.errorCount}
                          </td>
                          <td className="p-6 text-center">
                            <button 
                              onClick={async () => {
                                const performDeleteScore = async () => {
                                  await deleteScoreById(record.id);
                                  loadData();
                                };
                                if (showConfirm) {
                                  showConfirm(
                                    'Eliminar Puntuación',
                                    '¿Estás seguro de eliminar esta puntuación permanentemente?',
                                    performDeleteScore
                                  );
                                } else if (window.confirm('¿Eliminar esta puntuación permanentemente?')) {
                                  performDeleteScore();
                                }
                              }}
                              className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-slate-900 dark:text-white rounded-2xl transition-all shadow-lg active:scale-90"
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
              className="glass-panel/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-10 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
              
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Key className="text-amber-500" size={24} />
                  </div>
                  Cambiar Clave
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all"><X size={22} /></button>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Nueva Contraseña Segura</label>
                  <div className="relative">
                    <input
                      required
                      type={showPasswordText ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 pr-14 text-slate-900 dark:text-white font-black text-2xl focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-700"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors focus:outline-none flex items-center justify-center"
                    >
                      {showPasswordText ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                  <p className="text-xs text-amber-500/60 font-bold px-1 italic">Mínimo 6 caracteres alfanuméricos</p>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-white/5 text-base transition-all">Cancelar</button>
                  <button type="submit" className="flex-[2] py-4 bg-amber-500 hover:bg-amber-600 text-slate-900 dark:text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(245,158,11,0.3)] transition-all">
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
