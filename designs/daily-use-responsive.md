# Daily Use Page Responsive Design System

## Responsive Breakpoint Strategy

### Breakpoint Definitions
```css
:root {
  /* Mobile breakpoints */
  --bp-xs: 320px;   /* Small mobile phones */
  --bp-sm: 640px;   /* Large mobile phones */
  
  /* Tablet breakpoints */
  --bp-md: 768px;   /* Small tablets */
  --bp-lg: 1024px;  /* Large tablets / small laptops */
  
  /* Desktop breakpoints */
  --bp-xl: 1280px;  /* Desktop */
  --bp-2xl: 1536px; /* Large desktop */
  --bp-3xl: 1920px; /* Ultra-wide displays */
}
```

### Device-Specific Considerations
```typescript
interface DeviceCharacteristics {
  mobile: {
    screenSizes: '320px - 767px'
    interaction: 'touch'
    orientation: 'portrait | landscape'
    features: ['haptic', 'voice', 'camera', 'location']
    constraints: ['small_screen', 'limited_precision', 'one_hand_use']
  }
  
  tablet: {
    screenSizes: '768px - 1023px'
    interaction: 'touch | stylus'
    orientation: 'portrait | landscape'
    features: ['haptic', 'voice', 'camera', 'keyboard_optional']
    constraints: ['moderate_screen', 'variable_orientation']
  }
  
  desktop: {
    screenSizes: '1024px+'
    interaction: 'mouse | keyboard | touch'
    orientation: 'landscape'
    features: ['keyboard', 'mouse', 'multiple_monitors', 'voice_optional']
    constraints: ['large_screen', 'high_precision', 'multi_window']
  }
}
```

## 1. Mobile-First Layout (320px - 767px)

### Container Structure
```css
.daily-use-container {
  /* Mobile-first base styles */
  min-height: 100vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(180deg, 
    var(--lightwalker-blue-50) 0%, 
    #ffffff 100%);
}

.daily-use-container > * {
  width: 100%;
  max-width: none;
}
```

### Current Activity Card - Mobile
```css
.current-activity-card {
  /* Mobile optimizations */
  min-height: 240px;
  padding: 20px;
  border-radius: 16px;
  
  /* Touch-friendly spacing */
  --touch-target-min: 44px;
}

.current-activity-card .activity-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.current-activity-card .activity-controls button {
  min-height: var(--touch-target-min);
  padding: 12px 24px;
  font-size: 16px; /* Prevent iOS zoom on focus */
  border-radius: 12px;
}

/* Progress bar mobile optimization */
.activity-progress-container {
  margin: 16px 0;
}

.activity-progress-bar {
  height: 12px; /* Larger on mobile for visibility */
  border-radius: 6px;
}
```

### Timeline Panel - Mobile
```css
.timeline-panel {
  /* Mobile-specific timeline styles */
  padding: 16px;
  border-radius: 16px;
  max-height: 60vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
}

.timeline-item {
  padding: 16px 0;
  min-height: var(--touch-target-min);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.timeline-item-content {
  padding-left: 20px;
  margin-left: 20px;
  border-left: 3px solid #e5e7eb;
}

/* Mobile timeline expansion */
.timeline-item.expanded .timeline-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.timeline-quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.timeline-quick-actions button {
  flex: 1;
  min-width: 100px;
  min-height: 40px;
  font-size: 14px;
  border-radius: 8px;
}
```

