import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, Hexagon, Triangle, Diamond, Gem, Circle } from 'lucide-react';
import { Crystal, CrystalType } from '../types';

interface CraftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sanctuary: Crystal[];
  onCraft: (inputParams: { costType: CrystalType; costAmount: number; resultType: CrystalType }) => void;
}

const CRYSTAL_ASSETS: Record<CrystalType, { name: string; icon: React.FC<any>; color: string; nextTier?: CrystalType }> = {
  amethyst: { name: 'Amethyst', icon: Hexagon, color: '#a855f7', nextTier: 'citrine' },
  citrine: { name: 'Citrine', icon: Triangle, color: '#eab308', nextTier: 'sapphire' },
  sapphire: { name: 'Sapphire', icon: Diamond, color: '#3b82f6', nextTier: 'emerald' },
  emerald: { name: 'Emerald', icon: Hexagon, color: '#22c55e', nextTier: 'ruby' },
  ruby: { name: 'Ruby', icon: Gem, color: '#f43f5e', nextTier: 'obsidian' },
  obsidian: { name: 'Obsidian', icon: Hexagon, color: '#1f2937', nextTier: 'moonstone' },
  moonstone: { name: 'Moonstone', icon: Circle, color: '#7dd3fc', nextTier: undefined },
};

const CraftingModal: React.FC<CraftingModalProps> = ({ isOpen, onClose, sanctuary, onCraft }) => {
  const [craftingAnim, setCraftingAnim] = useState<CrystalType | null>(null);

  if (!isOpen) return null;

  const inventory = sanctuary.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<CrystalType, number>);

  const handleTransmute = (type: CrystalType) => {
    const config = CRYSTAL_ASSETS[type];
    if (!config.nextTier) return;
    
    // STRICT RULE: 3 to 1
    if ((inventory[type] || 0) < 3) return;

    setCraftingAnim(type);
    
    setTimeout(() => {
        onCraft({
            costType: type,
            costAmount: 3,
            resultType: config.nextTier!
        });
        setCraftingAnim(null);
    }, 1000);
  };

  const craftingChain: CrystalType[] = ['amethyst', 'citrine', 'sapphire', 'emerald', 'ruby', 'obsidian'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-[#1a1b26] border border-gray-700 rounded-[32px] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-slide-up text-white flex flex-col max-h-[90vh]">
        
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 flex justify-between items-center relative overflow-hidden flex-shrink-0">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
             <div className="relative z-10">
                <h2 className="text-xl md:text-2xl font-serif font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-400" /> Elemental Forge
                </h2>
                <p className="text-indigo-200 text-xs md:text-sm">Fuse 3 crystals to forge 1 of higher rarity.</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-20">
                <X size={24} />
             </button>
        </div>

        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 gap-4">
                {craftingChain.map((type) => {
                    const config = CRYSTAL_ASSETS[type];
                    const nextType = config.nextTier!;
                    const nextConfig = CRYSTAL_ASSETS[nextType];
                    const count = inventory[type] || 0;
                    const canCraft = count >= 3;
                    const Icon = config.icon;
                    const NextIcon = nextConfig.icon;

                    const isAnimating = craftingAnim === type;

                    return (
                        <div key={type} className="bg-gray-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between border border-gray-700/50 gap-4 sm:gap-0">
                            {/* Input */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center border-2 ${canCraft ? 'border-gray-600' : 'border-red-900/50 opacity-50'}`}>
                                        <Icon size={28} style={{ color: config.color }} />
                                    </div>
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${canCraft ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {count}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-200 text-sm md:text-base">{config.name}</h3>
                                    <span className="text-xs text-gray-400">Inventory: {count}</span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Requires 3</span>
                                {isAnimating ? (
                                    <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={12} className="text-yellow-200" />
                                        </div>
                                    </div>
                                ) : (
                                    <ArrowRight className={`w-5 h-5 ${canCraft ? 'text-yellow-400 animate-pulse' : 'text-gray-700'}`} />
                                )}
                            </div>

                            {/* Output & Action */}
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <h3 className={`font-bold text-sm md:text-base ${canCraft ? 'text-yellow-100' : 'text-gray-600'}`}>{nextConfig.name}</h3>
                                    <span className="text-xs text-yellow-500/50">Result</span>
                                </div>
                                
                                <div className="relative group cursor-help">
                                    <div className={`w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center border-2 ${canCraft ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-gray-800 border-dashed'}`}>
                                        <NextIcon 
                                            size={28} 
                                            style={{ color: canCraft ? nextConfig.color : '#4b5563' }} 
                                            className={canCraft ? '' : 'opacity-20'}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleTransmute(type)}
                                    disabled={!canCraft || isAnimating}
                                    className={`
                                        ml-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                                        ${canCraft 
                                            ? 'bg-gradient-to-r from-yellow-600 to-amber-500 hover:scale-105 hover:shadow-lg text-white' 
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                                    `}
                                >
                                    Forge
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl flex items-center gap-4">
                <div className="bg-indigo-500/20 p-3 rounded-full flex-shrink-0">
                    <Circle size={24} className="text-cyan-300" />
                </div>
                <div>
                    <h4 className="font-bold text-cyan-200 text-sm">Legendary Moonstone</h4>
                    <p className="text-xs text-cyan-100/70">The ultimate goal. Forge Obsidian to create Moonstones and unlock the Pro features forever.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingModal;
