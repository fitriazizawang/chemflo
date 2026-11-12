import { InventoryItem, UsageLog, BudgetSettings } from "../types/inventory";
import { INITIAL_ITEMS, INITIAL_LOGS, INITIAL_BUDGET } from "../data/seedData";

const ITEMS_KEY = "chemlab_inventory_items_v1";
const LOGS_KEY = "chemlab_usage_logs_v1";
const BUDGET_KEY = "chemlab_budget_settings_v1";

export function loadItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading items from localStorage:", err);
    return INITIAL_ITEMS;
  }
}

export function saveAllItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving items to localStorage:", err);
  }
}

export function saveItem(item: InventoryItem): InventoryItem[] {
  const items = loadItems();
  const index = items.findIndex((i) => i.id === item.id);
  const now = new Date().toISOString();

  let updated: InventoryItem[];
  if (index >= 0) {
    updated = [...items];
    updated[index] = { ...item, updatedAt: now };
  } else {
    const newItem = {
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: now,
      updatedAt: now,
    };
    updated = [newItem, ...items];
  }

  saveAllItems(updated);
  return updated;
}

export function deleteItem(id: string): InventoryItem[] {
  const items = loadItems();
  const updated = items.filter((i) => i.id !== id);
  saveAllItems(updated);
  return updated;
}

export function batchImportItems(
  newItems: InventoryItem[],
  mode: "append" | "merge" = "append"
): InventoryItem[] {
  const currentItems = loadItems();
  let updated: InventoryItem[];

  if (mode === "merge") {
    // Merge or update items matching existing item name
    const itemMap = new Map<string, InventoryItem>();
    currentItems.forEach((i) => itemMap.set(i.name.toLowerCase().trim(), i));
    newItems.forEach((i) => {
      const key = i.name.toLowerCase().trim();
      const existing = itemMap.get(key);
      if (existing) {
        itemMap.set(key, { ...existing, ...i, id: existing.id, updatedAt: new Date().toISOString() });
      } else {
        itemMap.set(key, i);
      }
    });
    updated = Array.from(itemMap.values());
  } else {
    // Append to list
    updated = [...newItems, ...currentItems];
  }

  saveAllItems(updated);
  return updated;
}

export function loadLogs(): UsageLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading logs from localStorage:", err);
    return INITIAL_LOGS;
  }
}

export function saveAllLogs(logs: UsageLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error("Error saving logs to localStorage:", err);
  }
}

// Quick Deduct transaction enforcing the Zero Balance Rule
export function recordStockDeduct(params: {
  itemId: string;
  quantityUsed: number;
  researcherName: string;
  projectCode: string;
  notes?: string;
}): { updatedItems: InventoryItem[]; newLog: UsageLog } {
  const items = loadItems();
  const targetIndex = items.findIndex((i) => i.id === params.itemId);

  if (targetIndex === -1) {
    throw new Error("Ralat: Item tidak ditemui dalam sistem inventori.");
  }

  const currentItem = items[targetIndex];

  if (params.quantityUsed <= 0) {
    throw new Error("Ralat: Kuantiti penggunaan mestilah sekurang-kurangnya 1 unit.");
  }

  // PRD Section 13 Business Rule: Peraturan Baki Sifar
  if (params.quantityUsed > currentItem.currentQuantity) {
    throw new Error(
      `Ralat: Baki stok tidak mencukupi untuk penolakan ini. Baki semasa hanya ${currentItem.currentQuantity} unit.`
    );
  }

  const balanceAfter = currentItem.currentQuantity - params.quantityUsed;
  const now = new Date().toISOString();

  // Update item
  const updatedItem: InventoryItem = {
    ...currentItem,
    currentQuantity: balanceAfter,
    updatedAt: now,
  };

  const updatedItems = [...items];
  updatedItems[targetIndex] = updatedItem;
  saveAllItems(updatedItems);

  // Create audit log
  const newLog: UsageLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    itemId: currentItem.id,
    itemName: currentItem.name,
    category: currentItem.category,
    quantityUsed: params.quantityUsed,
    balanceAfter,
    researcherName: params.researcherName.trim(),
    projectCode: params.projectCode.trim(),
    notes: params.notes?.trim() || "",
    timestamp: now,
  };

  const currentLogs = loadLogs();
  const updatedLogs = [newLog, ...currentLogs];
  saveAllLogs(updatedLogs);

  return { updatedItems, newLog };
}

// Add stock / Restock replenishment
export function recordStockReplenish(params: {
  itemId: string;
  quantityAdded: number;
}): InventoryItem[] {
  const items = loadItems();
  const targetIndex = items.findIndex((i) => i.id === params.itemId);

  if (targetIndex === -1) {
    throw new Error("Item tidak ditemui.");
  }

  const current = items[targetIndex];
  const newQty = current.currentQuantity + Math.max(1, params.quantityAdded);
  const now = new Date().toISOString();

  const updatedItems = [...items];
  updatedItems[targetIndex] = {
    ...current,
    currentQuantity: newQty,
    updatedAt: now,
  };

  saveAllItems(updatedItems);
  return updatedItems;
}

export function loadBudgetSettings(): BudgetSettings {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw) {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(INITIAL_BUDGET));
      return INITIAL_BUDGET;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading budget settings:", err);
    return INITIAL_BUDGET;
  }
}

export function saveBudgetSettings(settings: BudgetSettings): void {
  try {
    const updated = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(BUDGET_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error saving budget settings:", err);
  }
}

// Reset database to initial seed data
export function resetDatabase(): { items: InventoryItem[]; logs: UsageLog[]; budget: BudgetSettings } {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
  localStorage.setItem(BUDGET_KEY, JSON.stringify(INITIAL_BUDGET));
  return {
    items: INITIAL_ITEMS,
    logs: INITIAL_LOGS,
    budget: INITIAL_BUDGET,
  };
}

// CSV export utility with proper quoting and UTF-8 BOM for Microsoft Excel compatibility
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCSV = (val: string | number) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  // UTF-8 BOM so Microsoft Excel renders Malay characters and accents cleanly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
