import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

const LightwalkerHUD = () => {
  const [isLightwalkerSpeaking, setIsLightwalkerSpeaking] = useState(false);
  const [compassAngle, setCompassAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);

  // Simulate Lightwalker speaking (remove this for production)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLightwalkerSpeaking(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
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

  return (
    <div className="flex flex-col items-center">
      {/* CSS Animations */}
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
  );
};

export default LightwalkerHUD;