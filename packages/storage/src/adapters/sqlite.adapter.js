import initSqlJs from 'sql.js';
const DB_NAME = 'vessel-collections';
const DB_STORE = 'database';
/**
 * SQLite adapter using sql.js (WebAssembly).
 * Persists to IndexedDB for durability.
 */
export class SQLiteAdapter {
    name = 'sqlite';
    db = null;
    initialized = false;
    async init() {
        if (this.initialized)
            return;
        const SQL = await initSqlJs();
        // Try to load existing database from IndexedDB
        const savedData = await this.loadFromIndexedDB();
        this.db = savedData ? new SQL.Database(savedData) : new SQL.Database();
        // Create tables if not exist
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
        this.initialized = true;
        await this.saveToIndexedDB();
    }
    async isAvailable() {
        return typeof indexedDB !== 'undefined';
    }
    async getAllCollections() {
        if (!this.db)
            throw new Error('Database not initialized');
        const result = this.db.exec('SELECT * FROM collections ORDER BY updated_at DESC');
        if (result.length === 0)
            return [];
        return result[0].values.map((row) => this.rowToCollection(row, result[0].columns));
    }
    async getCollection(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare('SELECT * FROM collections WHERE id = ?');
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
    async saveCollection(collection) {
        if (!this.db)
            throw new Error('Database not initialized');
        this.db.run(`INSERT OR REPLACE INTO collections 
       (id, name, description, version, requests, folders, variables, 
        storage_mode, sync_status, last_synced_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            collection.id,
            collection.name,
            collection['description'] ?? null,
            collection.version,
            JSON.stringify(collection.requests),
            JSON.stringify(collection.folders),
            JSON.stringify(collection.variables),
            collection['storageMode'] ?? 'local',
            collection['syncStatus'] ?? null,
            collection['lastSyncedAt'] ?? null,
            collection.createdAt,
            collection.updatedAt,
        ]);
        await this.saveToIndexedDB();
    }
    async deleteCollection(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        this.db.run('DELETE FROM collections WHERE id = ?', [id]);
        await this.saveToIndexedDB();
    }
    async importCollections(collections) {
        for (const collection of collections) {
            await this.saveCollection(collection);
        }
    }
    async exportAllCollections() {
        return this.getAllCollections();
    }
    async close() {
        if (this.db) {
            await this.saveToIndexedDB();
            this.db.close();
            this.db = null;
            this.initialized = false;
        }
    }
    // --- Private helpers ---
    rowToCollection(row, columns) {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return {
            id: obj.id,
            name: obj.name,
            description: obj.description,
            version: obj.version,
            requests: JSON.parse(obj.requests || '[]'),
            folders: JSON.parse(obj.folders || '[]'),
            variables: JSON.parse(obj.variables || '[]'),
            storageMode: obj.storage_mode || 'local',
            syncStatus: obj.sync_status,
            lastSyncedAt: obj.last_synced_at,
            createdAt: obj.created_at,
            updatedAt: obj.updated_at,
        };
    }
    async loadFromIndexedDB() {
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
                const tx = db.transaction(DB_STORE, 'readonly');
                const store = tx.objectStore(DB_STORE);
                const getRequest = store.get('data');
                getRequest.onsuccess = () => {
                    resolve(getRequest.result || null);
                };
                getRequest.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        });
    }
    async saveToIndexedDB() {
        if (!this.db)
            return;
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
                const tx = db.transaction(DB_STORE, 'readwrite');
                const store = tx.objectStore(DB_STORE);
                store.put(data, 'data');
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(new Error(tx.error?.message ?? 'Transaction failed'));
            };
            request.onerror = () => reject(new Error(request.error?.message ?? 'IndexedDB open failed'));
        });
    }
}
//# sourceMappingURL=sqlite.adapter.js.map