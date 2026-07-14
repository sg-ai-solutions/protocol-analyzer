'use client';

import type { Protocol, Status } from '@/lib/types';
import FindingRow from './FindingRow';
import ConformitySpine from './ConformitySpine';

const STATUS_ORDER: Record<Status, number> = {
  missing: 0,
  weak: 1,
  present: 2,
};

export default function ReportView({ protocol }: { protocol: Protocol }) {
  const all = protocol.findings ?? [];
  const total = all.length;
  const covered = all.filter((f) => f.status === 'present').length;
  const missing = all.filter((f) => f.status === 'missing').length;
  const weak = all.filter((f) => f.status === 'weak').length;
  const sorted = [...all].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );
  const mostly = protocol.verdict.toLowerCase().startsWith('mostly');

  return (
    <section aria-label="Conformity report" className="space-y-5">
      {/* Verdict banner + the signature spine */}
      <div className="sheet px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">Verdict</span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-wide"
                style={{
                  color: 'var(--brand-blue-deep)',
                  backgroundColor: 'var(--accent)',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--brand-blue)' }}
                />
                Live analysis · Gemini
              </span>
            </div>
            <div
              className="font-display text-3xl font-medium leading-none sm:text-4xl"
              style={{
                color: mostly ? 'var(--brand-green-deep)' : 'var(--missing)',
              }}
            >
              {protocol.verdict}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl font-medium leading-none text-ink tabular-nums">
              {covered}
              <span className="text-ink-soft">/{total}</span>
            </div>
            <div className="mt-1 font-mono text-[0.7rem] text-ink-soft">
              sections adequately covered
            </div>
          </div>
        </div>

        <hr className="rule my-5" />

        <ConformitySpine findings={protocol.findings} />

        <p className="mt-5 max-w-3xl text-[0.95rem] leading-relaxed text-ink-soft">
          {protocol.summary}
        </p>
      </div>

      {/* Two-pane: the manuscript vs. reviewer findings */}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="sheet flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
            <span className="eyebrow">The manuscript</span>
            <span className="font-mono text-[0.65rem] text-ink-soft">
              source · read-only
            </span>
          </div>
          <pre className="scroll-thin max-h-[42rem] overflow-auto whitespace-pre-wrap px-6 py-5 font-mono text-[0.9rem] leading-[1.75] text-ink">
            {protocol.documentText}
          </pre>
        </div>

        <div className="sheet flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
            <span className="eyebrow">Reviewer findings</span>
            <span className="font-mono text-[0.65rem] text-ink-soft">
              {missing} not addressed · {weak} underspecified · {covered} present
            </span>
          </div>
          <ul className="scroll-thin max-h-[42rem] divide-y divide-hairline overflow-auto">
            {sorted.map((f, i) => (
              <FindingRow key={f.sectionId} finding={f} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
