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

  const getBehaviorStyle = (status: string) => {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Half - Chat Interface */}
          <div className="bg-gray-900/50 rounded-lg border border-cyan-800/30 p-4">
            <div className="h-[600px] flex flex-col">
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

          {/* Right Half - HUD and Status */}
          <div className="space-y-6">
            {/* Lightwalker Status HUD */}
            <div className="bg-gray-900/50 rounded-lg border border-cyan-800/30 p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4 text-center">Lightwalker Status</h2>
              
              <div className="flex flex-col items-center">
                {/* Circular HUD */}
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40">
                    {/* Outer glow when speaking */}
                    {isLightwalkerSpeaking && (
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl animate-pulse" />
                    )}
                    
                    {/* Outer rotating ring with segments */}
                    <div className="absolute inset-0 rounded-full animate-spin-slow">
                      <svg className="w-full h-full" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="78" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="15 5" opacity="0.6" />
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
                    <div className="absolute inset-2 rounded-full animate-spin-reverse-slow">
                      <svg className="w-full h-full" viewBox="0 0 144 144">
                        <circle cx="72" cy="72" r="70" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="8 3" opacity="0.7" />
                        {/* Pin lights on this ring */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                          <circle
                            key={angle}
                            cx={72 + 70 * Math.cos((angle - 90) * Math.PI / 180)}
                            cy={72 + 70 * Math.sin((angle - 90) * Math.PI / 180)}
                            r="3"
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
                    <div className="absolute inset-4 rounded-full animate-spin-fast">
                      <svg className="w-full h-full" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="62" fill="none" stroke="#0891b2" strokeWidth="1" strokeDasharray="4 8" opacity="0.5" />
                      </svg>
                    </div>
                    
                    {/* Fourth ring with segments - very slow */}
                    <div className="absolute inset-6 rounded-full animate-spin-very-slow">
                      <svg className="w-full h-full" viewBox="0 0 112 112">
                        <path d="M 56 10 A 46 46 0 0 1 102 56" fill="none" stroke="#c084fc" strokeWidth="2" opacity="0.8" />
                        <path d="M 102 56 A 46 46 0 0 1 56 102" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.8" />
                        <path d="M 56 102 A 46 46 0 0 1 10 56" fill="none" stroke="#c084fc" strokeWidth="2" opacity="0.8" />
                        <path d="M 10 56 A 46 46 0 0 1 56 10" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.8" />
                      </svg>
                    </div>
                    
                    {/* Fifth inner ring - medium speed reverse */}
                    <div className="absolute inset-8 rounded-full animate-spin-reverse-medium">
                      <svg className="w-full h-full" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="45" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
                        {/* Additional accent marks */}
                        {[0, 90, 180, 270].map((angle) => (
                          <line
                            key={angle}
                            x1={48 + 40 * Math.cos((angle - 90) * Math.PI / 180)}
                            y1={48 + 40 * Math.sin((angle - 90) * Math.PI / 180)}
                            x2={48 + 45 * Math.cos((angle - 90) * Math.PI / 180)}
                            y2={48 + 45 * Math.sin((angle - 90) * Math.PI / 180)}
                            stroke="#c084fc"
                            strokeWidth="2"
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
                          className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(103,232,249,0.8)]"
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
                          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
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
                          ? 'w-24 h-24 bg-gradient-to-r from-cyan-500/40 to-purple-500/40 animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.6)]' 
                          : 'w-20 h-20 bg-cyan-600/20'
                      }`}>
                        <div className={`rounded-full transition-all duration-300 flex items-center justify-center ${
                          isLightwalkerSpeaking 
                            ? 'w-16 h-16 bg-cyan-400/60' 
                            : 'w-12 h-12 bg-cyan-500/40'
                        }`}>
                          {/* Inner pattern when speaking */}
                          {isLightwalkerSpeaking && (
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/30 via-transparent to-purple-300/30 animate-spin-slow" />
                            </div>
                          )}
                          <Activity className={`transition-all duration-300 z-10 ${
                            isLightwalkerSpeaking 
                              ? 'w-10 h-10 text-cyan-200' 
                              : 'w-8 h-8 text-cyan-400'
                          }`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Status indicator - Compass style */}
                    <div 
                      className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.8)]"
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
                          width: `${3 - idx * 0.5}px`,
                          height: `${3 - idx * 0.5}px`,
                          backgroundColor: `rgba(74, 222, 128, ${0.3 - idx * 0.1})`,
                          left: `${50 + 48 * Math.cos((compassAngle - offset - 90) * Math.PI / 180)}%`,
                          top: `${50 + 48 * Math.sin((compassAngle - offset - 90) * Math.PI / 180)}%`,
                          transform: 'translate(-50%, -50%)',
                          transition: 'none',
                        }}
                      />
                    ))}
                  </div>
                  
                  <p className="mt-3 text-cyan-400 font-medium">
                    {isLightwalkerSpeaking ? 'Speaking...' : 'Active'}
                  </p>
                  <p className="text-cyan-600 text-sm">Currently: Morning Routine</p>
                </div>

                {/* Additional Status Info */}
                <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="text-center">
                    <p className="text-cyan-600 text-sm">Sync Level</p>
                    <div className="mt-1 bg-gray-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full" style={{width: '78%'}} />
                    </div>
                    <p className="text-cyan-300 mt-1">78%</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-cyan-600 text-sm">Active Streak</p>
                    <p className="text-cyan-300 text-2xl font-bold">14</p>
                    <p className="text-cyan-600 text-xs">days 🔥</p>
                  </div>
                </div>

                {/* Character Influences */}
                <div className="mt-6 w-full max-w-sm">
                  <p className="text-cyan-600 text-sm mb-2 text-center">Character Matrix</p>
                  <div className="space-y-2">
                    {influences.map((influence, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-lg">{influence.avatar}</span>
                        <div className="flex-1">
                          <div className="bg-gray-800 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                              style={{width: `${influence.influence}%`}}
                            />
                          </div>
                        </div>
                        <span className="text-cyan-500 text-xs">{influence.influence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Behavior Inventory Grid - moved below HUD */}
            <div className="bg-gray-900/50 rounded-lg border border-cyan-800/30 p-6 mt-6 hidden lg:block">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-cyan-300">Quick Actions</h2>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {behaviors.slice(0, 4).map((behavior) => (
                  <div
                    key={behavior.id}
                    onClick={() => behavior.status !== 'locked' && setSelectedBehavior(behavior)}
                    className={`relative aspect-square border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${getBehaviorStyle(behavior.status)}`}
                  >
                    <div className="text-2xl text-center mb-1">{behavior.icon}</div>
                    <p className="text-xs text-center text-cyan-300 leading-tight">{behavior.name}</p>
                    {behavior.streak > 0 && (
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {behavior.streak}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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