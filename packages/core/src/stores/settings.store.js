import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
const defaultSettings = {
    theme: 'system',
    editorFontSize: 14,
    preferredClientMode: 'auto',
    defaultTimeout: 30000,
    followRedirects: true,
    wordWrap: true,
    lineNumbers: true,
    formatOnPaste: true,
    collectionsPath: './collections',
    autoSave: true,
};
export const useSettingsStore = create()(persist((set) => ({
    ...defaultSettings,
    setTheme: (theme) => set({ theme }),
    setEditorFontSize: (editorFontSize) => set({ editorFontSize }),
    setPreferredClientMode: (preferredClientMode) => set({ preferredClientMode }),
    setDefaultTimeout: (defaultTimeout) => set({ defaultTimeout }),
    setFollowRedirects: (followRedirects) => set({ followRedirects }),
    setWordWrap: (wordWrap) => set({ wordWrap }),
    setLineNumbers: (lineNumbers) => set({ lineNumbers }),
    setFormatOnPaste: (formatOnPaste) => set({ formatOnPaste }),
    setCollectionsPath: (collectionsPath) => set({ collectionsPath }),
    setAutoSave: (autoSave) => set({ autoSave }),
    resetToDefaults: () => set(defaultSettings),
}), {
    name: 'vessel-settings',
    storage: createJSONStorage(() => ({
        getItem: async (name) => {
            try {
                const { getSQLiteKVStorage } = await import('./sqlite-storage');
                return await getSQLiteKVStorage().getItem(name);
            }
            catch {
                return localStorage.getItem(name);
            }
        },
        setItem: async (name, value) => {
            try {
                const { getSQLiteKVStorage } = await import('./sqlite-storage');
                await getSQLiteKVStorage().setItem(name, value);
            }
            catch {
                localStorage.setItem(name, value);
            }
        },
        removeItem: async (name) => {
            try {
                const { getSQLiteKVStorage } = await import('./sqlite-storage');
                await getSQLiteKVStorage().removeItem(name);
            }
            catch {
                localStorage.removeItem(name);
            }
        },
    })),
}));
//# sourceMappingURL=settings.store.js.map