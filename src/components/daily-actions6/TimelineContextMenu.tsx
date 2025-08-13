import React from 'react';

interface TimelineContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  activity: any;
  onRemove: () => void;
  onSetAlert: () => void;
  onEdit: () => void;
  onMoveTime?: () => void;
  onClose: () => void;
}

const TimelineContextMenu: React.FC<TimelineContextMenuProps> = ({
  isVisible,
  position,
  activity,
  onRemove,
  onSetAlert,
  onEdit,
  onMoveTime,
  onClose
}) => {
  if (!isVisible) return null;

  // Calculate menu position with boundary checking
  const menuWidth = 160;
  const menuHeight = 160;
  
  let adjustedX = position.x;
  let adjustedY = position.y - 60; // Position above cursor by default
  
  // Boundary checking to ensure menu stays within viewport
  if (adjustedX + menuWidth > window.innerWidth) {
    adjustedX = window.innerWidth - menuWidth - 10;
  }
  if (adjustedX < 10) {
    adjustedX = 10;
  }
  if (adjustedY < 10) {
    adjustedY = position.y + 20; // Position below cursor if not enough space above
  }
  if (adjustedY + menuHeight > window.innerHeight) {
    adjustedY = window.innerHeight - menuHeight - 10;
  }

  return (
    <>
      {/* Click outside overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-transparent"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="fixed bg-slate-800 border-2 border-red-500 rounded-lg shadow-xl z-[9999] animate-in fade-in duration-150"
        style={{
          left: `${adjustedX}px`,
          top: `${adjustedY}px`,
          minWidth: `${menuWidth}px`
        }}
      >
        {/* Menu Header */}
        <div className="px-4 py-2 border-b border-slate-600 bg-slate-700 rounded-t-lg">
          <div className="text-xs text-slate-300 font-medium truncate">
            {activity?.title || activity?.name || 'Activity'}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {activity?.scheduledTime || activity?.time || 'No time'}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {/* Edit Activity */}
          <button
            className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-slate-700 hover:text-green-300 transition-colors flex items-center gap-2"
            onClick={() => {
              onEdit();
              onClose();
            }}
          >
            <span className="text-green-500">✏️</span>
            Edit Activity
          </button>

          {/* Set Alert */}
          <button
            className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-slate-700 hover:text-yellow-300 transition-colors flex items-center gap-2"
            onClick={() => {
              onSetAlert();
              onClose();
            }}
          >
            <span className="text-yellow-500">🔔</span>
            Set Alert
          </button>

          {/* Set Repeat (kept as Set Repeat for backward compatibility) */}
          <button
            className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-slate-700 hover:text-blue-300 transition-colors flex items-center gap-2"
            onClick={() => {
              onSetAlert(); // Use the same handler for now, can be separated later
              onClose();
            }}
          >
            <span className="text-blue-500">🔄</span>
            Set Repeat
          </button>

          {/* Move Time (Phase 5 placeholder) */}
          {onMoveTime && (
            <button
              className="w-full px-4 py-2 text-left text-sm text-purple-400 hover:bg-slate-700 hover:text-purple-300 transition-colors flex items-center gap-2"
              onClick={() => {
                onMoveTime();
                onClose();
              }}
            >
              <span className="text-purple-500">⏰</span>
              Move Time
            </button>
          )}

          {/* Separator */}
          <div className="border-t border-slate-600 my-1" />

          {/* Remove Item */}
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors flex items-center gap-2"
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            <span className="text-red-500">⊗</span>
            Remove from Timeline
          </button>
        </div>

        {/* Menu Footer with shortcuts hint */}
        <div className="px-4 py-2 border-t border-slate-600 bg-slate-700 rounded-b-lg">
          <div className="text-xs text-slate-500">
            Right-click for quick actions
          </div>
        </div>
      </div>
    </>
  );
};

export default TimelineContextMenu;