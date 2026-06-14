# 🎯 CONTEXTO DEL PROYECTO

Eres un desarrollador senior de React/TypeScript. Vas a refactorizar y mejorar el **Panel de Administrador** de LogicaKids Pro — una plataforma educativa de matemáticas para niños.

**Stack tecnológico:**
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion v12
- Lucide React (íconos)
- Vite 6

**Archivos a modificar (todos en `LogicaMath/frontend/`):**
- `components/admin/AdminPanel.tsx` — Layout principal, sidebar, modales globales
- `components/admin/GeneralTab.tsx` — Vista general, KPIs, gestión de usuarios
- `components/admin/PerformanceTab.tsx` — Rendimiento estudiantil
- `components/admin/PedagogyTab.tsx` — Configuración pedagógica
- `components/admin/ContentTab.tsx` — Banco de preguntas y teoría
- `components/admin/SystemTab.tsx` — Configuración de servidor y BD
- `components/admin/SreTab.tsx` — Monitoreo SRE
- `types.ts` — Tipos TypeScript

**Regla general:** Mantén el diseño oscuro/claro existente, las animaciones de Framer Motion, y los íconos de Lucide. No cambies el backend ni los servicios.

---

## 🔴 BLOQUE 1 — BUGS CRÍTICOS (implementar primero)

### BUG-1: Modo Evaluador — Estado fuera de React (AdminPanel.tsx)

**Problema:** El toggle de "Modo Evaluador" lee `localStorage.getItem()` directamente en el render, sin estar en estado de React. Para forzar re-render usan este hack:
```typescript
setAdminScale(adminScale + 0.001);
setTimeout(() => setAdminScale(Math.floor(adminScale)), 10);
```

**Corrección:**
```typescript
// ANTES (línea ~26 de AdminPanel.tsx):
// No hay estado, se lee localStorage directamente en el JSX

// DESPUÉS: Agrega este estado al inicio del componente AdminPanel
const [evaluatorMode, setEvaluatorMode] = useState<boolean>(
  () => localStorage.getItem('evaluatorMode') === 'true'
);

// En el JSX del toggle (línea ~330), reemplaza:
checked={localStorage.getItem('evaluatorMode') === 'true'}
onChange={(e) => {
  if (e.target.checked) {
    localStorage.setItem('evaluatorMode', 'true');
    setAdminScale(adminScale + 0.001); // ← ELIMINAR ESTE HACK
    // ...
  }
}}

// POR:
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
```

---

### BUG-2: DATABASE_URL visible en texto plano (SystemTab.tsx)

**Problema:** El campo `database_url` que contiene usuario y contraseña de PostgreSQL se muestra como `type="text"`, exponiendo credenciales sensibles.

**Corrección:**
```typescript
// Agrega este estado en SystemTab:
const [showDbUrl, setShowDbUrl] = useState(false);

// Reemplaza el input de DATABASE_URL:
// ANTES:
<input required type="text" value={systemConfig.database_url} ... />

// DESPUÉS:
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
    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
  >
    {showDbUrl ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
// Importa Eye y EyeOff de lucide-react
```

---

### BUG-3: SreTab hardcodeado a localhost:9323

**Problema:** `fetch('http://localhost:9323/progreso_sre.json')` está hardcodeado y falla en producción/staging.

**Corrección:**
```typescript
// En SreTab.tsx, reemplaza la URL hardcodeada:

// ANTES:
const response = await fetch('http://localhost:9323/progreso_sre.json');

// DESPUÉS:
// Agrega al inicio del archivo:
const SRE_ENDPOINT = import.meta.env.VITE_SRE_ENDPOINT ?? 'http://localhost:9323/progreso_sre.json';

// En fetchSreData:
const response = await fetch(SRE_ENDPOINT);
if (!response.ok) {
  throw new Error(
    `No se pudo conectar al servidor de reportes.\n` +
    `URL: ${SRE_ENDPOINT}\n` +
    `Configura VITE_SRE_ENDPOINT en tu .env si estás en producción.`
  );
}
```

---

### BUG-4: Múltiples booleans de modal (GeneralTab.tsx)

**Problema:** Hay 4+ booleans independientes para controlar modales (`showUserModal`, `showStatsModal`, `showAllScoresModal`, `showPasswordModal`) más estados asociados. Esto crea acoplamiento y es difícil de mantener.

