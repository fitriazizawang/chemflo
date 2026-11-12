import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  MinusCircle,
  PlusCircle,
  Edit2,
  Trash2,
  Download,
  FileSpreadsheet,
  TestTube,
  Package,
  MapPin,
  Flame,
  AlertTriangle,
  Skull,
  Shield,
  Layers,
} from "lucide-react";
import { InventoryItem, ItemCategory, HazardTag } from "../types/inventory";
import { evaluateItemAlert, formatMYR, formatDate } from "../utils/alerts";
import { downloadCSV } from "../services/storage";

interface InventoryListProps {
  items: InventoryItem[];
  onOpenDeduct: (item: InventoryItem) => void;
  onOpenEdit: (item: InventoryItem) => void;
  onOpenAdd: () => void;
  onOpenExcelImport: () => void;
  onReplenish: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  initialFilter?: { category?: ItemCategory; status?: string };
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  onOpenDeduct,
  onOpenEdit,
  onOpenAdd,
  onOpenExcelImport,
  onReplenish,
  onDeleteItem,
  initialFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "ALL">(
    initialFilter?.category || "ALL"
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialFilter?.status || "ALL"
  );
  const [selectedHazard, setSelectedHazard] = useState<HazardTag | "ALL">("ALL");

  // Filtered Items logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }

      // Hazard filter (only relevant for chemicals)
      if (selectedHazard !== "ALL" && item.hazardTag !== selectedHazard) {
        return false;
      }

