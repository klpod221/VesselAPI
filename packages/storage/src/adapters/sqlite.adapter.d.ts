import type { StorageAdapter, CollectionData } from '../types';
/**
 * SQLite adapter using sql.js (WebAssembly).
 * Persists to IndexedDB for durability.
 */
export declare class SQLiteAdapter implements StorageAdapter {
    readonly name = "sqlite";
    private db;
    private initialized;
    init(): Promise<void>;
    isAvailable(): Promise<boolean>;
    getAllCollections(): Promise<CollectionData[]>;
    getCollection(id: string): Promise<CollectionData | null>;
    saveCollection(collection: CollectionData): Promise<void>;
    deleteCollection(id: string): Promise<void>;
    importCollections(collections: CollectionData[]): Promise<void>;
    exportAllCollections(): Promise<CollectionData[]>;
    /**
     * Retrieve a raw string value by key.
     * Returns `null` when the key does not exist.
     */
    getKV(key: string): Promise<string | null>;
    /**
     * Store a raw string value under the given key (upsert).
     */
    setKV(key: string, value: string): Promise<void>;
    /**
     * Remove a key-value entry.
     */
    deleteKV(key: string): Promise<void>;
    close(): Promise<void>;
    private rowToCollection;
    private loadFromIndexedDB;
    private saveToIndexedDB;
}
//# sourceMappingURL=sqlite.adapter.d.ts.map