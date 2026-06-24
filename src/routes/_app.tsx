import { Link, Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Sparkles,
  Target,
  Settings as SettingsIcon,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/app/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  hero?: boolean;
};
const nav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: Wallet },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai", label: "AI Analytics", icon: Sparkles, hero: true },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function AppLayout() {
  const navigate = useNavigate();
  const authed = useFinance((s) => s.authed);
  const onboarded = useFinance((s) => s.onboarded);
  const profile = useFinance((s) => s.profile);
  const logout = useFinance((s) => s.logout);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!authed) navigate({ to: "/login" });
    else if (!onboarded) navigate({ to: "/onboarding" });
  }, [hydrated, authed, onboarded, navigate]);

  if (!hydrated || !authed || !onboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-2 animate-pulse rounded-full bg-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface/40 backdrop-blur transition-[width] duration-300 md:flex",
          collapsed ? "w-[68px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex gap-2 px-3 py-3",
            collapsed ? "flex-col items-center" : "h-16 items-center justify-between",
          )}
        >
          <Link
            to="/dashboard"
            className={cn("flex min-w-0 items-center", collapsed && "w-full justify-center")}
          >
            <Logo collapsed={collapsed} />
          </Link>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="grid size-7 shrink-0 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {!collapsed && (
            <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Overview
            </div>
          )}
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? item.hero
                      ? "border border-accent/30 bg-accent/10 text-accent"
                      : "bg-surface-2 text-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                  item.hero && !active && "text-foreground",
                )}
              >
                {item.hero && active && (
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-accent/10 blur-md animate-pulse-glow" />
                )}
                <Icon className={cn("size-4 shrink-0", item.hero && "text-accent")} />
                {!collapsed && (
                  <span className="flex-1 truncate">
                    {item.label}
                    {item.hero && (
                      <span className="ml-1.5 rounded bg-accent/15 px-1 py-px font-mono text-[8px] uppercase tracking-widest text-accent">
                        AI
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border p-3">
          {!collapsed && (
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Appearance
              </span>
              <ThemeToggle />
            </div>
          )}
          {collapsed && <ThemeToggle className="mx-auto" />}
          <div className="flex items-center gap-2 rounded-md bg-surface px-2 py-2">
            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-[10px] font-mono text-accent">
              {(profile.name?.[0] || "W").toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{profile.name || "User"}</div>
                <div className="truncate text-[10px] text-muted-foreground">Local demo</div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
