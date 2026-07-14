'use client';

import type { Finding, Status } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// The signature element. Each of the 16 ICH-GCP §6 sections is one segment,
// laid out in clause order (6.1 → 6.16). Colour encodes status; the row is at
// once the completeness meter and the legend. Structural, not decorative.

const SEG_COLOR: Record<Status, string> = {
  present: 'var(--present)',
  weak: 'var(--weak)',
  missing: 'var(--missing)',
};

const STATUS_WORD: Record<Status, string> = {
  present: 'Present',
  weak: 'Underspecified',
  missing: 'Not addressed',
};

function clauseNo(clause: string): string {
  const m = clause.match(/([\d.]+)\s*$/);
  return m ? m[1] : clause;
}

export default function ConformitySpine({ findings }: { findings: Finding[] }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="eyebrow">Conformity spine</span>
        <span className="font-mono text-[0.7rem] text-ink-soft">
          16 sections · ICH-GCP E6(R2) §6.1–6.16
        </span>
      </div>

      <div className="flex items-stretch gap-[3px]" role="list">
        {findings.map((f) => (
          <Tooltip key={f.sectionId}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  role="listitem"
                  aria-label={`${clauseNo(f.clause)} ${f.label}: ${
                    STATUS_WORD[f.status]
                  }`}
                  className="group relative flex-1 cursor-default focus:outline-none"
                >
                  <span
                    className="block h-9 rounded-[2px] ring-offset-1 transition-transform duration-150 group-hover:scale-y-110 group-focus-visible:ring-2 group-focus-visible:ring-ring"
                    style={{ backgroundColor: SEG_COLOR[f.status] }}
                  />
                  <span className="mt-1 block text-center font-mono text-[9px] leading-none text-ink-soft">
                    {clauseNo(f.clause)}
                  </span>
                </button>
              }
            />
            <TooltipContent className="max-w-xs">
              <div className="font-mono text-[10px] opacity-70">
                {f.clause}
              </div>
              <div className="font-medium">{f.label}</div>
              <div className="opacity-80">{STATUS_WORD[f.status]}</div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.7rem] text-ink-soft">
        {(['present', 'weak', 'missing'] as Status[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: SEG_COLOR[s] }}
            />
            {STATUS_WORD[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
