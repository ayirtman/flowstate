import React from 'react';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  onToggle: (id: number) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isActive, onToggle, index }) => {
  return (
    <div
      onClick={() => onToggle(task.id)}
      className={`
        relative group cursor-pointer rounded-[24px] p-6 transition-all duration-300 ease-out animate-slide-up
        ${task.completed ? 'bg-gray-50/80 opacity-60' : 'bg-white hover:-translate-y-1 hover:shadow-xl'}
        ${isActive && !task.completed ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'shadow-sm'}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {isActive && !task.completed && (
        <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-primary to-blue-400 rounded-b-full opacity-80" />
      )}

      <div className="flex items-start justify-between mb-4">
        <span className={`text-4xl filter ${task.completed ? 'grayscale' : ''}`}>
          {task.emoji}
        </span>
        <button className="text-gray-300 transition-colors group-hover:text-primary">
          {task.completed ? (
            <CheckCircle2 className="w-7 h-7 text-primary" />
          ) : (
            <Circle className="w-7 h-7" />
          )}
        </button>
      </div>

      <h3 className={`text-xl font-bold mb-3 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {task.title}
      </h3>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full">
          <Clock className="w-4 h-4" />
          <span>{task.time}</span>
        </div>
        <div 
          className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: task.color }}
        >
          {task.duration}m
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
