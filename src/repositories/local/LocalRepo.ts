import { v4 as uuidv4 } from 'uuid';
import { ToolRepo, ToolSpec, ToolMeta, LocalToolSpec } from '../../../shared/types';
import { specHash } from '../../../shared/canonicalize';
import { db } from './database';
import { config } from '../../config';
import { artifactStorage, ArtifactMeta } from './ArtifactStorage';

export class LocalRepo implements ToolRepo {
  private async generateId(): Promise<string> {
    return `local:${uuidv4()}`;
  }

  async get(id: string): Promise<{ spec: ToolSpec; meta: ToolMeta } | null> {
    try {
      const localTool = await db.local_toolspecs.get(id);
      if (!localTool) return null;

      // Update recent access
      await this.addToRecent(id);

      return {
        spec: localTool.spec,
        meta: {
          id: localTool.id,
          owner: null,
          name: localTool.meta.name,
          specHash: await specHash(localTool.spec),
          isPublic: localTool.meta.isPublic,
          updatedAt: localTool.meta.updatedAt,
          source: "local"
        }
      };
    } catch (error) {
      console.error('Failed to get local tool:', error);
      return null;
    }
  }

  async list(params?: {
    limit?: number;
    ownerOnly?: boolean;
    query?: string;
  }): Promise<ToolMeta[]> {
    try {
      let collection = db.local_toolspecs.orderBy('meta.updatedAt').reverse();

      // Apply text search filter
      if (params?.query) {
        const query = params.query.toLowerCase();
        collection = collection.filter(tool => 
          tool.spec.name.toLowerCase().includes(query) ||
          tool.spec.summary.toLowerCase().includes(query)
        );
      }

      // Apply limit
      if (params?.limit) {
        collection = collection.limit(params.limit);
      }

      const tools = await collection.toArray();

      return Promise.all(tools.map(async (tool): Promise<ToolMeta> => ({
        id: tool.id,
        owner: null,
        name: tool.meta.name,
        specHash: await specHash(tool.spec),
        isPublic: tool.meta.isPublic,
        updatedAt: tool.meta.updatedAt,
        source: "local"
      })));
    } catch (error) {
      console.error('Failed to list local tools:', error);
      return [];
    }
  }

  async save(spec: ToolSpec, meta?: Partial<ToolMeta>): Promise<ToolMeta> {
    try {
      const now = new Date().toISOString();
      const hash = await specHash(spec);
      
      // Check if tool with same spec hash already exists
      const existing = await db.local_toolspecs
        .filter(tool => JSON.stringify(tool.spec) === JSON.stringify(spec))
        .first();

      let id: string;
      if (existing && meta?.id === existing.id) {
        // Update existing tool
        id = existing.id;
        await db.local_toolspecs.update(id, {
          spec,
          meta: {
            name: meta?.name || spec.name,
            updatedAt: now,
            isPublic: meta?.isPublic ?? existing.meta.isPublic
          }
        });
      } else {
        // Create new tool
        id = meta?.id || await this.generateId();
        const localTool: LocalToolSpec = {
          id,
          spec,
          meta: {
            name: meta?.name || spec.name,
            updatedAt: now,
            isPublic: meta?.isPublic ?? true
          }
        };
        await db.local_toolspecs.put(localTool);
      }

      // Add to recent
      await this.addToRecent(id);

      return {
        id,
        owner: null,
        name: meta?.name || spec.name,
        specHash: hash,
        isPublic: meta?.isPublic ?? true,
        updatedAt: now,
        source: "local"
      };
    } catch (error) {
      console.error('Failed to save local tool:', error);
      throw new Error('Failed to save tool locally');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await Promise.all([
        db.local_toolspecs.delete(id),
        db.recent.delete(id),
        db.favorites.delete(id)
      ]);
    } catch (error) {
      console.error('Failed to delete local tool:', error);
      throw new Error('Failed to delete tool');
    }
  }

