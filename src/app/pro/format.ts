/** Shared formatting for OC Pro pages — ZAR money and relative dates. */

/** Full ZAR: "R 3 820 000" (en-ZA grouping, no decimals) — matches the consumer app. */
export function formatZAR(value: number): string {
  return `R ${Math.round(value).toLocaleString("en-ZA").replace(/,/g, " ")}`;
}

/** Compact ZAR for KPI tiles and chart axes: "R 3.82m" — matches this app's existing pages. */
export function formatZARCompact(value: number): string {
  if (Math.abs(value) >= 1000000) return `R ${(value / 1000000).toFixed(2)}m`;
  if (Math.abs(value) >= 1000) return `R ${(value / 1000).toFixed(0)}k`;
  return `R ${value.toFixed(0)}`;
}

/** Signed ZAR delta: "+R 120 000" / "−R 65 000". */
export function formatZARDelta(value: number): string {
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${formatZAR(Math.abs(value))}`;
}

/** Relative date in the style of this app's existing pages. */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  const months = Math.floor(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

