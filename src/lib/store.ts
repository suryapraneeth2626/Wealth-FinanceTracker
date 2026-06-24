import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIReport, Budget, Goal, Profile, Transaction } from "./types";
import { seedDemoData } from "./seed";

interface FinanceState {
  // auth & onboarding
  authed: boolean;
  onboarded: boolean;
  profile: Profile;
  // data
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  // ai
  aiReport: AIReport | null;
  // actions
  login: (email: string) => void;
  logout: () => void;
  completeOnboarding: (p: Profile) => void;
  updateProfile: (p: Partial<Profile>) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setAIReport: (r: AIReport | null) => void;
  loadDemoData: () => void;
  resetAll: () => void;
}

const defaultProfile: Profile = {
  name: "",
  monthlyIncome: 0,
  currency: "USD",
};

export const useFinance = create<FinanceState>()(
  persist(
    (set, get) => ({
      authed: false,
      onboarded: false,
      profile: defaultProfile,
      transactions: [],
      budgets: [],
      goals: [],
      aiReport: null,

      login: (email) =>
        set((s) => ({
          authed: true,
          profile: s.profile.name ? s.profile : { ...s.profile, name: email.split("@")[0] || "" },
        })),
      logout: () => set({ authed: false }),

      completeOnboarding: (p) => {
        const { txns, budgets, goals } = seedDemoData(p.monthlyIncome || 5000);
        const has = get().transactions.length > 0;
        set({
          onboarded: true,
          authed: true,
          profile: p,
          transactions: has ? get().transactions : txns,
          budgets: has ? get().budgets : budgets,
          goals: has ? get().goals : goals,
        });
      },

      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: crypto.randomUUID(), createdAt: Date.now() },
            ...s.transactions,
          ],
        })),
      updateTransaction: (id, t) =>
        set((s) => ({
          transactions: s.transactions.map((x) => (x.id === id ? { ...x, ...t } : x)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      addBudget: (b) =>
        set((s) => ({ budgets: [...s.budgets, { ...b, id: crypto.randomUUID() }] })),
      updateBudget: (id, b) =>
        set((s) => ({ budgets: s.budgets.map((x) => (x.id === id ? { ...x, ...b } : x)) })),
      deleteBudget: (id) => set((s) => ({ budgets: s.budgets.filter((x) => x.id !== id) })),

      addGoal: (g) =>
        set((s) => ({
          goals: [
            ...s.goals,
            { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      updateGoal: (id, g) =>
        set((s) => ({ goals: s.goals.map((x) => (x.id === id ? { ...x, ...g } : x)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((x) => x.id !== id) })),

      setAIReport: (r) => set({ aiReport: r }),

      loadDemoData: () => {
        const income = get().profile.monthlyIncome || 5000;
        const { txns, budgets, goals } = seedDemoData(income);
        set({ transactions: txns, budgets, goals });
      },

      resetAll: () =>
        set({
          authed: false,
          onboarded: false,
          profile: defaultProfile,
          transactions: [],
          budgets: [],
          goals: [],
          aiReport: null,
        }),
    }),
    { name: "quantum-finance-v1" },
  ),
);
