import React from 'react';

interface TimePreviewTooltipProps {
  /** Whether the tooltip should be visible */
  isVisible: boolean;
  /** X position in pixels relative to viewport */
  x: number;
  /** Y position in pixels relative to viewport */
  y: number;
  /** Time string to display (e.g., "2:30 PM") */
  time: string;
  /** Optional activity name being dragged */
  activityName?: string;
}

/**
 * TimePreviewTooltip - Phase 2 Implementation
 * 
 * Shows a time preview tooltip when dragging activities over the timeline.
 * Follows the mouse cursor and displays the exact time where the activity would be dropped.
 * 
 * Design matches the existing green popup style from the timeline drop confirmation.
 */
export default function TimePreviewTooltip({ 
  isVisible, 
  x, 
  y, 
  time, 
  activityName 
}: TimePreviewTooltipProps) {
  if (!isVisible) return null;

  // Offset tooltip to avoid blocking cursor and provide better visibility
  const offsetX = 15;
  const offsetY = -35;

  return (
    <div
      className="fixed z-[1000] pointer-events-none transition-opacity duration-200"
      style={{
        left: `${x + offsetX}px`,
        top: `${y + offsetY}px`,
        transform: 'translateX(0)', // No centering since we want it offset from cursor
      }}
    >
      {/* Main tooltip container with green styling to match existing timeline elements */}
      <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-2xl border-2 border-green-300 animate-pulse">
        <div className="text-center whitespace-nowrap">
          <div className="text-xs opacity-90">Drop at</div>
          <div className="text-base font-black">{time}</div>
          {activityName && (
            <div className="text-xs opacity-80 mt-1">{activityName}</div>
          )}
        </div>
        
        {/* Arrow pointing down toward timeline */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-500" />
      </div>
    </div>
  );
}