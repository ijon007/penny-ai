import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Decorative iPhone + Messages conversation mock for the landing page.
 * Hardware: WithFrame iPhone 16 Pro natural frame PNG (commercial project use
 * per shot Guidelines — see public/brand/device-frame/SOURCE.md). Messages
 * layout craft from Apple Support screenshots linked there (not redistributed).
 */

function BackGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 12 20" className="h-[12px] w-[7px]">
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
    <svg aria-hidden viewBox="0 0 24 24" className="h-[13px] w-[13px]">
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

/** iOS keyboard emoji key — monochrome glyph, not a color emoji. */
function EmojiKeyGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[20px] w-[20px] text-[#3a3a3c]">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="10" r="1.15" fill="currentColor" />
      <circle cx="15" cy="10" r="1.15" fill="currentColor" />
      <path
        d="M8.2 14.6c1.1 1.25 2.4 1.85 3.8 1.85s2.7-.6 3.8-1.85"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusCluster() {
  return (
    <div className="flex items-center gap-[3.5px] text-black">
      <svg aria-hidden viewBox="0 0 17 11" className="h-[8.5px] w-[14px]">
        <rect x="0" y="7.2" width="3" height="3.3" rx="0.5" fill="currentColor" />
        <rect x="4.5" y="5.2" width="3" height="5.3" rx="0.5" fill="currentColor" />
        <rect x="9" y="2.8" width="3" height="7.7" rx="0.5" fill="currentColor" />
        <rect x="13.5" y="0.4" width="3" height="10.1" rx="0.5" fill="currentColor" />
      </svg>
      <svg aria-hidden viewBox="0 0 16 12" className="h-[9.5px] w-[12.5px]">
        <path
          d="M1.1 7.6c2.7-2.6 7.1-2.6 9.8 0M3 9.5c1.6-1.5 4.1-1.5 5.7 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      </svg>
      <span className="relative inline-flex h-[9.5px] w-[21px] items-center rounded-[2.5px] border border-black/85 p-[1.1px]">
        <span className="h-full w-[72%] rounded-[1.2px] bg-black" />
        <span className="absolute top-1/2 -right-[2.4px] h-[4.2px] w-[1.3px] -translate-y-1/2 rounded-r-[1px] bg-black/85" />
      </span>
    </div>
  );
}

function FloatControl({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white/92 text-black shadow-[0_1.5px_6px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.05)] backdrop-blur-md">
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
      className={`box-border flex h-[30px] min-w-0 items-center justify-center rounded-[4.5px] text-[12.5px] leading-none shadow-[0_1px_0_rgba(0,0,0,0.22)] ${toneCls} ${className}`}
    >
      {children}
    </span>
  );
}

function IosKeyboard() {
  const gap = "2.5px";
  return (
    <div
      className="box-border w-full max-w-full select-none bg-[#d1d3d9] pt-1"
      style={{ paddingLeft: "4.2%", paddingRight: "4.2%" }}
    >
      <div className="mb-1 grid w-full grid-cols-3" style={{ gap }}>
        {["i spent", "$12.50", "thanks"].map((t) => (
          <span
            key={t}
            className="flex h-[23px] min-w-0 items-center justify-center rounded-[5px] bg-white text-[10px] tracking-[-0.01em] text-black shadow-[0_0.5px_0_rgba(0,0,0,0.14)]"
          >
            {t}
          </span>
        ))}
      </div>

      <div
        className="mb-[3px] grid w-full"
        style={{ gap, gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
      >
        {"qwertyuiop".split("").map((k) => (
          <KeyCap key={k} className="w-full text-[11.5px] lowercase">
            {k}
          </KeyCap>
        ))}
      </div>

      <div
        className="mb-[3px] grid w-full"
        style={{
          gap,
          gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
          paddingLeft: "5%",
          paddingRight: "5%",
        }}
      >
        {"asdfghjkl".split("").map((k) => (
          <KeyCap key={k} className="w-full text-[11.5px] lowercase">
            {k}
          </KeyCap>
        ))}
      </div>

      <div
        className="mb-[3px] grid w-full"
        style={{
          gap,
          gridTemplateColumns: "1.25fr repeat(7, minmax(0, 1fr)) 1.25fr",
        }}
      >
        <KeyCap tone="util" className="w-full text-[10.5px]">
          ⇧
        </KeyCap>
        {"zxcvbnm".split("").map((k) => (
          <KeyCap key={k} className="w-full text-[11.5px] lowercase">
            {k}
          </KeyCap>
        ))}
        <KeyCap tone="util" className="w-full text-[10.5px]">
          ⌫
        </KeyCap>
      </div>

      <div
        className="mb-[3px] grid w-full"
        style={{ gap, gridTemplateColumns: "1.2fr 1.2fr 3.8fr 1.45fr" }}
      >
        <KeyCap tone="util" className="w-full text-[10px]">
          123
        </KeyCap>
        <KeyCap tone="util" className="w-full text-[11px]">
          🌐
        </KeyCap>
        <KeyCap className="w-full text-[10.5px] text-[#8e8e93]">space</KeyCap>
        <KeyCap tone="primary" className="w-full text-[10px]">
          return
        </KeyCap>
      </div>

      <div className="relative flex items-center justify-between px-[0.5%] pt-0.5 pb-[5px]">
        <span className="flex h-[22px] w-[22px] items-center justify-center">
          <EmojiKeyGlyph />
        </span>
        <div className="absolute left-1/2 h-[3.5px] w-[34%] -translate-x-1/2 rounded-full bg-black/80" />
        <span className="flex h-[22px] w-[22px] items-center justify-center text-[#8e8e93]">
          <svg aria-hidden viewBox="0 0 24 24" className="h-[16px] w-[16px]">
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

/** Screen hole insets measured from WithFrame natural PNG (1109×2294). */
const SCREEN = {
  left: "3.97%",
  top: "1.66%",
  right: "4.06%",
  bottom: "1.66%",
} as const;

export function IMessagePhone() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[min(100%,18.75rem)] select-none sm:w-[min(100%,19.5rem)]"
      style={{ aspectRatio: "1109 / 2294" }}
    >
      <Image
        src="/brand/device-frame/iphone-16-pro-natural-withframe.png"
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 18.75rem, 19.5rem"
        className="pointer-events-none z-20 object-contain"
      />

      {/* Messages UI inside measured transparent screen hole */}
      <div
        className="absolute z-10 flex flex-col overflow-hidden bg-white"
        style={{
          left: SCREEN.left,
          top: SCREEN.top,
          right: SCREEN.right,
          bottom: SCREEN.bottom,
          borderRadius: "12.5% / 5.8%",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
        }}
      >
        {/* Status — sits under Dynamic Island band */}
        <div className="relative z-20 flex shrink-0 items-end justify-between px-4 pt-[9px] pb-0 text-[11px] font-semibold tracking-[-0.02em] text-black">
          <span>9:41</span>
          <StatusCluster />
        </div>

        {/* Compact single-row header — pulled up beside Dynamic Island (Support craft) */}
        <div className="relative z-10 -mt-[2px] flex shrink-0 items-center justify-between px-2 pb-0">
          <FloatControl>
            <BackGlyph />
          </FloatControl>
          <div className="flex flex-col items-center leading-none">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#398057] text-[13px] font-semibold tracking-[-0.03em] text-[#f5f5f7]">
              P
            </div>
            <div className="mt-[1px] inline-flex items-center gap-0.5 rounded-full bg-white px-1.5 py-px text-[10.5px] font-semibold tracking-[-0.02em] text-black shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
              Penny
              <span className="text-[7px] text-[#8e8e93]">›</span>
            </div>
          </div>
          <FloatControl>
            <VideoGlyph />
          </FloatControl>
        </div>

        {/* Bubbles — fill remaining height; clustered toward composer (reference chat placement) */}
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-[3px] px-1.5 pb-0.5 pt-0.5">
          <div className="flex justify-start">
            <div className="imsg-in max-w-[80%] px-[9px] py-[5px] text-[13.5px] leading-[1.22] tracking-[-0.015em] text-black">
              Morning — coffee run?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="imsg-out max-w-[78%] px-[9px] py-[5px] text-[13.5px] leading-[1.22] tracking-[-0.015em]">
              Spending this week?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="imsg-in max-w-[84%] px-[9px] py-[5px] text-[13.5px] leading-[1.22] tracking-[-0.015em] text-black">
              Groceries $142 — up about $30.
            </div>
          </div>
          <div className="flex justify-end">
            <div className="imsg-out max-w-[82%] px-[9px] py-[5px] text-[13.5px] leading-[1.22] tracking-[-0.015em]">
              spent $12.50 at Blue Bottle
            </div>
          </div>
          <p className="pr-1 text-right text-[9.5px] tracking-[-0.01em] text-[#8e8e93]">
            Read
          </p>
          <div className="-mt-0.5 flex justify-start">
            <div className="imsg-in max-w-[86%] px-[9px] py-[5px] text-[13.5px] leading-[1.22] tracking-[-0.015em] text-black">
              $12.50 · coffee — tap 👍 to record
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 bg-white/90 px-1.5 pt-0.5 pb-0.5 backdrop-blur-xl">
          <div className="flex items-center gap-1">
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[rgba(120,120,128,0.16)] text-[16px] leading-none text-[#8e8e93]">
              +
            </span>
            <div className="flex h-[30px] min-w-0 flex-1 items-center rounded-full border border-black/[0.08] bg-[#f2f2f7] px-2.5 text-[13.5px] tracking-[-0.01em] text-[#8e8e93]">
              iMessage
            </div>
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center text-[#8e8e93]">
              <svg aria-hidden viewBox="0 0 24 24" className="h-[15px] w-[15px]">
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
  );
}
