// Client-only telemetry and analytics
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 1000;

  private log(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString()
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', analyticsEvent);
    }

    // Store in memory (could be sent to server later)
    this.events.push(analyticsEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('toolforge.analytics', JSON.stringify(this.events.slice(-100)));
    } catch (error) {
      console.warn('Failed to store analytics:', error);
    }
  }

  // Time To First Operation
  ttfo(duration: number): void {
    this.log('ttfo', { duration });
  }

  // Tool execution events
  toolRunStart(toolId: string, toolName: string): void {
    this.log('tool_run_start', { toolId, toolName });
  }

  toolRunSuccess(toolId: string, toolName: string, duration: number): void {
    this.log('tool_run_success', { toolId, toolName, duration });
  }

  toolRunFailure(toolId: string, toolName: string, error: string, duration: number): void {
    this.log('tool_run_failure', { toolId, toolName, error, duration });
  }

  // Tool management events
  toolSaved(toolId: string, toolName: string, isLocal: boolean): void {
    this.log('tool_saved', { toolId, toolName, isLocal });
  }

  toolImported(source: 'file' | 'paste', isValid: boolean): void {
    this.log('tool_imported', { source, isValid });
  }

  toolExported(toolId: string, toolName: string): void {
    this.log('tool_exported', { toolId, toolName });
  }

  // Navigation events
  paletteUsed(action: string): void {
    this.log('palette_used', { action });
  }

  navigationUsed(from: string, to: string): void {
    this.log('navigation', { from, to });
  }

  // Feature usage
  featureUsed(feature: string, context?: Record<string, any>): void {
    this.log('feature_used', { feature, ...context });
  }

  // Get stored events (for debugging)
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events
  clearEvents(): void {
    this.events = [];
    localStorage.removeItem('toolforge.analytics');
  }
}

export const analytics = new Analytics();

// Initialize TTFO tracking
if (typeof window !== 'undefined') {
  const startTime = performance.now();
  
  // Track when the first interactive element is available
  const observer = new MutationObserver(() => {
    const interactive = document.querySelector('[data-testid="main-composer"]');
    if (interactive) {
      const ttfo = performance.now() - startTime;
      analytics.ttfo(ttfo);
      observer.disconnect();
    }
  });
  
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}