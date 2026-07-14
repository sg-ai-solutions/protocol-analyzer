import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { nextPacificMidnightUtc } from './quota';

// Shared server-only helpers for the agent routes. Never imported by client
// components: it holds the API key usage and the model client.

export const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

// The free-tier daily quota is exhausted (429). Not transient: surfaces at once.
export class QuotaError extends Error {}
// Any other model or JSON-parse failure after the retry.
export class ModelError extends Error {}

function isQuotaError(err: unknown): boolean {
  const anyErr = err as {
    status?: number | string;
    code?: number;
    message?: string;
  };
  const msg = anyErr?.message ?? String(err);
  return (
    anyErr?.status === 429 ||
    anyErr?.code === 429 ||
    anyErr?.status === 'RESOURCE_EXHAUSTED' ||
    /RESOURCE_EXHAUSTED|quota|exhausted|\b429\b/i.test(msg)
  );
}

// Run one structured-output Gemini call. Retries once on a transient failure;
// a quota (429) is not transient, so it throws QuotaError immediately. Only the
// error is logged, never the input text.
export async function runStructured<T>(opts: {
  label: string;
  contents: string;
  systemInstruction: string;
  schema: unknown;
}): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ModelError('missing GEMINI_API_KEY');

  const ai = new GoogleGenAI({ apiKey });
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: opts.contents,
        config: {
          systemInstruction: opts.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: opts.schema,
          temperature: 0.2,
          // Disable thinking to keep each agent well under the 10s limit.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      return JSON.parse(res.text ?? '{}') as T;
    } catch (err) {
      lastErr = err;
      console.error(
        `[${opts.label}] attempt`,
        attempt + 1,
        'failed:',
        (err as { message?: string })?.message ?? err
      );
      if (isQuotaError(err)) throw new QuotaError();
    }
  }
  throw new ModelError(
    String((lastErr as { message?: string })?.message ?? lastErr)
  );
}

// Map a thrown QuotaError/ModelError to the JSON error the client understands.
export function geminiErrorResponse(err: unknown) {
  if (err instanceof QuotaError) {
    return NextResponse.json(
      { error: 'quota', nextResetUtc: nextPacificMidnightUtc() },
      { status: 429 }
    );
  }
  return NextResponse.json({ error: 'failed' }, { status: 502 });
}
