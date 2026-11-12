import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DashboardStats } from "./components/DashboardStats";
import { InventoryList } from "./components/InventoryList";
import { QuickDeductModal } from "./components/QuickDeductModal";
import { ItemFormModal } from "./components/ItemFormModal";
import { ReplenishModal } from "./components/ReplenishModal";
import { RestockBudgetPlanner, RestockItemPlan } from "./components/RestockBudgetPlanner";
import { PrintPurchaseRequestModal } from "./components/PrintPurchaseRequestModal";
import { UsageAuditLog } from "./components/UsageAuditLog";
import { ExcelImportModal } from "./components/ExcelImportModal";
import { StaffNotificationModal } from "./components/StaffNotificationModal";
import { ThemeSelectorModal } from "./components/ThemeSelectorModal";
import { StaffMember, EmailDispatchLog } from "./types/staff";
import { ThemePalette } from "./types/theme";
import { loadSavedTheme, saveTheme, applyThemeVariables } from "./utils/theme";
import {
  loadStaffMembers,
  saveStaffMembers,
  loadEmailLogs,
} from "./data/staffData";
import {
  loadItems,
  loadLogs,
  loadBudgetSettings,
  saveItem,
  deleteItem,
  batchImportItems,
  recordStockDeduct,
  recordStockReplenish,
  saveBudgetSettings,
  resetDatabase,
} from "./services/storage";
import { InventoryItem, UsageLog, BudgetSettings, ItemCategory } from "./types/inventory";
import { evaluateItemAlert } from "./utils/alerts";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function App() {
  // App Core State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>({
    category: "CHEMICAL",
    chemicalBudgetMYR: 5000,
    consumableBudgetMYR: 2500,
    combinedBudgetMYR: 10000,
    lastUpdated: new Date().toISOString(),
  });

  // UI State
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "restock" | "audit">("dashboard");
  const [userRole, setUserRole] = useState<"RA" | "PI">("RA");
  const [inventoryFilter, setInventoryFilter] = useState<{
    category?: ItemCategory;
    status?: string;
  }>({});
  const [restockDefaultTab, setRestockDefaultTab] = useState<ItemCategory | "COMBINED">("CHEMICAL");

  // Modals State
  const [deductTargetItem, setDeductTargetItem] = useState<InventoryItem | null>(null);
  const [isDeductOpen, setIsDeductOpen] = useState<boolean>(false);

  const [formTargetItem, setFormTargetItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const [replenishTargetItem, setReplenishTargetItem] = useState<InventoryItem | null>(null);
  const [isReplenishOpen, setIsReplenishOpen] = useState<boolean>(false);

  const [printOrderItems, setPrintOrderItems] = useState<RestockItemPlan[]>([]);
  const [printCategory, setPrintCategory] = useState<ItemCategory | "COMBINED">("CHEMICAL");
  const [printBudgetLimit, setPrintBudgetLimit] = useState<number>(5000);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  const [isExcelImportOpen, setIsExcelImportOpen] = useState<boolean>(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>([]);
  const [isStaffEmailOpen, setIsStaffEmailOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemePalette>(loadSavedTheme());
  const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Initial Load from LocalStorage
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    setCurrentTheme(savedTheme);
    applyThemeVariables(savedTheme);

    const loadedItems = loadItems();
    const loadedLogs = loadLogs();
    const loadedBudget = loadBudgetSettings();
    const loadedStaff = loadStaffMembers();
    const loadedEmailLogs = loadEmailLogs();
    setItems(loadedItems);
    setLogs(loadedLogs);
    setBudgetSettings(loadedBudget);
    setStaffList(loadedStaff);
    setEmailLogs(loadedEmailLogs);
  }, []);

  // Critical item count for badge in header
  const criticalCount = items.filter((item) => {
    const alert = evaluateItemAlert(item);
    return alert.severity === "CRITICAL";
  }).length;

  // Handlers for Stock Operations
  const handleConfirmDeduct = (params: {
    itemId: string;
    quantityUsed: number;
    researcherName: string;
    projectCode: string;
    notes?: string;
  }) => {
    try {
      const { updatedItems, newLog } = recordStockDeduct(params);
      setItems(updatedItems);
      setLogs((prev) => [newLog, ...prev]);
      showToast(
        `Berjaya tolak ${params.quantityUsed} unit "${newLog.itemName}" untuk kod projek ${params.projectCode}. Baki kini: ${newLog.balanceAfter} unit.`,
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "Ralat penolakan stok", "error");
      throw err;
    }
  };

  const handleConfirmReplenish = (itemId: string, qtyAdded: number) => {
    try {
      const updated = recordStockReplenish({ itemId, quantityAdded: qtyAdded });
      setItems(updated);
      const target = updated.find((i) => i.id === itemId);
      showToast(
        `Berjaya menambah +${qtyAdded} unit stok untuk "${target?.name}". Baki semasa: ${target?.currentQuantity} unit.`,
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "Ralat penambahan stok", "error");
    }
  };

  const handleSaveItem = (item: InventoryItem) => {
    const updated = saveItem(item);
    setItems(updated);
    showToast(
      formTargetItem
        ? `Rekod "${item.name}" berjaya dikemas kini.`
        : `Item baharu "${item.name}" berjaya didaftarkan ke dalam inventori.`,
      "success"
    );
  };

  const handleDeleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    if (confirm(`Adakah anda pasti mahu memadam "${target.name}" daripada sistem inventori?`)) {
      const updated = deleteItem(id);
      setItems(updated);
      showToast(`Item "${target.name}" telah dipadamkan.`, "success");
    }
  };

  const handleBatchImport = (importedItems: InventoryItem[], mode: "append" | "merge") => {
    try {
      const updated = batchImportItems(importedItems, mode);
      setItems(updated);
      showToast(
        `Berjaya mendaftarkan ${importedItems.length} item makmal baharu melalui fail Excel!`,
        "success"
      );
    } catch (err: any) {
      showToast("Ralat semasa memproses fail Excel.", "error");
    }
  };

  const handleResetData = () => {
    if (confirm("Adakah anda ingin menetapkan semula semua data kepada data contoh makmal R&D asal?")) {
      const { items: newItems, logs: newLogs, budget: newBudget } = resetDatabase();
      setItems(newItems);
      setLogs(newLogs);
      setBudgetSettings(newBudget);
      showToast("Data makmal berjaya ditetapkan semula ke konfigurasi asal.", "success");
    }
  };

  const handleUpdateBudget = (newSettings: BudgetSettings) => {
    setBudgetSettings(newSettings);
    saveBudgetSettings(newSettings);
  };

  // Navigation helpers from Dashboard
  const handleNavigateToInventory = (filter: { category?: ItemCategory; status?: string }) => {
    setInventoryFilter(filter);
    setActiveTab("inventory");
  };

  const handleNavigateToRestock = (cat?: ItemCategory) => {
    if (cat) setRestockDefaultTab(cat);
    setActiveTab("restock");
  };

  const handleOpenPrintPR = (
    orderItems: RestockItemPlan[],
    category: ItemCategory | "COMBINED",
    budgetLimit: number
  ) => {
    setPrintOrderItems(orderItems);
    setPrintCategory(category);
    setPrintBudgetLimit(budgetLimit);
    setIsPrintOpen(true);
  };

  const handleUpdateStaffList = (newStaffList: StaffMember[]) => {
    setStaffList(newStaffList);
    saveStaffMembers(newStaffList);
  };

  const handleSelectTheme = (theme: ThemePalette) => {
    setCurrentTheme(theme);
    saveTheme(theme);
    showToast(`Palet tema ditukar kepada "${theme.name}".`, "success");
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-2xl shadow-xl border animate-in slide-in-from-top-3 duration-200 flex items-start gap-3 bg-white border-slate-200">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-medium text-slate-800 leading-snug">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onResetData={handleResetData}
        onOpenStaffEmail={() => setIsStaffEmailOpen(true)}
        staffCount={staffList.length}
        criticalCount={criticalCount}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardStats
            items={items}
            onNavigateToRestock={handleNavigateToRestock}
            onNavigateToInventory={handleNavigateToInventory}
            onOpenAddItem={() => {
              setFormTargetItem(null);
              setIsFormOpen(true);
            }}
            onOpenExcelImport={() => setIsExcelImportOpen(true)}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryList
            items={items}
            initialFilter={inventoryFilter}
            onOpenDeduct={(item) => {
              setDeductTargetItem(item);
              setIsDeductOpen(true);
            }}
            onOpenEdit={(item) => {
              setFormTargetItem(item);
              setIsFormOpen(true);
            }}
            onOpenAdd={() => {
              setFormTargetItem(null);
              setIsFormOpen(true);
            }}
            onOpenExcelImport={() => setIsExcelImportOpen(true)}
            onReplenish={(item) => {
              setReplenishTargetItem(item);
              setIsReplenishOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === "restock" && (
          <RestockBudgetPlanner
            items={items}
            budgetSettings={budgetSettings}
            defaultCategoryTab={restockDefaultTab}
            onUpdateBudget={handleUpdateBudget}
            onOpenPrintPR={handleOpenPrintPR}
          />
        )}

        {activeTab === "audit" && <UsageAuditLog logs={logs} />}
      </main>

      {/* Lab Bench Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-mono print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-800">ChemLab Flow</span>
            <span aria-hidden="true"> · </span>
            <span>Lembaga Getah Malaysia (LGM) R&amp;D</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Ambang Stok ≤ 3 Unit <span aria-hidden="true">·</span> Ambang Luput ≤ 180 Hari <span aria-hidden="true">·</span> Siling Bajet ≤ RM 20,000
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuickDeductModal
        item={deductTargetItem}
        isOpen={isDeductOpen}
        onClose={() => {
          setIsDeductOpen(false);
          setDeductTargetItem(null);
        }}
        onConfirmDeduct={handleConfirmDeduct}
      />

      <ItemFormModal
        isOpen={isFormOpen}
        initialItem={formTargetItem}
        onClose={() => {
          setIsFormOpen(false);
          setFormTargetItem(null);
        }}
        onSave={handleSaveItem}
      />

      <ReplenishModal
        item={replenishTargetItem}
        isOpen={isReplenishOpen}
        onClose={() => {
          setIsReplenishOpen(false);
          setReplenishTargetItem(null);
        }}
        onConfirmReplenish={handleConfirmReplenish}
      />

      <PrintPurchaseRequestModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        orderItems={printOrderItems}
        category={printCategory}
        budgetLimit={printBudgetLimit}
      />

      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onImportItems={handleBatchImport}
      />

      <StaffNotificationModal
        isOpen={isStaffEmailOpen}
        onClose={() => setIsStaffEmailOpen(false)}
        items={items}
        staffList={staffList}
        onUpdateStaffList={handleUpdateStaffList}
        emailLogs={emailLogs}
        onUpdateEmailLogs={setEmailLogs}
        onShowToast={showToast}
      />

      <ThemeSelectorModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />
    </div>
  );
}
