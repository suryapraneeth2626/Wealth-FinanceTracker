import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useFinance } from "@/lib/store";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  type Category,
  type PaymentMethod,
  type Transaction,
  type TxType,
} from "@/lib/types";
import { formatCurrency } from "@/lib/currency";
import { toCSV, downloadCSV } from "@/lib/csv";
import { PageHeader, Card, EmptyState } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export const Route = createFileRoute("/_app/transactions")({
  validateSearch: (s: Record<string, unknown>) => ({
    new: s.new === 1 || s.new === "1" ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Transactions — Wealth" },
      { name: "description", content: "All your transactions in one searchable place." },
    ],
  }),
  component: TransactionsPage,
});

interface FormState {
  date: string;
  category: Category;
  type: TxType;
  amount: string;
  method: PaymentMethod;
  merchant: string;
  notes: string;
}

const emptyForm = (): FormState => ({
  date: new Date().toISOString().slice(0, 10),
  category: "Food",
  type: "expense",
  amount: "",
  method: "Card",
  merchant: "",
  notes: "",
});

function TransactionsPage() {
  const profile = useFinance((s) => s.profile);
  const txns = useFinance((s) => s.transactions);
  const addTx = useFinance((s) => s.addTransaction);
  const updateTx = useFinance((s) => s.updateTransaction);
  const deleteTx = useFinance((s) => s.deleteTransaction);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  useEffect(() => {
    if (searchParams.new === 1) {
      setEditing(null);
      setForm(emptyForm());
      setOpen(true);
      navigate({ to: "/transactions", search: {}, replace: true });
    }
  }, [searchParams.new, navigate]);

  const fmt = (v: number) => formatCurrency(v, profile.currency);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...txns]
      .filter((t) => {
        if (filterCat !== "all" && t.category !== filterCat) return false;
        if (filterType !== "all" && t.type !== filterType) return false;
        if (!q) return true;
        return (
          t.merchant?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const d =
          sortOrder === "latest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
        if (d !== 0) return d;
        return sortOrder === "latest"
          ? (b.createdAt ?? 0) - (a.createdAt ?? 0)
          : (a.createdAt ?? 0) - (b.createdAt ?? 0);
      });
  }, [txns, search, filterCat, filterType, sortOrder]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({
      date: t.date,
      category: t.category,
      type: t.type,
      amount: String(t.amount),
      method: t.method,
      merchant: t.merchant ?? "",
      notes: t.notes ?? "",
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return;
    const payload = {
      date: form.date,
      category: form.category,
      type: form.type,
      amount: amt,
      method: form.method,
      merchant: form.merchant || undefined,
      notes: form.notes || undefined,
    };
    if (editing) updateTx(editing.id, payload);
    else {
      addTx(payload);
      // Reset filters so the new item is always visible at the top
      setSearch("");
      setFilterCat("all");
      setFilterType("all");
    }
    setOpen(false);
  };

  const exportCSV = () => {
    const rows = filtered.map((t) => ({
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount,
      method: t.method,
      merchant: t.merchant ?? "",
      notes: t.notes ?? "",
    }));
    downloadCSV(`wealth-transactions-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Transactions"
        title="All activity"
        description={`${txns.length} entries across all categories.`}
        actions={
          <>
            <Button variant="outline" onClick={exportCSV} disabled={!filtered.length}>
              <Download className="mr-1 size-4" /> Export CSV
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew}>
                  <Plus className="mr-1 size-4" /> Add transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit transaction" : "New transaction"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v) => setForm({ ...form, type: v as TxType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Select
                        value={form.category}
                        onValueChange={(v) => setForm({ ...form, category: v as Category })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Payment method</Label>
                      <Select
                        value={form.method}
                        onValueChange={(v) => setForm({ ...form, method: v as PaymentMethod })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        required
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Merchant</Label>
                      <Input
                        value={form.merchant}
                        onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editing ? "Save changes" : "Add"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className="space-y-4 p-6 md:p-10">
        <Card className="!p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search merchant, category, notes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "latest" | "oldest")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {filtered.length ? (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2/40">
                  <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 hidden md:table-cell">Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 w-px" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.01, 0.2) }}
                      className="text-xs hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">
                        {t.date}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-7 place-items-center rounded bg-surface-2 font-mono text-[10px] text-muted-foreground">
                            {(t.merchant || t.category)[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-medium">
                              {t.merchant || t.category}
                            </div>
                            {t.notes && (
                              <div className="truncate text-[10px] text-muted-foreground">
                                {t.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-mono text-[10px] uppercase text-muted-foreground">
                        {t.method}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono ${
                          t.type === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.type === "income" ? "+" : "−"}
                        {fmt(t.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(t)}
                            className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                            aria-label="Edit"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTx(t.id)}
                            className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-rose-400"
                            aria-label="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No transactions"
            description="Add one or load demo data to get started."
            action={
              <Button onClick={openNew}>
                <Plus className="mr-1 size-4" />
                Add your first transaction
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
