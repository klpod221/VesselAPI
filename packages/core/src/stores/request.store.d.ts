import type { ApiRequest, ApiResponse } from '../types/request';
import type { NetworkClient } from '@vessel/network';
interface RequestState {
    activeRequest: ApiRequest | null;
    lastResponse: ApiResponse | null;
    isLoading: boolean;
    error: string | null;
    networkClient: NetworkClient | null;
}
interface RequestActions {
    setClient: (client: NetworkClient) => void;
    newRequest: () => void;
    updateRequest: (updates: Partial<ApiRequest>) => void;
    executeRequest: () => Promise<void>;
    clearResponse: () => void;
    setActiveRequest: (request: ApiRequest | null) => void;
}
type RequestStore = RequestState & RequestActions;
export declare const useRequestStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<RequestStore>, "setState" | "persist"> & {
    setState(partial: RequestStore | Partial<RequestStore> | ((state: RequestStore) => RequestStore | Partial<RequestStore>), replace?: false | undefined): unknown;
    setState(state: RequestStore | ((state: RequestStore) => RequestStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<RequestStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: RequestStore) => void) => () => void;
        onFinishHydration: (fn: (state: RequestStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<RequestStore, unknown, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=request.store.d.ts.map