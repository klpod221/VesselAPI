import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ClientMode } from '@vessel/network';

type Theme = 'light' | 'dark' | 'system';
type EditorFontSize = 12 | 14 | 16 | 18;

interface SettingsState {
  // Appearance
  theme: Theme;
  editorFontSize: EditorFontSize;
  
  // Network
  preferredClientMode: ClientMode;
  defaultTimeout: number;
  followRedirects: boolean;
  
  // Editor
  wordWrap: boolean;
  lineNumbers: boolean;
  formatOnPaste: boolean;
  
  // Data
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

const defaultSettings: SettingsState = {
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

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'vessel-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
