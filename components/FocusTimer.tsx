import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Gem, Sparkles, Zap, Hexagon, Diamond, Triangle, Plus, Minus, Timer, Watch, Check } from 'lucide-react';
import { TimerMode, CrystalType } from '../types';

interface FocusTimerProps {
  onSessionComplete?: (crystalType: CrystalType) => void;
}

// Crystal definitions
const CRYSTALS: { id: CrystalType; name: string; icon: React.FC<any>; color: string; accent: string; desc: string }[] = [
  { id: 'amethyst', name: 'Amethyst', icon: Hexagon, color: '#d8b4fe', accent: '#a855f7', desc: 'Calmness' },
  { id: 'citrine', name: 'Citrine', icon: Triangle, color: '#fde047', accent: '#eab308', desc: 'Creativity' },
  { id: 'sapphire', name: 'Sapphire', icon: Diamond, color: '#93c5fd', accent: '#3b82f6', desc: 'Logic' },
  { id: 'ruby', name: 'Ruby', icon: Gem, color: '#fda4af', accent: '#f43f5e', desc: 'Vigor' },
  { id: 'emerald', name: 'Emerald', icon: Hexagon, color: '#86efac', accent: '#22c55e', desc: 'Harmony' },
];

const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timerType, setTimerType] = useState<'countdown' | 'stopwatch'>('countdown');
  
  // Settings
  const [focusDuration, setFocusDuration] = useState(25); // minutes
  const [seconds, setSeconds] = useState(25 * 60);
  const [selectedCrystal, setSelectedCrystal] = useState<CrystalType>('amethyst');

  // Calculate progress for visuals
  const totalTime = mode === 'focus' ? (timerType === 'countdown' ? focusDuration * 60 : 60) : 5 * 60;
  
  // Progress logic:
  // Countdown: (Total - Current) / Total
  // Stopwatch: (Current % 60) / 60 (Ring loops every minute)
  let progress = 0;
  if (timerType === 'countdown' || mode === 'break') {
    progress = ((totalTime - seconds) / totalTime) * 100;
  } else {
    // Stopwatch visual: fill ring every minute
    progress = ((seconds % 60) / 60) * 100;
  }
  
  // Visual effects
  const pulseSpeed = timerType === 'countdown' ? (3 - (progress / 100) * 2) : 2; 
  const glowOpacity = timerType === 'countdown' ? (0.2 + (progress / 100) * 0.8) : 0.6;
  const rotation = timerType === 'countdown' ? ((progress / 100) * 360) : (seconds * 6); // Rotate with time in stopwatch

  // Timer Logic
  useEffect(() => {
    let interval: number;
    
    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds((prev) => {
          if (timerType === 'stopwatch' && mode === 'focus') {
            return prev + 1;
          } else {
            // Countdown logic
            if (prev <= 0) return 0;
            return prev - 1;
          }
        });
      }, 1000);
    }

    // Auto-completion for Countdown
    if (isActive && seconds === 0 && (timerType === 'countdown' || mode === 'break')) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, mode, timerType]);

  // Sync timer display when settings change (and timer is not active)
  useEffect(() => {
    if (!isActive) {
      if (mode === 'focus') {
        setSeconds(timerType === 'countdown' ? focusDuration * 60 : 0);
      } else {
        setSeconds(5 * 60);
      }
    }
  }, [focusDuration, mode, timerType]); // Intentionally omitting isActive to prevent reset on pause, checking logic manually above

  const handleSessionComplete = () => {
    setIsActive(false);
    
    // If finishing a focus session, award crystal
    if (mode === 'focus' && onSessionComplete) {
      // For stopwatch, maybe enforce minimum time? Let's say 1 min for now.
      if (timerType === 'countdown' || seconds > 60) {
        onSessionComplete(selectedCrystal);
      }
    }

    // Switch modes
    if (mode === 'focus') {
      setMode('break');
      // Break is always countdown 5 mins
      setSeconds(5 * 60);
    } else {
      setMode('focus');
      setSeconds(timerType === 'countdown' ? focusDuration * 60 : 0);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setSeconds(timerType === 'countdown' ? focusDuration * 60 : 0);
    } else {
      setSeconds(5 * 60);
    }
  };

  const adjustTime = (amount: number) => {
    const newDuration = Math.max(1, Math.min(120, focusDuration + amount));
    setFocusDuration(newDuration);
    setSeconds(newDuration * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeCrystal = CRYSTALS.find(p => p.id === selectedCrystal)!;
  const CrystalIcon = activeCrystal.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up w-full max-w-2xl mx-auto">
      
      {/* Main Container */}
      <div className="bg-white/80 backdrop-blur-md rounded-[40px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center w-full relative overflow-hidden border border-white transition-all duration-500">
        
        {/* Timer Type Toggles (Only in Focus Mode) */}
        {mode === 'focus' && !isActive && (
          <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
            <div className="flex bg-gray-100/80 p-1 rounded-full backdrop-blur-sm">
              <button
                onClick={() => setTimerType('countdown')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  timerType === 'countdown' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Timer size={14} />
                Timer
              </button>
              <button
                onClick={() => setTimerType('stopwatch')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  timerType === 'stopwatch' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Watch size={14} />
                Stopwatch
              </button>
            </div>
          </div>
        )}

        {/* Background Ambient Glow */}
        {isActive && mode === 'focus' && (
          <div 
            className="absolute inset-0 pointer-events-none transition-colors duration-1000"
            style={{ 
              background: `radial-gradient(circle at center, ${activeCrystal.color}40 0%, transparent 70%)` 
            }}
          />
        )}

        <div className="mt-12 mb-8 relative z-10">
           <h2 className={`text-xl font-bold tracking-widest uppercase font-serif ${
             mode === 'focus' ? 'text-gray-700' : 'text-pink-500'
           }`}>
             {mode === 'focus' 
               ? (timerType === 'countdown' ? '🔮 Crystallize Focus' : '⏱️ Chronometer') 
               : '☕ Recharge Energy'}
           </h2>
        </div>

        {/* The Crystal Charging Station */}
        <div className="relative w-[300px] h-[300px] mx-auto mb-10 flex items-center justify-center">
          
          {/* Outer Ring */}
          <svg className="absolute inset-0 transform -rotate-90 w-full h-full drop-shadow-lg">
            <circle
              cx="150"
              cy="150"
              r="140"
              stroke="#f3f4f6"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="150"
              cy="150"
              r="140"
              stroke={mode === 'focus' ? activeCrystal.accent : '#f472b6'}
              strokeWidth="6"
              fill="none"
              // For stopwatch, we loop the ring. For timer, we fill/unfill it.
              strokeDasharray={2 * Math.PI * 140}
              strokeDashoffset={(2 * Math.PI * 140) - ((progress / 100) * (2 * Math.PI * 140))}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          
          {/* Centerpiece Crystal */}
          <div className="relative z-10 flex flex-col items-center justify-center">
             
             {/* The Glowing Crystal */}
             <div 
                className="relative mb-6 transition-all duration-1000 ease-out"
                style={{ 
                  filter: `drop-shadow(0 0 ${mode === 'focus' ? (isActive ? 15 : 0) : 0}px ${activeCrystal.accent})`
                }}
             >
                {mode === 'focus' ? (
                  <div className="relative" style={{ animation: isActive ? `pulse-soft ${pulseSpeed}s infinite` : 'none' }}>
                     <CrystalIcon 
                      size={100} 
                      strokeWidth={1}
                      className="transition-all duration-500"
                      style={{ 
                        fill: isActive ? `${activeCrystal.color}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}` : 'transparent',
                        stroke: activeCrystal.accent,
                        transform: `rotate(${rotation}deg)`
                      }}
                     />
                     {/* Inner sparkles */}
                     {isActive && (
                        <>
                          <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" size={24} />
                          <Zap className="absolute -bottom-2 -left-4 text-blue-400 animate-pulse" size={20} />
                        </>
                     )}
                  </div>
                ) : (
                  <div className="text-8xl animate-bounce">☕</div>
                )}
             </div>
             
             {/* Timer Text & Controls */}
             <div className="flex items-center gap-4">
                {/* Decrease Time Button */}
                {!isActive && mode === 'focus' && timerType === 'countdown' && (
                   <button 
                      onClick={() => adjustTime(-5)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                      title="-5 minutes"
                   >
                      <Minus size={20} />
                   </button>
                )}

                <div className="text-6xl font-serif font-bold text-gray-800 tabular-nums tracking-tight min-w-[180px] text-center">
                  {formatTime(seconds)}
                </div>

                {/* Increase Time Button */}
                {!isActive && mode === 'focus' && timerType === 'countdown' && (
                   <button 
                      onClick={() => adjustTime(5)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                      title="+5 minutes"
                   >
                      <Plus size={20} />
                   </button>
                )}
             </div>
             
             {isActive && mode === 'focus' && (
               <div className="text-sm text-gray-400 font-medium mt-3 animate-pulse uppercase tracking-wider flex items-center gap-2">
                 <Sparkles size={14} />
                 {timerType === 'countdown' ? `Forging ${activeCrystal.name}` : 'Focusing...'}
                 <Sparkles size={14} />
               </div>
             )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-8 relative z-10">
          
          {/* Crystal Selector */}
          {!isActive && mode === 'focus' && (
            <div className="flex justify-center gap-4 flex-wrap">
              {CRYSTALS.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrystal(c.id)}
                    className={`
                      flex flex-col items-center p-3 rounded-2xl border-2 transition-all w-24
                      ${selectedCrystal === c.id 
                        ? 'bg-white shadow-xl scale-110' 
                        : 'border-transparent hover:bg-white/50 opacity-60 hover:opacity-100'}
                    `}
                    style={{ borderColor: selectedCrystal === c.id ? c.accent : 'transparent' }}
                  >
                    <Icon size={28} color={c.accent} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase text-gray-500">{c.name}</span>
                    <span className="text-[9px] text-gray-400">{c.desc}</span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex gap-6 justify-center items-center">
             {/* Main Action Button */}
             {mode === 'focus' && timerType === 'stopwatch' && isActive ? (
                // Stopwatch Mode: Pause allows finishing
                <button
                onClick={toggleTimer}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                   <Pause className="w-8 h-8 fill-current" />
                </button>
             ) : (
                <button
                  onClick={toggleTimer}
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95
                    ${mode === 'focus' 
                      ? 'bg-gradient-to-br from-gray-800 to-black shadow-gray-500/30' 
                      : 'bg-gradient-to-br from-pink-400 to-rose-400 shadow-pink-400/30'}
                  `}
                >
                  {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
             )}
            
            {/* Reset / Finish Button */}
            {/* If Stopwatch and paused and time > 0, show "Finish" checkmark */}
            {mode === 'focus' && timerType === 'stopwatch' && !isActive && seconds > 0 ? (
               <button
                  onClick={handleSessionComplete}
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-green-100 bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  title="Finish & Collect Crystal"
               >
                  <Check className="w-8 h-8" />
               </button>
            ) : (
               <button
                  onClick={resetTimer}
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
               >
                  <RotateCcw className="w-6 h-6" />
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
