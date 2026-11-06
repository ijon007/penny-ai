function BackChevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 20" className="h-[17px] w-[10px]">
      <path
        d="M10.5 1.5 2 10l8.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[20px] w-[20px]">
      <circle
        cx="12"
        cy="12"
        r="9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <path
        d="M12 10.4v5.2M12 7.8h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 28" className="h-[26px] w-[26px]">
      <circle cx="14" cy="14" r="12" fill="#8e8e93" opacity="0.16" />
      <path
        d="M14 8.6v10.8M8.6 14h10.8"
        stroke="#8e8e93"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[20px] w-[20px]">
      <rect x="9" y="3.5" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignalWifi() {
  return (
    <div className="flex items-center gap-[5px]">
      <svg aria-hidden="true" viewBox="0 0 17 11" className="h-[10px] w-[16px]">
        <rect x="0" y="7.5" width="3" height="3" rx="0.6" fill="currentColor" />
        <rect x="4.5" y="5.5" width="3" height="5" rx="0.6" fill="currentColor" />
        <rect x="9" y="3" width="3" height="7.5" rx="0.6" fill="currentColor" />
        <rect x="13.5" y="0.5" width="3" height="10" rx="0.6" fill="currentColor" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 16 12" className="h-[11px] w-[15px]">
        <path
          d="M1.2 7.8c2.6-2.5 6.9-2.5 9.5 0M3.1 9.6c1.5-1.4 3.9-1.4 5.4 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.9" fill="currentColor" />
      </svg>
      <span className="inline-block h-[10px] w-[22px] rounded-[3px] border border-current/85 p-[1.5px]">
        <span className="block h-full w-[70%] rounded-[1.5px] bg-current" />
      </span>
    </div>
  );
}

export function IMessagePhone() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[min(100%,19.5rem)] select-none sm:w-[min(100%,20.5rem)]"
    >
      <div className="rounded-[2.55rem] bg-phone-bezel p-[9px] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.38)]">
        <div className="relative overflow-hidden rounded-[2.05rem] bg-imsg-bg">
          <div className="absolute top-[9px] left-1/2 z-20 h-[1.55rem] w-[5.9rem] -translate-x-1/2 rounded-full bg-black" />

          <div className="relative z-10 flex items-end justify-between px-5 pt-[14px] pb-1 text-[12px] font-semibold tracking-[-0.02em] text-foreground">
            <span className="pl-1">9:41</span>
            <SignalWifi />
          </div>

          <div className="relative z-10 flex items-center px-1.5 pt-0.5 pb-2">
            <div className="flex h-9 w-9 items-center justify-center text-imsg-blue">
              <BackChevron />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[12px] font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                P
              </div>
              <div className="mt-0.5 flex items-center gap-0.5 text-[11px] font-medium tracking-[-0.015em] text-foreground">
                Penny
                <span className="text-[8px] text-muted" aria-hidden>
                  ›
                </span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center text-imsg-blue">
              <InfoIcon />
            </div>
          </div>

          <div className="h-px bg-black/[0.06]" />

          <div className="flex min-h-[21.5rem] flex-col justify-end gap-[2px] bg-imsg-bg px-2.5 pt-3 pb-1.5">
            <p className="mb-2.5 text-center text-[10.5px] font-medium tracking-[-0.01em] text-[#8e8e93]">
              Today 9:41 AM
            </p>
            <p className="-mt-1.5 mb-2.5 text-center text-[10px] tracking-[-0.01em] text-[#aeaeb2]">
              Demo example
            </p>

            <div className="flex justify-end">
              <div className="imsg-out max-w-[82%] px-[11px] py-[6.5px] text-[14.5px] leading-[1.27] tracking-[-0.012em]">
                Spending this week?
              </div>
            </div>

            <div className="mt-[2px] flex justify-start">
              <div className="imsg-in-mid max-w-[86%] px-[11px] py-[6.5px] text-[14.5px] leading-[1.27] tracking-[-0.012em] text-black">
                MOCK — groceries $142 · up ~$30
              </div>
            </div>
            <div className="mb-1 flex justify-start">
              <div className="imsg-in max-w-[78%] px-[11px] py-[6.5px] text-[14.5px] leading-[1.27] tracking-[-0.012em] text-black">
                Want the category chart?
              </div>
            </div>

            <div className="mt-[2px] flex justify-end">
              <div className="imsg-out max-w-[84%] px-[11px] py-[6.5px] text-[14.5px] leading-[1.27] tracking-[-0.012em]">
                spent $12.50 at Blue Bottle
              </div>
            </div>

            <div className="mt-[2px] flex justify-start">
              <div className="imsg-in-mid max-w-[86%] px-[11px] py-[6.5px] text-[14.5px] leading-[1.27] tracking-[-0.012em] text-black">
                $12.50 · Blue Bottle · coffee
              </div>
            </div>
            <div className="mb-0.5 flex justify-start">
              <div className="imsg-in max-w-[88%] px-[11px] py-[6.5px] text-[14.5px] leading-[1.27] tracking-[-0.012em] text-black">
                Draft ready — 👍 to record
              </div>
            </div>
          </div>

          <div className="border-t border-black/[0.05] bg-imsg-bg px-2 pt-1.5 pb-[14px]">
            <div className="flex items-center gap-1.5">
              <AppsIcon />
              <div className="flex h-8 min-w-0 flex-1 items-center rounded-full border border-imsg-separator/65 bg-white px-3 text-[14px] tracking-[-0.01em] text-[#c7c7cc]">
                iMessage
              </div>
              <div className="pr-0.5 text-[#8e8e93]">
                <MicIcon />
              </div>
            </div>
            <div className="mx-auto mt-2.5 h-[4px] w-[36%] rounded-full bg-black/75" />
          </div>
        </div>
      </div>
    </div>
  );
}
