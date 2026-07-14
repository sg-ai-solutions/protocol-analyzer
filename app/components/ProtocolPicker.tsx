'use client';

import type { ProtocolIndexEntry } from '@/lib/types';

// Split the index label ("CODE | PHASE, AREA") into its parts so each card
// reads like a dossier index entry. The pipe is a field delimiter, not shown.
function parseLabel(label: string): {
  code: string;
  phase: string;
  area: string;
} {
  const [codePart, rest = ''] = label.split('|').map((s) => s.trim());
  const [phase, area = ''] = rest.split(',').map((s) => s.trim());
  return { code: codePart, phase, area };
}

export default function ProtocolPicker({
  items,
  selectedId,
  disabled,
  onSelect,
}: {
  items: ProtocolIndexEntry[];
  selectedId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <section aria-label="Sample protocols">
      <div className="mb-4">
        <span className="eyebrow">Sample dossier</span>
        <p className="mt-1 text-sm text-ink-soft">
          Four synthetic protocols. Pick one to run a live review, or paste your
          own excerpt below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p, i) => {
          const selected = p.id === selectedId;
          const { code, phase, area } = parseLabel(p.label);
          const running = selected && disabled;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(p.id)}
              aria-pressed={selected}
              className={[
                'sheet group relative flex flex-col overflow-hidden p-0 text-left transition',
                selected
                  ? 'ring-2 ring-brand-blue ring-offset-1'
                  : 'hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-12px_rgba(14,34,51,0.4)]',
                disabled ? 'cursor-wait opacity-70' : 'cursor-pointer',
              ].join(' ')}
            >
              {/* Index tab */}
              <div className="flex items-center justify-between border-b border-hairline bg-paper-2/60 px-3 py-2">
                <span className="font-mono text-xs font-medium text-ink">
                  {code}
                </span>
                <span className="font-mono text-[10px] text-ink-soft">
                  {i + 1} / {items.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-6 p-3">
                <div className="text-sm leading-snug text-ink">
                  <span className="font-medium">{phase}</span>
                  <span className="block text-ink-soft">{area}</span>
                </div>

                <span className="mt-auto font-mono text-[0.7rem] text-brand-blue-deep">
                  {running ? 'Reviewing…' : 'Run review →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
