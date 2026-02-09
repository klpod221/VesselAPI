import type { StateStorage } from 'zustand/middleware';
/**
 * Creates a Zustand-compatible StateStorage using SQLite.
 * This allows persist middleware to store collections in IndexedDB via sql.js.
 */
export declare function createSQLiteStorage(): StateStorage;
/**
 * Get the singleton SQLite storage instance for Zustand.
 */
export declare function getSQLiteStorage(): StateStorage;
//# sourceMappingURL=sqlite-storage.d.ts.map