# Device frame / Messages mock — source notes

Updated: 2026-11-06 (local preview only)

## Apple Design Resources license (factual)

- **License PDF (Apple):**  
  https://developer.apple.com/support/downloads/terms/apple-design-resources/Apple-Design-Resources-License-20230621-English.pdf  
- **Local copy:** `docs/licenses/Apple-Design-Resources-License-20230621-English.pdf`
- **ADR hub:** https://developer.apple.com/design/resources/

**Restrictions quoted from that PDF (not legal advice):**

1. ADR may be used **solely** for creating mock-ups of UIs for software that runs **only** on Apple OS (macOS/iOS/watchOS/tvOS/visionOS), including showing ADR in screenshots of such mock-ups (§2A).
2. You **may not embed** ADR in software programs or other products (§2B).
3. Except as expressly provided, you **may not** use ADR to create/display/distribute **website content** or other work product (§2B).
4. You **may not** rent/lease/lend/trade/transfer/sell/sublicense or otherwise **redistribute** ADR in an unauthorized way (§2B).
5. Template Content may not be extracted/repackaged as clip art / stock assets (§2C).

**Implication for this repo:** A third-party npm package marked MIT (`@mockifydev/react`) that claims its PNGs are Apple Design Resources does **not** replace Apple’s ADR terms. Previously bundled `iphone-*-titanium.png` frames were **removed from `public/`** for this landing preview because embedding ADR-claimed bezels in website content conflicts with §2B as written. Archived copy (not served): `docs/licenses/device-frame-archive/`.

**Unresolved:** Whether any Apple-written exception covers marketing sites for iMessage agents; treat as unresolved — no legal guarantee here.

## Hardware chrome in the live preview

- **Implementation:** CSS/SVG recreation (slim black bezel + metal edge + Dynamic Island) in `components/imessage-phone.tsx`.
- **Not** an Apple Design Resources PNG and **not** labeled as a specific unshipped retail SKU in UI copy.

## Messages UI visual references used for craft (Apple Support screenshots)

Fetched 2026-11-06 for visual comparison only (not redistributed in `public/`):

- https://cdsassets.apple.com/live/7WUAS350/images/ios/ios-27-iphone-17-pro-messages-contact-automatically-translate-on.png  
  (from https://support.apple.com/en-us/104982 — floating light circular controls, Dynamic Island, status 9:41)
- https://cdsassets.apple.com/live/7WUAS350/images/ios/ios-26-iphone-16-pro-messages-swipe.png  
  (same Support article — floating white circular controls with soft shadow)

Filenames are Apple CDN asset names; they are evidence of Apple’s published support imagery, not a claim that our CSS recreation is pixel-identical or that a particular OS build is “current” beyond what those pages show.

## Messages app icon (separate asset)

See `public/brand/APPLE_MESSAGES_ICON_SOURCE.md` (App Store / mzstatic artwork via iTunes Lookup). Distinct from ADR device bezels.
