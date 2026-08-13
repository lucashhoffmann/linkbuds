import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ISidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<ISidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      setIsOpen: (isOpen) => set({ isOpen }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'linkbuds-sidebar-storage',
    },
  ),
);
