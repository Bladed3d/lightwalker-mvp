/**
 * Debug Panel for Lightwalker Development
 * 
 * Provides a real-time view of all system events and state changes
 * with Redux DevTools-style time travel debugging.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventTrace } from '../../lib/debug/event-tracer';

export function DebugPanel() {
  if (process.env.NODE_ENV !== 'development') return null;

  const [isOpen, setIsOpen] = useState(false);
  const [traces, setTraces] = useState<Map<string, EventTrace[]>>(new Map());
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).__LIGHTWALKER_TRACE__) {
        setTraces(new Map((window as any).__LIGHTWALKER_TRACE__));
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const filteredTraces = Array.from(traces.entries()).filter(([key, events]) => 
    key.toLowerCase().includes(filter.toLowerCase()) ||
    events.some(e => e.source.toLowerCase().includes(filter.toLowerCase()) ||
                    e.action.toLowerCase().includes(filter.toLowerCase()))
  );

  const notificationTraces = filteredTraces.filter(([key]) => 
    key.includes('notification') || key.includes('enabled')
  );

  const clearAll = () => {
    if ((window as any).__LIGHTWALKER_TRACE__) {
      (window as any).__LIGHTWALKER_TRACE__.clear();
      setTraces(new Map());
    }
  };

  const exportTraces = () => {
    const data = Array.from(traces.entries()).map(([key, events]) => ({
      eventId: key,
      events: events.map(e => ({
        ...e,
        timestamp: new Date(e.timestamp).toISOString()
      }))
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lightwalker-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-mono text-sm transition-colors"
        title="Open Debug Panel"
      >
        🐛 Debug {traces.size > 0 && `(${traces.size})`}
      </button>

      {isOpen && (
        <div className="fixed bottom-16 left-4 w-[600px] h-[500px] bg-gray-900 text-green-400 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">🔍 Lightwalker Debug Panel</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportTraces}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                >
                  Export
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm text-white"
                >
                  ×
                </button>
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Filter events..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-green-400 focus:outline-none"
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs">
            {notificationTraces.length > 0 && (
              <div className="mb-6">
                <h4 className="text-yellow-400 font-bold mb-2">🔔 NOTIFICATION EVENTS (Most Recent)</h4>
                {notificationTraces.slice(-3).map(([key, events]) => (
                  <details key={key} className="mb-3 bg-gray-800 rounded p-2" open>
                    <summary className="cursor-pointer hover:text-green-300 font-semibold">
                      {key} ({events.length} events)
                    </summary>
                    <div className="ml-4 mt-2 space-y-2">
                      {events.slice(-5).map((e: EventTrace, i: number) => (
                        <div key={i} className="border-l-2 border-blue-500 pl-3 py-1 bg-gray-900 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400">{new Date(e.timestamp).toLocaleTimeString()}</span>
                            <span className="text-yellow-400">{e.action}</span>
                            <span className="text-blue-400">{e.source}</span>
                          </div>
                          {e.data && (
                            <pre className="text-gray-300 text-xs overflow-auto max-h-20">
                              {JSON.stringify(e.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}

            <h4 className="text-white font-bold mb-2">📋 ALL EVENTS</h4>
            {filteredTraces.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No events found {filter && `matching "${filter}"`}
              </div>
            ) : (
              filteredTraces.map(([key, events]) => (
                <details key={key} className="mb-2 bg-gray-800 rounded p-2">
                  <summary className="cursor-pointer hover:text-green-300">
                    <span className="font-semibold">{key}</span>
                    <span className="text-gray-400 ml-2">({events.length} events)</span>
                  </summary>
                  <div className="ml-4 mt-2">
                    {events.slice(-10).map((e: EventTrace, i: number) => (
                      <div key={i} className="mb-2 text-xs border-l border-gray-600 pl-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                          <span className="text-yellow-400">{e.action}</span>
                          <span className="text-blue-400">{e.source}</span>
                        </div>
                        {e.data && (
                          <pre className="text-gray-300 mt-1 overflow-auto max-h-16">
                            {JSON.stringify(e.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-700 bg-gray-800 rounded-b-lg text-xs text-gray-400">
            Console: <code>__LIGHTWALKER_TRACE__</code> | <code>__LIGHTWALKER_NOTIFICATIONS_DEBUG__</code>
          </div>
        </div>
      )}
    </>
  );
}