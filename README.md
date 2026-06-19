# Show Me Italy — Admin Dashboard

React admin SPA for Show Me Italy tour guide management.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Stack

- Vite + React + TypeScript
- Ant Design 5 (custom green theme)
- Redux Toolkit
- React Router v6

## Structure

- `src/components/layout/` — Admin shell (sidebar, topbar)
- `src/components/ui/` — Shared UI primitives
- `src/features/dashboard/` — Dashboard page + Phase 2 widget stubs
- `src/constants/navigation.ts` — Sidebar nav + route metadata

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (future) |
