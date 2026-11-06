# Landing Hero Implementation Plan

> **For agentic workers:** Inline execution (direction approved). Checkbox tracking below.

**Goal:** Replace the warm copper/green landing with a single Apple-clean black-and-white Geist hero.

**Architecture:** Keep server component page; resolve SMS href on the server. Swap fonts to Geist in root layout. Restyle globals to monochrome tokens. Rebuild `app/page.tsx` as editorial hero + quiet preview.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, `geist` font package, existing `lib/imessage.ts`.

## Global Constraints
- No push/merge in this turn
- Author commits as IjonK4 <kushta.joni@gmail.com>
- Preserve webhook / Gemini / Spectrum code paths
- CTA must use real `imessageSmsHref` / `getIMessageNumber`

### Task 1: Spec + plan docs
- [x] Write spec and plan under `docs/superpowers/`

### Task 2: Geist + monochrome tokens
- [x] Add `geist` dependency
- [x] Update `app/layout.tsx` to Geist Sans (+ optional Mono if needed)
- [x] Rewrite `app/globals.css` to white/black/gray tokens; remove grain/copper/imessage greens

### Task 3: Hero UI
- [x] Rewrite `app/page.tsx` — wordmark, oversized headline, short copy, black CTA (≥44px), grayscale message preview
- [x] Reduced-motion safe enter opacity; focus ring on CTA

### Task 4: Verify
- [x] `npm test`, `npm run build`
- [x] Local `next start` screenshots; capture 375 and 1440 screenshots via Playwright
- [x] Commit on `feat/landing-hero` (no push)
