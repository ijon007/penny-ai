# Penny Landing Hero Spec (updated)

**Approved direction (latest):** Clean white page typography with Inter. Single hero. Asymmetric desktop composition. Product visual is a faithful iMessage UI replica (blue outgoing, gray incoming)—not grayscale, not an invented chat card. Real Text Penny CTA. Backend unchanged.

**Supersedes:** Earlier grayscale/Geist monochrome hero direction.

## Requirements
- Inter via `next/font/google` (not CSS-only fallback); applied on `html`/`body`
- Page chrome stays black/white; color lives only in the iMessage product visual
- Desktop: asymmetric grid — editorial (wordmark + headline + copy + CTA) left; substantial iMessage phone right
- Mobile: phone-first stack, then copy; intentionally adapted (not a shrunken desktop)
- iMessage chrome: Dynamic Island, status, back chevron, avatar, contact name, info control, date stamp, thread, composer (+ / field / mic), home indicator
- Blue `#007AFF` outgoing / light gray `#E9E9EB` incoming; proper bubble grouping and tails
- Illustrative Penny dinner conversation only — do not copy personal numbers or real messages from screenshots
- Preserve `imessageSmsHref(getIMessageNumber())` CTA
- No backend/webhook changes; no fake stats/testimonials; no gradients/grain/excessive mockup chrome
