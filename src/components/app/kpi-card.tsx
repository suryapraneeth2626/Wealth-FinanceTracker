import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

interface Props {
  label: string;
  value: number;
  format?: (v: number) => string;
  delta?: { value: number; positiveIsGood?: boolean };
  accent?: boolean;
  className?: string;
  delay?: number;
}

export function KpiCard({ label, value, format, delta, accent, className, delay = 0 }: Props) {
  const positive = delta ? delta.value >= 0 : true;
  const good = delta ? (delta.positiveIsGood ?? true) === positive : true;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative space-y-2 rounded-xl border border-border bg-surface/60 p-4 transition-colors hover:bg-surface",
        accent && "ring-1 ring-accent/30",
        className,
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-xl font-medium tracking-tight">
        <AnimatedCounter value={value} format={format} />
      </p>
      {delta && (
        <p
          className={cn(
            "font-mono text-[10px] uppercase tracking-wider",
            good ? "text-emerald-400" : "text-rose-400",
          )}
        >
          {positive ? "+" : ""}
          {delta.value.toFixed(1)}%
        </p>
      )}
    </motion.div>
  );
}
