import React, { useState } from 'react';
import { X, Check, Star, Shield, Repeat, Volume2, Gem, Sparkles, Circle } from 'lucide-react';
import { Crystal } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  sanctuary: Crystal[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade, sanctuary }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<'cash' | 'crystal'>('cash');

  if (!isOpen) return null;

  // Calculate moonstone count
  const moonstoneCount = sanctuary.filter(c => c.type === 'moonstone').length;
  const CRYSTAL_PRICE = 1; // 1 Moonstone for lifetime pro (based on difficulty)

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpgrade(); // The parent component handles specific crystal deduction if method is crystal
      setIsProcessing(false);
    }, 1500);
  };

  const handleRedeem = () => {
      if (moonstoneCount < CRYSTAL_PRICE) return;
      setIsProcessing(true);
      setTimeout(() => {
          onUpgrade(); // This will trigger deduction in parent
          setIsProcessing(false);
      }, 1500);
  };

  const features = [
    { name: "Focus Timer", free: true, pro: true },
    { name: "Duration Statistics", free: true, pro: true },
    { name: "Deep Focus Mode", free: true, pro: true },
    { name: "Time Guard (Block Apps)", free: false, pro: true, icon: Shield },
    { name: "Auto-start Next Session", free: false, pro: true, icon: Repeat },
    { name: "Mindful Soundscapes", free: false, pro: true, icon: Volume2 },
    { name: "Exclusive Crystal Trees", free: false, pro: true, icon: Gem },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl relative overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header Image/Gradient */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-600 p-8 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10">
            <Star size={140} />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full w-fit text-xs font-bold uppercase tracking-wider shadow-lg">
                <Sparkles size={12} />
                Plus Member
            </div>
            <h2 className="text-3xl font-serif font-bold mb-2">Upgrade to Pro</h2>
            <p className="text-emerald-100">Unlock your full potential with advanced focus tools.</p>
          </div>
        </div>

        {/* Features List */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <div className="grid grid-cols-6 bg-gray-50 p-3 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <div className="col-span-4 pl-2">Feature</div>
                <div className="col-span-1 text-center">Free</div>
                <div className="col-span-1 text-center text-emerald-600">Pro</div>
            </div>
            
            {features.map((feat, idx) => (
                <div key={idx} className={`grid grid-cols-6 p-4 items-center border-b border-gray-100 last:border-0 ${feat.pro && !feat.free ? 'bg-emerald-50/30' : ''}`}>
                    <div className="col-span-4 flex items-center gap-3">
                        {feat.icon && <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><feat.icon size={14} /></div>}
                        <span className={`text-sm font-medium ${!feat.free ? 'text-gray-900' : 'text-gray-600'}`}>{feat.name}</span>
                    </div>
                    <div className="col-span-1 flex justify-center">
                        {feat.free ? <Check size={18} className="text-gray-400" /> : <span className="text-gray-300">-</span>}
                    </div>
                    <div className="col-span-1 flex justify-center">
                        {feat.pro && <div className="bg-emerald-100 p-1 rounded-full"><Check size={14} className="text-emerald-600" /></div>}
                    </div>
                </div>
            ))}
          </div>
          
          {/* Payment Method Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setMethod('cash')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${method === 'cash' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
              >
                  Pay with Cash
              </button>
              <button 
                onClick={() => setMethod('crystal')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === 'crystal' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              >
                  <Circle size={12} className="fill-indigo-400 text-indigo-400" />
                  Use Moonstone
              </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto">
            {method === 'cash' ? (
                <button
                    onClick={handlePurchase}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Unlock Lifetime Access
                            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">$4.99</span>
                        </>
                    )}
                </button>
            ) : (
                <button
                    onClick={handleRedeem}
                    disabled={isProcessing || moonstoneCount < CRYSTAL_PRICE}
                    className={`
                        w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                        ${moonstoneCount >= CRYSTAL_PRICE 
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-indigo-500/30' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Redeem with Moonstone
                            <span className={`bg-white/20 px-2 py-0.5 rounded text-sm flex items-center gap-1 ${moonstoneCount < CRYSTAL_PRICE ? 'text-red-400 font-bold bg-red-100' : ''}`}>
                                <Circle size={10} fill="currentColor" />
                                {moonstoneCount} / {CRYSTAL_PRICE}
                            </span>
                        </>
                    )}
                </button>
            )}
            
            <p className="text-center text-xs text-gray-400 mt-3">
                {method === 'cash' 
                    ? "One-time payment. Restore anytime. Secure checkout." 
                    : "Use your hard-earned Legendary Crystals to unlock Pro features for free."}
            </p>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionModal;
