import { format, startOfDay, addMinutes, isSameDay, parseISO } from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';
import { ZoomLevel, Task } from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE, MMM d');
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatTimeInZone(date: Date, timezone: string): string {
  const zonedDate = toZonedTime(date, timezone);
  return formatTz(zonedDate, 'HH:mm', { timeZone: timezone });
}

export function getTimezoneName(timezone: string): string {
  return timezone.split('/').pop()?.replace(/_/g, ' ') || timezone;
}

export function getBlocksForDay(zoomLevel: ZoomLevel): { time: Date; label: string }[] {
  const blocks: { time: Date; label: string }[] = [];
  const today = startOfDay(new Date());
  const totalMinutes = 24 * 60;
  
  for (let mins = 0; mins < totalMinutes; mins += zoomLevel) {
    const time = addMinutes(today, mins);
    blocks.push({
      time,
      label: formatTime(time),
    });
  }
  
  return blocks;
}

export function getGridColumns(zoomLevel: ZoomLevel): number {
  switch (zoomLevel) {
    case 240: return 3;  // 6 blocks, 2 rows
    case 120: return 4;  // 12 blocks, 3 rows
    case 60: return 6;   // 24 blocks, 4 rows
    case 30: return 6;   // 48 blocks, 8 rows
    case 15: return 4;   // 96 blocks, 24 rows
    case 5: return 4;    // 288 blocks, 72 rows (scrollable)
    default: return 6;
  }
}

export function getBlockHeight(zoomLevel: ZoomLevel): number {
  switch (zoomLevel) {
    case 240: return 200;
    case 120: return 150;
    case 60: return 120;
    case 30: return 100;
    case 15: return 90;
    case 5: return 80;
    default: return 100;
  }
}

export function getTasksInBlock(
  tasks: Task[],
  blockTime: Date,
  zoomLevel: ZoomLevel,
  selectedDate: string
): Task[] {
  const blockStart = blockTime.getTime();
  const blockEnd = addMinutes(blockTime, zoomLevel).getTime();
  
  return tasks.filter(task => {
    const taskDate = parseISO(task.startTime);
    if (!isSameDay(taskDate, parseISO(selectedDate))) return false;
    
    const taskStart = taskDate.getTime();
    const taskEnd = addMinutes(taskDate, task.duration).getTime();
    
    // Task overlaps with this block
    return taskStart < blockEnd && taskEnd > blockStart;
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getUrgencyColor(percentRemaining: number): string {
  if (percentRemaining > 50) return 'var(--urgency-safe)';
  if (percentRemaining > 25) return 'var(--urgency-warning)';
  if (percentRemaining > 10) return 'var(--urgency-danger)';
  return 'var(--urgency-critical)';
}

export function getDaysArray(centerDate: Date, pastDays: number = 7, futureDays: number = 14): Date[] {
  const days: Date[] = [];
  const start = new Date(centerDate);
  start.setDate(start.getDate() - pastDays);
  
  for (let i = 0; i < pastDays + futureDays + 1; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  
  return days;
}

