import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Gem, Sparkles, Zap, Hexagon, Diamond, Triangle, Timer, Watch, Check, GripHorizontal } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);

  // Refs for Drag Logic
  const dialRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);

  // --- Visual Logic ---

  // Calculate progress for visuals
  // If Active: Show remaining time / total time
  // If Inactive (Setting): Show set time (modulo 60 for the ring position)
  const totalTime = mode === 'focus' ? (timerType === 'countdown' ? focusDuration * 60 : 60) : 5 * 60;
  
  let progress = 0;
  let rotation = 0;

  if (timerType === 'stopwatch') {
    // Stopwatch visual: fill ring every minute
    progress = ((seconds % 60) / 60) * 100;
    rotation = seconds * 6;
  } else {
    // Countdown / Setting Mode
    if (isActive) {
      // Countdown Logic: Ring shrinks
      progress = ((totalTime - seconds) / totalTime) * 100;
      rotation = (progress / 100) * 360;
    } else {
      // Setting Logic: Ring shows current set duration (modulo 60 mins)
      // We want the ring to fill up as we increase time.
      // 0 mins = 0%, 60 mins = 100%, 90 mins = 50%
      progress = ((focusDuration % 60) / 60) * 100;
      if (focusDuration > 0 && focusDuration % 60 === 0) progress = 100; // Visual fix for exactly 60m
      rotation = progress * 3.6; // Convert percentage to degrees
    }
  }
  
  const pulseSpeed = timerType === 'countdown' ? (3 - (progress / 100) * 2) : 2; 
  const glowOpacity = timerType === 'countdown' ? (0.2 + (progress / 100) * 0.8) : 0.6;

  // --- Timer Tick Logic ---
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

  // Sync timer display when settings change
  useEffect(() => {
    if (!isActive) {
      if (mode === 'focus') {
        setSeconds(timerType === 'countdown' ? focusDuration * 60 : 0);
      } else {
        setSeconds(5 * 60);
      }
    }
  }, [focusDuration, mode, timerType]); 


  // --- Dial Interaction Logic ---

  const calculateAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle in degrees (0 at 12 o'clock, clockwise positive)
    // Math.atan2(y, x) gives angle from X axis.
    // We adjust coordinate system so 0 is up.
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    // Standard atan2 is angle from positive X axis (3 o'clock)
    // -PI to PI
    let angleRad = Math.atan2(y, x);
    let angleDeg = angleRad * (180 / Math.PI);
    
    // Convert to 12 o'clock origin
    angleDeg = angleDeg + 90;
    
    // Normalize to 0-360
    if (angleDeg < 0) angleDeg += 360;
    
    return angleDeg;
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (isActive || (mode === 'focus' && timerType === 'stopwatch')) return; // Disable drag if active or stopwatch
    setIsDragging(true);
    lastAngleRef.current = calculateAngle(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const currentAngle = calculateAngle(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;

    // Handle crossing the 0/360 boundary
    // If we went from 350 to 10, delta is -340. We want +20.
    if (delta < -180) delta += 360;
    // If we went from 10 to 350, delta is +340. We want -20.
    if (delta > 180) delta -= 360;

    // Sensitivity: 6 degrees = 1 minute
    // We'll just update based on the raw delta and let the user fine tune
    // To make it smoother, we can buffer it, but direct mapping feels responsive.
    
    // Let's perform integer updates
    if (Math.abs(delta) > 2) { // Minimum threshold to prevent jitter
       const minutesChange = Math.round(delta / 6); // 1 min per 6 deg
       if (minutesChange !== 0) {
         setFocusDuration(prev => {
           const next = prev + minutesChange;
           return Math.max(1, Math.min(180, next)); // Clamp 1 to 180 mins
         });
         lastAngleRef.current = currentAngle;
       }
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Global event listeners for drag to handle moving outside the element
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
    if (mode === 'focus' && onSessionComplete) {
      if (timerType === 'countdown' || seconds > 60) {
        onSessionComplete(selectedCrystal);
      }
    }
    if (mode === 'focus') {
      setMode('break');
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

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeCrystal = CRYSTALS.find(p => p.id === selectedCrystal)!;
  const CrystalIcon = activeCrystal.icon;

  // Visual Setup
  const isEditable = !isActive && mode === 'focus' && timerType === 'countdown';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up w-full max-w-2xl mx-auto">
      
      {/* Main Container */}
      <div className="bg-white/80 backdrop-blur-md rounded-[40px] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center w-full relative overflow-hidden border border-white transition-all duration-500 select-none">
        
        {/* Timer Type Toggles */}
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

        {/* The Crystal Charging Station (Interactive Dial) */}
        <div 
          ref={dialRef}
          className={`relative w-[300px] h-[300px] mx-auto mb-10 flex items-center justify-center rounded-full touch-none ${isEditable ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onMouseDown={(e) => isEditable && handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => isEditable && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        >
          
          {/* Outer Ring Background */}
          <svg className="absolute inset-0 transform -rotate-90 w-full h-full drop-shadow-lg pointer-events-none">
            <circle
              cx="150"
              cy="150"
              r="140"
              stroke="#f3f4f6"
              strokeWidth="4"
              fill="none"
            />
            {/* The Active Progress/Setting Ring */}
            <circle
              cx="150"
              cy="150"
              r="140"
              stroke={mode === 'focus' ? activeCrystal.accent : '#f472b6'}
              strokeWidth="6"
              fill="none"
              // Loop ring logic
              strokeDasharray={2 * Math.PI * 140}
              strokeDashoffset={
                  // If active: shrinks counter-clockwise (standard countdown)
                  // If inactive: grows clockwise to show set time
                  isActive || timerType === 'stopwatch'
                   ? (2 * Math.PI * 140) - ((progress / 100) * (2 * Math.PI * 140))
                   : (2 * Math.PI * 140) - ((progress / 100) * (2 * Math.PI * 140))
              }
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-100 ease-linear"
            />
          </svg>

          {/* Draggable Handle (Visible only when setting time) */}
          {isEditable && (
             <div 
               className="absolute w-full h-full pointer-events-none"
               style={{ transform: `rotate(${rotation}deg)` }}
             >
                {/* Knob */}
                <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-md border-2 border-gray-100 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-gray-400" />
                </div>
             </div>
          )}
          
          {/* Centerpiece Crystal */}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
             
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
                        // In countdown active, rotate based on progress. In stopwatch, rotate continuously.
                        transform: isActive 
                            ? `rotate(${timerType === 'countdown' ? (progress/100)*360 : seconds*6}deg)`
                            : `rotate(${isDragging ? rotation : 0}deg)`
                      }}
                     />
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
             
             {/* Timer Text */}
             <div className="flex flex-col items-center">
                <div className="text-6xl font-serif font-bold text-gray-800 tabular-nums tracking-tight min-w-[180px] text-center">
                  {formatTime(seconds)}
                </div>
                
                {isEditable && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-medium uppercase tracking-wider mt-2 animate-pulse">
                        <GripHorizontal size={14} />
                        <span>Drag to set</span>
                    </div>
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
