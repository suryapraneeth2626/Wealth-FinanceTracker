import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useFinance } from "@/lib/store";
import { CATEGORIES, type Category } from "@/lib/types";
import { budgetUsage } from "@/lib/finance";
import { formatCurrency } from "@/lib/currency";
import { PageHeader, Card, EmptyState } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/budgets")({
  head: () => ({
    meta: [
      { title: "Budgets — Wealth" },
      { name: "description", content: "Monthly category budgets." },
    ],
  }),
  component: BudgetsPage,
});

function BudgetsPage() {
  const profile = useFinance((s) => s.profile);
  const budgets = useFinance((s) => s.budgets);
  const txns = useFinance((s) => s.transactions);
  const addBudget = useFinance((s) => s.addBudget);
  const deleteBudget = useFinance((s) => s.deleteBudget);

  const usage = useMemo(() => budgetUsage(txns, budgets), [txns, budgets]);
  const fmt = (v: number) => formatCurrency(v, profile.currency);

  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<Category>("Food");
  const [monthly, setMonthly] = useState("");
  const [label, setLabel] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(monthly);
    if (!m || m <= 0) return;
    if (cat === "Other" && !label.trim()) return;
    addBudget({ category: cat, monthly: m, label: cat === "Other" ? label.trim() : undefined });
    setMonthly("");
    setLabel("");
    setOpen(false);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Budgets"
        title="Monthly category limits"
        description="Set spending caps per category. We'll warn you as you approach them."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 size-4" /> New budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={cat} onValueChange={(v) => setCat(v as Category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => !budgets.find((b) => b.category === c)).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {cat === "Other" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="bLabel">What kind of budget?</Label>
                    <Input
                      id="bLabel"
                      placeholder="e.g. Pet care, Gifts, Subscriptions"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Monthly limit ({profile.currency})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={monthly}
                    onChange={(e) => setMonthly(e.target.value)}
                    className="font-mono"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6 md:p-10">
        {usage.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {usage.map((u, i) => {
              const pct = Math.min(1, u.pct);
              const danger = u.over;
              const warning = !danger && u.pct > 0.85;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="relative">
                    <button
                      onClick={() => deleteBudget(u.id)}
                      className="absolute right-4 top-4 grid size-7 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-rose-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {u.label || u.category}
                      {u.label && (
                        <span className="ml-1.5 normal-case tracking-normal text-[10px] text-muted-foreground/70">
                          · {u.category}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-medium tracking-tight">
                        {fmt(u.spent)}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        / {fmt(u.monthly)}
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${
                          danger ? "bg-rose-500" : warning ? "bg-amber-400" : "bg-accent"
                        }`}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                      <span className="text-muted-foreground">
                        {(u.pct * 100).toFixed(0)}% used
                      </span>
                      <span className={danger ? "text-rose-400" : "text-muted-foreground"}>
                        {danger ? "Over by " : "Left "} {fmt(Math.abs(u.monthly - u.spent))}
                      </span>
                    </div>
                    {danger && (
                      <div className="mt-3 flex items-center gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[11px] text-rose-300">
                        <AlertTriangle className="size-3.5" /> Over budget this month
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No budgets yet"
            description="Create a budget for any category to start tracking spending limits."
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-1 size-4" /> Create your first budget
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
