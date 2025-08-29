import { FeatureFlags } from "../shared/types";

// Detect Supabase environment
const hasSupabaseEnv = !!(
  (import.meta as any).env?.VITE_SUPABASE_URL && 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
);

// Default feature flags
export const defaultFeatureFlags: FeatureFlags = {
  supabaseOn: hasSupabaseEnv,
  serverFallback: false,
  plannerLLM: false,
  localOnlyMode: false,
};

// Configuration constants
export const config = {
  // IndexedDB settings
  indexedDB: {
    name: "toolforge-db",
    version: 1,
    artifactCacheSizeMB: 200,
    artifactTTLDays: 60,
    recentToolsLimit: 10,
  },
  
  // Supabase settings
  supabase: {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || "",
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "",
  },
  
  // UI settings
  ui: {
    defaultPageSize: 20,
    maxFileUploadMB: 50,
  },
} as const;

// Runtime feature flag management
class FeatureFlagManager {
  private flags: FeatureFlags;
  private listeners: Set<(flags: FeatureFlags) => void> = new Set();

  constructor() {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem("toolforge-feature-flags");
    this.flags = stored 
      ? { ...defaultFeatureFlags, ...JSON.parse(stored) }
      : { ...defaultFeatureFlags };
  }

  get(): FeatureFlags {
    return { ...this.flags };
  }

  set(updates: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...updates };
    localStorage.setItem("toolforge-feature-flags", JSON.stringify(this.flags));
    this.listeners.forEach(listener => listener(this.flags));
  }

  subscribe(listener: (flags: FeatureFlags) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const featureFlags = new FeatureFlagManager();