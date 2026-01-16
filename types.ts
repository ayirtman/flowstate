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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface UserStats {
  totalTasksCompleted: number;
  focusSessionsCompleted: number;
  aiPlansGenerated: number;
}

// Crystal / Sanctuary Features
export type CrystalType = 'amethyst' | 'citrine' | 'sapphire' | 'ruby' | 'emerald' | 'diamond' | 'obsidian' | 'moonstone';

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
  lastReset: string; // ISO Date string
  targetDetail?: string; // e.g., 'amethyst', '101' (taskId), or null
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
}
