import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Sliders,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  CheckSquare,
  Square,
  TestTube,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";
import { InventoryItem, ItemCategory, BudgetSettings } from "../types/inventory";
import { evaluateItemAlert, formatMYR } from "../utils/alerts";
import { downloadCSV } from "../services/storage";

interface RestockBudgetPlannerProps {
  items: InventoryItem[];
  budgetSettings: BudgetSettings;
  onUpdateBudget: (newSettings: BudgetSettings) => void;
  onOpenPrintPR: (orderItems: RestockItemPlan[], category: ItemCategory | "COMBINED", budgetLimit: number) => void;
  defaultCategoryTab?: ItemCategory | "COMBINED";
}

export interface RestockItemPlan {
  item: InventoryItem;
  orderQuantity: number;
  unitPrice: number;
  subtotal: number;
  reason: string;
  selected: boolean;
}

export const RestockBudgetPlanner: React.FC<RestockBudgetPlannerProps> = ({
  items,
  budgetSettings,
  onUpdateBudget,
  onOpenPrintPR,
  defaultCategoryTab = "CHEMICAL",
}) => {
  // AC-05: Tab Notifikasi Restock memisahkan sepenuhnya senarai Kimia dan senarai Consumables
  const [activeCategoryTab, setActiveCategoryTab] = useState<ItemCategory | "COMBINED">(
    defaultCategoryTab
  );

  // Budget slider limits up to RM20,000 (FR-006, AC-06)
  const [chemicalBudget, setChemicalBudget] = useState<number>(
    budgetSettings.chemicalBudgetMYR ?? 5000
  );
  const [consumableBudget, setConsumableBudget] = useState<number>(
    budgetSettings.consumableBudgetMYR ?? 2500
  );
  const [combinedBudget, setCombinedBudget] = useState<number>(
    budgetSettings.combinedBudgetMYR ?? 10000
  );

  // Candidate items requiring restock (stock <= minThreshold OR expired OR expiring soon <= 180 days)
  const restockCandidates = useMemo(() => {
    return items
      .filter((item) => {
        const alert = evaluateItemAlert(item);
        return alert.isLowStock || alert.isExpired || alert.isExpiringSoon;
      })
      .map((item) => {
        const alert = evaluateItemAlert(item);
        let reason = "Stok Rendah";
        let defaultQty = Math.max(2, (item.minThreshold || 3) * 2 - item.currentQuantity);

        if (alert.isExpired) {
          reason = "TELAH LUPUT (Ganti Baru)";
          defaultQty = Math.max(2, item.minThreshold || 3);
        } else if (item.currentQuantity === 0) {
          reason = "STOK HABIS (0 unit)";
          defaultQty = Math.max(3, item.minThreshold || 3);
        } else if (alert.isExpiringSoon) {
          reason = `Luput dlm ${alert.daysToExpiry}h`;
          defaultQty = Math.max(1, item.minThreshold || 3);
        }

        return {
          item,
          orderQuantity: defaultQty,
          unitPrice: item.unitPriceMYR,
          subtotal: defaultQty * item.unitPriceMYR,
          reason,
          selected: true,
        } as RestockItemPlan;
      });
  }, [items]);

  // Keep local selection and quantities state
  const [orderPlans, setOrderPlans] = useState<Record<string, { selected: boolean; qty: number }>>({});

  // Sync candidate plans
  const currentCategoryPlans = useMemo(() => {
    return restockCandidates
      .filter((plan) => {
        if (activeCategoryTab === "COMBINED") return true;
        return plan.item.category === activeCategoryTab;
      })
      .map((plan) => {
        const custom = orderPlans[plan.item.id];
        const isSelected = custom !== undefined ? custom.selected : plan.selected;
        const qty = custom !== undefined ? custom.qty : plan.orderQuantity;
        return {
          ...plan,
          selected: isSelected,
          orderQuantity: qty,
          subtotal: qty * plan.unitPrice,
        };
      });
  }, [restockCandidates, activeCategoryTab, orderPlans]);

  // Active budget limit based on category tab
  const activeBudgetLimit =
    activeCategoryTab === "CHEMICAL"
      ? chemicalBudget
      : activeCategoryTab === "CONSUMABLE"
      ? consumableBudget
      : combinedBudget;

  const handleBudgetChange = (newVal: number) => {
    const clamped = Math.min(20000, Math.max(0, newVal));
    if (activeCategoryTab === "CHEMICAL") {
      setChemicalBudget(clamped);
      onUpdateBudget({ ...budgetSettings, chemicalBudgetMYR: clamped });
    } else if (activeCategoryTab === "CONSUMABLE") {
      setConsumableBudget(clamped);
      onUpdateBudget({ ...budgetSettings, consumableBudgetMYR: clamped });
    } else {
      setCombinedBudget(clamped);
      onUpdateBudget({ ...budgetSettings, combinedBudgetMYR: clamped });
    }
  };

  // Calculations: Total cost, remaining, percentage
  const selectedItems = currentCategoryPlans.filter((p) => p.selected);
  const totalEstimatedCost = selectedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const remainingBudget = activeBudgetLimit - totalEstimatedCost;
  const isOverBudget = totalEstimatedCost > activeBudgetLimit;
  const budgetPercentage = activeBudgetLimit > 0 ? (totalEstimatedCost / activeBudgetLimit) * 100 : 0;

  // Toggle selection
  const toggleSelect = (itemId: string) => {
    setOrderPlans((prev) => {
      const current = prev[itemId] || {
        selected: true,
        qty: restockCandidates.find((c) => c.item.id === itemId)?.orderQuantity || 2,
      };
      return {
        ...prev,
        [itemId]: { ...current, selected: !current.selected },
      };
    });
  };

  // Select / Deselect all
  const toggleAll = (select: boolean) => {
    setOrderPlans((prev) => {
      const next = { ...prev };
      currentCategoryPlans.forEach((p) => {
        const cur = next[p.item.id] || { selected: true, qty: p.orderQuantity };
        next[p.item.id] = { ...cur, selected: select };
      });
      return next;
    });
  };

  // Update order quantity
  const updateQty = (itemId: string, newQty: number) => {
    const validQty = Math.max(1, newQty);
    setOrderPlans((prev) => {
      const current = prev[itemId] || { selected: true, qty: validQty };
      return {
        ...prev,
        [itemId]: { ...current, qty: validQty },
      };
    });
  };

  // Export Restock List to CSV (FR-007, AC-07)
  const handleExportCSV = () => {
    const headers = [
      "No",
      "Kategori",
      "Nama Item",
      "Jenama",
      "Spesifikasi/Pakej",
      "Sebab Pembelian",
      "Baki Semasa",
      "Kuantiti Dipesan",
      "Harga Seunit (RM)",
      "Jumlah Anggaran (RM)",
      "Pembekal Dicadangkan",
    ];

    const rows = selectedItems.map((plan, idx) => [
      idx + 1,
      plan.item.category === "CHEMICAL" ? "Bahan Kimia" : "Consumable",
      plan.item.name,
      plan.item.brand,
      plan.item.specPackaging,
      plan.reason,
      plan.item.currentQuantity,
      plan.orderQuantity,
      plan.unitPrice.toFixed(2),
      plan.subtotal.toFixed(2),
      plan.item.supplierName,
    ]);

    rows.push([
      "",
      "",
      "JUMLAH ANGGARAN KOS KESELURUHAN",
      "",
      "",
      "",
      "",
      selectedItems.reduce((a, b) => a + b.orderQuantity, 0),
      "",
      totalEstimatedCost.toFixed(2),
      `Had Bajet: RM ${activeBudgetLimit.toFixed(2)} | Baki: RM ${remainingBudget.toFixed(2)}`,
    ]);

    const filename = `ChemLab_Pesanan_Semula_${activeCategoryTab}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    downloadCSV(filename, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Precision Instrument Strip */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>Perancangan Perolehan Geran R&D</span>
              <span aria-hidden="true">·</span>
              <span>Pematuhan Kod Akaun Berasingan</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-700">Had Maksimum: RM 20,000</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Perancangan Pembelian Semula &amp; Kawalan Bajet
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors disabled:opacity-40"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Eksport CSV</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPrintPR(selectedItems, activeCategoryTab, activeBudgetLimit)}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-40"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Jana Borang Pesanan (PR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Segmented Controls (Strict AC-05 Separation) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveCategoryTab("CHEMICAL")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-2 ${
              activeCategoryTab === "CHEMICAL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TestTube className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bahan Kimia &amp; Reagen</span>
            <span className="font-mono text-[11px] text-slate-500">
              ({restockCandidates.filter((c) => c.item.category === "CHEMICAL").length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryTab("CONSUMABLE")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-2 ${
              activeCategoryTab === "CONSUMABLE"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-teal-600" />
            <span>Consumables &amp; Alatan</span>
            <span className="font-mono text-[11px] text-slate-500">
              ({restockCandidates.filter((c) => c.item.category === "CONSUMABLE").length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategoryTab("COMBINED")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
              activeCategoryTab === "COMBINED"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Gabungan</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:inline">
          Format diasingkan bagi pematuhan kod perolehan R&amp;D
        </div>
      </div>

      {/* Interactive Budget Slider Card (RM0 to RM20,000) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Had Peruntukan Bajet (
                {activeCategoryTab === "CHEMICAL"
                  ? "Akaun Bahan Kimia"
                  : activeCategoryTab === "CONSUMABLE"
                  ? "Akaun Consumables"
                  : "Akaun Gabungan"}
                )
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Tetapkan siling had bajet sehingga RM20,000 bagi perolehan ini.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5">
            {[2500, 5000, 10000, 15000, 20000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleBudgetChange(preset)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  activeBudgetLimit === preset
                    ? "bg-slate-900 text-white font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                RM{(preset / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Slider Input with Exact Numeric Entry */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>RM 0 (Min)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-700 font-sans font-medium">Siling Dipilih:</span>
              <div className="relative">
                <span className="absolute left-2 top-1 font-mono text-xs text-slate-400">RM</span>
                <input
                  type="number"
                  min="0"
                  max="20000"
                  step="100"
                  value={activeBudgetLimit}
                  onChange={(e) => handleBudgetChange(Number(e.target.value))}
                  className="w-28 pl-7 pr-2 py-1 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded focus:border-slate-800 text-right focus:outline-hidden"
                />
              </div>
            </div>
            <span className="font-bold text-slate-900">RM 20,000 (Maks)</span>
          </div>

          <input
            type="range"
            min="0"
            max="20000"
            step="100"
            value={activeBudgetLimit}
            onChange={(e) => handleBudgetChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
        </div>

        {/* Real-time Budget Metrics Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Estimated Total */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500 uppercase">
              Anggaran Jumlah Pesanan
            </span>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatMYR(totalEstimatedCost)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {selectedItems.length} item dipilih ({selectedItems.reduce((a, b) => a + b.orderQuantity, 0)} unit)
            </div>
          </div>

          {/* Remaining Budget */}
          <div
            className={`p-3 rounded-lg border ${
              isOverBudget
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-emerald-50/60 border-emerald-200 text-emerald-950"
            }`}
          >
            <span className="text-[11px] font-mono uppercase">
              {isOverBudget ? "Defisit Lebihan Bajet" : "Baki Bajet Perolehan"}
            </span>
            <div className="text-xl font-bold font-mono tabular-nums mt-0.5">
              {formatMYR(Math.abs(remainingBudget))}
            </div>
            <div className="text-[11px] font-medium font-mono mt-0.5">
              {isOverBudget
                ? `Lebih had: ${formatMYR(Math.abs(remainingBudget))}`
                : `Baki tersedia: ${formatMYR(remainingBudget)}`}
            </div>
          </div>

          {/* Budget Utilization */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
              <span>Penggunaan Bajet</span>
              <span className={`font-bold tabular-nums ${isOverBudget ? "text-rose-600" : "text-emerald-700"}`}>
                {budgetPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  isOverBudget
                    ? "bg-rose-600"
                    : budgetPercentage > 85
                    ? "bg-amber-500"
                    : "bg-emerald-600"
                }`}
                style={{ width: `${Math.min(100, budgetPercentage)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Siling: {formatMYR(activeBudgetLimit)}
            </div>
          </div>
        </div>

        {/* Warning if over budget */}
        {isOverBudget && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <strong>Amaran Had Bajet:</strong> Anggaran ({formatMYR(totalEstimatedCost)}) melebihi siling geran ({formatMYR(activeBudgetLimit)}). Sila laraskan kuantiti pesanan.
            </div>
          </div>
        )}
      </div>

      {/* Restock Candidate Items Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => toggleAll(selectedItems.length !== currentCategoryPlans.length)}
            className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900"
          >
            {selectedItems.length === currentCategoryPlans.length && currentCategoryPlans.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-slate-900" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              Pilih Semua ({selectedItems.length}/{currentCategoryPlans.length})
            </span>
          </button>

          <span className="text-slate-500 font-mono text-[11px]">
            Harga seunit pembekal dijana oleh rekod makmal &amp; AI
          </span>
        </div>

        {currentCategoryPlans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Tiada Item Perlu Dipesan Semula
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Semua item dalam kategori ini berada pada paras selamat (&gt; 3 unit) dan tidak menghampiri tarikh luput.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 w-10 text-center">Pilih</th>
                  <th className="py-3 px-3">Item Makmal</th>
                  <th className="py-3 px-3">Sebab Pesanan</th>
                  <th className="py-3 px-3 text-right">Baki Semasa</th>
                  <th className="py-3 px-3 text-center">Kuantiti Beli</th>
                  <th className="py-3 px-3 text-right">Harga Seunit</th>
                  <th className="py-3 px-3 text-right font-bold">Subtotal (RM)</th>
                  <th className="py-3 px-4">Pembekal Rujukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentCategoryPlans.map((plan) => {
                  const alert = evaluateItemAlert(plan.item);

                  return (
                    <tr
                      key={plan.item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        plan.selected ? "bg-white" : "bg-slate-50/40 opacity-60"
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={plan.selected}
                          onChange={() => toggleSelect(plan.item.id)}
                          className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 text-sm">
                          {plan.item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {plan.item.brand} <span aria-hidden="true">·</span> {plan.item.specPackaging}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            alert.isExpired
                              ? "text-red-700"
                              : alert.isLowStock
                              ? "text-rose-600"
                              : "text-amber-700"
                          }`}
                        >
                          {plan.reason}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono tabular-nums font-bold">
                        <span className={plan.item.currentQuantity <= 3 ? "text-rose-600" : "text-slate-700"}>
                          {plan.item.currentQuantity} unit
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQty(plan.item.id, plan.orderQuantity - 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={plan.orderQuantity}
                            onChange={(e) => updateQty(plan.item.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center font-mono font-bold px-1 py-0.5 border border-slate-300 rounded text-xs focus:border-slate-800 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(plan.item.id, plan.orderQuantity + 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono tabular-nums text-slate-700">
                        {formatMYR(plan.unitPrice)}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono tabular-nums font-bold text-slate-900">
                        {formatMYR(plan.subtotal)}
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-xs font-mono truncate max-w-[150px]">
                        {plan.item.supplierName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
