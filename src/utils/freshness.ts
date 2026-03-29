export type FreshnessColor = "green" | "yellow" | "red";

export function getFreshnessLabel(prepTimeIso: string): string {
  const prepTime = new Date(prepTimeIso).getTime();
  const diffHours = Math.max(0, Math.floor((Date.now() - prepTime) / (1000 * 60 * 60)));
  return `cooked ${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
}

export function getFreshnessColor(prepTimeIso: string, expiresAtIso: string): FreshnessColor {
  const now = Date.now();
  const prepTime = new Date(prepTimeIso).getTime();
  const expiresAt = new Date(expiresAtIso).getTime();

  const elapsedHours = (now - prepTime) / (1000 * 60 * 60);
  const remainingHours = (expiresAt - now) / (1000 * 60 * 60);

  if (remainingHours <= 2 || elapsedHours >= 10) return "red";
  if (remainingHours <= 5 || elapsedHours >= 6) return "yellow";
  return "green";
}
