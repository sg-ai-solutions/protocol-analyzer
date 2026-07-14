import { Button } from '@/components/ui/button';

export default function CtaBlock() {
  return (
    <section className="sheet overflow-hidden">
      <div className="grid gap-6 p-6 sm:grid-cols-[1.4fr_1fr] sm:items-center sm:p-8">
        <div>
          <span className="eyebrow">The engine, not the product</span>
          <h2 className="mt-2 font-display text-2xl font-medium leading-tight text-ink sm:text-[1.75rem]">
            Run this on your own protocols.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            This demo checks synthetic samples against the public checklist. The
            full version reviews{' '}
            <span className="text-ink">your documents</span> against{' '}
            <span className="text-ink">your SOPs</span>, in{' '}
            <span className="text-ink">your own environment</span>. Nothing
            leaves it.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <Button
            nativeButton={false}
            className="w-full sm:w-auto"
            render={
              <a
                href="https://calendly.com/saber-graf-sg-ai-solutions/30min"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a call
              </a>
            }
          />
          <Button
            variant="outline"
            nativeButton={false}
            className="w-full font-mono text-xs sm:w-auto"
            render={<a href="https://sg-ai-solutions.com/work">See more work</a>}
          />
        </div>
      </div>
    </section>
  );
}
