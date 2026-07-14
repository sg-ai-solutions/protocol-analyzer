'use client';

import type { Finding, Status } from '@/lib/types';

// A finding reads like a reviewer's margin annotation: a status tag, the ICH
// clause set in mono, and the one-line note.
const META: Record<
  Status,
  { word: string; color: string; tint: string }
> = {
  present: { word: 'Present', color: 'var(--present)', tint: 'var(--present-tint)' },
  weak: { word: 'Underspecified', color: 'var(--weak)', tint: 'var(--weak-tint)' },
  missing: { word: 'Not addressed', color: 'var(--missing)', tint: 'var(--missing-tint)' },
};

export default function FindingRow({
  finding,
  index,
}: {
  finding: Finding;
  index: number;
}) {
  const m = META[finding.status];
  return (
    <li
      className="rise border-l-2 bg-card py-3 pl-4 pr-3"
      style={{ borderColor: m.color, animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold leading-snug text-ink">
          {finding.label}
        </span>
        <span
          className="shrink-0 rounded-[3px] px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wide"
          style={{ color: m.color, backgroundColor: m.tint }}
        >
          {m.word}
        </span>
      </div>
      <p className="mt-1 text-[0.85rem] leading-relaxed text-ink-soft">
        {finding.finding}
      </p>
      <span className="mt-2 inline-block font-mono text-[0.68rem] text-ink-soft">
        ▸ {finding.clause}
      </span>
    </li>
  );
}
