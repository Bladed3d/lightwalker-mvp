import React, { useEffect, useRef, useState } from 'react';
import './liquid-grid-css.css';

interface PinLight {
  id: string;
  color: string;
  position: number;
  tailLength: number;
  duration: number;
}

const LiquidGridAnimation: React.FC = () => {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridSquares, setGridSquares] = useState<number[]>([]);
  const [pinLights, setPinLights] = useState<PinLight[]>([]);
  const activeAnimationsRef = useRef<Set<number>>(new Set());
  const activeLightsRef = useRef<Set<string>>(new Set());

  // Initialize grid
  useEffect(() => {
    const calculateGrid = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      const squareSize = 40;
      const cols = Math.floor(containerWidth / squareSize);
      const rows = Math.floor(containerHeight / squareSize);
      const totalSquares = cols * rows;
      
      setGridSquares(Array.from({ length: totalSquares }, (_, i) => i));
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  // Liquid fill animations
  useEffect(() => {
    const colors = ['cyan', 'orange', 'red', 'yellow', 'purple'];
    const speeds = ['slow', 'medium', 'fast'];
    const maxConcurrentAnimations = 20;
    const speedDurations: Record<string, number> = {
      'slow': 3000,
      'medium': 2000,
      'fast': 1200
    };

    const animateSquare = (index: number) => {
      if (activeAnimationsRef.current.has(index)) return;
      
      activeAnimationsRef.current.add(index);
      const square = document.querySelector(`[data-index="${index}"]`) as HTMLElement;
      if (!square) return;

      const color = colors[Math.floor(Math.random() * colors.length)];
      const speed = speeds[Math.floor(Math.random() * speeds.length)];
      const liquidFill = square.querySelector('.liquid-fill') as HTMLElement;
      
      liquidFill.classList.add(color);
      square.classList.add(color);
      
      if (Math.random() < 0.2) {
        liquidFill.classList.add('has-wave');
      }
      
      square.classList.add(`animating-${speed}`);
      
      setTimeout(() => {
        square.classList.remove(`animating-${speed}`, color);
        liquidFill.classList.remove(color, 'has-wave');
        activeAnimationsRef.current.delete(index);
      }, speedDurations[speed]);
    };

    const startAnimations = () => {
      // Initial animations
      for (let i = 0; i < maxConcurrentAnimations; i++) {
        setTimeout(() => {
          const availableSquares = gridSquares.filter(i => !activeAnimationsRef.current.has(i));
          if (availableSquares.length > 0) {
            const randomIndex = availableSquares[Math.floor(Math.random() * availableSquares.length)];
            animateSquare(randomIndex);
          }
        }, i * 100 + Math.random() * 500);
      }

      // Continuous animations
      const interval = setInterval(() => {
        if (activeAnimationsRef.current.size < maxConcurrentAnimations) {
          const numToStart = Math.min(4, maxConcurrentAnimations - activeAnimationsRef.current.size);
          
          for (let i = 0; i < numToStart; i++) {
            setTimeout(() => {
              const availableSquares = gridSquares.filter(i => !activeAnimationsRef.current.has(i));
              if (availableSquares.length > 0) {
                const randomIndex = availableSquares[Math.floor(Math.random() * availableSquares.length)];
                animateSquare(randomIndex);
              }
            }, i * 50 + Math.random() * 300);
          }
        }
      }, 200);

      return () => clearInterval(interval);
    };

    if (gridSquares.length > 0) {
      const cleanup = startAnimations();
      return cleanup;
    }
  }, [gridSquares]);

  // Pin light animations
  useEffect(() => {
    const colors = ['white', 'cyan', 'orange'];
    const maxConcurrentLights = 12;
    const gridSize = 40;
    
    const gridLinePositions: number[] = [];
    for (let x = 0; x <= window.innerWidth; x += gridSize) {
      gridLinePositions.push(x);
    }

    const spawnLight = () => {
      if (activeLightsRef.current.size >= maxConcurrentLights) return;
      
      const id = `light-${Date.now()}-${Math.random()}`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const position = gridLinePositions[Math.floor(Math.random() * gridLinePositions.length)];
      const tailLength = 160 + Math.random() * 140;
      const duration = 1.5 + Math.random() * 2;
      
      activeLightsRef.current.add(id);
      
      setPinLights(prev => [...prev, { id, color, position, tailLength, duration }]);
      
      setTimeout(() => {
        setPinLights(prev => prev.filter(light => light.id !== id));
        activeLightsRef.current.delete(id);
      }, duration * 1000);
    };

    // Initial spawn
    spawnLight();
    
    // Continuous spawning
    const interval = setInterval(() => {
      if (activeLightsRef.current.size < maxConcurrentLights) {
        const spawnCount = Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < spawnCount; i++) {
          setTimeout(() => spawnLight(), i * 150);
        }
      }
    }, 200 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid-container" ref={gridContainerRef}>
      <div className="grid">
        {gridSquares.map((index) => (
          <div key={index} className="grid-square" data-index={index}>
            <div className="liquid-fill"></div>
          </div>
        ))}
      </div>
      
      {pinLights.map((light) => (
        <div
          key={light.id}
          className={`pin-light animating ${light.color !== 'white' ? light.color : ''}`}
          style={{
            left: `${light.position - 1}px`,
            height: `${light.tailLength}px`,
            bottom: `-${light.tailLength + 50}px`,
            animationDuration: `${light.duration}s`,
            width: '2px'
          }}
        />
      ))}
      
      <div className="content-overlay">
        <h1>Character Design</h1>
        <p>Create Your Lightwalker</p>
      </div>
    </div>
  );
};

export default LiquidGridAnimation;