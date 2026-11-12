import { InventoryItem, ItemAlertStatus } from "../types/inventory";

// Helper to compute days between today and expiry date
export function getDaysToExpiry(expiryDateStr: string, referenceDate: Date = new Date()): number {
  if (!expiryDateStr) return 9999;
  const expiry = new Date(expiryDateStr);
  const now = new Date(referenceDate);
  // Set both to start of day for clean calculation
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function evaluateItemAlert(item: InventoryItem, referenceDate: Date = new Date()): ItemAlertStatus {
  const minThreshold = item.minThreshold ?? 3;
  const isLowStock = item.currentQuantity <= minThreshold;
  const days = getDaysToExpiry(item.expiryDate, referenceDate);
  const isExpired = days < 0;
  const isExpiringSoon = !isExpired && days <= 180;

  let severity: "CRITICAL" | "WARNING" | "NORMAL" = "NORMAL";
  let label = "Stok Selamat";

  if (isExpired) {
    severity = "CRITICAL";
    label = `TELAH LUPUT (${Math.abs(days)} hari lepas)`;
  } else if (item.currentQuantity === 0) {
    severity = "CRITICAL";
    label = "STOK HABIS (0 unit)";
  } else if (isLowStock && isExpiringSoon) {
    severity = "CRITICAL";
    label = `Kritikal: Stok Rendah (${item.currentQuantity} unit) & Luput (${days} hari)`;
  } else if (isLowStock) {
    severity = item.currentQuantity <= 1 ? "CRITICAL" : "WARNING";
    label = `Stok Rendah (${item.currentQuantity} unit tinggal)`;
  } else if (isExpiringSoon) {
    severity = "WARNING";
    label = `Amaran Luput (${days} hari lagi)`;
  }

  return {
    isLowStock,
    isExpired,
    isExpiringSoon,
    daysToExpiry: days,
    severity,
    label,
  };
}

// Currency formatter for Ringgit Malaysia
export function formatMYR(amount: number): string {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

// Format readable date
export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
