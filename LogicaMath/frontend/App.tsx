import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeContext';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { GameScreenState, GameStats, GameCategory, ScoreRecord, Difficulty, User, PedagogyConfig } from './types';
import WelcomeScreen from './components/fase1/WelcomeScreen';
import WelcomeScreenPhase2 from './components/fase2/WelcomeScreenPhase2';
import PhaseMapScreen from './components/map/PhaseMapScreen';
import GameScreen from './components/fase1/GameScreen';
import ResultsScreen from './components/fase1/ResultsScreen';
import ProgressScreen from './components/ProgressScreen';
import StudyTablesScreen from './components/fase1/StudyTablesScreen';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminPanel from './components/admin/AdminPanel';
import LevelSelectionScreen from './components/fase1/LevelSelectionScreen';
import { saveScore, saveUser, getCurrentUserFull, getAdminSettings, getModularConfigs } from './services/storageService';
import * as authService from './services/authService';

const AppContent: React.FC = () => {
  // Current User Session (null if guest)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [category, setCategory] = useState<GameCategory>('challenge');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [adminConfig, setAdminConfig] = useState<PedagogyConfig | null>(null);
  const [modularConfigs, setModularConfigs] = useState<import('./types').ConfiguracionProgreso[]>([]);

  // 1. Agrega un estado de carga de autenticación
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync category and difficulty from URL if they exist (to preserve state on refresh)
  useEffect(() => {
    const playMatch = location.pathname.match(/\/play\/([^/]+)\/([^/]+)/);
    if (playMatch) {
      setCategory(playMatch[1] as GameCategory);
      setDifficulty(playMatch[2] as Difficulty);
    } else {
      const levelMatch = location.pathname.match(/\/level-selection\/([^/]+)/);
      if (levelMatch) {
        setCategory(levelMatch[1] as GameCategory);
      } else {
        const resultsMatch = location.pathname.match(/\/results\/([^/]+)/);
        if (resultsMatch) {
          setCategory(resultsMatch[1] as GameCategory);
        }
      }
    }
  }, [location.pathname]);

  // 2. Modifica la función 'loadAdminConfig' y renombrala a 'loadPedagogyAndAdminConfigs'
  const loadPedagogyAndAdminConfigs = async (user: User | null) => {
    try {
      const config = await getAdminSettings();
      if (config) {
        setAdminConfig(config);
      }
      
      // Solo modularConfigs si existe user y su rol es ADMIN
      if (user && user.role === 'ADMIN') {
        const mConfigs = await getModularConfigs();
        if (mConfigs) {
          setModularConfigs(mConfigs);
        }
      } else {
        setModularConfigs([]);
      }
    } catch (err) {
      console.error("Failed to load pedagogy or admin configs:", err);
    }
  };

  // 3. En el 'useEffect' de 'checkAuth', haz que 'setIsAuthLoading(true)' al iniciar.
  // Si se encuentra un usuario válido, llama inmediatamente a 'await loadPedagogyAndAdminConfigs(dbUser)' justo antes de redirigir al mapa.
  // Al final de todo el flujo de 'checkAuth', setea 'setIsAuthLoading(false)'.
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          try {
            // Sync with Backend to get Level/Avatar/Settings
            const dbUser = await getCurrentUserFull();
            setCurrentUser(dbUser);
            setUsername(dbUser.username);
            await loadPedagogyAndAdminConfigs(dbUser);
            if (location.pathname === '/login' || location.pathname === '/') {
              navigate('/map');
            }
          } catch (error) {
            console.error("Error syncing user profile:", error);
            // Use basic info from stored user
            const fallbackUser: User = {
              id: user.id,
              username: user.username || 'Usuario',
              email: user.email || '',
              password: '',
              role: user.role || 'USER',
              status: user.status || 'ACTIVE',
              avatar: user.avatar,
              createdAt: user.created_at || new Date().toISOString(),
              settings: user.settings || {},
              unlockedLevel: user.unlocked_level || 0
            };
            setCurrentUser(fallbackUser);
            setUsername(fallbackUser.username);
            await loadPedagogyAndAdminConfigs(fallbackUser);
            if (location.pathname === '/login' || location.pathname === '/') {
              navigate('/map');
            }
          }
        } else {
          // User is not authenticated
          setCurrentUser(null);
          setUsername('');
          await loadPedagogyAndAdminConfigs(null);
          if (
            location.pathname !== '/login' &&
            location.pathname !== '/welcome' &&
            !location.pathname.startsWith('/play') &&
            !location.pathname.startsWith('/level-selection') &&
            !location.pathname.startsWith('/results') &&
            location.pathname !== '/study-tables'
          ) {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error("Error during checkAuth:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Difficulty Mapping for Progression
  const difficultyOrder: Difficulty[] = ['easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'random_tables'];

  // 4. En los controladores 'handleLoginSuccess' y 'handleLogout', asegúrate de llamar/limpiar estas configuraciones de forma segura.
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setUsername(user.username);
    await loadPedagogyAndAdminConfigs(user);
    navigate('/map');
  };

  const handleGuestPlay = async () => {
    setCurrentUser(null);
    setUsername('');
    await loadPedagogyAndAdminConfigs(null);
    navigate('/welcome');
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setUsername('');
    setAdminConfig(null);
    setModularConfigs([]);
    navigate('/login');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsername(updatedUser.username);
  };

  // --- GAME HANDLERS ---
  const handleSelectCategory = (selectedCategory: GameCategory) => {
    if (selectedCategory === 'challenge') {
      // Challenge mode starts immediately at level 5
      handleStartGame(currentUser?.username || "Invitado", 'challenge', 'hard');
    } else {
      setCategory(selectedCategory);
      navigate(`/level-selection/${selectedCategory}`);
    }
  };

  const handleStartGame = (name: string, selectedCategory: GameCategory, selectedDifficulty: Difficulty) => {
    setUsername(name);
    setCategory(selectedCategory);
    setDifficulty(selectedDifficulty);
    navigate(`/play/${selectedCategory}/${selectedDifficulty}`);
  };

  const handleShowStats = () => {
    navigate('/progress');
  };

  const handleEndGame = async (stats: GameStats) => {
    const totalQuestions = stats.correct + stats.incorrect;
    const score = totalQuestions > 0 ? Math.round((stats.correct / totalQuestions) * 100) : 0;
    const avgTime = totalQuestions > 0 ? parseFloat((stats.totalTime / totalQuestions).toFixed(2)) : 0;

    const record: ScoreRecord = {
      id: Date.now().toString(),
      user: username,
      score: score,
      correctCount: stats.correct,
      errorCount: stats.incorrect,
      avgTime: avgTime,
      date: new Date().toISOString(),
      category: category,
      difficulty: category === 'challenge' ? 'mixed' : difficulty
    };

    try {
      await saveScore(record);
      // Sync user data to get updated progress/settings
      const updatedUser = await getCurrentUserFull();
      handleUpdateUser(updatedUser);
    } catch (error: any) {
      console.error("Failed to save score:", error);
    }

    // --- LEVEL PROGRESSION LOGIC ---
    if (currentUser && currentUser.role !== 'ADMIN') {
      const currentDiffIndex = difficultyOrder.indexOf(difficulty);

      if (currentDiffIndex !== -1 && currentDiffIndex < difficultyOrder.length) {
        const requiredScore = adminConfig?.passingScore || 90;
        if (score >= requiredScore) {
          const nextLevel = currentDiffIndex + 2;

          import('./services/storageService').then(service => {
            service.unlockLevel(category, nextLevel).catch(err => console.error("Error unlocking level:", err));
          }).catch(err => console.error("Error importando storageService:", err));
        }
      }

      // --- GRADUATION LOGIC ---
      if (category === 'challenge' && score >= 90) { // Require 90% for graduation
        import('./services/storageService').then(service => {
          service.graduateToFase1().then(() => {
            service.getCurrentUserFull().then(updatedUser => {
              setCurrentUser(updatedUser);
            }).catch(err => console.error("Error syncing user:", err));
          }).catch(err => console.error("Error in graduation:", err));
        }).catch(err => console.error("Error importando storageService:", err));
      }
    }

    setGameStats(stats);
    navigate(`/results/${category}`);
  };

  const handleRestart = () => {
    navigate(`/play/${category}/${difficulty}`);
  };

  const handleNextLevel = () => {
    const currentIndex = difficultyOrder.indexOf(difficulty);
    if (currentIndex !== -1 && currentIndex < difficultyOrder.length - 1) {
      const nextDiff = difficultyOrder[currentIndex + 1];
      setDifficulty(nextDiff);
      navigate(`/play/${category}/${nextDiff}`);
    }
  };

  // Helper to determine if next level button should show
  const currentDiffIndex = difficultyOrder.indexOf(difficulty);
  const hasNextLevel = category !== 'challenge' && currentDiffIndex !== -1 && currentDiffIndex < difficultyOrder.length - 1;
  const totalQ = gameStats ? gameStats.correct + gameStats.incorrect : 0;
  const lastScore = gameStats && totalQ > 0 ? (gameStats.correct / totalQ) * 100 : 0;
  const isPass = lastScore >= (adminConfig?.passingScore || 90);

  // 5. Al principio del renderizado del componente 'AppContent', si 'isAuthLoading' es true, retorna una pantalla de carga limpia que diga "Verificando sesión...".
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-300">
      {/* Decorative Circles */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl flex justify-center items-center relative z-10 min-h-[600px]">
        <Routes>
          <Route path="/login" element={
            <LoginScreen
              onLoginSuccess={handleLoginSuccess}
              onGuestPlay={handleGuestPlay}
            />
          } />

          <Route path="/map" element={
            currentUser ? (
              <PhaseMapScreen
                user={currentUser}
                onSelectPhase={(phaseIndex) => {
                  if (phaseIndex === 1) {
                    navigate('/welcome');
                  } else if (phaseIndex === 2) {
                    navigate('/welcome-fase2');
                  } else {
                    alert(`¡La Fase ${phaseIndex} está desbloqueada! Muy pronto implementaremos sus dinámicas de juego.`);
                  }
                }}
                onLogout={handleLogout}
                onGoProfile={() => navigate('/profile')}
                onGoStats={() => navigate('/progress')}
                onGoAdmin={currentUser.role === 'ADMIN' ? () => navigate('/admin') : undefined}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/welcome" element={
            <WelcomeScreen
              user={currentUser}
              onSelectCategory={handleSelectCategory}
              onLogout={handleLogout}
              onGoAdmin={currentUser?.role === 'ADMIN' ? () => navigate('/admin') : undefined}
              onGoProfile={currentUser ? () => navigate('/profile') : undefined}
              onGoStats={handleShowStats}
              onBackMap={currentUser ? () => navigate('/map') : undefined}
            />
          } />

          <Route path="/welcome-fase2" element={
            <WelcomeScreenPhase2
              user={currentUser}
              onSelectCategory={handleSelectCategory}
              onLogout={handleLogout}
              onGoAdmin={currentUser?.role === 'ADMIN' ? () => navigate('/admin') : undefined}
              onGoProfile={currentUser ? () => navigate('/profile') : undefined}
              onGoStats={handleShowStats}
              onBackMap={currentUser ? () => navigate('/map') : undefined}
            />
          } />

          <Route path="/level-selection/:category" element={
            <LevelSelectionScreen
              user={currentUser}
              category={category}
              onBack={() => navigate('/welcome')}
              onSelectLevel={(diff) => handleStartGame(currentUser?.username || "Invitado", category, diff)}
              adminConfig={adminConfig}
            />
          } />

          <Route path="/play/:category/:difficulty" element={
            <GameScreen
              category={category}
              difficulty={difficulty}
              userSettings={currentUser?.settings}
              adminConfig={adminConfig}
              modularConfigs={modularConfigs}
              faseId={currentUser?.fase_actual_id || 1}
              seccion={1}
              onEndGame={handleEndGame}
              onExit={() => navigate(currentUser ? '/map' : '/welcome')}
            />
          } />

          <Route path="/results/:category" element={
            gameStats ? (
              <ResultsScreen
                stats={gameStats}
                username={username}
                onRestart={handleRestart}
                onHome={() => navigate(currentUser ? '/map' : '/welcome')}
                onNextLevel={handleNextLevel}
                hasNextLevel={hasNextLevel}
                isPass={isPass}
                adminConfig={adminConfig}
                category={category}
              />
            ) : (
              <Navigate to={currentUser ? '/map' : '/welcome'} replace />
            )
          } />

          <Route path="/progress" element={
            <ProgressScreen
              username={username}
              onBack={() => navigate(currentUser ? '/map' : '/welcome')}
            />
          } />

          <Route path="/study-tables" element={
            <StudyTablesScreen
              onBack={() => navigate(currentUser ? '/map' : '/welcome')}
              onPractice={() => handleStartGame(username || 'Estudiante', 'multiplication', 'random_tables')}
            />
          } />

          <Route path="/profile" element={
            currentUser ? (
              <ProfileScreen
                user={currentUser}
                onUpdateUser={handleUpdateUser}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/admin" element={
            currentUser?.role === 'ADMIN' ? (
              <AdminPanel
                onBack={() => navigate('/map')}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to={currentUser ? "/map" : "/login"} replace />
            )
          } />

          <Route path="/" element={<Navigate to={currentUser ? "/map" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ThemeToggle />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
