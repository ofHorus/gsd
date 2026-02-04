'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatTimeInZone, getTimezoneName } from '@/lib/utils';

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function TimezoneHeader() {
  const { timezones, addTimezone, removeTimezone } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const availableTimezones = COMMON_TIMEZONES.filter(tz => !timezones.includes(tz));

  return (
    <div className="flex items-center gap-6">
      {timezones.map((tz) => (
        <div key={tz} className="flex items-center gap-2 group">
          <div className="flex flex-col">
            <span 
              className="text-lg font-mono font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {formatTimeInZone(currentTime, tz)}
            </span>
            <span 
              className="text-xs"
              style={{ color: 'var(--foreground-subtle)' }}
            >
              {getTimezoneName(tz)}
            </span>
          </div>
          {timezones.length > 1 && (
            <button
              onClick={() => removeTimezone(tz)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20"
              aria-label={`Remove ${getTimezoneName(tz)}`}
            >
              <X size={12} style={{ color: 'var(--urgency-critical)' }} />
            </button>
          )}
        </div>
      ))}
      
      {/* Add timezone button */}
      <div className="relative">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-ghost p-2"
          aria-label="Add timezone"
        >
          <Plus size={16} />
        </button>
        
        {showAdd && (
          <div 
            className="absolute top-full left-0 mt-2 py-2 rounded-lg shadow-lg z-50 min-w-[180px]"
            style={{ 
              background: 'var(--surface)',
              border: '1px solid var(--border)'
            }}
          >
            {availableTimezones.length === 0 ? (
              <p className="px-3 py-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                No more timezones
              </p>
            ) : (
              availableTimezones.map((tz) => (
                <button
                  key={tz}
                  onClick={() => {
                    addTimezone(tz);
                    setShowAdd(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {getTimezoneName(tz)}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
