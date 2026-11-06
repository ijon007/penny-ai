function BackChevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 20" className="h-[18px] w-[11px]">
      <path
        d="M10.5 1.5 2 10l8.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]">
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 10.4v5.2M12 7.8h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-7 w-7">
      <circle cx="14" cy="14" r="12" fill="#8e8e93" opacity="0.18" />
      <path
        d="M14 8.5v11M8.5 14h11"
        stroke="#8e8e93"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]">
      <rect x="9" y="3.5" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IMessagePhone() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[min(100%,21.25rem)] select-none"
    >
      <div className="rounded-[2.35rem] bg-phone-bezel p-[10px] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.45)]">
        <div className="relative overflow-hidden rounded-[1.85rem] bg-imsg-bg">
          {/* Dynamic Island / notch bar */}
          <div className="absolute top-2 left-1/2 z-20 h-[1.65rem] w-[6.4rem] -translate-x-1/2 rounded-full bg-black" />

          {/* Status */}
          <div className="relative z-10 flex items-end justify-between px-6 pt-3.5 pb-1 text-[12px] font-semibold tracking-[-0.01em] text-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 pr-0.5 text-[11px]">
              <span className="inline-block h-[10px] w-[17px] rounded-[2px] border border-foreground/80">
                <span className="m-[1.5px] block h-[6px] w-[11px] rounded-[1px] bg-foreground" />
              </span>
            </div>
          </div>

          {/* Nav */}
          <div className="relative z-10 flex items-center gap-1 border-b border-black/5 px-2 pt-1 pb-2">
            <button
              type="button"
              tabIndex={-1}
              className="flex h-10 w-10 items-center justify-center text-imsg-blue"
              aria-hidden="true"
            >
              <BackChevron />
            </button>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d1d1d6] text-[13px] font-semibold tracking-[-0.02em] text-white">
                P
              </div>
              <div className="mt-0.5 flex items-center gap-0.5 text-[11px] font-medium tracking-[-0.01em] text-foreground">
                Penny
                <span className="text-[9px] text-muted">›</span>
              </div>
            </div>
            <button
              type="button"
              tabIndex={-1}
              className="flex h-10 w-10 items-center justify-center text-imsg-blue"
              aria-hidden="true"
            >
              <InfoIcon />
            </button>
          </div>

          {/* Thread */}
          <div className="flex min-h-[22.5rem] flex-col justify-end gap-[3px] bg-imsg-bg px-3 pt-4 pb-2">
            <p className="mb-3 text-center text-[11px] font-medium tracking-[-0.01em] text-[#8e8e93]">
              Today 9:41 AM
            </p>

            <div className="flex justify-end">
              <div className="imsg-out-mid max-w-[78%] px-[12px] py-[7px] text-[15.5px] leading-[1.28] tracking-[-0.01em]">
                hey — dinner for 6 on saturday, any ideas?
              </div>
            </div>
            <div className="mb-1 flex justify-end">
              <div className="imsg-out max-w-[78%] px-[12px] py-[7px] text-[15.5px] leading-[1.28] tracking-[-0.01em]">
                one person doesn&apos;t eat dairy
              </div>
            </div>

            <div className="flex justify-start">
              <div className="imsg-in-mid max-w-[82%] px-[12px] py-[7px] text-[15.5px] leading-[1.28] tracking-[-0.01em] text-black">
                Roast chicken + big salad. Skip cheese, use olive oil + lemon.
              </div>
            </div>
            <div className="mb-1 flex justify-start">
              <div className="imsg-in max-w-[84%] px-[12px] py-[7px] text-[15.5px] leading-[1.28] tracking-[-0.01em] text-black">
                Want a 20-minute shopping list?
              </div>
            </div>

            <div className="flex justify-end">
              <div className="imsg-out max-w-[70%] px-[12px] py-[7px] text-[15.5px] leading-[1.28] tracking-[-0.01em]">
                yes please
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-black/[0.04] bg-imsg-bg px-2.5 pt-2 pb-[18px]">
            <div className="flex items-center gap-2">
              <AppsIcon />
              <div className="flex h-9 min-w-0 flex-1 items-center rounded-full border border-imsg-separator/70 bg-white px-3.5 text-[15px] tracking-[-0.01em] text-[#c7c7cc]">
                iMessage
              </div>
              <div className="text-[#8e8e93]">
                <MicIcon />
              </div>
            </div>
            {/* Home indicator */}
            <div className="mx-auto mt-3 h-[4px] w-[34%] rounded-full bg-black/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
