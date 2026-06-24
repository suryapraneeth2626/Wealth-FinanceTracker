# Wealth

Wealth is a local-first personal finance dashboard built with TanStack Start, React, Tailwind CSS, Zustand, Recharts, and Google Gemini. It includes transactions, budgets, goals, analytics, AI-generated financial insights, and a streaming AI chatbot.

## Features

- Local-first finance data stored in browser localStorage
- Dashboard KPIs, cash-flow charts, category breakdowns, and recent activity
- Transactions with filtering, add/edit/delete, and CSV export
- Budgets, goals, settings, onboarding, and mock local login
- Gemini-powered AI report generation and streaming chatbot

## Requirements

- Node.js 22 or newer
- npm
- A Google AI Studio Gemini API key

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Add your Gemini API key to `.env`:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

Start the dev server:

```bash
npm run dev
```

On Windows PowerShell, use this if scripts are blocked:

```powershell
npm.cmd run dev
```

## AI Configuration

The Gemini API key is read only inside server routes:

- `src/routes/api/chat.ts`
- `src/routes/api/insights.ts`

Do not prefix the key with `VITE_`. Variables starting with `VITE_` are public client-side variables.

The app uses Google Gemini through the OpenAI-compatible endpoint:

```text
https://generativelanguage.googleapis.com/v1beta/openai
```

Current model:

```text
gemini-3.5-flash
```

## Deployment

Before deploying, add this environment variable in your hosting provider dashboard:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

Recommended build command:

```bash
npm run build
```

Recommended install command:

```bash
npm install
```

Do not upload `.env`; it is ignored by git. Use your host's environment variable settings instead.

## Scripts

```bash
npm run dev       # start local dev server
npm run build     # production build
npm run preview   # preview built app
npm run lint      # lint source files
npm run format    # format files
```

## Security Notes

- `.env` is ignored and must stay private.
- Gemini calls are proxied through server routes so the API key is not exposed to the browser.
- Auth is a local UI gate for demo use, not production authentication.
- Data is stored in localStorage, so it is per-browser and not synced across devices.
