import React, { useState } from "react";
import { MinusCircle, X, AlertCircle, CheckCircle2, User, FileText, Layers } from "lucide-react";
import { InventoryItem } from "../types/inventory";

interface QuickDeductModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeduct: (params: {
    itemId: string;
    quantityUsed: number;
    researcherName: string;
    projectCode: string;
    notes?: string;
  }) => void;
}

const COMMON_PROJECTS = [
  "PRJ-BIO-2026-04",
  "PRJ-CHEM-2026-09",
  "GRT-FRGS-2026-02",
  "PRJ-NANO-2026-11",
  "KOD-AM-PENYELIDIKAN",
];

const RECENT_RESEARCHERS = [
  "Nurul Izzah (RA)",
  "Ahmad Zaki (RA)",
  "Farid Kamaruddin (RA)",
  "Dr. Siti Farhana (PI)",
];

export const QuickDeductModal: React.FC<QuickDeductModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmDeduct,
}) => {
  if (!isOpen || !item) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [researcherName, setResearcherName] = useState<string>("Nurul Izzah (RA)");
  const [projectCode, setProjectCode] = useState<string>("PRJ-BIO-2026-04");
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentStock = item.currentQuantity;
  const isOutOfStock = currentStock <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!researcherName.trim()) {
      setErrorMessage("Sila masukkan nama Penyelidik / RA yang mengambil bahan.");
      return;
    }

    if (!projectCode.trim()) {
      setErrorMessage("Sila masukkan Kod Projek / Eksperimen untuk jejak audit.");
      return;
    }

    if (quantity <= 0) {
      setErrorMessage("Kuantiti penggunaan mestilah sekurang-kurangnya 1 unit.");
      return;
    }

    // Business Rule (PRD Section 13): Peraturan Baki Sifar
    if (quantity > currentStock) {
      setErrorMessage(
        `Ralat: Baki stok tidak mencukupi untuk penolakan ini. Baki semasa hanya ${currentStock} unit.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      onConfirmDeduct({
        itemId: item.id,
        quantityUsed: Number(quantity),
        researcherName: researcherName.trim(),
        projectCode: projectCode.trim(),
        notes: notes.trim(),
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || "Gagal merekodkan penolakan stok.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-800 text-rose-400 flex items-center justify-center border border-slate-700">
              <MinusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">Tolak Stok Meja Makmal</h3>
              <p className="text-[11px] text-slate-400 font-mono">Jejak Audit Penyelidikan (&lt; 10 saat)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Item Specimen Card */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase">
                  {item.category === "CHEMICAL" ? "Bahan Kimia" : "Consumable"}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item.name}</h4>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {item.brand} <span aria-hidden="true">·</span> {item.specPackaging}
                  {item.location && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span>Lokasi: {item.location}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-mono">Baki Semasa</div>
                <div
                  className={`text-lg font-bold font-mono tabular-nums ${
                    currentStock <= 3 ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {currentStock} unit
                </div>
              </div>
            </div>
          </div>

          {/* Out of stock warning banner */}
          {isOutOfStock && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>
                <strong>Peraturan Baki Sifar:</strong> Baki stok bahan ini adalah 0 unit. Penolakan tidak dibenarkan.
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Field 1: Quantity to Deduct */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Kuantiti Digunakan (Unit) *</span>
              <span className="text-slate-500 font-mono text-[11px]">
                Baki Selepas:{" "}
                <strong className={currentStock - quantity < 0 ? "text-rose-600" : "text-slate-900"}>
                  {Math.max(0, currentStock - (quantity || 0))} unit
                </strong>
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={Math.max(1, currentStock)}
                disabled={isOutOfStock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center font-mono font-bold text-base px-2 py-1.5 border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
                required
              />

              <div className="flex items-center gap-1">
                {[1, 2, 3, 5].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={isOutOfStock || preset > currentStock}
                    onClick={() => setQuantity(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      quantity === preset
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Field 2: Researcher Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Penyelidik / RA *</span>
            </label>
            <input
              type="text"
              required
              disabled={isOutOfStock}
              value={researcherName}
              onChange={(e) => setResearcherName(e.target.value)}
              placeholder="Contoh: Nurul Izzah (RA)"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {RECENT_RESEARCHERS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setResearcherName(name)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Field 3: Project Code / Experiment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Kod Projek / Geran Penyelidikan *</span>
            </label>
            <input
              type="text"
              required
              disabled={isOutOfStock}
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              placeholder="Contoh: PRJ-BIO-2026-04"
              className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-hidden uppercase disabled:bg-slate-100"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {COMMON_PROJECTS.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setProjectCode(code)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Field 4: Optional experiment notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Catatan Eksperimen (Pilihan)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              disabled={isOutOfStock}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Penyediaan larutan stok penimbal pH 7.4 untuk asai enzim..."
              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-hidden disabled:bg-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isOutOfStock || isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? "Merekod..." : "Sahkan & Tolak Stok"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
