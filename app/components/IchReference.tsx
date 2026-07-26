'use client';

import { useState } from 'react';
import type { ReferenceSection } from '@/lib/types';
import { loadReference } from '@/lib/data';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function clauseNo(clause: string): string {
  // Matches the trailing reference, with or without its letter prefix:
  // "ICH E6(R3) Appendix B.10" -> "B.10".
  const m = clause.match(/([A-Z]\.[\d.]+|[\d.]+)\s*$/);
  return m ? m[1] : clause;
}

// A small "?" that explains the standard for anyone who doesn't know ICH-GCP:
// what the checklist is, and the 16 Appendix B sections the analyzer checks.
// Sections are loaded from the same reference JSON the analysis uses.
export default function IchReference() {
  const [sections, setSections] = useState<ReferenceSection[] | null>(null);
  const [error, setError] = useState(false);

  function handleOpen(open: boolean) {
    if (open && !sections && !error) {
      loadReference().then(setSections).catch(() => setError(true));
    }
  }

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger
        aria-label="What is ICH-GCP E6(R3) Annex 1, Appendix B?"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-hairline font-mono text-[0.6rem] leading-none text-ink-soft transition-colors hover:border-brand-blue hover:text-brand-blue-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        ?
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 max-w-[90vw] gap-3 bg-card p-4 text-ink ring-hairline"
      >
        <div>
          <div className="eyebrow mb-1">ICH-GCP E6(R3) · Annex 1, App. B</div>
          <p className="text-[0.8rem] leading-relaxed text-ink-soft">
            ICH-GCP E6(R3) is the current international Good Clinical Practice
            standard (Step 4, January 2025; effective in the EU on 23 July
            2025). It replaces the R2 §6 protocol checklist with Annex 1,
            Appendix B, which lists what a trial protocol should contain. The
            analyzer checks a protocol against each of these:
          </p>
        </div>

        {error && (
          <p className="font-mono text-xs" style={{ color: 'var(--missing)' }}>
            Reference unavailable. Please try again.
          </p>
        )}

        {!sections && !error && (
          <p className="font-mono text-xs text-ink-soft">Loading…</p>
        )}

        {sections && (
          <ol className="scroll-thin max-h-72 space-y-1 overflow-auto">
            {sections.map((s) => (
              <li
                key={s.id}
                className="flex gap-2 border-b border-hairline/60 py-1 last:border-0"
              >
                <span className="w-10 shrink-0 font-mono text-[0.7rem] text-brand-blue-deep">
                  {clauseNo(s.clause)}
                </span>
                <span className="text-[0.8rem] leading-snug text-ink">
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        )}
      </PopoverContent>
    </Popover>
  );
}
