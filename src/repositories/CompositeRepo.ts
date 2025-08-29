import { ToolRepo, ToolSpec, ToolMeta } from '../../shared/types';
import { LocalRepo } from './local/LocalRepo';
import { SupabaseRepo } from './supabase/SupabaseRepo';
import { featureFlags } from '../config';

export type SyncResult = {
  localCount: number;
  cloudCount: number;
  merged: number;
  conflicts: number;
};

export class CompositeRepo implements ToolRepo {
  private localRepo: LocalRepo;
  private supabaseRepo: SupabaseRepo | null;
  
  constructor() {
    this.localRepo = new LocalRepo();
    
    // Only initialize Supabase repo if enabled
    const flags = featureFlags.get();
    this.supabaseRepo = flags.supabaseOn && !flags.localOnlyMode 
      ? new SupabaseRepo() 
      : null;
  }

  /**
   * Get tool by ID with cloud-first, local fallback strategy
   */
  async get(id: string): Promise<{ spec: ToolSpec; meta: ToolMeta } | null> {
    try {
      // Try cloud first if available
      if (this.supabaseRepo && !id.startsWith('local:')) {
        const cloudResult = await this.supabaseRepo.get(id);
        if (cloudResult) {
          // Cache locally for offline access
          await this.localRepo.save(cloudResult.spec, cloudResult.meta);
          return cloudResult;
        }
      }
      
      // Fallback to local
      return await this.localRepo.get(id);
    } catch (error) {
      console.error('Failed to get tool:', error);
      // Always try local as ultimate fallback
      return await this.localRepo.get(id);
    }
  }

  /**
   * List tools with merged results from both sources
   */
  async list(params?: {
    limit?: number;
    ownerOnly?: boolean;
    query?: string;
  }): Promise<ToolMeta[]> {
    try {
      const [localTools, cloudTools] = await Promise.allSettled([
        this.localRepo.list(params),
        this.supabaseRepo?.list(params) || Promise.resolve([])
      ]);

      const local = localTools.status === 'fulfilled' ? localTools.value : [];
      const cloud = cloudTools.status === 'fulfilled' ? cloudTools.value : [];

      // Merge and deduplicate by specHash, preferring newer tools
      const merged = this.mergeToolLists(local, cloud);
      
      // Apply additional filtering and sorting
      let result = merged;
      
      if (params?.limit) {
        result = result.slice(0, params.limit);
      }

      return result;
    } catch (error) {
      console.error('Failed to list tools:', error);
      // Fallback to local only
      return await this.localRepo.list(params);
    }
  }

  /**
   * Save tool with cloud-first, local fallback strategy
   */
  async save(spec: ToolSpec, meta?: Partial<ToolMeta>): Promise<ToolMeta> {
    const flags = featureFlags.get();
    
    try {
      // Always save locally first for immediate access
      const localMeta = await this.localRepo.save(spec, meta);
      
      // Try to save to cloud if available and not in local-only mode
      if (this.supabaseRepo && !flags.localOnlyMode) {
        try {
          const cloudMeta = await this.supabaseRepo.save(spec, meta);
          // Return cloud metadata on success
          return cloudMeta;
        } catch (cloudError) {
          console.warn('Failed to save to cloud, using local copy:', cloudError);
          // Return local metadata if cloud fails
          return localMeta;
        }
      }
      
      return localMeta;
    } catch (error) {
      console.error('Failed to save tool:', error);
      throw new Error('Failed to save tool');
    }
  }

  /**
   * Delete tool from both local and cloud
   */
  async delete(id: string): Promise<void> {
    const errors: string[] = [];
    
    // Try to delete from cloud first
    if (this.supabaseRepo && !id.startsWith('local:')) {
      try {
        await this.supabaseRepo.delete(id);
      } catch (error) {
        errors.push(`Cloud delete failed: ${error}`);
      }
    }
    
    // Always try to delete locally
    try {
      await this.localRepo.delete(id);
    } catch (error) {
      errors.push(`Local delete failed: ${error}`);
    }
    
    if (errors.length > 0) {
      console.warn('Delete had partial failures:', errors);
    }
  }

  /**
   * Manage favorites in both local and cloud
   */
  async favorite(id: string, on: boolean): Promise<void> {
    const errors: string[] = [];
    
    // Update cloud favorites if available
    if (this.supabaseRepo) {
      try {
        await this.supabaseRepo.favorite(id, on);
      } catch (error) {
        errors.push(`Cloud favorite update failed: ${error}`);
      }
    }
    
    // Always update local favorites
    try {
      await this.localRepo.favorite(id, on);
    } catch (error) {
      errors.push(`Local favorite update failed: ${error}`);
    }
    
    if (errors.length > 0) {
      console.warn('Favorite update had partial failures:', errors);
    }
  }

