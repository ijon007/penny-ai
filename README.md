# Penny

Penny is a general-purpose AI you text on iMessage. This repo is a Next.js app with a one-section welcome page and a Photon Spectrum webhook that replies with Google Gemini.

It is **not** a finance product. No bank tools, no money features — just a helpful assistant branded as Penny.

## Stack

- Next.js App Router (TypeScript, Tailwind CSS)
- [Photon Spectrum](https://photon.codes/docs/spectrum-ts/getting-started) (`spectrum-ts` + iMessage provider)
- [Vercel AI SDK](https://ai-sdk.dev) with `@ai-sdk/google` (`gemini-3.5-flash`)

## Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` (see [Environment variables](#environment-variables)). Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing CTA uses `sms:` with a prefilled “Hey Penny” and `NEXT_PUBLIC_IMESSAGE_NUMBER` (or `+15555550100` if unset).

Photon cannot deliver webhooks to `localhost`. Use a public HTTPS URL (Vercel preview, ngrok, Cloudflare Tunnel) and point Spectrum at `/api/spectrum/webhook`.

## Environment variables

Copy `.env.example`. Never commit secrets.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SPECTRUM_PROJECT_ID` | Yes | Photon project id |
| `SPECTRUM_PROJECT_SECRET` | Yes | Photon project secret |
| `SPECTRUM_WEBHOOK_SECRET` | Yes | Per-webhook HMAC signing secret from Spectrum Cloud (shown once) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey)) |
| `NEXT_PUBLIC_IMESSAGE_NUMBER` | Recommended | E.164 number for the landing CTA, e.g. `+15555550100` |
| `PENNY_SYSTEM_PROMPT` | No | Override Penny’s system prompt |
| `PENNY_GEMINI_MODEL` | No | Override Gemini model id (default `gemini-3.5-flash`) |

## Register the Photon webhook

1. Create a project in [Spectrum Cloud](https://photon.codes) and provision an iMessage line.
2. Deploy this app (or expose a tunnel) so the webhook is public HTTPS.
3. Register the endpoint:

   `https://<your-domain>/api/spectrum/webhook`

4. Copy the webhook signing secret into `SPECTRUM_WEBHOOK_SECRET`.
5. Send a text to the line. Spectrum POSTs a signed JSON body; the route handler passes the **raw** `Request` into `app.webhook()` so HMAC verification matches the bytes on the wire.

The handler:

- Ignores non-text and empty messages
- Dedupes on `message.id` (in-memory, best-effort on serverless)
- Shows a typing indicator via `space.responding`
- Replies with Gemini through `message.reply`

Spectrum delivers **at-least-once**. Dedupe is per instance; a new Vercel isolate can still process a retry.

## Deploy on Vercel

1. Import this repo and set the environment variables above (Production + Preview as needed).
2. Deploy. Confirm `https://<project>.vercel.app/api/spectrum/webhook` returns signature errors (400/401) for unsigned POSTs, not a 404.
3. Register that URL in Spectrum Cloud.
4. Keep the default Node.js server runtime. Spectrum’s iMessage client is not for Edge, and this Next.js app enables Cache Components which cannot set a per-route `runtime` export.

`GOOGLE_GENERATIVE_AI_API_KEY` is enough to try Gemini without extra paid providers.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Personal finance (iMessage)

Penny is a **personal finance** agent. Default mode is **labeled MOCK / DEMO data** (seeded accounts, budgets, recurring).

### What works without a database (shipped now)

| Interaction | Behavior |
| --- | --- |
| Greetings / help / light Q&A | Works; no DB |
| `balances`, `spending`, `budget`, `subscriptions`, `chart` | Seeded MOCK reads |
| `spent $… at …` + 👍/poll/corrections | Demo session only — **not durable** across serverless invocations/restarts |
| Receipt image extract → confirm | Same: demo session only without Postgres |
| `opt in weekly/budget/recurring` | Recorded in-process only; **automated digests stay OFF** |

### What requires Postgres + CRON_SECRET (not configured yet)

- Durable ledgers, pending drafts, opt-in prefs, webhook event dedupe
- Automated outbound digests via `GET /api/cron/finance` (daily 14:00 UTC)

Without durable storage the cron route returns `503 scheduler_disabled_demo_mode` and sends nothing.

Env keys (optional until you want durability):

| Variable | Purpose |
| --- | --- |
| `PENNY_DATABASE_URL` / `DATABASE_URL` / `POSTGRES_URL` | Durable finance store |
| `CRON_SECRET` | Bearer auth for cron |
| Existing Spectrum + Gemini | Messaging + receipt vision |

### Scheduler cadence (when durable)

Cron is **daily 14:00 UTC**, not a true weekly-only job:

- Weekly summaries: Monday local + weekKey dedupe + opt-in
- Budget warnings: ≥80% + dayKey + opt-in
- Recurring: due within 3 local days + dayKey + opt-in
- Quiet hours skip sends

### Tapbacks

Confirm: 👍 / ❤️ / ✅ · Cancel: 👎 / ❌ / ❎ (prefer reacting on the draft prompt)

### Manual iMessage checks (mock, no DB)

1. Text Penny anything friendly → reply (no persistence error)
2. `balances` → MOCK DATA balances
3. `spent $12.50 at Starbucks` → draft + poll; 👍 records for this session only
4. `chart` → spending image
5. Cron without Postgres → 503, no user messages

