// Feature flags and configuration
export const config = {
  features: {
    plannerLLM: false,
    serverFallback: false,
    supabaseOn: false,
    localOnlyMode: false,
  },
  limits: {
    undoHistorySize: 20,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxBatchFiles: 100,
  },
  storage: {
    toolSpecsKey: 'toolforge.toolspecs',
    settingsKey: 'toolforge.settings',
    recentToolsKey: 'toolforge-recent-storage',
  }
} as const;

// Debug panel control
export const isDebugMode = () => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === '1';
};

// Feature flag helpers
export const getFeatureFlag = (flag: keyof typeof config.features): boolean => {
  if (typeof window === 'undefined') return config.features[flag];
  
  const stored = localStorage.getItem('toolforge.feature-flags');
  if (stored) {
    try {
      const flags = JSON.parse(stored);
      return flags[flag] ?? config.features[flag];
    } catch {
      return config.features[flag];
    }
  }
  return config.features[flag];
};

export const setFeatureFlag = (flag: keyof typeof config.features, value: boolean): void => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('toolforge.feature-flags');
  let flags = {};
  
  if (stored) {
    try {
      flags = JSON.parse(stored);
    } catch {
      flags = {};
    }
  }
  
  flags = { ...flags, [flag]: value };
  localStorage.setItem('toolforge.feature-flags', JSON.stringify(flags));
};