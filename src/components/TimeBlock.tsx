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
  
  // Compact mode for small zoom levels
  const isCompact = zoomLevel <= 15;
  
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
      className="relative rounded-lg border transition-all cursor-pointer group block-enter overflow-hidden"
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
        className="absolute top-1.5 left-2 text-xs font-mono z-10"
        style={{ 
          color: 'var(--foreground-subtle)',
          fontSize: isCompact ? '10px' : '12px',
        }}
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
      <div 
        className={`overflow-y-auto ${isCompact ? 'pt-5 px-1.5 pb-1.5' : 'pt-7 px-2 pb-2'}`}
        style={{ maxHeight: height - (isCompact ? 20 : 30) }}
      >
        {isCompact ? (
          // Compact view - just colored pills with task name
          <div className="flex flex-wrap gap-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{ 
                  background: task.color + '30',
                  border: `1px solid ${task.color}`,
                  opacity: task.completed ? 0.5 : 1,
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(task);
                }}
                title={task.title}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskComplete(selectedDate, task.id);
                  }}
                  className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: task.completed ? task.color : 'transparent',
                    border: `1.5px solid ${task.color}`,
                  }}
                >
                  {task.completed && <Check size={8} className="text-black" />}
                </button>
                <span className="truncate max-w-[80px]" style={{ color: 'var(--foreground)' }}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Full view - original layout
          <div className="space-y-1">
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
        )}
      </div>
      
      {/* Empty state - add task hint */}
      {tasks.length === 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--foreground-subtle)' }}
        >
          <span className="text-xs">+ Add</span>
        </div>
      )}
    </div>
  );
}
