import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Check, Shield, Repeat, Volume2, VolumeX, Lock, ArrowUpCircle, Settings2, Sparkles, Hexagon, Triangle, Circle, Target, ChevronDown, Plus } from 'lucide-react';
import { TimerMode, CrystalType, Task } from '../types';

interface FocusTimerProps {
  onSessionComplete: (result: { crystal: CrystalType | null; dust: number; duration: number }) => void;
  isPro: boolean;
  onUpgradeRequest: () => void;
  blockedApps: string[];
  onUpdateBlockedApps: (apps: string[]) => void;
  tasks: Task[]; // Dependency: Need tasks to start countdown
  sanctuary: CrystalType[]; // Dependency: Check for Sapphire/Soundscapes
}

// Rewarded Logic
const REWARD_MATRIX = [
    { min: 0, max: 24, type: null, dustPer5: 1, name: "Focus Dust", color: "#9ca3af" },
    { min: 25, max: 59, type: 'amethyst', dustPer5: 2, name: "Amethyst", color: "#a855f7" },
    { min: 60, max: 119, type: 'citrine', dustPer5: 3, name: "Citrine", color: "#eab308" },
    { min: 120, max: 179, type: 'emerald', dustPer5: 4, name: "Emerald", color: "#22c55e" },
    { min: 180, max: 999, type: 'moonstone', dustPer5: 5, name: "Moonstone", color: "#7dd3fc" },
];

const CRYSTAL_ICONS: Record<string, React.FC<any>> = {
    amethyst: Hexagon,
    citrine: Triangle,
    emerald: Hexagon,
    moonstone: Circle,
    null: Sparkles
};

const CRYSTAL_HIERARCHY: CrystalType[] = ['amethyst', 'citrine', 'sapphire', 'emerald', 'ruby', 'obsidian', 'moonstone'];

