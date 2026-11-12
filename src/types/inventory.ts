export type ItemCategory = "CHEMICAL" | "CONSUMABLE";

export type HazardTag =
  | "FLAMMABLE"
  | "CORROSIVE"
  | "TOXIC"
  | "GENERAL_NON_HAZARDOUS";

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  brand: string;
  specPackaging: string;
  currentQuantity: number;
  minThreshold: number; // default: 3
  expiryDate: string; // YYYY-MM-DD
  supplierName: string;
  unitPriceMYR: number;
  hazardTag: HazardTag;
  imageUrl?: string;
  location?: string;
  safetyNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLog {
  id: string;
  itemId: string;
  itemName: string;
  category: ItemCategory;
  quantityUsed: number;
  balanceAfter: number;
  researcherName: string;
  projectCode: string;
  notes?: string;
  timestamp: string; // ISO string
}

export interface BudgetSettings {
  category: "CHEMICAL" | "CONSUMABLE" | "COMBINED";
  chemicalBudgetMYR: number; // 0 - 20,000
  consumableBudgetMYR: number; // 0 - 20,000
  combinedBudgetMYR: number; // 0 - 20,000
  lastUpdated: string;
}

export interface RestockOrderItem {
  itemId: string;
  itemName: string;
  category: ItemCategory;
  brand: string;
  specPackaging: string;
  currentQuantity: number;
  suggestedRestockQty: number;
  orderQuantity: number;
  unitPriceMYR: number;
  supplierName: string;
  reason: "OUT_OF_STOCK" | "LOW_STOCK" | "EXPIRED" | "EXPIRING_SOON";
  selected: boolean;
}

export type AlertSeverity = "CRITICAL" | "WARNING" | "NORMAL";

export interface ItemAlertStatus {
  isLowStock: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysToExpiry: number;
  severity: AlertSeverity;
  label: string;
}
