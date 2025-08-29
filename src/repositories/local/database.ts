import Dexie, { Table } from 'dexie';
import { LocalToolSpec, StoredArtifact } from '../../../shared/types';
import { config } from '../../config';

export interface ToolForgeDB extends Dexie {
  local_toolspecs: Table<LocalToolSpec>;
  artifacts: Table<StoredArtifact>;
  recent: Table<{ id: string; timestamp: string }>;
  favorites: Table<{ id: string }>;
}

export class ToolForgeDatabase extends Dexie implements ToolForgeDB {
  local_toolspecs!: Table<LocalToolSpec>;
  artifacts!: Table<StoredArtifact>;
  recent!: Table<{ id: string; timestamp: string }>;
  favorites!: Table<{ id: string }>;

  constructor() {
    super(config.indexedDB.name);
    
    this.version(config.indexedDB.version).stores({
      local_toolspecs: 'id, spec.name, meta.updatedAt, meta.isPublic',
      artifacts: 'id, createdAt, lastAccessed, size',
      recent: 'id, timestamp',
      favorites: 'id'
    });

    // Add hooks for artifact cache management
    this.artifacts.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.lastAccessed = new Date().toISOString();
    });

    this.artifacts.hook('updating', (modifications, primKey, obj, trans) => {
      if (modifications) {
        (modifications as any).lastAccessed = new Date().toISOString();
      }
    });
  }

  /**
   * Clean up expired artifacts based on TTL
   */
  async cleanupArtifacts(): Promise<void> {
    const ttlMs = config.indexedDB.artifactTTLDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - ttlMs).toISOString();
    
    await this.artifacts
      .where('createdAt')
      .below(cutoffDate)
      .delete();
  }

  /**
   * Enforce LRU cache size limit for artifacts
   */
  async enforceCacheLimit(): Promise<void> {
    const maxSizeBytes = config.indexedDB.artifactCacheSizeMB * 1024 * 1024;
    
    // Get all artifacts sorted by last accessed (oldest first)
    const artifacts = await this.artifacts
      .orderBy('lastAccessed')
      .toArray();
    
    let totalSize = 0;
    const toDelete: string[] = [];
    
    // Calculate total size and mark old artifacts for deletion
    for (const artifact of artifacts.reverse()) {
      totalSize += artifact.size;
      if (totalSize > maxSizeBytes) {
        toDelete.push(artifact.id);
      }
    }
    
    // Delete oldest artifacts that exceed cache limit
    if (toDelete.length > 0) {
      await this.artifacts.bulkDelete(toDelete);
    }
  }

  /**
   * Get total cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    const artifacts = await this.artifacts.toArray();
    return artifacts.reduce((total, artifact) => total + artifact.size, 0);
  }

  /**
   * Clear all local data
   */
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.local_toolspecs.clear(),
      this.artifacts.clear(),
      this.recent.clear(),
      this.favorites.clear()
    ]);
  }
}

// Singleton instance
export const db = new ToolForgeDatabase();