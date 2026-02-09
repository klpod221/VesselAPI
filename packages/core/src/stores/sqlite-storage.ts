import type { StateStorage } from 'zustand/middleware';
import { SQLiteAdapter } from '@vessel/storage';
import type { Collection } from '../types/request';

/**
 * Creates a Zustand-compatible StateStorage using SQLite.
 * This allows persist middleware to store collections in IndexedDB via sql.js.
 */
export function createSQLiteStorage(): StateStorage {
  const adapter = new SQLiteAdapter();
  let initialized = false;
  let initPromise: Promise<void> | null = null;

  const ensureInit = async () => {
    if (initialized) return;
    initPromise ??= adapter.init().then(() => {
      initialized = true;
    });
    await initPromise;
  };

  return {
    getItem: async (): Promise<string | null> => {
      await ensureInit();
      
      try {
        const collections = await adapter.getAllCollections();
        const state = {
          state: {
            collections,
            activeCollectionId: null,
            activeFolderId: null,
          },
          version: 0,
        };
        return JSON.stringify(state);
      } catch (error) {
        console.error('[SQLiteStorage] getItem failed:', error);
        return null;
      }
    },

    setItem: async (_name: string, value: string): Promise<void> => {
      await ensureInit();
      
      try {
        const parsed = JSON.parse(value);
        const newCollections: Collection[] = parsed.state?.collections || [];
        const existingCollections = await adapter.getAllCollections();
        
        const newIds = new Set(newCollections.map((c) => c.id));
        
        // Delete removed collections
        for (const existing of existingCollections) {
          if (!newIds.has(existing.id)) {
            await adapter.deleteCollection(existing.id);
          }
        }
        
        // Save all current collections
        for (const collection of newCollections) {
          // Cast Collection to CollectionData - they are structurally compatible
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await adapter.saveCollection(collection as any);
        }
      } catch (error) {
        console.error('[SQLiteStorage] setItem failed:', error);
      }
    },

    removeItem: async (): Promise<void> => {
      await ensureInit();
      
      try {
        const collections = await adapter.getAllCollections();
        for (const collection of collections) {
          await adapter.deleteCollection(collection.id);
        }
      } catch (error) {
        console.error('[SQLiteStorage] removeItem failed:', error);
      }
    },
  };
}

// Singleton instance
let sqliteStorage: StateStorage | null = null;

/**
 * Get the singleton SQLite storage instance for Zustand.
 */
export function getSQLiteStorage(): StateStorage {
  if (!sqliteStorage) {
    sqliteStorage = createSQLiteStorage();
  }
  return sqliteStorage;
}