      // Status filter
      const alert = evaluateItemAlert(item);
      if (selectedStatus === "low" && !alert.isLowStock) return false;
      if (selectedStatus === "expiring" && !alert.isExpiringSoon) return false;
      if (selectedStatus === "expired" && !alert.isExpired) return false;
      if (selectedStatus === "critical" && alert.severity !== "CRITICAL") return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchBrand = item.brand.toLowerCase().includes(query);
        const matchSpec = item.specPackaging.toLowerCase().includes(query);
        const matchSupplier = item.supplierName.toLowerCase().includes(query);
        const matchLocation = (item.location || "").toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchSpec && !matchSupplier && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, selectedHazard, selectedStatus, searchQuery]);

  // Export full inventory to CSV (AC-07)
  const handleExportCSV = () => {
    const headers = [
      "ID Item",
      "Nama Item",
      "Kategori",
      "Jenama",
      "Spesifikasi/Pakej",
      "Baki Kuantiti",
      "Had Minimum",
      "Tarikh Luput",
      "Status Amaran",
      "Pembekal",
      "Harga Seunit (RM)",
      "Jumlah Nilai (RM)",
      "Hazard Tag",
      "Lokasi",
    ];

    const rows = items.map((item) => {
      const alert = evaluateItemAlert(item);
      return [
        item.id,
        item.name,
        item.category === "CHEMICAL" ? "Bahan Kimia" : "Consumable",
        item.brand,
        item.specPackaging,
        item.currentQuantity,
        item.minThreshold,
        item.expiryDate,
        alert.label,
        item.supplierName,
        item.unitPriceMYR.toFixed(2),
        (item.currentQuantity * item.unitPriceMYR).toFixed(2),
        item.hazardTag,
        item.location || "-",
      ];
    });

    const filename = `ChemLab_Inventori_Penuh_${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(filename, headers, rows);
  };

  const renderHazardLabel = (hazard: HazardTag) => {
    switch (hazard) {
      case "FLAMMABLE":
        return (
          <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Mudah Terbakar</span>
          </span>
        );
      case "CORROSIVE":
        return (
          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Menghakis</span>
          </span>
        );
      case "TOXIC":
        return (
          <span className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
            <Skull className="w-3 h-3 text-purple-600 shrink-0" />
            <span>Toksik</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Am</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Precision Filter & Search Console */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama bahan, jenama, spesifikasi, lokasi rak, atau pembekal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-lg text-xs transition-colors focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              title="Eksport Inventori ke fail CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Eksport CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenExcelImport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors"
              title="Daftar item makmal melalui fail Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Import Excel</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daftar Item (AI)</span>
            </button>
          </div>
        </div>

        {/* Category & Status Filter Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Category Segmented Bar */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("CHEMICAL")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === "CHEMICAL"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bahan Kimia ({items.filter((i) => i.category === "CHEMICAL").length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("CONSUMABLE")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedCategory === "CONSUMABLE"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Consumables ({items.filter((i) => i.category === "CONSUMABLE").length})
            </button>
          </div>

          {/* Status Filter Segmented Bar */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-mono text-[11px] mr-1 hidden sm:inline">Status:</span>
            <button
              type="button"
              onClick={() => setSelectedStatus("ALL")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                selectedStatus === "ALL"
                  ? "bg-slate-900 text-white font-medium"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("low")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                selectedStatus === "low"
                  ? "bg-rose-700 text-white font-medium"
                  : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              Stok Rendah (≤ 3)
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("expiring")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                selectedStatus === "expiring"
                  ? "bg-amber-800 text-white font-medium"
                  : "text-amber-800 hover:bg-amber-50"
              }`}
            >
              Luput ≤ 180h
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("expired")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                selectedStatus === "expired"
                  ? "bg-red-800 text-white font-medium"
                  : "text-red-800 hover:bg-red-50"
              }`}
            >
              Telah Luput
            </button>
          </div>
        </div>
      </div>

      {/* Counter and Filter Feedback */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
        <div>
          Menunjukkan <span className="font-bold text-slate-900">{filteredItems.length}</span> daripada{" "}
          <span className="font-bold text-slate-900">{items.length}</span> spesimen makmal
        </div>
        {(selectedCategory !== "ALL" || selectedStatus !== "ALL" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
              setSearchQuery("");
            }}
            className="text-slate-800 hover:text-black underline font-sans"
          >
            Kosongkan Penapis
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-slate-200/90 text-center">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Tiada Item Ditemui</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tiada rekod inventori yang sepadan dengan kriteria carian atau penapis makmal anda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
              setSearchQuery("");
            }}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
          >
            Tunjukkan Semua Item
          </button>
        </div>
      )}

      {/* Desktop Specimen Table */}
      {filteredItems.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Spesimen &amp; Spesifikasi</th>
                  <th className="py-3 px-3">Kategori &amp; Sifat Bahaya</th>
                  <th className="py-3 px-3 text-right">Baki Semasa</th>
                  <th className="py-3 px-3">Tarikh Luput</th>
                  <th className="py-3 px-3 text-right">Harga Seunit</th>
                  <th className="py-3 px-3">Lokasi &amp; Pembekal</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const alert = evaluateItemAlert(item);
                  const isOutOfStock = item.currentQuantity <= 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        alert.isExpired
                          ? "bg-red-50/30"
                          : alert.isLowStock
                          ? "bg-rose-50/25"
                          : ""
                      }`}
                    >
                      {/* Name & Spec with domain-authentic SVG thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                              item.category === "CHEMICAL"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-teal-50 text-teal-700 border-teal-200"
                            }`}
                          >
                            {item.category === "CHEMICAL" ? (
                              <TestTube className="w-4 h-4" />
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {item.brand} <span aria-hidden="true">·</span> {item.specPackaging}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Hazard */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-700">
                          {item.category === "CHEMICAL" ? "Bahan Kimia" : "Consumable"}
                        </div>
                        <div className="mt-0.5">
                          {item.category === "CHEMICAL" ? (
                            renderHazardLabel(item.hazardTag)
                          ) : (
                            <span className="text-[11px] text-slate-400">Guna Habis</span>
                          )}
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div
                          className={`font-mono tabular-nums text-sm font-bold ${
                            isOutOfStock
                              ? "text-red-700"
                              : item.currentQuantity <= item.minThreshold
                              ? "text-rose-600"
                              : "text-slate-900"
                          }`}
                        >
                          {item.currentQuantity} unit
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Had Min: {item.minThreshold}
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-mono text-slate-800">
                          {formatDate(item.expiryDate)}
                        </div>
                        <div
                          className={`text-[11px] font-semibold mt-0.5 ${
                            alert.isExpired
                              ? "text-red-700"
                              : alert.isExpiringSoon
                              ? "text-amber-700"
                              : "text-slate-500"
                          }`}
                        >
                          {alert.label}
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                        {formatMYR(item.unitPriceMYR)}
                        <div className="text-[10px] font-normal text-slate-400 font-mono">
                          Jumlah: {formatMYR(item.currentQuantity * item.unitPriceMYR)}
                        </div>
                      </td>

                      {/* Location & Supplier */}
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <div className="font-mono text-slate-700 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.location || "Makmal Utama"}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5" title={item.supplierName}>
                          {item.supplierName}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Primary Quick Deduct Button (Zero Balance Rule applies) */}
                          <button
                            type="button"
                            onClick={() => onOpenDeduct(item)}
                            disabled={isOutOfStock}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Tolak stok untuk kegunaan eksperimen makmal"
                          >
                            <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Tolak Stok</span>
                          </button>

                          {/* Replenish */}
                          <button
                            type="button"
                            onClick={() => onReplenish(item)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                            title="Tambah stok masuk"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onOpenEdit(item)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                            title="Sunting item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
                            title="Padam rekod"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Specimen Cards (Clean, touch-friendly lab layout) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredItems.map((item) => {
          const alert = evaluateItemAlert(item);
          const isOutOfStock = item.currentQuantity <= 0;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-4 border shadow-xs space-y-3 ${
                alert.isExpired
                  ? "border-red-200 bg-red-50/20"
                  : alert.isLowStock
                  ? "border-rose-200 bg-rose-50/20"
                  : "border-slate-200/90"
              }`}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    item.category === "CHEMICAL"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-teal-50 text-teal-700 border-teal-200"
                  }`}
                >
                  {item.category === "CHEMICAL" ? (
                    <TestTube className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                    {item.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {item.brand} <span aria-hidden="true">·</span> {item.specPackaging}
                  </div>
                  {item.category === "CHEMICAL" && (
                    <div className="mt-1">{renderHazardLabel(item.hazardTag)}</div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Baki Stok:</span>
                  <div className="font-mono tabular-nums font-bold text-sm mt-0.5">
                    <span className={isOutOfStock ? "text-red-700" : item.currentQuantity <= item.minThreshold ? "text-rose-600" : "text-slate-900"}>
                      {item.currentQuantity} unit
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      (min: {item.minThreshold})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Tarikh Luput:</span>
                  <div className="font-mono tabular-nums text-slate-800 font-medium mt-0.5">
                    {formatDate(item.expiryDate)}
                  </div>
                  <div
                    className={`text-[10px] font-semibold mt-0.5 ${
                      alert.isExpired
                        ? "text-red-700"
                        : alert.isExpiringSoon
                        ? "text-amber-700"
                        : "text-slate-500"
                    }`}
                  >
                    {alert.label}
                  </div>
                </div>
              </div>

              {/* Price & Location */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                <div>
                  <span className="font-bold text-slate-900">{formatMYR(item.unitPriceMYR)}</span>
                  <span className="text-slate-400"> / seunit</span>
                </div>
                {item.location && (
                  <div className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDeduct(item)}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-900 text-white font-medium text-xs transition-colors disabled:opacity-30"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tolak Stok</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReplenish(item)}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  title="Tambah stok"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEdit(item)}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  title="Sunting"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-700 hover:bg-red-50"
                  title="Padam"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
