import React, { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import { TodoItem, TodoPriority } from '../types';

interface TodoListProps {
  items: TodoItem[];
  onToggle: (id: number) => void;
  onAdd: (title: string, priority: TodoPriority) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ items, onToggle, onAdd, onDelete }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TodoPriority>('medium');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle, newPriority);
    setNewTitle('');
  };

  const getPriorityColor = (p: TodoPriority) => {
    switch (p) {
      case 'high': return 'bg-red-50 text-red-500 border-red-100'; // Ruby
      case 'medium': return 'bg-amber-50 text-amber-500 border-amber-100'; // Citrine
      case 'low': return 'bg-sky-50 text-sky-500 border-sky-100'; // Moonstone-ish
    }
  };

  const getPriorityIcon = (p: TodoPriority) => {
    switch (p) {
        case 'high': return <ArrowUp size={14} className="mr-1" />;
        case 'medium': return <Minus size={14} className="mr-1" />;
        case 'low': return <ArrowDown size={14} className="mr-1" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up pb-20 md:pb-0">
      <div className="bg-white rounded-[32px] p-5 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 px-1">Today's Goals</h2>
        
        {/* Quick Add Form */}
        <form onSubmit={handleAdd} className="mb-8">
          <div className="flex items-center gap-2 bg-gray-50 p-2 pl-4 rounded-2xl border-2 border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all shadow-sm">
            <input 
              type="text" 
              placeholder="Add a new goal..." 
              className="flex-1 bg-transparent py-3 outline-none text-gray-700 font-medium placeholder:text-gray-400 min-w-0"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            
            <div className="flex items-center gap-2 shrink-0">
                <div className="relative group">
                    <select 
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
                        className="appearance-none bg-white text-xs font-bold uppercase py-2.5 pl-3 pr-8 rounded-xl text-gray-600 outline-none border border-gray-200 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ArrowDown size={12} />
                    </div>
                </div>
                
                <button 
                type="submit"
                disabled={!newTitle.trim()}
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-md disabled:opacity-50 hover:bg-secondary transition-transform active:scale-95"
                >
                <Plus size={20} />
                </button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              style={{ animationDelay: `${idx * 0.05}s` }}
              className={`
                flex items-center gap-3 p-3 md:p-4 rounded-2xl border transition-all duration-300 animate-slide-up relative overflow-hidden
                ${item.completed 
                  ? 'bg-gray-50 border-transparent opacity-60' 
                  : 'bg-white border-gray-100 hover:border-purple-100 shadow-sm'}
              `}
            >
              <button onClick={() => onToggle(item.id)} className="flex-shrink-0 p-1">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 hover:text-primary transition-colors" />
                )}
              </button>

              <span className={`text-2xl filter select-none ${item.completed ? 'grayscale' : ''}`}>
                {item.emoji}
              </span>

              <span className={`flex-1 font-medium text-sm md:text-lg truncate mr-2 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.title}
              </span>

              {/* Priority Badge - Compact on Mobile */}
              <div className={`
                flex-shrink-0 px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide border flex items-center
                ${getPriorityColor(item.priority)}
              `}>
                {getPriorityIcon(item.priority)}
                <span className="hidden sm:inline">{item.priority}</span>
              </div>

              <button 
                onClick={() => onDelete(item.id)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors active:bg-red-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {items.length === 0 && (
             <div className="text-center py-16 px-4">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Plus size={32} />
                </div>
                <p className="text-gray-400 font-medium">No goals for today yet.</p>
                <p className="text-sm text-gray-300 mt-1">Add one above or use the AI to generate a plan!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
