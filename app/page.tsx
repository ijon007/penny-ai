import { getIMessageNumber, imessageSmsHref } from "@/lib/imessage";

function MessagePreview() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-[22rem] rounded-[1.75rem] border border-line bg-subtle/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
    >
      <div className="mb-4 flex items-center justify-center">
        <span className="text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
          Messages
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="self-end max-w-[85%] rounded-[1.15rem] rounded-br-md bg-bubble-out px-3.5 py-2.5 text-[15px] leading-snug text-white">
          Hey Penny
        </div>
        <div className="self-start max-w-[90%] rounded-[1.15rem] rounded-bl-md bg-bubble-in px-3.5 py-2.5 text-[15px] leading-snug text-foreground">
          Hey — what are we thinking through?
        </div>
        <div className="self-end max-w-[85%] rounded-[1.15rem] rounded-br-md bg-bubble-out px-3.5 py-2.5 text-[15px] leading-snug text-white">
          Help me outline a short pitch
        </div>
        <div className="self-start max-w-[92%] rounded-[1.15rem] rounded-bl-md bg-bubble-in px-3.5 py-2.5 text-[15px] leading-snug text-foreground">
          Sure. Who's it for, and what should they feel after reading it?
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const number = getIMessageNumber();
  const href = imessageSmsHref(number);

  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 sm:px-10 lg:px-16">
        <header className="hero-enter flex items-center pt-8 sm:pt-10">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
            Penny
          </p>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-16 sm:py-20 lg:py-24">
          <div className="w-full max-w-[40rem] text-center">
            <h1 className="hero-enter hero-enter-delay-1 text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-balance text-foreground">
              An AI you can just text.
            </h1>

            <p className="hero-enter hero-enter-delay-2 mx-auto mt-6 max-w-md text-[17px] leading-relaxed tracking-[-0.01em] text-muted sm:text-[19px]">
              Penny lives in iMessage. Ask anything, think out loud, or bounce
              an idea — she texts back.
            </p>

            <div className="hero-enter hero-enter-delay-3 mt-10 flex flex-col items-center gap-3">
              <a
                href={href}
                className="inline-flex min-h-11 min-w-[10.5rem] items-center justify-center rounded-full bg-foreground px-7 text-[15px] font-medium tracking-[-0.01em] text-background transition-[transform,opacity] duration-150 ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground active:scale-[0.98]"
              >
                Text Penny
              </a>
              <p className="text-[13px] leading-none tracking-[-0.01em] text-muted">
                Opens Messages with a hello ready to send.
              </p>
            </div>
          </div>

          <div className="hero-enter hero-enter-delay-4 mt-16 w-full sm:mt-20">
            <MessagePreview />
          </div>
        </section>
      </div>
    </main>
  );
}
