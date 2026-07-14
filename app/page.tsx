'use client';

import { useEffect, useState } from 'react';
import type {
  AnalyzeError,
  PipelineStage,
  Protocol,
  ProtocolIndexEntry,
} from '@/lib/types';
import {
  agentAssemble,
  agentCheck,
  agentExtract,
  loadIndex,
  loadProtocol,
} from '@/lib/data';
import Masthead from './components/Masthead';
import ProtocolPicker from './components/ProtocolPicker';
import LiveAnalyzer from './components/LiveAnalyzer';
import AgentPipeline from './components/AgentPipeline';
import ReportView from './components/ReportView';
import AnalyzeErrorNotice from './components/AnalyzeErrorNotice';
import CtaBlock from './components/CtaBlock';
import Disclaimer from './components/Disclaimer';

type Phase = 'idle' | 'running' | 'report' | 'error';
type Mode = 'sample' | 'live';

export default function Home() {
  const [index, setIndex] = useState<ProtocolIndexEntry[] | null>(null);
  const [indexError, setIndexError] = useState(false);

  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [analyzeError, setAnalyzeError] = useState<AnalyzeError | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([
    'waiting',
    'waiting',
    'waiting',
  ]);
  const [detectedCount, setDetectedCount] = useState<number | null>(null);

  useEffect(() => {
    loadIndex().then(setIndex).catch(() => setIndexError(true));
  }, []);

  const busy = phase === 'running';

  // The real three-agent pipeline. Each agent is a separate server call; the
  // stage flips to 'done' only when its call resolves, so the UI reflects
  // actual progress. On failure, the in-flight stage is marked 'failed'.
  async function runAnalysis(id: string, label: string, text: string) {
    setProtocol(null);
    setAnalyzeError(null);
    setDetectedCount(null);
    setStages(['running', 'waiting', 'waiting']);
    setPhase('running');
    try {
      const { detectedSections } = await agentExtract(text);
      setDetectedCount(detectedSections.length);
      setStages(['done', 'running', 'waiting']);

      const { findings } = await agentCheck(text, detectedSections);
      if (!findings?.length) throw { error: 'failed' } as AnalyzeError;
      setStages(['done', 'done', 'running']);

      const { summary, completeness, verdict } = await agentAssemble(findings);
      setStages(['done', 'done', 'done']);

      setProtocol({
        id,
        label,
        documentText: text,
        completeness,
        verdict,
        summary,
        findings,
      });
      setPhase('report');
    } catch (e) {
      setStages((prev) =>
        prev.map((s) => (s === 'running' ? 'failed' : s))
      );
      setAnalyzeError(
        (e as AnalyzeError)?.error ? (e as AnalyzeError) : { error: 'failed' }
      );
      setPhase('error');
    }
  }

  // Sample dossier: load its source text, then analyze it live via Gemini.
  async function handleSelect(id: string) {
    if (busy) return;
    setMode('sample');
    setSelectedId(id);
    setPhase('running');
    let sample;
    try {
      sample = await loadProtocol(id);
    } catch {
      setAnalyzeError({ error: 'failed' });
      setPhase('error');
      return;
    }
    await runAnalysis(id, sample.label, sample.documentText);
  }

  // Paste box: analyze the pasted excerpt live via Gemini.
  async function handleAnalyze(text: string) {
    if (busy) return;
    setMode('live');
    setSelectedId(null);
    await runAnalysis('live', 'Your excerpt', text);
  }

  // The run output (pipeline → report → error) is rendered directly under
  // whichever control triggered it, so progress is always visible without
  // scrolling: sample output under the dossiers, live output under the textarea.
  const runOutput = (
    <>
      {(phase === 'running' || phase === 'error') && (
        <AgentPipeline stages={stages} detectedCount={detectedCount} />
      )}
      {phase === 'report' && protocol && <ReportView protocol={protocol} />}
      {phase === 'error' && analyzeError && (
        <AnalyzeErrorNotice error={analyzeError} />
      )}
    </>
  );

  return (
    <div className="min-h-screen">
      <Masthead />

      <main className="mx-auto max-w-5xl space-y-10 px-6 pb-16">
        {indexError && (
          <div
            className="sheet px-4 py-3 text-sm"
            style={{ color: 'var(--missing)' }}
          >
            Could not load the sample protocols. Please refresh the page.
          </div>
        )}

        {index && (
          <ProtocolPicker
            items={index}
            selectedId={selectedId}
            disabled={busy}
            onSelect={handleSelect}
          />
        )}

        {!index && !indexError && (
          <div className="font-mono text-sm text-ink-soft">
            Loading sample protocols…
          </div>
        )}

        {/* Sample run output, right under the dossiers */}
        {mode === 'sample' && runOutput}

        {/* Prompt before anything has run */}
        {phase === 'idle' && !mode && (
          <div className="sheet border-dashed px-6 py-12 text-center font-mono text-sm text-ink-soft">
            Pick a sample above, or paste your own excerpt below, to run a
            review.
          </div>
        )}

        <LiveAnalyzer busy={busy} onAnalyze={handleAnalyze} />

        {/* Live run output, right under the textarea */}
        {mode === 'live' && runOutput}

        <CtaBlock />
      </main>

      <footer className="border-t border-hairline bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Disclaimer />
        </div>
      </footer>
    </div>
  );
}
