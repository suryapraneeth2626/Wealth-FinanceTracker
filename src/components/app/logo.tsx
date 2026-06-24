import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: number;
}

/** Minimal W-mark drawn as an upward chart line — premium fintech feel. */
export function LogoMark({ className, size = 32 }: Props) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-lg bg-foreground text-background",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7 L7.5 17 L12 10 L16.5 17 L21 7" />
      </svg>
      <span
        className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-accent"
        style={{ boxShadow: "0 0 8px color-mix(in oklab, var(--accent) 70%, transparent)" }}
      />
    </span>
  );
}

export function Logo({
  collapsed = false,
  className,
  size = 32,
}: {
  collapsed?: boolean;
  className?: string;
  size?: number;
}) {
  if (collapsed) {
    return (
      <div className={cn("flex w-full justify-center", className)}>
        <LogoMark size={size} />
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-3 overflow-hidden", className)}>
      <LogoMark size={size} />
      <div className="min-w-0 leading-tight">
        <div className="font-display text-sm font-semibold tracking-tight">Wealth-Finance</div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Tracker · AI
        </div>
      </div>
    </div>
  );
}
