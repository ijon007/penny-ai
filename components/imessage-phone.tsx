import type { ReactNode } from "react";

/**
 * Decorative iPhone + Messages conversation mock for the landing page.
 * Hardware chrome is a CSS recreation (ADR device PNGs removed from public/
 * due to Apple Design Resources §2B website/embed restrictions — see
 * public/brand/device-frame/SOURCE.md). Messages layout informed by Apple
 * Support screenshots linked in that SOURCE.md (visual craft only).
 */

function BackGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 12 20" className="h-[13px] w-[8px]">
      <path
        d="M9.8 1.6 2.4 10l7.4 8.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[14px] w-[14px]">
      <rect
        x="2.8"
        y="6.8"
        width="11.8"
        height="10.4"
        rx="2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <path
        d="M15.2 10.1 20.8 7.5v9l-5.6-2.6Z"
        fill="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusCluster() {
  return (
    <div className="flex items-center gap-[4px] text-black">
      <svg aria-hidden viewBox="0 0 17 11" className="h-[9px] w-[15px]">
        <rect x="0" y="7.2" width="3" height="3.3" rx="0.5" fill="currentColor" />
        <rect x="4.5" y="5.2" width="3" height="5.3" rx="0.5" fill="currentColor" />
        <rect x="9" y="2.8" width="3" height="7.7" rx="0.5" fill="currentColor" />
        <rect x="13.5" y="0.4" width="3" height="10.1" rx="0.5" fill="currentColor" />
      </svg>
      <svg aria-hidden viewBox="0 0 16 12" className="h-[10px] w-[13px]">
        <path
          d="M1.1 7.6c2.7-2.6 7.1-2.6 9.8 0M3 9.5c1.6-1.5 4.1-1.5 5.7 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      </svg>
      <span className="relative inline-flex h-[10px] w-[22px] items-center rounded-[2.5px] border border-black/85 p-[1.2px]">
        <span className="h-full w-[70%] rounded-[1.2px] bg-black" />
        <span className="absolute top-1/2 -right-[2.5px] h-[4.5px] w-[1.4px] -translate-y-1/2 rounded-r-[1px] bg-black/85" />
      </span>
    </div>
  );
}

function FloatControl({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/95 text-black shadow-[0_2px_8px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.06)] backdrop-blur-md">
      {children}
    </span>
  );
}

