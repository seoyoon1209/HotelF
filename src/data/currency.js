// Display currency for the (foreign) hackathon demo.
// The backend stores monetary amounts in KRW; we convert to USD at a fixed
// rate purely for display so numbers read as realistic dollar values.
export const KRW_PER_USD = 1350; // 1 USD = 1,350 KRW

// Converts a KRW amount to a formatted USD string, e.g. 190000 -> "$141".
// Returns "-" for null/undefined/NaN so call sites don't need extra guards.
export function formatUSD(krwAmount) {
  if (krwAmount == null) return "-";
  const n = Number(krwAmount);
  if (Number.isNaN(n)) return "-";
  const usd = Math.round(n / KRW_PER_USD);
  return `$${usd.toLocaleString()}`;
}
