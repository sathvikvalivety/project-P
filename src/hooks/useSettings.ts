import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  outputPattern: string;
  workerThreads: number;
  maxFileSizeMB: number;
  offlineMode: boolean;
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: {
        outputPattern: '{original}_processed',
        workerThreads: 2,
        maxFileSizeMB: 50,
        offlineMode: true,
      },
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),
    }),
    {
      name: 'doccraft:settings',
    }
  )
);
