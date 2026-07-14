import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import type { Finding } from '@/lib/types';
import { runStructured, geminiErrorResponse } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Agent 3 of 3. Takes the 16 findings from the checking agent and writes the
// overall summary. The completeness score (present / 16) and the verdict are
// computed deterministically here, so they are never hallucinated.
const SCHEMA = {
  type: Type.OBJECT,
  properties: { summary: { type: Type.STRING } },
  required: ['summary'],
};

const SYSTEM = `You are the synthesis agent in a clinical-protocol review pipeline. You are given the per-section findings produced by the checking agent. Write a 2 to 3 sentence overall summary of the protocol's completeness against ICH-GCP E6(R2) section 6: state how complete it is and name the main gaps (the missing or underspecified sections). Be specific and factual; do not invent sections or claims not present in the findings.`;

export async function POST(req: Request) {
  let findings: Finding[] = [];
  try {
    const body = await req.json();
    findings = Array.isArray(body?.findings) ? (body.findings as Finding[]) : [];
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 400 });
  }
  if (findings.length === 0) {
    return NextResponse.json({ error: 'failed' }, { status: 400 });
  }

  const covered = findings.filter((f) => f.status === 'present').length;
  const total = findings.length;
  const completeness = covered / total;
  const verdict = completeness >= 0.6 ? 'Mostly complete' : 'Incomplete';

  const lines = findings
    .map((f) => `- ${f.label} (${f.clause}): ${f.status}. ${f.finding}`)
    .join('\n');

  try {
    const parsed = await runStructured<{ summary?: string }>({
      label: 'assemble',
      systemInstruction: SYSTEM,
      schema: SCHEMA,
      contents: `FINDINGS (${covered} of ${total} sections present):\n\n${lines}`,
    });
    const summary = parsed.summary?.trim() || 'Analysis complete.';
    return NextResponse.json({ summary, completeness, verdict });
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
