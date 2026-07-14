'use client';

import { useEffect, useState } from 'react';
import type { AnalyzeError } from '@/lib/types';

function fmtUtc(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm} UTC`;
}

function fmtLocal(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function countdown(iso: string, now: number): string {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return 'any moment now';
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
}

export default function AnalyzeErrorNotice({ error }: { error: AnalyzeError }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (error.error !== 'quota') return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [error.error]);

  let message: string;
  if (error.error === 'quota' && error.nextResetUtc) {
    message = `Analysis has reached today's free Gemini quota. It resets at ${fmtUtc(
      error.nextResetUtc
    )} (${fmtLocal(error.nextResetUtc)} your time, ${countdown(
      error.nextResetUtc,
      now
    )}). Please try again after it resets.`;
  } else if (error.error === 'too_long') {
    message =
      'That excerpt is over the 6,000-character limit. Trim it and try again.';
  } else if (error.error === 'empty') {
    message = 'Please paste some protocol text to analyze.';
  } else {
    message =
      'The analysis could not complete. Please try again in a moment.';
  }

  return (
    <div
      role="status"
      className="sheet border-l-2 px-4 py-3 font-mono text-[0.8rem] leading-relaxed"
      style={{ borderColor: 'var(--weak)', color: 'var(--ink)' }}
    >
      {message}
    </div>
  );
}
