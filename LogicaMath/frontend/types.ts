
export enum GameScreenState {
  LOGIN,
  WELCOME,
  SUBJECT_SELECTION,
  PLAYING,
  RESULTS,
  LEADERBOARD,
  STUDY_TABLES,
  PROFILE,
  ADMIN_PANEL,
  LEVEL_SELECTION
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export type GameCategory =
  | 'challenge'
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division';

export type Difficulty = 'easy' | 'easy_medium' | 'medium' | 'medium_hard' | 'hard' | 'random_tables';

export interface Question {
  text: string;
  answer: number;
}

export interface ScoreRecord {
  id: string;
  user: string;
  score: number;
  correctCount: number;
  errorCount: number;
  avgTime: number;
  date: string;
  subject_id?: string;
  category?: string;
  difficulty?: string;
}

export interface GameStats {
  correct: number;
  incorrect: number;
  totalTime: number;
}

// --- NEW USER TYPES ---

export type UserRole = 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface UserSettings {
  customTimers?: Partial<Record<Difficulty, number>>; // Custom seconds per difficulty
  unlockedLevels?: Record<string, number>; // Category -> Level Index
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Password hash stored in backend
  role: UserRole;
  status: UserStatus;
  avatar?: string; // Base64 string
  createdAt: string;
  lastLogin?: string;
  settings: UserSettings;
  unlockedLevel: number;
  fase_actual_id?: number;
}

export interface CategoryProgress {
  category: string;
  unlocked_level: number;
  total_games: number;
  total_score: number;
  total_correct: number;
  total_errors: number;
  total_time_seconds: number;
  accuracy_rate?: number;
  avg_response_time?: number;
}

export interface PedagogyConfig {
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
