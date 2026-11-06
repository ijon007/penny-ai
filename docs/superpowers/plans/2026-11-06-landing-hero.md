# Landing Hero Implementation Plan (updated)

**Goal:** High-craft asymmetric Inter hero with a colored iMessage product replica.

**Latest overrides:** Inter font; iMessage blue/gray UI (not monochrome Geist). Newest font and colored iMessage supersede previous grayscale/Geist.

### Tasks
- [x] Spec updated for Inter + colored iMessage
- [x] Swap layout font to Inter (`next/font/google`)
- [x] Rebuild page: asymmetric split + phone-faithful iMessage preview (`components/imessage-phone.tsx`)
- [x] Build/test + screenshots 1440/390; iterate once (v3: wordmark with headline, larger phone)
- [x] Follow-up commit on feat/landing-hero (no push)

### Verification
- Inter loaded via `next/font/google` (`--font-inter`)
- Outgoing bubbles `#007AFF` / `rgb(0, 122, 255)`; incoming `#E9E9EB`
- CTA `sms:+16282649071&body=Hey%20Penny`, min-height 44px
- Screenshots: `artifacts/screenshots/hero-v3-desktop-1440.png`, `hero-v3-mobile-390.png`
- Preview: `http://127.0.0.1:3456/` (leave running)
