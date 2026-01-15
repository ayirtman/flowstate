import React from 'react';
import { Trophy, Target, Zap, Brain, Star, Rocket, Lock, Gem, Hexagon, Diamond, Triangle } from 'lucide-react';
import { Achievement, IconName, Crystal, CrystalType } from '../types';

interface AchievementsListProps {
  achievements: Achievement[];
  sanctuary: Crystal[];
}

const CRYSTAL_CONFIG: Record<CrystalType, { icon: React.FC<any>, color: string }> = {
  amethyst: { icon: Hexagon, color: '#a855f7' },
  citrine: { icon: Triangle, color: '#eab308' },
  sapphire: { icon: Diamond, color: '#3b82f6' },
  ruby: { icon: Gem, color: '#f43f5e' },
  emerald: { icon: Hexagon, color: '#22c55e' },
  diamond: { icon: Diamond, color: '#94a3b8' }
};

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements, sanctuary }) => {
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

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="max-w-5xl mx-auto animate-slide-up space-y-8">
      
      {/* Sanctuary Section */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 shadow-xl relative overflow-hidden min-h-[300px]">
         {/* Decorative Background */}
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[80px]" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px]" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-2 text-white">
               <h2 className="text-3xl font-serif font-bold">Flow Sanctuary</h2>
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sm">
                  <Gem size={14} />
                  <span>{sanctuary.length} Crystals Forged</span>
               </div>
            </div>
            <p className="text-indigo-200 mb-8 max-w-md">
              Your collection of crystallized focus moments. Each gem represents a session where you found your flow.
            </p>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6 p-4">
                {sanctuary.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-indigo-300/50 border-2 border-dashed border-indigo-500/30 rounded-2xl">
                    <Gem className="w-12 h-12 mb-4 opacity-50" />
                    <p>The vault is empty.</p>
                    <p className="text-sm">Complete a focus session to forge your first crystal.</p>
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
                              className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                              style={{ 
                                 stroke: Conf.color,
                                 fill: `${Conf.color}40`
                              }} 
                           />
                           {/* Shine effect */}
                           <div className="absolute inset-0 bg-white/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
                           {new Date(crystal.forgedAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })
                )}
            </div>
         </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-serif font-bold text-gray-800">Trophies</h2>
          <span className="text-primary font-bold bg-purple-50 px-4 py-2 rounded-full text-sm">
            {unlockedCount} / {totalCount} Unlocked
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, idx) => (
            <div
              key={achievement.id}
              style={{ animationDelay: `${idx * 0.1}s` }}
              className={`
                relative p-6 rounded-[24px] border-2 transition-all duration-300 animate-slide-up group
                ${achievement.isUnlocked 
                  ? 'bg-white border-purple-100 shadow-lg shadow-purple-100/50 hover:-translate-y-1' 
                  : 'bg-gray-50 border-gray-100 opacity-80 hover:opacity-100'}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  p-3 rounded-2xl 
                  ${achievement.isUnlocked 
                    ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30' 
                    : 'bg-gray-200 text-gray-400'}
                `}>
                  {getIcon(achievement.iconName, "w-6 h-6")}
                </div>
                {!achievement.isUnlocked && (
                  <Lock className="w-5 h-5 text-gray-300" />
                )}
              </div>

              <h3 className={`text-lg font-bold mb-2 ${achievement.isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                {achievement.title}
              </h3>
              
              <p className="text-sm text-gray-500 mb-4 h-10 leading-snug">
                {achievement.description}
              </p>

              {/* Progress Bar for the card */}
              <div className="mt-auto">
                <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span>{Math.min(achievement.progress, achievement.maxProgress)} / {achievement.maxProgress}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${achievement.isUnlocked ? 'bg-primary' : 'bg-gray-300'}`}
                    style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {achievement.isUnlocked && (
                 <div className="absolute inset-0 rounded-[24px] ring-2 ring-primary/20 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsList;
