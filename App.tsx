import React, { useState, useEffect } from 'react';
import { CalendarDays, Timer, ListTodo, Sparkles, Trophy, LogOut } from 'lucide-react';

import TaskCard from './components/TaskCard';
import FocusTimer from './components/FocusTimer';
import TodoList from './components/TodoList';
import AchievementsList from './components/AchievementsList';
import AIModal from './components/AIModal';
import Celebration from './components/Celebration';
import AuthScreen from './components/AuthScreen';

import { Task, TodoItem, ViewState, GeneratedTask, Achievement, UserStats, UserData, Crystal, CrystalType } from './types';
import { authService } from './services/storage';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // App Data State
  const [currentView, setCurrentView] = useState<ViewState>('timeline');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sanctuary, setSanctuary] = useState<Crystal[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalTasksCompleted: 0,
    focusSessionsCompleted: 0,
    aiPlansGenerated: 0
  });

  const [showAIModal, setShowAIModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // --- Initialization & Auth ---

  useEffect(() => {
    // Check for existing session on mount
    const username = authService.getCurrentUser();
    if (username) {
      const data = authService.loadUserData();
      if (data) {
        loadDataIntoState(data);
        setCurrentUser(username);
      }
    }
    setIsLoading(false);
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (currentUser && !isLoading) {
      authService.saveUserData({
        tasks,
        todos,
        achievements,
        stats,
        sanctuary
      });
    }
  }, [tasks, todos, achievements, stats, sanctuary, currentUser, isLoading]);

  const loadDataIntoState = (data: UserData) => {
    setTasks(data.tasks);
    setTodos(data.todos);
    setAchievements(data.achievements);
    setStats(data.stats);
    setSanctuary(data.sanctuary || []);
  };

  const handleLoginSuccess = (username: string, data: UserData) => {
    setCurrentUser(username);
    loadDataIntoState(data);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setTasks([]);
    setTodos([]);
    setAchievements([]);
    setSanctuary([]);
  };

  // --- Business Logic ---

  // Time Logic
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const currentTaskIndex = tasks.findIndex(task => {
    const [hour, minute] = task.time.split(':').map(Number);
    const taskMinutes = hour * 60 + minute;
    const nowMinutes = currentHour * 60 + currentMinute;
    return nowMinutes >= taskMinutes && nowMinutes < taskMinutes + task.duration;
  });

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  };

  // Achievement System Logic
  useEffect(() => {
    if (!currentUser) return;

    let hasNewUnlock = false;

    const updatedAchievements = achievements.map(achievement => {
      let newProgress = achievement.progress;
      
      switch (achievement.id) {
        case 'first-step':
          newProgress = stats.totalTasksCompleted;
          break;
        case 'momentum':
          newProgress = stats.totalTasksCompleted;
          break;
        case 'task-master':
          newProgress = stats.totalTasksCompleted;
          break;
        case 'focus-novice':
          newProgress = stats.focusSessionsCompleted;
          break;
        case 'deep-worker':
          newProgress = stats.focusSessionsCompleted;
          break;
        case 'planner':
          newProgress = stats.aiPlansGenerated;
          break;
      }

      const isNowUnlocked = newProgress >= achievement.maxProgress;
      
      if (!achievement.isUnlocked && isNowUnlocked) {
        hasNewUnlock = true;
      }

      return {
        ...achievement,
        progress: newProgress,
        isUnlocked: achievement.isUnlocked || isNowUnlocked
      };
    });

    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
      setAchievements(updatedAchievements);
      if (hasNewUnlock) {
        triggerCelebration();
      }
    }
  }, [stats, achievements, currentUser]);

  const handleToggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const willBeCompleted = !t.completed;
        if (willBeCompleted) triggerCelebration();
        
        setStats(curr => ({
          ...curr,
          totalTasksCompleted: willBeCompleted ? curr.totalTasksCompleted + 1 : curr.totalTasksCompleted - 1
        }));
        
        return { ...t, completed: willBeCompleted };
      }
      return t;
    }));
  };

  const handleToggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const willBeCompleted = !t.completed;
        if (willBeCompleted) triggerCelebration();

        setStats(curr => ({
          ...curr,
          totalTasksCompleted: willBeCompleted ? curr.totalTasksCompleted + 1 : curr.totalTasksCompleted - 1
        }));

        return { ...t, completed: willBeCompleted };
      }
      return t;
    }));
  };

  const handleAIResults = (generatedTasks: GeneratedTask[]) => {
    const newTodos: TodoItem[] = generatedTasks.map((t, i) => ({
      id: Date.now() + i,
      title: t.title,
      emoji: t.emoji,
      priority: t.priority,
      completed: false
    }));
    setTodos(prev => [...prev, ...newTodos]);
    setCurrentView('todos');
    
    setStats(curr => ({
      ...curr,
      aiPlansGenerated: curr.aiPlansGenerated + 1
    }));
  };

  const handleFocusSessionComplete = (crystalType: CrystalType) => {
    triggerCelebration();
    
    // Add crystal to sanctuary
    const newCrystal: Crystal = {
      id: Date.now(),
      type: crystalType,
      forgedAt: Date.now()
    };
    setSanctuary(prev => [newCrystal, ...prev]);

    setStats(curr => ({
      ...curr,
      focusSessionsCompleted: curr.focusSessionsCompleted + 1
    }));
  };

  const getTimeGreeting = () => {
    if (currentHour < 12) return 'Morning';
    if (currentHour < 17) return 'Afternoon';
    return 'Evening';
  };

  // --- Rendering ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-blue to-pastel-orange font-sans text-gray-800 overflow-x-hidden selection:bg-primary/20">
      
      {/* Background Decor elements */}
      <div className="fixed top-[10%] left-[5%] text-8xl opacity-10 animate-float pointer-events-none select-none">🌸</div>
      <div className="fixed top-[60%] right-[8%] text-6xl opacity-10 animate-float pointer-events-none select-none" style={{ animationDelay: '1s' }}>✨</div>
      <div className="fixed bottom-[15%] left-[10%] text-7xl opacity-10 animate-float pointer-events-none select-none" style={{ animationDelay: '2s' }}>🌿</div>

      {showCelebration && <Celebration />}

      <AIModal 
        isOpen={showAIModal} 
        onClose={() => setShowAIModal(false)}
        onTasksGenerated={handleAIResults}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold font-serif bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent pb-2">
              Good {getTimeGreeting()}, {currentUser}
            </h1>
            <p className="text-gray-500 text-lg">
              You've completed {tasks.filter(t => t.completed).length + todos.filter(t => t.completed).length} tasks today.
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowAIModal(true)}
              className="group flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-primary/50 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              <span className="whitespace-nowrap">Smart Breakdown</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="p-3.5 bg-white text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex overflow-x-auto gap-2 mb-8 pb-4 border-b border-gray-200/50 no-scrollbar">
          {[
            { id: 'timeline', icon: CalendarDays, label: 'Timeline' },
            { id: 'focus', icon: Timer, label: 'Focus Zone' },
            { id: 'todos', icon: ListTodo, label: 'My Lists' },
            { id: 'achievements', icon: Trophy, label: 'Achievements' },
          ].map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewState)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-lg whitespace-nowrap transition-all duration-300 relative
                  ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main className="min-h-[500px]">
          {currentView === 'timeline' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
              {tasks.length > 0 ? tasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index}
                  isActive={index === currentTaskIndex} 
                  onToggle={handleToggleTask} 
                />
              )) : (
                <div className="col-span-full text-center py-20 text-gray-400">
                  <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-serif">Your timeline is empty.</p>
                  <p className="text-sm">Use Smart Breakdown to generate a plan!</p>
                </div>
              )}
            </div>
          )}

          {currentView === 'focus' && (
            <FocusTimer onSessionComplete={handleFocusSessionComplete} />
          )}

          {currentView === 'todos' && (
            <TodoList items={todos} onToggle={handleToggleTodo} />
          )}

          {currentView === 'achievements' && (
            <AchievementsList achievements={achievements} sanctuary={sanctuary} />
          )}
        </main>

      </div>
    </div>
  );
}
