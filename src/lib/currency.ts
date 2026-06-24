export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
] as const;

export function formatCurrency(amount: number, currency = "USD", opts?: { compact?: boolean }) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: opts?.compact && Math.abs(amount) >= 10_000 ? 1 : 2,
      notation: opts?.compact && Math.abs(amount) >= 10_000 ? "compact" : "standard",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function currencySymbol(code = "USD") {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}