**Corrección — Unificar en un solo estado:**
```typescript
// ANTES (múltiples estados):
const [showUserModal, setShowUserModal] = useState(false);
const [showStatsModal, setShowStatsModal] = useState(false);
const [showAllScoresModal, setShowAllScoresModal] = useState(false);
const [showPasswordModal, setShowPasswordModal] = useState(false);
const [editingUser, setEditingUser] = useState<User | null>(null);
const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
const [statsUser, setStatsUser] = useState<User | null>(null);

// DESPUÉS — Un estado unificado:
type ModalState =
  | { type: null }
  | { type: 'create_user' }
  | { type: 'edit_user'; user: User }
  | { type: 'stats'; user: User }
  | { type: 'all_scores' }
  | { type: 'password'; userId: string };

const [modal, setModal] = useState<ModalState>({ type: null });
const closeModal = () => setModal({ type: null });

// Actualizar todos los handlers:
const handleCreate = () => setModal({ type: 'create_user' });
const handleEdit = (user: User) => setModal({ type: 'edit_user', user });
const handleViewStats = (user: User) => setModal({ type: 'stats', user });
const handleChangePassword = (userId: string) => setModal({ type: 'password', userId });

// En el JSX, reemplazar todos los AnimatePresence/modal con:
{modal.type === 'create_user' && <UserFormModal onClose={closeModal} ... />}
{modal.type === 'edit_user' && <UserFormModal user={modal.user} onClose={closeModal} ... />}
// etc.
```

---

## 🟠 BLOQUE 2 — PROBLEMAS CRÍTICOS DE UX

### UX-1: Tamaño de fuente inaceptable en botones (PerformanceTab.tsx)

**Problema:** Los botones Liberar/Aprobar/Restablecer usan `text-[10px]` y `text-[9px]`. Mínimo accesible es 13px. Múltiples lugares con el mismo problema.

**Corrección — Busca y reemplaza en PerformanceTab.tsx:**

```typescript
// 1. En BulkActionButtons component, reemplaza las clases de botones:
// ANTES: "... text-[10px] font-black ..."
// DESPUÉS: "... text-[13px] font-medium ..."

// 2. Botón "Liberar":
// ANTES:
className="px-2 py-1 rounded-lg ... text-[10px] font-black ..."
// DESPUÉS:
className="px-3 py-1.5 rounded-lg ... text-[13px] font-medium min-h-[32px] ..."

// 3. Botón "Aprobar":
// ANTES:
className="px-2 py-1 rounded-lg ... text-[10px] font-black ..."
// DESPUÉS:
className="px-3 py-1.5 rounded-lg ... text-[13px] font-medium min-h-[32px] ..."

// 4. Botón "Restablecer":
// ANTES:
className="px-2 py-1 rounded-lg ... text-[10px] font-black ..."
// DESPUÉS:
className="px-3 py-1.5 rounded-lg ... text-[13px] font-medium min-h-[32px] ..."

// 5. En los botones de nivel individual (línea ~536):
// ANTES: "... text-[10px] font-black ..."
// DESPUÉS: "... text-[13px] font-medium ..."

// 6. Íconos de Unlock/Check/RotateCcw: subir de size={9} a size={13}
```

---

### UX-2: Sidebar — Ajustes Visuales mezclados con navegación (AdminPanel.tsx)

**Problema:** Los controles de personalización (escala, tipografía, modo evaluador) están dentro del flujo principal de navegación del sidebar, compitiendo visualmente con los tabs de sección.

**Corrección — Mover a un modal de ajustes:**

