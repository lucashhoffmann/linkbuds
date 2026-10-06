import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IPreviewStore {
  /** Analytics panel beside the page preview; open by default. */
  analyticsOpen: boolean;
  toggleAnalytics: () => void;
}

export const usePreviewStore = create<IPreviewStore>()(
  persist(
    (set) => ({
      analyticsOpen: true,
      toggleAnalytics: () =>
        set((state) => ({ analyticsOpen: !state.analyticsOpen })),
    }),
    { name: 'linkbuds:preview' },
  ),
);
