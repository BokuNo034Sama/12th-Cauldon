export const platformName = "12th Cauldron";

export function formatMinorCurrency(amountMinor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    currency,
    style: "currency",
  }).format(amountMinor / 100);
}
