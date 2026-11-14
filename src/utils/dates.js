/** Display dates in Japanese while keeping stored dates and form values in ISO format. */
export function formatDate(value) {
  const text = String(value ?? "");
  const match = /^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?(?=$|[T\s])/.exec(text);
  if (!match) return text;
  const [, year, month, day] = match;
  return `${year}年${Number(month)}月${day ? `${Number(day)}日` : ""}`;
}

export function formatDateTime(value) {
  if (!value) return "";
  // Date-only values have no time or timezone to convert.
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(String(value)))
    return formatDate(value);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return formatDate(value);
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}
