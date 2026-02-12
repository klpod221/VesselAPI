import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Collection,
  CollectionFolder,
  ApiRequest,
} from "../types/request";
import { useAuthStore } from "./auth.store";
import { collectionService } from "../services/collection.service";
import { ApiError } from "@vessel/network";

interface CollectionState {
  collections: Collection[];
  activeCollectionId: string | null;
  activeFolderId: string | null;
  isLoading: boolean;
  hasHydrated: boolean;
}

interface CollectionActions {
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => Promise<void>;
  setActiveCollection: (id: string | null) => void;

  addFolder: (
    collectionId: string,
    parentFolderId: string | null,
    folder: CollectionFolder,
  ) => void;
  deleteFolder: (collectionId: string, folderId: string) => void;
  setActiveFolder: (id: string | null) => void;

  addRequestToCollection: (
    collectionId: string,
    folderId: string | null,
    request: ApiRequest,
  ) => void;
  updateRequestInCollection: (
    collectionId: string,
    requestId: string,
    updates: Partial<ApiRequest>,
  ) => void;
  deleteRequestFromCollection: (
    collectionId: string,
    requestId: string,
  ) => void;

  importCollection: (data: unknown) => Collection | null;
  exportCollection: (id: string) => string | null;

  toggleSync: (id: string) => Promise<void>;
  fetchRemoteCollections: () => Promise<void>;
}

type CollectionStore = CollectionState & CollectionActions;

// --- Pure helpers for immutable tree operations ---

const findAndUpdateInFolders = (
  folders: CollectionFolder[],
  folderId: string,
  updater: (folder: CollectionFolder) => CollectionFolder,
): CollectionFolder[] => {
  return folders.map((folder) => {
    if (folder.id === folderId) return updater(folder);
    return {
      ...folder,
      folders: findAndUpdateInFolders(folder.folders, folderId, updater),
    };
  });
};

const deleteFromFolders = (
  folders: CollectionFolder[],
  folderId: string,
): CollectionFolder[] => {
  return folders
    .filter((f) => f.id !== folderId)
    .map((folder) => ({
      ...folder,
      folders: deleteFromFolders(folder.folders, folderId),
    }));
};

const updateRequestsInFolder = (
  folder: CollectionFolder,
  requestId: string,
  updates: Partial<ApiRequest>,
): CollectionFolder => ({
  ...folder,
  requests: folder.requests.map((r) =>
    r.id === requestId ? { ...r, ...updates, updatedAt: Date.now() } : r,
  ),
  folders: folder.folders.map((f) =>
    updateRequestsInFolder(f, requestId, updates),
  ),
});

const deleteRequestFromFolder = (
  folder: CollectionFolder,
  requestId: string,
): CollectionFolder => ({
  ...folder,
  requests: folder.requests.filter((r) => r.id !== requestId),
  folders: folder.folders.map((f) => deleteRequestFromFolder(f, requestId)),
});

const addFolderToCollection = (
  collections: Collection[],
  collectionId: string,
  parentFolderId: string | null,
  folder: CollectionFolder,
): Collection[] => {
  return collections.map((c) => {
    if (c.id !== collectionId) return c;

    const newFolders = parentFolderId
      ? findAndUpdateInFolders(c.folders, parentFolderId, (f) => ({
          ...f,
          folders: [...f.folders, folder],
        }))
      : [...c.folders, folder];

    return { ...c, folders: newFolders, updatedAt: Date.now() };
  });
};

const deleteFolderFromCollection = (
  collections: Collection[],
  collectionId: string,
  folderId: string,
): Collection[] => {
  return collections.map((c) => {
    if (c.id !== collectionId) return c;
    return {
      ...c,
      folders: deleteFromFolders(c.folders, folderId),
      updatedAt: Date.now(),
    };
  });
};

const addRequestHelper = (
  collections: Collection[],
  collectionId: string,
  folderId: string | null,
  request: ApiRequest,
): Collection[] => {
  return collections.map((c) => {
    if (c.id !== collectionId) return c;

    const newFolders = folderId
      ? findAndUpdateInFolders(c.folders, folderId, (f) => ({
          ...f,
          requests: [...f.requests, request],
        }))
      : c.folders;

    const newRequests = folderId ? c.requests : [...c.requests, request];

    return {
      ...c,
      folders: newFolders,
      requests: newRequests,
      updatedAt: Date.now(),
    };
  });
};

const updateRequestHelper = (
  collections: Collection[],
  collectionId: string,
  requestId: string,
  updates: Partial<ApiRequest>,
): Collection[] => {
  return collections.map((c) => {
    if (c.id !== collectionId) return c;
    return {
      ...c,
      requests: c.requests.map((r) =>
        r.id === requestId ? { ...r, ...updates, updatedAt: Date.now() } : r,
      ),
      folders: c.folders.map((f) =>
        updateRequestsInFolder(f, requestId, updates),
      ),
      updatedAt: Date.now(),
    };
  });
};

