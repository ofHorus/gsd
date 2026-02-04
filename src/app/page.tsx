'use client';

import { useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import { DateSidebar } from '@/components/DateSidebar';
import { TimezoneHeader } from '@/components/TimezoneHeader';
import { TimeBlockGrid } from '@/components/TimeBlockGrid';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { FocusOverlay } from '@/components/FocusOverlay';
import { loadFromCloud } from '@/store/useStore';

export default function Home() {
  // Load data from cloud on mount
  useEffect(() => {
    loadFromCloud();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DateSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with timezone and user */}
        <div 
          className="h-16 border-b flex items-center justify-between px-4"
          style={{ 
            background: 'var(--background-elevated)',
            borderColor: 'var(--border)'
          }}
        >
          <TimezoneHeader />
          
          {/* User button */}
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              }
            }}
          />
        </div>
        
        {/* Time block grid */}
        <TimeBlockGrid />
      </div>
      
      {/* Pomodoro timer (floating) */}
      <PomodoroTimer />
      
      {/* Focus mode overlay */}
      <FocusOverlay />
    </div>
  );
}
