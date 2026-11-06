# iMessage Personal Finance Implementation Plan

> **For agentic workers:** Inline execution under user authorization t316u. TDD for money/engine/store.

**Goal:** Personal finance agent in iMessage with mock provider-swappable ledger, confirm flows, charts, opt-in scheduled digests.

**Architecture:** Domain engine over `FinanceRepository` + `FinanceDataProvider`. Mock provider seeds labeled demo accounts/transactions. Postgres (DATABASE_URL / POSTGRES_URL / PENNY_DATABASE_URL) for durable user-isolated state. Vercel Cron + CRON_SECRET for digests. Spectrum webhook routes text/attachment/reaction/poll. No dashboard; no bank link yet.

**Tech Stack:** Next.js App Router, spectrum-ts, AI SDK Gemini (text+vision), Postgres, next/og charts.

## Global Constraints
- Personal finance only; mock data unmistakable
- No bank integration / transfers / unattended real-user scheduler sends without opt-in
- Landing UI unchanged
- Persist via real DB integration; report blocker if env missing
- Author IjonK4; push only when complete

### Tasks
- [x] Plan + branch feat/imessage-finance from main
- [x] Money math + types + mock provider (TDD)
- [x] Repository (memory test + postgres) + migrations
- [x] Engine: capture, confirm, correct, queries, budgets, recurring
- [x] Webhook routing: text/attachment/reaction/poll + typing/read
- [x] Charts + cron digests + docs/config
- [ ] Push + merge + deploy verify (needs laptop GCM / connected machine)
