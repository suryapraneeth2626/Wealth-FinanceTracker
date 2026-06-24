import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { useFinance } from "@/lib/store";
import { CURRENCIES } from "@/lib/currency";
import { PageHeader, Card } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toCSV, downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Wealth" },
      { name: "description", content: "Profile & preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const profile = useFinance((s) => s.profile);
  const updateProfile = useFinance((s) => s.updateProfile);
  const txns = useFinance((s) => s.transactions);
  const budgets = useFinance((s) => s.budgets);
  const goals = useFinance((s) => s.goals);
  const loadDemoData = useFinance((s) => s.loadDemoData);
  const resetAll = useFinance((s) => s.resetAll);

  const [name, setName] = useState(profile.name);
  const [pin, setPin] = useState(profile.pin ?? "");

  const exportAll = () => {
    const blob = new Blob(
      [JSON.stringify({ profile, transactions: txns, budgets, goals }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wealth-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Settings"
        title="Preferences"
        description="Manage your profile, currency, security, and data."
      />
      <div className="space-y-4 p-6 md:p-10">
        <Card title="Profile">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Display name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly income</Label>
              <Input
                type="number"
                className="font-mono"
                value={profile.monthlyIncome}
                onChange={(e) => updateProfile({ monthlyIncome: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select
                value={profile.currency}
                onValueChange={(v) => updateProfile({ currency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => {
                updateProfile({ name });
                toast.success("Profile updated");
              }}
            >
              Save changes
            </Button>
          </div>
        </Card>

        <Card title="Security" description="UI demo only — no real auth server.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>4-digit PIN</Label>
              <Input
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="font-mono tracking-[0.4em]"
              />
            </div>
            <div className="flex items-end justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Two-factor auth</p>
                <p className="text-xs text-muted-foreground">Demo toggle.</p>
              </div>
              <Switch
                checked={!!profile.twoFactor}
                onCheckedChange={(v) => updateProfile({ twoFactor: v })}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => {
                updateProfile({ pin });
                toast.success("Security updated");
              }}
            >
              Update security
            </Button>
          </div>
        </Card>

        <Card title="Data" description="Export, regenerate demo data, or clear everything.">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportAll}>
              <Download className="mr-1 size-4" /> Export backup (JSON)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                downloadCSV(
                  `wealth-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
                  toCSV(txns),
                );
              }}
            >
              <Download className="mr-1 size-4" /> Export transactions (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                loadDemoData();
                toast.success("Demo data reloaded");
              }}
            >
              Reload demo data
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Delete all local data and sign out?")) {
                  resetAll();
                  navigate({ to: "/login" });
                }
              }}
            >
              <Trash2 className="mr-1 size-4" /> Delete account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
