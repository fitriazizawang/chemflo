import React from "react";
import {
  Boxes,
  Clock,
  CircleDollarSign,
  TestTube,
  Package,
  TrendingDown,
  ArrowRight,
  AlertOctagon,
  FileSpreadsheet,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { InventoryItem } from "../types/inventory";
import { evaluateItemAlert, formatMYR, formatDate } from "../utils/alerts";

interface DashboardStatsProps {
  items: InventoryItem[];
  onNavigateToRestock: (category?: "CHEMICAL" | "CONSUMABLE") => void;
  onNavigateToInventory: (filter: { category?: "CHEMICAL" | "CONSUMABLE"; status?: string }) => void;
  onOpenAddItem: () => void;
  onOpenExcelImport: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  items,
  onNavigateToRestock,
  onNavigateToInventory,
  onOpenAddItem,
  onOpenExcelImport,
}) => {
  // Aggregate metrics
  let lowStockCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  let totalInventoryValue = 0;

  let chemicalCount = 0;
  let chemicalValue = 0;
  let consumableCount = 0;
  let consumableValue = 0;

  const lowStockItems: InventoryItem[] = [];
  const expiringItems: InventoryItem[] = [];
  const expiredItems: InventoryItem[] = [];

  items.forEach((item) => {
    const alert = evaluateItemAlert(item);
    const itemTotalValue = item.currentQuantity * (item.unitPriceMYR || 0);
    totalInventoryValue += itemTotalValue;

    if (item.category === "CHEMICAL") {
      chemicalCount += 1;
      chemicalValue += itemTotalValue;
    } else {
      consumableCount += 1;
      consumableValue += itemTotalValue;
    }

    if (alert.isExpired) {
      expiredCount += 1;
      expiredItems.push(item);
    } else if (alert.isExpiringSoon) {
      expiringSoonCount += 1;
      expiringItems.push(item);
    }

    if (alert.isLowStock) {
      lowStockCount += 1;
      lowStockItems.push(item);
    }
  });

  // Deduplicate items so an item that is both expired and low-stock appears only once
  const criticalAttentionMap = new Map<string, InventoryItem>();
  expiredItems.forEach((item) => criticalAttentionMap.set(item.id, item));
  lowStockItems.forEach((item) => criticalAttentionMap.set(item.id, item));
  const criticalAttentionList = Array.from(criticalAttentionMap.values()).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Precision Workspace Header Strip */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>Lembaga Getah Malaysia R&D</span>
              <span aria-hidden="true">·</span>
              <span>Pemantauan Inventori Masa Nyata</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-700">Ambang: ≤ 3 unit &amp; ≤ 180 hari</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Pusat Kawalan Stok &amp; Integriti Reagen Makmal
            </h2>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenAddItem}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Daftar Item (AI Vision)</span>
            </button>

            <button
              type="button"
              onClick={onOpenExcelImport}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 shadow-xs transition-colors whitespace-nowrap"
              title="Daftar item makmal melalui fail Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Import Excel</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToRestock()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors whitespace-nowrap"
            >
              <span>Perancang Bajet</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Calibrated Metric Tiles with Typographic Math */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Total Inventory */}
        <div
          onClick={() => onNavigateToInventory({})}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>JUMLAH REKOD</span>
            <Boxes className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {items.length}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
            <span>{chemicalCount} Kimia</span>
            <span aria-hidden="true">·</span>
            <span>{consumableCount} Guna Habis</span>
          </div>
        </div>

        {/* Tile 2: Low Stock Warning (≤ 3 units) */}
        <div
          onClick={() => onNavigateToInventory({ status: "low" })}
          className={`rounded-xl p-4 sm:p-5 border transition-colors cursor-pointer group ${
            lowStockCount > 0
              ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
              : "bg-white border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <span className={lowStockCount > 0 ? "text-rose-700" : "text-slate-500"}>
              STOK RENDAH (≤ 3 UNIT)
            </span>
            <TrendingDown className={`w-4 h-4 ${lowStockCount > 0 ? "text-rose-600" : "text-slate-400"}`} />
          </div>
          <div className={`text-3xl font-bold font-mono tabular-nums ${lowStockCount > 0 ? "text-rose-700" : "text-slate-900"}`}>
            {lowStockCount}
          </div>
          <div className="text-xs mt-2 text-slate-500">
            {lowStockCount > 0 ? (
              <span className="text-rose-600 font-medium">Perlu pesanan semula segera</span>
            ) : (
              "Semua paras stok mencukupi"
            )}
          </div>
        </div>

        {/* Tile 3: Expiry Warning (≤ 180 days & Expired) */}
        <div
          onClick={() => onNavigateToInventory({ status: "expiring" })}
          className={`rounded-xl p-4 sm:p-5 border transition-colors cursor-pointer group ${
            expiredCount > 0
              ? "bg-red-50/40 border-red-200 hover:border-red-300"
              : expiringSoonCount > 0
              ? "bg-amber-50/40 border-amber-200 hover:border-amber-300"
              : "bg-white border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <span className={expiredCount > 0 ? "text-red-700" : expiringSoonCount > 0 ? "text-amber-800" : "text-slate-500"}>
              INTEGRITI LUPUT (≤ 180 HARI)
            </span>
            <Clock className={`w-4 h-4 ${expiredCount > 0 ? "text-red-600" : expiringSoonCount > 0 ? "text-amber-600" : "text-slate-400"}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${expiredCount > 0 ? "text-red-700" : expiringSoonCount > 0 ? "text-amber-800" : "text-slate-900"}`}>
              {expiringSoonCount + expiredCount}
            </span>
            {expiredCount > 0 && (
              <span className="text-xs font-mono font-semibold text-red-700">
                ({expiredCount} luput)
              </span>
            )}
          </div>
          <div className="text-xs mt-2 text-slate-500">
            {expiredCount > 0 ? (
              <span className="text-red-700 font-medium">Bahan luput diasingkan</span>
            ) : expiringSoonCount > 0 ? (
              <span className="text-amber-700 font-medium">Tamat tempoh dalam 6 bulan</span>
            ) : (
              "Semua reagen sah digunakan"
            )}
          </div>
        </div>

        {/* Tile 4: Total Inventory Valuation */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
            <span>NILAI KESELURUHAN INVENTORI</span>
            <CircleDollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums truncate">
            {formatMYR(totalInventoryValue)}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-2 truncate">
            <span>Kimia: {formatMYR(chemicalValue)}</span>
            <span aria-hidden="true">·</span>
            <span>Alatan: {formatMYR(consumableValue)}</span>
          </div>
        </div>
      </div>

      {/* Category Restock Shortcuts (Separated Chemical vs Consumable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chemical Stream */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <TestTube className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Pesanan Reagen &amp; Bahan Kimia</h3>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">· Kod Geran</span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Pelarut analitikal, asid gred AR, reagen berjadual &amp; garam makmal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToRestock("CHEMICAL")}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Rancang (≤ RM20k)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Consumable Stream */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
              <Package className="w-5 h-5 text-teal-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Pesanan Alatan Guna Habis</h3>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">· Akaun Operasi</span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Sarung tangan nitril, tiub Falcon, mikropenitis, piring petri &amp; turas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToRestock("CONSUMABLE")}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Rancang (≤ RM20k)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Critical Attention Workbench Table (Structured, high-density scientific table) */}
      {criticalAttentionList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <h3 className="font-bold text-slate-900 text-sm">
                Spesimen Makmal Memerlukan Tindakan Segera ({criticalAttentionList.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                · Baki ≤ 3 Unit atau Menghampiri Tarikh Luput
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToInventory({ status: "critical" })}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white">
                  <th className="py-3 px-4">Bahan / Spesifikasi</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Lokasi Rak</th>
                  <th className="py-3 px-3 text-right">Baki Semasa</th>
                  <th className="py-3 px-3">Status Integriti</th>
                  <th className="py-3 px-3 text-right">Harga Seunit</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalAttentionList.map((item) => {
                  const alert = evaluateItemAlert(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.brand} <span aria-hidden="true">·</span> {item.specPackaging}
                          {item.supplierName && (
                            <>
                              <span aria-hidden="true"> · </span>
                              <span>{item.supplierName}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {item.category === "CHEMICAL" ? "Bahan Kimia" : "Guna Habis"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">
                        {item.location || "-"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap font-bold">
                        <span className={item.currentQuantity <= item.minThreshold ? "text-rose-600" : "text-slate-900"}>
                          {item.currentQuantity} unit
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          min: {item.minThreshold}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-700">
                          {formatDate(item.expiryDate)}
                        </div>
                        <div
                          className={`text-[11px] font-semibold ${
                            alert.isExpired
                              ? "text-red-700"
                              : alert.isExpiringSoon
                              ? "text-amber-700"
                              : alert.isLowStock
                              ? "text-rose-600"
                              : "text-slate-500"
                          }`}
                        >
                          {alert.label}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 font-semibold whitespace-nowrap">
                        {formatMYR(item.unitPriceMYR)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onNavigateToRestock(item.category)}
                          className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
                        >
                          Pesanan Semula
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
