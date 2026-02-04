'use client';

import { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Coffee } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDuration, getUrgencyColor } from '@/lib/utils';

export function PomodoroTimer() {
  const {
    pomodoroActive,
    pomodoroTimeLeft,
    pomodoroWorkDuration,
    pomodoroIsBreak,
    currentTaskId,
    schedules,
    selectedDate,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    tickPomodoro,
    toggleFocusMode,
  } = useStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Timer tick
  useEffect(() => {
    if (pomodoroActive) {
      intervalRef.current = setInterval(() => {
        tickPomodoro();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pomodoroActive, tickPomodoro]);
  
  // Get current task
  const currentTask = currentTaskId
    ? schedules[selectedDate]?.tasks.find(t => t.id === currentTaskId)
    : null;
  
  // Calculate progress
  const totalDuration = pomodoroIsBreak ? 5 * 60 : pomodoroWorkDuration;
  const progress = ((totalDuration - pomodoroTimeLeft) / totalDuration) * 100;
  const percentRemaining = (pomodoroTimeLeft / totalDuration) * 100;
  
  // Urgency color
  const urgencyColor = getUrgencyColor(percentRemaining);

  return (
    <div 
      className="fixed bottom-6 right-6 rounded-2xl shadow-lg p-4 min-w-[280px]"
      style={{ 
        background: 'var(--background-elevated)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Break indicator */}
      {pomodoroIsBreak && (
        <div 
          className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-sm"
          style={{ background: 'var(--accent-muted)' }}
        >
          <Coffee size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--accent)' }}>Break Time</span>
        </div>
      )}
      
      {/* Current task */}
      {currentTask && !pomodoroIsBreak && (
        <div 
          className="mb-3 px-3 py-1.5 rounded-lg text-sm truncate"
          style={{ 
            background: currentTask.color + '20',
            borderLeft: `3px solid ${currentTask.color}`,
          }}
        >
          {currentTask.title}
        </div>
      )}
      
      {/* Timer display */}
      <div className="text-center mb-4">
        <div 
          className="text-5xl font-mono font-bold tracking-tight"
          style={{ 
            color: pomodoroActive && percentRemaining < 25 ? urgencyColor : 'var(--foreground)'
          }}
        >
          {formatDuration(pomodoroTimeLeft)}
        </div>
        
        {/* Progress bar */}
        <div 
          className="mt-3 h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--surface)' }}
        >
          <div 
            className="h-full transition-all duration-1000 ease-linear"
            style={{ 
              width: `${progress}%`,
              background: pomodoroIsBreak ? 'var(--accent)' : urgencyColor,
            }}
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Reset */}
        <button
          onClick={resetPomodoro}
          className="btn btn-ghost p-2"
          aria-label="Reset timer"
        >
          <RotateCcw size={18} />
        </button>
        
        {/* Play/Pause */}
        <button
          onClick={pomodoroActive ? pausePomodoro : () => startPomodoro(currentTaskId || undefined)}
          className="btn btn-primary p-3 rounded-full"
          aria-label={pomodoroActive ? 'Pause' : 'Start'}
        >
          {pomodoroActive ? <Pause size={22} /> : <Play size={22} />}
        </button>
        
        {/* Focus mode */}
        <button
          onClick={toggleFocusMode}
          className="btn btn-ghost p-2"
          aria-label="Enter focus mode"
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  );
}

