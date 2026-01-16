import { Task, TodoItem, Achievement, UserStats, UserData, Challenge, Streak } from '../types';

const DB_KEY = 'flowstate_users_db_v5'; // Bumped version for schema change (isPro)
const SESSION_KEY = 'flowstate_current_session';

// --- Default Initial Data for New Users ---

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Morning meditation', emoji: '🧘', time: '08:00', duration: 15, color: '#B4A7D6', completed: false, category: 'wellness' },
  { id: 2, title: 'Check emails', emoji: '📧', time: '09:00', duration: 30, color: '#FFB4A2', completed: false, category: 'work' },
  { id: 3, title: 'Deep work session', emoji: '💻', time: '10:00', duration: 90, color: '#A8D8EA', completed: false, category: 'work' },
  { id: 4, title: 'Lunch break', emoji: '🍱', time: '12:30', duration: 45, color: '#FFCF96', completed: false, category: 'personal' },
];

const INITIAL_TODOS: TodoItem[] = [
  { id: 101, title: 'Buy groceries', emoji: '🛒', priority: 'high', completed: false },
  { id: 102, title: 'Call dentist', emoji: '🦷', priority: 'medium', completed: false },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first task', iconName: 'target', isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'momentum', title: 'Gaining Momentum', description: 'Complete 5 total tasks', iconName: 'rocket', isUnlocked: false, progress: 0, maxProgress: 5 },
  { id: 'task-master', title: 'Task Master', description: 'Complete 10 total tasks', iconName: 'trophy', isUnlocked: false, progress: 0, maxProgress: 10 },
  { id: 'focus-novice', title: 'Focus Novice', description: 'Complete 1 focus session', iconName: 'zap', isUnlocked: false, progress: 0, maxProgress: 1 },
  { id: 'deep-worker', title: 'Deep Worker', description: 'Complete 3 focus sessions', iconName: 'brain', isUnlocked: false, progress: 0, maxProgress: 3 },
  { id: 'planner', title: 'AI Architect', description: 'Generate a plan using AI', iconName: 'star', isUnlocked: false, progress: 0, maxProgress: 1 },
];

// Initial challenges are now more specific but use defaults since we don't know the exact date/task state on first boot
const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'daily-crystal', title: 'Crystal Hunter', description: 'Forge an Amethyst today', frequency: 'daily', type: 'collect_crystal', target: 1, currentProgress: 0, completed: false, lastReset: new Date().toISOString(), targetDetail: 'amethyst' },
  { id: 'daily-task-specific', title: 'Daily Grind', description: 'Complete 3 tasks today', frequency: 'daily', type: 'task_count', target: 3, currentProgress: 0, completed: false, lastReset: new Date().toISOString() },
  { id: 'weekly-master', title: 'Moon Phase', description: 'Complete 15 tasks this week', frequency: 'weekly', type: 'task_count', target: 15, currentProgress: 0, completed: false, lastReset: new Date().toISOString() },
  { id: 'weekly-deep', title: 'Deep Week', description: 'Complete 5 focus sessions this week', frequency: 'weekly', type: 'session_count', target: 5, currentProgress: 0, completed: false, lastReset: new Date().toISOString() },
];

const INITIAL_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastLoginDate: ''
};

const INITIAL_STATS: UserStats = {
  totalTasksCompleted: 0,
  focusSessionsCompleted: 0,
  aiPlansGenerated: 0
};

// --- Storage Logic ---

interface StorageSchema {
  users: Record<string, { password: string; data: UserData }>;
}

const getStorage = (): StorageSchema => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { users: {} };
};

const saveStorage = (db: StorageSchema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const authService = {
  login: (username: string, password: string): { success: boolean; message?: string; data?: UserData } => {
    const db = getStorage();
    const user = db.users[username];

    if (user && user.password === password) {
      localStorage.setItem(SESSION_KEY, username);
      
      // Data Migration Checks
      if (!user.data.sanctuary) user.data.sanctuary = [];
      if (!user.data.challenges) user.data.challenges = JSON.parse(JSON.stringify(INITIAL_CHALLENGES));
      if (!user.data.streak) user.data.streak = { ...INITIAL_STREAK };
      if (user.data.isPro === undefined) user.data.isPro = false;

      return { success: true, data: user.data };
    }
    return { success: false, message: 'Invalid username or password' };
  },

  signup: (username: string, password: string): { success: boolean; message?: string; data?: UserData } => {
    const db = getStorage();
    if (db.users[username]) {
      return { success: false, message: 'Username already exists' };
    }

    const newUser = {
      password,
      data: {
        tasks: INITIAL_TASKS,
        todos: INITIAL_TODOS,
        achievements: INITIAL_ACHIEVEMENTS,
        stats: INITIAL_STATS,
        sanctuary: [],
        challenges: INITIAL_CHALLENGES,
        streak: INITIAL_STREAK,
        isPro: false
      }
    };

    db.users[username] = newUser;
    saveStorage(db);
    localStorage.setItem(SESSION_KEY, username);
    
    return { success: true, data: newUser.data };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): string | null => {
    return localStorage.getItem(SESSION_KEY);
  },

  loadUserData: (): UserData | null => {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return null;
    const db = getStorage();
    const data = db.users[username]?.data || null;
    
    // Migration checks on load as well
    if (data) {
      if (!data.sanctuary) data.sanctuary = [];
      if (!data.challenges) data.challenges = JSON.parse(JSON.stringify(INITIAL_CHALLENGES));
      if (!data.streak) data.streak = { ...INITIAL_STREAK };
      if (data.isPro === undefined) data.isPro = false;
    }
    return data;
  },

  saveUserData: (data: UserData) => {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return;
    
    const db = getStorage();
    if (db.users[username]) {
      db.users[username].data = data;
      saveStorage(db);
    }
  }
};
