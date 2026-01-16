import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, Hexagon, Triangle, Diamond, Gem, Circle } from 'lucide-react';
import { Crystal, CrystalType } from '../types';

interface CraftingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sanctuary: Crystal[];
  onCraft: (inputParams: { costType: CrystalType; costAmount: number; resultType: CrystalType }) => void;
}

// Crystal definitions for UI mapping
const CRYSTAL_ASSETS: Record<CrystalType, { name: string; icon: React.FC<any>; color: string; nextTier?: CrystalType }> = {
  amethyst: { name: 'Amethyst', icon: Hexagon, color: '#a855f7', nextTier: 'citrine' },
  citrine: { name: 'Citrine', icon: Triangle, color: '#eab308', nextTier: 'sapphire' },
  sapphire: { name: 'Sapphire', icon: Diamond, color: '#3b82f6', nextTier: 'emerald' },
  emerald: { name: 'Emerald', icon: Hexagon, color: '#22c55e', nextTier: 'ruby' },
  ruby: { name: 'Ruby', icon: Gem, color: '#f43f5e', nextTier: 'obsidian' },
  // Obsidian + Moonstone path
  obsidian: { name: 'Obsidian', icon: Hexagon, color: '#1f2937', nextTier: 'moonstone' },
  diamond: { name: 'Diamond', icon: Diamond, color: '#94a3b8', nextTier: undefined }, // Legacy
  moonstone: { name: 'Moonstone', icon: Circle, color: '#7dd3fc', nextTier: undefined },
};

const CraftingModal: React.FC<CraftingModalProps> = ({ isOpen, onClose, sanctuary, onCraft }) => {
  const [craftingAnim, setCraftingAnim] = useState<CrystalType | null>(null);

  if (!isOpen) return null;

  // Count inventory
  const inventory = sanctuary.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<CrystalType, number>);

  const handleTransmute = (type: CrystalType) => {
    const config = CRYSTAL_ASSETS[type];
    if (!config.nextTier) return;

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

  // Define the crafting chain order
  const craftingChain: CrystalType[] = ['amethyst', 'citrine', 'sapphire', 'emerald', 'ruby', 'obsidian'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-[#1a1b26] border border-gray-700 rounded-[32px] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-slide-up text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 flex justify-between items-center relative overflow-hidden flex-shrink-0">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
             <div className="relative z-10">
                <h2 className="text-xl md:text-2xl font-serif font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-400" /> Elemental Forge
                </h2>
                <p className="text-indigo-200 text-xs md:text-sm">Combine 3 crystals to create 1 of higher rarity.</p>
             </div>
             {/* z-20 ensures button is clickable above the background layers */}
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
                            <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start gap-4">
                                {/* Input Side */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gray-900 flex items-center justify-center border-2 ${canCraft ? 'border-gray-600' : 'border-red-900/50 opacity-50'}`}>
                                            <Icon size={24} className="md:w-7 md:h-7" style={{ color: config.color }} />
                                        </div>
                                        <div className={`absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${canCraft ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                            {count}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-200 text-sm md:text-base">{config.name}</h3>
                                        <span className="text-xs text-gray-400">Requires 3</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Arrow (Hidden on very small mobile, shown on SM up) */}
                            <div className="rotate-90 sm:rotate-0 flex items-center justify-center">
                                {isAnimating ? (
                                    <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                                ) : (
                                    <ArrowRight className={`w-5 h-5 ${canCraft ? 'text-yellow-400 animate-pulse' : 'text-gray-700'}`} />
                                )}
                            </div>

                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                {/* Output Side */}
                                <div className="flex items-center gap-4 text-right sm:order-none order-first">
                                    <div>
                                        <h3 className="font-bold text-yellow-100 text-sm md:text-base">{nextConfig.name}</h3>
                                        <span className="text-xs text-yellow-500/80">Result</span>
                                    </div>
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gray-900 flex items-center justify-center border-2 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                        <NextIcon size={24} className={`md:w-7 md:h-7 ${canCraft ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} style={{ color: nextConfig.color }} />
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => handleTransmute(type)}
                                    disabled={!canCraft || isAnimating}
                                    className={`
                                        sm:ml-4 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap
                                        ${canCraft 
                                            ? 'bg-gradient-to-r from-yellow-600 to-amber-500 hover:scale-105 hover:shadow-lg text-white' 
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                                    `}
                                >
                                    {isAnimating ? 'Fusing...' : 'Fuse'}
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
                    <h4 className="font-bold text-cyan-200 text-sm">Ultimate Goal: Moonstone</h4>
                    <p className="text-xs text-cyan-100/70">Fuse Obsidian to create Moonstones. Use Moonstones to unlock Pro features forever.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingModal;
