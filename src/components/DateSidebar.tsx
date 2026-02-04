'use client';

import { useMemo } from 'react';
import { format, isToday, isSameDay, parseISO } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getDaysArray, formatDate } from '@/lib/utils';

export function DateSidebar() {
  const { selectedDate, setSelectedDate, schedules } = useStore();
  
  const days = useMemo(() => getDaysArray(new Date(), 7, 14), []);
  
  const goToToday = () => {
    setSelectedDate(formatDate(new Date()));
  };
  
  const goToPrevDay = () => {
    const current = parseISO(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(formatDate(current));
  };
  
  const goToNextDay = () => {
    const current = parseISO(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(formatDate(current));
  };
  
  const getTaskCount = (date: Date): number => {
    const dateStr = formatDate(date);
    return schedules[dateStr]?.tasks.length || 0;
  };

  return (
    <aside 
      className="h-screen flex flex-col border-r"
      style={{ 
        width: 'var(--sidebar-width)',
        background: 'var(--background-elevated)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b flex items-center gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <Calendar size={20} style={{ color: 'var(--accent)' }} />
        <span className="font-semibold text-sm">GSD</span>
      </div>
      
      {/* Navigation */}
      <div className="p-2 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={goToPrevDay}
          className="btn btn-ghost p-2"
          aria-label="Previous day"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={goToToday}
          className="btn btn-ghost text-xs px-2 py-1"
        >
          Today
        </button>
        <button 
          onClick={goToNextDay}
          className="btn btn-ghost p-2"
          aria-label="Next day"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      
      {/* Date list */}
      <div className="flex-1 overflow-y-auto py-2">
        {days.map((day) => {
          const dateStr = formatDate(day);
          const isSelected = dateStr === selectedDate;
          const today = isToday(day);
          const taskCount = getTaskCount(day);
          
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className="w-full px-3 py-2 text-left transition-colors flex items-center justify-between group"
              style={{
                background: isSelected ? 'var(--accent-muted)' : 'transparent',
                borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
              }}
            >
              <div className="flex flex-col">
                <span 
                  className="text-xs font-medium"
                  style={{ 
                    color: today ? 'var(--accent)' : isSelected ? 'var(--foreground)' : 'var(--foreground-muted)'
                  }}
                >
                  {format(day, 'EEE')}
                </span>
                <span 
                  className="text-sm"
                  style={{ color: isSelected ? 'var(--foreground)' : 'var(--foreground-muted)' }}
                >
                  {format(day, 'MMM d')}
                </span>
              </div>
              
              {taskCount > 0 && (
                <span 
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ 
                    background: 'var(--surface)',
                    color: 'var(--foreground-muted)'
                  }}
                >
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

