import Dexie, { Table } from 'dexie';
// Simple hash function using SubtleCrypto API
async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
import { CONFIG } from '../config';

// Cache entry types
export interface PlanCacheEntry {
  id: string;
  userText: string;
  normalizedIntent: string;
  registryVersion: string;
  constraints: string; // JSON serialized constraints
  toolSpec: string;    // JSON serialized ToolSpec v1.1
  createdAt: number;
  expiresAt: number;
}

export interface AnalyticsCacheEntry {
  id: string;
  event: string;
  payload: string; // JSON serialized event data
  timestamp: number;
  synced: boolean;
}

// Dexie database definition
class ToolForgeDB extends Dexie {
  planCache!: Table<PlanCacheEntry>;
  analytics!: Table<AnalyticsCacheEntry>;

  constructor() {
    super('ToolForgeDB');
    
    this.version(1).stores({
      planCache: 'id, normalizedIntent, createdAt, expiresAt',
      analytics: 'id, event, timestamp, synced'
    });
  }
}

const db = new ToolForgeDB();

// Utility functions
export async function generateCacheKey(
  normalizedIntent: string,
  registryVersion: string,
  constraints: any
): Promise<string> {
  const input = `${normalizedIntent}|${registryVersion}|${JSON.stringify(constraints)}`;
  return await sha256Hash(input);
}

export async function generateSpecHash(spec: any): Promise<string> {
  // Create a stable string representation for hashing
  const stableSpec = JSON.stringify(spec, Object.keys(spec).sort());
  return await sha256Hash(stableSpec);
}

// Plan cache operations
export async function getCachedPlan(cacheKey: string): Promise<any | null> {
  try {
    const entry = await db.planCache.get(cacheKey);
    
    if (!entry) {
      return null;
    }
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      await db.planCache.delete(cacheKey);
      return null;
    }
    
    return JSON.parse(entry.toolSpec);
  } catch (error) {
    console.warn('Failed to retrieve cached plan:', error);
    return null;
  }
}

export async function setCachedPlan(
  cacheKey: string,
  userText: string,
  normalizedIntent: string,
  registryVersion: string,
  constraints: any,
  toolSpec: any
): Promise<void> {
  try {
    const entry: PlanCacheEntry = {
      id: cacheKey,
      userText,
      normalizedIntent,
      registryVersion,
      constraints: JSON.stringify(constraints),
      toolSpec: JSON.stringify(toolSpec),
      createdAt: Date.now(),
      expiresAt: Date.now() + CONFIG.performance.cacheTimeout
    };
    
    await db.planCache.put(entry);
  } catch (error) {
    console.warn('Failed to cache plan:', error);
  }
}

// Analytics cache operations
export async function logAnalyticsEvent(event: string, payload: any): Promise<void> {
  try {
    const entry: AnalyticsCacheEntry = {
      id: `${Date.now()}-${Math.random()}`,
      event,
      payload: JSON.stringify(payload),
      timestamp: Date.now(),
      synced: false
    };
    
    await db.analytics.add(entry);
    
    // Keep analytics table size manageable
    const count = await db.analytics.count();
    if (count > 1000) {
      const oldEntries = await db.analytics
        .orderBy('timestamp')
        .limit(200)
        .toArray();
      
      await db.analytics.bulkDelete(oldEntries.map(e => e.id));
    }
  } catch (error) {
    console.warn('Failed to log analytics event:', error);
  }
}

export async function getUnsyncedAnalytics(): Promise<AnalyticsCacheEntry[]> {
  try {
    return await db.analytics.where('synced').equals(0).toArray(); // Use 0 instead of false
  } catch (error) {
    console.warn('Failed to retrieve unsynced analytics:', error);
    return [];
  }
}

export async function markAnalyticsSynced(ids: string[]): Promise<void> {
  try {
    for (const id of ids) {
      await db.analytics.update(id, { synced: true });
    }
  } catch (error) {
    console.warn('Failed to mark analytics as synced:', error);
  }
}

// Cache maintenance
export async function cleanupExpiredCache(): Promise<void> {
  try {
    const now = Date.now();
    await db.planCache.where('expiresAt').below(now).delete();
  } catch (error) {
    console.warn('Failed to cleanup expired cache:', error);
  }
}

// Initialize and cleanup on app start
export async function initializeCache(): Promise<void> {
  try {
    await cleanupExpiredCache();
  } catch (error) {
    console.warn('Failed to initialize cache:', error);
  }
}

// Export database for advanced usage
export { db };