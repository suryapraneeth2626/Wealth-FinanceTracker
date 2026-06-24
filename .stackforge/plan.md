## Design direction

Going with **Quantum — Precision Cockpit** (v3): charcoal `#09090b` background, cyan `#22d3ee` single accent, Inter Tight / Inter / JetBrains Mono, soft glow on the AI nav item, mono micro-labels, restrained motion. Tokens copied verbatim into `src/styles.css`.

## Stack

- **Frontend:** TanStack Start (already scaffolded), React 19, Tailwind v4, shadcn/ui, Framer Motion, Recharts, Zustand, React Hook Form + Zod.
- **AI:** Gemini via neural gateway (`google/gemini-3-flash-preview`) through a TanStack server route — `AI_GATEWAY_API_KEY` stays server-side.
- **Persistence:** **localStorage** (Zustand `persist` middleware). No hosted backend, no Postgres, no real backend per your request.
- **Auth:** Client-only mock auth gate stored in localStorage (login / first-time setup screens are UI only — they unlock the app locally). I'll flag this clearly in the UI so it's not mistaken for real auth.

## Scope (Phase 1)

Included:

1. Login screen (split-screen, glass card, animated gradient bg)
2. First-time setup wizard (name, monthly income, currency, goals, PIN) — multi-step with progress
3. App shell: collapsible sidebar, top bar, route transitions
4. Dashboard: health score, 5 KPI cards, cash-flow chart, expense distribution donut, recent transactions, budget overview, AI insight preview
5. Transactions: table, add/edit/delete dialog, search, category + type + date filters, CSV export
6. Budgets: per-category monthly budgets with progress bars + over-limit alerts
7. Analytics: trends (line/area), category breakdown (pie/bar), monthly/quarterly/yearly toggle, CSV export
8. **AI Analytics (hero):** health analysis, spending insights, savings recommendations, budget optimization, forecasting, AI chat assistant — all streaming from Gemini using real local data
9. Goals: create/track goals with progress, milestones, ETA prediction
10. Settings: profile, currency, theme (dark default), PIN change, export/clear data

Deferred (call out for "phase 2"): draggable/customizable widgets, CSV import, PDF export, real 2FA, real backend auth, multi-device sync.

## Architecture

```text
src/
  routes/
    __root.tsx                  app shell + providers + Framer transitions
    index.tsx                   redirects to /login or /dashboard
    login.tsx
    onboarding.tsx
    _app.tsx                    layout w/ sidebar + Outlet (auth gate)
    _app.dashboard.tsx
    _app.transactions.tsx
    _app.budgets.tsx
    _app.analytics.tsx
    _app.ai.tsx                 AI Analytics hub (insights + chat)
    _app.goals.tsx
    _app.settings.tsx
    api/
      chat.ts                   streamText -> Gemini (AI chat)
      insights.ts               generateText -> structured insights
  components/
    app/  (Sidebar, TopBar, KPI, HealthScore, Charts/*, TransactionTable,
           BudgetBar, GoalCard, AIInsightCard, AIChat, EmptyState, Skeletons)
    ui/   (existing shadcn)
  lib/
    ai-gateway.server.ts        Neural gateway provider helper
    store/                      Zustand stores (auth, profile, transactions,
                                budgets, goals, settings) all `persist`'d
    finance.ts                  derivations: KPIs, health score, forecasts
    seed.ts                     optional demo-data seeder for empty state
    currency.ts, csv.ts
  styles.css                    Quantum tokens
```

## AI integration

- `src/routes/api/chat.ts` — `streamText` with system prompt that receives a compact JSON snapshot of the user's local financial data (last 90 days txns, budgets, goals, KPIs). Used by the AI chat assistant via `useChat` + AI Elements.
- `src/routes/api/insights.ts` — `generateText` with `Output.object` (Zod schema) returning `{ healthScore, disciplineScore, riskLevel, insights[], recommendations[], forecast{} }`. Used by the AI Analytics page cards and the dashboard "AI Insight Preview" widget.
- AI calls are triggered on demand (button + auto on AI page load), cached in Zustand to avoid burning credits on every navigation.

## UX details

- Skeleton loaders on every async surface, animated counters on KPIs, page transitions via Framer Motion, hover elevation on cards, smooth chart mount animations (Recharts built-in), empty states with a "Load demo data" CTA, toast errors for AI 429/402 with clear remediation copy.
- Fully responsive: sidebar collapses to icon rail on tablet, slides over on mobile.
- a11y: focus rings, semantic landmarks, aria labels on charts, keyboard nav on table.

## Implementation order

1. Tokens + app shell + sidebar + routing + auth gate
2. Zustand stores + demo seed + dashboard
3. Transactions + budgets + goals
4. Analytics
5. AI gateway wiring + AI Analytics page + chat + dashboard AI preview
6. Settings + polish pass (animations, empty/loading/error states, responsive QA)

## Honest caveats

- localStorage means data is per-browser and clearable — fine for a portfolio demo, not for real money.
- "Login" / "PIN" / "2FA toggle" are UI shells without a real auth server. I'll add a small badge or note so reviewers understand it's a frontend showcase. If you later want real auth + cross-device sync, that's a Supabase add-on.
- Gemini calls require the `AI_GATEWAY_API_KEY` secret; provision it in your deployment environment.
