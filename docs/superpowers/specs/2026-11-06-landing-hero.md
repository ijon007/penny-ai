# Penny Landing Hero Spec

**Approved direction:** white canvas, oversized black Geist headline, short copy, one black Text Penny CTA, subtle monochrome message preview. Hero only. No gradients, feature grids, copper/green, grain, or extra sections.

## Requirements
- Single hero section on `/`
- White background; black/gray type and chrome only
- Geist via official `geist` / next font pipeline (not CSS-only fallback)
- Preserve server-resolved `imessageSmsHref(getIMessageNumber())` CTA
- No backend/model/webhook changes
- No unsupported claims, fake stats, or testimonials
- Quiet grayscale iMessage-style preview for product context
- Optional subtle motion; honor `prefers-reduced-motion`
- Focus-visible CTA; hit target ≥ 44px
- No overflow at 375 / 390 / 1440 widths