```typescript
// 1. Crear nuevo estado para el modal de ajustes
const [showSettingsModal, setShowSettingsModal] = useState(false);

// 2. En el sidebar, REEMPLAZA el bloque de "Ajustes Visuales" (el div con bg-black/10)
// POR un botón compacto en el footer:
<button
  onClick={() => setShowSettingsModal(true)}
  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 text-[13.5px] font-medium transition-colors"
>
  <Settings2 size={16} />
  Ajustes de pantalla
</button>

// 3. Crear el modal de ajustes (agregar ANTES del cierre del componente):
<AnimatePresence>
  {showSettingsModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setShowSettingsModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-slate-900 dark:text-white">Ajustes de Pantalla</h3>
          <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Escala */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">Escala de interfaz</label>
              <span className="text-[13px] text-[#007AFF] font-semibold">{adminScale}%</span>
            </div>
            <input
              type="range" min="85" max="135" step="5"
              value={adminScale}
              onChange={(e) => setAdminScale(Number(e.target.value))}
              className="w-full accent-[#007AFF]"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>85%</span><span>100%</span><span>135%</span>
            </div>
          </div>

          {/* Tipografía */}
          <div>
            <label className="text-[13px] text-slate-700 dark:text-slate-300 font-medium block mb-2">Tipografía</label>
            <select
              value={adminFontFamily}
              onChange={(e) => setAdminFontFamily(e.target.value)}
              className="w-full"
              style={{ fontFamily: adminFontFamily || undefined }}
            >
              <option value="">SF Pro Text (Predeterminada)</option>
              <option value="'Comic Sans MS', cursive">Comic Sans</option>
              <option value="'OpenDyslexic', 'Comic Sans MS', sans-serif">Dyslexic-friendly</option>
              <option value="monospace">Monospace</option>
              <option value="Arial, Helvetica, sans-serif">Arial</option>
            </select>
          </div>

          {/* Modo Evaluador */}
          <div className="flex items-start justify-between pt-3 border-t border-slate-200 dark:border-white/10">
            <div>
              <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Modo Evaluador</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Permite saltar preguntas para probar el flujo.</p>
            </div>
            <label className="ios-switch-container cursor-pointer ml-3">
              <input
                type="checkbox"
                className="hidden"
                checked={evaluatorMode}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setEvaluatorMode(newValue);
                  if (newValue) {
                    localStorage.setItem('evaluatorMode', 'true');
                    showAlert('Modo Evaluador Activado', 'Podrás usar el botón "Saltar" en los juegos.', 'success');
                  } else {
                    localStorage.removeItem('evaluatorMode');
                    showAlert('Modo Evaluador Desactivado', 'El flujo ha vuelto a la normalidad.', 'info');
                  }
                }}
              />
              <div className={`ios-switch ${evaluatorMode ? 'ios-switch-active' : ''}`}>
                <div className="ios-switch-knob"></div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

// 4. Importar Settings2 de lucide-react
```

---

### UX-3: Vista General — KPIs sin tendencias, tabla sin ordenamiento (GeneralTab.tsx)

**Corrección — Actualizar los stats cards para mostrar tendencia:**

```typescript
// 1. Actualizar el tipo de stats:
const [stats, setStats] = useState({
  totalUsers: 0,
  activeUsers: 0,
  totalGamesPlayed: 0,
  storage: '0 KB',
  // Nuevos campos de tendencia (calcular vs semana pasada si hay datos, o mostrar 0)
  usersDelta: 0,    // número, puede ser positivo o negativo
  gamesDelta: 0,
  activeDelta: 0,
});

// 2. Crear componente KPI card con tendencia (agrega antes del return de GeneralTab):
const KpiCard = ({
  label, value, icon: Icon, iconBg, iconColor, delta
}: {
  label: string; value: string | number; icon: React.ElementType;
  iconBg: string; iconColor: string; delta?: number;
}) => (
  <div className="bg-[var(--apple-card)] backdrop-blur border border-[var(--apple-border)] rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={iconColor} size={22} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-[var(--apple-text-muted)] uppercase tracking-wider font-semibold mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--apple-text)] tracking-tight">{value}</span>
        {delta !== undefined && delta !== 0 && (
          <span className={`text-[11px] font-semibold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {delta > 0 ? '↑' : '↓'}{Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  </div>
);

// 3. Reemplaza los 4 divs de KPI por:
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  <KpiCard label="Usuarios" value={stats.totalUsers} icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-400" delta={stats.usersDelta} />
  <KpiCard label="Partidas" value={stats.totalGamesPlayed} icon={Activity} iconBg="bg-green-500/10" iconColor="text-green-400" delta={stats.gamesDelta} />
  <KpiCard label="Activos" value={stats.activeUsers} icon={UserCheck} iconBg="bg-amber-500/10" iconColor="text-amber-400" delta={stats.activeDelta} />
  <KpiCard label="Storage" value={stats.storage} icon={Database} iconBg="bg-purple-500/10" iconColor="text-purple-400" />
</div>

// 4. Agregar ordenamiento a la tabla — añade este estado:
const [sortConfig, setSortConfig] = useState<{
  key: 'username' | 'email' | 'status' | 'role' | 'createdAt';
  dir: 'asc' | 'desc';
}>({ key: 'username', dir: 'asc' });

