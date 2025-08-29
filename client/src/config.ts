// Application configuration and feature flags

export const CONFIG = {
  // Feature flags
  features: {
    plannerLLM: false, // LLM-powered planner (requires API key)
    analytics: true,   // Usage analytics tracking
    offlineMode: true, // Offline capability with IndexedDB
  },
  
  // Performance settings
  performance: {
    maxFileSize: 100 * 1024 * 1024, // 100MB max file size
    maxFiles: 50,                   // Max files per tool
    cacheTimeout: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
  },
  
  // UI settings
  ui: {
    defaultTheme: 'pastel-glass',
    animationDuration: 200,
    maxWidgetHeight: 900, // Max height for live mode widgets
  },
  
  // Registry versions for cache invalidation
  versions: {
    toolSpec: '1.1',
    capabilities: '1.0',
    widgets: '1.0'
  }
};

// Environment-based overrides
if (import.meta.env.VITE_PLANNER_LLM === 'true') {
  CONFIG.features.plannerLLM = true;
}

if (import.meta.env.DEV) {
  CONFIG.performance.cacheTimeout = 60 * 60 * 1000; // 1 hour in development
}

export function getFeatureFlag(flag: keyof typeof CONFIG.features): boolean {
  return CONFIG.features[flag];
}

export function getPerformanceSetting(setting: keyof typeof CONFIG.performance): number {
  return CONFIG.performance[setting];
}

export function getUISetting(setting: keyof typeof CONFIG.ui): any {
  return CONFIG.ui[setting];
}