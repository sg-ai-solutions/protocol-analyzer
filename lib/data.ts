import type {
  AnalyzeError,
  AssembleResult,
  CheckResult,
  ExtractResult,
  Finding,
  ProtocolIndexEntry,
  ReferenceSection,
  SampleProtocol,
} from './types';

// All data is static JSON under /public/data. No backend, no runtime generation.
// Paths respect Next's basePath-free static export served from the site root.

// Let the browser/CDN revalidate against HTTP headers rather than pinning the
// first response forever; 'force-cache' made updated data go stale for anyone
// who had already loaded the page.
export async function loadIndex(): Promise<ProtocolIndexEntry[]> {
  const res = await fetch('/data/protocols-index.json');
  if (!res.ok) throw new Error('Failed to load protocol index');
  return res.json();
}

export async function loadProtocol(id: string): Promise<SampleProtocol> {
  const res = await fetch(`/data/protocols/${id}.json`);
  if (!res.ok) throw new Error(`Failed to load protocol ${id}`);
  return res.json();
}

export async function loadReference(): Promise<ReferenceSection[]> {
  const res = await fetch('/data/reference-ichgcp.json');
  if (!res.ok) throw new Error('Failed to load ICH-GCP reference');
  return res.json();
}

// Live path: three real agents, each its own server call, run in sequence by
// the page. Each POST throws the typed AnalyzeError on failure so the UI can
// show quota/too_long/failed states and mark the failing stage.
async function postStep<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    const err: AnalyzeError = { error: 'failed' };
    throw err;
  }

  if (!res.ok) {
    let err: AnalyzeError = { error: 'failed' };
    try {
      err = (await res.json()) as AnalyzeError;
    } catch {
      /* keep default */
    }
    throw err;
  }

  return res.json() as Promise<T>;
}

// Agent 1: segment the excerpt into its detected sections.
export function agentExtract(text: string): Promise<ExtractResult> {
  return postStep<ExtractResult>('/api/analyze/extract', { text });
}

// Agent 2: classify each of the 16 E6(R3) Appendix B sections against the excerpt.
export function agentCheck(
  text: string,
  detectedSections: string[]
): Promise<CheckResult> {
  return postStep<CheckResult>('/api/analyze/check', { text, detectedSections });
}

// Agent 3: write the summary; completeness and verdict come back computed.
export function agentAssemble(findings: Finding[]): Promise<AssembleResult> {
  return postStep<AssembleResult>('/api/analyze/assemble', { findings });
}
