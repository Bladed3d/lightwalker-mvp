# Daily Use Page Component Specifications

## Component Architecture

### Core Components Hierarchy
```
DailyUsePage
├── CurrentActivityCard
├── DailyTimelinePanel
├── LightwalkerContainer
├── QuickActionsGrid
└── FloatingActionButton (mobile)
```

## 1. CurrentActivityCard Component

### Props Interface
```typescript
interface CurrentActivityCardProps {
  activity: {
    id: string
    name: string
    description: string
    icon: string
    timeRemaining: number
    totalDuration: number
    roleModelInfluence: {
      name: string
      method: string
      avatar: string
    }
    status: 'active' | 'paused' | 'completed'
  }
  onStart: () => void
  onPause: () => void
  onComplete: () => void
  onSkip: () => void
}
```

### Visual Specifications
```css
.current-activity-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 24px;
  min-height: 280px;
  position: relative;
  overflow: hidden;
}

.current-activity-card::before {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 18px;
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
}

.activity-progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.activity-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.role-model-method {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
  font-style: italic;
}
```

### Animation States
```css
.activity-card-pulse {
  animation: gentle-pulse 3s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); }
  50% { transform: scale(1.02); box-shadow: 0 8px 30px rgba(59, 130, 246, 0.25); }
}

.activity-transition-enter {
  opacity: 0;
  transform: translateY(20px);
}

.activity-transition-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.4s ease-out;
}
```

## 2. DailyTimelinePanel Component

### Props Interface
```typescript
interface TimelineItem {
  id: string
  time: string
  title: string
  description: string
  icon: string
  status: 'completed' | 'active' | 'upcoming' | 'planned'
  estimatedPoints: number
  activities: string[]
  roleModelInfluences: RoleModelInfluence[]
  expanded?: boolean
}

interface DailyTimelinePanelProps {
  items: TimelineItem[]
  onItemClick: (itemId: string) => void
  onStartActivity: (itemId: string) => void
  onReschedule: (itemId: string) => void
}
```

### Visual Specifications
```css
.timeline-panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  border-left: 3px solid #e2e8f0;
  margin-left: 20px;
  padding-left: 24px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 20px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 3px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.timeline-item.completed::before {
  background: #10b981;
  box-shadow: 0 0 0 1px #10b981;
}

.timeline-item.active::before {
  background: #f59e0b;
  box-shadow: 0 0 0 1px #f59e0b;
  animation: timeline-pulse 2s ease-in-out infinite;
}

.timeline-item.upcoming::before {
  background: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

@keyframes timeline-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

### Responsive Behavior
```css
@media (max-width: 768px) {
  .timeline-panel {
    padding: 16px;
  }
  
  .timeline-item {
    margin-left: 16px;
    padding-left: 20px;
  }
  
  .timeline-expanded-content {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    margin-top: 12px;
  }
}

@media (min-width: 1024px) {
  .timeline-item:hover {
    background: rgba(59, 130, 246, 0.02);
    border-radius: 12px;
    margin-left: 16px;
    padding-left: 28px;
    transition: all 0.2s ease;
  }
}
```

## 3. LightwalkerContainer Component

### Props Interface
```typescript
interface RoleModelInfluence {
  id: string
  name: string
  commonName: string
  avatar: string
  influencePercentage: number
  primaryColor: string
  secondaryColor: string
  currentAttributes: string[]
}

interface LightwalkerContainerProps {
  influences: RoleModelInfluence[]
  totalAttributes: number
  activeInfluences: string[]
  onInfluenceClick: (influenceId: string) => void
}
```

### Visual Specifications
```css
.lightwalker-container {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 20px;
  padding: 20px;
  min-height: 200px;
}

.influence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.influence-item {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.influence-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.influence-item.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.influence-percentage {
  font-size: 24px;
  font-weight: bold;
  color: #374151;
  margin-top: 8px;
}

.influence-avatar {
  font-size: 36px;
  margin-bottom: 8px;
}
```

### Dynamic Color System
```typescript
const generateInfluenceStyle = (influence: RoleModelInfluence) => ({
  borderColor: influence.primaryColor,
  background: `linear-gradient(135deg, ${influence.primaryColor}15, ${influence.secondaryColor}15)`,
  '--accent-color': influence.primaryColor
})
```

## 4. QuickActionsGrid Component

### Props Interface
```typescript
interface QuickAction {
  id: string
  title: string
  icon: string
  description: string
  count?: number
  color: string
  route: string
  shortcut?: string
}

interface QuickActionsGridProps {
  actions: QuickAction[]
  onActionClick: (actionId: string) => void
  layout: 'grid' | 'horizontal' | 'vertical'
}
```

### Visual Specifications
```css
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 20px;
}

.quick-action-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.quick-action-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--action-color);
}

.quick-action-item:active {
  transform: translateY(-2px);
  transition: transform 0.1s ease;
}

.quick-action-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.quick-action-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
}
```

### Responsive Grid Behavior
```css
@media (max-width: 480px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .quick-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 5. FloatingActionButton Component (Mobile)

### Props Interface
```typescript
interface FloatingActionButtonProps {
  primaryAction: string
  secondaryActions?: QuickAction[]
  expanded: boolean
  onToggle: () => void
  onActionSelect: (actionId: string) => void
}
```

### Visual Specifications
```css
.floating-action-button {
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
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.fab-primary:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.5);
}

.fab-secondary-menu {
  position: absolute;
  bottom: 80px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.fab-secondary-menu.expanded {
  opacity: 1;
  transform: translateY(0);
}

.fab-secondary-item {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
```

## 6. Shared Animation System

### Transition Utilities
```css
.fade-in {
  animation: fadeIn 0.4s ease-out;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

.scale-in {
  animation: scaleIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### Loading States
```css
.skeleton-loading {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 7. Accessibility Specifications

### ARIA Labels
```typescript
const accessibilityProps = {
  currentActivity: {
    'aria-label': 'Current activity in progress',
    'role': 'region',
    'aria-live': 'polite'
  },
  timeline: {
    'aria-label': 'Daily activity timeline',
    'role': 'list'
  },
  timelineItem: {
    'role': 'listitem',
    'aria-expanded': false,
    'tabIndex': 0
  },
  quickActions: {
    'aria-label': 'Quick action buttons',
    'role': 'toolbar'
  }
}
```

### Keyboard Navigation
```css
.focusable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

## Component Integration Notes

### State Management
- Use React Context for shared gamification state
- Local state for component-specific interactions
- Custom hooks for timeline navigation and activity management

### Performance Optimizations
- Lazy load timeline items beyond viewport
- Memoize role model influence calculations
- Debounce search and filter operations
- Virtual scrolling for large timeline datasets

### Error Boundaries
- Graceful fallbacks for failed API calls
- Skeleton loading states for all components
- Offline mode considerations for cached data