### Quick Actions Grid - Mobile
```css
.quick-actions-grid {
  /* Mobile 2x3 grid */
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0;
}

.quick-action-item {
  aspect-ratio: 1;
  min-height: 80px;
  padding: 16px 12px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.quick-action-icon {
  font-size: 28px;
}

.quick-action-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.quick-action-count {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Floating Action Button - Mobile Only
```css
.floating-action-button {
  /* Only show on mobile */
  display: block;
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

.fab-primary {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  
  /* Ensure FAB is always touchable */
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
}

/* Safe area support for iPhone X+ */
@supports (padding: max(0px)) {
  .floating-action-button {
    bottom: max(24px, env(safe-area-inset-bottom));
    right: max(24px, env(safe-area-inset-right));
  }
}
```

## 2. Tablet Layout (768px - 1023px)

### Hybrid Layout Approach
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .daily-use-container {
    padding: 24px;
    gap: 24px;
    max-width: 100%;
  }
  
  /* Two-column layout for tablets */
  .daily-use-main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    grid-template-areas: 
      "activity timeline"
      "container actions";
  }
  
  .current-activity-card {
    grid-area: activity;
    min-height: 320px;
  }
  
  .timeline-panel {
    grid-area: timeline;
    max-height: 500px;
  }
  
  .lightwalker-container {
    grid-area: container;
  }
  
  .quick-actions-grid {
    grid-area: actions;
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* Hide FAB on tablet */
  .floating-action-button {
    display: none;
  }
}
```

### Tablet-Specific Interactions
```css
@media (min-width: 768px) and (max-width: 1023px) {
  /* Hover states for tablets with precise pointing */
  .timeline-item:hover {
    background: rgba(59, 130, 246, 0.04);
    border-radius: 12px;
    transform: translateX(4px);
  }
  
  .quick-action-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  /* Larger touch targets for tablet */
  .timeline-item {
    min-height: 48px;
    padding: 20px 0;
  }
  
  .quick-action-item {
    min-height: 100px;
    padding: 20px 16px;
  }
}
```

### Orientation Handling
```css
@media (min-width: 768px) and (max-width: 1023px) and (orientation: landscape) {
  /* Landscape tablet layout */
  .daily-use-main-content {
    grid-template-columns: 2fr 1fr;
    grid-template-areas: 
      "activity timeline"
      "container timeline"
      "actions timeline";
  }
  
  .timeline-panel {
    max-height: 70vh;
  }
}

@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  /* Portrait tablet layout */
  .daily-use-main-content {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "activity"
      "timeline"
      "container"
      "actions";
    gap: 20px;
  }
}
```

## 3. Desktop Layout (1024px+)

### Multi-Column Desktop Layout
```css
@media (min-width: 1024px) {
  .daily-use-container {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
    gap: 32px;
  }
  
  .daily-use-main-content {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 32px;
    grid-template-areas: 
      "left-panel timeline"
      "left-panel timeline";
  }
  
  .daily-use-left-panel {
    grid-area: left-panel;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .timeline-panel {
    grid-area: timeline;
    max-height: 80vh;
    min-height: 600px;
  }
  
  /* No FAB on desktop */
  .floating-action-button {
    display: none;
  }
}
```

### Desktop-Specific Enhancements
```css
@media (min-width: 1024px) {
  /* Enhanced hover states */
  .current-activity-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .timeline-item:hover {
    background: rgba(59, 130, 246, 0.04);
    border-radius: 12px;
    transform: translateX(8px);
    cursor: pointer;
  }
  
  /* Larger content areas */
  .current-activity-card {
    min-height: 400px;
    padding: 32px;
  }
  
  .timeline-panel {
    padding: 24px;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .quick-action-item {
    min-height: 120px;
    padding: 24px 20px;
  }
}
```

### Ultra-Wide Display Support
```css
@media (min-width: 1536px) {
  .daily-use-container {
    max-width: 1600px;
  }
  
  .daily-use-main-content {
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-areas: 
      "left-panel timeline right-panel";
  }
  
  .daily-use-right-panel {
    grid-area: right-panel;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  /* Move some content to right panel for better balance */
  .lightwalker-container {
    /* Move to right panel */
  }
  
  .timeline-panel {
    min-height: 700px;
  }
}
```

## 4. Dynamic Sizing and Fluid Typography

### Responsive Typography Scale
```css
:root {
  /* Fluid typography using clamp() */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
  --text-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem);
  --text-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);
}

/* Apply fluid typography */
.heading-primary {
  font-size: var(--text-4xl);
}

.heading-secondary {
  font-size: var(--text-2xl);
}

.body-text {
  font-size: var(--text-base);
}
```

### Container Query Support
```css
/* Modern container queries for component-level responsiveness */
@supports (container-type: inline-size) {
  .current-activity-card {
    container-type: inline-size;
  }
  
  @container (max-width: 300px) {
    .activity-controls {
      flex-direction: column;
      gap: 8px;
    }
    
    .activity-controls button {
      font-size: 14px;
      padding: 10px 16px;
    }
  }
  
  @container (min-width: 400px) {
    .activity-controls {
      flex-direction: row;
      gap: 12px;
    }
  }
}

.timeline-panel {
  container-type: inline-size;
}

@container (max-width: 350px) {
  .timeline-item-content {
    padding-left: 16px;
    margin-left: 16px;
  }
  
  .timeline-quick-actions {
    flex-direction: column;
    gap: 8px;
  }
}
```

## 5. Responsive Images and Assets

### Responsive Image System
```css
/* High-DPI display support */
.role-model-avatar {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-size: cover;
  background-position: center;
}

@media (min-resolution: 2dppx) {
  .role-model-avatar {
    /* Use higher resolution images for retina displays */
    background-image: url('avatar@2x.jpg');
  }
}

@media (min-resolution: 3dppx) {
  .role-model-avatar {
    background-image: url('avatar@3x.jpg');
  }
}
```

### SVG Icon Scaling
```css
.icon {
  /* SVG icons scale perfectly */
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}

.icon-small { font-size: 16px; }
.icon-medium { font-size: 24px; }
.icon-large { font-size: 32px; }

/* Responsive icon sizing */
@media (max-width: 768px) {
  .quick-action-icon {
    font-size: 28px;
  }
}

@media (min-width: 1024px) {
  .quick-action-icon {
    font-size: 36px;
  }
}
```

## 6. Performance Optimizations

### Layout Shift Prevention
```css
/* Prevent cumulative layout shift */
.timeline-item {
  min-height: 80px; /* Reserve space before content loads */
}

.current-activity-card {
  min-height: 240px; /* Prevent shifting during load */
}

.skeleton-loader {
  /* Maintain exact dimensions during loading */
  width: 100%;
  height: 240px;
  border-radius: 16px;
}
```

### GPU Acceleration for Smooth Animations
```css
.gpu-optimized {
  /* Force GPU acceleration */
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Apply to animated elements */
.timeline-item,
.quick-action-item,
.current-activity-card {
  @extend .gpu-optimized;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations for users who prefer reduced motion */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Keep essential feedback, remove decorative animations */
  .progress-bar {
    transition: width 0.2s ease;
  }
  
  .floating-action-button,
  .quick-action-item {
    transform: none !important;
  }
}
```

## 7. Accessibility Responsive Features

### Focus Management Across Breakpoints
```css
/* Focus indicators scale with content */
.focusable:focus {
  outline: 2px solid var(--lightwalker-blue-500);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .focusable:focus {
    outline-width: 3px; /* Thicker outline on mobile */
    outline-offset: 3px;
  }
}
```

### Skip Links for Different Layouts
```css
.skip-links {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 1000;
}

.skip-link {
  display: inline-block;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}

/* Different skip links for different layouts */
@media (max-width: 767px) {
  .skip-links::after {
    content: "Mobile layout active";
  }
}

@media (min-width: 1024px) {
  .skip-links::after {
    content: "Desktop layout active";
  }
}
```

## 8. Print Styles

### Print-Friendly Timeline
```css
@media print {
  .daily-use-container {
    background: white !important;
    box-shadow: none !important;
    padding: 0;
  }
  
  .floating-action-button,
  .quick-actions-grid {
    display: none !important;
  }
  
  .timeline-panel {
    box-shadow: none !important;
    border: 1px solid #ccc;
    page-break-inside: avoid;
  }
  
  .timeline-item {
    page-break-inside: avoid;
    margin-bottom: 16px;
  }
  
  .current-activity-card {
    border: 1px solid #ccc;
    box-shadow: none !important;
    page-break-inside: avoid;
  }
  
  /* Print URLs for external links */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }
}
```

This comprehensive responsive design system ensures the Daily Use page provides optimal experiences across all device types, from small mobile phones to ultra-wide desktop displays, while maintaining accessibility and performance standards.