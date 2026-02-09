import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
const findAndUpdateInFolders = (folders, folderId, updater) => {
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
const deleteFromFolders = (folders, folderId) => {
    return folders
        .filter((f) => f.id !== folderId)
        .map((folder) => ({
        ...folder,
        folders: deleteFromFolders(folder.folders, folderId),
    }));
};
// Helper functions to reduce nesting depth
// Helper functions to reduce nesting depth
const updateRequestsInFolder = (folder, requestId, updates) => {
    return {
        ...folder,
        requests: folder.requests.map((r) => r.id === requestId ? { ...r, ...updates, updatedAt: Date.now() } : r),
        folders: folder.folders.map((f) => updateRequestsInFolder(f, requestId, updates)),
    };
};
const deleteRequestFromFolder = (folder, requestId) => {
    return {
        ...folder,
        requests: folder.requests.filter((r) => r.id !== requestId),
        folders: folder.folders.map((f) => deleteRequestFromFolder(f, requestId)),
    };
};
// Pure helper functions for store updates
const addFolderToCollection = (collections, collectionId, parentFolderId, folder) => {
    return collections.map((c) => {
        if (c.id !== collectionId)
            return c;
        const newFolders = parentFolderId
            ? findAndUpdateInFolders(c.folders, parentFolderId, (f) => ({
                ...f,
                folders: [...f.folders, folder],
            }))
            : [...c.folders, folder];
        return { ...c, folders: newFolders, updatedAt: Date.now() };
    });
};
const deleteFolderFromCollection = (collections, collectionId, folderId) => {
    return collections.map((c) => {
        if (c.id !== collectionId)
            return c;
        return {
            ...c,
            folders: deleteFromFolders(c.folders, folderId),
            updatedAt: Date.now(),
        };
    });
};
const addRequestToCollectionHelper = (collections, collectionId, folderId, request) => {
    return collections.map((c) => {
        if (c.id !== collectionId)
            return c;
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
const updateRequestInCollectionHelper = (collections, collectionId, requestId, updates) => {
    return collections.map((c) => {
        if (c.id !== collectionId)
            return c;
        return {
            ...c,
            requests: c.requests.map((r) => r.id === requestId ? { ...r, ...updates, updatedAt: Date.now() } : r),
            folders: c.folders.map((f) => updateRequestsInFolder(f, requestId, updates)),
            updatedAt: Date.now(),
        };
    });
};
const deleteRequestFromCollectionHelper = (collections, collectionId, requestId) => {
    return collections.map((c) => {
        if (c.id !== collectionId)
            return c;
        return {
            ...c,
            requests: c.requests.filter((r) => r.id !== requestId),
            folders: c.folders.map((f) => deleteRequestFromFolder(f, requestId)),
            updatedAt: Date.now(),
        };
    });
};
export const useCollectionStore = create()(persist((set, get) => ({
    // State
    collections: [],
    activeCollectionId: null,
    activeFolderId: null,
    // Actions
    addCollection: (collection) => set((state) => ({ collections: [...state.collections, collection] })),
    updateCollection: (id, updates) => set((state) => ({
        collections: state.collections.map((c) => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c),
    })),
    deleteCollection: (id) => set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
        activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId,
    })),
    setActiveCollection: (id) => set({ activeCollectionId: id }),
    addFolder: (collectionId, parentFolderId, folder) => set((state) => ({
        collections: addFolderToCollection(state.collections, collectionId, parentFolderId, folder)
    })),
    deleteFolder: (collectionId, folderId) => set((state) => ({
        collections: deleteFolderFromCollection(state.collections, collectionId, folderId)
    })),
    setActiveFolder: (id) => set({ activeFolderId: id }),
    addRequestToCollection: (collectionId, folderId, request) => set((state) => ({
        collections: addRequestToCollectionHelper(state.collections, collectionId, folderId, request)
    })),
    updateRequestInCollection: (collectionId, requestId, updates) => set((state) => ({
        collections: updateRequestInCollectionHelper(state.collections, collectionId, requestId, updates)
    })),
    deleteRequestFromCollection: (collectionId, requestId) => set((state) => ({
        collections: deleteRequestFromCollectionHelper(state.collections, collectionId, requestId)
    })),
    importCollection: (data) => {
        try {
            const collection = data;
            if (!collection.id || !collection.name)
                return null;
            const newCollection = {
                ...collection,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            get().addCollection(newCollection);
            return newCollection;
        }
        catch {
            return null;
        }
    },
    exportCollection: (id) => {
        const collection = get().collections.find((c) => c.id === id);
        if (!collection)
            return null;
        return JSON.stringify(collection, null, 2);
    },
}), {
    name: 'vessel-collections',
    storage: createJSONStorage(() => ({
        getItem: async (name) => {
            try {
                const { getSQLiteStorage } = await import('./sqlite-storage');
                return await getSQLiteStorage().getItem(name);
            }
            catch {
                return localStorage.getItem(name);
            }
        },
        setItem: async (name, value) => {
            try {
                const { getSQLiteStorage } = await import('./sqlite-storage');
                await getSQLiteStorage().setItem(name, value);
            }
            catch {
                localStorage.setItem(name, value);
            }
        },
        removeItem: async (name) => {
            try {
                const { getSQLiteStorage } = await import('./sqlite-storage');
                await getSQLiteStorage().removeItem(name);
            }
            catch {
                localStorage.removeItem(name);
            }
        },
    })),
}));
//# sourceMappingURL=collection.store.js.map