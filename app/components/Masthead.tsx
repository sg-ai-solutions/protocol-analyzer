import IchReference from './IchReference';

export default function Masthead() {
  return (
    <header>
      {/* Company top bar: the brand line above the product */}
      <div className="border-b border-hairline bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="SG AI Solutions"
            className="h-9 w-auto"
            width={272}
            height={216}
          />
          <a
            href="https://sg-ai-solutions.com"
            className="font-mono text-xs text-ink-soft underline-offset-4 transition-colors hover:text-brand-blue-deep hover:underline"
          >
            sg-ai-solutions.com&nbsp;→
          </a>
        </div>
      </div>

      {/* Editorial masthead: the product cover */}
      <div className="mx-auto max-w-5xl px-6 pt-14 pb-10">
        <div className="rise flex items-center gap-3">
          <span className="eyebrow">Protocol conformity</span>
          <span className="h-px w-8 bg-hairline" />
          <span className="flex items-center gap-1.5 font-mono text-[0.68rem] tracking-wide text-ink-soft">
            ICH-GCP E6(R2) · §6
            <IchReference />
          </span>
        </div>

        <h1 className="rise mt-4 font-display text-[clamp(2rem,5.4vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.015em] text-ink">
          Clinical Protocol Analyzer
        </h1>

        <p className="rise mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
          It reads a clinical trial protocol, maps every section to
          ICH-GCP&nbsp;E6(R2), and marks what is missing, with the{' '}
          <span className="font-medium text-ink">clause cited</span> for each
          finding.
        </p>
      </div>
    </header>
  );
}
