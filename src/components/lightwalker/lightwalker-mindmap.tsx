import React, { useState } from 'react';
import { ChevronRight, User, Brain, MessageCircle, TrendingUp, Trophy, Settings, Heart, FileText, ExternalLink } from 'lucide-react';

const LightwalkerUserFlowchart = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // User journey stages with documentation links
  const userJourney = {
    start: {
      id: 'start',
      type: 'terminator',
      label: 'User Discovers Lightwalker',
      description: 'Marketing: "Human development as easy as copying from the smartest kid in class"',
      position: { x: 400, y: 50 },
      docs: ['Lightwalker-brainstorm.md'],
      status: 'completed',
      next: ['onboarding']
    },
    onboarding: {
      id: 'onboarding',
      type: 'process',
      label: 'Initial Onboarding',
      description: 'User learns the concept and grants permissions',
      position: { x: 400, y: 150 },
      docs: ['Lightwalker-brainstorm.md#user-experience-flow'],
      status: 'completed',
      next: ['problemCheck']
    },
    problemCheck: {
      id: 'problemCheck',
      type: 'decision',
      label: 'Does user know what they want?',
      description: 'The 90/10 problem - solved with role model discovery system',
      position: { x: 400, y: 250 },
      docs: ['CLAUDE.md#user-experience-research'],
      status: 'completed',
      next: ['roleModelDiscovery']
    },
    roleModelDiscovery: {
      id: 'roleModelDiscovery',
      type: 'process',
      label: 'Role Model Discovery',
      description: '22 historical figures with gamified selection interface',
      position: { x: 400, y: 350 },
      docs: ['CLAUDE.md#completed-features', 'src/components/lightwalker/GamifiedDiscoveryEnhanced.tsx'],
      status: 'completed',
      next: ['enhancedAttributes']
    },
    enhancedAttributes: {
      id: 'enhancedAttributes',
      type: 'process',
      label: 'Enhanced Attributes Selection',
      description: '6th-grade explanations, benefits, methods for each trait',
      position: { x: 400, y: 450 },
      docs: ['scripts/seed-role-models.ts#enhancedAttributes'],
      status: 'completed',
      next: ['characterSynthesis']
    },
    characterSynthesis: {
      id: 'characterSynthesis',
      type: 'process',
      label: 'Character Synthesis',
      description: 'Combine role model + selected traits into unified Lightwalker™',
      position: { x: 400, y: 550 },
      docs: ['CLAUDE.md#next-development-phase'],
      status: 'in-progress',
      next: ['characterReady']
    },
    characterReady: {
      id: 'characterReady',
      type: 'process',
      label: 'Lightwalker™ Character Created',
      description: 'Complete personality with selected role model traits and methods',
      position: { x: 400, y: 650 },
      docs: ['CLAUDE.md#next-development-phase'],
      status: 'planned',
      next: ['firstInteraction']
    },
    firstInteraction: {
      id: 'firstInteraction',
      type: 'process',
      label: 'First Lightwalker™ Message',
      description: '"I embody the traits you selected from [Role Model]..."',
      position: { x: 400, y: 750 },
      docs: ['CLAUDE.md#immediate-priorities'],
      status: 'planned',
      next: ['dailyLoop']
    },
    dailyLoop: {
      id: 'dailyLoop',
      type: 'subprocess',
      label: 'Daily Behavior Copying System',
      description: 'Morning check-ins, real-time suggestions, evening reflection',
      position: { x: 400, y: 850 },
      docs: ['CLAUDE.md#immediate-priorities'],
      status: 'planned',
      next: ['morningShare', 'activityNotification', 'eveningReflection']
    },
    morningShare: {
      id: 'morningShare',
      type: 'data',
      label: 'Morning Check-in',
      description: '"What situations will you face today?"',
      position: { x: 100, y: 950 },
      docs: ['Lightwalker-brainstorm.md#real-time-life-sharing'],
      status: 'planned',
      next: ['copyDecision']
    },
    activityNotification: {
      id: 'activityNotification',
      type: 'data',
      label: 'Real-time Suggestions',
      description: '"In this situation, I would [Role Model Method]..."',
      position: { x: 300, y: 950 },
      docs: ['user-preferences-specification.md#message-type-controls'],
      status: 'planned',
      next: ['copyDecision']
    },
    eveningReflection: {
      id: 'eveningReflection',
      type: 'data',
      label: 'Evening Reflection',
      description: '"How did you copy [Trait] today?"',
      position: { x: 500, y: 950 },
      docs: ['Lightwalker-brainstorm.md#evening-reflection'],
      status: 'planned',
      next: ['progressTracking']
    },
    copyDecision: {
      id: 'copyDecision',
      type: 'decision',
      label: 'User Copies Behavior?',
      description: 'The core transformation mechanism - voluntary copying',
      position: { x: 400, y: 1050 },
      docs: ['Lightwalker-brainstorm.md#revolutionary-success-measurement'],
      status: 'planned',
      next: ['logActivity', 'continueObserving']
    },
    logActivity: {
      id: 'logActivity',
      type: 'process',
      label: 'Log Copying Activity',
      description: 'Track what user copies without judgment',
      position: { x: 300, y: 1150 },
      docs: ['Lightwalker-brainstorm.md#process-focused-progress-tracking'],
      status: 'planned',
      next: ['progressTracking']
    },
    continueObserving: {
      id: 'continueObserving',
      type: 'process',
      label: 'Continue Observing',
      description: 'No pressure to copy',
      position: { x: 500, y: 1150 },
      docs: ['Lightwalker-brainstorm.md#choice-based-transformation-psychology'],
      status: 'planned',
      next: ['dailyLoop']
    },
    progressTracking: {
      id: 'progressTracking',
      type: 'process',
      label: 'Update Progress Charts',
      description: 'Visual dopamine hits from upward trends',
      position: { x: 400, y: 1250 },
      docs: ['Lightwalker-brainstorm.md#motivation-fuel-system'],
      status: 'planned',
      next: ['transformationCheck']
    },
    transformationCheck: {
      id: 'transformationCheck',
      type: 'decision',
      label: 'Transformation Occurring?',
      description: 'User naturally becoming their Lightwalker',
      position: { x: 400, y: 1350 },
      docs: ['Lightwalker-brainstorm.md#long-term-relationship-development'],
      status: 'planned',
      next: ['evolveCharacter', 'maintainSupport']
    },
    evolveCharacter: {
      id: 'evolveCharacter',
      type: 'process',
      label: 'Evolve Lightwalker',
      description: 'Add complexity, new dimensions',
      position: { x: 200, y: 1450 },
      docs: ['multi-dimensional-character-architecture.md#progressive-character-building-interface'],
      status: 'planned',
      next: ['advancedFeatures']
    },
    maintainSupport: {
      id: 'maintainSupport',
      type: 'process',
      label: 'Continue Current Support',
      description: 'Steady progress with existing character',
      position: { x: 600, y: 1450 },
      docs: ['user-preferences-specification.md'],
      status: 'planned',
      next: ['dailyLoop']
    },
    advancedFeatures: {
      id: 'advancedFeatures',
      type: 'subprocess',
      label: 'Advanced Features',
      description: 'Gamification, social sharing, multiple Lightwalkers',
      position: { x: 200, y: 1550 },
      docs: ['Lightwalker-brainstorm.md#future-feature-ideas'],
      status: 'planned',
      next: ['success']
    },
    success: {
      id: 'success',
      type: 'terminator',
      label: 'User Transformed',
      description: 'Natural embodiment of ideal self',
      position: { x: 400, y: 1650 },
      docs: ['Lightwalker-brainstorm.md#core-mission'],
      status: 'planned',
      next: []
    }
  };

  // Connection paths  
  const connections = [
    { from: 'start', to: 'onboarding', label: '' },
    { from: 'onboarding', to: 'problemCheck', label: '' },
    { from: 'problemCheck', to: 'roleModelDiscovery', label: 'Discovery System' },
    { from: 'roleModelDiscovery', to: 'enhancedAttributes', label: '' },
    { from: 'enhancedAttributes', to: 'characterSynthesis', label: '' },
    { from: 'characterSynthesis', to: 'characterReady', label: '' },
    { from: 'characterReady', to: 'firstInteraction', label: '' },
    { from: 'firstInteraction', to: 'dailyLoop', label: '' },
    { from: 'dailyLoop', to: 'morningShare', label: '' },
    { from: 'dailyLoop', to: 'activityNotification', label: '' },
    { from: 'dailyLoop', to: 'eveningReflection', label: '' },
    { from: 'morningShare', to: 'copyDecision', label: '' },
    { from: 'activityNotification', to: 'copyDecision', label: '' },
    { from: 'eveningReflection', to: 'copyDecision', label: '' },
    { from: 'copyDecision', to: 'logActivity', label: 'Yes' },
    { from: 'copyDecision', to: 'continueObserving', label: 'No' },
    { from: 'logActivity', to: 'progressTracking', label: '' },
    { from: 'continueObserving', to: 'dailyLoop', label: '' },
    { from: 'progressTracking', to: 'transformationCheck', label: '' },
    { from: 'transformationCheck', to: 'evolveCharacter', label: 'Yes' },
    { from: 'transformationCheck', to: 'maintainSupport', label: 'Not Yet' },
    { from: 'evolveCharacter', to: 'advancedFeatures', label: '' },
    { from: 'maintainSupport', to: 'dailyLoop', label: '' },
    { from: 'advancedFeatures', to: 'success', label: '' }
  ];

  const getNodeShape = (type) => {
    switch (type) {
      case 'terminator':
        return 'rounded-full';
      case 'process':
        return 'rounded-lg';
      case 'decision':
        return 'transform rotate-45';
      case 'data':
        return 'parallelogram';
      case 'subprocess':
        return 'rounded-lg border-double border-4';
      default:
        return 'rounded-lg';
    }
  };

  const getNodeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-800 border-green-600';
      case 'in-progress':
        return 'bg-blue-800 border-blue-600';
      case 'planned':
        return 'bg-gray-800 border-gray-600';
      default:
        return 'bg-gray-800 border-gray-600';
    }
  };

  const getNodeIcon = (id) => {
    const icons = {
      'start': User,
      'problemCheck': Brain,
      'userQuestion': MessageCircle,
      'progressTracking': TrendingUp,
      'success': Trophy,
      'evolveCharacter': Settings,
      'transformationCheck': Heart
    };
    const Icon = icons[id] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const renderNode = (nodeId) => {
    const node = userJourney[nodeId];
    if (!node) return null;

    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode === node.id;

    return (
      <div
        key={node.id}
        className={`
          absolute flex items-center justify-center
          ${node.type === 'decision' ? 'w-24 h-24' : node.type === 'data' ? 'w-32 h-16' : 'w-40 h-20'}
          ${getNodeShape(node.type)}
          ${getNodeColor(node.status)}
          border-2 cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-4 ring-blue-400 scale-110' : ''}
          ${isHovered ? 'scale-105 shadow-xl' : ''}
        `}
        style={{
          left: `${node.position.x - 80}px`,
          top: `${node.position.y - 40}px`,
        }}
        onClick={() => setSelectedNode(node)}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div className={`${node.type === 'decision' ? 'transform -rotate-45' : ''} text-center p-2`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            {getNodeIcon(node.id)}
            <span className="text-xs font-semibold">{node.label}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderConnection = (connection) => {
    const fromNode = userJourney[connection.from];
    const toNode = userJourney[connection.to];
    if (!fromNode || !toNode) return null;

    const startX = fromNode.position.x;
    const startY = fromNode.position.y;
    const endX = toNode.position.x;
    const endY = toNode.position.y;

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    return (
      <g key={`${connection.from}-${connection.to}`}>
        <path
          d={`M ${startX} ${startY} Q ${midX} ${startY}, ${midX} ${midY} T ${endX} ${endY}`}
          fill="none"
          stroke="#4B5563"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        {connection.label && (
          <text
            x={midX}
            y={midY}
            fill="#9CA3AF"
            fontSize="12"
            textAnchor="middle"
            className="bg-gray-900"
          >
            {connection.label}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Flowchart Area */}
      <div className="flex-1 relative overflow-auto">
        <div className="absolute inset-0 min-w-[1000px] min-h-[1800px]">
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#4B5563" />
              </marker>
            </defs>
            {connections.map(renderConnection)}
          </svg>

          {/* Render nodes */}
          {Object.keys(userJourney).map(renderNode)}
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold mb-2">User Journey Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-800 border-2 border-green-600 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-800 border-2 border-blue-600 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border-2 border-gray-600 rounded"></div>
              <span>Planned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <div className="w-96 bg-gray-800 p-6 border-l border-gray-700 overflow-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            {getNodeIcon(selectedNode.id)}
            {selectedNode.label}
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Description</div>
              <p className="text-sm">{selectedNode.description}</p>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <span className={`
                inline-block px-3 py-1 rounded-full text-xs font-medium
                ${selectedNode.status === 'completed' ? 'bg-green-900 text-green-300' : ''}
                ${selectedNode.status === 'in-progress' ? 'bg-blue-900 text-blue-300' : ''}
                ${selectedNode.status === 'planned' ? 'bg-gray-700 text-gray-300' : ''}
              `}>
                {selectedNode.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            {selectedNode.docs && selectedNode.docs.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Supporting Documentation</div>
                <div className="space-y-2">
                  {selectedNode.docs.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-blue-400 hover:underline cursor-pointer">
                        {doc}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedNode.next && selectedNode.next.length > 0 && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Next Steps</div>
                <div className="space-y-1">
                  {selectedNode.next.map(nextId => {
                    const nextNode = userJourney[nextId];
                    if (!nextNode) return null;
                    return (
                      <div
                        key={nextId}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-400"
                        onClick={() => setSelectedNode(nextNode)}
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>{nextNode.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-3">
                Click on documentation links to reference in new chat sessions
              </p>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm">
                Continue Development Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightwalkerUserFlowchart;