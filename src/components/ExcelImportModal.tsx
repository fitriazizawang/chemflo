import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Trash2,
  TestTube,
  Package,
} from "lucide-react";
import { InventoryItem } from "../types/inventory";
import {
  downloadExcelTemplate,
  parseExcelRows,
  ParsedExcelRow,
  EXCEL_SAMPLE_ROWS,
} from "../utils/excelTemplate";
import { formatMYR } from "../utils/alerts";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportItems: (items: InventoryItem[], mode: "append" | "merge") => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportItems,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedExcelRow[]>([]);
  const [importMode, setImportMode] = useState<"append" | "merge">("append");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Process uploaded Excel / CSV file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage("");
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, any>[];

        if (!data || data.length === 0) {
          setErrorMessage("Fail Excel ini kosong atau tiada baris data.");
          setParsedRows([]);
          setIsProcessing(false);
          return;
        }

        const parsed = parseExcelRows(data);
        setParsedRows(parsed);
      } catch (err: any) {
        console.error("Error parsing Excel:", err);
        setErrorMessage("Gagal membaca fail Excel. Sila pastikan format .xlsx atau .csv yang sah.");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // 1-Click Load Sample Excel Data
  const handleLoadSample = () => {
    setFileName("Contoh_Data_Inventori_Makmal.xlsx");
    setErrorMessage("");
    const parsed = parseExcelRows(EXCEL_SAMPLE_ROWS);
    setParsedRows(parsed);
  };

  // Remove a row from parsed preview
  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Confirm import
  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid && r.item.name);
    if (validRows.length === 0) {
      setErrorMessage("Tiada rekod sah untuk diimport.");
      return;
    }

    const now = new Date().toISOString();
    const finalItems: InventoryItem[] = validRows.map((r, i) => {
      const it = r.item;
      return {
        id: `item-xl-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name: it.name || "Item Makmal",
        category: it.category || "CHEMICAL",
        brand: it.brand || "Merck",
        specPackaging: it.specPackaging || "Piawai",
        currentQuantity: it.currentQuantity ?? 5,
        minThreshold: it.minThreshold ?? 3,
        expiryDate: it.expiryDate || "2027-12-31",
        supplierName: it.supplierName || "Pembekal Makmal Malaysia",
        unitPriceMYR: it.unitPriceMYR ?? 50.0,
        hazardTag: it.hazardTag || "GENERAL_NON_HAZARDOUS",
        location: it.location || "Rak Makmal",
        safetyNote: it.safetyNote || "",
        imageUrl: it.imageUrl || "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=60",
        createdAt: now,
        updatedAt: now,
      };
    });

    onImportItems(finalItems, importMode);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;
  const chemCount = parsedRows.filter((r) => r.isValid && r.item.category === "CHEMICAL").length;
  const conCount = parsedRows.filter((r) => r.isValid && r.item.category === "CONSUMABLE").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Daftar Barang Melalui Senarai Excel (Bulk Import)
              </h3>
              <p className="text-xs text-slate-400">
                Muat naik fail Excel (.xlsx, .xls) atau CSV untuk mendaftar inventori secara pukal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Top Banner: Download Template & Quick Action */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Format Templat Rasmi ChemLab Flow</span>
              </div>
              <p className="text-xs text-slate-500">
                Gunakan templat rasmi untuk memastikan nama lajur, pengelasan kategori, dan tarikh luput dipadankan dengan tepat.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 text-xs font-semibold shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Muat Turun Templat Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all"
                title="Muat 5 baris contoh makmal segera tanpa fail"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Guna Contoh Ujian</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">
              {fileName ? fileName : "Klik atau seret fail Excel / CSV ke sini"}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Menyokong fail Microsoft Excel (.xlsx, .xls) dan Comma-Separated Values (.csv)
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Validation & Preview Section (When rows exist) */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              {/* Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 rounded-lg text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">
                    Jumlah Dikesan: {parsedRows.length}
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{validCount} Sah</span>
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{invalidCount} Ralat</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <span>{chemCount} Bahan Kimia</span>
                  <span aria-hidden="true">·</span>
                  <span>{conCount} Consumables</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">Baris</th>
                      <th className="py-2.5 px-3">Nama Item</th>
                      <th className="py-2.5 px-2">Kategori</th>
                      <th className="py-2.5 px-2">Jenama</th>
                      <th className="py-2.5 px-2">Spesifikasi</th>
                      <th className="py-2.5 px-2 text-center">Baki</th>
                      <th className="py-2.5 px-2">Luput</th>
                      <th className="py-2.5 px-2">Harga (RM)</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Padam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => {
                      const it = row.item;
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50 transition-colors ${
                            !row.isValid ? "bg-rose-50/40" : ""
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono text-slate-400">
                            {row.rowIndex}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {it.name || <span className="text-rose-500 italic">Kosong</span>}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                it.category === "CHEMICAL"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-teal-100 text-teal-800"
                              }`}
                            >
                              {it.category === "CHEMICAL" ? "Kimia" : "Consumable"}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-600">{it.brand}</td>
                          <td className="py-2 px-2 text-slate-500 truncate max-w-[120px]">
                            {it.specPackaging}
                          </td>
                          <td className="py-2 px-2 text-center font-bold font-mono">
                            {it.currentQuantity}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap text-slate-600">
                            {it.expiryDate}
                          </td>
                          <td className="py-2 px-2 font-mono font-medium">
                            {it.unitPriceMYR ? formatMYR(it.unitPriceMYR) : "-"}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {row.isValid ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Sah
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200" title={row.errors.join(", ")}>
                                Ralat
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Keluarkan baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Import Options */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">Mod Import:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Tambah ke rekod sedia ada (Append)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === "merge"}
                      onChange={() => setImportMode("merge")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Kemas kini rekod nama sama (Merge)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                <strong className="text-slate-900">{validCount}</strong> item sah sedia untuk didaftarkan ke pangkalan data.
              </span>
            ) : (
              <span>Sila muat naik fail Excel atau guna contoh data di atas.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sahkan & Import {validCount > 0 ? `${validCount} Item` : ""}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
