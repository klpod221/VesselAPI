import type { ClientMode } from '@vessel/network';
type Theme = 'light' | 'dark' | 'system';
type EditorFontSize = 12 | 14 | 16 | 18;
interface SettingsState {
    theme: Theme;
    editorFontSize: EditorFontSize;
    preferredClientMode: ClientMode;
    defaultTimeout: number;
    followRedirects: boolean;
    wordWrap: boolean;
    lineNumbers: boolean;
    formatOnPaste: boolean;
    collectionsPath: string;
    autoSave: boolean;
}
interface SettingsActions {
    setTheme: (theme: Theme) => void;
    setEditorFontSize: (size: EditorFontSize) => void;
    setPreferredClientMode: (mode: ClientMode) => void;
    setDefaultTimeout: (timeout: number) => void;
    setFollowRedirects: (follow: boolean) => void;
    setWordWrap: (wrap: boolean) => void;
    setLineNumbers: (show: boolean) => void;
    setFormatOnPaste: (format: boolean) => void;
    setCollectionsPath: (path: string) => void;
    setAutoSave: (autoSave: boolean) => void;
    resetToDefaults: () => void;
}
type SettingsStore = SettingsState & SettingsActions;
export declare const useSettingsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<SettingsStore>, "setState" | "persist"> & {
    setState(partial: SettingsStore | Partial<SettingsStore> | ((state: SettingsStore) => SettingsStore | Partial<SettingsStore>), replace?: false | undefined): unknown;
    setState(state: SettingsStore | ((state: SettingsStore) => SettingsStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<SettingsStore, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: SettingsStore) => void) => () => void;
        onFinishHydration: (fn: (state: SettingsStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<SettingsStore, unknown, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=settings.store.d.ts.map