# Penny iMessage Personal Finance Spec (implementation)

**Product:** Personal finance agent in iMessage (not general-purpose).

**Data mode:** MOCK_DATA by default via seeded provider; replaceable interface for future bank sync. Never fabricate live balances.

**Persistence:** Postgres via `PENNY_DATABASE_URL` | `DATABASE_URL` | `POSTGRES_URL`. Without it, finance mutations return a clear config error (unless `PENNY_ALLOW_MEMORY_STORE=1` for local demo / `NODE_ENV=test`).

**Scheduler:** `GET /api/cron/finance` with `Authorization: Bearer $CRON_SECRET`. Vercel cron daily 14:00 UTC. Sends only to users with explicit opt-in flags. Quiet hours respected. Digest dedupe per period key.

**Confirm UX:** 👍/❤️/✅ confirm; 👎/❌ cancel; native category poll; text corrections.

**Out of scope now:** Bank linking, transfers, dashboard, unsolicited proactive messages.
