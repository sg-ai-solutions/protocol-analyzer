// The Gemini free-tier daily quota resets at 00:00 America/Los_Angeles, which
// is 07:00 or 08:00 UTC depending on US daylight saving. Rather than hardcode a
// UTC hour, compute the next midnight PT as an absolute instant.
export function nextPacificMidnightUtc(now: Date = new Date()): string {
  const TZ = 'America/Los_Angeles';

  // Wall-clock "now" as seen in LA, and in UTC, both read back as local Dates.
  const laNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
  const utcNow = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  // Offset between UTC and LA at this instant (handles PST/PDT automatically).
  const offsetMs = utcNow.getTime() - laNow.getTime();

  // Next midnight on the LA calendar (wall clock).
  const laMidnight = new Date(
    laNow.getFullYear(),
    laNow.getMonth(),
    laNow.getDate() + 1,
    0,
    0,
    0,
    0
  );

  // Convert that LA wall time back to a real UTC instant.
  return new Date(laMidnight.getTime() + offsetMs).toISOString();
}
