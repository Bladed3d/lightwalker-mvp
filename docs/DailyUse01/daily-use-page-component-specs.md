# Lightwalker Daily Use Page - Component Specifications

**Based on Timeline-02.jpg Reference** | **Game UI Designer Agent** | **July 31, 2025**

## Component Architecture Overview

### 1. Main Layout Structure
```jsx
<DailyUsePage>
  <ChronosphereHeader />
  <HeroActivityDisplay />
  <InteractiveTimeline />
  <ContainerSystem>
    <RoleModelContainer />
    <ActivityFocusContainer />
  </ContainerSystem>
  <InspirationQuote />
</DailyUsePage>
```

---

## Core Component Specifications

### 1. ChronosphereHeader Component

**Purpose**: Replicate exact aesthetic from Timeline-02.jpg header
**Dependencies**: None

```tsx
interface ChronosphereHeaderProps {
  subtitle?: string;
}

// CSS Classes Required:
.chronosphere-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-title {
  font-size: 3rem;
  font-weight: 300;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #00d4ff, #4facfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.header-subtitle {
  font-size: 1rem;
  color: #4facfe;
  letter-spacing: 2px;
  text-transform: uppercase;
}
```

### 2. HeroActivityDisplay Component

**Purpose**: Central "current activity" display matching Timeline-02.jpg hero section
**Dependencies**: Activity data, real-time updates

```tsx
interface HeroActivityProps {
  activity: {
    name: string;
    icon: string;
    time: string;
    energyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
    roleModel: string;
  };
  isLive: boolean;
}

// Key CSS Classes:
.hero-activity {
  background: rgba(15, 20, 25, 0.8);
  border: 2px solid rgba(79, 172, 254, 0.5);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-activity::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.1), transparent);
  animation: shimmer 3s infinite;
}

.activity-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #4facfe, #00d4ff);
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  border: 3px solid rgba(79, 172, 254, 0.6);
  animation: pulse 2s infinite;
}
```

### 3. InteractiveTimeline Component

**Purpose**: Horizontal scrolling timeline with navigation controls (core feature from reference)
**Dependencies**: Timeline data, auto-scroll logic, manual navigation

```tsx
interface TimelineProps {
  activities: TimelineActivity[];
  currentTime: Date;
  autoScroll: boolean;
  onNavigate: (direction: 'prev' | 'next' | 'now') => void;
  onActivityClick: (activity: TimelineActivity) => void;
}

interface TimelineActivity {
  id: string;
  name: string;
  icon: string;
  startTime: Date;
  endTime: Date;
  status: 'completed' | 'current' | 'upcoming';
  roleModel: string;
}

// Core Timeline Styles:
.timeline-container {
  background: rgba(15, 20, 25, 0.6);
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 15px;
  padding: 30px 20px;
}

.timeline-strip {
  display: flex;
  align-items: center;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  position: relative;
  scroll-behavior: smooth;
}

.timeline-activity {
  flex-shrink: 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4facfe, #00d4ff);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.timeline-activity.current .timeline-icon {
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
  transform: scale(1.1);
}

.timeline-activity.completed .timeline-icon {
  background: linear-gradient(135deg, #51cf66, #40c057);
}
```

### 4. NavigationControls Component

**Purpose**: Exact match to Timeline-02.jpg navigation controls (arrows, play, NOW button)
**Dependencies**: Timeline navigation functions

```tsx
interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onNow: () => void;
  onPlay: () => void;
  isPlaying: boolean;
}

// Navigation Styles:
.timeline-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.control-btn {
  background: rgba(79, 172, 254, 0.2);
  border: 2px solid #4facfe;
  border-radius: 10px;
  padding: 15px 20px;
  color: #4facfe;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(79, 172, 254, 0.4);
  transform: translateY(-2px);
}

.now-btn {
  background: linear-gradient(45deg, #4facfe, #00d4ff);
  color: white;
  font-weight: 600;
  padding: 15px 30px;
}

.play-btn {
  background: linear-gradient(45deg, #00d4ff, #4facfe);
  color: white;
  font-size: 1.5rem;
}
```

### 5. ContainerSystem Component

**Purpose**: Escape from Tarkov inspired attribute containers
**Dependencies**: Role model data, attribute-to-activity mapping

```tsx
interface ContainerSystemProps {
  roleModels: RoleModelContainer[];
  activeContainer: string;
  onContainerSwitch: (containerId: string) => void;
}

interface RoleModelContainer {
  id: string;
  name: string;
  icon: string;
  attributes: AttributeItem[];
  isActive: boolean;
}

interface AttributeItem {
  id: string;
  name: string;
  icon: string;
  currentActivity: string;
  status: 'active' | 'upcoming' | 'completed';
  nextScheduled?: Date;
}

// Container Styles:
.container-system {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 40px;
}

.role-model-container {
  background: rgba(15, 20, 25, 0.8);
  border: 2px solid rgba(79, 172, 254, 0.3);
  border-radius: 15px;
  padding: 25px;
  transition: all 0.3s ease;
}

.role-model-container.active {
  border-color: #4facfe;
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
}

.attribute-item {
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  cursor: pointer;
}

.attribute-item.active {
  background: linear-gradient(45deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 83, 0.2));
  border-color: #ff6b6b;
}
```