  async favorite(id: string, on: boolean): Promise<void> {
    try {
      if (on) {
        await db.favorites.put({ id });
      } else {
        await db.favorites.delete(id);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
      throw new Error('Failed to update favorite');
    }
  }

  async isFavorite(id: string): Promise<boolean> {
    try {
      const favorite = await db.favorites.get(id);
      return !!favorite;
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  }

  async getRecent(limit: number = config.indexedDB.recentToolsLimit): Promise<string[]> {
    try {
      const recent = await db.recent
        .orderBy('timestamp')
        .reverse()
        .limit(limit)
        .toArray();
      return recent.map(r => r.id);
    } catch (error) {
      console.error('Failed to get recent tools:', error);
      return [];
    }
  }

  private async addToRecent(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Update or insert recent entry
      await db.recent.put({ id, timestamp: now });
      
      // Clean up old entries beyond limit
      const recent = await db.recent
        .orderBy('timestamp')
        .reverse()
        .offset(config.indexedDB.recentToolsLimit)
        .toArray();
      
      if (recent.length > 0) {
        await db.recent.bulkDelete(recent.map(r => r.id));
      }
    } catch (error) {
      console.error('Failed to update recent tools:', error);
    }
  }

  async exportToJSON(): Promise<string> {
    try {
      const tools = await db.local_toolspecs.toArray();
      return JSON.stringify(tools, null, 2);
    } catch (error) {
      console.error('Failed to export tools:', error);
      throw new Error('Failed to export tools');
    }
  }

  async importFromJSON(jsonData: string): Promise<number> {
    try {
      const tools: LocalToolSpec[] = JSON.parse(jsonData);
      let imported = 0;
      
      for (const tool of tools) {
        if (tool.spec && tool.meta) {
          await this.save(tool.spec, tool.meta);
          imported++;
        }
      }
      
      return imported;
    } catch (error) {
      console.error('Failed to import tools:', error);
      throw new Error('Failed to import tools');
    }
  }

  async clearAllData(): Promise<void> {
    return await db.clearAllData();
  }

  async getCacheSize(): Promise<number> {
    const dbSize = await db.getCacheSize();
    const artifactStats = await artifactStorage.getStats();
    return dbSize + artifactStats.totalSize;
  }

  // Artifact storage methods
  async storeArtifact(
    data: Blob,
    filename: string,
    options: {
      toolId?: string;
      description?: string;
      ttlDays?: number;
    } = {}
  ): Promise<string> {
    return await artifactStorage.store(data, {
      filename,
      mimeType: data.type || 'application/octet-stream',
      toolId: options.toolId,
      description: options.description,
    }, {
      ttlDays: options.ttlDays,
    });
  }

  async getArtifact(id: string): Promise<{ data: Blob; meta: ArtifactMeta } | null> {
    const artifact = await artifactStorage.get(id);
    if (!artifact) return null;

    return {
      data: artifact.data,
      meta: {
        id: artifact.id,
        filename: artifact.metadata.filename,
        mimeType: artifact.metadata.mimeType,
        size: artifact.metadata.size,
        toolId: artifact.metadata.toolId,
        description: artifact.metadata.description,
        createdAt: artifact.createdAt,
        lastAccessed: artifact.lastAccessed,
        ttlExpiry: artifact.ttlExpiry,
      }
    };
  }

  async listArtifacts(options: {
    toolId?: string;
    limit?: number;
  } = {}): Promise<ArtifactMeta[]> {
    return await artifactStorage.list(options);
  }

  async deleteArtifact(id: string): Promise<void> {
    await artifactStorage.delete(id);
  }

  async downloadArtifact(id: string, filename?: string): Promise<void> {
    await artifactStorage.download(id, filename);
  }

  async createArtifactBlobUrl(id: string): Promise<string | null> {
    return await artifactStorage.createBlobUrl(id);
  }

  async getArtifactStats(): Promise<{
    totalSize: number;
    totalCount: number;
    maxSize: number;
    oldestArtifact?: ArtifactMeta;
    newestArtifact?: ArtifactMeta;
  }> {
    return await artifactStorage.getStats();
  }

  async cleanupExpiredArtifacts(): Promise<number> {
    return await artifactStorage.cleanupExpired();
  }

  async clearArtifacts(): Promise<void> {
    await artifactStorage.clear();
  }
}