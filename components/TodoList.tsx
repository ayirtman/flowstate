import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { TodoItem, TodoPriority } from '../types';

interface TodoListProps {
  items: TodoItem[];
  onToggle: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ items, onToggle }) => {
  const getPriorityColor = (p: TodoPriority) => {
    switch (p) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'low': return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Today's Goals</h2>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onToggle(item.id)}
              style={{ animationDelay: `${idx * 0.05}s` }}
              className={`
                flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group animate-slide-up
                ${item.completed 
                  ? 'bg-gray-50 border-transparent opacity-60' 
                  : 'bg-white border-gray-50 hover:border-purple-100 hover:bg-purple-50/30'}
              `}
            >
              <button className="flex-shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
                )}
              </button>

              <span className={`text-2xl filter ${item.completed ? 'grayscale' : ''}`}>
                {item.emoji}
              </span>

              <span className={`flex-1 font-medium text-lg ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.title}
              </span>

              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
            </div>
          ))}
          
          {items.length === 0 && (
             <div className="text-center py-12 text-gray-400">
                No items yet. Use the AI button to generate some!
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