// 5. Función de ordenamiento:
const sortedUsers = [...filteredUsers].sort((a, b) => {
  const mult = sortConfig.dir === 'asc' ? 1 : -1;
  return a[sortConfig.key]?.localeCompare(b[sortConfig.key] ?? '') * mult;
});

const toggleSort = (key: typeof sortConfig.key) => {
  setSortConfig(prev => ({
    key,
    dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
  }));
};

// 6. Headers de tabla con ordenamiento — reemplaza el thead:
<thead>
  <tr>
    {(['username', 'email', 'status', 'role'] as const).map(col => (
      <th
        key={col}
        onClick={() => toggleSort(col as any)}
        className="cursor-pointer select-none hover:text-[var(--apple-text)] transition-colors"
      >
        {col === 'username' ? 'Usuario' : col === 'email' ? 'Email' : col === 'status' ? 'Estado' : 'Rol'}
        {sortConfig.key === col && (
          <span className="ml-1">{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>
        )}
      </th>
    ))}
    <th>Acciones</th>
  </tr>
</thead>

// 7. Mejorar el estado vacío (cuando no hay usuarios):
// Reemplaza el div de "No se encontraron usuarios" por:
{filteredUsers.length === 0 && (
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
        <Plus size={15} />
        Crear primer usuario
      </button>
    )}
  </div>
)}
```

---

### UX-4: Rendimiento Estudiantil — Agregar lista de alumnos (PerformanceTab.tsx)

**Problema:** No existe vista de todos los alumnos. El admin debe saber el nombre exacto para buscar.

**Corrección — Agregar carga inicial de todos los alumnos:**

```typescript
// 1. Al montar el componente, cargar todos los alumnos:
useEffect(() => {
  const loadAllAlumnos = async () => {
    setLoadingSearch(true);
    try {
      // Llamar con string vacío para obtener todos
      const all = await searchAlumnos('');
      setAlumnos(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSearch(false);
    }
  };
  loadAllAlumnos();
}, []);

// 2. Agregar filtros de estado encima de la lista:
type AlumnoFilter = 'all' | 'with_progress' | 'blocked';
const [alumnoFilter, setAlumnoFilter] = useState<AlumnoFilter>('all');

// 3. Renderizar los alumnos como lista en el panel izquierdo (cuando no hay alumno seleccionado):
// Reemplaza el bloque "Escribe en el buscador para encontrar un alumno" por:
<div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar pr-1">
  {loadingSearch && (
    <div className="flex justify-center py-8">
      <Loader2 className="animate-spin text-blue-400" size={20} />
    </div>
  )}
  {!loadingSearch && alumnos.length === 0 && (
    <p className="text-[12px] text-slate-500 text-center py-6">
      No se encontraron alumnos
    </p>
  )}
  {!loadingSearch && alumnos.map(alumno => (
    <button
      key={alumno.id}
      onClick={() => handleSelectAlumno(alumno)}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${
        selectedAlumno?.id === alumno.id
          ? 'bg-blue-600/20 border border-blue-500/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400 flex-shrink-0">
          {alumno.username?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{alumno.username}</p>
          <p className="text-[10px] text-slate-500 truncate">{alumno.email}</p>
        </div>
      </div>
    </button>
  ))}
</div>

// 4. Agregar la función handleSelectAlumno:
const handleSelectAlumno = async (alumno: AlumnoSearchInfo) => {
  setSelectedAlumno(alumno);
  setLoadingProgress(true);
  try {
    const progress = await getAlumnoProgress(alumno.username);
    setAlumnoProgress(progress || []);
  } catch (e) {
    console.error(e);
    setAlumnoProgress([]);
  } finally {
    setLoadingProgress(false);
  }
};
```

---

### UX-5: Rendimiento Estudiantil — Barras de progreso visuales (PerformanceTab.tsx)

**Corrección — Agregar barra de progreso a cada nivel:**

```typescript
// En el renderizado de cada nivel individual, DESPUÉS del StatusBadge y ANTES de los botones,
// agrega la barra de progreso:

{state !== 'BLOQUEADO' && (
  <div className="flex items-center gap-2 flex-1 min-w-0">
    <div className="flex-1 bg-slate-200 dark:bg-white/10 rounded-full h-1.5 min-w-[60px]">
      <div
        className={`h-1.5 rounded-full transition-all ${
          pct >= 80 ? 'bg-green-500' :
          pct >= 60 ? 'bg-blue-500' :
          pct >= 40 ? 'bg-amber-500' :
          'bg-red-500'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
    <span className="text-[11px] text-slate-500 font-semibold flex-shrink-0">{pct}%</span>
  </div>
)}
```

---

### UX-6: Config. Pedagógica — Explicar "Override" (PedagogyTab.tsx)

**Problema:** Las pills "Override" aparecen en naranja sin explicación.

**Corrección — Reemplazar el texto "Override" por algo descriptivo:**

```typescript
// Busca todos los lugares donde aparece la pill de "Override" y reemplaza:

// ANTES: algo similar a:
<span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold">Override</span>

// DESPUÉS:
<span
  className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold cursor-help"
  title="Este módulo tiene configuración propia que sobreescribe la configuración global de la plataforma"
>
  ⬆ Config propia
</span>

// También en el header de la sección, agrega una nota explicativa:
<p className="text-[11px] text-amber-400/70 mt-1">
  Los módulos marcados con "Config propia" tienen parámetros independientes del global.
</p>
```

---

### UX-7: Banco de Preguntas — Unificar sistema de toasts (ContentTab.tsx)

**Problema:** ContentTab tiene su propio toast/confirm system duplicado.

**Corrección:**

```typescript
// 1. Actualizar la firma del componente ContentTab para recibir los handlers globales:
// ANTES:
const ContentTab: React.FC = () => {

// DESPUÉS:
interface ContentTabProps {
  showAlert?: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
  showConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}
const ContentTab: React.FC<ContentTabProps> = ({ showAlert, showConfirm }) => {

// 2. Reemplaza todas las llamadas al toast local:
// ANTES:
setToast({ show: true, message: 'Teoría guardada exitosamente', type: 'success' });
// DESPUÉS:
showAlert?.('Guardado', 'Teoría guardada exitosamente', 'success');

// 3. Reemplaza el confirmDialog local:
// ANTES:
setConfirmDialog({ show: true, title: '...', message: '...', onConfirm: fn });
// DESPUÉS:
showConfirm?.('...', '...', fn);

// 4. Elimina los estados toast y confirmDialog y sus JSX completos (aprox. 60 líneas eliminadas)

// 5. En AdminPanel.tsx, actualizar la importación de ContentTab:
{activeTab === 'content' && (
  <ContentTab showConfirm={showConfirm} showAlert={showAlert} />
)}

// 6. Agregar tooltip de onboarding al TokenHighlighter (en ContentTab.tsx):
// Busca el componente TokenHighlighter y agrega un tooltip:
<div className="relative group inline-block">
  <HelpCircle size={14} className="text-slate-400 cursor-help" />
  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-700 text-white text-[11px] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
    Haz clic en las palabras del enunciado para marcarlas como términos clave de la pregunta.
    <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
  </div>
</div>
```

---

## 🟡 BLOQUE 3 — MEJORAS ADICIONALES DE UX

### MEJORA-1: Badges de notificación en tabs del sidebar (AdminPanel.tsx)

```typescript
// Agrega un sistema simple de badges. Primero, crea un estado:
const [tabBadges, setTabBadges] = useState<Partial<Record<TabType, number>>>({});

// Ejemplo: detectar si SRE tiene errores y mostrar badge:
// En el useEffect que carga datos, si SreTab detecta error:
// setTabBadges(prev => ({ ...prev, sre: 1 }));

// En el renderizado de tabs, agrega el badge:
<button key={tab.id} onClick={() => handleTabChange(tab.id as TabType)} className={`...`}>
  <tab.icon size={17} className="relative z-10" />
  <span className="relative z-10 flex-1 text-left">{tab.label}</span>
  {tabBadges[tab.id as TabType] && (
    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
      {tabBadges[tab.id as TabType]}
    </span>
  )}
</button>
```

---

### MEJORA-2: Diferenciar "Volver al Viaje" de "Cerrar Sesión" (AdminPanel.tsx)

```typescript
// ANTES: ambos botones tienen estilos similares
// DESPUÉS: establecer jerarquía clara:

// "Volver al Viaje" — acción primaria, más prominente:
<button
  onClick={onBack}
  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white text-[13.5px] font-semibold transition-colors"
>
  <ArrowLeft size={15} />
  Volver al Viaje
</button>

// "Cerrar Sesión" — acción secundaria destructiva, más pequeña y discreta:
<button
  onClick={onLogout}
  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 text-[12px] font-medium transition-colors"
>
  <LogOut size={13} />
  Cerrar Sesión
</button>
```

---

### MEJORA-3: Breadcrumb en ContentTab (ContentTab.tsx)

```typescript
// Agrega un breadcrumb visible sobre el área de edición:
// Busca la sección donde se muestra "Estás editando la teoría de: Fase X / Nombre"
// y reemplaza o complementa con:

<nav className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-4">
  <span>Banco de Preguntas</span>
  <ChevronRight size={12} />
  {currentFase && (
    <>
      <span className="text-slate-700 dark:text-slate-300 font-medium">
        {PHASE_MAPS.find(p => p.id === mgrFaseId)?.name || `Fase ${mgrFaseId}`}
      </span>
      <ChevronRight size={12} />
    </>
  )}
  {currentModule && (
    <>
      <span className="text-slate-700 dark:text-slate-300 font-medium">
        {currentModule.name}
      </span>
      {currentLevel && <ChevronRight size={12} />}
    </>
  )}
  {currentLevel && (
    <span className="text-[#007AFF] font-semibold">{currentLevel.name}</span>
  )}
</nav>
// Importa ChevronRight de lucide-react
```

---

### MEJORA-4: Persist del selector de fase/módulo en ContentTab al cambiar sub-tab (ContentTab.tsx)

```typescript
// El problema es que al cambiar entre 'theory' y 'questions',
// los selects de Fase/Módulo/Nivel mantienen su valor pero visualmente se ven
// como si se resetearan porque el componente monta de nuevo.

// Solución: elevar el estado del selector al nivel del ContentTab
// (ya está en el hook useAdminContent — verificar que mgrFaseId/mgrModuloId
// NO se reseteen al cambiar activeSubTab)

// Si el estado se pierde, agregar useEffect para persistir en localStorage:
useEffect(() => {
  if (mgrFaseId) localStorage.setItem('admin_content_fase', String(mgrFaseId));
}, [mgrFaseId]);

useEffect(() => {
  if (mgrModuloId) localStorage.setItem('admin_content_modulo', String(mgrModuloId));
}, [mgrModuloId]);

// Al inicializar el hook useAdminContent:
const [mgrFaseId, setMgrFaseId] = useState<number>(
  () => Number(localStorage.getItem('admin_content_fase')) || 1
);
```

---

### MEJORA-5: Collapse/Expand all en PedagogyTab (PedagogyTab.tsx)

```typescript
// Agrega un control de collapse/expand global en el header de la sección de módulos:
const [allExpanded, setAllExpanded] = useState(false);

// En el JSX, sobre los módulos:
<div className="flex items-center justify-between mb-4">
  <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">
    Configuración de Módulos
  </h3>
  <button
    onClick={() => setAllExpanded(!allExpanded)}
    className="text-[12px] text-slate-500 hover:text-[#007AFF] flex items-center gap-1.5 transition-colors"
  >
    {allExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    {allExpanded ? 'Colapsar todo' : 'Expandir todo'}
  </button>
</div>

// Los módulos deben respetar allExpanded:
// En cada módulo colapsable, inicializar expandido con allExpanded:
const [expanded, setExpanded] = useState(allExpanded);
useEffect(() => { setExpanded(allExpanded); }, [allExpanded]);
```

---

## 🔵 BLOQUE 4 — CALIDAD DE CÓDIGO

### CALIDAD-1: Migrar CSS injection a Tailwind v4 (AdminPanel.tsx)

```typescript
// El bloque dangerouslySetInnerHTML de ~100 líneas de CSS en AdminPanel.tsx
// debe moverse a un archivo CSS dedicado.

// 1. Crear el archivo: LogicaMath/frontend/components/admin/admin.css

// 2. Mover todo el contenido de la <style> tag al archivo .css
// (el mismo CSS que está en dangerouslySetInnerHTML, sin cambios)

// 3. En AdminPanel.tsx, reemplazar el dangerouslySetInnerHTML por:
import './admin.css';
// Y eliminar el bloque:
// <style dangerouslySetInnerHTML={{ __html: `...` }} />

// Esto elimina el FOUC y es más mantenible.
```

---

### CALIDAD-2: Tipado del campo password en User (types.ts)

```typescript
// En types.ts, el campo password viaja en el objeto User.
// Para evitar exposición accidental:

// OPCIÓN A — Crear tipos separados (recomendado):
export interface User {
  id: string;
  username: string;
  email: string;
  // NO incluir password en el tipo base
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  settings: UserSettings;
  unlockedLevel: number;
  fase_actual_id?: number;
}

// Crear tipo separado para formularios que sí necesitan la contraseña:
export interface UserWithCredentials extends User {
  password: string; // Solo para operaciones de auth
}

// OPCIÓN B — Si cambiar User.password rompe demasiadas cosas,
// al menos marcar el campo como interno:
export interface User {
  // ...otros campos...
  /** @internal Solo para uso de autenticación. No mostrar en UI. */
  password: string;
}
```

---

### CALIDAD-3: Agregar variable de entorno para SRE (SreTab.tsx + .env)

```bash
# Crear/actualizar LogicaMath/frontend/.env.example:
VITE_SRE_ENDPOINT=http://localhost:9323/progreso_sre.json
VITE_API_BASE_URL=http://localhost:8000

# En producción: LogicaMath/frontend/.env.production:
VITE_SRE_ENDPOINT=https://tu-dominio.com/sre/progreso_sre.json
```

---

## ✅ ORDEN DE IMPLEMENTACIÓN RECOMENDADO

Implementa en este orden para minimizar riesgos:

```
FASE 1 — Bugs sin side effects (1-2 horas):
  ├── BUG-3: Variable de entorno SRE
  ├── BUG-2: Enmascarar DATABASE_URL
  └── BUG-1: Fix Modo Evaluador (useState)

FASE 2 — UX crítico, bajo riesgo (2-3 horas):
  ├── UX-1: Tamaño fuente botones PerformanceTab
  ├── UX-6: Label "Config propia" en lugar de "Override"
  └── UX-7: Unificar toasts ContentTab

FASE 3 — Mejoras UX medianas (3-4 horas):
  ├── UX-2: Modal de Ajustes Visuales en sidebar
  ├── UX-3: KPIs con tendencias + tabla ordenable + empty state
  ├── UX-4: Lista de alumnos en PerformanceTab
  └── UX-5: Barras de progreso visuales

FASE 4 — Mejoras adicionales (2-3 horas):
  ├── MEJORA-1: Badges en tabs del sidebar
  ├── MEJORA-2: Jerarquía botones footer
  ├── MEJORA-3: Breadcrumb en ContentTab
  ├── MEJORA-4: Persist selector ContentTab
  └── MEJORA-5: Collapse/Expand all PedagogyTab

FASE 5 — Calidad de código (1-2 horas):
  ├── CALIDAD-1: Migrar CSS a archivo dedicado
  ├── CALIDAD-2: Tipado User sin password
  └── CALIDAD-3: Variables de entorno
```

---

## 🚨 RESTRICCIONES IMPORTANTES

1. **NO modificar** ningún archivo del backend (`/LogicaMath/backend/`)
2. **NO cambiar** los archivos de servicios (`/services/storageService.ts`, etc.)
3. **NO cambiar** la estructura visual general (dark mode, glassmorphism, colores azules)
4. **MANTENER** todas las animaciones de Framer Motion existentes
5. **MANTENER** la compatibilidad con React 19 y TypeScript strict mode
6. **NO agregar** nuevas dependencias npm — usa solo las ya instaladas
7. Después de cada cambio, **verificar** que TypeScript no reporta errores con `tsc --noEmit`

---

## 🧪 VERIFICACIÓN FINAL

Después de implementar todos los cambios, verifica:

- [ ] El toggle Modo Evaluador funciona sin recargar la página
- [ ] DATABASE_URL muestra asteriscos por defecto y tiene botón de mostrar/ocultar
- [ ] Los botones de acción en PerformanceTab son legibles (≥13px)
- [ ] Los Ajustes Visuales abren en un modal separado, no en el sidebar
- [ ] La tabla de usuarios se puede ordenar clickeando los headers
- [ ] El estado vacío de "sin usuarios" muestra un CTA para crear el primero
- [ ] Los toasts/confirmaciones en ContentTab usan el sistema global
- [ ] El término "Override" fue reemplazado por "Config propia" con tooltip
- [ ] `tsc --noEmit` no reporta errores de TypeScript
- [ ] La app funciona correctamente en modo claro Y oscuro
```
