import React, { useState, useEffect } from 'react';
import { GameScreenState, GameStats, GameCategory, ScoreRecord, Difficulty, User, PedagogyConfig } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import StudyTablesScreen from './components/StudyTablesScreen';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminPanel from './components/AdminPanel';
import SubjectSelectionScreen from './components/SubjectSelectionScreen';
import LevelSelectionScreen from './components/LevelSelectionScreen';
import { saveScore, saveUser, getCurrentUserFull, getSubjects, getAdminSettings } from './services/storageService';
import * as authService from './services/authService';
import { Subject } from './types';

const App: React.FC = () => {
  // Start at LOGIN screen
  const [screen, setScreen] = useState<GameScreenState>(GameScreenState.LOGIN);

  // Current User Session (null if guest)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [category, setCategory] = useState<GameCategory>('challenge');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [adminConfig, setAdminConfig] = useState<PedagogyConfig | null>(null);

  // Auto-Restore Session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        try {
          // Sync with Backend to get Level/Avatar/Settings
          const dbUser = await getCurrentUserFull();
          setCurrentUser(dbUser);
          setUsername(dbUser.username);
          setScreen(dbUser.role === 'ADMIN' ? GameScreenState.ADMIN_PANEL : GameScreenState.WELCOME);
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
          setScreen(fallbackUser.role === 'ADMIN' ? GameScreenState.ADMIN_PANEL : GameScreenState.WELCOME);
        }
      } else {
        // User is not authenticated
        setCurrentUser(null);
        setUsername('');
        setScreen(GameScreenState.LOGIN);
      }
    };

    checkAuth();
    loadSubjects();
    loadAdminConfig();
  }, []);

  const loadAdminConfig = async () => {
    const config = await getAdminSettings();
    if (config) {
      setAdminConfig(config);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  // Difficulty Mapping for Progression
  const difficultyOrder: Difficulty[] = ['easy', 'easy_medium', 'medium', 'medium_hard', 'hard', 'random_tables'];

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setUsername(user.username);
    setScreen(user.role === 'ADMIN' ? GameScreenState.ADMIN_PANEL : GameScreenState.SUBJECT_SELECTION);
  };

  const handleGuestPlay = () => {
    setCurrentUser(null);
    setUsername('');
    setScreen(GameScreenState.SUBJECT_SELECTION);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setUsername('');
    setScreen(GameScreenState.LOGIN);
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
      setScreen(GameScreenState.LEVEL_SELECTION);
    }
  };

  const handleStartGame = (name: string, selectedCategory: GameCategory, selectedDifficulty: Difficulty) => {
    setUsername(name);
    setCategory(selectedCategory);
    setDifficulty(selectedDifficulty);
    setScreen(GameScreenState.PLAYING);
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    // If it's math, go to welcome (which has the category selector)
    // If it's logic, we'll use same welcome but it should adapt
    setScreen(GameScreenState.WELCOME);
  };

  const handleShowLeaderboard = (name: string) => {
    setUsername(name);
    setScreen(GameScreenState.LEADERBOARD);
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
      subject_id: selectedSubject?.id,
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

      // Note: We don't need to check currentUnlocked strictly here because the API endpoints
      // in 'unlockLevel' handle the "don't downgrade" logic. 
      // We just need to know IF they passed a level that SHOULD unlock the next one.

      // If user passed this difficulty (and presumably it was their max or lower)
      if (currentDiffIndex !== -1 && currentDiffIndex < difficultyOrder.length - 1) {
        // Determine if pass based on admin config or default 85%
        const requiredScore = adminConfig?.passingScore || 85;
        if (score >= requiredScore) {
          const nextLevel = currentDiffIndex + 1;

          // Call API to attempt unlock
          // The backend guarantees it only updates if newLevel > currentLevel
          import('./services/storageService').then(service => {
            service.unlockLevel(category, nextLevel);
          });
          // Note: No longer updating global unlockedLevel to keep categories independent
        }
      }

      // --- GRADUATION LOGIC ---
      if (category === 'challenge' && score >= 90) { // Require 90% for graduation
        import('./services/storageService').then(service => {
          service.graduateToFase1().then(() => {
            // Re-sync user info to reflect new phase
            service.getCurrentUserFull().then(updatedUser => {
              setCurrentUser(updatedUser);
            });
          });
        });
      }
    }

    setGameStats(stats);
    setScreen(GameScreenState.RESULTS);
  };

  const handleRestart = () => {
    setScreen(GameScreenState.PLAYING);
  };

  const handleNextLevel = () => {
    const currentIndex = difficultyOrder.indexOf(difficulty);
    if (currentIndex !== -1 && currentIndex < difficultyOrder.length - 1) {
      const nextDiff = difficultyOrder[currentIndex + 1];
      setDifficulty(nextDiff);
      setScreen(GameScreenState.PLAYING);
    }
  };

  const handleGoHome = () => {
    setScreen(GameScreenState.SUBJECT_SELECTION);
    setGameStats(null);
  };

  // Helper to determine if next level button should show
  const currentDiffIndex = difficultyOrder.indexOf(difficulty);
  const hasNextLevel = category !== 'challenge' && currentDiffIndex !== -1 && currentDiffIndex < difficultyOrder.length - 1;
  const totalQ = gameStats ? gameStats.correct + gameStats.incorrect : 0;
  const lastScore = gameStats && totalQ > 0 ? (gameStats.correct / totalQ) * 100 : 0;
  const isPass = lastScore >= (adminConfig?.passingScore || 85);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black flex flex-col items-center justify-center p-4 overflow-hidden">

      {/* Decorative Circles */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl flex justify-center items-center relative z-10 min-h-[600px]">

        {screen === GameScreenState.LOGIN && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGuestPlay={handleGuestPlay}
          />
        )}

        {screen === GameScreenState.SUBJECT_SELECTION && (
          <SubjectSelectionScreen
            subjects={subjects}
            onSelect={handleSelectSubject}
            onBack={() => setScreen(GameScreenState.WELCOME)}
          />
        )}

        {screen === GameScreenState.WELCOME && (
          <WelcomeScreen
            user={currentUser}
            onSelectCategory={handleSelectCategory}
            onLogout={handleLogout}
            onGoAdmin={currentUser?.role === 'ADMIN' ? () => setScreen(GameScreenState.ADMIN_PANEL) : undefined}
            onGoProfile={currentUser ? () => setScreen(GameScreenState.PROFILE) : undefined}
          />
        )}

        {screen === GameScreenState.LEVEL_SELECTION && (
          <LevelSelectionScreen
            user={currentUser}
            category={category}
            onBack={() => setScreen(GameScreenState.WELCOME)}
            onSelectLevel={(diff) => handleStartGame(currentUser?.username || "Invitado", category, diff)}
            adminConfig={adminConfig}
          />
        )}

        {screen === GameScreenState.PLAYING && (
          <GameScreen
            category={category}
            difficulty={difficulty}
            userSettings={currentUser?.settings}
            adminConfig={adminConfig}
            onEndGame={handleEndGame}
            onExit={handleGoHome}
          />
        )}

        {screen === GameScreenState.RESULTS && gameStats && (
          <ResultsScreen
            stats={gameStats}
            username={username}
            onRestart={handleRestart}
            onHome={handleGoHome}
            onNextLevel={handleNextLevel}
            hasNextLevel={hasNextLevel}
            isPass={isPass}
            adminConfig={adminConfig}
            category={category}
          />
        )}

        {screen === GameScreenState.LEADERBOARD && (
          <LeaderboardScreen
            username={username}
            onBack={() => setScreen(GameScreenState.WELCOME)}
          />
        )}

        {screen === GameScreenState.STUDY_TABLES && (
          <StudyTablesScreen
            onBack={() => setScreen(GameScreenState.WELCOME)}
            onPractice={() => handleStartGame(username || 'Estudiante', 'multiplication', 'random_tables')}
          />
        )}

        {screen === GameScreenState.PROFILE && currentUser && (
          <ProfileScreen
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onBack={() => setScreen(GameScreenState.WELCOME)}
          />
        )}

        {screen === GameScreenState.ADMIN_PANEL && currentUser?.role === 'ADMIN' && (
          <AdminPanel
            onBack={() => setScreen(GameScreenState.WELCOME)}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
};

export default App;