  /**
   * Check if tool is favorited (checks both local and cloud)
   */
  async isFavorite(id: string): Promise<boolean> {
    try {
      // Check cloud first if available
      if (this.supabaseRepo) {
        const cloudFavorite = await this.supabaseRepo.isFavorite(id);
        if (cloudFavorite) return true;
      }
      
      // Check local
      return await this.localRepo.isFavorite(id);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  }

  /**
   * Get recent tools from local storage (recent is always local)
   */
  async getRecent(limit?: number): Promise<string[]> {
    return await this.localRepo.getRecent(limit);
  }

  /**
   * Sync local and cloud tools, resolving conflicts by timestamp
   */
  async syncWithCloud(): Promise<SyncResult> {
    if (!this.supabaseRepo) {
      throw new Error('Cloud storage not available');
    }

    const flags = featureFlags.get();
    if (flags.localOnlyMode) {
      throw new Error('Cannot sync in local-only mode');
    }

    try {
      // Get all tools from both sources
      const [localTools, cloudTools] = await Promise.all([
        this.localRepo.list(),
        this.supabaseRepo.list()
      ]);

      let merged = 0;
      let conflicts = 0;

      // Create maps for efficient lookup
      const localMap = new Map(localTools.map(tool => [tool.specHash, tool]));
      const cloudMap = new Map(cloudTools.map(tool => [tool.specHash, tool]));

      // Sync cloud tools to local
      for (const cloudTool of cloudTools) {
        const localTool = localMap.get(cloudTool.specHash);
        
        if (!localTool) {
          // Tool only exists in cloud, download it
          const cloudData = await this.supabaseRepo.get(cloudTool.id);
          if (cloudData) {
            await this.localRepo.save(cloudData.spec, cloudData.meta);
            merged++;
          }
        } else if (new Date(cloudTool.updatedAt) > new Date(localTool.updatedAt)) {
          // Cloud version is newer, update local
          const cloudData = await this.supabaseRepo.get(cloudTool.id);
          if (cloudData) {
            await this.localRepo.save(cloudData.spec, cloudData.meta);
            merged++;
          }
        } else if (new Date(localTool.updatedAt) > new Date(cloudTool.updatedAt)) {
          // Local version is newer, this is a conflict
          conflicts++;
        }
      }

      return {
        localCount: localTools.length,
        cloudCount: cloudTools.length,
        merged,
        conflicts
      };
    } catch (error) {
      console.error('Sync failed:', error);
      throw new Error('Failed to sync with cloud');
    }
  }

  /**
   * Import local drafts to cloud storage
   */
  async importLocalDraftsToCloud(): Promise<number> {
    if (!this.supabaseRepo) {
      throw new Error('Cloud storage not available');
    }

    const flags = featureFlags.get();
    if (flags.localOnlyMode) {
      throw new Error('Cannot import in local-only mode');
    }

    try {
      const localTools = await this.localRepo.list();
      let imported = 0;

      for (const localTool of localTools) {
        if (localTool.id.startsWith('local:')) {
          try {
            const toolData = await this.localRepo.get(localTool.id);
            if (toolData) {
              await this.supabaseRepo.save(toolData.spec, {
                name: toolData.meta.name,
                isPublic: toolData.meta.isPublic
              });
              imported++;
            }
          } catch (error) {
            console.warn(`Failed to import tool ${localTool.id}:`, error);
          }
        }
      }

      return imported;
    } catch (error) {
      console.error('Failed to import local drafts:', error);
      throw new Error('Failed to import local drafts');
    }
  }

  /**
   * Check if cloud storage is available
   */
  async isCloudAvailable(): Promise<boolean> {
    if (!this.supabaseRepo) return false;
    
    try {
      return await this.supabaseRepo.isAuthenticated();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get authentication methods from Supabase repo
   */
  getAuthMethods() {
    return this.supabaseRepo ? {
      signIn: this.supabaseRepo.signIn.bind(this.supabaseRepo),
      signUp: this.supabaseRepo.signUp.bind(this.supabaseRepo),
      signOut: this.supabaseRepo.signOut.bind(this.supabaseRepo),
      getCurrentUser: this.supabaseRepo.getCurrentUser.bind(this.supabaseRepo),
      isAuthenticated: this.supabaseRepo.isAuthenticated.bind(this.supabaseRepo)
    } : null;
  }

  /**
   * Get local storage utilities
   */
  getLocalUtils() {
    return {
      exportToJSON: this.localRepo.exportToJSON.bind(this.localRepo),
      importFromJSON: this.localRepo.importFromJSON.bind(this.localRepo),
      clearCache: this.localRepo.clearAllData.bind(this.localRepo),
      getCacheSize: this.localRepo.getCacheSize.bind(this.localRepo),
      // Artifact storage methods
      storeArtifact: this.localRepo.storeArtifact.bind(this.localRepo),
      getArtifact: this.localRepo.getArtifact.bind(this.localRepo),
      listArtifacts: this.localRepo.listArtifacts.bind(this.localRepo),
      deleteArtifact: this.localRepo.deleteArtifact.bind(this.localRepo),
      downloadArtifact: this.localRepo.downloadArtifact.bind(this.localRepo),
      createArtifactBlobUrl: this.localRepo.createArtifactBlobUrl.bind(this.localRepo),
      getArtifactStats: this.localRepo.getArtifactStats.bind(this.localRepo),
      cleanupExpiredArtifacts: this.localRepo.cleanupExpiredArtifacts.bind(this.localRepo),
      clearArtifacts: this.localRepo.clearArtifacts.bind(this.localRepo),
    };
  }

  /**
   * Merge tool lists from local and cloud, preferring newer versions
   */
  private mergeToolLists(local: ToolMeta[], cloud: ToolMeta[]): ToolMeta[] {
    const merged = new Map<string, ToolMeta>();
    
    // Add all local tools
    for (const tool of local) {
      merged.set(tool.specHash, tool);
    }
    
    // Add cloud tools, preferring newer versions
    for (const tool of cloud) {
      const existing = merged.get(tool.specHash);
      if (!existing || new Date(tool.updatedAt) > new Date(existing.updatedAt)) {
        merged.set(tool.specHash, tool);
      }
    }
    
    // Convert back to array and sort by updatedAt (newest first)
    return Array.from(merged.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

// Singleton instance
export const toolRepo = new CompositeRepo();