import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useFinance } from "@/lib/store";
import { buildSnapshot } from "@/lib/snapshot";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { AIReport } from "@/lib/types";

export function AIInsightPreview() {
  const txns = useFinance((s) => s.transactions);
  const budgets = useFinance((s) => s.budgets);
  const goals = useFinance((s) => s.goals);
  const profile = useFinance((s) => s.profile);
  const aiReport = useFinance((s) => s.aiReport);
  const setAIReport = useFinance((s) => s.setAIReport);

  const snapshot = useMemo(
    () => buildSnapshot(txns, budgets, goals, profile),
    [txns, budgets, goals, profile],
  );

  const mut = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot }),
      });
      if (!res.ok) {
        const msg =
          res.status === 429
            ? "Rate limited. Please wait a moment."
            : res.status === 402
              ? "AI credits exhausted. Add credits in workspace settings."
              : "AI request failed.";
        throw new Error(msg);
      }
      return (await res.json()) as AIReport;
    },
    onSuccess: (r) => setAIReport(r),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Something went wrong"),
  });

  const preview = aiReport?.insights?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="group relative h-full"
    >
      <div className="absolute -inset-0.5 rounded-2xl bg-accent/20 opacity-60 blur-md transition-opacity group-hover:opacity-100" />
      <div className="relative flex h-full flex-col justify-between rounded-xl border border-accent/30 bg-surface p-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5">
            <Sparkles className="size-3 text-accent" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
              AI Intelligence
            </span>
          </div>
          {preview ? (
            <>
              <h3 className="font-display text-lg font-medium leading-tight text-balance">
                {preview.title}
              </h3>
              <p className="max-w-xl text-sm text-muted-foreground">{preview.body}</p>
            </>
          ) : (
            <>
              <h3 className="font-display text-lg font-medium leading-tight text-balance">
                Let Wealth analyze your finances.
              </h3>
              <p className="max-w-xl text-sm text-muted-foreground">
                Generate a real-time AI report — spending patterns, savings quality, risk level, and
                tailored recommendations.
              </p>
            </>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? (
              <>
                <Loader2 className="mr-1 size-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 size-4" />
                {preview ? "Refresh insights" : "Generate insights"}
              </>
            )}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/ai">
              Open AI Analytics
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
