import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "wf-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(KEY) as Theme | null;
  return stored === "dark" || stored === "light" ? stored : "light";
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
  try {
    localStorage.setItem(KEY, t);
  } catch {}
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };
  return { theme, toggle };
}
