import { Task, TodoItem, Achievement, UserStats, UserData, Challenge, Streak } from '../types';

const DB_KEY = 'flowstate_users_db_v6'; // Bumped version for Dust/Tier schema
const SESSION_KEY = 'flowstate_current_session';

// --- Default Initial Data for New Users ---

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Morning meditation', emoji: '🧘', time: '08:00', duration: 15, color: '#B4A7D6', completed: false, category: 'wellness' },
  { id: 2, title: 'Check emails', emoji: '📧', time: '09:00', duration: 30, color: '#FFB4A2', completed: false, category: 'work' },
  { id: 3, title: 'Deep work session', emoji: '💻', time: '10:00', duration: 90, color: '#A8D8EA', completed: false, category: 'work' },
];

const INITIAL_TODOS: TodoItem[] = [
  { id: 101, title: 'Buy groceries', emoji: '🛒', priority: 'high', completed: false },
  { id: 102, title: 'Call dentist', emoji: '🦷', priority: 'medium', completed: false },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Tasks Completed', iconName: 'target', tier: 'bronze', level: 1, progress: 0, maxProgress: 5 },
  { id: 'momentum', title: 'Gaining Momentum', description: 'Streaks maintained', iconName: 'rocket', tier: 'bronze', level: 1, progress: 0, maxProgress: 3 },
  { id: 'focus-novice', title: 'Focus Novice', description: 'Total Focus Minutes', iconName: 'zap', tier: 'bronze', level: 1, progress: 0, maxProgress: 60 },
  { id: 'crystal-collector', title: 'Gemologist', description: 'Crystals Forged', iconName: 'trophy', tier: 'bronze', level: 1, progress: 0, maxProgress: 3 },
  { id: 'planner', title: 'Architect', description: 'AI Plans Generated', iconName: 'brain', tier: 'bronze', level: 1, progress: 0, maxProgress: 5 },
];

const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'daily-crystal', title: 'Crystal Hunter', description: 'Forge an Amethyst today', frequency: 'daily', type: 'collect_crystal', target: 1, currentProgress: 0, completed: false, claimed: false, lastReset: new Date().toISOString(), targetDetail: 'amethyst', rewardDust: 10 },
  { id: 'daily-focus', title: 'Deep Dive', description: 'Focus for 45 minutes total', frequency: 'daily', type: 'focus_minutes', target: 45, currentProgress: 0, completed: false, claimed: false, lastReset: new Date().toISOString(), rewardDust: 15 },
  { id: 'daily-tasks', title: 'Daily Grind', description: 'Complete 3 tasks', frequency: 'daily', type: 'task_count', target: 3, currentProgress: 0, completed: false, claimed: false, lastReset: new Date().toISOString(), rewardDust: 10 },
];

const INITIAL_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastLoginDate: ''
};

const INITIAL_STATS: UserStats = {
  totalTasksCompleted: 0,
  focusSessionsCompleted: 0,
  aiPlansGenerated: 0,
  focusDust: 0
};

const INITIAL_BLOCKED_APPS = ['Instagram', 'TikTok', 'Twitter', 'Facebook'];

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
      if (!user.data.blockedApps) user.data.blockedApps = INITIAL_BLOCKED_APPS;
      if (user.data.stats.focusDust === undefined) user.data.stats.focusDust = 0;
      
      // Map old achievements to new structure if needed
      user.data.achievements = user.data.achievements.map((ach, index) => {
          if (!ach.tier) return INITIAL_ACHIEVEMENTS[index] || ach;
          return ach;
      });

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
        isPro: false,
        blockedApps: INITIAL_BLOCKED_APPS
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
        if (!data.blockedApps) data.blockedApps = INITIAL_BLOCKED_APPS;
        if (data.stats.focusDust === undefined) data.stats.focusDust = 0;
        
        // Ensure new fields exist on achievements
        data.achievements = data.achievements.map((ach, index) => {
             if (!ach.tier) return { ...INITIAL_ACHIEVEMENTS[index], progress: ach.progress };
             return ach;
        });
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
