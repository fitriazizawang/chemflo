import React from "react";
import { X, Printer, Download, CheckCircle2, Building, ShieldCheck } from "lucide-react";
import { RestockItemPlan } from "./RestockBudgetPlanner";
import { ItemCategory } from "../types/inventory";
import { formatMYR, formatDate } from "../utils/alerts";

interface PrintPurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: RestockItemPlan[];
  category: ItemCategory | "COMBINED";
  budgetLimit: number;
}

export const PrintPurchaseRequestModal: React.FC<PrintPurchaseRequestModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  category,
  budgetLimit,
}) => {
  if (!isOpen) return null;

  const totalCost = orderItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const remainingBudget = budgetLimit - totalCost;
  const prNumber = `PR-LAB-${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const todayStr = new Date().toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const categoryTitle =
    category === "CHEMICAL"
      ? "BAHAN KIMIA & REAGEN ANALITIKAL (KOD AKAUN: V21000)"
      : category === "CONSUMABLE"
      ? "BAHAN PAKAI BUANG MAKMAL / CONSUMABLES (KOD AKAUN: V26000)"
      : "PEROLEHAN GABUNGAN MAKMAL R&D";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Printable Paper Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto print:shadow-none print:border-none print:max-w-none print:rounded-none">
        {/* Screen Controls Header (Hidden during actual print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">
              Pratonton Borang Permohonan Pesanan Pembelian (PR Form)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Laboratory Printable Form Content */}
        <div className="p-6 sm:p-10 font-sans text-slate-900 space-y-6 print:p-0">
          {/* Institution Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-mono print:border print:border-black">
                LGM
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-900">
                  Lembaga Getah Malaysia (LGM) · Makmal Penyelidikan &amp; Pembangunan
                </h1>
                <p className="text-xs text-slate-600 font-mono">
                  ChemLab Flow · Sistem Pengurusan Inventori &amp; Kawalan Bajet
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Stesen Penyelidikan RRIM Sungai Buloh, Selangor
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">No. Rujukan PR:</div>
              <div className="font-mono font-bold text-sm text-slate-900">{prNumber}</div>
              <div className="text-slate-500 font-mono mt-0.5">Tarikh: {todayStr}</div>
            </div>
          </div>

          {/* Form Title & Category */}
          <div className="text-center py-1">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
              BORANG PERMOHONAN PESANAN PEMBELIAN (PURCHASE REQUEST)
            </h2>
            <div className="inline-block mt-1 px-3 py-1 rounded bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wide border border-slate-300">
              {categoryTitle}
            </div>
          </div>

          {/* Budget Allocation Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs">
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Had Peruntukan Bajet:</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {formatMYR(budgetLimit)}
              </div>
              <div className="text-[10px] text-slate-500">Had Siling RM20,000</div>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Jumlah Anggaran Pesanan:</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {formatMYR(totalCost)}
              </div>
              <div className="text-[10px] text-slate-500">{orderItems.length} item pesanan</div>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Baki Bajet Selepas Pesanan:</span>
              <div className={`text-base font-extrabold mt-0.5 ${remainingBudget < 0 ? "text-rose-700" : "text-emerald-800"}`}>
                {formatMYR(remainingBudget)}
              </div>
              <div className="text-[10px] text-slate-500">
                {remainingBudget >= 0 ? "Pematuhan bajet dipenuhi" : "Melebihi had peruntukan!"}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <th className="py-2.5 px-3 w-8 text-center">Bil</th>
                  <th className="py-2.5 px-3">Keterangan Item & Spesifikasi</th>
                  <th className="py-2.5 px-3">Jenama</th>
                  <th className="py-2.5 px-2 text-center">Baki Semasa</th>
                  <th className="py-2.5 px-2 text-center">Kuantiti</th>
                  <th className="py-2.5 px-3 text-right">Harga Seunit (RM)</th>
                  <th className="py-2.5 px-3 text-right">Jumlah (RM)</th>
                  <th className="py-2.5 px-3">Pembekal Rujukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orderItems.map((plan, index) => (
                  <tr key={plan.item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{plan.item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {plan.item.specPackaging} • {plan.reason}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {plan.item.brand}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {plan.item.currentQuantity}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold font-mono text-slate-900">
                      {plan.orderQuantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {plan.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                      {plan.subtotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {plan.item.supplierName}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={4} className="py-2.5 px-3 uppercase text-right">
                    JUMLAH BESAR KESELURUHAN (RM):
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    {orderItems.reduce((a, b) => a + b.orderQuantity, 0)}
                  </td>
                  <td className="py-2.5 px-3"></td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-sm font-mono text-slate-900">
                    {formatMYR(totalCost)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Justification & Compliance Notes */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="font-bold text-slate-800">Justifikasi Perolehan Makmal:</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pesanan ini diperlukan serta-merta bagi menampung baki stok yang mencapai paras kritikal (≤ 3 unit) dan menggantikan bahan yang tamat tempoh luput (≤ 180 hari) mengikut pemantauan ChemLab Flow. Semua harga adalah berdasarkan anggaran harga pasaran terkini Malaysia (Merck, Fisher, Sigma-Aldrich, dll) untuk kegunaan eksperimen berterusan.
            </p>
          </div>

          {/* Signatures & Approvals Section */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs">
            <div className="border-t border-slate-400 pt-3 space-y-1">
              <div className="font-bold uppercase text-slate-900">Disediakan Oleh:</div>
              <div className="text-slate-700">Nama: Nurul Izzah / Pembantu Penyelidik (RA)</div>
              <div className="text-slate-500">Jawatan: Research Assistant</div>
              <div className="text-slate-500">Tarikh: {todayStr}</div>
              <div className="h-10"></div>
              <div className="text-[10px] text-slate-400 italic">Tandatangan Pemohon</div>
            </div>

            <div className="border-t border-slate-400 pt-3 space-y-1">
              <div className="font-bold uppercase text-slate-900">Disemak & Diluluskan Oleh:</div>
              <div className="text-slate-700">Nama: Prof. / Dr. Ketua Penyelidik (PI)</div>
              <div className="text-slate-500">Jawatan: Principal Investigator / Pengurus Makmal</div>
              <div className="text-slate-500">Tarikh: ............................................</div>
              <div className="h-10"></div>
              <div className="text-[10px] text-slate-400 italic">Tandatangan & Cop Rasmi Geran</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
