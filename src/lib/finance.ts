import type { Budget, Goal, Transaction } from "./types";

export interface FinanceStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number; // 0-1
  investmentTotal: number;
  topCategory: { category: string; amount: number } | null;
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Parse "yyyy-mm-dd" as a local-time date to avoid UTC shifting. */
export function parseLocalDate(iso: string) {
  const s = iso.slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function inCurrentMonth(iso: string, ref = new Date()) {
  const d = parseLocalDate(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function computeStats(txns: Transaction[]): FinanceStats {
  let totalBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let investmentTotal = 0;
  const catTotals = new Map<string, number>();

  for (const t of txns) {
    const signed = t.type === "income" ? t.amount : -t.amount;
    totalBalance += signed;
    if (t.category === "Investments") investmentTotal += t.amount;
    if (inCurrentMonth(t.date)) {
      if (t.type === "income") monthlyIncome += t.amount;
      else {
        monthlyExpenses += t.amount;
        catTotals.set(t.category, (catTotals.get(t.category) ?? 0) + t.amount);
      }
    }
  }

  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, (monthlyIncome - monthlyExpenses) / monthlyIncome) : 0;

  let topCategory: FinanceStats["topCategory"] = null;
  for (const [c, v] of catTotals) {
    if (!topCategory || v > topCategory.amount) topCategory = { category: c, amount: v };
  }

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    investmentTotal,
    topCategory,
  };
}

export function categoryBreakdown(txns: Transaction[]) {
  const m = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== "expense") continue;
    if (!inCurrentMonth(t.date)) continue;
    m.set(t.category, (m.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function monthlyTrend(txns: Transaction[], months = 6) {
  const now = new Date();
  const out: { month: string; income: number; expense: number; net: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString(undefined, { month: "short" });
    let income = 0;
    let expense = 0;
    for (const t of txns) {
      const td = parseLocalDate(t.date);
      if (td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
    }
    out.push({ month: label, income, expense, net: income - expense });
  }
  return out;
}

export function dailyTrend(txns: Transaction[], days = 30) {
  const now = new Date();
  const out: { day: string; income: number; expense: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    let income = 0;
    let expense = 0;
    for (const t of txns) {
      if (t.date.slice(0, 10) === key) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
    }
    out.push({
      day: d.toLocaleString(undefined, { month: "short", day: "numeric" }),
      income,
      expense,
    });
  }
  return out;
}

export function budgetUsage(txns: Transaction[], budgets: Budget[]) {
  return budgets.map((b) => {
    const spent = txns
      .filter((t) => t.type === "expense" && t.category === b.category && inCurrentMonth(t.date))
      .reduce((s, t) => s + t.amount, 0);
    return {
      ...b,
      spent,
      pct: b.monthly > 0 ? spent / b.monthly : 0,
      remaining: Math.max(0, b.monthly - spent),
      over: spent > b.monthly,
    };
  });
}

/**
 * Heuristic financial health score 0-100. Used as a fast local fallback
 * before AI report runs; the AI Analytics module can refine this.
 */
export function healthScore(stats: FinanceStats, budgets: Budget[], txns: Transaction[]) {
  let score = 50;
  // Savings rate weight
  score += Math.min(30, stats.savingsRate * 100 * 0.6);
  // Budget discipline
  const usage = budgetUsage(txns, budgets);
  if (usage.length) {
    const over = usage.filter((u) => u.over).length;
    score -= over * 6;
    const avg = usage.reduce((s, u) => s + Math.min(1, u.pct), 0) / usage.length;
    score += (1 - avg) * 10;
  }
  // Balance positive
  if (stats.totalBalance > 0) score += 5;
  if (stats.totalBalance < 0) score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function goalProgress(g: Goal) {
  const pct = g.target > 0 ? Math.min(1, g.saved / g.target) : 0;
  let etaMonths: number | null = null;
  if (g.deadline) {
    const d = new Date(g.deadline).getTime();
    const now = Date.now();
    etaMonths = Math.max(0, Math.round((d - now) / (1000 * 60 * 60 * 24 * 30)));
  }
  return { pct, etaMonths };
}
