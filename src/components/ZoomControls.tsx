'use client';

import { ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ZOOM_LEVELS } from '@/lib/types';

export function ZoomControls() {
  const { zoomLevel, zoomIn, zoomOut } = useStore();
  
  const canZoomIn = ZOOM_LEVELS.indexOf(zoomLevel) > 0;
  const canZoomOut = ZOOM_LEVELS.indexOf(zoomLevel) < ZOOM_LEVELS.length - 1;
  
  const getZoomLabel = () => {
    if (zoomLevel >= 60) return `${zoomLevel / 60}hr`;
    return `${zoomLevel}min`;
  };

  return (
    <div 
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{ background: 'var(--surface)' }}
    >
      <button
        onClick={zoomIn}
        disabled={!canZoomIn}
        className="btn btn-ghost p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Zoom in"
      >
        <ZoomIn size={18} />
      </button>
      
      <span 
        className="text-sm font-mono min-w-[50px] text-center"
        style={{ color: 'var(--foreground-muted)' }}
      >
        {getZoomLabel()}
      </span>
      
      <button
        onClick={zoomOut}
        disabled={!canZoomOut}
        className="btn btn-ghost p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Zoom out"
      >
        <ZoomOut size={18} />
      </button>
    </div>
  );
}

