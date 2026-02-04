'use client';

import { useState, useMemo, useEffect } from 'react';
import { parseISO, setHours, setMinutes, format } from 'date-fns';
import { useStore } from '@/store/useStore';
import { Task } from '@/lib/types';
import { getBlocksForDay, getGridColumns, getBlockHeight, getTasksInBlock } from '@/lib/utils';
import { TimeBlock } from './TimeBlock';
import { TaskModal } from './TaskModal';
import { ZoomControls } from './ZoomControls';
import { formatDisplayDate } from '@/lib/utils';

export function TimeBlockGrid() {
  const { selectedDate, zoomLevel, schedules } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [, setTick] = useState(0);
  
  // Force re-render every minute to update current block
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  
  const blocks = useMemo(() => {
    const baseBlocks = getBlocksForDay(zoomLevel);
    const selectedDateObj = parseISO(selectedDate);
    
    // Adjust block times to selected date
    return baseBlocks.map(block => ({
      ...block,
      time: setMinutes(
        setHours(selectedDateObj, block.time.getHours()),
        block.time.getMinutes()
      ),
    }));
  }, [zoomLevel, selectedDate]);
  
  const columns = getGridColumns(zoomLevel);
  const blockHeight = getBlockHeight(zoomLevel);
  
  const tasks = schedules[selectedDate]?.tasks || [];
  
  const handleAddTask = (time: Date) => {
    setSelectedTime(time);
    setEditingTask(null);
    setModalOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedTime(parseISO(task.startTime));
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTime(null);
    setEditingTask(null);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Grid header */}
      <div 
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <h1 className="text-xl font-semibold">
            {formatDisplayDate(selectedDate)}
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        
        <ZoomControls />
      </div>
      
      {/* Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div 
          className="grid gap-3"
          style={{ 
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {blocks.map((block, index) => {
            const blockTasks = getTasksInBlock(tasks, block.time, zoomLevel, selectedDate);
            
            return (
              <TimeBlock
                key={index}
                time={block.time}
                label={block.label}
                tasks={blockTasks}
                zoomLevel={zoomLevel}
                height={blockHeight}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
              />
            );
          })}
        </div>
      </div>
      
      {/* Task modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        selectedTime={selectedTime}
        editingTask={editingTask}
      />
    </div>
  );
}

