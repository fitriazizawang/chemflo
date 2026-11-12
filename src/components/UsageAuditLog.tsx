import React, { useState, useMemo } from "react";
import { History, Search, Download, User } from "lucide-react";
import { UsageLog, ItemCategory } from "../types/inventory";
import { downloadCSV } from "../services/storage";

interface UsageAuditLogProps {
  logs: UsageLog[];
}

export const UsageAuditLog: React.FC<UsageAuditLogProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | "ALL">(
    "ALL"
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (categoryFilter !== "ALL" && log.category !== categoryFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchItem = log.itemName.toLowerCase().includes(query);
        const matchResearcher = log.researcherName.toLowerCase().includes(query);
        const matchProject = log.projectCode.toLowerCase().includes(query);
        const matchNotes = (log.notes || "").toLowerCase().includes(query);
        if (!matchItem && !matchResearcher && !matchProject && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [logs, categoryFilter, searchQuery]);

  // Export logs to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID Log",
      "Cap Masa (Timestamp)",
      "Nama Item",
      "Kategori",
      "Kuantiti Digunakan",
      "Baki Selepas Tolak",
      "Nama Penyelidik / RA",
      "Kod Projek / Geran",
      "Catatan",
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      new Date(log.timestamp).toLocaleString("ms-MY"),
      log.itemName,
      log.category === "CHEMICAL" ? "Bahan Kimia" : "Consumable",
      log.quantityUsed,
      log.balanceAfter,
      log.researcherName,
      log.projectCode,
      log.notes || "-",
    ]);

    const filename = `ChemLab_Log_Audit_Penggunaan_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    downloadCSV(filename, headers, rows);
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("ms-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Precision Audit Header Strip */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <History className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Log Jejak Audit Penggunaan Bahan &amp; Geran
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Setiap transaksi penolakan stok direkodkan dengan nama penyelidik dan kod projek R&amp;D (FR-003).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Eksport Log (CSV)</span>
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kod projek (cth: PRJ-BIO-2026-04), nama RA, bahan..."
              className="w-full text-xs pl-8 pr-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-lg focus:outline-hidden transition-colors"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("CHEMICAL")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === "CHEMICAL"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bahan Kimia
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("CONSUMABLE")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                categoryFilter === "CONSUMABLE"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Consumables
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            Tiada rekod penggunaan ditemui untuk carian atau penapis ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Cap Masa</th>
                  <th className="py-3 px-3">Bahan / Spesimen</th>
                  <th className="py-3 px-2 text-right">Kuantiti Guna</th>
                  <th className="py-3 px-2 text-right">Baki Selepas</th>
                  <th className="py-3 px-3">Nama Penyelidik / RA</th>
                  <th className="py-3 px-3">Kod Projek / Geran</th>
                  <th className="py-3 px-4">Catatan Eksperimen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatTimestamp(log.timestamp)}
                    </td>

                    {/* Item Name */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{log.itemName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {log.category === "CHEMICAL" ? "Bahan Kimia" : "Consumable"}
                      </div>
                    </td>

                    {/* Quantity Used */}
                    <td className="py-3 px-2 text-right whitespace-nowrap font-mono tabular-nums font-bold text-rose-600">
                      -{log.quantityUsed} unit
                    </td>

                    {/* Balance After */}
                    <td className="py-3 px-2 text-right whitespace-nowrap font-mono tabular-nums text-slate-700">
                      {log.balanceAfter} unit
                    </td>

                    {/* Researcher */}
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.researcherName}</span>
                      </div>
                    </td>

                    {/* Project Code */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {log.projectCode}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate" title={log.notes}>
                      {log.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
