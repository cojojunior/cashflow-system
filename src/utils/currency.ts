const ghsFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(
  amount: number | string | null | undefined,
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num === null || num === undefined || Number.isNaN(num)) {
    return "GH₵ 0.00";
  }
  return ghsFormatter.format(num).replace("GH₵", "GH₵ ");
}

export function formatCurrencyCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `GH₵ ${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `GH₵ ${(amount / 1_000).toFixed(1)}k`;
  return formatCurrency(amount);
}
