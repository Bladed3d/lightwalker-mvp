# Universal Development Intelligence System (UDIS)
## Complete Documentation & Best Practices

---

## 📋 **Table of Contents**
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [AI Model Strategy](#ai-model-strategy)
4. [Environment Configuration](#environment-configuration)
5. [Integration Guide](#integration-guide)
6. [Best Practices](#best-practices)
7. [Cost Optimization](#cost-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Dashboard Guide](#dashboard-guide)
10. [API Reference](#api-reference)

---

## 🎯 **System Overview**

### What is UDIS?
Universal Development Intelligence System (UDIS) is an AI-powered development assistant that:
- **Monitors** your application for issues in real-time
- **Analyzes** problems using advanced AI models
- **Resolves** issues automatically when possible
- **Prevents** recurring problems through learning
- **Provides** architectural insights for system improvement

### Core Benefits
- **Prevents 8-hour debugging nightmares** (like the DeepSeek R1 scenario)
- **Catches issues before users notice** them
- **Provides architectural insights** for better system design  
- **Saves 10-15 hours/week** in debugging and issue resolution
- **Scales seamlessly** from development to production

### Inspired by BMAD Method
UDIS uses multi-agent coordination with specialized roles:
- **Monitor Agents**: Continuous system observation
- **Analyst Agents**: AI-powered problem analysis
- **Resolver Agents**: Automatic issue resolution
- **Orchestrator Agents**: Context management and coordination

---

## 🏗️ **Architecture**

### Multi-Agent System
```
┌─────────────────────────────────────────┐
│            UDIS Controller              │
├─────────────────────────────────────────┤
│  Monitor Agent    │    Analyst Agent    │
│  - Build issues   │    - Root cause     │
│  - Performance    │    - AI analysis    │
│  - User behavior  │    - Solutions      │
│  - Security       │    - Prevention     │
├─────────────────────────────────────────┤
│  Resolver Agent   │  Orchestrator Agent │
│  - Auto-fix       │    - Context        │
│  - Implement      │    - Coordination   │
│  - Validate       │    - Learning       │
│  - Document       │    - Memory         │
└─────────────────────────────────────────┘
```

### Problem Domains Covered
- **BUILD**: TypeScript errors, dependency conflicts, compilation issues
- **PERFORMANCE**: Memory leaks, slow queries, response time regressions  
- **USER_EXPERIENCE**: Form abandonment, search failures, navigation issues
- **SECURITY**: Injection attempts, authentication failures, suspicious activity
- **CODE_QUALITY**: Anti-patterns, technical debt, maintainability issues
- **INFRASTRUCTURE**: API failures, database errors, deployment problems

### Operating Modes
- **OFF**: Zero overhead, completely disabled
- **PASSIVE**: Silent monitoring only (<2% CPU impact)
- **ACTIVE**: Full intelligence with AI analysis and auto-resolution
- **EMERGENCY**: Crisis mode with unlimited resources for diagnostics

---

## 🧠 **AI Model Strategy**

### Development Environment (Local Port 3001)
```typescript
// FREE Claude Code Subscription Usage
const developmentConfig = {
  primaryAI: 'claude-code-subscription',    // $0 cost - unlimited
  fallbackAI: 'openrouter-gpt4omini',     // Only if Claude unavailable
  userAI: 'openrouter-gpt4omini',         // Keep consistent with prod
  costs: {
    udisAnalysis: '$0/day',               // Free with subscription
    userInteractions: '~$0.50/day',       // OpenRouter costs
    total: '~$0.50/day'
  }
}
```

### Production Environment (Vercel Deployment)
```typescript
// Cost-Optimized OpenRouter Strategy
const productionConfig = {
  userAI: 'openrouter-gpt4omini',         // User-facing AI (cheap, fast)
  udisMonitoring: 'openrouter-gpt4omini', // Routine monitoring
  emergencyAnalysis: 'claude-3-sonnet',   // Critical issues only
  costs: {
    userInteractions: '$2-5/day',         // Depends on user volume
    udisMonitoring: '~$0.20/day',         // Lightweight monitoring
    emergencyAnalysis: '~$0.50/incident', // Premium AI when needed
    total: '$2-6/day'
  }
}
```

### Smart Model Selection
```typescript
const selectAnalysisModel = (issue, environment) => {
  if (environment === 'development' && claudeCodeAvailable) {
    return 'claude-code-subscription' // Always use free Claude locally
  }
  
  // Production model selection
  if (issue.severity === 'CRITICAL') {
    return 'claude-3-sonnet-20240229'   // Premium for emergencies
  } else if (issue.complexity === 'COMPLEX') {
    return 'claude-3-haiku-20240307'    // Mid-tier for complex analysis
  } else {
    return 'openai/gpt-4o-mini'         // Cost-effective for simple issues
  }
}
```

---

## ⚙️ **Environment Configuration**

### Environment Variables
```bash
# Core UDIS Settings
UDIS_MODE=active                    # off|passive|active|emergency
UDIS_SAMPLING_RATE=1.0             # 0.0-1.0 (1.0 = monitor all requests)
ENABLE_UDIS=true                   # Master enable/disable switch

# Performance Budgets
UDIS_MAX_CPU_OVERHEAD=2.0          # Max CPU overhead percentage
UDIS_MAX_MEMORY_MB=100             # Max memory usage in MB
UDIS_MAX_RESPONSE_TIME_MS=50       # Max response time increase

# AI Configuration
OPENROUTER_API_KEY=sk-...          # Required for production AI analysis
UDIS_AI_BUDGET_PER_HOUR=5.0       # Dollar limit per hour
UDIS_CLAUDE_CODE_PORT=3001         # Port for local Claude Code integration

# Feature Flags
UDIS_ENABLE_AI_ANALYSIS=true       # Enable AI-powered analysis
UDIS_ENABLE_AUTO_RESOLUTION=false  # Enable automatic issue resolution
UDIS_ENABLE_EMERGENCY_MODE=true    # Enable emergency diagnostics
```

### Configuration by Environment
```typescript
// Development Configuration
const developmentConfig: UDISConfig = {
  mode: UDISMode.ACTIVE,
  samplingRate: 1.0,                    // Monitor everything in dev
  performanceBudget: {
    maxCpuOverhead: 5.0,                // Higher overhead OK in dev
    maxMemoryMb: 200,
    maxResponseTimeMs: 100
  },
  aiConfig: {
    model: 'claude-code-subscription',   // Free unlimited analysis
    costBudgetPerHour: 0,               // No cost with subscription
  },
  enabledDomains: Object.values(ProblemDomain) // All domains enabled
}

// Production Configuration  
const productionConfig: UDISConfig = {
  mode: UDISMode.PASSIVE,              // Conservative in production
  samplingRate: 0.1,                   // 10% sampling to reduce overhead
  performanceBudget: {
    maxCpuOverhead: 1.0,                // Strict performance requirements
    maxMemoryMb: 50,
    maxResponseTimeMs: 25
  },
  aiConfig: {
    model: 'openai/gpt-4o-mini',        // Cost-effective monitoring
    costBudgetPerHour: 2.0,             // Conservative budget
  },
  enabledDomains: [                     // Only critical domains
    ProblemDomain.SECURITY,
    ProblemDomain.INFRASTRUCTURE
  ]
}
```

---

## 🔧 **Integration Guide**

### Step 1: Install and Initialize
```typescript
// 1. Initialize UDIS in your main app file
import { setupUDISForNextJS } from './lib/udis'

export default async function initializeApp() {
  // Initialize UDIS based on environment
  const udis = await setupUDISForNextJS({
    mode: process.env.NODE_ENV === 'production' ? 'passive' : 'active',
    enabledDomains: [
      ProblemDomain.BUILD,
      ProblemDomain.PERFORMANCE, 
      ProblemDomain.USER_EXPERIENCE,
      ProblemDomain.SECURITY,
      ProblemDomain.INFRASTRUCTURE
    ]
  })

  return udis
}
```

### Step 2: Add Monitoring to Existing Functions (Zero Risk)
```typescript
// 2. Wrap existing functions with monitoring (non-invasive)
import { UDISUtils } from './lib/udis'

// Your existing AI service (unchanged)
const originalExtractKeywords = aiService.extractKeywords

// Add monitoring wrapper (safe - just observes)
aiService.extractKeywords = UDISUtils.monitorFunction(
  originalExtractKeywords,
  'ai-keyword-extraction',
  { 
    threshold: 5000, // Alert if takes >5 seconds
    domain: ProblemDomain.INFRASTRUCTURE 
  }
)
```

### Step 3: Add API Route Monitoring
```typescript
// 3. Monitor API routes automatically
import { withUDISMonitoring } from './lib/udis-nextjs-integration'

export const POST = withUDISMonitoring(
  async (request: NextRequest) => {
    // Your existing API logic unchanged
    const result = await aiService.extractKeywords(userInput)
    return NextResponse.json({ success: true, result })
  },
  {
    route: '/api/ai-character-creation',
    performanceThreshold: 2000 // 2 second threshold
  }
)
```

### Step 4: Add React Component Monitoring
```typescript
// 4. Monitor React components
import { useLightwalkerUDIS } from './lib/udis-example-integration'

export default function CharacterCreation() {
  const { reportError, trackSearchQuery } = useLightwalkerUDIS('CharacterCreation')
  
  const handleSearch = async (query: string) => {
    try {
      const results = await searchRoleModels(query)
      trackSearchQuery(query, results.length) // Track search success/failure
      return results
    } catch (error) {
      reportError(error) // Report component errors to UDIS
      throw error
    }
  }
  
  // Your existing component logic unchanged
}
```

---

## 📋 **Best Practices**

### Development Phase Best Practices

#### 1. Use Claude Code Subscription Aggressively
```typescript
// Since Claude Code is free with subscription, use it for everything
const developmentStrategy = {
  issueAnalysis: 'claude-code',        // Comprehensive architectural insights
  codeReview: 'claude-code',          // Deep code quality analysis
  performanceAnalysis: 'claude-code', // Detailed optimization recommendations
  securityAudit: 'claude-code',       // Thorough vulnerability assessment
  architectureGuidance: 'claude-code' // System design improvements
}
```

#### 2. Test Locally on Port 3001
```bash
# Start your app on port 3001 for Claude Code integration
npm start -- -p 3001

# Or add to package.json
{
  "scripts": {
    "dev:udis": "next dev -p 3001",
    "test:udis": "npm run dev:udis & npm run test"
  }
}
```

#### 3. Monitor Everything in Development
```typescript
// Development: Monitor 100% of requests for maximum learning
const devConfig = {
  samplingRate: 1.0,                  // Monitor every request
  enableAllDomains: true,             // All problem domains active
  comprehensiveAnalysis: true,        // Full Claude Code analysis
  autoResolution: false,              // Don't auto-fix in dev (learn first)
  logEverything: true                 // Comprehensive logging
}
```

### Production Phase Best Practices

#### 1. Conservative Monitoring Strategy
```typescript
// Production: Balanced monitoring with performance priority
const prodConfig = {
  samplingRate: 0.1,                 // 10% sampling for performance
  criticalDomainsOnly: [              // Focus on critical issues
    ProblemDomain.SECURITY,
    ProblemDomain.INFRASTRUCTURE
  ],
  emergencyEscalation: true,          // Can escalate to premium AI
  autoResolution: false,              // Never auto-fix in production
  performanceFirst: true              // Performance over completeness
}
```

#### 2. Smart Cost Management
```typescript
// Use tiered AI strategy based on issue severity
const costOptimizedAnalysis = {
  routine: 'gpt-4o-mini',            // $0.02 per analysis
  complex: 'claude-haiku',           // $0.08 per analysis  
  critical: 'claude-sonnet',         // $0.25 per analysis
  budgetLimit: '$5/day',             // Daily spending cap
  emergencyOverride: '$20/incident'   // Emergency budget override
}
```

#### 3. Gradual Feature Rollout
```typescript
// Phase 1: Observer only (zero risk)
const phase1 = { mode: 'passive', autoResolution: false }

// Phase 2: Add performance monitoring (low risk)
const phase2 = { ...phase1, performanceTracking: true }

// Phase 3: Full monitoring (tested and proven)
const phase3 = { mode: 'active', comprehensiveMonitoring: true }
```

### Integration Best Practices

#### 1. Zero-Risk Integration Pattern
```typescript
// Always wrap existing functions, never modify them
const safeIntegration = {
  pattern: 'wrapper',                 // Wrap, don't modify
  fallbackStrategy: 'continue',       // If UDIS fails, app continues
  errorIsolation: 'complete',         // UDIS errors never affect app
  performanceGuard: 'auto-disable',   // Auto-disable if overhead detected
  rollbackPlan: 'instant'             // Environment variable toggle
}
```

#### 2. Environment-Specific Configuration
```typescript
// Different strategies for different environments
const environmentStrategy = {
  development: {
    priority: 'comprehensive-analysis', // Use free Claude Code fully
    performance: 'relaxed',            // Higher overhead acceptable
    logging: 'verbose'                 // Detailed logs for learning
  },
  staging: {
    priority: 'issue-detection',       // Focus on catching problems
    performance: 'balanced',           // Moderate performance impact
    logging: 'important'               // Key issues only
  },
  production: {
    priority: 'performance',           // Performance first
    performance: 'strict',             // Minimal overhead only
    logging: 'critical'                // Critical issues only
  }
}
```

#### 3. Monitoring Strategy by Problem Domain
```typescript
const domainPriorities = {
  // Always monitor (critical for user experience)
  critical: [
    ProblemDomain.SECURITY,           // Security threats
    ProblemDomain.INFRASTRUCTURE      // System failures
  ],
  
  // Monitor in development and staging
  important: [
    ProblemDomain.PERFORMANCE,        // Optimization opportunities
    ProblemDomain.BUILD               // Development productivity
  ],
  
  // Monitor only in development
  optimization: [
    ProblemDomain.CODE_QUALITY,       // Code improvements
    ProblemDomain.USER_EXPERIENCE     // UX optimization
  ]
}
```

---

## 💰 **Cost Optimization**

### Development Costs (Using Claude Code Subscription)
```typescript
const developmentCosts = {
  udisAnalysis: '$0/day',             // Free with Claude Code subscription
  userAITesting: '$0.50/day',         // OpenRouter for user-facing AI
  totalDailyCost: '$0.50/day',        // Minimal cost for comprehensive intelligence
  
  monthlyBreakdown: {
    claudeCodeSubscription: '$20/month', // Already paying this
    openRouterUsage: '$15/month',        // User AI testing
    additionalUDISCost: '$0/month',      // No additional cost!
    totalUDIS: '$0/month'                // Pure value add
  }
}
```

### Production Costs (OpenRouter Strategy)
```typescript
const productionCosts = {
  userAI: '$2-5/day',                 // Depends on user volume
  udisMonitoring: '$0.20/day',        // Lightweight monitoring
  emergencyAnalysis: '$0.50/incident', // Premium AI when needed
  totalDailyCost: '$2-6/day',         // Scales with usage
  
  monthlyBreakdown: {
    userInteractions: '$60-150/month',  // Primary cost (user value)
    udisMonitoring: '$6/month',         // Development intelligence
    emergencyAnalysis: '$5-20/month',   // Based on incidents
    totalUDIS: '$11-26/month'           // ROI: 15+ hours saved/week
  }
}
```

### ROI Analysis
```typescript
const roiCalculation = {
  timesSavedPerWeek: '15-20 hours',   // Debugging and issue resolution
  hourlyDeveloperRate: '$50-100',     // Conservative estimate
  weeklySavings: '$750-2000',         // Time savings value
  monthlyUDISCost: '$11-26',          // Total UDIS operational cost
  monthlyROI: '2900-7700%',           // Incredible return on investment
  
  // Real examples
  deepSeekR1Prevention: '8 hours saved = $400-800 value',
  buildIssueDetection: '2 hours saved = $100-200 value',
  performanceOptimization: '4 hours saved = $200-400 value',
  securityVulnerabilityPrevention: 'Priceless'
}
```

### Cost Optimization Strategies
```typescript
const optimizationStrategies = {
  // 1. Smart model selection
  modelSelection: {
    simple: 'gpt-4o-mini',           // $0.02 per analysis
    moderate: 'claude-haiku',        // $0.08 per analysis
    complex: 'claude-sonnet',        // $0.25 per analysis
    strategy: 'Use cheapest model that can handle the complexity'
  },
  
  // 2. Sampling strategies
  sampling: {
    development: '100%',              // Monitor everything (free Claude)
    staging: '50%',                  // Catch most issues
    production: '10%',               // Performance-focused sampling
    critical: '100%'                 // Always monitor critical domains
  },
  
  // 3. Budget controls
  budgetControls: {
    dailyLimit: '$5',                // Hard spending cap
    emergencyLimit: '$20',           // Crisis override budget
    autoDowngrade: 'true',           // Switch to cheaper models if needed
    alertThresholds: '$2, $4, $5'    // Spending alerts
  }
}
```

---

## 🛠️ **Troubleshooting**

### Common Issues and Solutions

#### Issue: Claude Code Not Connecting
```typescript
// Problem: UDIS can't connect to Claude Code on port 3001
// Symptoms: Falls back to GPT-4o-mini only, no architectural insights

// Solution 1: Verify Claude Code is running
// Check: http://localhost:3001 should respond

// Solution 2: Check port configuration
const config = {
  claudeCodePort: 3001,              // Match your Claude Code port
  claudeCodeEndpoint: 'http://localhost:3001',
  connectionTimeout: 5000            // 5 second timeout
}

// Solution 3: Test connection manually
const testConnection = async () => {
  try {
    const response = await fetch('http://localhost:3001/health')
    console.log('Claude Code available:', response.ok)
  } catch (error) {
    console.log('Claude Code not available:', error.message)
  }
}
```

#### Issue: High Performance Overhead
```typescript
// Problem: UDIS using too much CPU/memory
// Symptoms: App becomes slow, high resource usage

// Solution 1: Check performance metrics
const metrics = udis.getMetrics()
if (metrics.cpuOverhead > 2.0) {
  // Auto-downgrade mode
  await udis.setMode(UDISMode.PASSIVE)
}

// Solution 2: Reduce sampling rate
const config = {
  samplingRate: 0.1,                // Monitor only 10% of requests
  performanceBudget: {
    maxCpuOverhead: 1.0,            // Strict 1% limit
    maxMemoryMb: 50,                // 50MB memory limit
    maxResponseTimeMs: 25           // 25ms response time limit
  }
}

// Solution 3: Disable in production if needed
if (performanceIssues) {
  process.env.UDIS_MODE = 'off'     // Instant disable
}
```

#### Issue: AI Analysis Errors
```typescript
// Problem: AI analysis calls failing
// Symptoms: No insights, error messages in logs

// Solution 1: Check API keys
const apiKeys = {
  openRouter: process.env.OPENROUTER_API_KEY,
  required: 'sk-or-v1-...',          // Should start with sk-or-v1
}

// Solution 2: Verify model availability
const testModel = async () => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models')
    const models = await response.json()
    console.log('Available models:', models.data.map(m => m.id))
  } catch (error) {
    console.log('OpenRouter API error:', error)
  }
}

// Solution 3: Implement fallback strategy
const analysisWithFallback = async (issue) => {
  try {
    return await analyzeWithClaudeCode(issue)
  } catch (error) {
    console.log('Claude Code failed, using GPT-4o-mini')
    return await analyzeWithGPT4oMini(issue)
  }
}
```

#### Issue: Issues Not Being Detected
```typescript
// Problem: UDIS not catching expected issues
// Symptoms: Known problems not showing up in monitoring

// Solution 1: Check sampling rate
const config = {
  samplingRate: 1.0,                // Increase to 100% for testing
  enabledDomains: Object.values(ProblemDomain) // Enable all domains
}

// Solution 2: Lower detection thresholds
const thresholds = {
  performanceThreshold: 1000,        // Lower from 5000ms to 1000ms
  errorThreshold: 1,                 // Alert on first error
  memoryThreshold: 100               // Lower memory alert threshold
}

// Solution 3: Add manual issue reporting
UDISUtils.reportIssue({
  title: 'Test Issue Detection',
  domain: ProblemDomain.PERFORMANCE,
  severity: IssueSeverity.HIGH,
  description: 'Testing UDIS detection capabilities'
})
```

### Performance Troubleshooting

#### Monitoring Performance Impact
```typescript
// Check UDIS overhead continuously
const monitorUDISPerformance = () => {
  const metrics = udis.getMetrics()
  
  console.log('UDIS Performance Impact:', {
    cpuOverhead: `${metrics.cpuOverhead}%`,
    memoryUsage: `${metrics.memoryUsageMb}MB`,
    responseTimeIncrease: `${metrics.responseTimeImpactMs}ms`,
    recommendation: metrics.cpuOverhead > 2 ? 'Consider downgrading mode' : 'OK'
  })
}

// Auto-adjust based on performance
const autoOptimize = () => {
  const metrics = udis.getMetrics()
  
  if (metrics.cpuOverhead > 5) {
    udis.setMode(UDISMode.OFF)        // Disable completely
  } else if (metrics.cpuOverhead > 2) {
    udis.setMode(UDISMode.PASSIVE)    // Reduce to passive monitoring
  }
}
```

---

## 📊 **Dashboard Guide**

### Essential Dashboard Components

#### 1. Real-Time Issue Stream
```typescript
interface LiveIssuesPanel {
  currentIssues: DetectedIssue[]
  issueCount: {
    critical: number
    high: number
    medium: number
    low: number
  }
  recentActivity: IssueActivity[]
  autoResolutionStatus: ResolutionStatus[]
}
```

#### 2. System Health Overview
```typescript
interface SystemHealthPanel {
  udisStatus: 'healthy' | 'warning' | 'critical'
  performanceMetrics: {
    cpuOverhead: number
    memoryUsage: number
    responseTimeImpact: number
  }
  aiServiceStatus: {
    claudeCode: 'connected' | 'disconnected'
    openRouter: 'connected' | 'disconnected'  
    lastAnalysisTime: Date
  }
  operatingMode: UDISMode
}
```

#### 3. AI Analysis Insights
```typescript
interface AIInsightsPanel {
  claudeCodeAnalyses: ClaudeInsight[]
  architecturalRecommendations: Recommendation[]
  preventionStrategies: PreventionRule[]
  learningProgress: LearningMetric[]
}
```

#### 4. Cost and ROI Tracking
```typescript
interface CostTrackingPanel {
  todayCosts: {
    claudeCode: number      // $0 with subscription
    openRouter: number      // Actual API costs
    total: number
  }
  savings: {
    debuggingTimesSaved: number     // Hours
    issuesPrevented: number         // Count
    estimatedValue: number          // Dollar value
  }
  efficiency: {
    issuesAutoResolved: number
    manualInterventionRequired: number
    resolutionRate: number
  }
}
```

### Dashboard Implementation Priority

#### Phase 1: Core Monitoring (2-3 hours)
```typescript
// Essential components for immediate value
const coreComponents = [
  'LiveIssuesFeed',       // See problems as they happen
  'SystemHealthStatus',   // Green/yellow/red overview
  'AIServiceStatus',      // Claude Code connection status
  'BasicCostTracking'     // Daily spending overview
]
```

#### Phase 2: Intelligence Features (4-6 hours)
```typescript
// Advanced components for comprehensive insights
const intelligenceComponents = [
  'ClaudeCodeInsights',   // Architectural recommendations  
  'PatternRecognition',   // Recurring issue identification
  'PreventionTracking',   // Success in preventing issues
  'ROICalculation'        // Value demonstration
]
```

#### Phase 3: Optimization Features (6-8 hours)
```typescript
// Advanced components for system optimization
const optimizationComponents = [
  'PredictiveAlerts',     // Issues likely to occur
  'PerformanceOptimization', // System tuning recommendations
  'CostOptimizationInsights', // AI spending optimization
  'TeamProductivityMetrics'   // Development efficiency tracking
]
```

---

## 📚 **API Reference**

### Core UDIS API

#### Initialize UDIS
```typescript
import { setupUDISForNextJS, UDISMode } from './lib/udis'

const udis = await setupUDISForNextJS({
  mode: UDISMode.ACTIVE,
  enabledDomains: [ProblemDomain.PERFORMANCE, ProblemDomain.SECURITY],
  onIssueDetected: (issue) => console.log('Issue:', issue.title),
  onIssueResolved: (issue) => console.log('Resolved:', issue.title)
})
```

#### Monitor Functions
```typescript
import { UDISUtils } from './lib/udis'

const monitoredFunction = UDISUtils.monitorFunction(
  originalFunction,
  'function-name',
  { 
    threshold: 1000,                    // Performance threshold in ms
    domain: ProblemDomain.PERFORMANCE   // Problem domain
  }
)
```

#### Report Issues Manually
```typescript
UDISUtils.reportIssue({
  title: 'Custom Issue',
  domain: ProblemDomain.CODE_QUALITY,
  severity: IssueSeverity.MEDIUM,
  description: 'Description of the issue',
  context: { metadata: { customData: 'value' } },
  autoFixable: false
})
```

#### Emergency Mode
```typescript
// Activate emergency diagnostics
await udis.enableEmergencyMode({
  duration: 30,          // Auto-disable after 30 minutes
  maxCost: 20,          // $20 budget limit
  target: 'user-123'    // Focus on specific user/feature
})
```

### Monitoring API

#### API Route Monitoring
```typescript
import { withUDISMonitoring } from './lib/udis-nextjs-integration'

export const POST = withUDISMonitoring(
  async (request: NextRequest) => {
    // Your API logic
  },
  {
    route: '/api/your-endpoint',
    performanceThreshold: 2000,
    domain: ProblemDomain.INFRASTRUCTURE
  }
)
```

#### React Hook Monitoring
```typescript
import { useLightwalkerUDIS } from './lib/udis-example-integration'

export default function MyComponent() {
  const { reportError, trackInteraction } = useLightwalkerUDIS('MyComponent')
  
  // Use reportError for component errors
  // Use trackInteraction for user behavior tracking
}
```

### Configuration API

#### Runtime Configuration Changes
```typescript
// Change operating mode
await udis.setMode(UDISMode.PASSIVE)

// Get current status
const status = udis.getStatus()

// Get configuration
const config = udis.getConfig()

// Export diagnostics
const diagnostics = udis.exportConfig()
```

#### Environment Configuration
```typescript
import { getGlobalUDISConfig } from './lib/udis-config'

const configManager = getGlobalUDISConfig()

// Override configuration
configManager.setConfigOverride({
  samplingRate: 0.5,
  performanceBudget: { maxCpuOverhead: 1.0 }
})

// Set feature flags
configManager.setFeatureFlag('aiAnalysis', true)
```

---

## 🎯 **Getting Started Checklist**

### Phase 1: Setup (30 minutes)
- [ ] Copy UDIS files to your project `/src/lib/` directory
- [ ] Set environment variables in `.env.local`
- [ ] Test Claude Code connection on port 3001
- [ ] Initialize UDIS in your main app file
- [ ] Verify system starts without errors

### Phase 2: Basic Integration (1 hour)
- [ ] Add monitoring to one API route (non-invasive)
- [ ] Add monitoring to one AI service function
- [ ] Test in development with sample issues
- [ ] Verify issues are detected and logged
- [ ] Check Claude Code analysis is working

### Phase 3: Full Integration (2-3 hours)
- [ ] Add monitoring to all critical functions
- [ ] Set up React component monitoring
- [ ] Configure production environment variables
- [ ] Test emergency mode activation
- [ ] Validate performance overhead is acceptable

### Phase 4: Dashboard (4-6 hours)
- [ ] Build core dashboard components
- [ ] Add real-time issue visualization
- [ ] Implement Claude Code insights display
- [ ] Add cost tracking and ROI calculation
- [ ] Test dashboard with live data

### Phase 5: Production Deployment (1 hour)
- [ ] Configure production-safe settings
- [ ] Deploy to staging environment first
- [ ] Test with production-like load
- [ ] Monitor performance impact
- [ ] Deploy to production with PASSIVE mode

---

## 📞 **Support and Troubleshooting**

### Quick Fixes
- **Claude Code not connecting**: Check port 3001 and firewall settings
- **High CPU usage**: Reduce sampling rate or switch to PASSIVE mode
- **AI analysis failing**: Verify OPENROUTER_API_KEY is correct
- **No issues detected**: Increase sampling rate and lower thresholds

### Getting Help
- Check the troubleshooting section above
- Review environment configuration
- Test with a simple manual issue report
- Verify all environment variables are set correctly

### Performance Optimization
- Start with PASSIVE mode in production
- Use 10% sampling rate initially
- Monitor CPU and memory overhead
- Gradually increase monitoring as comfortable

---

**UDIS Documentation Version 1.0 - Complete Implementation Guide**
*Last Updated: January 2025*