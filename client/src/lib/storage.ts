// IndexedDB utilities for client-side storage
import { config } from '@/config';

export interface StoredToolSpec {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  spec: any; // Full ToolSpec object
  createdAt: string;
  updatedAt: string;
}

class IndexedDBManager {
  private dbName = 'toolforge-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create toolspecs store
        if (!db.objectStoreNames.contains('toolspecs')) {
          const store = db.createObjectStore('toolspecs', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  async saveToolSpec(toolSpec: StoredToolSpec): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['toolspecs'], 'readwrite');
      const store = transaction.objectStore('toolspecs');
      
      const request = store.put({
        ...toolSpec,
        updatedAt: new Date().toISOString()
      });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getToolSpec(id: string): Promise<StoredToolSpec | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['toolspecs'], 'readonly');
      const store = transaction.objectStore('toolspecs');
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllToolSpecs(): Promise<StoredToolSpec[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['toolspecs'], 'readonly');
      const store = transaction.objectStore('toolspecs');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteToolSpec(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['toolspecs'], 'readwrite');
      const store = transaction.objectStore('toolspecs');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const indexedDBManager = new IndexedDBManager();

// Fallback to localStorage if IndexedDB fails
export const storageManager = {
  async saveToolSpec(toolSpec: StoredToolSpec): Promise<void> {
    try {
      await indexedDBManager.saveToolSpec(toolSpec);
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      const stored = localStorage.getItem(config.storage.toolSpecsKey) || '[]';
      const specs = JSON.parse(stored);
      const index = specs.findIndex((s: StoredToolSpec) => s.id === toolSpec.id);
      
      if (index >= 0) {
        specs[index] = { ...toolSpec, updatedAt: new Date().toISOString() };
      } else {
        specs.push({ ...toolSpec, updatedAt: new Date().toISOString() });
      }
      
      localStorage.setItem(config.storage.toolSpecsKey, JSON.stringify(specs));
    }
  },

  async getToolSpec(id: string): Promise<StoredToolSpec | null> {
    try {
      return await indexedDBManager.getToolSpec(id);
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      const stored = localStorage.getItem(config.storage.toolSpecsKey) || '[]';
      const specs = JSON.parse(stored);
      return specs.find((s: StoredToolSpec) => s.id === id) || null;
    }
  },

  async getAllToolSpecs(): Promise<StoredToolSpec[]> {
    try {
      return await indexedDBManager.getAllToolSpecs();
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      const stored = localStorage.getItem(config.storage.toolSpecsKey) || '[]';
      return JSON.parse(stored);
    }
  },

  async deleteToolSpec(id: string): Promise<void> {
    try {
      await indexedDBManager.deleteToolSpec(id);
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      const stored = localStorage.getItem(config.storage.toolSpecsKey) || '[]';
      const specs = JSON.parse(stored);
      const filtered = specs.filter((s: StoredToolSpec) => s.id !== id);
      localStorage.setItem(config.storage.toolSpecsKey, JSON.stringify(filtered));
    }
  }
};