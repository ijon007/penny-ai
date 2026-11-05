import { getIMessageNumber, imessageSmsHref } from "@/lib/imessage";

function IMessageGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
    >
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <path
        d="M6.5 9.4c0-2.1 2.4-3.9 5.5-3.9s5.5 1.8 5.5 3.9-2.4 3.9-5.5 3.9c-.5 0-1 0-1.5-.1L7.2 14.6c-.2.1-.4 0-.4-.2l.4-2.1C6.7 11.6 6.5 10.5 6.5 9.4Z"
        fill="white"
      />
    </svg>
  );
}

export default function Home() {
  const number = getIMessageNumber();
  const href = imessageSmsHref(number);

  return (
    <div className="relative isolate flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grain opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-copper/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-imessage/15 blur-3xl"
      />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16 sm:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-copper to-copper-deep text-lg font-medium text-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            P
          </span>
          <span className="text-sm font-medium tracking-[0.18em] text-muted uppercase">
            Penny
          </span>
        </div>

        <h1 className="font-serif text-[2.65rem] leading-[1.08] tracking-tight text-foreground sm:text-5xl">
          An AI you can just text.
        </h1>

        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          Penny lives in iMessage. Ask anything, think out loud, or bounce an
          idea — she texts back like a sharp friend who happens to be an
          assistant.
        </p>

        <a
          href={href}
          className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-[1.65rem] bg-imessage px-6 py-4 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(52,199,89,0.9)] transition-[transform,background-color] hover:bg-imessage-deep active:scale-[0.98] sm:w-auto sm:self-start"
        >
          <IMessageGlyph />
          Text Penny
        </a>

        <p className="mt-4 text-sm text-muted/80">
          Opens Messages with a hello already filled in.
        </p>
      </main>
    </div>
  );
}
