import Dexie from 'dexie';
import { config } from '../../config';

export interface StoredArtifact {
  id: string;
  data: Blob;
  metadata: {
    filename: string;
    mimeType: string;
    size: number;
    toolId?: string;
    description?: string;
  };
  createdAt: string;
  lastAccessed: string;
  ttlExpiry: string; // ISO date when this artifact expires
}

export interface ArtifactMeta {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  toolId?: string;
  description?: string;
  createdAt: string;
  lastAccessed: string;
  ttlExpiry: string;
}

class ArtifactStorageDB extends Dexie {
  artifacts!: Dexie.Table<StoredArtifact, string>;

  constructor() {
    super('ArtifactStorage');
    this.version(1).stores({
      artifacts: 'id, createdAt, lastAccessed, ttlExpiry, metadata.size, metadata.toolId'
    });
  }
}

export class ArtifactStorage {
  private db: ArtifactStorageDB;
  private maxCacheSizeBytes: number;
  private defaultTTLDays: number;

  constructor() {
    this.db = new ArtifactStorageDB();
    this.maxCacheSizeBytes = config.indexedDB.artifactCacheSizeMB * 1024 * 1024;
    this.defaultTTLDays = config.indexedDB.artifactTTLDays;
  }

  /**
   * Store an artifact with automatic LRU cache management
   */
  async store(
    data: Blob,
    metadata: Omit<StoredArtifact['metadata'], 'size'>,
    options: {
      ttlDays?: number;
      customId?: string;
    } = {}
  ): Promise<string> {
    const id = options.customId || this.generateId();
    const now = new Date().toISOString();
    const ttlExpiry = new Date(
      Date.now() + (options.ttlDays || this.defaultTTLDays) * 24 * 60 * 60 * 1000
    ).toISOString();

    const artifact: StoredArtifact = {
      id,
      data,
      metadata: {
        ...metadata,
        size: data.size,
      },
      createdAt: now,
      lastAccessed: now,
      ttlExpiry,
    };

    // Clean up expired artifacts first
    await this.cleanupExpired();

    // Ensure we have space (LRU eviction)
    await this.ensureSpace(data.size);

    // Store the artifact
    await this.db.artifacts.put(artifact);

    return id;
  }

  /**
   * Retrieve an artifact by ID
   */
  async get(id: string): Promise<StoredArtifact | null> {
    const artifact = await this.db.artifacts.get(id);
    
    if (!artifact) {
      return null;
    }

    // Check if expired
    if (new Date(artifact.ttlExpiry) < new Date()) {
      await this.delete(id);
      return null;
    }

    // Update last accessed time
    await this.db.artifacts.update(id, {
      lastAccessed: new Date().toISOString()
    });

    return artifact;
  }

  /**
   * Get artifact metadata without the blob data
   */
  async getMeta(id: string): Promise<ArtifactMeta | null> {
    const artifact = await this.db.artifacts.get(id);
    
    if (!artifact) {
      return null;
    }

    // Check if expired
    if (new Date(artifact.ttlExpiry) < new Date()) {
      await this.delete(id);
      return null;
    }

    return {
      id: artifact.id,
      filename: artifact.metadata.filename,
      mimeType: artifact.metadata.mimeType,
      size: artifact.metadata.size,
      toolId: artifact.metadata.toolId,
      description: artifact.metadata.description,
      createdAt: artifact.createdAt,
      lastAccessed: artifact.lastAccessed,
      ttlExpiry: artifact.ttlExpiry,
    };
  }

