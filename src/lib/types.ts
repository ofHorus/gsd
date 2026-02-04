export type ZoomLevel = 5 | 15 | 30 | 60 | 120 | 240; // minutes

export interface Task {
  id: string;
  title: string;
  startTime: string; // ISO string
  duration: number; // minutes
  color: string;
  completed: boolean;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  tasks: Task[];
}

export interface AppState {
  // Data
  selectedDate: string;
  zoomLevel: ZoomLevel;
  timezones: string[];
  schedules: Record<string, DaySchedule>;
  
  // Pomodoro
  pomodoroActive: boolean;
  pomodoroTimeLeft: number; // seconds
  pomodoroWorkDuration: number; // seconds
  pomodoroBreakDuration: number; // seconds
  pomodoroIsBreak: boolean;
  
  // UI
  focusModeActive: boolean;
  currentTaskId: string | null;
  
  // Actions
  setSelectedDate: (date: string) => void;
  setZoomLevel: (level: ZoomLevel) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  addTimezone: (tz: string) => void;
  removeTimezone: (tz: string) => void;
  addTask: (date: string, task: Omit<Task, 'id'>) => void;
  updateTask: (date: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (date: string, taskId: string) => void;
  toggleTaskComplete: (date: string, taskId: string) => void;
  startPomodoro: (taskId?: string) => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  toggleFocusMode: () => void;
  setCurrentTask: (taskId: string | null) => void;
}

export const ZOOM_LEVELS: ZoomLevel[] = [5, 15, 30, 60, 120, 240];

export const TASK_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export const DEFAULT_TIMEZONES = [
  'America/New_York',
  'Europe/London', 
  'Asia/Tokyo',
];

