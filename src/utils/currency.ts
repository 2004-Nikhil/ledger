// Single default currency for now. Multi-currency was flagged as a
// "decide early" gap in the feature plan — deliberately not solved
// here; retrofitting later means changing this one function's signature
// plus adding a currency field to Account, not touching every screen.
const CURRENCY_SYMBOL = "\u20B9"; // ₹

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}${CURRENCY_SYMBOL}${Math.abs(amount).toFixed(3)}`;
}
