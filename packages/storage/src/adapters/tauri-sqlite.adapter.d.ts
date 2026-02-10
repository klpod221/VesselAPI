import type { StorageAdapter, CollectionData } from '../types';
/**
 * SQLite adapter using Tauri's native SQL plugin.
 * Persists directly to the filesystem via SQLite.
 */
export declare class TauriSQLiteAdapter implements StorageAdapter {
    readonly name = "tauri-sqlite";
    private db;
    init(): Promise<void>;
    isAvailable(): Promise<boolean>;
    getAllCollections(): Promise<CollectionData[]>;
    getCollection(id: string): Promise<CollectionData | null>;
    saveCollection(collection: CollectionData): Promise<void>;
    deleteCollection(id: string): Promise<void>;
    importCollections(collections: CollectionData[]): Promise<void>;
    exportAllCollections(): Promise<CollectionData[]>;
    getKV(key: string): Promise<string | null>;
    setKV(key: string, value: string): Promise<void>;
    deleteKV(key: string): Promise<void>;
    close(): Promise<void>;
    private rowToCollection;
}
//# sourceMappingURL=tauri-sqlite.adapter.d.ts.map