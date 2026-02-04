'use client';

import { useEffect } from 'react';
import { X, Coffee } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDuration, getUrgencyColor } from '@/lib/utils';

export function FocusOverlay() {
  const {
    focusModeActive,
    pomodoroTimeLeft,
    pomodoroWorkDuration,
    pomodoroIsBreak,
    currentTaskId,
    schedules,
    selectedDate,
    toggleFocusMode,
  } = useStore();
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusModeActive) {
        toggleFocusMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusModeActive, toggleFocusMode]);
  
  if (!focusModeActive) return null;
  
  // Get current task
  const currentTask = currentTaskId
    ? schedules[selectedDate]?.tasks.find(t => t.id === currentTaskId)
    : null;
  
  // Calculate urgency
  const totalDuration = pomodoroIsBreak ? 5 * 60 : pomodoroWorkDuration;
  const percentRemaining = (pomodoroTimeLeft / totalDuration) * 100;
  const urgencyColor = getUrgencyColor(percentRemaining);
  
  // Progress for circular indicator
  const progress = ((totalDuration - pomodoroTimeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center focus-overlay"
      style={{ background: 'rgba(10, 10, 11, 0.95)' }}
    >
      {/* Close button */}
      <button
        onClick={toggleFocusMode}
        className="absolute top-6 right-6 btn btn-ghost p-3"
        aria-label="Exit focus mode"
      >
        <X size={24} />
      </button>
      
      {/* Hint */}
      <div 
        className="absolute top-6 left-6 text-sm"
        style={{ color: 'var(--foreground-subtle)' }}
      >
        Press ESC to exit
      </div>
      
      {/* Main content */}
      <div className="flex flex-col items-center">
        {/* Break indicator */}
        {pomodoroIsBreak && (
          <div 
            className="flex items-center gap-3 mb-8 px-6 py-3 rounded-full text-lg"
            style={{ background: 'var(--accent-muted)' }}
          >
            <Coffee size={24} style={{ color: 'var(--accent)' }} />
            <span style={{ color: 'var(--accent)' }}>Take a break</span>
          </div>
        )}
        
        {/* Circular timer */}
        <div className="relative">
          <svg width="280" height="280" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="var(--surface)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke={pomodoroIsBreak ? 'var(--accent)' : urgencyColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Timer text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-6xl font-mono font-bold tracking-tight"
              style={{ 
                color: !pomodoroIsBreak && percentRemaining < 25 ? urgencyColor : 'var(--foreground)'
              }}
            >
              {formatDuration(pomodoroTimeLeft)}
            </span>
          </div>
        </div>
        
        {/* Current task */}
        {currentTask && !pomodoroIsBreak && (
          <div 
            className="mt-8 px-6 py-3 rounded-xl text-xl max-w-md text-center"
            style={{ 
              background: currentTask.color + '20',
              borderLeft: `4px solid ${currentTask.color}`,
            }}
          >
            {currentTask.title}
          </div>
        )}
        
        {/* Motivational message */}
        {!pomodoroIsBreak && (
          <p 
            className="mt-8 text-lg"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {percentRemaining > 50 
              ? "Stay focused. You've got this." 
              : percentRemaining > 25 
                ? "Keep going, you're doing great!"
                : "Almost there, finish strong!"}
          </p>
        )}
      </div>
    </div>
  );
}

