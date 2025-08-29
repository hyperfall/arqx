import { toolRepo, SyncResult } from '../repositories';
import { featureFlags } from '../config';

export type SyncStatus = 
  | 'idle'
  | 'syncing'
  | 'success'
  | 'error'
  | 'conflict';

export interface SyncState {
  status: SyncStatus;
  lastSync: Date | null;
  error: string | null;
  result: SyncResult | null;
  isAutoSyncEnabled: boolean;
}

export class SyncService {
  private state: SyncState = {
    status: 'idle',
    lastSync: null,
    error: null,
    result: null,
    isAutoSyncEnabled: true
  };

  private listeners: Set<(state: SyncState) => void> = new Set();
  private syncInterval: number | null = null;
  private retryTimeout: number | null = null;

  constructor() {
    this.loadPersistedState();
    this.startAutoSync();
  }

  /**
   * Subscribe to sync state changes
   */
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Manually trigger sync
   */
  async sync(): Promise<SyncResult> {
    if (this.state.status === 'syncing') {
      throw new Error('Sync already in progress');
    }

    const flags = featureFlags.get();
    if (flags.localOnlyMode) {
      throw new Error('Cannot sync in local-only mode');
    }

    if (!await toolRepo.isCloudAvailable()) {
      throw new Error('Cloud storage not available');
    }

    this.updateState({
      status: 'syncing',
      error: null
    });

    try {
      const result = await toolRepo.syncWithCloud();
      
      this.updateState({
        status: result.conflicts > 0 ? 'conflict' : 'success',
        lastSync: new Date(),
        result,
        error: null
      });

      this.persistState();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      
      this.updateState({
        status: 'error',
        error: errorMessage
      });

      // Schedule retry with exponential backoff
      this.scheduleRetry();
      throw error;
    }
  }

  /**
   * Import local drafts to cloud
   */
  async importLocalDrafts(): Promise<number> {
    if (this.state.status === 'syncing') {
      throw new Error('Sync already in progress');
    }

    const flags = featureFlags.get();
    if (flags.localOnlyMode) {
      throw new Error('Cannot import in local-only mode');
    }

    if (!await toolRepo.isCloudAvailable()) {
      throw new Error('Cloud storage not available');
    }

    this.updateState({
      status: 'syncing',
      error: null
    });

    try {
      const imported = await toolRepo.importLocalDraftsToCloud();
      
      this.updateState({
        status: 'success',
        lastSync: new Date(),
        error: null
      });

      this.persistState();
      return imported;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      
      this.updateState({
        status: 'error',
        error: errorMessage
      });

      throw error;
    }
  }

  /**
   * Enable or disable auto-sync
   */
  setAutoSync(enabled: boolean): void {
    this.updateState({ isAutoSyncEnabled: enabled });
    
    if (enabled) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
    
    this.persistState();
  }

  /**
   * Clear sync errors and reset status
   */
  clearError(): void {
    this.updateState({
      status: 'idle',
      error: null
    });
  }

  /**
   * Check if sync is needed (local changes exist)
   */
  async isSyncNeeded(): Promise<boolean> {
    try {
      const flags = featureFlags.get();
      if (flags.localOnlyMode || !await toolRepo.isCloudAvailable()) {
        return false;
      }

      // Simple heuristic: if we haven't synced in the last hour, assume sync is needed
      if (!this.state.lastSync) {
        return true;
      }

      const hoursSinceLastSync = (Date.now() - this.state.lastSync.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastSync > 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start automatic background sync
   */
  private startAutoSync(): void {
    if (!this.state.isAutoSyncEnabled || this.syncInterval) {
      return;
    }

    // Sync every 5 minutes if auto-sync is enabled
    this.syncInterval = setInterval(async () => {
      try {
        const flags = featureFlags.get();
        if (flags.localOnlyMode || this.state.status === 'syncing') {
          return;
        }

        if (await this.isSyncNeeded()) {
          await this.sync();
        }
      } catch (error) {
        // Silent fail for auto-sync
        console.debug('Auto-sync failed:', error);
      }
    }, 5 * 60 * 1000) as unknown as number; // 5 minutes
  }

  /**
   * Stop automatic background sync
   */
  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Schedule retry with exponential backoff
   */
  private scheduleRetry(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Retry after 30 seconds, then 1 minute, then 2 minutes, etc.
    const retryDelay = Math.min(30000 * Math.pow(2, this.getRetryCount()), 300000); // Max 5 minutes
    
    this.retryTimeout = setTimeout(async () => {
      try {
        if (this.state.status === 'error' && await toolRepo.isCloudAvailable()) {
          await this.sync();
        }
      } catch (error) {
        // Will reschedule another retry
      }
    }, retryDelay) as unknown as number;
  }

  /**
   * Get number of retry attempts based on error history
   */
  private getRetryCount(): number {
    // Simple implementation - in production, you'd want to track this more sophisticatedly
    return this.state.error ? 1 : 0;
  }

  /**
   * Update internal state and notify listeners
   */
  private updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Persist sync state to localStorage
   */
  private persistState(): void {
    try {
      const persistedState = {
        lastSync: this.state.lastSync?.toISOString(),
        isAutoSyncEnabled: this.state.isAutoSyncEnabled
      };
      localStorage.setItem('toolforge-sync-state', JSON.stringify(persistedState));
    } catch (error) {
      console.warn('Failed to persist sync state:', error);
    }
  }

  /**
   * Load sync state from localStorage
   */
  private loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('toolforge-sync-state');
      if (stored) {
        const persistedState = JSON.parse(stored);
        this.state = {
          ...this.state,
          lastSync: persistedState.lastSync ? new Date(persistedState.lastSync) : null,
          isAutoSyncEnabled: persistedState.isAutoSyncEnabled ?? true
        };
      }
    } catch (error) {
      console.warn('Failed to load persisted sync state:', error);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAutoSync();
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const syncService = new SyncService();