import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Drama } from '../lib/api';

export type Platform = 'dramabox' | 'melolo' | 'netshort' | 'reelife';

interface StoreState {
  myList: Drama[];
  addToList: (drama: Drama) => void;
  removeFromList: (id: string) => void;
  isInList: (id: string) => boolean;
  
  continueWatching: Record<string, { episodeId: string; progress: number; timestamp: number }>;
  updateProgress: (dramaId: string, episodeId: string, progress: number) => void;
  
  user: { name: string } | null;
  login: (name: string) => void;
  logout: () => void;

  platform: Platform;
  setPlatform: (platform: Platform) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      myList: [],
      addToList: (drama) => set((state) => ({ myList: [...state.myList, drama] })),
      removeFromList: (id) => set((state) => ({ myList: state.myList.filter((d) => d.id !== id) })),
      isInList: (id) => get().myList.some((d) => d.id === id),

      continueWatching: {},
      updateProgress: (dramaId, episodeId, progress) =>
        set((state) => ({
          continueWatching: {
            ...state.continueWatching,
            [dramaId]: { episodeId, progress, timestamp: Date.now() },
          },
        })),

      user: null,
      login: (name) => set({ user: { name } }),
      logout: () => set({ user: null }),

      platform: 'dramabox',
      setPlatform: (platform) => set({ platform }),
    }),
    {
      name: 'netflix-clone-storage',
    }
  )
);
