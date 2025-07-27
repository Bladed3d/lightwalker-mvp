import { Activity, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const LightwalkerDashboard = () => {
  const [isLightwalkerSpeaking, setIsLightwalkerSpeaking] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [compassAngle, setCompassAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);

  // Simulate Lightwalker speaking
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLightwalkerSpeaking(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compass movement logic
  useEffect(() => {
    // Set new target positions periodically
    const targetInterval = setInterval(() => {
      // Sometimes make small adjustments, sometimes larger movements
      const isSmallAdjustment = Math.random() > 0.3;
      if (isSmallAdjustment) {
        // Small adjustment - move 10-40 degrees
        const adjustment = (Math.random() - 0.5) * 40;
        setTargetAngle(current => {
          let newAngle = current + adjustment;
          if (newAngle < 0) newAngle += 360;
          if (newAngle > 360) newAngle -= 360;
          return newAngle;
        });
      } else {
        // Larger movement to new position
        setTargetAngle(Math.random() * 360);
      }
    }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds

    return () => clearInterval(targetInterval);
  }, []);

  useEffect(() => {
    // Smooth compass movement
    const animationInterval = setInterval(() => {
      setCompassAngle(current => {
        let diff = targetAngle - current;
        
        // Handle wrap-around for shortest path
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        // Easing function - move faster when far, slower when close
        const distance = Math.abs(diff);
        const speed = distance > 30 ? 0.08 : 0.03; // Faster for large movements
        const movement = diff * speed;
        
        // Add small random fluctuation for realism (more when close to target)
        const fluctuationScale = distance < 10 ? 0.3 : 0.1;
        const fluctuation = (Math.random() - 0.5) * fluctuationScale;
        
        let newAngle = current + movement + fluctuation;
        
        // Keep angle between 0-360
        if (newAngle < 0) newAngle += 360;
        if (newAngle > 360) newAngle -= 360;
        
        return newAngle;
      });
    }, 50); // Update 20 times per second for smooth motion

    return () => clearInterval(animationInterval);
  }, [targetAngle]);

  // Sample copied behaviors data
  const behaviors = [
    { id: 1, name: "Morning Meditation", icon: "🧘", streak: 7, lastCopied: "today", status: "active", category: "mindfulness" },
    { id: 2, name: "Gratitude Practice", icon: "🙏", streak: 3, lastCopied: "today", status: "active", category: "mindfulness" },
    { id: 3, name: "Evening Journal", icon: "📝", streak: 5, lastCopied: "yesterday", status: "active", category: "reflection" },
    { id: 4, name: "Workout Routine", icon: "💪", streak: 2, lastCopied: "today", status: "active", category: "health" },
    { id: 5, name: "Reading Time", icon: "📚", streak: 0, lastCopied: "3 days ago", status: "inactive", category: "growth" },
    { id: 6, name: "Cold Shower", icon: "🚿", streak: 1, lastCopied: "today", status: "new", category: "health" },
    { id: 7, name: "No Phone Morning", icon: "📵", streak: 0, lastCopied: "never", status: "locked", category: "discipline" },
    { id: 8, name: "Creative Hour", icon: "🎨", streak: 0, lastCopied: "never", status: "locked", category: "creativity" },
  ];

  // Character influences
  const influences = [
    { name: "Marcus Aurelius", role: "Stoic Wisdom", influence: 35, avatar: "🏛️" },
    { name: "Einstein", role: "Curious Mind", influence: 25, avatar: "🧠" },
    { name: "Maya Angelou", role: "Compassion", influence: 20, avatar: "❤️" },
    { name: "Custom", role: "Your Values", influence: 20, avatar: "✨" },
  ];

  // Weekly progress data
  const weeklyData = [
    { day: "Mon", accuracy: 85 },
    { day: "Tue", accuracy: 92 },
    { day: "Wed", accuracy: 78 },
    { day: "Thu", accuracy: 88 },
    { day: "Fri", accuracy: 95 },
    { day: "Sat", accuracy: 82 },
    { day: "Sun", accuracy: 90 },
  ];

  const getBehaviorStyle = (status) => {
    switch(status) {
      case 'active': return 'bg-cyan-900/40 border-cyan-500/50 hover:bg-cyan-900/60';
      case 'inactive': return 'bg-gray-800/40 border-gray-600/50 hover:bg-gray-800/60';
      case 'new': return 'bg-purple-900/40 border-purple-500/50 hover:bg-purple-900/60 animate-pulse';
      case 'locked': return 'bg-gray-900/40 border-gray-700/50 opacity-50 cursor-not-allowed';
      default: return 'bg-gray-800/40 border-gray-600/50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-cyan-100 p-4">
      {/* Add CSS animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 18s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-fast 10s linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 40s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 30s linear infinite;
        }
        .animate-spin-reverse-medium {
          animation: spin-reverse 12s linear infinite;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-300">Lightwalker Command Center</h1>
            <p className="text-cyan-600 mt-1">Copying Activity Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-cyan-400 text-sm">Current Session</p>
            <p className="text-2xl font-mono text-cyan-300">{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Left Half - Split into two sections */}
          <div className="flex flex-col gap-6">
            {/* Chat Interface - Top 50% */}
            <div className="bg-gray-900/50 rounded-lg border border-cyan-800/30 p-4 flex-1">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-cyan-300">Lightwalker Chat</h2>
                  <div className={`w-3 h-3 rounded-full ${isLightwalkerSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                </div>
                
                {/* Chat messages */}
                <div className="flex-1 bg-gray-950/50 rounded-lg p-4 mb-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-cyan-300 font-medium">Lightwalker</p>
                        <p className="text-cyan-100 mt-1">Good morning! I just finished my meditation session. Starting the day with clarity always helps me approach challenges with a calm mind. 🧘</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-purple-300 font-medium text-right">You</p>
                        <p className="text-gray-100 mt-1 text-right">That's inspiring! I've been wanting to start meditating but always feel too restless.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-cyan-300 font-medium">Lightwalker</p>
                        <p className="text-cyan-100 mt-1">I understand that feeling! When I started, even 2 minutes felt long. Now I'm heading out for my morning run - movement helps channel that restless energy. 🏃</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat input */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask your Lightwalker anything..."
                    className="flex-1 bg-gray-800/50 border border-cyan-700/30 rounded-lg px-4 py-2 text-cyan-100 placeholder-cyan-700 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom 50% of left side - placeholder for future content */}
            <div className="bg-gray-900/50 rounded-lg border border-cyan-800/30 p-4 flex-1">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Additional Panel</h2>
              <div className="text-cyan-600">Content coming soon...</div>
            </div>
          </div>

          {/* Right Half - Split into two sections */}
          <div className="flex flex-col gap-6">
            {/* HUD Display - Top 50% */}
            <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg border border-cyan-800/30 p-4 flex-1">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Lightwalker Status</h2>
              
              {/* Circular HUD - Dynamically sized */}
              <div className="relative w-full h-full max-w-sm max-h-sm aspect-square flex items-center justify-center">
                <div className="relative w-64 h-64">
              {/* Outer glow when speaking */}
              {isLightwalkerSpeaking && (
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse" />
              )}
              
              {/* Outer rotating ring with segments */}
              <div className="absolute inset-0 rounded-full animate-spin-slow">
                <svg className="w-full h-full" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" r="124" fill="none" stroke="url(#gradient1)" strokeWidth="3" strokeDasharray="20 8" opacity="0.6" />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Second ring - counter rotating */}
              <div className="absolute inset-3 rounded-full animate-spin-reverse-slow">
                <svg className="w-full h-full" viewBox="0 0 232 232">
                  <circle cx="116" cy="116" r="112" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="12 4" opacity="0.7" />
                  {/* Pin lights on this ring */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                    <circle
                      key={angle}
                      cx={116 + 112 * Math.cos((angle - 90) * Math.PI / 180)}
                      cy={116 + 112 * Math.sin((angle - 90) * Math.PI / 180)}
                      r="4"
                      fill="#67e8f9"
                      opacity={isLightwalkerSpeaking ? 0.9 : 0.5}
                      className={isLightwalkerSpeaking ? 'animate-pulse' : ''}
                      style={{
                        animationDelay: `${idx * 0.1}s`
                      }}
                    />
                  ))}
                </svg>
              </div>
              
              {/* Third ring - fast rotation */}
              <div className="absolute inset-6 rounded-full animate-spin-fast">
                <svg className="w-full h-full" viewBox="0 0 208 208">
                  <circle cx="104" cy="104" r="100" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="6 12" opacity="0.5" />
                </svg>
              </div>
              
              {/* Fourth ring with segments - very slow */}
              <div className="absolute inset-10 rounded-full animate-spin-very-slow">
                <svg className="w-full h-full" viewBox="0 0 176 176">
                  <path d="M 88 15 A 73 73 0 0 1 161 88" fill="none" stroke="#c084fc" strokeWidth="3" opacity="0.8" />
                  <path d="M 161 88 A 73 73 0 0 1 88 161" fill="none" stroke="#06b6d4" strokeWidth="3" opacity="0.8" />
                  <path d="M 88 161 A 73 73 0 0 1 15 88" fill="none" stroke="#c084fc" strokeWidth="3" opacity="0.8" />
                  <path d="M 15 88 A 73 73 0 0 1 88 15" fill="none" stroke="#06b6d4" strokeWidth="3" opacity="0.8" />
                </svg>
              </div>
              
              {/* Fifth inner ring - medium speed reverse */}
              <div className="absolute inset-12 rounded-full animate-spin-reverse-medium">
                <svg className="w-full h-full" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="76" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.4" />
                  {/* Additional accent marks */}
                  {[0, 90, 180, 270].map((angle) => (
                    <line
                      key={angle}
                      x1={80 + 68 * Math.cos((angle - 90) * Math.PI / 180)}
                      y1={80 + 68 * Math.sin((angle - 90) * Math.PI / 180)}
                      x2={80 + 76 * Math.cos((angle - 90) * Math.PI / 180)}
                      y2={80 + 76 * Math.sin((angle - 90) * Math.PI / 180)}
                      stroke="#c084fc"
                      strokeWidth="3"
                      opacity="0.8"
                    />
                  ))}
                </svg>
              </div>
              
              {/* Floating pin lights */}
              <div className="absolute inset-0 animate-spin-reverse">
                {[30, 120, 210, 300].map((angle, idx) => (
                  <div
                    key={angle}
                    className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.8)]"
                    style={{
                      left: `${50 + 40 * Math.cos((angle - 90) * Math.PI / 180)}%`,
                      top: `${50 + 40 * Math.sin((angle - 90) * Math.PI / 180)}%`,
                      animationDelay: `${idx * 0.2}s`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </div>
              
              {/* Additional floating particles */}
              <div className="absolute inset-0 animate-spin-slow">
                {[60, 150, 240, 330].map((angle, idx) => (
                  <div
                    key={`inner-${angle}`}
                    className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                    style={{
                      left: `${50 + 25 * Math.cos((angle - 90) * Math.PI / 180)}%`,
                      top: `${50 + 25 * Math.sin((angle - 90) * Math.PI / 180)}%`,
                      animationDelay: `${idx * 0.3}s`,
                      transform: 'translate(-50%, -50%)',
                      opacity: isLightwalkerSpeaking ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
              
              {/* Center - grows and shrinks when speaking */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`rounded-full flex items-center justify-center transition-all duration-500 ${
                  isLightwalkerSpeaking 
                    ? 'w-32 h-32 bg-gradient-to-r from-cyan-500/40 to-purple-500/40 animate-pulse shadow-[0_0_40px_rgba(34,211,238,0.6)]' 
                    : 'w-28 h-28 bg-cyan-600/20'
                }`}>
                  <div className={`rounded-full transition-all duration-300 flex items-center justify-center ${
                    isLightwalkerSpeaking 
                      ? 'w-24 h-24 bg-cyan-400/60' 
                      : 'w-20 h-20 bg-cyan-500/40'
                  }`}>
                    {/* Inner pattern when speaking */}
                    {isLightwalkerSpeaking && (
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/30 via-transparent to-purple-300/30 animate-spin-slow" />
                      </div>
                    )}
                    <Activity className={`transition-all duration-300 z-10 ${
                      isLightwalkerSpeaking 
                        ? 'w-16 h-16 text-cyan-200' 
                        : 'w-12 h-12 text-cyan-400'
                    }`} />
                  </div>
                </div>
              </div>
              
              {/* Status indicator - Compass style */}
              <div 
                className="absolute w-4 h-4 bg-green-400 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.8)]"
                style={{
                  left: `${50 + 48 * Math.cos((compassAngle - 90) * Math.PI / 180)}%`,
                  top: `${50 + 48 * Math.sin((compassAngle - 90) * Math.PI / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'none', // No CSS transition, we handle smoothing in JS
                }}
              >
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-green-300 rounded-full animate-pulse" style={{ transform: 'scale(0.5)' }} />
              </div>
              
              {/* Compass trail effect */}
              {[8, 16, 24].map((offset, idx) => (
                <div 
                  key={idx}
                  className="absolute rounded-full"
                  style={{
                    width: `${4 - idx * 0.8}px`,
                    height: `${4 - idx * 0.8}px`,
                    backgroundColor: `rgba(74, 222, 128, ${0.3 - idx * 0.1})`,
                    left: `${50 + 48 * Math.cos((compassAngle - offset - 90) * Math.PI / 180)}%`,
                    top: `${50 + 48 * Math.sin((compassAngle - offset - 90) * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)',
                    transition: 'none',
                  }}
                />
              ))}
            </div>
                </div>
              </div>
            
              <p className="mt-4 text-cyan-400 font-medium">
                {isLightwalkerSpeaking ? 'Speaking...' : 'Active'}
              </p>
              <p className="text-cyan-600 text-sm">Currently: Morning Routine</p>
              
              {/* Simple stats below */}
              <div className="mt-4 flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-300">78%</p>
                  <p className="text-cyan-600 text-xs">Sync Level</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-300">14</p>
                  <p className="text-cyan-600 text-xs">Day Streak 🔥</p>
                </div>
              </div>
            </div>

            {/* Bottom 50% of right side - placeholder for future content */}
            <div className="bg-gray-900/50 rounded-lg border border-cyan-800/30 p-4 flex-1">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Analytics</h2>
              <div className="text-cyan-600">Performance metrics coming soon...</div>
            </div>
          </div>
        </div>

        {/* Selected Behavior Modal */}
        {selectedBehavior && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBehavior(null)}>
            <div className="bg-gray-900 border border-cyan-600/50 rounded-lg p-6 max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-cyan-300">{selectedBehavior.name}</h3>
                <button onClick={() => setSelectedBehavior(null)} className="text-gray-400 hover:text-cyan-300">✕</button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-600">Current Streak:</span>
                  <span className="text-cyan-300 font-bold">{selectedBehavior.streak} days 🔥</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-600">Last Copied:</span>
                  <span className="text-cyan-300">{selectedBehavior.lastCopied}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-600">Category:</span>
                  <span className="text-cyan-300 capitalize">{selectedBehavior.category}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-cyan-600 mb-2">Lightwalker's Approach:</p>
                  <p className="text-gray-300 text-sm">
                    "I find that {selectedBehavior.name.toLowerCase()} helps me maintain balance and clarity throughout my day. 
                    It's become a natural part of who I am, not something I force myself to do."
                  </p>
                </div>
                
                <button className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">
                  Mark as Copied Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LightwalkerDashboard;