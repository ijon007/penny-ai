import type { ReactNode } from "react";
/**
 * Hardware: iPhone 16 Pro Natural Titanium PNG from @mockifydev/react (see
 * public/brand/device-frame/SOURCE.md). Messages chrome is a careful recreation
 * of current conversation UI evidenced on Apple Support / iOS marketing as of
 * 2026-11-06 (iOS 27-era), not an Apple screenshot dump.
 */

const FRAME = {
  src: "/brand/device-frame/iphone-16-pro-natural-titanium.png",
  // Fractions from @mockifydev/react iPhone16Pro device config
  left: 0.054815,
  top: 0.025725,
  width: 0.88963,
  height: 0.948188,
  radius: 0.147407,
} as const;

function BackGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 12 20" className="h-[14px] w-[8px]">
      <path
        d="M10 1.5 2.2 10 10 18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[15px] w-[15px]">
      <rect
        x="2.5"
        y="6.5"
        width="12.5"
        height="11"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M15.5 10.2 21 7.4v9.2l-5.5-2.8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 28 28" className="h-[26px] w-[26px]">
      <circle cx="14" cy="14" r="12" fill="rgba(120,120,128,0.16)" />
      <path
        d="M14 8.8v10.4M8.8 14h10.4"
        stroke="#8e8e93"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px] text-[#8e8e93]">
      <rect x="9" y="3.2" width="6" height="10.5" rx="3" fill="currentColor" />
      <path
        d="M6.4 11.2a5.6 5.6 0 0 0 11.2 0M12 16.8v3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusCluster() {
  return (
    <div className="flex items-center gap-[5px] text-black">
      <svg aria-hidden viewBox="0 0 17 11" className="h-[10px] w-[16px]">
        <rect x="0" y="7.2" width="3" height="3.3" rx="0.55" fill="currentColor" />
        <rect x="4.5" y="5.2" width="3" height="5.3" rx="0.55" fill="currentColor" />
        <rect x="9" y="2.8" width="3" height="7.7" rx="0.55" fill="currentColor" />
        <rect x="13.5" y="0.4" width="3" height="10.1" rx="0.55" fill="currentColor" />
      </svg>
      <svg aria-hidden viewBox="0 0 16 12" className="h-[11px] w-[14px]">
        <path
          d="M1.1 7.6c2.7-2.6 7.1-2.6 9.8 0M3 9.5c1.6-1.5 4.1-1.5 5.7 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.85" fill="currentColor" />
      </svg>
      <span className="relative inline-flex h-[11px] w-[24px] items-center rounded-[3px] border border-black/85 p-[1.5px]">
        <span className="h-full w-[72%] rounded-[1.5px] bg-black" />
        <span className="absolute top-1/2 -right-[3px] h-[5px] w-[1.5px] -translate-y-1/2 rounded-r-[1px] bg-black/85" />
      </span>
    </div>
  );
}

const KEYS_TOP = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"] as const;
const KEYS_MID = ["A", "S", "D", "F", "G", "H", "J", "K", "L"] as const;
const KEYS_BOT = ["Z", "X", "C", "V", "B", "N", "M"] as const;

function Key({
  children,
  wide,
  accent,
}: {
  children: ReactNode;
  wide?: boolean;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-[34px] items-center justify-center rounded-[5px] text-[13.5px] font-normal tracking-[-0.02em] text-black shadow-[0_1px_0_rgba(0,0,0,0.18)] ${
        accent
          ? "bg-[#0a84ff] text-white"
          : "bg-white"
      } ${wide ? "min-w-[42px] px-2" : "min-w-[26px] flex-1"}`}
    >
      {children}
    </span>
  );
}

function IosKeyboard() {
  return (
    <div className="select-none bg-[#d1d3d9] px-[3px] pt-1.5 pb-1">
      <div className="mb-1.5 flex gap-1 px-1">
        {["I spent", "$12.50", "thanks"].map((t) => (
          <span
            key={t}
            className="flex h-[28px] flex-1 items-center justify-center rounded-[5px] bg-white text-[12px] tracking-[-0.01em] text-black shadow-[0_0.5px_0_rgba(0,0,0,0.12)]"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mb-[5px] flex gap-[5px]">
        {KEYS_TOP.map((k) => (
          <Key key={k}>{k}</Key>
        ))}
      </div>
      <div className="mb-[5px] flex gap-[5px] px-[14px]">
        {KEYS_MID.map((k) => (
          <Key key={k}>{k}</Key>
        ))}
      </div>
      <div className="mb-[5px] flex gap-[5px]">
        <Key wide>⇧</Key>
        {KEYS_BOT.map((k) => (
          <Key key={k}>{k}</Key>
        ))}
        <Key wide>⌫</Key>
      </div>
      <div className="flex gap-[5px]">
        <Key wide>123</Key>
        <Key wide>🌐</Key>
        <span className="inline-flex h-[34px] flex-[3] items-center justify-center rounded-[5px] bg-white text-[13px] text-[#8e8e93] shadow-[0_1px_0_rgba(0,0,0,0.18)]">
          space
        </span>
        <Key accent wide>
          return
        </Key>
      </div>
    </div>
  );
}

export function IMessagePhone() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[min(100%,19.75rem)] select-none sm:w-[min(100%,21rem)]"
      style={{ aspectRatio: "1350 / 2760" }}
    >
      {/* Screen content (under transparent hole of frame) */}
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          left: `${FRAME.left * 100}%`,
          top: `${FRAME.top * 100}%`,
          width: `${FRAME.width * 100}%`,
          height: `${FRAME.height * 100}%`,
          // Pixel radius ≈ frameWidth * screenRadiusFraction; use rem for CSS
          borderRadius: "2.85rem",
        }}
      >
        <div
          className="flex h-full flex-col"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
          }}
        >
          {/* Status */}
          <div className="relative z-20 flex items-end justify-between px-[18px] pt-[12px] pb-1 text-[12px] font-semibold tracking-[-0.02em] text-black">
            <span className="pl-0.5">9:41</span>
            <StatusCluster />
          </div>

          {/* Room for Dynamic Island (drawn by frame PNG) */}
          <div className="h-[18px] shrink-0" />

          {/* Floating nav + contact */}
          <div className="relative z-10 px-3 pt-1">
            <div className="flex items-start justify-between">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[rgba(120,120,128,0.16)] text-[#007aff] backdrop-blur-md">
                <BackGlyph />
              </span>
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[rgba(120,120,128,0.16)] text-[#007aff] backdrop-blur-md">
                <VideoGlyph />
              </span>
            </div>
            <div className="-mt-[6px] flex flex-col items-center">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#398057] text-[20px] font-semibold tracking-[-0.03em] text-[#f5f5f7]">
                P
              </div>
              <div className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-[rgba(120,120,128,0.12)] px-2.5 py-[3px] text-[12px] font-semibold tracking-[-0.02em] text-black">
                Penny
                <span className="text-[9px] text-[#8e8e93]">›</span>
              </div>
            </div>
          </div>

          {/* Large whitespace + bubbles near bottom */}
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-[3px] px-2.5 pb-1 pt-6">
            <div className="flex justify-end">
              <div className="imsg-out max-w-[78%] px-[11px] py-[7px] text-[15px] leading-[1.25] tracking-[-0.015em]">
                Spending this week?
              </div>
            </div>
            <div className="mt-[1px] flex justify-start">
              <div className="imsg-in max-w-[84%] px-[11px] py-[7px] text-[15px] leading-[1.25] tracking-[-0.015em] text-black">
                Groceries $142 — up about $30.
              </div>
            </div>
            <div className="mt-[2px] flex justify-end">
              <div className="imsg-out max-w-[82%] px-[11px] py-[7px] text-[15px] leading-[1.25] tracking-[-0.015em]">
                spent $12.50 at Blue Bottle
              </div>
            </div>
            <p className="mt-0.5 pr-1 text-right text-[10px] tracking-[-0.01em] text-[#8e8e93]">
              Read
            </p>
            <div className="-mt-0.5 flex justify-start">
              <div className="imsg-in max-w-[86%] px-[11px] py-[7px] text-[15px] leading-[1.25] tracking-[-0.015em] text-black">
                $12.50 · coffee — tap 👍 to record
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-black/[0.06] bg-white/80 px-2 pt-1.5 pb-1 backdrop-blur-xl">
            <div className="flex items-center gap-1.5">
              <PlusGlyph />
              <div className="flex h-[34px] min-w-0 flex-1 items-center rounded-full border border-black/10 bg-white/90 px-3.5 text-[15px] tracking-[-0.01em] text-[#c7c7cc]">
                iMessage
              </div>
              <MicGlyph />
            </div>
          </div>

          <IosKeyboard />

          <div className="bg-[#d1d3d9] pb-[6px] pt-1">
            <div className="mx-auto h-[4px] w-[34%] rounded-full bg-black/80" />
          </div>
        </div>
      </div>

      {/* Hardware frame overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FRAME.src}
        alt=""
        width={1350}
        height={2760}
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
        draggable={false}
        decoding="async"
      />
    </div>
  );
}