function KeyCap({
  children,
  className = "",
  tone = "letter",
}: {
  children: ReactNode;
  className?: string;
  tone?: "letter" | "util" | "primary";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-[#0a84ff] text-white"
      : tone === "util"
        ? "bg-[#acb0b8] text-black"
        : "bg-white text-black";
  return (
    <span
      className={`box-border flex h-[32px] min-w-0 items-center justify-center rounded-[4.5px] text-[13px] leading-none shadow-[0_1px_0_rgba(0,0,0,0.22)] ${toneCls} ${className}`}
    >
      {children}
    </span>
  );
}

function IosKeyboard() {
  // Explicit CSS grid + side padding so every key (incl. return) stays inside
  // the screen width. Lowercase default state. No overflow masking.
  const gap = "3px";
  return (
    <div
      className="box-border w-full max-w-full select-none bg-[#d1d3d9] pt-1.5"
      style={{ paddingLeft: "4.5%", paddingRight: "4.5%" }}
    >
      <div className="mb-1.5 grid w-full grid-cols-3" style={{ gap }}>
        {["i spent", "$12.50", "thanks"].map((t) => (
          <span
            key={t}
            className="flex h-[25px] min-w-0 items-center justify-center rounded-[5px] bg-white text-[10.5px] tracking-[-0.01em] text-black shadow-[0_0.5px_0_rgba(0,0,0,0.14)]"
          >
            {t}
          </span>
        ))}
      </div>

      <div
        className="mb-[3.5px] grid w-full"
        style={{ gap, gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
      >
        {"qwertyuiop".split("").map((k) => (
          <KeyCap key={k} className="w-full text-[12px] lowercase">
            {k}
          </KeyCap>
        ))}
      </div>

      <div
        className="mb-[3.5px] grid w-full"
        style={{
          gap,
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
          paddingLeft: "5%",
          paddingRight: "5%",
        }}
      >
        {"asdfghjkl".split("").map((k) => (
          <KeyCap key={k} className="w-full text-[12px] lowercase">
            {k}
          </KeyCap>
        ))}
      </div>

      <div
        className="mb-[3.5px] grid w-full"
        style={{
          gap,
          gridTemplateColumns: "1.25fr repeat(7, minmax(0, 1fr)) 1.25fr",
        }}
      >
        <KeyCap tone="util" className="w-full text-[11px]">⇧</KeyCap>
        {"zxcvbnm".split("").map((k) => (
          <KeyCap key={k} className="w-full text-[12px] lowercase">
            {k}
          </KeyCap>
        ))}
        <KeyCap tone="util" className="w-full text-[11px]">⌫</KeyCap>
      </div>

      <div
        className="mb-[4px] grid w-full"
        style={{ gap, gridTemplateColumns: "1.2fr 1.2fr 3.8fr 1.45fr" }}
      >
        <KeyCap tone="util" className="w-full text-[10.5px]">123</KeyCap>
        <KeyCap tone="util" className="w-full text-[12px]">🌐</KeyCap>
        <KeyCap className="w-full text-[11px] text-[#8e8e93]">space</KeyCap>
        <KeyCap tone="primary" className="w-full text-[10.5px]">
          return
        </KeyCap>
      </div>

      <div className="relative flex items-center justify-between px-[1%] pt-0.5 pb-[6px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center text-[17px] leading-none">
          😊
        </span>
        <div className="absolute left-1/2 h-[4px] w-[34%] -translate-x-1/2 rounded-full bg-black/80" />
        <span className="flex h-[24px] w-[24px] items-center justify-center text-[#8e8e93]">
          <svg aria-hidden viewBox="0 0 24 24" className="h-[17px] w-[17px]">
            <rect x="9" y="3.2" width="6" height="10.5" rx="3" fill="currentColor" />
            <path
              d="M6.4 11.2a5.6 5.6 0 0 0 11.2 0M12 16.8v3.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.55"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function IMessagePhone() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[min(100%,19.25rem)] select-none sm:w-[min(100%,20.25rem)]"
      style={{ aspectRatio: "393 / 852" }}
    >
      {/* Metal edge */}
      <div
        className="absolute inset-0 rounded-[3rem]"
        style={{
          background:
            "linear-gradient(145deg, #e8e4de 0%, #b8b2a8 28%, #f3efe8 52%, #9a948c 78%, #d2cdc4 100%)",
          boxShadow:
            "0 28px 50px -24px rgba(0,0,0,0.45), inset 0 0.5px 0 rgba(255,255,255,0.65)",
        }}
      />
      {/* Black bezel */}
      <div className="absolute inset-[2.5px] overflow-hidden rounded-[2.85rem] bg-black">
        {/* Screen — overflow visible horizontally so we never "hide" a bad keyboard;
            content is sized to fit. Vertical clip only via parent radius. */}
        <div className="absolute inset-[1.5px] flex flex-col overflow-visible rounded-[2.7rem] bg-white">
          <div
            className="flex min-h-0 flex-1 flex-col"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            }}
          >
            {/* Status */}
            <div className="relative z-20 flex shrink-0 items-end justify-between px-5 pt-[11px] pb-[2px] text-[11.5px] font-semibold tracking-[-0.02em] text-black">
              <span>9:41</span>
              <StatusCluster />
            </div>

            {/* Dynamic Island */}
            <div className="pointer-events-none absolute top-[9px] left-1/2 z-30 h-[24px] w-[88px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

            {/* Compact header — single row, floating light controls (Apple Support craft) */}
            <div className="relative z-10 flex shrink-0 items-center justify-between px-2.5 pt-[6px] pb-1">
              <FloatControl>
                <BackGlyph />
              </FloatControl>
              <div className="flex flex-col items-center">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#398057] text-[15px] font-semibold tracking-[-0.03em] text-[#f5f5f7] shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
                  P
                </div>
                <div className="-mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-[1px] text-[11px] font-semibold tracking-[-0.02em] text-black shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                  Penny
                  <span className="text-[8px] text-[#8e8e93]">›</span>
                </div>
              </div>
              <FloatControl>
                <VideoGlyph />
              </FloatControl>
            </div>

            {/* Bubbles — modest top air, clustered above composer */}
            <div className="flex min-h-0 flex-1 flex-col justify-end gap-[2px] px-2 pb-1 pt-1.5">
              <div className="flex justify-end">
                <div className="imsg-out max-w-[78%] px-[10px] py-[6px] text-[14.5px] leading-[1.24] tracking-[-0.015em]">
                  Spending this week?
                </div>
              </div>
              <div className="mt-px flex justify-start">
                <div className="imsg-in max-w-[84%] px-[10px] py-[6px] text-[14.5px] leading-[1.24] tracking-[-0.015em] text-black">
                  Groceries $142 — up about $30.
                </div>
              </div>
              <div className="mt-px flex justify-end">
                <div className="imsg-out max-w-[82%] px-[10px] py-[6px] text-[14.5px] leading-[1.24] tracking-[-0.015em]">
                  spent $12.50 at Blue Bottle
                </div>
              </div>
              <p className="pr-1 text-right text-[10px] tracking-[-0.01em] text-[#8e8e93]">
                Read
              </p>
              <div className="-mt-0.5 flex justify-start">
                <div className="imsg-in max-w-[86%] px-[10px] py-[6px] text-[14.5px] leading-[1.24] tracking-[-0.015em] text-black">
                  $12.50 · coffee — tap 👍 to record
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="shrink-0 bg-white/85 px-2 pt-1 pb-1 backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[rgba(120,120,128,0.18)] text-[18px] leading-none text-[#8e8e93]">
                  +
                </span>
                <div className="flex h-[32px] min-w-0 flex-1 items-center rounded-full border border-black/[0.08] bg-[#f2f2f7] px-3 text-[14.5px] tracking-[-0.01em] text-[#8e8e93]">
                  iMessage
                </div>
                <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center text-[#8e8e93]">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-[17px] w-[17px]">
                    <rect x="9" y="3.2" width="6" height="10.5" rx="3" fill="currentColor" />
                    <path
                      d="M6.4 11.2a5.6 5.6 0 0 0 11.2 0M12 16.8v3.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.55"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <IosKeyboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
