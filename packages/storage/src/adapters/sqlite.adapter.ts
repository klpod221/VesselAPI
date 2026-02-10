import type { StorageAdapter, CollectionData } from "../types";
import initSqlJs, { type Database } from "sql.js";

const DB_NAME = "vessel-collections";
const DB_STORE = "database";

/**
 * SQLite adapter using sql.js (WebAssembly).
 * Persists to IndexedDB for durability.
 */
export class SQLiteAdapter implements StorageAdapter {
  readonly name = "sqlite";
  private db: Database | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    const SQL = await initSqlJs();

    const savedData = await this.loadFromIndexedDB();
    this.db = savedData ? new SQL.Database(savedData) : new SQL.Database();

    this.db.run(`
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

    this.db.run(`
      CREATE TABLE IF NOT EXISTS key_value (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    this.initialized = true;
    await this.saveToIndexedDB();
  }

  async isAvailable(): Promise<boolean> {
    return typeof indexedDB !== "undefined";
  }

  async getAllCollections(): Promise<CollectionData[]> {
    if (!this.db) throw new Error("Database not initialized");

    const result = this.db.exec(
      "SELECT * FROM collections ORDER BY updated_at DESC",
    );
    if (result.length === 0) return [];

    return result[0].values.map((row) =>
      this.rowToCollection(row, result[0].columns),
    );
  }

  async getCollection(id: string): Promise<CollectionData | null> {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = this.db.prepare("SELECT * FROM collections WHERE id = ?");
    stmt.bind([id]);

    if (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      stmt.free();
      return this.rowToCollection(values, columns);
    }

    stmt.free();
    return null;
  }

  async saveCollection(collection: CollectionData): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    this.db.run(
      `INSERT OR REPLACE INTO collections 
       (id, name, description, version, requests, folders, variables, 
        storage_mode, sync_status, last_synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        collection.id,
        collection.name,
        (collection["description"] as string) ?? null,
        collection.version,
        JSON.stringify(collection.requests),
        JSON.stringify(collection.folders),
        JSON.stringify(collection.variables),
        (collection["storageMode"] as string) ?? "local",
        (collection["syncStatus"] as string) ?? null,
        (collection["lastSyncedAt"] as number) ?? null,
        collection.createdAt,
        collection.updatedAt,
      ],
    );

    await this.saveToIndexedDB();
  }

  async deleteCollection(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    this.db.run("DELETE FROM collections WHERE id = ?", [id]);
    await this.saveToIndexedDB();
  }

  async importCollections(collections: CollectionData[]): Promise<void> {
    for (const collection of collections) {
      await this.saveCollection(collection);
    }
  }

  async exportAllCollections(): Promise<CollectionData[]> {
    return this.getAllCollections();
  }

  /**
   * Retrieve a raw string value by key.
   * Returns `null` when the key does not exist.
   */
  async getKV(key: string): Promise<string | null> {
    if (!this.db) throw new Error("Database not initialized");

    const stmt = this.db.prepare("SELECT value FROM key_value WHERE key = ?");
    stmt.bind([key]);

    if (stmt.step()) {
      const raw = stmt.get()[0] as string;
      stmt.free();
      return raw;
    }

    stmt.free();
    return null;
  }

  /**
   * Store a raw string value under the given key (upsert).
   */
  async setKV(key: string, value: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    this.db.run(
      "INSERT OR REPLACE INTO key_value (key, value, updated_at) VALUES (?, ?, ?)",
      [key, value, Date.now()],
    );
    await this.saveToIndexedDB();
  }

  /**
   * Remove a key-value entry.
   */
  async deleteKV(key: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    this.db.run("DELETE FROM key_value WHERE key = ?", [key]);
    await this.saveToIndexedDB();
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.saveToIndexedDB();
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  private rowToCollection(row: unknown[], columns: string[]): CollectionData {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });

    return {
      id: obj.id as string,
      name: obj.name as string,
      description: obj.description as string | undefined,
      version: obj.version as string,
      requests: JSON.parse((obj.requests as string) || "[]"),
      folders: JSON.parse((obj.folders as string) || "[]"),
      variables: JSON.parse((obj.variables as string) || "[]"),
      storageMode: (obj.storage_mode as "local" | "synced") || "local",
      syncStatus: obj.sync_status as
        | "synced"
        | "pending"
        | "conflict"
        | undefined,
      lastSyncedAt: obj.last_synced_at as number | undefined,
      createdAt: obj.created_at as number,
      updatedAt: obj.updated_at as number,
    };
  }

  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(DB_STORE, "readonly");
        const store = tx.objectStore(DB_STORE);
        const getRequest = store.get("data");

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };

        getRequest.onerror = () => resolve(null);
      };

      request.onerror = () => resolve(null);
    });
  }

  private async saveToIndexedDB(): Promise<void> {
    if (!this.db) return;

    const data = this.db.export();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(DB_STORE, "readwrite");
        const store = tx.objectStore(DB_STORE);
        store.put(data, "data");

        tx.oncomplete = () => resolve();
        tx.onerror = () =>
          reject(new Error(tx.error?.message ?? "Transaction failed"));
      };

      request.onerror = () =>
        reject(new Error(request.error?.message ?? "IndexedDB open failed"));
    });
  }
}
