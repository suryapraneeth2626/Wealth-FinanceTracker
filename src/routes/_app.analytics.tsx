import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useFinance } from "@/lib/store";
import { categoryBreakdown, monthlyTrend } from "@/lib/finance";
import { formatCurrency } from "@/lib/currency";
import { PageHeader, Card } from "@/components/app/page";
import { CategoryBar, CategoryPie, TrendLine } from "@/components/app/charts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toCSV, downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Wealth" },
      { name: "description", content: "Deep financial analytics." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const profile = useFinance((s) => s.profile);
  const txns = useFinance((s) => s.transactions);
  const [range, setRange] = useState<"3" | "6" | "12">("6");

  const trend = useMemo(() => monthlyTrend(txns, Number(range)), [txns, range]);
  const breakdown = useMemo(() => categoryBreakdown(txns), [txns]);
  const totals = useMemo(() => {
    const income = trend.reduce((s, t) => s + t.income, 0);
    const expense = trend.reduce((s, t) => s + t.expense, 0);
    return { income, expense, net: income - expense };
  }, [trend]);

  const fmt = (v: number) => formatCurrency(v, profile.currency, { compact: true });

  const exportTrend = () => {
    downloadCSV(`wealth-analytics-${range}mo.csv`, toCSV(trend));
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Analytics"
        title="Trends & breakdowns"
        description="Enterprise-grade analytics on your full transaction history."
        actions={
          <>
            <Tabs value={range} onValueChange={(v) => setRange(v as "3" | "6" | "12")}>
              <TabsList>
                <TabsTrigger value="3">3M</TabsTrigger>
                <TabsTrigger value="6">6M</TabsTrigger>
                <TabsTrigger value="12">12M</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={exportTrend}>
              <Download className="mr-1 size-4" /> Export
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-6 md:p-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Total income · {range}M
            </p>
            <p className="mt-2 font-mono text-2xl text-emerald-400">{fmt(totals.income)}</p>
          </Card>
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Total expenses · {range}M
            </p>
            <p className="mt-2 font-mono text-2xl text-rose-400">{fmt(totals.expense)}</p>
          </Card>
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Net change · {range}M
            </p>
            <p className="mt-2 font-mono text-2xl">{fmt(totals.net)}</p>
          </Card>
        </div>

        <Card title="Cash flow trend" description={`Last ${range} months`}>
          <TrendLine data={trend} format={fmt} />
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Spending by category" description="This month">
            <CategoryBar data={breakdown} format={fmt} />
          </Card>
          <Card title="Category share" description="This month">
            <CategoryPie data={breakdown} format={fmt} />
            <ul className="mt-4 grid grid-cols-2 gap-1.5 text-xs">
              {breakdown.slice(0, 8).map((c) => (
                <li key={c.name} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">{c.name}</span>
                  <span className="font-mono">{fmt(c.value)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
