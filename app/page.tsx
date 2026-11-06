import { IMessagePhone } from "@/components/imessage-phone";
import { getIMessageNumber, imessageSmsHref } from "@/lib/imessage";

export default function Home() {
  const number = getIMessageNumber();
  const href = imessageSmsHref(number);

  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-5 sm:px-8 lg:px-12">
        <section className="grid flex-1 grid-cols-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,24rem)] lg:gap-x-16 lg:py-12 xl:gap-x-24">
          {/* Mobile: phone first */}
          <div className="rise rise-1 order-1 flex justify-center lg:order-2 lg:justify-end">
            <IMessagePhone />
          </div>

          <div className="order-2 flex flex-col lg:order-1 lg:pr-4">
            <p className="rise text-[14px] font-medium tracking-[-0.03em] text-foreground">
              Penny
            </p>

            <h1 className="rise rise-2 mt-5 max-w-[10.5ch] text-[clamp(2.75rem,6.8vw,5rem)] leading-[0.98] font-medium tracking-[-0.048em] text-foreground sm:mt-6">
              An AI you can just text.
            </h1>

            <p className="rise rise-3 mt-4 max-w-[26rem] text-[16px] leading-[1.5] tracking-[-0.015em] text-muted sm:text-[17px]">
              Penny answers in iMessage — like texting a sharp friend who
              happens to think fast.
            </p>

            <div className="rise rise-4 mt-7 flex flex-col items-start gap-2">
              <a
                href={href}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-6 text-[15px] font-medium tracking-[-0.02em] text-background transition-[transform,opacity] duration-100 ease-out hover:opacity-[0.88] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-foreground active:scale-[0.97]"
              >
                Text Penny
              </a>
              <p className="text-[12px] tracking-[-0.01em] text-muted">
                Opens Messages with a hello ready to send.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
