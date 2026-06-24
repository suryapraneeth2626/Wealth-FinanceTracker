import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useFinance } from "@/lib/store";
import {
  budgetUsage,
  categoryBreakdown,
  computeStats,
  dailyTrend,
  healthScore,
  monthlyTrend,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/currency";
import { PageHeader, Card } from "@/components/app/page";
import { KpiCard } from "@/components/app/kpi-card";
import { HealthScoreCard } from "@/components/app/health-score";
import { CategoryPie, IncomeExpenseBar, NetTrendArea } from "@/components/app/charts";
import { Button } from "@/components/ui/button";
import { AIInsightPreview } from "@/components/app/ai-insight-preview";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Wealth" },
      { name: "description", content: "Your finance command center." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useFinance((s) => s.profile);
  const txns = useFinance((s) => s.transactions);
  const budgets = useFinance((s) => s.budgets);
  const stats = useMemo(() => computeStats(txns), [txns]);
  const trend = useMemo(() => monthlyTrend(txns, 6), [txns]);
  const daily = useMemo(() => dailyTrend(txns, 30), [txns]);
  const breakdown = useMemo(() => categoryBreakdown(txns).slice(0, 6), [txns]);
  const score = useMemo(() => healthScore(stats, budgets, txns), [stats, budgets, txns]);
  const usage = useMemo(() => budgetUsage(txns, budgets).slice(0, 4), [txns, budgets]);
  const recent = useMemo(
    () => [...txns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [txns],
  );
  const fmt = (v: number) => formatCurrency(v, profile.currency, { compact: true });

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow={`Welcome back, ${profile.name || "friend"}`}
        title="Command Center"
        description="A precision view of your financial state — updated in real time."
        actions={
          <>
            <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 md:flex">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                System nominal
              </span>
            </div>
            <Button asChild>
              <Link to="/transactions" search={{ new: 1 }}>
                <Plus className="mr-1 size-4" /> Add transaction
              </Link>
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6 md:p-10">
        <div className="grid grid-cols-12 gap-4">
          <HealthScoreCard score={score} className="col-span-12 md:col-span-4" />
          <div className="col-span-12 md:col-span-8">
            <AIInsightPreview />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-5"
        >
          <KpiCard label="Total Balance" value={stats.totalBalance} format={fmt} delay={0} />
          <KpiCard label="Monthly Income" value={stats.monthlyIncome} format={fmt} delay={0.05} />
          <KpiCard
            label="Burn Rate"
            value={stats.monthlyExpenses}
            format={fmt}
            delay={0.1}
            delta={{ value: 12, positiveIsGood: false }}
          />
          <KpiCard
            label="Savings Rate"
            value={stats.savingsRate * 100}
            format={(v) => `${v.toFixed(1)}%`}
            delay={0.15}
            delta={{ value: 2.4, positiveIsGood: true }}
          />
          <KpiCard
            label="Investments"
            value={stats.investmentTotal}
            format={fmt}
            delay={0.2}
            accent
          />
        </motion.div>

        <div className="grid grid-cols-12 gap-4">
          <Card
            className="col-span-12 lg:col-span-8"
            title="Cash flow"
            description="Last 30 days · net = income − expense"
          >
            <NetTrendArea data={daily} format={fmt} />
          </Card>
          <Card
            className="col-span-12 lg:col-span-4"
            title="Expense distribution"
            description="This month"
          >
            {breakdown.length ? (
              <>
                <CategoryPie data={breakdown} format={fmt} />
                <ul className="mt-4 space-y-2">
                  {breakdown.slice(0, 4).map((c) => (
                    <li key={c.name} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="font-mono">{fmt(c.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No expenses this month yet.</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card
            className="col-span-12 lg:col-span-8"
            title="Income vs expense"
            description="Last 6 months"
          >
            <IncomeExpenseBar data={trend} format={fmt} />
          </Card>
          <Card
            className="col-span-12 lg:col-span-4"
            title="Budget limits"
            description="This month"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/budgets">Manage</Link>
              </Button>
            }
          >
            {usage.length ? (
              <ul className="space-y-4">
                {usage.map((u) => (
                  <li key={u.id} className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">{u.category}</span>
                      <span>
                        {fmt(u.spent)} / {fmt(u.monthly)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          u.over ? "bg-rose-500" : u.pct > 0.85 ? "bg-amber-400" : "bg-accent/70"
                        }`}
                        style={{ width: `${Math.min(100, u.pct * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No budgets yet.</p>
            )}
          </Card>
        </div>

        <Card
          title="Recent activity"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/transactions">View all</Link>
            </Button>
          }
        >
          {recent.length ? (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-2 pb-2">Merchant</th>
                    <th className="px-2 pb-2">Category</th>
                    <th className="px-2 pb-2 hidden sm:table-cell">Date</th>
                    <th className="px-2 pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((t) => (
                    <tr key={t.id} className="text-xs">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-6 place-items-center rounded bg-surface-2 font-mono text-[10px] text-muted-foreground">
                            {(t.merchant || t.category)[0]}
                          </div>
                          <span className="font-medium">{t.merchant || t.category}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">{t.category}</td>
                      <td className="px-2 py-3 hidden sm:table-cell font-mono text-[10px] uppercase text-muted-foreground">
                        {t.date}
                      </td>
                      <td
                        className={`px-2 py-3 text-right font-mono ${
                          t.type === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.type === "income" ? "+" : "−"}
                        {fmt(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          )}
        </Card>

        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-xs text-muted-foreground">
          <Sparkles className="mr-1.5 -mt-0.5 inline size-3.5 text-accent" />
          Want deeper analysis? Visit{" "}
          <Link to="/ai" className="text-accent underline-offset-2 hover:underline">
            AI Analytics
          </Link>{" "}
          to generate a full health report and chat with your data.
        </div>
      </div>
    </div>
  );
}
