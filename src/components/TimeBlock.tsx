'use client';

import { useMemo } from 'react';
import { Check, Play } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Task, ZoomLevel } from '@/lib/types';
import { getUrgencyColor } from '@/lib/utils';

interface TimeBlockProps {
  time: Date;
  label: string;
  tasks: Task[];
  zoomLevel: ZoomLevel;
  height: number;
  onAddTask: (time: Date) => void;
  onEditTask: (task: Task) => void;
}

export function TimeBlock({ 
  time, 
  label, 
  tasks, 
  zoomLevel, 
  height, 
  onAddTask,
  onEditTask 
}: TimeBlockProps) {
  const { selectedDate, toggleTaskComplete, startPomodoro, setCurrentTask } = useStore();
  
  const now = new Date();
  const blockEnd = new Date(time.getTime() + zoomLevel * 60 * 1000);
  const isCurrentBlock = now >= time && now < blockEnd;
  
  // Calculate progress through current block
  const progress = useMemo(() => {
    if (!isCurrentBlock) return 0;
    const elapsed = now.getTime() - time.getTime();
    const total = zoomLevel * 60 * 1000;
    return Math.min(100, (elapsed / total) * 100);
  }, [isCurrentBlock, now, time, zoomLevel]);
  
  const percentRemaining = 100 - progress;

  return (
    <div
      className="relative rounded-lg border transition-all cursor-pointer group block-enter"
      style={{
        height: `${height}px`,
        background: isCurrentBlock ? 'var(--accent-muted)' : 'var(--surface)',
        borderColor: isCurrentBlock ? 'var(--accent)' : 'var(--border)',
        borderWidth: isCurrentBlock ? '2px' : '1px',
      }}
      onClick={() => tasks.length === 0 && onAddTask(time)}
    >
      {/* Time label */}
      <div 
        className="absolute top-2 left-2 text-xs font-mono"
        style={{ color: 'var(--foreground-subtle)' }}
      >
        {label}
      </div>
      
      {/* Current block progress indicator */}
      {isCurrentBlock && (
        <div 
          className="absolute bottom-0 left-0 h-1 rounded-b-lg transition-all"
          style={{ 
            width: `${progress}%`,
            background: getUrgencyColor(percentRemaining),
          }}
        />
      )}
      
      {/* Tasks in this block */}
      <div className="pt-7 px-2 pb-2 space-y-1 overflow-y-auto" style={{ maxHeight: height - 30 }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-1.5 rounded text-sm group/task"
            style={{ 
              background: task.color + '20',
              borderLeft: `3px solid ${task.color}`,
              opacity: task.completed ? 0.5 : 1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEditTask(task);
            }}
          >
            {/* Complete toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskComplete(selectedDate, task.id);
              }}
              className="w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ 
                borderColor: task.color,
                background: task.completed ? task.color : 'transparent',
              }}
            >
              {task.completed && <Check size={10} className="text-black" />}
            </button>
            
            {/* Task title */}
            <span 
              className="flex-1 truncate"
              style={{ 
                textDecoration: task.completed ? 'line-through' : 'none',
                color: 'var(--foreground)'
              }}
            >
              {task.title}
            </span>
            
            {/* Start pomodoro button */}
            {!task.completed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTask(task.id);
                  startPomodoro(task.id);
                }}
                className="opacity-0 group-hover/task:opacity-100 p-1 rounded transition-opacity hover:bg-white/10"
                aria-label="Start pomodoro for this task"
              >
                <Play size={12} style={{ color: 'var(--accent)' }} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Empty state - add task hint */}
      {tasks.length === 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--foreground-subtle)' }}
        >
          <span className="text-xs">+ Add task</span>
        </div>
      )}
    </div>
  );
}

