import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Gem, Sparkles, Zap, Hexagon, Diamond, Triangle, Timer, Watch, Check, GripHorizontal, Shield, ShieldAlert, Repeat, Volume2, VolumeX, Circle, Lock, ArrowUpCircle } from 'lucide-react';
import { TimerMode, CrystalType } from '../types';

interface FocusTimerProps {
  onSessionComplete?: (crystalType: CrystalType) => void;
  isPro: boolean;
  onUpgradeRequest: () => void;
}

// Crystal Config with Min Minutes requirement
const CRYSTAL_TIERS: { id: CrystalType; minMinutes: number; name: string; icon: React.FC<any>; color: string; accent: string; }[] = [
  { id: 'amethyst', minMinutes: 0, name: 'Amethyst', icon: Hexagon, color: '#d8b4fe', accent: '#a855f7' },
  { id: 'citrine', minMinutes: 30, name: 'Citrine', icon: Triangle, color: '#fde047', accent: '#eab308' },
  { id: 'sapphire', minMinutes: 60, name: 'Sapphire', icon: Diamond, color: '#93c5fd', accent: '#3b82f6' },
  { id: 'emerald', minMinutes: 90, name: 'Emerald', icon: Hexagon, color: '#86efac', accent: '#22c55e' },
  { id: 'ruby', minMinutes: 120, name: 'Ruby', icon: Gem, color: '#fda4af', accent: '#f43f5e' },
  { id: 'moonstone', minMinutes: 180, name: 'Moonstone', icon: Circle, color: '#e0f2fe', accent: '#7dd3fc' }, // Hard: 3 hours
];

// Helper to determine crystal based on duration
const getCrystalForDuration = (minutes: number) => {
  // Iterate backwards to find the highest tier met
  for (let i = CRYSTAL_TIERS.length - 1; i >= 0; i--) {
    if (minutes >= CRYSTAL_TIERS[i].minMinutes) {
      return CRYSTAL_TIERS[i];
    }
  }
  return CRYSTAL_TIERS[0];
};

