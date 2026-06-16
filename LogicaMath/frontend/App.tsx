import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeContext';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { GameScreenState, GameStats, GameCategory, ScoreRecord, Difficulty, User, PedagogyConfig } from './types';
const WelcomeScreen = React.lazy(() => import('./components/fase1/WelcomeScreen'));
const WelcomeScreenPhase2 = React.lazy(() => import('./components/fase2/WelcomeScreenPhase2'));
const Fase2GameScreen = React.lazy(() => import('./components/fase2/Fase2GameScreen'));
const WelcomeScreenPhaseGeneric = React.lazy(() => import('./components/fase_generic/WelcomeScreenPhaseGeneric'));
const WelcomeScreenPhase7 = React.lazy(() => import('./components/fase7/WelcomeScreenPhase7'));
const WelcomeScreenPhase8 = React.lazy(() => import('./components/fase8/WelcomeScreenPhase8'));
const WelcomeScreenPhase9 = React.lazy(() => import('./components/fase9/WelcomeScreenPhase9'));
const FaseGenericGameScreen = React.lazy(() => import('./components/fase_generic/FaseGenericGameScreen'));
const WelcomeScreenPhase3 = React.lazy(() => import('./components/fase3/WelcomeScreenPhase3').then(module => ({ default: module.WelcomeScreenPhase3 })));
const Fase3GameScreen = React.lazy(() => import('./components/fase3/Fase3GameScreen').then(module => ({ default: module.Fase3GameScreen })));
const WelcomeScreenPhase4 = React.lazy(() => import('./components/fase4/WelcomeScreenPhase4').then(module => ({ default: module.WelcomeScreenPhase4 })));
const Fase4GameScreen = React.lazy(() => import('./components/fase4/Fase4GameScreen').then(module => ({ default: module.Fase4GameScreen })));
const WelcomeScreenPhase5 = React.lazy(() => import('./components/fase5/WelcomeScreenPhase5'));
const Fase5GameScreen = React.lazy(() => import('./components/fase5/Fase5GameScreen'));
const WelcomeScreenPhase6 = React.lazy(() => import('./components/fase6/WelcomeScreenPhase6'));
const Fase6GameScreen = React.lazy(() => import('./components/fase6/Fase6GameScreen'));
const Fase7GameScreen = React.lazy(() => import('./components/fase7/Fase7GameScreen'));
const Fase8GameScreen = React.lazy(() => import('./components/fase8/Fase8GameScreen'));
const Fase9GameScreen = React.lazy(() => import('./components/fase9/Fase9GameScreen').then(m => ({ default: m.Fase9GameScreen })));
const Fase9ResultsScreen = React.lazy(() => import('./components/fase9/Fase9ResultsScreen').then(m => ({ default: m.Fase9ResultsScreen })));
const PhaseMapScreen = React.lazy(() => import('./components/map/PhaseMapScreen'));
const GameScreen = React.lazy(() => import('./components/fase1/GameScreen'));
const ResultsScreen = React.lazy(() => import('./components/fase1/ResultsScreen'));
const ProgressScreen = React.lazy(() => import('./components/ProgressScreen'));
const StudyTablesScreen = React.lazy(() => import('./components/fase1/StudyTablesScreen'));
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminPanel from './components/admin/AdminPanel';
const LevelSelectionScreen = React.lazy(() => import('./components/fase1/LevelSelectionScreen'));
import { saveScore, saveUser, getCurrentUserFull, getAdminSettings, getModularConfigs } from './services/storageService';
import * as authService from './services/authService';
import { useWebSocket } from './components/useWebSocket';

const Fase2GameScreenWrapper: React.FC<{ isEvaluatorMode: boolean }> = ({ isEvaluatorMode }) => {
  const location = useLocation();
  const moduloId = location.state?.moduloId || 1;
  const nivelId = location.state?.nivelId || 1;
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.moduloId) {
      navigate('/welcome-fase2', { replace: true });
    }
  }, [location.state, navigate]);

  return (
      <Fase2GameScreen
      moduloId={parseInt(moduloId as string, 10)}
      nivelId={parseInt(nivelId as string, 10)}
      isEvaluatorMode={isEvaluatorMode}
      onComplete={() => navigate('/welcome-fase2')}
      onBack={() => navigate('/welcome-fase2')}
    />
  );
};

const Fase3GameScreenWrapper: React.FC<{ isEvaluatorMode: boolean }> = ({ isEvaluatorMode }) => {
  return <Fase3GameScreen isEvaluatorMode={isEvaluatorMode} />;
};

const Fase4GameScreenWrapper: React.FC<{ isEvaluatorMode: boolean }> = ({ isEvaluatorMode }) => {
  return <Fase4GameScreen isEvaluatorMode={isEvaluatorMode} />;
};

