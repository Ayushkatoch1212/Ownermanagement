export function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}
export function monthLabel(value: string) {
  const [y, m] = value.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
export function paymentStatus(total: number, paid: number) {
  const due = Math.max(total - paid, 0);
  if (due === 0 && total > 0) return "completed";
  if (paid > 0) return "partial";
  return "pending";
}
