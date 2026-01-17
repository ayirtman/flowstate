import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
  initialTask?: Task | null;
}

const COLORS = {
  wellness: '#B4A7D6',
  work: '#A8D8EA',
  personal: '#FFCF96'
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialTask }) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📅');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState<TaskCategory>('personal');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setEmoji(initialTask.emoji);
      setTime(initialTask.time);
      setDuration(initialTask.duration);
      setCategory(initialTask.category);
    } else {
      setTitle('');
      setEmoji('📅');
      setTime('09:00');
      setDuration(30);
      setCategory('personal');
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      emoji,
      time,
      duration,
      category,
      color: COLORS[category]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md p-6 animate-slide-up relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-2xl font-serif font-bold mb-6 text-gray-800">
          {initialTask ? 'Edit Task' : 'New Timeline Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Title</label>
            <div className="flex gap-2">
              <input
                className="w-12 text-center p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary outline-none"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                maxLength={2}
              />
              <input
                className="flex-1 p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary outline-none"
                placeholder="Task Name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  className="w-full p-3 pl-10 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary outline-none"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Duration (min)</label>
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary outline-none"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Category</label>
            <div className="flex gap-2">
              {(['wellness', 'work', 'personal'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all border-2 ${category === cat ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-gray-900 text-white rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            {initialTask ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
