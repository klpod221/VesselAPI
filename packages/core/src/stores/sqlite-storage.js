import { SQLiteAdapter, TauriSQLiteAdapter } from '@vessel/storage';
// --- Shared Singleton Adapter ---
// Both collection and KV storage MUST share the same adapter instance.
// Otherwise each maintains a separate in-memory SQLite database,
// and whichever saves last to IndexedDB overwrites the other's data.
let sharedAdapter = null;
let adapterInitialized = false;
let adapterInitPromise = null;
async function ensureAdapterInit() {
    if (sharedAdapter && adapterInitialized)
        return sharedAdapter;
    adapterInitPromise ??= (async () => {
        // 1. Try Tauri Adapter
        const tauriAdapter = new TauriSQLiteAdapter();
        if (await tauriAdapter.isAvailable()) {
            console.log('[SQLiteStorage] Using Tauri SQLite Adapter');
            await tauriAdapter.init();
            sharedAdapter = tauriAdapter;
            adapterInitialized = true;
            return;
        }
        // 2. Fallback to Web Adapter (sql.js)
        console.log('[SQLiteStorage] Using Web SQLite Adapter (sql.js)');
        const webAdapter = new SQLiteAdapter();
        await webAdapter.init();
        sharedAdapter = webAdapter;
        adapterInitialized = true;
    })();
    await adapterInitPromise;
    if (!sharedAdapter)
        throw new Error('Failed to initialize storage adapter');
    return sharedAdapter;
}
// --- Collection Storage (structured table) ---
/**
 * Creates a Zustand-compatible StateStorage that persists collections
 * to the SQLite `collections` table via the shared adapter.
 */
function createSQLiteStorage() {
    return {
        getItem: async () => {
            try {
                const adapter = await ensureAdapterInit();
                const collections = await adapter.getAllCollections();
                return JSON.stringify({
                    state: { collections, activeCollectionId: null, activeFolderId: null },
                    version: 0,
                });
            }
            catch (error) {
                console.error('[SQLiteStorage] getItem failed:', error);
                return null;
            }
        },
        setItem: async (_name, value) => {
            try {
                const adapter = await ensureAdapterInit();
                const parsed = JSON.parse(value);
                const newCollections = parsed.state?.collections || [];
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await adapter.saveCollection(collection);
                }
            }
            catch (error) {
                console.error('[SQLiteStorage] setItem failed:', error);
            }
        },
        removeItem: async () => {
            try {
                const adapter = await ensureAdapterInit();
                const collections = await adapter.getAllCollections();
                for (const collection of collections) {
                    await adapter.deleteCollection(collection.id);
                }
            }
            catch (error) {
                console.error('[SQLiteStorage] removeItem failed:', error);
            }
        },
    };
}
let sqliteStorage = null;
/**
 * Get the singleton SQLite collection storage instance.
 */
export function getSQLiteStorage() {
    sqliteStorage ??= createSQLiteStorage();
    return sqliteStorage;
}
// --- KV Storage (for request drafts, settings, etc.) ---
/**
 * Creates a Zustand-compatible StateStorage backed by the SQLite
 * `key_value` table via the shared adapter.
 */
function createSQLiteKVStorage() {
    return {
        getItem: async (name) => {
            try {
                const adapter = await ensureAdapterInit();
                return await adapter.getKV(name);
            }
            catch (error) {
                console.error('[SQLiteKVStorage] getItem failed:', error);
                return null;
            }
        },
        setItem: async (name, value) => {
            try {
                const adapter = await ensureAdapterInit();
                await adapter.setKV(name, value);
            }
            catch (error) {
                console.error('[SQLiteKVStorage] setItem failed:', error);
            }
        },
        removeItem: async (name) => {
            try {
                const adapter = await ensureAdapterInit();
                await adapter.deleteKV(name);
            }
            catch (error) {
                console.error('[SQLiteKVStorage] removeItem failed:', error);
            }
        },
    };
}
let sqliteKVStorage = null;
/**
 * Get the singleton SQLite KV storage instance.
 */
export function getSQLiteKVStorage() {
    sqliteKVStorage ??= createSQLiteKVStorage();
    return sqliteKVStorage;
}
//# sourceMappingURL=sqlite-storage.js.map