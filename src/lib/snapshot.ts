import type { Budget, Goal, Profile, Transaction } from "./types";
import { budgetUsage, categoryBreakdown, computeStats, monthlyTrend } from "./finance";

export function buildSnapshot(
  txns: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  profile: Profile,
) {
  const stats = computeStats(txns);
  const breakdown = categoryBreakdown(txns).slice(0, 10);
  const trend = monthlyTrend(txns, 6).map(({ month, income, expense }) => ({
    month,
    income,
    expense,
  }));
  const bUsage = budgetUsage(txns, budgets).map((b) => ({
    category: b.category,
    monthly: b.monthly,
    spent: b.spent,
  }));
  const recent = [...txns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)
    .map((t) => ({
      date: t.date,
      category: t.category,
      amount: t.amount,
      type: t.type,
      merchant: t.merchant,
    }));
  return {
    currency: profile.currency,
    monthlyIncome: stats.monthlyIncome,
    monthlyExpenses: stats.monthlyExpenses,
    totalBalance: stats.totalBalance,
    savingsRate: stats.savingsRate,
    topCategories: breakdown,
    monthlyTrend: trend,
    budgets: bUsage,
    goals: goals.map((g) => ({ name: g.name, target: g.target, saved: g.saved })),
    recentTransactions: recent,
  };
}