  /**
   * List all artifacts with metadata only
   */
  async list(options: {
    toolId?: string;
    limit?: number;
    includeExpired?: boolean;
  } = {}): Promise<ArtifactMeta[]> {
    let query = this.db.artifacts.orderBy('lastAccessed').reverse();

    if (options.toolId) {
      query = query.filter(artifact => artifact.metadata.toolId === options.toolId);
    }

    if (!options.includeExpired) {
      const now = new Date();
      query = query.filter(artifact => new Date(artifact.ttlExpiry) > now);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const artifacts = await query.toArray();

    return artifacts.map(artifact => ({
      id: artifact.id,
      filename: artifact.metadata.filename,
      mimeType: artifact.metadata.mimeType,
      size: artifact.metadata.size,
      toolId: artifact.metadata.toolId,
      description: artifact.metadata.description,
      createdAt: artifact.createdAt,
      lastAccessed: artifact.lastAccessed,
      ttlExpiry: artifact.ttlExpiry,
    }));
  }

  /**
   * Delete an artifact
   */
  async delete(id: string): Promise<void> {
    await this.db.artifacts.delete(id);
  }

  /**
   * Clean up expired artifacts
   */
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    const expired = await this.db.artifacts
      .filter(artifact => new Date(artifact.ttlExpiry) <= now)
      .toArray();

    if (expired.length > 0) {
      await this.db.artifacts.bulkDelete(expired.map(a => a.id));
    }

    return expired.length;
  }

  /**
   * Get current cache size and statistics
   */
  async getStats(): Promise<{
    totalSize: number;
    totalCount: number;
    maxSize: number;
    oldestArtifact?: ArtifactMeta;
    newestArtifact?: ArtifactMeta;
  }> {
    const artifacts = await this.db.artifacts.orderBy('lastAccessed').toArray();
    const totalSize = artifacts.reduce((sum, artifact) => sum + artifact.metadata.size, 0);

    let oldestArtifact: ArtifactMeta | undefined;
    let newestArtifact: ArtifactMeta | undefined;

    if (artifacts.length > 0) {
      const oldest = artifacts[0];
      const newest = artifacts[artifacts.length - 1];

      oldestArtifact = {
        id: oldest.id,
        filename: oldest.metadata.filename,
        mimeType: oldest.metadata.mimeType,
        size: oldest.metadata.size,
        toolId: oldest.metadata.toolId,
        description: oldest.metadata.description,
        createdAt: oldest.createdAt,
        lastAccessed: oldest.lastAccessed,
        ttlExpiry: oldest.ttlExpiry,
      };

      newestArtifact = {
        id: newest.id,
        filename: newest.metadata.filename,
        mimeType: newest.metadata.mimeType,
        size: newest.metadata.size,
        toolId: newest.metadata.toolId,
        description: newest.metadata.description,
        createdAt: newest.createdAt,
        lastAccessed: newest.lastAccessed,
        ttlExpiry: newest.ttlExpiry,
      };
    }

    return {
      totalSize,
      totalCount: artifacts.length,
      maxSize: this.maxCacheSizeBytes,
      oldestArtifact,
      newestArtifact,
    };
  }

  /**
   * Clear all artifacts
   */
  async clear(): Promise<void> {
    await this.db.artifacts.clear();
  }

  /**
   * Ensure we have space for a new artifact by implementing LRU eviction
   */
  private async ensureSpace(newItemSize: number): Promise<void> {
    const stats = await this.getStats();
    const spaceNeeded = stats.totalSize + newItemSize - this.maxCacheSizeBytes;

    if (spaceNeeded <= 0) {
      return; // We have enough space
    }

    // Get artifacts ordered by last accessed (oldest first)
    const artifacts = await this.db.artifacts.orderBy('lastAccessed').toArray();
    
    let spaceFreed = 0;
    const toDelete: string[] = [];

    for (const artifact of artifacts) {
      toDelete.push(artifact.id);
      spaceFreed += artifact.metadata.size;
      
      if (spaceFreed >= spaceNeeded) {
        break;
      }
    }

    if (toDelete.length > 0) {
      await this.db.artifacts.bulkDelete(toDelete);
    }
  }

  /**
   * Generate a unique ID for artifacts
   */
  private generateId(): string {
    return `artifact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a blob URL for an artifact (remember to revoke when done)
   */
  async createBlobUrl(id: string): Promise<string | null> {
    const artifact = await this.get(id);
    if (!artifact) {
      return null;
    }

    return URL.createObjectURL(artifact.data);
  }

  /**
   * Download an artifact directly
   */
  async download(id: string, filename?: string): Promise<void> {
    const artifact = await this.get(id);
    if (!artifact) {
      throw new Error('Artifact not found');
    }

    const url = URL.createObjectURL(artifact.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || artifact.metadata.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const artifactStorage = new ArtifactStorage();