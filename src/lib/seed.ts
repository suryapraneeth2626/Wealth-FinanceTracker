import type { Budget, Goal, Transaction } from "./types";

const CATS: Array<{ c: Transaction["category"]; m: string[]; min: number; max: number }> = [
  {
    c: "Food",
    m: ["Blue Bottle Coffee", "Sweetgreen", "Whole Foods", "Uber Eats", "Trader Joe's"],
    min: 8,
    max: 95,
  },
  { c: "Shopping", m: ["Apple Store", "Amazon", "Zara", "IKEA"], min: 25, max: 480 },
  { c: "Travel", m: ["Uber", "Lyft", "Delta Airlines", "Airbnb"], min: 12, max: 620 },
  { c: "Bills", m: ["Verizon", "ConEd Electric", "Spectrum Internet", "Rent"], min: 45, max: 2400 },
  { c: "Entertainment", m: ["Netflix", "Spotify", "Steam", "AMC Theatres"], min: 9, max: 60 },
  { c: "Healthcare", m: ["CVS Pharmacy", "One Medical"], min: 18, max: 220 },
  { c: "Investments", m: ["Vanguard", "Fidelity", "Coinbase"], min: 100, max: 1500 },
];

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

/** Format a Date as yyyy-mm-dd using LOCAL time (avoids UTC shift). */
function localISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function seedDemoData(monthlyIncome: number) {
  const r = rng(42);
  const today = new Date();
  const txns: Transaction[] = [];

  for (let monthOffset = 3; monthOffset >= 0; monthOffset--) {
    const base = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);

    txns.push({
      id: crypto.randomUUID(),
      date: localISODate(new Date(base.getFullYear(), base.getMonth(), 1)),
      category: "Salary",
      amount: monthlyIncome,
      type: "income",
      method: "Bank Transfer",
      merchant: "Payroll",
      notes: "Monthly salary",
    });

    if (r() < 0.6) {
      txns.push({
        id: crypto.randomUUID(),
        date: localISODate(new Date(base.getFullYear(), base.getMonth(), 18)),
        category: "Freelance",
        amount: Math.round(400 + r() * 1200),
        type: "income",
        method: "Bank Transfer",
        merchant: "Client invoice",
      });
    }

    const count = 22 + Math.floor(r() * 14);
    const maxDay = monthOffset === 0 ? today.getDate() : 28;
    for (let i = 0; i < count; i++) {
      const cat = CATS[Math.floor(r() * CATS.length)];
      const day = 1 + Math.floor(r() * maxDay);
      const merchant = cat.m[Math.floor(r() * cat.m.length)];
      txns.push({
        id: crypto.randomUUID(),
        date: localISODate(new Date(base.getFullYear(), base.getMonth(), day)),
        category: cat.c,
        amount: Math.round(cat.min + r() * (cat.max - cat.min)),
        type: "expense",
        method: r() < 0.7 ? "Card" : r() < 0.85 ? "UPI" : "Bank Transfer",
        merchant,
      });
    }
  }

  const budgets: Budget[] = [
    { id: crypto.randomUUID(), category: "Food", monthly: Math.round(monthlyIncome * 0.12) },
    { id: crypto.randomUUID(), category: "Shopping", monthly: Math.round(monthlyIncome * 0.08) },
    { id: crypto.randomUUID(), category: "Travel", monthly: Math.round(monthlyIncome * 0.06) },
    { id: crypto.randomUUID(), category: "Bills", monthly: Math.round(monthlyIncome * 0.25) },
    {
      id: crypto.randomUUID(),
      category: "Entertainment",
      monthly: Math.round(monthlyIncome * 0.04),
    },
  ];

  const goals: Goal[] = [
    {
      id: crypto.randomUUID(),
      name: "Emergency fund",
      category: "Emergency",
      target: Math.round(monthlyIncome * 6),
      saved: Math.round(monthlyIncome * 2.4),
      createdAt: new Date().toISOString(),
      deadline: localISODate(new Date(today.getFullYear() + 1, today.getMonth(), 1)),
    },
    {
      id: crypto.randomUUID(),
      name: "Japan trip",
      category: "Travel",
      target: 5800,
      saved: 1950,
      createdAt: new Date().toISOString(),
      deadline: localISODate(new Date(today.getFullYear(), today.getMonth() + 9, 1)),
    },
    {
      id: crypto.randomUUID(),
      name: "Index fund top-up",
      category: "Investment",
      target: 12000,
      saved: 4200,
      createdAt: new Date().toISOString(),
    },
  ];

  return { txns, budgets, goals };
}
