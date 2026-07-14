import { NextResponse } from 'next/server';
import { Type } from '@google/genai';
import { runStructured, geminiErrorResponse } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CHARS = 6000;

// Agent 1 of 3. Reads the raw protocol excerpt and segments it into the
// sections it actually contains. Its output feeds the checking agent.
const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    detectedSections: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['detectedSections'],
};

const SYSTEM = `You are the extraction agent in a clinical-protocol review pipeline. Read the protocol excerpt and identify the section headings and topics that are actually present in it (for example "Objectives", "Trial Design", "Statistics", "Safety"). Return them as detectedSections, a concise list in the order they appear. Do not invent sections that are not in the text; if the text has no recognisable protocol sections, return an empty list.`;

export async function POST(req: Request) {
  let text = '';
  try {
    const body = await req.json();
    text = typeof body?.text === 'string' ? body.text.trim() : '';
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ error: 'too_long' }, { status: 400 });
  }

  try {
    const parsed = await runStructured<{ detectedSections?: string[] }>({
      label: 'extract',
      systemInstruction: SYSTEM,
      schema: SCHEMA,
      contents: `PROTOCOL EXCERPT:\n\n${text}`,
    });
    // An empty list is a valid result (e.g. non-protocol text): the checking
    // agent will simply mark all 16 sections as missing.
    const detectedSections = Array.isArray(parsed.detectedSections)
      ? parsed.detectedSections.filter((s) => typeof s === 'string')
      : [];
    return NextResponse.json({ detectedSections });
  } catch (err) {
    return geminiErrorResponse(err);
  }
}
