import { create } from "zustand";

/**
 * Used to trigger a full "start fresh" for demo purposes.
 * When doReset() is called, screens that keep local state (e.g. transactions, local portfolio)
 * can react to resetKey and clear their state.
 */
export const useDemoResetStore = create((set) => ({
  resetKey: 0,
  doReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
}));
