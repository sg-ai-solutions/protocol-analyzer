export type Status = 'present' | 'weak' | 'missing';

export interface ProtocolIndexEntry {
  id: string;
  label: string;
}

// A sample dossier is now just source text; its analysis is produced live by
// Gemini on selection, exactly like a pasted excerpt.
export interface SampleProtocol {
  id: string;
  label: string;
  documentText: string;
}

export interface ReferenceSection {
  id: string;
  label: string;
  clause: string;
}

export interface Finding {
  sectionId: string;
  label: string;
  clause: string;
  status: Status;
  finding: string;
}

export interface Protocol {
  id: string;
  label: string;
  completeness: number;
  verdict: string;
  summary: string;
  documentText: string;
  findings: Finding[];
}

// The three real agents, run in sequence, each a separate server call.
// The UI advances a stage to 'done' only when that agent's call resolves.
export type PipelineStage = 'waiting' | 'running' | 'done' | 'failed';

// Agent 1: /api/analyze/extract
export interface ExtractResult {
  detectedSections: string[];
}
// Agent 2: /api/analyze/check
export interface CheckResult {
  findings: Finding[];
}
// Agent 3: /api/analyze/assemble
export interface AssembleResult {
  summary: string;
  completeness: number;
  verdict: string;
}

// Error shape the client understands. `nextResetUtc` is an ISO instant.
export interface AnalyzeError {
  error: 'quota' | 'too_long' | 'empty' | 'failed';
  nextResetUtc?: string;
}
