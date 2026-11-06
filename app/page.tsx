import { IMessagePhone } from "@/components/imessage-phone";
import { getIMessageNumber, imessageSmsHref } from "@/lib/imessage";

const USE_CASES = [
  {
    title: "Balances & spending",
    body: "Ask what’s left or where money went this week — answers come from labeled mock accounts.",
  },
  {
    title: "Log an expense",
    body: "Text an amount and merchant. Penny drafts it; you confirm with a tapback before it’s recorded.",
  },
  {
    title: "Receipt photos",
    body: "Send a receipt or screenshot. Penny extracts what it can, then waits for your confirmation.",
  },
  {
    title: "Budgets & subscriptions",
    body: "Check mock budgets and recurring charges in plain language — no dashboard to open.",
  },
] as const;

const STEPS = [
  {
    n: "1",
    title: "Text Penny",
    body: "Open Messages with the button above. No separate app to install.",
  },
  {
    n: "2",
    title: "Ask or log",
    body: "Try balances, spending, budgets, or “spent $12.50 at …”.",
  },
  {
    n: "3",
    title: "Confirm when it matters",
    body: "Drafts and receipts wait for a 👍 / ✅ before anything is recorded in the demo ledger.",
  },
] as const;

function TextPennyButton({
  href,
  className = "",
}: {
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-7 text-[15px] font-medium tracking-[-0.02em] text-surface transition-[transform,opacity] duration-150 ease-out hover:opacity-[0.9] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent active:scale-[0.97] ${className}`}
    >
      Text Penny
    </a>
  );
}

export default function Home() {
  const number = getIMessageNumber();
  const href = imessageSmsHref(number);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-sm focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      >
        Skip to content
      </a>

      <header className="border-b border-hairline/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1080px] items-center justify-between px-5 sm:h-[3.75rem] sm:px-8 lg:px-10">
          <p className="text-[15px] font-semibold tracking-[-0.03em]">Penny</p>
          <TextPennyButton href={href} className="min-h-9 px-5 text-[14px]" />
        </div>
      </header>

      <main id="main" className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="border-b border-hairline/80">
          <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 items-center gap-10 px-5 pt-10 pb-12 sm:gap-12 sm:px-8 sm:pt-14 sm:pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(18.5rem,21rem)] lg:gap-x-16 lg:px-10 lg:pt-16 lg:pb-20 xl:gap-x-24">
            <div className="flex flex-col">
              <p className="rise text-[13px] font-medium tracking-[-0.01em] text-secondary">
                Personal finance in iMessage
              </p>
              <h1 className="rise rise-1 mt-3 max-w-[11.5ch] text-[clamp(2.4rem,5.8vw,4.25rem)] leading-[1.03] font-semibold tracking-[-0.045em] sm:mt-4">
                Your money, one text away.
              </h1>
              <p className="rise rise-2 mt-5 max-w-[30rem] text-[16px] leading-[1.55] tracking-[-0.012em] text-secondary sm:text-[17px]">
                Check spending, log expenses, and review budgets by texting —
                the way you already message people. Demo uses labeled mock
                data; nothing claims a live bank link.
              </p>
              <div className="rise rise-3 mt-8 flex flex-col items-start gap-2.5">
                <TextPennyButton href={href} />
                <p className="max-w-[22rem] text-[12px] leading-[1.45] text-muted">
                  Opens Messages with a hello ready to send. Best on iPhone.
                </p>
              </div>
            </div>

            <div className="rise rise-4 flex flex-col items-center gap-3 lg:items-end">
              <IMessagePhone />
              <p className="text-center text-[11px] tracking-[-0.01em] text-muted lg:text-right">
                Illustrative chat · mock ledger
              </p>
            </div>
          </div>
        </section>

        {/* How it works — editorial steps, not card grid */}
        <section
          aria-labelledby="how-heading"
          className="border-b border-hairline/80 bg-surface"
        >
          <div className="mx-auto w-full max-w-[1080px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <p className="text-[13px] font-medium tracking-[-0.01em] text-accent">
              How it works
            </p>
            <h2
              id="how-heading"
              className="mt-2 max-w-[18ch] text-[clamp(1.65rem,3.2vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.035em]"
            >
              Three texts. That’s the product.
            </h2>

            <ol className="mt-10 divide-y divide-hairline border-y border-hairline sm:mt-12">
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 py-6 sm:grid-cols-[3rem_minmax(10rem,14rem)_minmax(0,1fr)] sm:gap-x-8 sm:py-7"
                >
                  <span
                    className="pt-0.5 text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-accent"
                    aria-hidden
                  >
                    {step.n}
                  </span>
                  <h3 className="text-[17px] font-semibold tracking-[-0.025em] sm:text-[18px]">
                    {step.title}
                  </h3>
                  <p className="col-start-2 mt-1.5 max-w-[34rem] text-[15px] leading-[1.5] tracking-[-0.01em] text-secondary sm:col-start-3 sm:mt-0 sm:pt-0.5">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Use cases */}
        <section
          aria-labelledby="use-heading"
          className="border-b border-hairline/80"
        >
          <div className="mx-auto w-full max-w-[1080px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <div className="max-w-[36rem]">
              <p className="text-[13px] font-medium tracking-[-0.01em] text-secondary">
                What you can try
              </p>
              <h2
                id="use-heading"
                className="mt-2 text-[clamp(1.65rem,3.2vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.035em]"
              >
                Finance questions that fit in a thread.
              </h2>
              <p className="mt-4 text-[15px] leading-[1.55] tracking-[-0.01em] text-secondary sm:text-[16px]">
                Built for personal money talk in Messages — not a general chat
                bot, not a bank dashboard.
              </p>
            </div>

            <ul className="mt-10 divide-y divide-hairline border-y border-hairline sm:mt-12 md:grid md:grid-cols-2 md:gap-x-12 md:divide-y-0 md:border-0">
              {USE_CASES.map((item) => (
                <li
                  key={item.title}
                  className="border-hairline py-7 md:border-t"
                >
                  <h3 className="text-[16px] font-semibold tracking-[-0.025em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-[28rem] text-[15px] leading-[1.5] tracking-[-0.01em] text-secondary">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Honest demo state */}
        <section
          aria-labelledby="demo-heading"
          className="border-b border-hairline/80 bg-surface"
        >
          <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-5 py-14 sm:flex-row sm:items-start sm:justify-between sm:gap-16 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <div className="max-w-[28rem]">
              <p className="text-[13px] font-medium tracking-[-0.01em] text-accent">
                Current demo
              </p>
              <h2
                id="demo-heading"
                className="mt-2 text-[clamp(1.5rem,2.8vw,1.85rem)] leading-[1.2] font-semibold tracking-[-0.03em]"
              >
                Mock data. Session-only changes. No bank link yet.
              </h2>
            </div>
            <ul className="max-w-[32rem] space-y-3 text-[15px] leading-[1.5] tracking-[-0.01em] text-secondary">
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  Seeded MOCK balances, budgets, and recurring charges for
                  exploration.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  Expenses you confirm may reset between sessions until durable
                  storage is added.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  Automated weekly digests and budget alerts stay off until
                  opt-in prefs can persist.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-b border-hairline/80">
          <div className="mx-auto flex w-full max-w-[1080px] flex-col items-start gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-[26rem]">
              <h2 className="text-[clamp(1.5rem,2.8vw,1.85rem)] leading-[1.2] font-semibold tracking-[-0.03em]">
                Ready when you are.
              </h2>
              <p className="mt-2 text-[15px] leading-[1.5] text-secondary">
                Say hello in Messages and ask about spending — or log a coffee.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <TextPennyButton href={href} />
              <p className="text-[12px] text-muted">sms: {number}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="text-[13px] font-semibold tracking-[-0.03em]">Penny</p>
          <p className="max-w-[28rem] text-[12px] leading-[1.45] text-muted">
            Personal finance over iMessage. Not affiliated with Apple. Demo
            ledger — no bank transfers, no live balances claimed.
          </p>
        </div>
      </footer>
    </div>
  );
}
