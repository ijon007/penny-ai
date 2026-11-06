import { IMessagePhone } from "@/components/imessage-phone";
import { getIMessageNumber, imessageSmsHref } from "@/lib/imessage";

export default function Home() {
  const number = getIMessageNumber();
  const href = imessageSmsHref(number);

  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col px-5 sm:px-8 lg:px-12">
        <header className="rise flex items-center pt-6 sm:pt-8">
          <p className="text-[15px] font-semibold tracking-[-0.03em] text-foreground">
            Penny
          </p>
        </header>

        <section className="grid flex-1 grid-cols-1 items-center gap-10 py-10 sm:gap-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(19.5rem,22.5rem)] lg:gap-x-20 lg:py-16 xl:gap-x-28">
          {/* Mobile: product preview first */}
          <div className="rise rise-1 order-1 flex flex-col items-center gap-3 lg:order-2 lg:items-end">
            <IMessagePhone />
            <p className="text-center text-[11px] tracking-[-0.01em] text-muted lg:text-right">
              Example conversation · demo mock data
            </p>
          </div>

          <div className="order-2 flex flex-col lg:order-1 lg:pr-2">
            <p className="rise rise-2 text-[13px] font-medium tracking-[-0.01em] text-secondary">
              Personal finance · iMessage
            </p>

            <h1 className="rise rise-2 mt-4 max-w-[12ch] text-[clamp(2.5rem,6.2vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-foreground sm:mt-5">
              Your money, one text away.
            </h1>

            <p className="rise rise-3 mt-5 max-w-[28rem] text-[16px] leading-[1.55] tracking-[-0.012em] text-secondary sm:text-[17px]">
              Penny helps you check balances, log spending, and review budgets
              in Messages — labeled mock data for now, no bank connection
              required to try it.
            </p>

            <div className="rise rise-4 mt-8 flex flex-col items-start gap-2.5">
              <a
                href={href}
                className="inline-flex min-h-11 min-w-[9.5rem] items-center justify-center rounded-full bg-foreground px-7 text-[15px] font-medium tracking-[-0.02em] text-surface transition-[transform,opacity,background-color] duration-150 ease-out hover:opacity-[0.9] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent active:scale-[0.97]"
              >
                Text Penny
              </a>
              <p className="max-w-[22rem] text-[12px] leading-[1.4] tracking-[-0.01em] text-muted">
                Opens Messages with a hello ready to send. Works best on
                iPhone.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
