// Repository exports for clean imports
export { LocalRepo } from './local/LocalRepo';
export { SupabaseRepo } from './supabase/SupabaseRepo';
export { CompositeRepo, toolRepo, type SyncResult } from './CompositeRepo';
export { db } from './local/database';

// Re-export types
export type {
  ToolRepo,
  ToolSpec,
  ToolMeta,
  LocalToolSpec,
  StoredArtifact,
  FeatureFlags
} from '../../shared/types';