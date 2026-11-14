/** All displayed match dates and times are Japan time, regardless of the browser timezone. */
export function kickoffInstant(game) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(game?.date || "")) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(game?.time || "");
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  const timestamp = Date.parse(
    `${game.date}T${match[1].padStart(2, "0")}:${match[2]}:00+09:00`,
  );
  return Number.isFinite(timestamp) ? timestamp : null;
}
export function matchCountdown(game, now = Date.now()) {
  const kickoff = kickoffInstant(game);
  if (kickoff === null) return { status: "unknown" };
  if (kickoff <= now) return { status: "started", kickoff };
  const totalMinutes = Math.ceil((kickoff - now) / 60000);
  return {
    status: "upcoming",
    kickoff,
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}
