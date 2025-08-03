# Daily Use Page Visual Design System

## Brand Color Palette

### Primary Colors (from existing Lightwalker system)
```css
:root {
  /* Core Brand Colors */
  --lightwalker-blue-50: #f0f9ff;
  --lightwalker-blue-100: #e0f2fe;
  --lightwalker-blue-500: #3b82f6;
  --lightwalker-blue-600: #2563eb;
  
  --lightwalker-purple-50: #faf5ff;
  --lightwalker-purple-100: #f3e8ff;
  --lightwalker-purple-500: #8b5cf6;
  --lightwalker-purple-600: #7c3aed;
  
  /* Supporting Colors */
  --lightwalker-emerald-50: #ecfdf5;
  --lightwalker-emerald-500: #10b981;
  --lightwalker-emerald-600: #059669;
  
  --lightwalker-amber-50: #fffbeb;
  --lightwalker-amber-100: #fef3c7;
  --lightwalker-amber-500: #f59e0b;
  --lightwalker-amber-600: #d97706;
}
```

### Semantic Color System
```css
:root {
  /* Activity Status Colors */
  --status-completed: #10b981;
  --status-active: #f59e0b;
  --status-upcoming: #3b82f6;
  --status-planned: #6b7280;
  --status-overdue: #ef4444;
  
  /* Activity Status Backgrounds */
  --status-completed-bg: rgba(16, 185, 129, 0.1);
  --status-active-bg: rgba(245, 158, 11, 0.1);
  --status-upcoming-bg: rgba(59, 130, 246, 0.1);
  --status-planned-bg: rgba(107, 114, 128, 0.1);
  --status-overdue-bg: rgba(239, 68, 68, 0.1);
  
  /* Gamification Colors */
  --discovery-points: #8b5cf6;
  --level-progress: linear-gradient(90deg, #10b981, #3b82f6);
  --achievement-gold: #f59e0b;
  --streak-fire: #ef4444;
}
```

## Typography System

### Font Stack
```css
:root {
  --font-primary: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
}
```

### Typography Scale
```css
.text-scale {
  /* Headlines */
  --text-6xl: 3.75rem; /* 60px - Page titles */
  --text-5xl: 3rem;    /* 48px - Section headers */
  --text-4xl: 2.25rem; /* 36px - Card titles */
  --text-3xl: 1.875rem; /* 30px - Activity titles */
  --text-2xl: 1.5rem;  /* 24px - Timeline headers */
  --text-xl: 1.25rem;  /* 20px - Subheadings */
  
  /* Body Text */
  --text-lg: 1.125rem; /* 18px - Large body */
  --text-base: 1rem;   /* 16px - Default body */
  --text-sm: 0.875rem; /* 14px - Small body */
  --text-xs: 0.75rem;  /* 12px - Captions */
}

/* Responsive Typography */
@media (max-width: 768px) {
  .text-scale {
    --text-6xl: 2.5rem;
    --text-5xl: 2rem;
    --text-4xl: 1.75rem;
    --text-3xl: 1.5rem;
  }
}
```

### Typography Classes
```css
.heading-primary {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: #111827;
}

.heading-secondary {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.3;
  color: #374151;
}

.body-large {
  font-family: var(--font-primary);
  font-size: var(--text-lg);
  font-weight: 400;
  line-height: 1.6;
  color: #4b5563;
}

.body-default {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.5;
  color: #6b7280;
}

.caption {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.4;
  color: #9ca3af;
}
```

## Component Visual Specifications

### 1. Current Activity Card
```css
.current-activity-card {
  /* Background with subtle gradient */
  background: linear-gradient(135deg, 
    var(--lightwalker-blue-50) 0%, 
    #ffffff 50%, 
    var(--lightwalker-purple-50) 100%);
  
  /* Elevated shadow system */
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24),
    0 0 0 1px rgba(59, 130, 246, 0.05);
  
  /* Border radius matching brand */
  border-radius: 20px;
  
  /* Responsive padding */
  padding: clamp(16px, 4vw, 32px);
  
  /* Subtle border highlight */
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.current-activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(59, 130, 246, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2. Timeline Visual System
```css
.timeline-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.timeline-item {
  position: relative;
  padding: 20px 24px;
  border-left: 3px solid #e5e7eb;
  margin-left: 24px;
  transition: all 0.2s ease;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -9px;
  top: 28px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 1px #e5e7eb;
  z-index: 2;
}

