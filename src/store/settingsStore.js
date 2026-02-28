import { create } from "zustand";

export const useSettingsStore = create((set) => ({
  // default prototype values – can be adjusted later or from onboarding/profile
  deduction_type: "percentage",
  amount: 10,
  is_enabled: true,
  duration_months: 6,

  setDeductionType: (deduction_type) => set({ deduction_type }),
  setAmount: (amount) => set({ amount }),
  setDurationMonths: (duration_months) =>
    set({
      duration_months: Math.max(6, Number(duration_months) || 6),
    }),
  toggleEnabled: () => set((state) => ({ is_enabled: !state.is_enabled })),
  setAll: (settings) =>
    set({
      deduction_type:
        settings?.deduction_type ?? settings?.deductionType ?? "percentage",
      amount: settings?.amount ?? 10,
      is_enabled:
        typeof settings?.is_enabled === "boolean"
          ? settings.is_enabled
          : true,
      duration_months:
        settings?.duration_months && settings.duration_months >= 6
          ? settings.duration_months
          : 6,
    }),

  resetToDemo: () =>
    set({
      deduction_type: "percentage",
      amount: 10,
      is_enabled: true,
      duration_months: 6,
    }),
}));

