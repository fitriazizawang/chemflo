import React, { useState } from "react";
import { PlusCircle, X, CheckCircle2, PackageCheck } from "lucide-react";
import { InventoryItem } from "../types/inventory";

interface ReplenishModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReplenish: (itemId: string, qtyAdded: number) => void;
}

export const ReplenishModal: React.FC<ReplenishModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmReplenish,
}) => {
  if (!isOpen || !item) return null;

  const [qty, setQty] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;
    onConfirmReplenish(item.id, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Tambah Stok Masuk (Replenish)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-mono text-slate-500 uppercase">Spesimen Makmal:</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">{item.name}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {item.brand} <span aria-hidden="true">·</span> {item.specPackaging}
            </div>
            <div className="text-xs text-slate-700 font-mono mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span>Baki Semasa:</span>
              <strong className="text-slate-900 font-bold tabular-nums">{item.currentQuantity} unit</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Bilangan Kuantiti Tambahan (Unit) *</span>
              <span className="text-slate-500 font-mono text-[11px]">
                Baki Baru:{" "}
                <strong className="text-emerald-700 font-bold tabular-nums">
                  {item.currentQuantity + (qty || 0)} unit
                </strong>
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center font-mono font-bold text-base px-2 py-1.5 border border-slate-300 rounded-lg focus:border-slate-900 focus:outline-hidden"
              />

              <div className="flex items-center gap-1">
                {[1, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQty(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      qty === preset
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sahkan Tambah Stok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
