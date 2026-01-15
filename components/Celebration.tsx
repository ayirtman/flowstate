import React from 'react';

const Celebration: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none overflow-hidden">
      <div className="animate-[pulse_0.6s_ease-out] text-[120px] drop-shadow-2xl">
        🎉
      </div>
      {/* Dynamic Confetti Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-4xl"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%)`,
            animation: `confetti-explode-${i % 3} 1.5s ease-out forwards`,
            opacity: 0,
          }}
        >
          {['✨', '🌟', '💫', '⭐', '🎊'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
      <style>{`
        @keyframes confetti-explode-0 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 200px), calc(-50% - 200px)) rotate(720deg) scale(1); opacity: 0; }
        }
        @keyframes confetti-explode-1 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 200px), calc(-50% - 250px)) rotate(-720deg) scale(1); opacity: 0; }
        }
        @keyframes confetti-explode-2 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 100px), calc(-50% + 200px)) rotate(360deg) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Celebration;