const deleteRequestHelper = (
  collections: Collection[],
  collectionId: string,
  requestId: string,
): Collection[] => {
  return collections.map((c) => {
    if (c.id !== collectionId) return c;
    return {
      ...c,
      requests: c.requests.filter((r) => r.id !== requestId),
      folders: c.folders.map((f) => deleteRequestFromFolder(f, requestId)),
      updatedAt: Date.now(),
    };
  });
};

// --- Store ---

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: [],
      activeCollectionId: null,
      activeFolderId: null,
      isLoading: false,
      hasHydrated: false,

      addCollection: (collection) =>
        set((state) => ({ collections: [...state.collections, collection] })),

      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c,
          ),
        })),

      deleteCollection: async (id) => {
        const collection = get().collections.find((c) => c.id === id);

        // Optimistic delete
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
          activeCollectionId:
            state.activeCollectionId === id ? null : state.activeCollectionId,
        }));

        if (collection?.isSynced) {
          try {
            await collectionService.deleteCollection(id);
          } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
              useAuthStore.getState().logout();
              return;
            }
            // Rollback on failure
            if (collection) {
              set((state) => ({
                collections: [...state.collections, collection],
              }));
            }
          }
        }
      },

      setActiveCollection: (id) => set({ activeCollectionId: id }),

      addFolder: (collectionId, parentFolderId, folder) =>
        set((state) => ({
          collections: addFolderToCollection(
            state.collections,
            collectionId,
            parentFolderId,
            folder,
          ),
        })),

      deleteFolder: (collectionId, folderId) =>
        set((state) => ({
          collections: deleteFolderFromCollection(
            state.collections,
            collectionId,
            folderId,
          ),
        })),

      setActiveFolder: (id) => set({ activeFolderId: id }),

      addRequestToCollection: (collectionId, folderId, request) =>
        set((state) => ({
          collections: addRequestHelper(
            state.collections,
            collectionId,
            folderId,
            request,
          ),
        })),

      updateRequestInCollection: (collectionId, requestId, updates) =>
        set((state) => ({
          collections: updateRequestHelper(
            state.collections,
            collectionId,
            requestId,
            updates,
          ),
        })),

      deleteRequestFromCollection: (collectionId, requestId) =>
        set((state) => ({
          collections: deleteRequestHelper(
            state.collections,
            collectionId,
            requestId,
          ),
        })),

      importCollection: (data) => {
        try {
          const collection = data as Collection;
          if (!collection.id || !collection.name) return null;

          const newCollection: Collection = {
            ...collection,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          get().addCollection(newCollection);
          return newCollection;
        } catch {
          return null;
        }
      },

      exportCollection: (id) => {
        const collection = get().collections.find((c) => c.id === id);
        if (!collection) return null;
        return JSON.stringify(collection, null, 2);
      },

      toggleSync: async (id) => {
        const collection = get().collections.find((c) => c.id === id);
        if (!collection) return;

        const newSyncState = !collection.isSynced;
        get().updateCollection(id, {
          isSynced: newSyncState,
          updatedAt: Date.now(),
        });

        if (newSyncState) {
          try {
            await collectionService.syncCollection(collection);
          } catch (error) {
            // Revert on failure
            get().updateCollection(id, { isSynced: false });

            if (error instanceof ApiError && error.status === 401) {
              useAuthStore.getState().logout();
            }
          }
        }
      },

      fetchRemoteCollections: async () => {
        // Wait for hydration to complete so local state is settled
        if (!get().hasHydrated) return;

        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          if (!token) {
            set({ isLoading: false });
            return;
          }

          const remoteCollections = await collectionService.fetchCollections();

          const localCollections = get().collections;
          const unsyncedLocals = localCollections.filter((c) => !c.isSynced);

          const mergedCollections = [
            ...unsyncedLocals,
            ...remoteCollections.map((c) => ({ ...c, isSynced: true })),
          ];

          set({ collections: mergedCollections });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            useAuthStore.getState().logout();
            set((state) => ({
              collections: state.collections.filter((c) => !c.isSynced),
            }));
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "vessel-collections",
      onRehydrateStorage: () => {
        return () => {
          useCollectionStore.setState({ hasHydrated: true });
        };
      },
      partialize: (state) => ({
        ...state,
        collections: state.collections.filter((c) => !c.isSynced),
        activeCollectionId: state.activeCollectionId,
        activeFolderId: state.activeFolderId,
      }),
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          try {
            const { getSQLiteStorage } = await import("./sqlite-storage");
            return await getSQLiteStorage().getItem(name);
          } catch {
            return localStorage.getItem(name);
          }
        },
        setItem: async (name, value) => {
          try {
            const { getSQLiteStorage } = await import("./sqlite-storage");
            await getSQLiteStorage().setItem(name, value);
          } catch {
            localStorage.setItem(name, value);
          }
        },
        removeItem: async (name) => {
          try {
            const { getSQLiteStorage } = await import("./sqlite-storage");
            await getSQLiteStorage().removeItem(name);
          } catch {
            localStorage.removeItem(name);
          }
        },
      })),
    },
  ),
);
