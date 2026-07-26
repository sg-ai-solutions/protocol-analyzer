# Clinical Protocol Analyzer (public demo)

> Completeness and gaps, mapped to ICH-GCP.

A public web app that reads a clinical trial protocol, maps every section to the
public ICH-GCP E6(R3) Annex 1, Appendix B checklist, and marks what is present, weak, or
missing, with the clause cited for each finding.

It has two entry points, both running the **same real, live analysis** via
Google Gemini server-side:

1. **Four sample protocols** (synthetic source text) you can analyze in one
   click, so the demo works without pasting anything.
2. **"Analyze your own excerpt"**, the same analysis on text you paste.

There are no saved or precomputed findings: every review, samples included, is a
live model call. It uses a free Gemini tier, so use synthetic or
non-confidential text only. See the on-page disclaimer.

## Architecture

- Next.js (App Router) + React + TypeScript + Tailwind v4 + shadcn/ui.
- App Router pages with no server code stay **statically prerendered** and
  CDN-served. Only the `POST /api/analyze/*` routes run on demand as functions.
  (v2 is NOT a static export; `output: 'export'` was removed so the routes run.)
- Hosting: Netlify Next.js runtime (`@netlify/plugin-nextjs`). Free tier is
  sufficient; the functions are small and the sample source text stays cached.

### The live path: a real three-agent pipeline (POST, Node runtime)

The analysis is three real agents, each its own server call (`@google/genai`,
server-side only, key never reaches the client). The client runs them in
sequence and advances the on-screen pipeline as each call actually resolves, so
the progress is genuine, never a timed fake. Shared logic lives in
`lib/gemini.ts`.

1. **Extractor** (`app/api/analyze/extract/route.ts`): segments the excerpt into
   the sections it actually contains → `{ detectedSections }`.
2. **Checker** (`app/api/analyze/check/route.ts`): given the excerpt and the
   detected sections, classifies each of the 16 E6(R3) Appendix B sections as
   present/weak/missing with a one-line finding → `{ findings }`. Section
   **labels and clauses are joined server-side** from `reference-ichgcp.json`,
   so they are authoritative and never hallucinated.
3. **Synthesizer** (`app/api/analyze/assemble/route.ts`): writes the overall
   summary from the findings → `{ summary, completeness, verdict }`. The
   completeness score (present / 16) and verdict are computed deterministically
   in the route, so they are never hallucinated.

- Model: `gemini-flash-lite-latest` per call (~2-3s each, each well under
  Netlify's 10s function limit; override with `GEMINI_MODEL`). Each call uses
  structured output (`responseMimeType: application/json` + `responseSchema`,
  `thinkingBudget: 0` for latency).
- Guardrails: reject empty (400), cap 6000 chars (400 `too_long`), fail rather
  than emit an all-missing report if a model call returns nothing, never log or
  store the input text.
- **429 handling**: on Gemini `RESOURCE_EXHAUSTED`, a route returns 429
  `{ error:'quota', nextResetUtc }` where `nextResetUtc` is the next 00:00
  America/Los_Angeles instant (DST-safe, computed in `lib/quota.ts`). The UI
  shows a live countdown; the failing stage is marked and can be retried.

## Data

The four sample dossiers are just source text; their analysis is produced live
by Gemini on selection (there are no saved findings).

- `public/data/protocols-index.json`: picker list (id, label).
- `public/data/reference-ichgcp.json`: the 16 E6(R3) Appendix B sections (id, label, clause).
- `public/data/protocols/<id>.json`: per-sample id, label and source text.

## Environment

- `GEMINI_API_KEY`: required for the live path. Set it in a gitignored `.env`
  (or `.env.local`) for dev, and in Netlify (Site settings → Environment) for
  production. Never in client code.
- `GEMINI_MODEL`: optional model override.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build    # Next build; deploy via the Netlify Next.js runtime
```

## Deploy

Netlify, subdomain `protocol-analyzer.sg-ai-solutions.com`. Uses the Netlify
Next.js runtime (not a static publish dir). Set `GEMINI_API_KEY` in the Netlify
environment. DNS + the `sg-ai-solutions.com/work` card are handled separately.

## Scope

The demo shows the engine, not the product: four synthetic samples plus a
bounded live paste box (no file upload, no report generation in client
templates, no integrations, generic ICH-GCP E6(R3) checklist only). That gap is the
paid scope.