const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete, isPro, onUpgradeRequest }) => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timerType, setTimerType] = useState<'countdown' | 'stopwatch'>('countdown');
  
  // Settings
  const [focusDuration, setFocusDuration] = useState(25); // minutes
  const [seconds, setSeconds] = useState(25 * 60);
  const [isDragging, setIsDragging] = useState(false);

  // Derived State for Rewards
  const currentReward = getCrystalForDuration(focusDuration);
  // Find next tier for motivation
  const nextTierIndex = CRYSTAL_TIERS.findIndex(c => c.id === currentReward.id) + 1;
  const nextTier = nextTierIndex < CRYSTAL_TIERS.length ? CRYSTAL_TIERS[nextTierIndex] : null;

  // Plus Features State
  const [strictMode, setStrictMode] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [soundscape, setSoundscape] = useState<'none' | 'flow'>('none');
  const [strictViolation, setStrictViolation] = useState(false);

  // Refs
  const dialRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // --- Soundscape (Mindful Space) Logic ---
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

  // --- Visual Logic ---
  const totalTime = mode === 'focus' ? (timerType === 'countdown' ? focusDuration * 60 : 60) : 5 * 60;
  let progress = 0;
  let rotation = 0;

  if (timerType === 'stopwatch') {
    progress = ((seconds % 60) / 60) * 100;
    rotation = seconds * 6;
  } else {
    if (isActive) {
      progress = ((totalTime - seconds) / totalTime) * 100;
      rotation = (progress / 100) * 360;
    } else {
      progress = ((focusDuration % 60) / 60) * 100;
      if (focusDuration > 0 && focusDuration % 60 === 0) progress = 100; 
      rotation = progress * 3.6; 
    }
  }
  
  const pulseSpeed = timerType === 'countdown' ? (3 - (progress / 100) * 2) : 2; 
  const glowOpacity = timerType === 'countdown' ? (0.2 + (progress / 100) * 0.8) : 0.6;

  // --- Timer Tick ---
  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds((prev) => {
          if (timerType === 'stopwatch' && mode === 'focus') {
            return prev + 1;
          } else {
            if (prev <= 0) return 0;
            return prev - 1;
          }
        });
      }, 1000);
    }
    if (isActive && seconds === 0 && (timerType === 'countdown' || mode === 'break')) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode, timerType]);

  // Sync timer
  useEffect(() => {
    if (!isActive) {
      if (mode === 'focus') {
        setSeconds(timerType === 'countdown' ? focusDuration * 60 : 0);
      } else {
        setSeconds(5 * 60);
      }
    }
  }, [focusDuration, mode, timerType]); 

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
         setFocusDuration(prev => {
           const next = prev + minutesChange;
           return Math.max(1, Math.min(240, next)); // Cap at 4 hours
         });
         lastAngleRef.current = currentAngle;
       }
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    // Complete Session
    if (mode === 'focus' && onSessionComplete) {
      if (timerType === 'countdown' || seconds > 60) {
        onSessionComplete(currentReward.id); // Award the calculated crystal
      }
    }

    let nextMode: TimerMode = mode === 'focus' ? 'break' : 'focus';
    
    if (nextMode === 'focus') {
        setSeconds(timerType === 'countdown' ? focusDuration * 60 : 0);
    } else {
        setSeconds(5 * 60);
    }
    setMode(nextMode);

    if (autoStart) {
        setTimeout(() => setIsActive(true), 500);
    }
  };

  const toggleTimer = () => {
      setStrictViolation(false);
      if (!isActive && audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
      }
      setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setStrictViolation(false);
    if (mode === 'focus') {
      setSeconds(timerType === 'countdown' ? focusDuration * 60 : 0);
    } else {
      setSeconds(5 * 60);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handlers for Plus
  const handleToggleStrict = () => { if (!isPro) onUpgradeRequest(); else setStrictMode(!strictMode); };
  const handleToggleAutoStart = () => { if (!isPro) onUpgradeRequest(); else setAutoStart(!autoStart); };
  const handleToggleSoundscape = () => { if (!isPro) onUpgradeRequest(); else setSoundscape(soundscape === 'none' ? 'flow' : 'none'); };

  const CrystalIcon = currentReward.icon;
  const isEditable = !isActive && mode === 'focus' && timerType === 'countdown';

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center w-full relative overflow-hidden border border-white transition-all duration-500 select-none">
        
        {/* Violation Overlay */}
        {strictViolation && !isActive && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 animate-slide-up">
                <ShieldAlert size={64} className="text-red-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Focus Broken!</h3>
                <p className="mb-6 text-gray-200">Time Guard paused your session.</p>
                <button onClick={toggleTimer} className="px-6 py-3 bg-red-500 rounded-xl font-bold hover:bg-red-400">Resume Session</button>
            </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-4 left-0 right-0 px-4 md:px-8 flex justify-between items-start z-20 pointer-events-none">
           {/* Timer Switch */}
           {mode === 'focus' && !isActive ? (
             <div className="flex bg-gray-100/80 p-1 rounded-full backdrop-blur-sm pointer-events-auto">
                <button onClick={() => setTimerType('countdown')} className={`p-2 rounded-full transition-all ${timerType === 'countdown' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
                    <Timer size={16} />
                </button>
                <button onClick={() => setTimerType('stopwatch')} className={`p-2 rounded-full transition-all ${timerType === 'stopwatch' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>
                    <Watch size={16} />
                </button>
             </div>
           ) : <div />}

           {/* Plus Toggles */}
           <div className="flex flex-col gap-2 pointer-events-auto">
               <button onClick={handleToggleStrict} className={`p-2.5 rounded-full transition-all shadow-sm relative ${strictMode ? 'bg-red-100 text-red-500' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
                  {!isPro && <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full z-10"><Lock size={8} className="text-yellow-900" /></div>}
                  <Shield size={18} />
               </button>
               <button onClick={handleToggleAutoStart} className={`p-2.5 rounded-full transition-all shadow-sm relative ${autoStart ? 'bg-green-100 text-green-500' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
                  {!isPro && <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full z-10"><Lock size={8} className="text-yellow-900" /></div>}
                  <Repeat size={18} />
               </button>
               <button onClick={handleToggleSoundscape} className={`p-2.5 rounded-full transition-all shadow-sm relative ${soundscape !== 'none' ? 'bg-blue-100 text-blue-500' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
                  {!isPro && <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full z-10"><Lock size={8} className="text-yellow-900" /></div>}
                  {soundscape !== 'none' ? <Volume2 size={18} /> : <VolumeX size={18} />}
               </button>
           </div>
        </div>

        {/* Ambient Glow */}
        {isActive && mode === 'focus' && (
          <div className="absolute inset-0 pointer-events-none transition-colors duration-1000" style={{ background: `radial-gradient(circle at center, ${currentReward.color}40 0%, transparent 70%)` }} />
        )}

        {/* Header */}
        <div className="mt-8 mb-4 md:mb-6 relative z-10">
           <h2 className={`text-lg md:text-xl font-bold tracking-widest uppercase font-serif ${mode === 'focus' ? 'text-gray-700' : 'text-pink-500'}`}>
             {mode === 'focus' ? 'Focus Session' : 'Recharge Energy'}
           </h2>
        </div>

        {/* Interactive Dial */}
        <div 
          ref={dialRef}
          className={`relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] mx-auto mb-6 md:mb-10 flex items-center justify-center rounded-full touch-none ${isEditable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onMouseDown={(e) => isEditable && handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => isEditable && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        >
          {/* Rings */}
          <svg className="absolute inset-0 transform -rotate-90 w-full h-full drop-shadow-lg pointer-events-none">
            {/* Background Ring */}
            <circle cx="50%" cy="50%" r="46%" stroke="#f3f4f6" strokeWidth="4" fill="none" />
            
            {/* Progress Ring */}
            <circle
              cx="50%" cy="50%" r="46%"
              stroke={mode === 'focus' ? currentReward.accent : '#f472b6'}
              strokeWidth="6" fill="none"
              // Circumference is approx 2 * PI * 46% (relative to 300px usually, but here % helps)
              // Actually we need pathLength for simpler calculation in CSS or JS.
              // Let's rely on standard dasharray logic relative to 100% size? No.
              // Let's stick to simple fixed dasharray assuming relative container size works with percentages in r
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={
                  isActive || timerType === 'stopwatch'
                   ? 100 - progress
                   : 100 - progress
              }
              strokeLinecap="round"
              // IMPORTANT: Removed transition-stroke-dashoffset to prevent "rewinding" visual glitch when wrapping.
              // Added transition-colors to smooth out the Crystal tier color changes.
              className="transition-[stroke] duration-500 ease-out"
            />
          </svg>

          {/* Handle */}
          {isEditable && (
             <div className="absolute w-full h-full pointer-events-none" style={{ transform: `rotate(${rotation}deg)` }}>
                <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-md border-2 border-gray-100 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-gray-400" />
                </div>
             </div>
          )}
          
          {/* Center Info */}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
             
             {/* Crystal Reward Display */}
             <div 
                className="relative mb-4 md:mb-6 transition-all duration-500 ease-out"
                style={{ filter: `drop-shadow(0 0 ${mode === 'focus' ? (isActive ? 15 : 0) : 0}px ${currentReward.accent})` }}
             >
                {mode === 'focus' ? (
                  <div className="relative" style={{ animation: isActive ? `pulse-soft ${pulseSpeed}s infinite` : 'none' }}>
                     <CrystalIcon 
                      // Dynamic size via Tailwind or style isn't easy with Lucide size prop, sticking to responsive conditional
                      size={80} // Base size
                      strokeWidth={1}
                      className="transition-all duration-500 sm:w-[100px] sm:h-[100px]" // Responsive sizing via CSS class override
                      style={{ 
                        fill: isActive ? `${currentReward.color}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}` : 'transparent',
                        stroke: currentReward.accent,
                        transform: isActive 
                            ? `rotate(${timerType === 'countdown' ? (progress/100)*360 : seconds*6}deg)`
                            : `rotate(${isDragging ? rotation : 0}deg)`
                      }}
                     />
                     {isActive && <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" size={24} />}
                  </div>
                ) : (
                  <div className="text-7xl md:text-8xl animate-bounce">☕</div>
                )}
             </div>
             
             {/* Time Display */}
             <div className="flex flex-col items-center">
                <div className="text-5xl sm:text-6xl font-serif font-bold text-gray-800 tabular-nums tracking-tight min-w-[140px] sm:min-w-[180px] text-center">
                  {formatTime(seconds)}
                </div>
                
                {/* Reward Preview */}
                {!isActive && mode === 'focus' && (
                  <div className="mt-2 text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span style={{ color: currentReward.accent }}>Reward: {currentReward.name}</span>
                  </div>
                )}

                {isEditable && nextTier && (
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-2 animate-pulse">
                        <ArrowUpCircle size={12} />
                        <span>+{nextTier.minMinutes - focusDuration}m for {nextTier.name}</span>
                    </div>
                )}

                {soundscape === 'flow' && isActive && (
                    <div className="flex items-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-wider mt-1 animate-pulse">
                        <Volume2 size={12} /> Flow Noise
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-6 justify-center items-center relative z-10">
             {mode === 'focus' && timerType === 'stopwatch' && isActive ? (
                <button onClick={toggleTimer} className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-gray-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                   <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                </button>
             ) : (
                <button onClick={toggleTimer} className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${mode === 'focus' ? 'bg-gradient-to-br from-gray-800 to-black shadow-gray-500/30' : 'bg-gradient-to-br from-pink-400 to-rose-400 shadow-pink-400/30'}`}>
                  {isActive ? <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />}
                </button>
             )}
            
            {mode === 'focus' && timerType === 'stopwatch' && !isActive && seconds > 0 ? (
               <button onClick={handleSessionComplete} className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 border-green-100 bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Finish & Collect Crystal">
                  <Check className="w-6 h-6 md:w-8 md:h-8" />
               </button>
            ) : (
               <button onClick={resetTimer} className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                  <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
               </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
