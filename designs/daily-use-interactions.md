# Daily Use Page Interaction Patterns

## Core Interaction Philosophy

### User Agency Principles
- **AI Suggests, User Confirms**: Following Lightwalker's established pattern, AI provides recommendations but users maintain control
- **Progressive Disclosure**: Complex features revealed as users become more engaged
- **Immediate Feedback**: Every interaction provides clear visual or haptic response
- **Graceful Degradation**: Core functionality works without JavaScript

## 1. Current Activity Interactions

### Activity State Transitions
```typescript
type ActivityState = 'idle' | 'active' | 'paused' | 'completed' | 'skipped'

interface ActivityTransition {
  from: ActivityState
  to: ActivityState
  trigger: 'user_action' | 'timer' | 'schedule' | 'ai_suggestion'
  animation: string
  feedback: FeedbackType
}

const activityTransitions: ActivityTransition[] = [
  {
    from: 'idle',
    to: 'active',
    trigger: 'user_action',
    animation: 'scale-in-fade',
    feedback: 'haptic_light'
  },
  {
    from: 'active',
    to: 'paused',
    trigger: 'user_action',
    animation: 'gentle-pulse-stop',
    feedback: 'sound_pause'
  },
  {
    from: 'active',
    to: 'completed',
    trigger: 'timer',
    animation: 'celebration-burst',
    feedback: 'haptic_success'
  }
]
```

### Interaction Sequences

#### Starting an Activity
```
User Intent: Begin current activity
↓
1. User taps "Start Activity" button
2. Button transforms with loading state (200ms)
3. Activity card expands to show progress bar (300ms)
4. Role model influence appears with method quote (400ms)
5. Timer begins with gentle pulsing animation
6. Success feedback: haptic + visual confirmation
```

#### Activity Progress Monitoring
```
Continuous Interactions:
- Progress bar updates every 30 seconds
- Role model method quote rotates every 2 minutes
- Gentle vibration at 25%, 50%, 75% completion
- Visual breathing animation syncs with progress
- Background gradient subtly shifts over time
```

### Gesture Support
```typescript
interface ActivityGestures {
  // Mobile gestures
  swipeLeft: () => void   // Skip to next activity
  swipeRight: () => void  // Return to previous activity
  longPress: () => void   // Open activity details
  doubleTap: () => void   // Quick pause/resume
  
  // Desktop interactions
  spaceBar: () => void    // Pause/resume toggle
  enterKey: () => void    // Complete current activity
  escapeKey: () => void   // Return to timeline view
}
```

## 2. Timeline Navigation Patterns

### Timeline Item Interactions
```typescript
interface TimelineInteraction {
  itemId: string
  interactionType: 'tap' | 'hover' | 'focus' | 'long_press'
  response: TimelineResponse
}

type TimelineResponse = {
  expandDetails: boolean
  showQuickActions: boolean
  highlightInfluences: boolean
  previewContent: boolean
}
```

### Interaction States
```css
/* Timeline Item States */
.timeline-item {
  /* Default state */
  opacity: 0.85;
  transform: translateX(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:hover {
  /* Hover state - desktop only */
  opacity: 1;
  transform: translateX(8px);
  background: rgba(59, 130, 246, 0.04);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.timeline-item.active {
  /* Currently active item */
  opacity: 1;
  transform: translateX(12px);
  background: rgba(245, 158, 11, 0.08);
  border-left-width: 4px;
}

.timeline-item.expanded {
  /* Expanded detail state */
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  margin: 8px 0;
}
```

### Timeline Expansion Interaction
```
User Action: Tap timeline item
↓
1. Item background fades to light gray (150ms)
2. Content area expands downward (300ms)
3. Role model influences fade in (400ms)
4. Quick action buttons slide up (500ms)
5. Focus moves to first actionable element
```

### Smart Scrolling Behavior
```typescript
interface SmartScrollConfig {
  autoScrollToActive: boolean
  smoothScrollDuration: 800
  scrollOffset: number // Pixels from top
  magneticScrollPoints: string[] // IDs of key timeline items
}

const handleTimelineScroll = {
  // Magnetic scroll to activity boundaries
  onScroll: debounce((scrollY: number) => {
    const nearestActivity = findNearestActivity(scrollY)
    if (shouldMagnetizeScroll(scrollY, nearestActivity)) {
      smoothScrollTo(nearestActivity.offsetTop)
    }
  }, 150),
  
  // Auto-scroll to active item when activity changes
  onActivityChange: (newActivityId: string) => {
    const element = document.getElementById(newActivityId)
    element?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })
  }
}
```

## 3. Role Model Container Interactions

