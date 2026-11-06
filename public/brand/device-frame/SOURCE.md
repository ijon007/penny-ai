# Device frame / Messages mock — source notes

Updated: 2026-11-06 (local preview only — unpublished)

## Hardware frame in use (WithFrame)

- **File served:** `iphone-16-pro-natural-withframe.png`
- **Author/publisher:** WithFrame (https://withfra.me/) — independently published device-frame PNGs (not an npm “MIT wraps ADR” package).
- **Download URL used:** https://shot.withfra.me/frames/iphone.16.pro/natural  
- **Listing page:** https://withfra.me/shot/iphone-16-pro  
- **Sibling color downloads (archived, not served):**  
  https://shot.withfra.me/frames/iphone.16.pro/black  
  https://shot.withfra.me/frames/iphone.16.pro/white  
  https://shot.withfra.me/frames/iphone.16.pro/desert  
  Local staging: `docs/licenses/withframe-staging/`

### Terms (factual quotes from WithFrame shot “Guidelines”, not legal advice)

From https://withfra.me/shot/iphone-16-pro (same Guidelines block on other `/shot/*` pages):

1. “Feel free to use these device frames for personal and commercial projects.”
2. “Do not redistribute or sell these device frames as standalone items.”
3. Credit optional (“consider giving credit”).
4. FAQ on sibling shot pages states frames are for screenshots “whether you're displaying them on a website or using in presentations.”

**How we use them:** Frame PNG is composited on the Penny landing End Product (Messages UI overlay in the transparent screen hole). We are **not** selling/redistributing the blank frame as a standalone stock/mockup pack.

**Note on https://withfra.me/license :** That page licenses **WithFrame React Native Components** (last updated 2023-04-11). Device-frame PNG terms used here are the **shot page Guidelines**, not that RN license.

**Residual uncertainty:** WithFrame does not publish a forensic provenance statement that these PNGs are unrelated to Apple Design Resources. They are sold/published as WithFrame’s own shot resources under the Guidelines above — not an MIT re-upload of ADR. Residual ADR-derivation risk is **unresolved**; treat as open if counsel requires pixel-level originality proof.

## Apple Design Resources (not used in public/)

- **License PDF:** https://developer.apple.com/support/downloads/terms/apple-design-resources/Apple-Design-Resources-License-20230621-English.pdf  
- **Local copy:** `docs/licenses/Apple-Design-Resources-License-20230621-English.pdf`
- ADR §2B restricts embedding ADR in website content. Prior ADR-claimed bezels remain archived only under `docs/licenses/device-frame-archive/` and are **not** served.

## Plinth (evaluated, not used as blank frame)

- Terms (2026-09-29): https://plinthmockups.com/terms  
- Exports OK for websites/commercial; **blank mockup scenes may not be redistributed** as mockups/templates/stock. Therefore blank Plinth scenes were **not** added to `public/`.

## Messages UI visual references (craft only; not redistributed in public/)

Fetched for visual comparison (Apple Support article published **2026-10-26**):

- Article: https://support.apple.com/en-us/104982  
- https://cdsassets.apple.com/live/7WUAS350/images/ios/ios-26-iphone-16-pro-messages-swipe.png  
  (inbox UI: floating white circular controls, Dynamic Island, status 9:41)
- https://cdsassets.apple.com/live/7WUAS350/images/ios/ios-27-iphone-17-pro-messages-contact-automatically-translate-on.png  

CDN path tokens are Apple’s filenames, not a claim about our product SKU.

## Landing craft reference

- Persona marketing (CTA / light brand craft only): https://yourpersona.com/  
  Social image fetched 2026-11-06: https://yourpersona.com/social/persona-home-2026-09-27-v3.png  
  (does not supply a redistributable iPhone frame)

## Messages app icon

See `public/brand/APPLE_MESSAGES_ICON_SOURCE.md`.
