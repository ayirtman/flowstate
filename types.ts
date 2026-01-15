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
export type CrystalType = 'amethyst' | 'citrine' | 'sapphire' | 'ruby' | 'emerald' | 'diamond';

export interface Crystal {
  id: number;
  type: CrystalType;
  forgedAt: number; // timestamp
}

// Data structure for a user's persisted state
export interface UserData {
  tasks: Task[];
  todos: TodoItem[];
  achievements: Achievement[];
  stats: UserStats;
  sanctuary: Crystal[];
}
