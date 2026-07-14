'use client';

import { Check, Loader2, X } from 'lucide-react';
import type { PipelineStage } from '@/lib/types';

// The signature of the demo: three real agents, each a separate Gemini call,
// handing work to the next. A stage flips to "done" only when that agent's
// call actually resolves, so the progression is real, never a timed fake.
const AGENTS = [
  {
    key: 'extract',
    name: 'Extractor',
    task: 'Segments the protocol into the sections it actually contains.',
  },
  {
    key: 'check',
    name: 'Checker',
    task: 'Assesses each of the 16 ICH-GCP E6(R2) sections: present, weak, or missing.',
  },
  {
    key: 'assemble',
    name: 'Synthesizer',
    task: 'Writes the overall summary and verdict from the findings.',
  },
] as const;

function StageIcon({ stage }: { stage: PipelineStage }) {
  if (stage === 'done') {
    return (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--present-tint)' }}
      >
        <Check className="h-3 w-3" style={{ color: 'var(--present)' }} />
      </span>
    );
  }
  if (stage === 'running') {
    return (
      <span className="flex h-5 w-5 items-center justify-center">
        <Loader2
          className="h-4 w-4 animate-spin"
          style={{ color: 'var(--brand-blue)' }}
        />
      </span>
    );
  }
  if (stage === 'failed') {
    return (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--missing-tint)' }}
      >
        <X className="h-3 w-3" style={{ color: 'var(--missing)' }} />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <span className="h-2 w-2 rounded-full border border-hairline" />
    </span>
  );
}

const STAGE_WORD: Record<PipelineStage, string> = {
  waiting: 'waiting',
  running: 'running',
  done: 'done',
  failed: 'failed',
};

const STAGE_COLOR: Record<PipelineStage, string> = {
  waiting: 'var(--ink-soft)',
  running: 'var(--brand-blue-deep)',
  done: 'var(--present)',
  failed: 'var(--missing)',
};

export default function AgentPipeline({
  stages,
  detectedCount,
}: {
  stages: PipelineStage[];
  detectedCount?: number | null;
}) {
  return (
    <section aria-label="Agentic pipeline" className="sheet px-5 py-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="eyebrow">Agentic pipeline</span>
        <span className="font-mono text-[0.7rem] text-ink-soft">
          3 agents · Gemini
        </span>
      </div>

      <ol className="space-y-4">
        {AGENTS.map((a, i) => {
          const stage = stages[i] ?? 'waiting';
          const dim = stage === 'waiting';
          return (
            <li key={a.key} className="relative flex items-start gap-3">
              {/* connector to the next agent */}
              {i < AGENTS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[9px] top-6 h-[calc(100%-4px)] w-px"
                  style={{
                    backgroundColor:
                      stage === 'done'
                        ? 'var(--present)'
                        : 'var(--hairline)',
                  }}
                />
              )}
              <StageIcon stage={stage} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[0.7rem] text-ink-soft">
                    {i + 1}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      dim ? 'text-ink-soft' : 'text-ink'
                    }`}
                  >
                    {a.name}
                  </span>
                  <span
                    className="font-mono text-[0.62rem] uppercase tracking-wide"
                    style={{ color: STAGE_COLOR[stage] }}
                  >
                    {STAGE_WORD[stage]}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.8rem] leading-relaxed text-ink-soft">
                  {a.task}
                </p>
                {a.key === 'extract' &&
                  stage === 'done' &&
                  typeof detectedCount === 'number' && (
                    <p className="mt-1 font-mono text-[0.7rem] text-brand-blue-deep">
                      {detectedCount} section{detectedCount === 1 ? '' : 's'}{' '}
                      detected
                    </p>
                  )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
