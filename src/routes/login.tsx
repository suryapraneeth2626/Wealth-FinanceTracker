import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useFinance } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/app/logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Wealth-Finance Tracker" },
      { name: "description", content: "Sign in to your AI-powered personal finance dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useFinance((s) => s.login);
  const onboarded = useFinance((s) => s.onboarded);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    login(email || "demo@quantum.app");
    navigate({ to: onboarded ? "/dashboard" : "/onboarding" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute -left-32 top-32 size-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 right-0 size-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.6 0.2 280) 0%, transparent 70%)" }}
        />
        <div className="relative">
          <Logo size={32} />
        </div>

        <div className="relative space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-semibold tracking-tighter text-balance"
          >
            Every dollar accounted for.{" "}
            <span className="text-accent">Every decision informed.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md text-sm text-muted-foreground"
          >
            A precision instrument panel for income, spending, budgets, and goals — with
            Gemini-powered insights that actually understand your data.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-3 gap-3 pt-4"
          >
            {[
              { k: "Avg saved", v: "32.5%" },
              { k: "Health", v: "84.2" },
              { k: "Forecast", v: "+11.2%" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-lg border border-border bg-background/40 p-3 backdrop-blur"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {s.k}
                </div>
                <div className="mt-1 font-mono text-lg font-medium tracking-tight">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          v1 · portfolio demo · data stored locally
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="lg:hidden">
            <Logo size={28} />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Sign in
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Use any email and password — this is a local demo.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-accent hover:underline">
                  Forgot password
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember me on this device
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              New here? Just sign in — you'll be guided through setup.
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
