import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import type { Finding, Status } from '@/lib/types';
import reference from '@/public/data/reference-ichgcp.json';
import { runStructured, geminiErrorResponse } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CHARS = 6000;

interface RefSection {
  id: string;
  label: string;
  clause: string;
}
const REFERENCE = reference as RefSection[];

// Agent 2 of 3. Takes the excerpt plus the extractor's detected sections and
// classifies each of the 16 ICH-GCP sections. Labels and clauses are joined
// server-side from the reference, so they are authoritative, never hallucinated.
const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sectionId: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['present', 'weak', 'missing'] },
          finding: { type: Type.STRING },
        },
        required: ['sectionId', 'status', 'finding'],
        propertyOrdering: ['sectionId', 'status', 'finding'],
      },
    },
  },
  required: ['findings'],
};

export async function POST(req: Request) {
  let text = '';
  let detectedSections: string[] = [];
  try {
    const body = await req.json();
    text = typeof body?.text === 'string' ? body.text.trim() : '';
    detectedSections = Array.isArray(body?.detectedSections)
      ? body.detectedSections.filter((s: unknown) => typeof s === 'string')
      : [];
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ error: 'too_long' }, { status: 400 });
  }

  const refList = REFERENCE.map(
    (r) => `- id "${r.id}" | ${r.label} | ${r.clause}`
  ).join('\n');
  const detected = detectedSections.length
    ? detectedSections.join(', ')
    : '(none detected)';

  const systemInstruction = `You are the checking agent in a clinical-protocol review pipeline. You assess a protocol excerpt against the ICH-GCP E6(R2) section 6 checklist.

The 16 expected sections are:
${refList}

The extraction agent detected these sections in the excerpt: ${detected}.

For every one of the 16 sections, decide a status:
- "present": the excerpt adequately addresses this section.
- "weak": the section is mentioned but underspecified or incomplete.
- "missing": the section is absent or not meaningfully addressed.

Return exactly 16 findings, one per section id above, using the exact "id" values. Each finding is a single concise sentence, specific to the excerpt (name what is present or what is absent). Do not invent content that is not supported by the excerpt.`;

  try {
    const parsed = await runStructured<{
      findings?: { sectionId: string; status: Status; finding: string }[];
    }>({
      label: 'check',
      systemInstruction,
      schema: SCHEMA,
      contents: `PROTOCOL EXCERPT:\n\n${text}`,
    });

    if (!Array.isArray(parsed.findings) || parsed.findings.length === 0) {
      // No usable output (empty or blocked response): fail rather than emit a
      // misleading all-missing report.
      return NextResponse.json({ error: 'failed' }, { status: 502 });
    }

    const byId = new Map(parsed.findings.map((f) => [f.sectionId, f]));
    const findings: Finding[] = REFERENCE.map((ref) => {
      const f = byId.get(ref.id);
      const status: Status =
        f?.status === 'present' || f?.status === 'weak' ? f.status : 'missing';
      return {
        sectionId: ref.id,
        label: ref.label,
        clause: ref.clause,
        status,
        finding: f?.finding?.trim() || 'Not addressed in the provided excerpt.',
      };
    });

    return NextResponse.json({ findings });
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
