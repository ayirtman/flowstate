import React from 'react';
import { Trophy, Target, Zap, Brain, Star, Rocket, Lock, Gem, Hexagon, Diamond, Triangle, Flame, Sun, Moon, CheckCircle, Circle, CheckSquare, Sparkles, Gift } from 'lucide-react';
import { Achievement, IconName, Crystal, CrystalType, Challenge, Streak } from '../types';

interface AchievementsListProps {
  achievements: Achievement[];
  sanctuary: Crystal[];
  challenges: Challenge[];
  streak: Streak;
  onOpenForge: () => void;
  onClaimChallenge: (id: string) => void;
}

const CRYSTAL_CONFIG: Record<CrystalType, { icon: React.FC<any>, color: string }> = {
  amethyst: { icon: Hexagon, color: '#a855f7' },
  citrine: { icon: Triangle, color: '#eab308' },
  sapphire: { icon: Diamond, color: '#3b82f6' },
  ruby: { icon: Gem, color: '#f43f5e' },
  emerald: { icon: Hexagon, color: '#22c55e' },
  obsidian: { icon: Hexagon, color: '#1f2937' },
  moonstone: { icon: Circle, color: '#e0f2fe' },
};

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements, sanctuary, challenges, streak, onOpenForge, onClaimChallenge }) => {
  const getIcon = (name: IconName, className: string) => {
    switch (name) {
      case 'trophy': return <Trophy className={className} />;
      case 'target': return <Target className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'brain': return <Brain className={className} />;
      case 'star': return <Star className={className} />;
      case 'rocket': return <Rocket className={className} />;
      default: return <Star className={className} />;
    }
  };

  const getTierColor = (tier: string) => {
      switch(tier) {
          case 'bronze': return 'from-orange-700 to-orange-500';
          case 'silver': return 'from-gray-400 to-gray-300';
          case 'gold': return 'from-yellow-500 to-yellow-300';
          case 'platinum': return 'from-cyan-500 to-cyan-300';
          case 'diamond': return 'from-purple-500 to-pink-500';
          default: return 'from-gray-200 to-gray-100';
      }
  };

  const unlockedCount = achievements.filter(a => a.tier !== 'bronze' || a.progress > 0).length; // Rough metric
  
  return (
    <div className="max-w-5xl mx-auto animate-slide-up space-y-6 md:space-y-8 pb-20">
      
      {/* Top Row: Streak & Daily Rituals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-[32px] p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden flex flex-row md:flex-col items-center justify-between md:justify-center text-center">
             <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                <Flame size={80} />
             </div>
             <div className="flex items-center gap-4 md:block text-left md:text-center">
                <div className="bg-white/20 p-3 rounded-full w-fit mb-0 md:mb-2 backdrop-blur-sm">
                    <Flame size={28} className="animate-pulse text-white" />
                </div>
                <div>
                    <div className="text-4xl md:text-5xl font-bold leading-none">{streak.current}</div>
                    <div className="text-orange-100 font-medium uppercase tracking-wider text-xs md:text-sm mt-1">Day Streak</div>
                </div>
             </div>
          </div>

          {/* Active Rituals */}
          <div className="md:col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
             <h3 className="text-lg md:text-xl font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="text-orange-400" /> Active Rituals
             </h3>
             <div className="space-y-3">
                {challenges.filter(c => !c.claimed).slice(0, 3).map((challenge) => (
                    <div key={challenge.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1 items-baseline">
                                <span className="font-semibold text-gray-700 text-sm truncate mr-2">{challenge.title}</span>
                                <span className="text-xs font-bold text-gray-400 shrink-0">{challenge.currentProgress}/{challenge.target}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div 
                                    className={`h-full rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-orange-400'} transition-all duration-500`}
                                    style={{ width: `${Math.min((challenge.currentProgress / challenge.target) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        
                        {/* Claim Button Logic */}
                        {challenge.completed ? (
                             <button 
                                onClick={() => onClaimChallenge(challenge.id)}
                                className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg shadow-md hover:bg-green-600 transition-transform active:scale-95 flex items-center gap-1 animate-pulse"
                             >
                                 <Gift size={14} /> Claim
                             </button>
                        ) : (
                             <div className="px-3 py-1.5 bg-gray-200 text-gray-400 text-xs font-bold rounded-lg">
                                 {challenge.rewardDust} Dust
                             </div>
                        )}
                    </div>
                ))}
                {challenges.every(c => c.claimed) && (
                    <div className="text-center py-6 text-green-500 font-medium flex flex-col items-center gap-2">
                        <CheckCircle size={32} />
                        All rituals completed & claimed!
                    </div>
                )}
             </div>
          </div>
      </div>

      {/* Sanctuary Section */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden min-h-[300px]">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[80px]" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px]" />
         </div>
         
         <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
               <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">Flow Sanctuary</h2>
                  <p className="text-indigo-200 text-sm">Forge higher tier crystals in the Elemental Forge.</p>
               </div>
               
               <div className="flex items-center gap-3">
                   <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 border border-white/5">
                      <Gem size={14} className="text-indigo-300" />
                      {sanctuary.length}
                   </div>
                   <button 
                    onClick={onOpenForge}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 hover:to-amber-400 text-white rounded-xl shadow-lg shadow-amber-900/20 transition-all active:scale-95 text-sm font-bold uppercase tracking-wide"
                  >
                     <Sparkles size={16} /> Forge
                  </button>
               </div>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 md:gap-6 p-4 bg-black/20 rounded-3xl min-h-[200px] border border-white/5">
                {sanctuary.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center text-indigo-300/40 py-8 relative">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 relative mb-4 flex items-center justify-center">
                             {/* Ghost Moonstone */}
                             <div className="absolute inset-0 border-4 border-dashed border-indigo-500/20 rounded-full animate-pulse-soft"></div>
                             <Circle size={48} className="text-indigo-500/10" fill="currentColor" />
                             <Lock size={16} className="absolute text-indigo-400/30" />
                        </div>
                        <p className="font-medium">The vault is empty.</p>
                        <p className="text-xs mt-1 max-w-[200px] text-center text-indigo-400">Mine Amethysts in the Focus Zone to begin your journey.</p>
                    </div>
                  </div>
                ) : (
                  sanctuary.map((crystal, i) => {
                    const Conf = CRYSTAL_CONFIG[crystal.type] || CRYSTAL_CONFIG.amethyst;
                    const Icon = Conf.icon;
                    return (
                      <div 
                        key={crystal.id} 
                        className="group relative flex flex-col items-center justify-center animate-slide-up hover:-translate-y-2 transition-transform duration-300"
                        style={{ animationDelay: `${i * 0.05}s` }}
                        title={`Forged on ${new Date(crystal.forgedAt).toLocaleDateString()}`}
                      >
                        <div className="relative">
                           <Icon 
                              size={32} 
                              className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] md:w-10 md:h-10"
                              style={{ 
                                 stroke: Conf.color,
                                 fill: `${Conf.color}40`
                              }} 
                           />
                           <div className="absolute inset-0 bg-white/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })
                )}
            </div>
         </div>
      </div>

      {/* Badges Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-800">Milestones</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {achievements.map((achievement, idx) => {
            const isUnlocked = achievement.level > 1 || achievement.progress > 0;
            const progressPercent = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);

            return (
              <div
                key={achievement.id}
                style={{ animationDelay: `${idx * 0.1}s` }}
                className={`
                  relative p-5 md:p-6 rounded-[24px] border-2 transition-all duration-300 animate-slide-up
                  ${isUnlocked ? 'bg-white border-purple-100' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${getTierColor(achievement.tier)} shadow-lg text-white relative overflow-hidden`}>
                     <div className="absolute inset-0 bg-white/20 blur-sm"></div>
                     <div className="relative z-10">
                        {getIcon(achievement.iconName, "w-6 h-6")}
                     </div>
                  </div>
                  <div className="text-right">
                      <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">{achievement.tier}</div>
                      
                      {/* 5-Pip Level Visual */}
                      <div className="flex gap-1 justify-end">
                          {[1, 2, 3, 4, 5].map(lvl => (
                              <div 
                                key={lvl} 
                                className={`w-1.5 h-3 rounded-full ${lvl <= achievement.level ? 'bg-purple-500' : 'bg-gray-200'}`} 
                              />
                          ))}
                      </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">{achievement.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{achievement.description}</p>

                {/* Progress Bar for Current Tier */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
                    <span>{achievement.progress} / {achievement.maxProgress}</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getTierColor(achievement.tier)}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsList;
