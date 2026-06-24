import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  className?: string;
}

export function HealthScoreCard({ score, className }: Props) {
  const pct = Math.max(0, Math.min(100, score));
  const status = pct >= 80 ? "Strong" : pct >= 60 ? "Healthy" : pct >= 40 ? "Watch" : "At risk";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-6",
        className,
      )}
    >
      <div
        className="absolute -right-12 -bottom-12 size-56 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />
      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Financial Health Score
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <h2 className="text-5xl font-semibold tabular-nums tracking-tight text-foreground">
            {pct.toFixed(1)}
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-accent">{status}</span>
        </div>
      </div>
      <div className="relative mt-6 space-y-2">
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>STABILITY INDEX</span>
          <span>{pct.toFixed(0)} / 100</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-accent glow-accent"
          />
        </div>
      </div>
    </motion.div>
  );
}
