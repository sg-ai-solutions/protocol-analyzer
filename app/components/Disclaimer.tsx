export default function Disclaimer() {
  return (
    <p className="font-mono text-[0.7rem] leading-relaxed text-ink-soft">
      <span className="font-semibold text-ink">Disclaimer.</span> This demo maps
      clinical trial protocols to the public ICH-GCP E6(R2) checklist. Every
      review, the four sample dossiers and your own excerpt, runs a real, live
      analysis with Google Gemini on a free tier, so use synthetic or
      non-confidential text only; the text is sent to the model for that review
      and is not stored. This is an illustration, not regulatory advice.
      The full version runs on your own documents and the model of your choice,
      including models hosted inside your own environment, so confidential data
      never leaves it.
    </p>
  );
}
