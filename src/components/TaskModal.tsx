'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '@/store/useStore';
import { Task, TASK_COLORS } from '@/lib/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: Date | null;
  editingTask: Task | null;
}

const DURATION_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 25, label: '25 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
  { value: 90, label: '1.5 hr' },
  { value: 120, label: '2 hr' },
  { value: 180, label: '3 hr' },
  { value: 240, label: '4 hr' },
];

export function TaskModal({ isOpen, onClose, selectedTime, editingTask }: TaskModalProps) {
  const { selectedDate, addTask, updateTask, deleteTask } = useStore();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(25);
  const [color, setColor] = useState(TASK_COLORS[0]);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDuration(editingTask.duration);
        setColor(editingTask.color);
      } else {
        setTitle('');
        setDuration(25);
        setColor(TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)]);
      }
    }
  }, [isOpen, editingTask]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedTime) return;
    
    if (editingTask) {
      updateTask(selectedDate, editingTask.id, {
        title: title.trim(),
        duration,
        color,
      });
    } else {
      addTask(selectedDate, {
        title: title.trim(),
        startTime: selectedTime.toISOString(),
        duration,
        color,
        completed: false,
      });
    }
    
    onClose();
  };
  
  const handleDelete = () => {
    if (editingTask) {
      deleteTask(selectedDate, editingTask.id);
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-xl shadow-lg p-6"
        style={{ background: 'var(--background-elevated)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Time indicator */}
        {selectedTime && (
          <div 
            className="mb-4 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--surface)' }}
          >
            <span style={{ color: 'var(--foreground-muted)' }}>Starting at </span>
            <span className="font-mono font-medium">{format(selectedTime, 'HH:mm')}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm mb-1.5"
              style={{ color: 'var(--foreground-muted)' }}
            >
              What are you working on?
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter task title..."
              autoFocus
            />
          </div>
          
          {/* Duration */}
          <div>
            <label 
              className="block text-sm mb-1.5"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className="px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: duration === opt.value ? 'var(--accent)' : 'var(--surface)',
                    color: duration === opt.value ? '#000' : 'var(--foreground-muted)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color */}
          <div>
            <label 
              className="block text-sm mb-1.5"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Color
            </label>
            <div className="flex gap-2">
              {TASK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: color === c ? '2px solid var(--foreground)' : 'none',
                    outlineOffset: '2px',
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            {editingTask ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-ghost text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
                Delete
              </button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTask ? 'Save' : 'Add Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

