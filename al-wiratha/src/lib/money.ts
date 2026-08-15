/**
 * Money utilities — all monetary flows are stored as integer halalas.
 * Floats never touch stored amounts; they exist only at the input/display edge.
 */

export function riyalsToHalalas(riyals: number): number {
  return Math.round(riyals * 100);
}

export function halalasToRiyals(halalas: number): number {
  return halalas / 100;
}

export function formatHalalas(halalas: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(halalas / 100);
}

export interface ShareFraction {
  shareNumerator: number;
  shareDenominator: number;
}

/**
 * Largest-remainder distribution using the EXACT sharia fractions.
 * Guarantees: sum(result) === totalHalalas — not a single halala is lost.
 *
 * مثال: 10,000 ريال على ثلاثة ورثة بثلث لكلٍّ =
 * 333,333 + 333,333 + 333,334 هللة — المجموع يساوي الأصل تماماً.
 */
export function distributeHalalas(totalHalalas: number, shares: ShareFraction[]): number[] {
  if (shares.length === 0) return [];

  const exact = shares.map(
    (s) => (totalHalalas * s.shareNumerator) / s.shareDenominator
  );
  const floors = exact.map(Math.floor);
  let remainder = totalHalalas - floors.reduce((a, b) => a + b, 0);

  // Hand the leftover halalas to the largest fractional remainders first.
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floors];
  for (const { i } of order) {
    if (remainder <= 0) break;
    result[i] += 1;
    remainder -= 1;
  }
  return result;
}
