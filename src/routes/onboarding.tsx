import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { useFinance } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currency";
import type { EmploymentType, FinancialPriority, Profile, RiskTolerance } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Wealth-Finance Tracker" },
      { name: "description", content: "Set up your finance profile." },
    ],
  }),
  component: Onboarding,
});

const steps = [
  "Profile",
  "Income",
  "Currency",
  "Employment",
  "Priority",
  "Savings",
  "Risk",
  "Security",
] as const;

const PRIORITIES: FinancialPriority[] = [
  "Pay off debt",
  "Build emergency fund",
  "Invest & grow wealth",
  "Save for a big purchase",
  "Retire early",
  "Other",
];

const RISKS: { value: RiskTolerance; label: string; desc: string }[] = [
  { value: "Conservative", label: "Conservative", desc: "Protect capital, low volatility" },
  { value: "Balanced", label: "Balanced", desc: "Steady growth, moderate swings" },
  { value: "Growth", label: "Growth", desc: "Long-term upside, accept dips" },
  { value: "Aggressive", label: "Aggressive", desc: "Maximize returns, high volatility" },
];

const EMPLOYMENT: EmploymentType[] = [
  "Full-time",
  "Self-employed",
  "Freelancer",
  "Student",
  "Other",
];

function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useFinance((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Profile>({
    name: "",
    monthlyIncome: 5000,
    currency: "USD",
    pin: "",
    employment: "Full-time",
    priority: "Build emergency fund",
    savingsTargetPct: 20,
    risk: "Balanced",
    hasDebt: false,
  });

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      completeOnboarding(form);
      navigate({ to: "/dashboard" });
    }
  };
  const back = () => step > 0 && setStep(step - 1);

  const canAdvance =
    (step === 0 && form.name.trim().length > 1) ||
    (step === 1 && form.monthlyIncome > 0) ||
    (step === 2 && !!form.currency) ||
    (step === 3 && !!form.employment) ||
    (step === 4 &&
      !!form.priority &&
      (form.priority !== "Other" || (form.priorityOther?.trim().length ?? 0) > 1)) ||
    (step === 5 && (form.savingsTargetPct ?? 0) >= 0) ||
    (step === 6 && !!form.risk) ||
    (step === 7 && (!form.pin || form.pin.length === 4));

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div
        className="absolute left-1/2 top-1/3 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />
      <div className="relative w-full max-w-xl">
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "grid size-6 place-items-center rounded-full text-[10px] font-mono transition-all",
                  i < step
                    ? "bg-accent text-accent-foreground"
                    : i === step
                      ? "ring-glow bg-surface text-accent"
                      : "bg-surface text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-3" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    i < step ? "bg-accent" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canAdvance) next();
          }}
          className="rounded-2xl border border-border bg-surface/80 p-8 backdrop-blur-xl"
        >
          <div className="mb-6 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
              Step {step + 1} of {steps.length} · {steps[step]}
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    What should we call you?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This appears on your dashboard. You can change it later.
                  </p>
                  <div className="pt-2">
                    <Label htmlFor="name">Display name</Label>
                    <Input
                      id="name"
                      autoFocus
                      placeholder="Julian"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    What's your monthly income?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Used to seed your budgets and savings targets.
                  </p>
                  <div className="pt-2">
                    <Label htmlFor="income">Monthly income</Label>
                    <Input
                      id="income"
                      type="number"
                      min={0}
                      placeholder="5000"
                      value={form.monthlyIncome || ""}
                      onChange={(e) =>
                        setForm({ ...form, monthlyIncome: Number(e.target.value) || 0 })
                      }
                      className="mt-2 font-mono tabular-nums"
                    />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Pick your currency.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    All amounts across the app will use this.
                  </p>
                  <div className="pt-2">
                    <Label>Currency</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => setForm({ ...form, currency: v })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="font-mono mr-2">{c.symbol}</span>
                            {c.code} — {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    How do you earn?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Helps the AI factor in income stability.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {EMPLOYMENT.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setForm({ ...form, employment: e })}
                        className={cn(
                          "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                          form.employment === e
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-surface-2/50 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <label className="mt-4 flex items-center gap-2 rounded-md border border-border bg-surface-2/40 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={!!form.hasDebt}
                      onChange={(e) => setForm({ ...form, hasDebt: e.target.checked })}
                      className="size-4 accent-[var(--accent)]"
                    />
                    <span className="text-sm">I currently carry debt (loans, credit cards)</span>
                  </label>
                </>
              )}
              {step === 4 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    What's your top financial priority?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    The AI will tailor recommendations around this goal.
                  </p>
                  <div className="space-y-2 pt-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm transition-colors",
                          form.priority === p
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-surface-2/50 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span>{p}</span>
                        {form.priority === p && <Check className="size-4 text-accent" />}
                      </button>
                    ))}
                  </div>
                  {form.priority === "Other" && (
                    <div className="pt-2">
                      <Label htmlFor="priorityOther">Tell us more about your priority</Label>
                      <Input
                        id="priorityOther"
                        autoFocus
                        placeholder="e.g. Save for my child's college fund"
                        value={form.priorityOther || ""}
                        onChange={(e) => setForm({ ...form, priorityOther: e.target.value })}
                        className="mt-2"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        The AI will analyze this and tailor recommendations to your goal.
                      </p>
                    </div>
                  )}
                </>
              )}
              {step === 5 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Target savings rate?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    What % of your monthly income do you want to save?
                  </p>
                  <div className="pt-4">
                    <div className="mb-3 flex items-baseline justify-between">
                      <Label>Savings target</Label>
                      <span className="font-mono text-2xl font-semibold tabular-nums text-accent">
                        {form.savingsTargetPct ?? 20}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={70}
                      step={1}
                      value={form.savingsTargetPct ?? 20}
                      onChange={(e) =>
                        setForm({ ...form, savingsTargetPct: Number(e.target.value) })
                      }
                      className="w-full accent-[var(--accent)]"
                    />
                    <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span>0%</span>
                      <span>35%</span>
                      <span>70%</span>
                    </div>
                  </div>
                </>
              )}
              {step === 6 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Investment risk tolerance?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Used to shape AI advice on investing and savings allocation.
                  </p>
                  <div className="space-y-2 pt-2">
                    {RISKS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm({ ...form, risk: r.value })}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-md border px-3 py-3 text-left transition-colors",
                          form.risk === r.value
                            ? "border-accent bg-accent/10"
                            : "border-border bg-surface-2/50 hover:border-accent/40",
                        )}
                      >
                        <div>
                          <div className="text-sm font-medium">{r.label}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{r.desc}</div>
                        </div>
                        {form.risk === r.value && (
                          <Check className="mt-1 size-4 shrink-0 text-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 7 && (
                <>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    Set a 4-digit PIN.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Optional. Locally stored — for portfolio purposes only.
                  </p>
                  <div className="pt-2">
                    <Label htmlFor="pin">Security PIN (optional)</Label>
                    <Input
                      id="pin"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={form.pin || ""}
                      onChange={(e) =>
                        setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                      }
                      className="mt-2 font-mono text-lg tabular-nums tracking-[0.5em]"
                    />
                  </div>
                  <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
                    <strong className="text-accent">Heads up:</strong> we'll seed your account with
                    realistic demo data so the dashboard, charts, and AI insights are immediately
                    impressive. You can clear it in Settings.
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
              Back
            </Button>
            <Button type="submit" disabled={!canAdvance}>
              {step === steps.length - 1 ? "Enter dashboard" : "Continue"}
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