/* Status-specific timeline styling */
.timeline-item.completed {
  border-left-color: var(--status-completed);
}

.timeline-item.completed::before {
  background: var(--status-completed);
  box-shadow: 0 0 0 1px var(--status-completed);
}

.timeline-item.active {
  border-left-color: var(--status-active);
  background: var(--status-active-bg);
}

.timeline-item.active::before {
  background: var(--status-active);
  box-shadow: 
    0 0 0 1px var(--status-active),
    0 0 0 4px rgba(245, 158, 11, 0.2);
  animation: timeline-pulse 2s ease-in-out infinite;
}

@keyframes timeline-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### 3. Role Model Container
```css
.lightwalker-container {
  background: linear-gradient(135deg, 
    var(--lightwalker-amber-50) 0%, 
    var(--lightwalker-amber-100) 100%);
  border: 2px solid var(--lightwalker-amber-500);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.lightwalker-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, 
    rgba(245, 158, 11, 0.05) 0%, 
    transparent 70%);
  animation: subtle-rotate 20s linear infinite;
}

@keyframes subtle-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.influence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  position: relative;
  z-index: 1;
}

.influence-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.influence-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.2);
}
```

## Progress and Gamification Elements

### Progress Bar System
```css
.progress-container {
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: var(--level-progress);
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.4) 50%, 
    transparent 100%);
  animation: progress-shimmer 2s ease-in-out infinite;
}

@keyframes progress-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Discovery Points Display
```css
.discovery-points {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, 
    var(--lightwalker-purple-500), 
    var(--lightwalker-blue-500));
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: var(--text-sm);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.discovery-points-icon {
  font-size: 16px;
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
}
```

## Interactive States

### Hover States
```css
.interactive-element {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.interactive-element:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.12);
}

.interactive-element:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}
```

### Focus States (Accessibility)
```css
.focusable {
  outline: none;
  border-radius: 4px;
  transition: box-shadow 0.2s ease;
}

.focusable:focus {
  box-shadow: 
    0 0 0 2px #ffffff,
    0 0 0 4px var(--lightwalker-blue-500);
}

.focusable:focus:not(:focus-visible) {
  box-shadow: none;
}
```

## Loading and Skeleton States

### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(90deg, 
    #f3f4f6 25%, 
    #e5e7eb 50%, 
    #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-wave {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-activity-card {
  height: 280px;
  border-radius: 20px;
}

.skeleton-timeline-item {
  height: 80px;
  margin: 16px 0;
  border-radius: 12px;
}
```

## Responsive Design Tokens

### Breakpoint System
```css
:root {
  --bp-xs: 320px;   /* Small mobile */
  --bp-sm: 640px;   /* Large mobile */
  --bp-md: 768px;   /* Tablet */
  --bp-lg: 1024px;  /* Desktop */
  --bp-xl: 1280px;  /* Large desktop */
  --bp-2xl: 1536px; /* Extra large */
}
```

### Spacing Scale
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
}
```

## Dark Mode Considerations

### Dark Mode Variables
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    
    --border-primary: #334155;
    --border-secondary: #475569;
  }
  
  .current-activity-card {
    background: linear-gradient(135deg, 
      var(--bg-secondary) 0%, 
      var(--bg-tertiary) 100%);
    border-color: var(--border-primary);
  }
  
  .timeline-container {
    background: var(--bg-secondary);
    border-color: var(--border-primary);
  }
}
```

## Animation Performance

### GPU Acceleration
```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.reduce-motion {
  transition: none !important;
  animation: none !important;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This visual design system provides comprehensive styling guidelines that maintain consistency with Lightwalker's existing brand while introducing sophisticated gamification and interaction patterns for the Daily Use page.