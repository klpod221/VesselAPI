/**
 * Storage adapter interface for collection persistence.
 * Implementations can use SQLite, API, or other backends.
 * 
 * Note: We use a generic Collection type to avoid cyclic dependency with @vessel/core
 */

/**
 * Minimal Collection interface for storage operations.
 * Compatible with @vessel/core's Collection type.
 */
export interface CollectionData {
  id: string;
  name: string;
  version: string;
  requests: unknown[];
  folders: unknown[];
  variables: unknown[];
  createdAt: number;
  updatedAt: number;
  [key: string]: unknown;
}

/**
 * Storage adapter interface for collection persistence.
 * Implementations can use SQLite, API, or other backends.
 */
export interface StorageAdapter {
  /** Adapter name for identification */
  readonly name: string;

  /** Initialize the storage (create tables, etc.) */
  init(): Promise<void>;

  /** Check if adapter is available */
  isAvailable(): Promise<boolean>;

  // Collection CRUD
  getAllCollections(): Promise<CollectionData[]>;
  getCollection(id: string): Promise<CollectionData | null>;
  saveCollection(collection: CollectionData): Promise<void>;
  deleteCollection(id: string): Promise<void>;

  // Bulk operations
  importCollections(collections: CollectionData[]): Promise<void>;
  exportAllCollections(): Promise<CollectionData[]>;

  // Cleanup
  close(): Promise<void>;

  // Key-Value Store
  getKV(key: string): Promise<string | null>;
  setKV(key: string, value: string): Promise<void>;
  deleteKV(key: string): Promise<void>;
}

/**
 * Storage mode for collections
 */
export type StorageMode = 'local' | 'synced';

/**
 * Extended collection with storage metadata
 */
export interface StoredCollection extends CollectionData {
  storageMode: StorageMode;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: number;
}