const Fase5GameScreenWrapper: React.FC<{ isEvaluatorMode: boolean }> = ({ isEvaluatorMode }) => {
  const location = useLocation();
  const moduloId = location.state?.moduloId || 1;
  const nivelId = location.state?.nivelId || 1;
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.moduloId) {
      navigate('/welcome-fase5', { replace: true });
    }
  }, [location.state, navigate]);

  return (
    <Fase5GameScreen
      moduloId={parseInt(moduloId as string, 10)}
      nivelId={parseInt(nivelId as string, 10)}
      isEvaluatorMode={isEvaluatorMode}
      onComplete={() => navigate('/welcome-fase5')}
      onBack={() => navigate('/welcome-fase5')}
    />
  );
};

const Fase6GameScreenWrapper: React.FC<{ isEvaluatorMode: boolean }> = ({ isEvaluatorMode }) => {
  const location = useLocation();
  const moduloId = location.state?.moduloId || 1;
  const nivelId = location.state?.nivelId || 1;
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.moduloId) {
      navigate('/welcome-fase6', { replace: true });
    }
  }, [location.state, navigate]);

  return (
    <Fase6GameScreen
      moduloId={parseInt(moduloId as string, 10)}
      nivelId={parseInt(nivelId as string, 10)}
      isEvaluatorMode={isEvaluatorMode}
      onComplete={() => navigate('/welcome-fase6')}
      onBack={() => navigate('/welcome-fase6')}
    />
  );
};

const Fase7GameScreenWrapper: React.FC<{ isEvaluatorMode: boolean }> = ({ isEvaluatorMode }) => {
  const location = useLocation();
  const moduloId = location.state?.moduloId || 1;
  const nivelId = location.state?.nivelId || 1;
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.moduloId) {
      navigate('/welcome-fase7', { replace: true });
    }
  }, [location.state, navigate]);

  return (
    <Fase7GameScreen
      moduloId={parseInt(moduloId as string, 10)}
      nivelId={parseInt(nivelId as string, 10)}
      isEvaluatorMode={isEvaluatorMode}
      onComplete={() => navigate('/welcome-fase7')}
      onBack={() => navigate('/welcome-fase7')}
    />
  );
};

const Fase8GameScreenWrapper: React.FC<{ isEvaluatorMode: boolean }> = ({ isEvaluatorMode }) => {
  const location = useLocation();
  const moduloId = location.state?.moduloId || 1;
  const nivelId = location.state?.nivelId || 1;
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.moduloId) {
      navigate('/welcome-fase8', { replace: true });
    }
  }, [location.state, navigate]);

  return (
    <Fase8GameScreen
      moduloId={parseInt(moduloId as string, 10)}
      nivelId={parseInt(nivelId as string, 10)}
      isEvaluatorMode={isEvaluatorMode}
      onComplete={() => navigate('/welcome-fase8')}
      onBack={() => navigate('/welcome-fase8')}
    />
  );
};



