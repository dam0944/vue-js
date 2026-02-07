export function money(amount, currency = "USD") {
  const n = Number(amount || 0);
  if (currency === "KHR") return `${n.toLocaleString()}៛`;
  return `$${n.toFixed(2)}`;
}