---

## Animation Specifications

### 1. Auto-Scrolling Timeline
```css
@keyframes timelineFlow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-1px); }
}

.timeline-strip.auto-scroll {
  animation: timelineFlow 60s linear infinite;
}
```

### 2. Activity Status Indicators
```css
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: #ff6b6b;
  animation: pulse 1s infinite;
}

.status-indicator.upcoming {
  background: #ffd43b;
}

.status-indicator.completed {
  background: #51cf66;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}
```

### 3. Hero Activity Shimmer
```css
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.hero-activity::before {
  animation: shimmer 3s infinite;
}
```

---

## Responsive Design Specifications

### Desktop (1200px+)
- Full container system side-by-side
- Timeline shows 6-8 activities
- Large hero activity display (120px icons)
- Complete navigation controls

### Tablet (768px - 1199px)
- Stacked containers (single column)
- Timeline shows 4-6 activities
- Medium hero activity display (100px icons)
- Full navigation controls

### Mobile (< 768px)
- Single column layout
- Timeline shows 3-4 activities (horizontal scroll)
- Compact hero activity display (80px icons)
- Simplified navigation (essential buttons only)

```css
@media (max-width: 1199px) {
  .container-system {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .header-title {
    font-size: 2rem;
    letter-spacing: 2px;
  }
  
  .activity-icon {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
  
  .timeline-icon {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }
  
  .timeline-strip {
    gap: 15px;
    padding: 15px 0;
  }
}
```

---

## Integration Requirements

### 1. Data Flow
```tsx
// Main page state management
interface DailyUsePageState {
  currentActivity: Activity;
  timelineActivities: TimelineActivity[];
  roleModelContainers: RoleModelContainer[];
  autoScrollEnabled: boolean;
  currentTime: Date;
}

// Real-time updates
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date());
    updateActivityStatus();
    if (autoScrollEnabled) {
      scrollTimelineToCurrentTime();
    }
  }, 60000); // Update every minute
  
  return () => clearInterval(interval);
}, [autoScrollEnabled]);
```

### 2. Auto-Scroll Logic
```tsx
const scrollTimelineToCurrentTime = () => {
  const currentTimePosition = calculateTimePosition(currentTime);
  const timelineElement = timelineRef.current;
  
  timelineElement.scrollTo({
    left: currentTimePosition - (timelineElement.clientWidth / 2),
    behavior: 'smooth'
  });
};

const handleManualNavigation = (direction: 'prev' | 'next' | 'now') => {
  setAutoScrollEnabled(false);
  
  switch (direction) {
    case 'prev':
      scrollTimeline(-30 * 60 * 1000); // 30 minutes back
      break;
    case 'next':
      scrollTimeline(30 * 60 * 1000); // 30 minutes forward
      break;
    case 'now':
      setAutoScrollEnabled(true);
      scrollTimelineToCurrentTime();
      break;
  }
};
```

### 3. Container Interaction
```tsx
const handleContainerSwitch = (containerId: string) => {
  setActiveContainer(containerId);
  updateHeroActivity(getActiveActivityForContainer(containerId));
  trackContainerSwitch(containerId); // Analytics
};

const handleAttributeClick = (attributeId: string) => {
  expandAttributeDetails(attributeId);
  showActivityMapping(attributeId);
};
```

---

## Performance Optimization

### 1. Timeline Virtualization
- Only render visible timeline items + buffer
- Lazy load activity details on demand
- Cache rendered timeline segments

### 2. Animation Optimization
- Use `transform` instead of changing layout properties
- Enable GPU acceleration with `will-change: transform`
- Throttle scroll events to 60fps

### 3. Memory Management
- Cleanup intervals on component unmount
- Debounce timeline navigation events
- Optimize activity data structure

---

## Accessibility Features

### 1. Keyboard Navigation
- Tab through timeline activities
- Arrow keys for timeline navigation
- Enter/Space to activate buttons
- Escape to return to auto-scroll mode

### 2. Screen Reader Support
- ARIA labels for all interactive elements
- Live regions for activity updates
- Semantic HTML structure
- Alternative text for icons

### 3. Visual Accessibility
- High contrast mode support
- Reduced motion preferences
- Scalable text (up to 200%)
- Color-blind friendly status indicators

---

## Testing Requirements

### 1. Timeline Functionality
- Auto-scroll accuracy (1px per minute)
- Manual navigation precision
- NOW button snap behavior
- Activity status updates

### 2. Container System
- Attribute-to-activity mapping
- Container switching animations
- Status indicator updates
- Interactive feedback

### 3. Responsive Behavior
- Layout adaptation across breakpoints
- Touch interactions on mobile
- Gesture navigation
- Performance on low-end devices

---

This specification provides everything needed to implement the exact Timeline-02.jpg aesthetic with full interactive functionality. The design captures the "Chronosphere" vision while maintaining game-inspired UX patterns that engage users without overwhelming them.