const AppContent: React.FC = () => {
  // Current User Session (null if guest)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Evaluator Mode logic
  const isEvaluatorMode = currentUser?.role === 'ADMIN' && localStorage.getItem('evaluatorMode') === 'true';

  // Global WebSocket listener
  useWebSocket((source) => {
    console.log('[App] Broadcasting sync_required event globally...', source);
    window.dispatchEvent(new CustomEvent('sync_required', { detail: { source } }));
    
    // Reload global configs seamlessly
    if (currentUser) {
      loadPedagogyAndAdminConfigs(currentUser);
    }
  });

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

  // Restore state from navigation state to prevent URL manipulation
  useEffect(() => {
    if (location.state) {
      if (location.state.category) setCategory(location.state.category as GameCategory);
      if (location.state.difficulty) setDifficulty(location.state.difficulty as Difficulty);
    }
  }, [location.state]);

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
      navigate(`/level-selection`, { state: { category: selectedCategory } });
    }
  };

  const handleStartGame = (name: string, selectedCategory: GameCategory, selectedDifficulty: Difficulty) => {
    setUsername(name);
    setCategory(selectedCategory);
    setDifficulty(selectedDifficulty);
    navigate(`/play`, { state: { category: selectedCategory, difficulty: selectedDifficulty } });
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
          const currentPhase = currentUser?.fase_actual_id || 1;
          const gradPromise = currentPhase === 1 ? service.graduateToFase2() : service.graduateToFase1();
          gradPromise.then(() => {
            service.getCurrentUserFull().then(updatedUser => {
              setCurrentUser(updatedUser);
            }).catch(err => console.error("Error syncing user:", err));
          }).catch(err => console.error("Error in graduation:", err));
        }).catch(err => console.error("Error importando storageService:", err));
      }
    }

    setGameStats(stats);
    navigate(`/results`, { state: { category: category, stats } });
  };

  const handleRestart = () => {
    navigate(`/play`, { state: { category, difficulty } });
  };

  const handleNextLevel = () => {
    const currentIndex = difficultyOrder.indexOf(difficulty);
    if (currentIndex !== -1 && currentIndex < difficultyOrder.length - 1) {
      const nextDiff = difficultyOrder[currentIndex + 1];
      setDifficulty(nextDiff);
      navigate(`/play`, { state: { category, difficulty: nextDiff } });
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
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
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
                  } else if (phaseIndex === 3) {
                    navigate('/welcome-fase3');
                  } else if (phaseIndex === 4) {
                    navigate('/welcome-fase4');
                  } else if (phaseIndex === 5) {
                    navigate('/welcome-fase5');
                  } else if (phaseIndex === 6) {
                    navigate('/welcome-fase6');
                  } else if (phaseIndex === 7) {
                    navigate('/welcome-fase7');
                  } else if (phaseIndex === 8) {
                    navigate('/welcome-fase8');
                  } else if (phaseIndex === 9) {
                    navigate('/welcome-fase9');
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
            currentUser ? (
              <WelcomeScreenPhase2
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId) => {
                  navigate('/fase2/play', { state: { moduloId, nivelId: nivelId || 1 } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/welcome-fase5" element={
            currentUser ? (
              <WelcomeScreenPhase5
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId) => {
                  navigate('/fase5/play', { state: { moduloId, nivelId: nivelId || 1 } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/welcome-fase6" element={
            currentUser ? (
              <WelcomeScreenPhase6
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId) => {
                  navigate('/fase6/play', { state: { moduloId, nivelId: nivelId || 1 } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

           <Route path="/welcome-fase7" element={
            currentUser ? (
              <WelcomeScreenPhase7
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId) => {
                  navigate(`/fase7/play`, { state: { moduloId, nivelId: nivelId || 1, faseId: 7 } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/welcome-fase8" element={
            currentUser ? (
              <WelcomeScreenPhase8
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId) => {
                  navigate(`/fase8/play`, { state: { moduloId, nivelId: nivelId || 1, faseId: 8 } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/welcome-fase9" element={
            currentUser ? (
              <WelcomeScreenPhase9
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(simulacroNumero, _nivelId) => {
                  // simulacroNumero (1-20) goes as :moduloId in the URL
                  // The store extracts it and sends { simulacro_numero } to the backend
                  navigate(`/fase/9/game/${simulacroNumero}/0`);
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />


          <Route path="/welcome-fase" element={
            currentUser ? (
              <WelcomeScreenPhaseGeneric
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId, faseId) => {
                  navigate(`/fase/play`, { state: { moduloId, nivelId: nivelId || 1, faseId } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/welcome-fase3" element={
            currentUser ? (
              <WelcomeScreenPhase3
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId) => {
                  navigate('/fase3/play', { state: { moduloId, nivelId: nivelId || 1 } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/welcome-fase4" element={
            currentUser ? (
              <WelcomeScreenPhase4
                studentName={currentUser.username}
                userAvatar={currentUser.avatar}
                userRole={currentUser.role}
                onModuleSelect={(moduloId, nivelId) => {
                  navigate('/fase4/play', { state: { moduloId, nivelId: nivelId || 1 } });
                }}
                onBack={() => navigate('/map')}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase2/play" element={
            currentUser ? (
              <Fase2GameScreenWrapper isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase3/play" element={
            currentUser ? (
              <Fase3GameScreenWrapper isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase4/play" element={
            currentUser ? (
              <Fase4GameScreenWrapper isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase5/play" element={
            currentUser ? (
              <Fase5GameScreenWrapper isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase6/play" element={
            currentUser ? (
              <Fase6GameScreenWrapper isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase7/play" element={
            currentUser ? (
              <Fase7GameScreenWrapper isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase8/play" element={
            currentUser ? (
              <Fase8GameScreenWrapper isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase/9/game/:moduloId/:nivelId" element={
            currentUser ? (
              <Fase9GameScreen />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase/9/resultados" element={
            currentUser ? (
              <Fase9ResultsScreen />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/fase/play" element={
            currentUser ? (
              <FaseGenericGameScreen isEvaluatorMode={isEvaluatorMode} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/level-selection" element={
            <LevelSelectionScreen
              user={currentUser}
              category={category}
              onBack={() => navigate('/welcome')}
              onSelectLevel={(diff) => handleStartGame(currentUser?.username || "Invitado", category, diff)}
              adminConfig={adminConfig}
            />
          } />

          <Route path="/play" element={
            (() => {
              const categoryToModId: Record<string, number> = {
                'addition': 1,
                'subtraction': 2,
                'multiplication': 3,
                'division': 4,
                'challenge': 5
              };
              const difficultyToLevelId: Record<string, number> = {
                'easy': 1,
                'easy_medium': 2,
                'medium': 3,
                'medium_hard': 4,
                'hard': 5,
                'random_tables': 6
              };
              const modId = categoryToModId[category] || 1;
              const levelId = difficultyToLevelId[difficulty] || 3;
              const computedSeccion = modId * 100 + levelId;

              return (
                <GameScreen
                  category={category}
                  difficulty={difficulty}
                  userSettings={currentUser?.settings}
                  adminConfig={adminConfig}
                  modularConfigs={modularConfigs}
                  faseId={currentUser?.fase_actual_id || 1}
                  seccion={computedSeccion}
                  isEvaluatorMode={isEvaluatorMode}
                  onEndGame={handleEndGame}
                  onExit={() => navigate(currentUser ? '/map' : '/welcome')}
                />
              );
            })()
          } />

          <Route path="/results" element={
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
        </React.Suspense>
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
