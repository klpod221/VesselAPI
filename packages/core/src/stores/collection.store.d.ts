import type { Collection, CollectionFolder, ApiRequest } from '../types/request';
interface CollectionState {
    collections: Collection[];
    activeCollectionId: string | null;
    activeFolderId: string | null;
}
interface CollectionActions {
    addCollection: (collection: Collection) => void;
    updateCollection: (id: string, updates: Partial<Collection>) => void;
    deleteCollection: (id: string) => void;
    setActiveCollection: (id: string | null) => void;
    addFolder: (collectionId: string, parentFolderId: string | null, folder: CollectionFolder) => void;
    deleteFolder: (collectionId: string, folderId: string) => void;
    setActiveFolder: (id: string | null) => void;
    addRequestToCollection: (collectionId: string, folderId: string | null, request: ApiRequest) => void;
    updateRequestInCollection: (collectionId: string, requestId: string, updates: Partial<ApiRequest>) => void;
    deleteRequestFromCollection: (collectionId: string, requestId: string) => void;
    importCollection: (data: unknown) => Collection | null;
    exportCollection: (id: string) => string | null;
}
type CollectionStore = CollectionState & CollectionActions;
export declare const useCollectionStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<CollectionStore>, "setState" | "persist"> & {
    setState(partial: CollectionStore | Partial<CollectionStore> | ((state: CollectionStore) => CollectionStore | Partial<CollectionStore>), replace?: false | undefined): unknown;
    setState(state: CollectionStore | ((state: CollectionStore) => CollectionStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<CollectionStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CollectionStore) => void) => () => void;
        onFinishHydration: (fn: (state: CollectionStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<CollectionStore, unknown, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=collection.store.d.ts.map