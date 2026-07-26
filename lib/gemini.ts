import { NextResponse } from 'next/server';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { nextPacificMidnightUtc } from './quota';

// Shared server-only helpers for the agent routes. Never imported by client
// components: it holds the API key usage and the model client.

// Pinned to an explicit model, deliberately NOT a floating "-latest" alias:
// `gemini-flash-lite-latest` silently moved onto the Gemini 3 family, which
// rejects `thinkingBudget` and broke every route with a 400 INVALID_ARGUMENT.
// A version bump here should be a commit, not a surprise in production.
export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

// The free-tier daily quota is exhausted (429). Not transient: surfaces at once.
export class QuotaError extends Error {}
// Any other model or JSON-parse failure after the retry.
export class ModelError extends Error {}

function isInvalidArgument(err: unknown): boolean {
  const anyErr = err as { status?: number | string; code?: number; message?: string };
  const msg = anyErr?.message ?? String(err);
  return (
    anyErr?.status === 400 ||
    anyErr?.code === 400 ||
    /INVALID_ARGUMENT/i.test(msg)
  );
}

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
  // Attempt 0 and 1 send the thinking hint; attempt 2 drops it. Thinking knobs
  // are the part of the request most likely to break on a model change (the
  // 2.5 -> 3.x move renamed thinkingBudget to thinkingLevel), so a rejected
  // argument degrades to a slightly slower call instead of a 502.
  for (let attempt = 0; attempt < 3; attempt++) {
    const withThinking = attempt < 2;
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: opts.contents,
        config: {
          systemInstruction: opts.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: opts.schema,
          temperature: 0.2,
          // Minimal thinking keeps each agent well under the 10s limit.
          ...(withThinking
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } }
            : {}),
        },
      });
      return JSON.parse(res.text ?? '{}') as T;
    } catch (err) {
      lastErr = err;
      console.error(
        `[${opts.label}] attempt`,
        attempt + 1,
        withThinking ? '' : '(no thinkingConfig)',
        'failed:',
        (err as { message?: string })?.message ?? err
      );
      if (isQuotaError(err)) throw new QuotaError();
      // A rejected argument will not fix itself on an identical retry: go
      // straight to the attempt that drops the thinking hint.
      if (isInvalidArgument(err) && attempt === 0) attempt = 1;
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
