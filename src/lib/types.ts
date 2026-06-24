export type TxType = "income" | "expense";

export const CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Healthcare",
  "Education",
  "Entertainment",
  "Investments",
  "Salary",
  "Freelance",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_METHODS = ["Card", "Cash", "Bank Transfer", "UPI", "Wallet"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  category: Category;
  amount: number; // positive number; sign comes from type
  type: TxType;
  method: PaymentMethod;
  notes?: string;
  merchant?: string;
  createdAt?: number;
}

export interface Budget {
  id: string;
  category: Category;
  monthly: number;
  label?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline?: string; // ISO date
  category: "Emergency" | "Travel" | "Car" | "House" | "Investment" | "Other";
  createdAt: string;
}

export type FinancialPriority =
  | "Pay off debt"
  | "Build emergency fund"
  | "Invest & grow wealth"
  | "Save for a big purchase"
  | "Retire early"
  | "Other";

export type RiskTolerance = "Conservative" | "Balanced" | "Growth" | "Aggressive";

export type EmploymentType = "Full-time" | "Self-employed" | "Freelancer" | "Student" | "Other";

export interface Profile {
  name: string;
  monthlyIncome: number;
  currency: string;
  pin?: string;
  twoFactor?: boolean;
  // Financial preferences
  savingsTargetPct?: number; // 0-100
  priority?: FinancialPriority;
  priorityOther?: string;
  risk?: RiskTolerance;
  employment?: EmploymentType;
  hasDebt?: boolean;
}

export interface AIInsight {
  id: string;
  kind: "tip" | "warning" | "win" | "forecast";
  title: string;
  body: string;
}

export interface AIReport {
  healthScore: number; // 0-100
  disciplineScore: number; // 0-100
  savingsQuality: number; // 0-100
  riskLevel: "low" | "moderate" | "elevated" | "high";
  summary: string;
  insights: AIInsight[];
  recommendations: AIInsight[];
  forecast: {
    endOfMonthBalance: number;
    projectedSavings: number;
    note: string;
  };
  generatedAt: string;
}
