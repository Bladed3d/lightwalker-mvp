'use client';

import React from 'react';
import SimpleAccurateTimeline from '@/components/daily-use/SimpleAccurateTimeline';

export default function TimelineTestPage() {
  const [currentTime, setCurrentTime] = React.useState(() => new Date());

  // Update time every second for server monitoring
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Timeline Accuracy Test</h1>
          <p className="text-slate-400">Testing drag accuracy with original working timeline logic</p>
          
          {/* Server Status */}
          <div className="mt-4 text-center">
            <div className="text-lg font-mono text-cyan-400">{currentTime.toLocaleTimeString()}</div>
            <div className="text-sm text-green-400">🟢 Server Live</div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Test Instructions:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Drag Test:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Drag timeline to 8:00p position</li>
                <li>• Left panel should show exactly 8:00p</li>
                <li>• No offset (like 7:39p) should occur</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">NOW Button Test:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Click NOW button</li>
                <li>• Timeline should center on current time</li>
                <li>• Left panel time should match server time above</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Timeline Component */}
        <SimpleAccurateTimeline />

        {/* Debug Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Based on original working timeline • Fixed 4px/min scale • No zoom complexity
          </p>
        </div>

      </div>
    </div>
  );
}