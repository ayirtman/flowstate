export type TaskCategory = 'wellness' | 'work' | 'personal';

export interface Task {
  id: number;
  title: string;
  emoji: string;
  time: string; // Format "HH:MM"
  duration: number; // in minutes
  color: string;
  completed: boolean;
  category: TaskCategory;
}

export type TodoPriority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: number;
  title: string;
  emoji: string;
  priority: TodoPriority;
  completed: boolean;
}

export type ViewState = 'timeline' | 'focus' | 'todos' | 'achievements';

export type TimerMode = 'focus' | 'break';

export interface GeneratedTask {
  title: string;
  emoji: string;
  priority: TodoPriority;
}

export type IconName = 'trophy' | 'target' | 'zap' | 'brain' | 'star' | 'rocket';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
  tier: AchievementTier;
  progress: number;
  maxProgress: number; // Progress needed for NEXT tier
  level: number; // 1-5
}

export interface UserStats {
  totalTasksCompleted: number;
  focusSessionsCompleted: number;
  aiPlansGenerated: number;
  focusDust: number; // New Currency
}

// Crystal / Sanctuary Features
export type CrystalType = 'amethyst' | 'citrine' | 'sapphire' | 'emerald' | 'ruby' | 'obsidian' | 'moonstone';

export interface Crystal {
  id: number;
  type: CrystalType;
  forgedAt: number; // timestamp
}

// Challenge / Rituals System
export type ChallengeFrequency = 'daily' | 'weekly' | 'infinite';
export type ChallengeType = 'focus_minutes' | 'task_count' | 'session_count' | 'collect_crystal' | 'specific_task';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  frequency: ChallengeFrequency;
  type: ChallengeType;
  target: number;
  currentProgress: number;
  completed: boolean;
  claimed: boolean; // New: User must manually claim
  lastReset: string; // ISO Date string
  targetDetail?: string; // e.g., 'amethyst', '101' (taskId), or null
  rewardDust: number; // XP/Currency reward
}

export interface Streak {
  current: number;
  longest: number;
  lastLoginDate: string; // ISO Date string (YYYY-MM-DD)
}

// Data structure for a user's persisted state
export interface UserData {
  tasks: Task[];
  todos: TodoItem[];
  achievements: Achievement[];
  stats: UserStats;
  sanctuary: Crystal[];
  challenges: Challenge[];
  streak: Streak;
  isPro: boolean;
  blockedApps: string[];
}
