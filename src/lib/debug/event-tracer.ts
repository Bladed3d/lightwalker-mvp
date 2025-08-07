/**
 * Centralized Event Tracing System for Lightwalker
 * 
 * Tracks all state changes, function calls, and system events
 * with complete audit trails and stack traces.
 */

export interface EventTrace {
  id: string;
  eventId: string;
  source: string;
  action: string;
  data?: any;
  timestamp: number;
  stack?: string;
  parent?: string;
}

class EventTracer {
  private static traces = new Map<string, EventTrace[]>();
  private static enabled = process.env.NODE_ENV === 'development';
  private static currentContext: string | null = null;

  static trace(eventId: string, source: string, action: string, data?: any): string {
    if (!this.enabled) return eventId;

    const traceId = `${eventId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stackTrace = new Error().stack;

    const trace: EventTrace = {
      id: traceId,
      eventId,
      source,
      action,
      data,
      timestamp: Date.now(),
      stack: stackTrace,
      parent: this.currentContext
    };

    if (!this.traces.has(eventId)) {
      this.traces.set(eventId, []);
    }
    this.traces.get(eventId)!.push(trace);

    // Console output with context
    console.group(`🔍 [${source}] ${action}`);
    console.log('Event ID:', eventId);
    console.log('Trace ID:', traceId);
    console.log('Data:', data);
    console.log('Timestamp:', new Date(trace.timestamp).toLocaleTimeString());
    if (trace.parent) console.log('Parent Context:', trace.parent);
    console.groupEnd();

    // In dev, add to window for console access
    if (typeof window !== 'undefined') {
      (window as any).__LIGHTWALKER_TRACE__ = this.traces;
    }

    return traceId;
  }

  static setContext(contextId: string) {
    this.currentContext = contextId;
  }

  static clearContext() {
    this.currentContext = null;
  }

  static getEventHistory(eventId: string): EventTrace[] {
    return this.traces.get(eventId) || [];
  }

  static getFullChain(traceId: string): EventTrace[] {
    const chain: EventTrace[] = [];
    let current = this.findTrace(traceId);

    while (current) {
      chain.unshift(current);
      current = current.parent ? this.findTrace(current.parent) : null;
    }

    return chain;
  }

  private static findTrace(traceId: string): EventTrace | null {
    for (const [, traces] of this.traces) {
      const found = traces.find(t => t.id === traceId);
      if (found) return found;
    }
    return null;
  }

  static getAllTraces(): Map<string, EventTrace[]> {
    return new Map(this.traces);
  }

  static clear() {
    this.traces.clear();
    if (typeof window !== 'undefined') {
      (window as any).__LIGHTWALKER_TRACE__ = new Map();
    }
  }
}

export { EventTracer };