### Influence Selection Patterns
```typescript
interface InfluenceInteraction {
  roleModelId: string
  influenceType: 'tap' | 'hover' | 'drag'
  currentActivity: string
  expectedOutcome: InfluenceEffect
}

type InfluenceEffect = {
  highlightRelevantMethods: boolean
  showAttributeMapping: boolean
  suggestActivities: boolean
  adjustTimelineRecommendations: boolean
}
```

### Container Animation States
```css
.influence-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* Hover state reveals more information */
.influence-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Active state shows current influence */
.influence-item.actively-influencing {
  border: 2px solid #10b981;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1), 
    rgba(16, 185, 129, 0.05));
  animation: gentle-glow 3s ease-in-out infinite;
}

@keyframes gentle-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1); }
}
```

### Dynamic Percentage Updates
```typescript
const updateInfluencePercentages = {
  // Smooth percentage transitions
  onActivityComplete: (completedActivity: Activity) => {
    const relevantInfluences = mapActivityToInfluences(completedActivity)
    
    relevantInfluences.forEach(influence => {
      animatePercentageChange(
        influence.id,
        influence.currentPercentage,
        influence.newPercentage,
        { duration: 1200, easing: 'ease-out' }
      )
    })
  },
  
  // Visual feedback during updates
  animatePercentageChange: (
    influenceId: string, 
    from: number, 
    to: number, 
    options: AnimationOptions
  ) => {
    // Number counting animation
    // Color intensity adjustment based on change magnitude
    // Particle effects for significant increases
  }
}
```

## 4. Quick Actions Grid Interactions

### Action Button States
```css
.quick-action-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ripple effect on click */
.quick-action-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.quick-action-item.clicked::before {
  width: 300px;
  height: 300px;
}

/* Hover state with icon animation */
.quick-action-item:hover .quick-action-icon {
  transform: scale(1.1) rotate(5deg);
  transition: transform 0.2s ease;
}

/* Badge notification animation */
.quick-action-count {
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### Contextual Quick Actions
```typescript
interface ContextualActions {
  currentActivity: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  userProgress: ProgressMetrics
  adaptiveActions: QuickAction[]
}

const generateContextualActions = (context: ContextualActions): QuickAction[] => {
  const baseActions = [
    { id: 'journal', title: 'Journal', icon: '📝' },
    { id: 'tasks', title: 'Tasks', icon: '✅' },
    { id: 'progress', title: 'Progress', icon: '📊' }
  ]
  
  // Add contextual actions based on current state
  if (context.currentActivity === 'journaling') {
    baseActions.unshift({ 
      id: 'ai-insight', 
      title: 'AI Insight', 
      icon: '💡',
      urgent: true 
    })
  }
  
  return baseActions
}
```

## 5. Floating Action Button (Mobile)

### Expansion Animation Sequence
```typescript
interface FABState {
  collapsed: boolean
  expanded: boolean
  transitioning: boolean
}

const fabAnimationSequence = {
  expand: [
    { step: 1, duration: 200, action: 'rotate_primary_icon' },
    { step: 2, duration: 300, action: 'show_secondary_menu' },
    { step: 3, duration: 150, action: 'stagger_secondary_items' },
    { step: 4, duration: 100, action: 'add_backdrop_blur' }
  ],
  
  collapse: [
    { step: 1, duration: 100, action: 'remove_backdrop_blur' },
    { step: 2, duration: 150, action: 'hide_secondary_items' },
    { step: 3, duration: 200, action: 'hide_secondary_menu' },
    { step: 4, duration: 200, action: 'reset_primary_icon' }
  ]
}
```

### Gesture Recognition
```typescript
interface FABGestures {
  // Touch interactions
  onTouchStart: (event: TouchEvent) => void
  onTouchMove: (event: TouchEvent) => void  
  onTouchEnd: (event: TouchEvent) => void
  
  // Advanced gestures
  recognizeLongPress: (threshold: number) => boolean
  recognizeSwipeUp: (velocity: number) => boolean
  recognizeTapPattern: (taps: number, timeWindow: number) => boolean
}

const fabGestureHandlers = {
  longPress: () => {
    // Show quick preview of all available actions
    showActionPreview({ duration: 2000 })
  },
  
  swipeUp: () => {
    // Quickly expand and auto-select most relevant action
    expandFAB()
    highlightRecommendedAction()
  },
  
  doubleTap: () => {
    // Execute default action without showing menu
    executeDefaultAction()
  }
}
```

## 6. Advanced Interaction Patterns

### Voice Control Integration
```typescript
interface VoiceCommands {
  'start activity': () => void
  'pause': () => void
  'next activity': () => void
  'show progress': () => void
  'quick journal': () => void
  'schedule break': () => void
}

const voiceControlHandler = {
  initialize: () => {
    if ('webkitSpeechRecognition' in window) {
      setupSpeechRecognition()
    }
  },
  
  processCommand: (command: string) => {
    const normalizedCommand = normalizeVoiceInput(command)
    const action = matchCommandToAction(normalizedCommand)
    
    if (action) {
      provideVoiceConfirmation(action)
      executeAction(action)
    }
  }
}
```

### Keyboard Navigation
```typescript
interface KeyboardShortcuts {
  // Global shortcuts
  'Ctrl+Space': () => void  // Toggle activity timer
  'Ctrl+N': () => void      // Next timeline item
  'Ctrl+P': () => void      // Previous timeline item
  'Ctrl+J': () => void      // Quick journal entry
  
  // Context-sensitive shortcuts
  'Enter': () => void       // Confirm current action
  'Escape': () => void      // Cancel/close current modal
  'Tab': () => void         // Navigate between focusable elements
  'Shift+Tab': () => void   // Reverse navigation
}

const keyboardNavigationManager = {
  currentFocusIndex: 0,
  focusableElements: [] as HTMLElement[],
  
  updateFocusableElements: () => {
    // Find all interactive elements in current view
    const selectors = [
      '.timeline-item[tabindex="0"]',
      '.quick-action-item',
      '.influence-item',
      'button:not([disabled])',
      'input:not([disabled])'
    ]
    
    focusableElements = Array.from(
      document.querySelectorAll(selectors.join(', '))
    )
  },
  
  handleKeyPress: (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        moveFocus('next')
        break
      case 'ArrowUp':  
        moveFocus('previous')
        break
      case 'Enter':
        activateFocusedElement()
        break
    }
  }
}
```

### Haptic Feedback System
```typescript
interface HapticPatterns {
  light: number[]     // [10]
  medium: number[]    // [20]  
  heavy: number[]     // [50]
  success: number[]   // [10, 20, 10]
  warning: number[]   // [20, 10, 20, 10]
  error: number[]     // [50, 30, 50]
}

const hapticFeedback = {
  trigger: (pattern: keyof HapticPatterns) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(HapticPatterns[pattern])
    }
  },
  
  // Context-aware haptic responses
  onActivityStart: () => hapticFeedback.trigger('light'),
  onActivityComplete: () => hapticFeedback.trigger('success'),
  onLevelUp: () => hapticFeedback.trigger('success'),
  onError: () => hapticFeedback.trigger('error')
}
```

## 7. Accessibility Interaction Patterns

### Screen Reader Support
```typescript
interface A11yAnnouncements {
  activityStarted: (activityName: string) => string
  progressUpdate: (percentage: number) => string
  timelineChange: (currentItem: string, totalItems: number) => string
  pointsEarned: (points: number) => string
}

const a11yAnnouncements: A11yAnnouncements = {
  activityStarted: (name) => `Started activity: ${name}`,
  progressUpdate: (pct) => `Progress: ${pct}% complete`,
  timelineChange: (current, total) => `Timeline item ${current} of ${total}`,
  pointsEarned: (points) => `Earned ${points} discovery points`
}

const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  setTimeout(() => document.body.removeChild(announcement), 1000)
}
```

### Focus Management
```typescript
interface FocusManagement {
  trapFocus: (container: HTMLElement) => void
  restoreFocus: (previousElement: HTMLElement) => void
  manageFocusForModals: (modalElement: HTMLElement) => void
}

const focusManager: FocusManagement = {
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    })
  }
}
```

## 8. Performance-Optimized Interactions

### Debounced and Throttled Events
```typescript
interface OptimizedEventHandlers {
  onScroll: () => void
  onResize: () => void
  onSearch: (query: string) => void
  onProgressUpdate: () => void
}

const optimizedHandlers: OptimizedEventHandlers = {
  onScroll: throttle(() => {
    updateTimelineVisibility()
    checkForLazyLoadTriggers()
  }, 16), // 60fps
  
  onResize: debounce(() => {
    recalculateLayout()
    updateResponsiveBreakpoints()
  }, 250),
  
  onSearch: debounce((query: string) => {
    performSearch(query)
  }, 300),
  
  onProgressUpdate: throttle(() => {
    updateProgressAnimations()
    syncWithLocalStorage()
  }, 1000) // Once per second max
}
```

### Intersection Observer for Performance
```typescript
const intersectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Load content for visible timeline items
        loadTimelineItemContent(entry.target.id)
        // Start animations for visible elements
        entry.target.classList.add('animate-in')
      } else {
        // Pause unnecessary animations for invisible elements
        entry.target.classList.remove('animate-in')
      }
    })
  },
  { 
    rootMargin: '50px',
    threshold: 0.1 
  }
)

// Observe all timeline items
document.querySelectorAll('.timeline-item').forEach(item => {
  intersectionObserver.observe(item)
})
```

This comprehensive interaction design system ensures that the Daily Use page provides intuitive, accessible, and performant user experiences across all device types while maintaining consistency with Lightwalker's established interaction patterns.