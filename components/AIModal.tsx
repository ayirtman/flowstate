import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { generateTaskBreakdown } from '../services/geminiService';
import { GeneratedTask } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated: (tasks: GeneratedTask[]) => void;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onTasksGenerated }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tasks = await generateTaskBreakdown(input);
      onTasksGenerated(tasks);
      setInput('');
      onClose();
    } catch (err) {
      setError("Failed to connect to AI. Check your API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-slide-up relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
             <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 font-serif">Smart Breakdown</h2>
        </div>

        <p className="text-gray-500 mb-6 leading-relaxed">
          Feeling overwhelmed? Tell me your big goal, and I'll use Gemini AI to break it down into small, actionable steps for you.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., 'Plan a birthday party for Sarah' or 'Prepare for Q3 marketing review'"
          className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-0 outline-none text-gray-700 min-h-[140px] resize-none transition-all placeholder:text-gray-300 text-lg mb-4"
          disabled={isLoading}
        />

        {error && (
          <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-100 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