const FocusTimer: React.FC<FocusTimerProps> = ({ 
    onSessionComplete, 
    isPro, 
    onUpgradeRequest, 
    blockedApps, 
    onUpdateBlockedApps,
    tasks,
    sanctuary
}) => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timerType, setTimerType] = useState<'countdown' | 'stopwatch'>('stopwatch');
  
  // State
  const [focusDuration, setFocusDuration] = useState(25);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isAbandoned, setIsAbandoned] = useState(false);

  // Derived State for Rewards
  const currentMinutes = timerType === 'stopwatch' ? Math.floor(elapsedSeconds / 60) : focusDuration;
  
  const getCurrentRewardTier = (mins: number) => {
      return REWARD_MATRIX.find(r => mins >= r.min && mins <= r.max) || REWARD_MATRIX[0];
  };

  const currentReward = getCurrentRewardTier(currentMinutes);
  const nextReward = REWARD_MATRIX.find(r => r.min > currentMinutes);

  // Feature Unlocking
  const hasSapphire = sanctuary.some(type => {
      const idx = CRYSTAL_HIERARCHY.indexOf(type);
      const sapphireIdx = CRYSTAL_HIERARCHY.indexOf('sapphire');
      return idx >= sapphireIdx;
  });
  const canUseSoundscape = isPro || hasSapphire;

  // Plus Features State
  const [strictMode, setStrictMode] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [soundscape, setSoundscape] = useState<'none' | 'flow'>('none');
  const [strictViolation, setStrictViolation] = useState(false);
  const [showGuardSettings, setShowGuardSettings] = useState(false);
  const [newBlockedApp, setNewBlockedApp] = useState('');

  // Refs
  const dialRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // --- Soundscape Logic ---
  useEffect(() => {
    if (soundscape === 'flow' && isActive && mode === 'focus') {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;
        const bufferSize = ctx.sampleRate * 2; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; 
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.05; 
        gainNodeRef.current = gainNode;
        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();
        return () => {
            noise.stop();
            noise.disconnect();
            gainNode.disconnect();
        };
    }
  }, [soundscape, isActive, mode]);

  // --- Strict Mode ---
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (strictMode && isActive && document.hidden) {
              setIsActive(false);
              setStrictViolation(true);
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [strictMode, isActive]);

  // --- Timer Tick ---
  useEffect(() => {
    let interval: number;
    if (isActive && !isAbandoned) {
      interval = window.setInterval(() => {
        if (mode === 'focus') {
             if (timerType === 'stopwatch') {
                 setElapsedSeconds(prev => prev + 1);
             } else {
                 setRemainingSeconds(prev => {
                     if (prev <= 0) {
                         handleFinish();
                         return 0;
                     }
                     return prev - 1;
                 });
             }
        } else {
             // Break mode
             setRemainingSeconds(prev => Math.max(0, prev - 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, mode, timerType, isAbandoned]);

  // --- Dial Interaction ---
  const calculateAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    let angleRad = Math.atan2(y, x);
    let angleDeg = angleRad * (180 / Math.PI);
    angleDeg = angleDeg + 90;
    if (angleDeg < 0) angleDeg += 360;
    return angleDeg;
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (isActive || (mode === 'focus' && timerType === 'stopwatch')) return; 
    setIsDragging(true);
    lastAngleRef.current = calculateAngle(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const currentAngle = calculateAngle(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;
    
    if (Math.abs(delta) > 2) { 
       const minutesChange = Math.round(delta / 6); 
       if (minutesChange !== 0) {
         setFocusDuration(prev => Math.max(5, Math.min(240, prev + minutesChange)));
         lastAngleRef.current = currentAngle;
       }
    }
  };

  const handleEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY));
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', handleEnd);
    };
  }, [isDragging]);

  // --- Logic ---

  const handleFinish = () => {
    setIsActive(false);
    
    let earnedCrystal: CrystalType | null = null;
    let earnedDust = 0;
    let duration = 0;

    if (timerType === 'stopwatch') {
        // Stopwatch Mode: Only Focus Dust
        duration = Math.floor(elapsedSeconds / 60);
        earnedDust = Math.floor(duration / 5); // 1 Dust per 5 mins
        earnedCrystal = null; // No crystals in stopwatch mode
    } else {
        // Countdown Mode: Crystals + Dust
        duration = focusDuration;
        const tier = getCurrentRewardTier(duration);
        earnedCrystal = tier.type as CrystalType | null;
        // Bonus dust logic can be added here if needed, sticking to prompt "Bonus Focus Dust"
        earnedDust = Math.floor(duration / 5) * tier.dustPer5;
        if (earnedDust === 0) earnedDust = Math.floor(duration / 5); // Fallback base dust
    }

    onSessionComplete({
        crystal: earnedCrystal,
        dust: earnedDust,
        duration: duration
    });

    // Reset or Switch Mode
    setElapsedSeconds(0);
    if (mode === 'focus') {
        setMode('break');
        setRemainingSeconds(5 * 60);
        if (autoStart) setTimeout(() => setIsActive(true), 1000);
    }
  };

  const handleGiveUp = () => {
      setIsActive(false);
      setIsAbandoned(true);
      // Timeout to show the cracked crystal before reset
      setTimeout(() => {
          setIsAbandoned(false);
          setElapsedSeconds(0);
          setRemainingSeconds(focusDuration * 60);
      }, 3000);
  };

  const toggleTimer = () => {
      if (timerType === 'countdown' && mode === 'focus' && !selectedTaskId && !isActive) {
          alert("Please select a task from your timeline to start a countdown session.");
          return;
      }

      setStrictViolation(false);
      if (!isActive && audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
      }
      
      if (isActive && mode === 'focus') {
          setIsActive(false);
      } else {
          setIsActive(true);
          if (!isActive && timerType === 'countdown' && remainingSeconds !== focusDuration * 60 && elapsedSeconds === 0) {
             setRemainingSeconds(focusDuration * 60);
          }
      }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- UI Helpers ---
  const RewardIcon = CRYSTAL_ICONS[currentReward.type || 'null'];
  // If stopwatch, force dust icon
  const DisplayIcon = timerType === 'stopwatch' ? Sparkles : RewardIcon;
  const displayColor = timerType === 'stopwatch' ? '#9ca3af' : currentReward.color;

  const progressPercent = timerType === 'countdown' 
      ? ((focusDuration * 60 - remainingSeconds) / (focusDuration * 60)) * 100
      : (elapsedSeconds % 60) / 60 * 100;

  const displaySeconds = timerType === 'countdown' ? remainingSeconds : elapsedSeconds;

  const selectedTaskTitle = tasks.find(t => t.id === selectedTaskId)?.title;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center w-full relative overflow-hidden border border-white transition-all duration-500 select-none">
        
        {/* Abandoned Overlay */}
        {isAbandoned && (
             <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 animate-slide-up">
                 <div className="text-6xl mb-4 grayscale opacity-50 relative">
                     <RewardIcon size={80} />
                     <div className="absolute inset-0 flex items-center justify-center text-red-500">
                        <X size={80} strokeWidth={3} />
                     </div>
                 </div>
                 <h3 className="text-2xl font-bold mb-2 text-red-400">Session Shattered</h3>
                 <p className="text-gray-300">Stopping now shattered your potential reward.</p>
             </div>
        )}

        {/* Guard Settings Modal */}
        {showGuardSettings && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center text-left p-6 animate-slide-up">
                <div className="w-full flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
                        <Shield size={20} className="text-red-500" /> Time Guard
                    </h3>
                    <button onClick={() => setShowGuardSettings(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 w-full">
                    List the apps or websites you want to block during focus sessions. 
                    <span className="text-xs block mt-1 opacity-70">(Visual reminder only in web version)</span>
                </p>

                <div className="flex flex-wrap gap-2 w-full mb-4 max-h-[150px] overflow-y-auto">
                    {blockedApps.map(app => (
                        <div key={app} className="flex items-center gap-1 pl-3 pr-2 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100">
                            {app}
                            <button onClick={() => onUpdateBlockedApps(blockedApps.filter(a => a !== app))} className="p-0.5 hover:bg-red-100 rounded-full">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); if(newBlockedApp) { onUpdateBlockedApps([...blockedApps, newBlockedApp]); setNewBlockedApp(''); } }} className="w-full flex gap-2 mt-auto">
                    <input 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-red-400"
                        placeholder="Add distraction..."
                        value={newBlockedApp}
                        onChange={e => setNewBlockedApp(e.target.value)}
                    />
                    <button type="submit" disabled={!newBlockedApp} className="bg-red-500 text-white p-3 rounded-xl disabled:opacity-50">
                        <Plus size={20} />
                    </button>
                </form>
            </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-0 right-0 px-4 md:px-8 flex justify-between items-start z-20 pointer-events-none">
           {/* Timer Switch */}
           {mode === 'focus' && !isActive ? (
             <div className="flex bg-gray-100/80 p-1 rounded-full backdrop-blur-sm pointer-events-auto shadow-inner">
                <button onClick={() => setTimerType('countdown')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timerType === 'countdown' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
                    Target
                </button>
                <button onClick={() => setTimerType('stopwatch')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timerType === 'stopwatch' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
                    Open
                </button>
             </div>
           ) : <div />}

           {/* Plus Toggles */}
           <div className="flex flex-col gap-2 pointer-events-auto items-end">
               <div className="relative flex items-center gap-2">
                   {strictMode && (
                       <button onClick={() => setShowGuardSettings(true)} className="p-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200">
                           <Settings2 size={14} />
                       </button>
                   )}
                   <button onClick={() => isPro ? setStrictMode(!strictMode) : onUpgradeRequest()} className={`p-2.5 rounded-full transition-all shadow-sm relative ${strictMode ? 'bg-red-100 text-red-500' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
                      {!isPro && <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full z-10"><Lock size={8} className="text-yellow-900" /></div>}
                      <Shield size={18} />
                   </button>
               </div>
               <button onClick={() => isPro ? setAutoStart(!autoStart) : onUpgradeRequest()} className={`p-2.5 rounded-full transition-all shadow-sm relative ${autoStart ? 'bg-green-100 text-green-500' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
                  {!isPro && <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full z-10"><Lock size={8} className="text-yellow-900" /></div>}
                  <Repeat size={18} />
               </button>
               <button onClick={() => canUseSoundscape ? setSoundscape(soundscape === 'none' ? 'flow' : 'none') : onUpgradeRequest()} className={`p-2.5 rounded-full transition-all shadow-sm relative ${soundscape !== 'none' ? 'bg-blue-100 text-blue-500' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
                  {!canUseSoundscape && <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full z-10"><Lock size={8} className="text-yellow-900" /></div>}
                  {soundscape !== 'none' ? <Volume2 size={18} /> : <VolumeX size={18} />}
               </button>
           </div>
        </div>

        {/* Ambient Glow */}
        {isActive && mode === 'focus' && (
          <div className="absolute inset-0 pointer-events-none transition-colors duration-1000" style={{ background: `radial-gradient(circle at center, ${displayColor}20 0%, transparent 70%)` }} />
        )}

        {/* Header */}
        <div className="mt-8 mb-4 md:mb-6 relative z-10">
           <h2 className={`text-lg md:text-xl font-bold tracking-widest uppercase font-serif ${mode === 'focus' ? 'text-gray-700' : 'text-pink-500'}`}>
             {mode === 'focus' ? (timerType === 'countdown' ? 'Crystal Mining' : 'Dust Farming') : 'Cooling Down'}
           </h2>
        </div>

        {/* Interactive Dial */}
        <div 
          ref={dialRef}
          className={`relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] mx-auto mb-6 md:mb-10 flex items-center justify-center rounded-full touch-none ${!isActive && mode === 'focus' && timerType === 'countdown' ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onMouseDown={(e) => !isActive && mode === 'focus' && timerType === 'countdown' && handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => !isActive && mode === 'focus' && timerType === 'countdown' && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        >
          {/* Rings */}
          <svg className="absolute inset-0 transform -rotate-90 w-full h-full drop-shadow-lg pointer-events-none">
            <circle cx="50%" cy="50%" r="46%" stroke="#f3f4f6" strokeWidth="4" fill="none" />
            <circle
              cx="50%" cy="50%" r="46%"
              stroke={mode === 'focus' ? displayColor : '#f472b6'}
              strokeWidth="6" fill="none"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 - progressPercent}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>

          {/* Handle (Countdown Only) */}
          {!isActive && timerType === 'countdown' && mode === 'focus' && (
             <div className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${(focusDuration % 60) / 60 * 360}deg)` }}>
                <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-md border-2 border-gray-100 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-gray-400" />
                </div>
             </div>
          )}
          
          {/* Center Info */}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
             
             {/* Reward Evolution Display */}
             <div 
                className="relative mb-4 md:mb-6 transition-all duration-500 ease-out"
                style={{ 
                    filter: `drop-shadow(0 0 ${isActive ? 20 : 0}px ${displayColor})`,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)' 
                }}
             >
                {mode === 'focus' ? (
                  <div className="relative flex flex-col items-center">
                     <DisplayIcon 
                      size={isActive ? 90 : 80}
                      strokeWidth={1.5}
                      className="transition-all duration-700"
                      style={{ 
                        fill: isActive ? `${displayColor}40` : 'transparent',
                        stroke: displayColor,
                      }}
                     />
                     
                     {/* Dust Counter if Stopwatch */}
                     {timerType === 'stopwatch' && (
                         <div className="absolute -bottom-8 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500 flex items-center gap-1 shadow-sm border border-gray-200 whitespace-nowrap">
                             <Sparkles size={10} />
                             {Math.floor(elapsedSeconds / 300)} Dust
                         </div>
                     )}
                  </div>
                ) : (
                  <div className="text-7xl md:text-8xl animate-bounce">☕</div>
                )}
             </div>
             
             {/* Time Display */}
             <div className="flex flex-col items-center mt-4">
                <div className="text-5xl sm:text-6xl font-serif font-bold text-gray-800 tabular-nums tracking-tight min-w-[140px] sm:min-w-[180px] text-center">
                  {formatTime(displaySeconds)}
                </div>
                
                {/* Reward Info */}
                {isActive && mode === 'focus' && timerType === 'countdown' && nextReward && (
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-2 animate-pulse">
                        <ArrowUpCircle size={12} />
                        <span>{nextReward.name} in {nextReward.min - currentMinutes}m</span>
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Task Selection (Countdown Only) */}
        {!isActive && mode === 'focus' && timerType === 'countdown' && (
             <div className="mb-8 relative z-20 max-w-sm mx-auto">
                 <div className="relative group">
                    <select 
                        value={selectedTaskId || ''}
                        onChange={(e) => setSelectedTaskId(Number(e.target.value))}
                        className="w-full appearance-none bg-indigo-50 border border-indigo-100 text-indigo-900 text-sm font-semibold rounded-xl py-3 pl-10 pr-10 outline-none focus:border-indigo-300 transition-all cursor-pointer hover:bg-indigo-100"
                    >
                        <option value="" disabled>Select a Task to Mine Crystal</option>
                        {tasks.filter(t => !t.completed).map(task => (
                            <option key={task.id} value={task.id}>{task.emoji} {task.title}</option>
                        ))}
                    </select>
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                 </div>
                 {!selectedTaskId && <p className="text-xs text-red-400 mt-2 font-medium">⚠ Required for Crystals</p>}
             </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-6 justify-center items-center relative z-10">
            {isActive ? (
               <button 
                  onClick={handleGiveUp} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border-2 border-transparent hover:border-red-100"
                  title="Abandon Session"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
               </button>
            ) : (
               <button onClick={toggleTimer} className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${mode === 'focus' ? 'bg-gradient-to-br from-gray-800 to-black shadow-gray-500/30' : 'bg-gradient-to-br from-pink-400 to-rose-400 shadow-pink-400/30'}`}>
                 <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
               </button>
            )}
            
            {/* If Paused but not Finished - Allow Resume or Finish if Stopwatch */}
            {!isActive && elapsedSeconds > 0 && mode === 'focus' && timerType === 'stopwatch' && (
                <button onClick={handleFinish} className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-green-500 text-white shadow-xl hover:scale-105 transition-all">
                    <Check className="w-8 h-8" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;