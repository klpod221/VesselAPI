import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Collection, CollectionFolder, ApiRequest } from '../types/request';

interface CollectionState {
  collections: Collection[];
  activeCollectionId: string | null;
  activeFolderId: string | null;
}

interface CollectionActions {
  // Collection CRUD
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  setActiveCollection: (id: string | null) => void;
  
  // Folder operations
  addFolder: (collectionId: string, parentFolderId: string | null, folder: CollectionFolder) => void;
  deleteFolder: (collectionId: string, folderId: string) => void;
  setActiveFolder: (id: string | null) => void;
  
  // Request operations within collections
  addRequestToCollection: (collectionId: string, folderId: string | null, request: ApiRequest) => void;
  updateRequestInCollection: (collectionId: string, requestId: string, updates: Partial<ApiRequest>) => void;
  deleteRequestFromCollection: (collectionId: string, requestId: string) => void;
  
  // Import/Export
  importCollection: (data: unknown) => Collection | null;
  exportCollection: (id: string) => string | null;
}

type CollectionStore = CollectionState & CollectionActions;

const findAndUpdateInFolders = (
  folders: CollectionFolder[],
  folderId: string,
  updater: (folder: CollectionFolder) => CollectionFolder
): CollectionFolder[] => {
  return folders.map((folder) => {
    if (folder.id === folderId) {
      return updater(folder);
    }
    return {
      ...folder,
      folders: findAndUpdateInFolders(folder.folders, folderId, updater),
    };
  });
};

const deleteFromFolders = (folders: CollectionFolder[], folderId: string): CollectionFolder[] => {
  return folders
    .filter((f) => f.id !== folderId)
    .map((folder) => ({
      ...folder,
      folders: deleteFromFolders(folder.folders, folderId),
    }));
};

// Helper functions to reduce nesting depth

// Helper functions to reduce nesting depth

const updateRequestsInFolder = (
  folder: CollectionFolder,
  requestId: string,
  updates: Partial<ApiRequest>
): CollectionFolder => {
  return {
    ...folder,
    requests: folder.requests.map((r) =>
      r.id === requestId ? { ...r, ...updates, updatedAt: Date.now() } : r
    ),
    folders: folder.folders.map((f) => updateRequestsInFolder(f, requestId, updates)),
  };
};

const deleteRequestFromFolder = (
  folder: CollectionFolder,
  requestId: string
): CollectionFolder => {
  return {
    ...folder,
    requests: folder.requests.filter((r) => r.id !== requestId),
    folders: folder.folders.map((f) => deleteRequestFromFolder(f, requestId)),
  };
};

// Pure helper functions for store updates
const addFolderToCollection = (
  collections: Collection[],
  collectionId: string,
  parentFolderId: string | null,
  folder: CollectionFolder
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
  folderId: string
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

const addRequestToCollectionHelper = (
  collections: Collection[],
  collectionId: string,
  folderId: string | null,
  request: ApiRequest
): Collection[] => {
  return collections.map((c) => {
    if (c.id !== collectionId) return c;
    
    const newFolders = folderId 
      ? findAndUpdateInFolders(c.folders, folderId, (f) => ({
          ...f,
          requests: [...f.requests, request],
        }))
      : c.folders;

    const newRequests = folderId
      ? c.requests
      : [...c.requests, request];

    return { 
      ...c, 
      folders: newFolders,
      requests: newRequests,
      updatedAt: Date.now() 
    };
  });
};

const updateRequestInCollectionHelper = (
  collections: Collection[],
  collectionId: string,
  requestId: string,
  updates: Partial<ApiRequest>
): Collection[] => {
  return collections.map((c) => {
    if (c.id !== collectionId) return c;
    
    return {
      ...c,
      requests: c.requests.map((r) =>
        r.id === requestId ? { ...r, ...updates, updatedAt: Date.now() } : r
      ),
      folders: c.folders.map((f) => updateRequestsInFolder(f, requestId, updates)),
      updatedAt: Date.now(),
    };
  });
};

const deleteRequestFromCollectionHelper = (
  collections: Collection[],
  collectionId: string,
  requestId: string
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

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      // State
      collections: [],
      activeCollectionId: null,
      activeFolderId: null,
      
      // Actions
      addCollection: (collection) =>
        set((state) => ({ collections: [...state.collections, collection] })),
      
      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        })),
      
      deleteCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
          activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId,
        })),
      
      setActiveCollection: (id) => set({ activeCollectionId: id }),
      
      addFolder: (collectionId, parentFolderId, folder) =>
        set((state) => ({
          collections: addFolderToCollection(state.collections, collectionId, parentFolderId, folder)
        })),
      
      deleteFolder: (collectionId, folderId) =>
        set((state) => ({
          collections: deleteFolderFromCollection(state.collections, collectionId, folderId)
        })),
      
      setActiveFolder: (id) => set({ activeFolderId: id }),
      
      addRequestToCollection: (collectionId, folderId, request) =>
        set((state) => ({
          collections: addRequestToCollectionHelper(state.collections, collectionId, folderId, request)
        })),
      
      updateRequestInCollection: (collectionId, requestId, updates) =>
        set((state) => ({
          collections: updateRequestInCollectionHelper(state.collections, collectionId, requestId, updates)
        })),
      
      deleteRequestFromCollection: (collectionId, requestId) =>
        set((state) => ({
          collections: deleteRequestFromCollectionHelper(state.collections, collectionId, requestId)
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
    }),
    {
      name: 'vessel-collections',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
