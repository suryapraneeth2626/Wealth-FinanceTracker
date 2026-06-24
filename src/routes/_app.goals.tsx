import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Target as TargetIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useFinance } from "@/lib/store";
import { goalProgress } from "@/lib/finance";
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
import type { Goal } from "@/lib/types";

const CATS: Goal["category"][] = ["Emergency", "Travel", "Car", "House", "Investment", "Other"];

export const Route = createFileRoute("/_app/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Wealth" },
      { name: "description", content: "Financial goals & milestones." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const profile = useFinance((s) => s.profile);
  const goals = useFinance((s) => s.goals);
  const addGoal = useFinance((s) => s.addGoal);
  const updateGoal = useFinance((s) => s.updateGoal);
  const deleteGoal = useFinance((s) => s.deleteGoal);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    target: string;
    saved: string;
    deadline: string;
    category: Goal["category"];
  }>({ name: "", target: "", saved: "0", deadline: "", category: "Emergency" });

  const fmt = (v: number) => formatCurrency(v, profile.currency);

  const stats = useMemo(() => {
    const total = goals.reduce((s, g) => s + g.target, 0);
    const saved = goals.reduce((s, g) => s + g.saved, 0);
    return { total, saved, pct: total > 0 ? saved / total : 0 };
  }, [goals]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = Number(form.target);
    const s = Number(form.saved);
    if (!t || t <= 0) return;
    addGoal({
      name: form.name,
      target: t,
      saved: s,
      deadline: form.deadline || undefined,
      category: form.category,
    });
    setForm({ name: "", target: "", saved: "0", deadline: "", category: "Emergency" });
    setOpen(false);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Goals"
        title="What you're saving for"
        description="Track progress, predict completion, and stay motivated."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 size-4" /> New goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Goal name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Down payment"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v as Goal["category"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target</Label>
                    <Input
                      type="number"
                      value={form.target}
                      onChange={(e) => setForm({ ...form, target: e.target.value })}
                      required
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Already saved</Label>
                    <Input
                      type="number"
                      value={form.saved}
                      onChange={(e) => setForm({ ...form, saved: e.target.value })}
                      className="font-mono"
                    />
                  </div>
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

      <div className="space-y-4 p-6 md:p-10">
        {goals.length ? (
          <>
            <Card>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Total saved across {goals.length} goal{goals.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 font-display text-2xl font-medium tracking-tight">
                    {fmt(stats.saved)}{" "}
                    <span className="font-mono text-sm text-muted-foreground">
                      / {fmt(stats.total)}
                    </span>
                  </p>
                </div>
                <div className="w-full max-w-sm">
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.pct * 100}%` }}
                      transition={{ duration: 0.9 }}
                      className="h-full bg-accent"
                    />
                  </div>
                  <div className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
                    {(stats.pct * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((g, i) => {
                const { pct, etaMonths } = goalProgress(g);
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="relative space-y-3">
                      <button
                        onClick={() => deleteGoal(g.id)}
                        className="absolute right-4 top-4 grid size-7 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-rose-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="grid size-8 place-items-center rounded-md bg-accent/10 text-accent">
                          <TargetIcon className="size-4" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {g.category}
                          </p>
                          <h3 className="font-medium">{g.name}</h3>
                        </div>
                      </div>
                      <div>
                        <p className="font-display text-2xl font-semibold tracking-tight">
                          {fmt(g.saved)}
                          <span className="ml-1 font-mono text-xs text-muted-foreground">
                            / {fmt(g.target)}
                          </span>
                        </p>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-accent"
                        />
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span>{(pct * 100).toFixed(0)}% complete</span>
                        {etaMonths != null && <span>{etaMonths}mo to deadline</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const v = prompt("Add to savings:", "100");
                            const n = Number(v);
                            if (n > 0) updateGoal(g.id, { saved: g.saved + n });
                          }}
                        >
                          + Contribute
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            title="No goals yet"
            description="Set a savings target — emergency fund, trip, car, anything."
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-1 size-4" /> Create your first goal
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
