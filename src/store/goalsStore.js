import { create } from "zustand";

export const useGoalsStore = create((set) => ({
  // Start with no fixed goals; each user creates their own
  goals: [],

  addGoal: (goal) =>
    set((state) => ({
      goals: [...state.goals, goal],
    })),

  updateGoal: (id, patch) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              ...patch,
            }
          : g,
      ),
    })),

  setAllocationType: (id, allocation_type) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              allocation_type,
            }
          : g,
      ),
    })),

  setAllocationValue: (id, value) =>
    set((state) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return state;
      }

      return {
        goals: state.goals.map((g) =>
          g.id === id
            ? {
                ...g,
                allocation_value: num,
              }
            : g,
        ),
      };
    }),

  distributeDeposit: (amount) =>
    set((state) => {
      if (!amount || amount <= 0) {
        return state;
      }

      // Build requested shares for each goal based on its allocation rule
      const requests = state.goals.map((g) => {
        const type = g.allocation_type || "percentage";
        const value = Number(g.allocation_value) || 0;

        if (value <= 0) {
          return { id: g.id, requested: 0 };
        }

        let requested = 0;
        if (type === "fixed") {
          requested = value;
        } else {
          requested = (amount * value) / 100;
        }

        return { id: g.id, requested };
      });

      const totalRequested = requests.reduce(
        (sum, r) => sum + (r.requested || 0),
        0,
      );

      if (totalRequested <= 0) {
        if (!state.goals.length) {
          return {
            goals: [
              {
                id: "default-savings",
                name: "My Savings",
                target_amount: 0,
                current_amount: amount,
                allocation_type: "percentage",
                allocation_value: 100,
              },
            ],
          };
        }

        const equalShare = amount / state.goals.length;
        return {
          goals: state.goals.map((g) => ({
            ...g,
            current_amount: Number(g.current_amount) + equalShare,
          })),
        };
      }

      const factor = totalRequested > amount ? amount / totalRequested : 1;

      const updatedGoals = state.goals.map((g) => {
        const match = requests.find((r) => r.id === g.id);
        const requested = match?.requested || 0;
        const share = requested * factor;

        if (share <= 0) return g;

        return {
          ...g,
          current_amount: Number(g.current_amount) + share,
        };
      });

      return { goals: updatedGoals };
    }),

  deductFromGoal: (id, amount) =>
    set((state) => {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) return state;

      return {
        goals: state.goals.map((g) =>
          g.id === id
            ? {
                ...g,
                current_amount: Math.max(
                  0,
                  Number(g.current_amount) - Math.min(num, Number(g.current_amount)),
                ),
              }
            : g,
        ),
      };
    }),

  deductFromTotal: (amount) =>
    set((state) => {
      let remaining = Number(amount);
      if (isNaN(remaining) || remaining <= 0) return state;

      const updatedGoals = state.goals.map((g) => {
        if (remaining <= 0) return g;

        const balance = Number(g.current_amount) || 0;
        if (balance <= 0) return g;

        const toDeduct = Math.min(balance, remaining);
        remaining -= toDeduct;

        return {
          ...g,
          current_amount: balance - toDeduct,
        };
      });

      return { goals: updatedGoals };
    }),

  resetGoals: () => set({ goals: [] }),
}));

