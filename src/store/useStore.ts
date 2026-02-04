'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, ZoomLevel, ZOOM_LEVELS, Task, DaySchedule } from '@/lib/types';
import { generateId, formatDate } from '@/lib/utils';

const DEFAULT_WORK_DURATION = 25 * 60; // 25 minutes
const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes

// Debounce helper
let saveTimeout: NodeJS.Timeout | null = null;
const debouncedSave = (schedules: Record<string, DaySchedule>, settings: object) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules, settings }),
      });
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
    }
  }, 1000); // Save after 1 second of inactivity
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedDate: formatDate(new Date()),
      zoomLevel: 60,
      timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
      schedules: {},
      pomodoroActive: false,
      pomodoroTimeLeft: DEFAULT_WORK_DURATION,
      pomodoroWorkDuration: DEFAULT_WORK_DURATION,
      pomodoroBreakDuration: DEFAULT_BREAK_DURATION,
      pomodoroIsBreak: false,
      focusModeActive: false,
      currentTaskId: null,

      // Actions
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      setZoomLevel: (level) => {
        set({ zoomLevel: level });
        const state = get();
        debouncedSave(state.schedules, {
          zoomLevel: level,
          timezones: state.timezones,
        });
      },
      
      zoomIn: () => {
        const { zoomLevel } = get();
        const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
        if (currentIndex > 0) {
          const newLevel = ZOOM_LEVELS[currentIndex - 1];
          set({ zoomLevel: newLevel });
          const state = get();
          debouncedSave(state.schedules, {
            zoomLevel: newLevel,
            timezones: state.timezones,
          });
        }
      },
      
      zoomOut: () => {
        const { zoomLevel } = get();
        const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
        if (currentIndex < ZOOM_LEVELS.length - 1) {
          const newLevel = ZOOM_LEVELS[currentIndex + 1];
          set({ zoomLevel: newLevel });
          const state = get();
          debouncedSave(state.schedules, {
            zoomLevel: newLevel,
            timezones: state.timezones,
          });
        }
      },
      
      addTimezone: (tz) => {
        const { timezones, schedules } = get();
        if (!timezones.includes(tz)) {
          const newTimezones = [...timezones, tz];
          set({ timezones: newTimezones });
          debouncedSave(schedules, {
            zoomLevel: get().zoomLevel,
            timezones: newTimezones,
          });
        }
      },
      
      removeTimezone: (tz) => {
        const { timezones, schedules, zoomLevel } = get();
        const newTimezones = timezones.filter(t => t !== tz);
        set({ timezones: newTimezones });
        debouncedSave(schedules, {
          zoomLevel,
          timezones: newTimezones,
        });
      },
      
      addTask: (date, task) => {
        const { schedules, zoomLevel, timezones } = get();
        const newTask: Task = { ...task, id: generateId() };
        const daySchedule = schedules[date] || { date, tasks: [] };
        
        const newSchedules = {
          ...schedules,
          [date]: {
            ...daySchedule,
            tasks: [...daySchedule.tasks, newTask],
          },
        };
        
        set({ schedules: newSchedules });
        debouncedSave(newSchedules, { zoomLevel, timezones });
      },
      
      updateTask: (date, taskId, updates) => {
        const { schedules, zoomLevel, timezones } = get();
        const daySchedule = schedules[date];
        if (!daySchedule) return;
        
        const newSchedules = {
          ...schedules,
          [date]: {
            ...daySchedule,
            tasks: daySchedule.tasks.map(t =>
              t.id === taskId ? { ...t, ...updates } : t
            ),
          },
        };
        
        set({ schedules: newSchedules });
        debouncedSave(newSchedules, { zoomLevel, timezones });
      },
      
      deleteTask: (date, taskId) => {
        const { schedules, zoomLevel, timezones } = get();
        const daySchedule = schedules[date];
        if (!daySchedule) return;
        
        const newSchedules = {
          ...schedules,
          [date]: {
            ...daySchedule,
            tasks: daySchedule.tasks.filter(t => t.id !== taskId),
          },
        };
        
        set({ schedules: newSchedules });
        debouncedSave(newSchedules, { zoomLevel, timezones });
      },
      
      toggleTaskComplete: (date, taskId) => {
        const { schedules, zoomLevel, timezones } = get();
        const daySchedule = schedules[date];
        if (!daySchedule) return;
        
        const newSchedules = {
          ...schedules,
          [date]: {
            ...daySchedule,
            tasks: daySchedule.tasks.map(t =>
              t.id === taskId ? { ...t, completed: !t.completed } : t
            ),
          },
        };
        
        set({ schedules: newSchedules });
        debouncedSave(newSchedules, { zoomLevel, timezones });
      },
      
      startPomodoro: (taskId) => {
        const { pomodoroTimeLeft, pomodoroWorkDuration, pomodoroIsBreak, pomodoroBreakDuration } = get();
        set({
          pomodoroActive: true,
          currentTaskId: taskId || null,
          pomodoroTimeLeft: pomodoroTimeLeft > 0 ? pomodoroTimeLeft : (pomodoroIsBreak ? pomodoroBreakDuration : pomodoroWorkDuration),
        });
      },
      
      pausePomodoro: () => set({ pomodoroActive: false }),
      
      resetPomodoro: () => {
        const { pomodoroWorkDuration } = get();
        set({
          pomodoroActive: false,
          pomodoroTimeLeft: pomodoroWorkDuration,
          pomodoroIsBreak: false,
        });
      },
      
      tickPomodoro: () => {
        const { pomodoroTimeLeft, pomodoroIsBreak, pomodoroWorkDuration, pomodoroBreakDuration } = get();
        
        if (pomodoroTimeLeft <= 1) {
          // Switch between work and break
          const newIsBreak = !pomodoroIsBreak;
          set({
            pomodoroIsBreak: newIsBreak,
            pomodoroTimeLeft: newIsBreak ? pomodoroBreakDuration : pomodoroWorkDuration,
            pomodoroActive: false, // Pause when switching
          });
        } else {
          set({ pomodoroTimeLeft: pomodoroTimeLeft - 1 });
        }
      },
      
      toggleFocusMode: () => {
        const { focusModeActive } = get();
        set({ focusModeActive: !focusModeActive });
      },
      
      setCurrentTask: (taskId) => set({ currentTaskId: taskId }),
    }),
    {
      name: 'gsd-storage',
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        zoomLevel: state.zoomLevel,
        timezones: state.timezones,
        schedules: state.schedules,
        pomodoroWorkDuration: state.pomodoroWorkDuration,
        pomodoroBreakDuration: state.pomodoroBreakDuration,
      }),
    }
  )
);

// Load from cloud on startup (call this in the main app)
export async function loadFromCloud() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return;
    
    const data = await res.json();
    if (data.source === 'redis' && data.schedules) {
      const currentState = useStore.getState();
      
      // Merge cloud data with local (cloud takes priority)
      useStore.setState({
        schedules: { ...currentState.schedules, ...data.schedules },
        ...(data.settings?.zoomLevel && { zoomLevel: data.settings.zoomLevel }),
        ...(data.settings?.timezones && { timezones: data.settings.timezones }),
      });
    }
  } catch (error) {
    console.error('Failed to load from cloud:', error);
  }
}
