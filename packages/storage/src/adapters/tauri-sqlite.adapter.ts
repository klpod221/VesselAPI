import type { StorageAdapter, CollectionData } from '../types';
import Database from '@tauri-apps/plugin-sql';

const DB_NAME = 'sqlite:vessel.db';

/**
 * SQLite adapter using Tauri's native SQL plugin.
 * Persists directly to the filesystem via SQLite.
 */
export class TauriSQLiteAdapter implements StorageAdapter {
  readonly name = 'tauri-sqlite';
  private db: Database | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await Database.load(DB_NAME);

    // Create tables if not exist
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT NOT NULL DEFAULT '1.0.0',
        requests TEXT NOT NULL DEFAULT '[]',
        folders TEXT NOT NULL DEFAULT '[]',
        variables TEXT NOT NULL DEFAULT '[]',
        storage_mode TEXT NOT NULL DEFAULT 'local',
        sync_status TEXT,
        last_synced_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS key_value (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }

  async isAvailable(): Promise<boolean> {
    if (globalThis.window === undefined) return false;
    // Check for Tauri environment markers
    return !!(globalThis.window as any).__TAURI_INTERNALS__;
  }

  async getAllCollections(): Promise<CollectionData[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.select<any[]>('SELECT * FROM collections ORDER BY updated_at DESC');
    return result.map((row) => this.rowToCollection(row));
  }

  async getCollection(id: string): Promise<CollectionData | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.select<any[]>('SELECT * FROM collections WHERE id = ?', [id]);
    if (result.length === 0) return null;

    return this.rowToCollection(result[0]);
  }

  async saveCollection(collection: CollectionData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.execute(
      `INSERT OR REPLACE INTO collections 
       (id, name, description, version, requests, folders, variables, 
        storage_mode, sync_status, last_synced_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        collection.id,
        collection.name,
        (collection['description'] as string) ?? null,
        collection.version,
        JSON.stringify(collection.requests),
        JSON.stringify(collection.folders),
        JSON.stringify(collection.variables),
        (collection['storageMode'] as string) ?? 'local',
        (collection['syncStatus'] as string) ?? null,
        (collection['lastSyncedAt'] as number) ?? null,
        collection.createdAt,
        collection.updatedAt,
      ]
    );
  }

  async deleteCollection(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('DELETE FROM collections WHERE id = $1', [id]);
  }

  async importCollections(collections: CollectionData[]): Promise<void> {
    for (const collection of collections) {
      await this.saveCollection(collection);
    }
  }

  async exportAllCollections(): Promise<CollectionData[]> {
    return this.getAllCollections();
  }

  // --- Key-Value Store ---

  async getKV(key: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.select<{ value: string }[]>('SELECT value FROM key_value WHERE key = $1', [key]);
    if (result.length === 0) return null;

    return result[0].value;
  }

  async setKV(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // UPSERT equivalent
    await this.db.execute(
      'INSERT OR REPLACE INTO key_value (key, value, updated_at) VALUES ($1, $2, $3)',
      [key, value, Date.now()],
    );
  }

  async deleteKV(key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.execute('DELETE FROM key_value WHERE key = $1', [key]);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  // --- Private helpers ---

  private rowToCollection(row: any): CollectionData {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      version: row.version,
      requests: JSON.parse(row.requests || '[]'),
      folders: JSON.parse(row.folders || '[]'),
      variables: JSON.parse(row.variables || '[]'),
      storageMode: (row.storage_mode as 'local' | 'synced') || 'local',
      syncStatus: row.sync_status as 'synced' | 'pending' | 'conflict' | undefined,
      lastSyncedAt: row.last_synced_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
