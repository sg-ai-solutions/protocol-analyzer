'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const MAX_CHARS = 6000;

// The live path. A bounded paste box (not file upload, not a full workflow):
// enough to prove the engine runs for real, deliberately short of the product.
export default function LiveAnalyzer({
  busy,
  onAnalyze,
}: {
  busy: boolean;
  onAnalyze: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const over = text.length > MAX_CHARS;
  const canSubmit = trimmed.length > 0 && !over && !busy;

  return (
    <section aria-label="Analyze your own excerpt">
      <div className="mb-4">
        <span className="eyebrow">Or analyze your own excerpt</span>
        <p className="mt-1 text-sm text-ink-soft">
          Paste a protocol excerpt and the engine reviews it live against the
          same ICH-GCP checklist. Use synthetic or non-confidential text.
        </p>
      </div>

      <div className="sheet p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          rows={7}
          maxLength={MAX_CHARS + 200}
          placeholder="Paste protocol text here, e.g. the objectives, design, safety and statistics sections…"
          className="scroll-thin w-full resize-y rounded-[3px] border border-hairline bg-paper/60 p-3 font-mono text-[0.85rem] leading-relaxed text-ink outline-none placeholder:text-ink-soft/60 focus:border-brand-blue focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span
            className="font-mono text-[0.7rem]"
            style={{ color: over ? 'var(--missing)' : 'var(--ink-soft)' }}
          >
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            {over ? ', too long' : ''}
          </span>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => onAnalyze(trimmed)}
          >
            {busy ? 'Analyzing…' : 'Analyze excerpt'}
          </Button>
        </div>
      </div>
    </section>
  );
}
