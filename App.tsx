import React, { useState, useEffect } from 'react';
import { CalendarDays, Timer, ListTodo, Sparkles, Trophy, LogOut } from 'lucide-react';

import TaskCard from './components/TaskCard';
import FocusTimer from './components/FocusTimer';
import TodoList from './components/TodoList';
import AchievementsList from './components/AchievementsList';
import AIModal from './components/AIModal';
import Celebration from './components/Celebration';
import AuthScreen from './components/AuthScreen';
import SubscriptionModal from './components/SubscriptionModal';
import CraftingModal from './components/CraftingModal';

import { Task, TodoItem, ViewState, GeneratedTask, Achievement, UserStats, UserData, Crystal, CrystalType, Challenge, Streak, ChallengeType } from './types';
import { authService } from './services/storage';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // App Data State
  const [currentView, setCurrentView] = useState<ViewState>('timeline');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sanctuary, setSanctuary] = useState<Crystal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastLoginDate: '' });
  const [stats, setStats] = useState<UserStats>({
    totalTasksCompleted: 0,
    focusSessionsCompleted: 0,
    aiPlansGenerated: 0
  });

  const [showAIModal, setShowAIModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCraftingModal, setShowCraftingModal] = useState(false);

  // --- Initialization & Auth ---

  useEffect(() => {
    const username = authService.getCurrentUser();
    if (username) {
      const data = authService.loadUserData();
      if (data) {
        const processedData = processDailyResets(data);
        loadDataIntoState(processedData);
        setCurrentUser(username);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser && !isLoading) {
      authService.saveUserData({
        tasks, todos, achievements, stats, sanctuary, challenges, streak, isPro
      });
    }
  }, [tasks, todos, achievements, stats, sanctuary, challenges, streak, isPro, currentUser, isLoading]);

  const loadDataIntoState = (data: UserData) => {
    setTasks(data.tasks);
    setTodos(data.todos);
    setAchievements(data.achievements);
    setStats(data.stats);
    setSanctuary(data.sanctuary || []);
    setChallenges(data.challenges || []);
    setStreak(data.streak || { current: 0, longest: 0, lastLoginDate: '' });
    setIsPro(data.isPro || false);
  };

  // --- Logic: Date & Streaks ---
  const generateNewDailyChallenges = (currentTasks: Task[]): Challenge[] => {
      const today = new Date().toISOString();
      const crystals: CrystalType[] = ['amethyst', 'citrine', 'sapphire', 'ruby', 'emerald'];
      const randomCrystal = crystals[Math.floor(Math.random() * crystals.length)];
      
      const incompleteTasks = currentTasks.filter(t => !t.completed);
      const randomTask = incompleteTasks.length > 0 
          ? incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)] 
          : null;

      const crystalChallenge: Challenge = {
          id: 'daily-crystal',
          title: `Gem Hunter`,
          description: `Forge a ${randomCrystal.charAt(0).toUpperCase() + randomCrystal.slice(1)} today`,
          frequency: 'daily',
          type: 'collect_crystal',
          target: 1,
          currentProgress: 0,
          completed: false,
          lastReset: today,
          targetDetail: randomCrystal
      };

      const taskChallenge: Challenge = randomTask ? {
          id: 'daily-task-specific',
          title: 'Priority Mission',
          description: `Complete "${randomTask.title}"`,
          frequency: 'daily',
          type: 'specific_task',
          target: 1,
          currentProgress: 0,
          completed: false,
          lastReset: today,
          targetDetail: randomTask.id.toString()
      } : {
          id: 'daily-task-generic',
          title: 'Daily Grind',
          description: 'Complete 3 tasks today',
          frequency: 'daily',
          type: 'task_count',
          target: 3,
          currentProgress: 0,
          completed: false,
          lastReset: today
      };

      return [crystalChallenge, taskChallenge];
  };

  const processDailyResets = (data: UserData): UserData => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const lastLogin = data.streak?.lastLoginDate || '';
    
    let newStreak = { ...data.streak };
    if (lastLogin !== todayStr) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLogin === yesterdayStr) {
            newStreak.current += 1;
        } else {
            newStreak.current = 1;
        }
        
        if (newStreak.current > newStreak.longest) {
            newStreak.longest = newStreak.current;
        }
        newStreak.lastLoginDate = todayStr;
    }

    const otherChallenges = data.challenges.filter(ch => ch.frequency !== 'daily');
    const dailyChallenges = data.challenges.filter(ch => ch.frequency === 'daily');
    
    let newDailyChallenges = [...dailyChallenges];
    const anyDailyExpired = dailyChallenges.some(ch => {
        const lastResetStr = new Date(ch.lastReset).toISOString().split('T')[0];
        return lastResetStr !== todayStr;
    });

    if (anyDailyExpired || dailyChallenges.length === 0) {
        newDailyChallenges = generateNewDailyChallenges(data.tasks);
    }

    const processedOtherChallenges = otherChallenges.map(ch => {
        if (ch.frequency === 'weekly') {
            const lastReset = new Date(ch.lastReset);
            const diffTime = Math.abs(today.getTime() - lastReset.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if ((today.getDay() === 1 && todayStr !== lastReset.toISOString().split('T')[0]) || diffDays > 7) {
                 return { ...ch, currentProgress: 0, completed: false, lastReset: today.toISOString() };
            }
        }
        return ch;
    });

    return { ...data, streak: newStreak, challenges: [...newDailyChallenges, ...processedOtherChallenges] };
  };

  const handleLoginSuccess = (username: string, data: UserData) => {
    const processedData = processDailyResets(data);
    setCurrentUser(username);
    loadDataIntoState(processedData);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setTasks([]); setTodos([]); setAchievements([]); setSanctuary([]); setChallenges([]); setIsPro(false);
  };

  // --- Handlers ---
  const handleUpgradeGeneric = () => {
      const moonstoneIndex = sanctuary.findIndex(c => c.type === 'moonstone');
      if (moonstoneIndex !== -1) {
          const newSanctuary = [...sanctuary];
          newSanctuary.splice(moonstoneIndex, 1);
          setSanctuary(newSanctuary);
      }
      
      setIsPro(true);
      setShowSubscriptionModal(false);
      triggerCelebration();
  };

  const handleCraftCrystal = ({ costType, costAmount, resultType }: { costType: CrystalType; costAmount: number; resultType: CrystalType }) => {
    let itemsToRemove = costAmount;
    const newSanctuary = sanctuary.filter(c => {
        if (itemsToRemove > 0 && c.type === costType) {
            itemsToRemove--;
            return false;
        }
        return true;
    });

    const newCrystal: Crystal = { id: Date.now(), type: resultType, forgedAt: Date.now() };
    newSanctuary.unshift(newCrystal);
    setSanctuary(newSanctuary);
    triggerCelebration();
    
    if (resultType === 'moonstone') {
        updateChallengeProgress('collect_crystal', 1, 'moonstone');
    }
  };

  const updateChallengeProgress = (type: ChallengeType, amount: number = 1, detail?: string) => {
    let leveledUp = false;
    setChallenges(prev => prev.map(ch => {
        if (ch.completed) return ch;
        if (ch.type !== type) return ch;
        if (ch.type === 'collect_crystal' && ch.targetDetail && detail && ch.targetDetail !== detail) return ch;
        if (ch.type === 'specific_task' && ch.targetDetail && detail && ch.targetDetail !== detail) return ch;

        const newProgress = Math.min(ch.currentProgress + amount, ch.target);
        const isCompleted = newProgress >= ch.target;
        if (isCompleted && !ch.completed) leveledUp = true;
        return { ...ch, currentProgress: newProgress, completed: isCompleted };
    }));
    if (leveledUp) triggerCelebration();
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  useEffect(() => {
    if (!currentUser) return;
    let hasNewUnlock = false;
    const updatedAchievements = achievements.map(achievement => {
      let newProgress = achievement.progress;
      switch (achievement.id) {
        case 'first-step': newProgress = stats.totalTasksCompleted; break;
        case 'momentum': newProgress = stats.totalTasksCompleted; break;
        case 'task-master': newProgress = stats.totalTasksCompleted; break;
        case 'focus-novice': newProgress = stats.focusSessionsCompleted; break;
        case 'deep-worker': newProgress = stats.focusSessionsCompleted; break;
        case 'planner': newProgress = stats.aiPlansGenerated; break;
      }
      const isNowUnlocked = newProgress >= achievement.maxProgress;
      if (!achievement.isUnlocked && isNowUnlocked) hasNewUnlock = true;
      return { ...achievement, progress: newProgress, isUnlocked: achievement.isUnlocked || isNowUnlocked };
    });
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setAchievements(updatedAchievements);
      if (hasNewUnlock) triggerCelebration();
    }
  }, [stats, achievements, currentUser]);

  const handleToggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const willBeCompleted = !t.completed;
        if (willBeCompleted) {
             triggerCelebration();
             updateChallengeProgress('task_count', 1);
             updateChallengeProgress('specific_task', 1, id.toString());
        }
        setStats(curr => ({ ...curr, totalTasksCompleted: willBeCompleted ? curr.totalTasksCompleted + 1 : curr.totalTasksCompleted - 1 }));
        return { ...t, completed: willBeCompleted };
      }
      return t;
    }));
  };

  const handleToggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const willBeCompleted = !t.completed;
        if (willBeCompleted) {
            triggerCelebration();
            updateChallengeProgress('task_count', 1);
        }
        setStats(curr => ({ ...curr, totalTasksCompleted: willBeCompleted ? curr.totalTasksCompleted + 1 : curr.totalTasksCompleted - 1 }));
        return { ...t, completed: willBeCompleted };
      }
      return t;
    }));
  };

  const handleAIResults = (generatedTasks: GeneratedTask[]) => {
    const newTodos: TodoItem[] = generatedTasks.map((t, i) => ({
      id: Date.now() + i, title: t.title, emoji: t.emoji, priority: t.priority, completed: false
    }));
    setTodos(prev => [...prev, ...newTodos]);
    setCurrentView('todos');
    setStats(curr => ({ ...curr, aiPlansGenerated: curr.aiPlansGenerated + 1 }));
  };

  const handleFocusSessionComplete = (crystalType: CrystalType) => {
    triggerCelebration();
    const newCrystal: Crystal = { id: Date.now(), type: crystalType, forgedAt: Date.now() };
    setSanctuary(prev => [newCrystal, ...prev]);
    setStats(curr => ({ ...curr, focusSessionsCompleted: curr.focusSessionsCompleted + 1 }));
    updateChallengeProgress('session_count', 1);
    updateChallengeProgress('focus_minutes', 25); 
    updateChallengeProgress('collect_crystal', 1, crystalType);
  };

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTaskIndex = tasks.findIndex(task => {
    const [hour, minute] = task.time.split(':').map(Number);
    const taskMinutes = hour * 60 + minute;
    const nowMinutes = currentHour * 60 + currentMinute;
    return nowMinutes >= taskMinutes && nowMinutes < taskMinutes + task.duration;
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!currentUser) return <AuthScreen onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-blue to-pastel-orange font-sans text-gray-800 overflow-x-hidden selection:bg-primary/20">
      <div className="fixed top-[10%] left-[5%] text-8xl opacity-10 animate-float pointer-events-none select-none">🌸</div>
      <div className="fixed top-[60%] right-[8%] text-6xl opacity-10 animate-float pointer-events-none select-none" style={{ animationDelay: '1s' }}>✨</div>
      <div className="fixed bottom-[15%] left-[10%] text-7xl opacity-10 animate-float pointer-events-none select-none" style={{ animationDelay: '2s' }}>🌿</div>

      {showCelebration && <Celebration />}
      
      <AIModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} onTasksGenerated={handleAIResults} />

      <CraftingModal 
        isOpen={showCraftingModal}
        onClose={() => setShowCraftingModal(false)}
        sanctuary={sanctuary}
        onCraft={handleCraftCrystal}
      />
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        sanctuary={sanctuary}
        onUpgrade={handleUpgradeGeneric}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-6">
          <div className="flex-1 w-full md:w-auto">
            <h1 className="text-3xl md:text-5xl font-bold font-serif bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent pb-2">
              Good {currentHour < 12 ? 'Morning' : 'Evening'}, {currentUser}
            </h1>
            <p className="text-gray-500 text-sm md:text-lg">
              You've completed {tasks.filter(t => t.completed).length + todos.filter(t => t.completed).length} tasks today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button onClick={() => setShowAIModal(true)} className="group flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-primary/50 transition-all duration-300">
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              <span className="whitespace-nowrap">Smart Breakdown</span>
            </button>
            <button onClick={handleLogout} className="p-3.5 bg-white text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm flex items-center justify-center"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <nav className="flex overflow-x-auto gap-2 mb-6 md:mb-8 pb-4 border-b border-gray-200/50 no-scrollbar">
          {[{ id: 'timeline', icon: CalendarDays, label: 'Timeline' }, { id: 'focus', icon: Timer, label: 'Focus Zone' }, { id: 'todos', icon: ListTodo, label: 'My Lists' }, { id: 'achievements', icon: Trophy, label: 'Progress' }].map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setCurrentView(item.id as ViewState)} className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl font-medium text-base md:text-lg whitespace-nowrap transition-all duration-300 relative ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.label}
                {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary rounded-full" />}
              </button>
            );
          })}
        </nav>

        <main className="min-h-[500px]">
          {currentView === 'timeline' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-slide-up">
              {tasks.length > 0 ? tasks.map((task, index) => <TaskCard key={task.id} task={task} index={index} isActive={index === currentTaskIndex} onToggle={handleToggleTask} />) : (
                <div className="col-span-full text-center py-20 text-gray-400"><CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="text-xl font-serif">Your timeline is empty.</p></div>
              )}
            </div>
          )}

          <div className={currentView === 'focus' ? 'block' : 'hidden'}>
            <FocusTimer onSessionComplete={handleFocusSessionComplete} isPro={isPro} onUpgradeRequest={() => setShowSubscriptionModal(true)} />
          </div>

          {currentView === 'todos' && <TodoList items={todos} onToggle={handleToggleTodo} />}

          {currentView === 'achievements' && <AchievementsList achievements={achievements} sanctuary={sanctuary} challenges={challenges} streak={streak} onOpenForge={() => setShowCraftingModal(true)} />}
        </main>
      </div>
    </div>
  );
}
