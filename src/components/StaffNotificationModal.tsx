import React, { useState, useMemo } from "react";
import {
  Mail,
  Send,
  Users,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  History,
  X,
  Trash2,
  ShieldCheck,
  UserCheck,
  Check,
} from "lucide-react";
import { StaffMember, EmailDispatchLog } from "../types/staff";
import { InventoryItem } from "../types/inventory";
import { evaluateItemAlert, formatMYR, formatDate } from "../utils/alerts";
import { recordEmailDispatch } from "../data/staffData";

interface StaffNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  staffList: StaffMember[];
  onUpdateStaffList: (newStaffList: StaffMember[]) => void;
  emailLogs: EmailDispatchLog[];
  onUpdateEmailLogs: (newLogs: EmailDispatchLog[]) => void;
  onShowToast: (message: string, type?: "success" | "error") => void;
}

export const StaffNotificationModal: React.FC<StaffNotificationModalProps> = ({
  isOpen,
  onClose,
  items,
  staffList,
  onUpdateStaffList,
  emailLogs,
  onUpdateEmailLogs,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"compose" | "directory" | "logs">("compose");

  // Compose State
  const [triggerType, setTriggerType] = useState<"ALL_CRITICAL" | "LOW_STOCK" | "EXPIRY">("ALL_CRITICAL");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(
    staffList.filter((s) => s.active).map((s) => s.id)
  );
  const [customNote, setCustomNote] = useState<string>(
    "Sila ambil perhatian terhadap status stok di bawah bagi memastikan aktiviti eksperimen makmal berjalan lancar."
  );
  const [copied, setCopied] = useState<boolean>(false);

  // New Staff Registration Form State
  const [showQuickAdd, setShowQuickAdd] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>("");
  const [newStaffEmail, setNewStaffEmail] = useState<string>("");
  const [newStaffRole, setNewStaffRole] = useState<StaffMember["role"]>("RA");
  const [newStaffDept, setNewStaffDept] = useState<string>("Makmal Penyelidikan & Pembangunan");
  const [newStaffLowStock, setNewStaffLowStock] = useState<boolean>(true);
  const [newStaffExpiry, setNewStaffExpiry] = useState<boolean>(true);
  const [newStaffPR, setNewStaffPR] = useState<boolean>(true);

  // Filter items matching selected trigger
  const alertItems = useMemo(() => {
    return items.filter((item) => {
      const alert = evaluateItemAlert(item);
      if (triggerType === "LOW_STOCK") return alert.isLowStock;
      if (triggerType === "EXPIRY") return alert.isExpired || alert.isExpiringSoon;
      return alert.isLowStock || alert.isExpired || alert.isExpiringSoon;
    });
  }, [items, triggerType]);

  // Selected recipients objects
  const selectedRecipients = staffList.filter((s) => selectedStaffIds.includes(s.id));

  // Generate Email Subject & Body
  const emailSubject = useMemo(() => {
    if (triggerType === "LOW_STOCK") {
      return `[ChemLab Flow] AMARAN STOK RENDAH: ${alertItems.length} Bahan Memerlukan Pesanan Semula`;
    }
    if (triggerType === "EXPIRY") {
      return `[ChemLab Flow] AMARAN INTEGRITI BAHAN: ${alertItems.length} Bahan Menghampiri/Melepasi Tarikh Luput`;
    }
    return `[ChemLab Flow] LAPORAN AMARAN MAKMAL R&D: ${alertItems.length} Bahan Kritikal (${new Date().toLocaleDateString("ms-MY")})`;
  }, [triggerType, alertItems.length]);

  const emailBodyText = useMemo(() => {
    const lines = [
      `Kepada: Staf & Penyelidik Makmal R&D Berdaftar,`,
      ``,
      `Pemberitahuan automatik daripada ChemLab Flow - Sistem Pengurusan Inventori Makmal Penyelidikan.`,
      `Tarikh Notifikasi: ${new Date().toLocaleDateString("ms-MY", { dateStyle: "full" })}`,
      ``,
      `Nota Arahan Pengurusan:`,
      `"${customNote}"`,
      ``,
      `==================================================`,
      `RINGKASAN ITEM KRITIKAL MAKMAL (${alertItems.length} ITEM):`,
      `==================================================`,
    ];

    alertItems.forEach((it, idx) => {
      const alert = evaluateItemAlert(it);
      lines.push(
        `${idx + 1}. [${it.category === "CHEMICAL" ? "BAHAN KIMIA" : "CONSUMABLE"}] ${it.name}`
      );
      lines.push(`   Jenama/Pakej : ${it.brand} • ${it.specPackaging}`);
      lines.push(`   Baki Semasa  : ${it.currentQuantity} unit (Had Min: ${it.minThreshold})`);
      lines.push(`   Tarikh Luput : ${formatDate(it.expiryDate)} (${alert.label})`);
      lines.push(`   Harga Seunit : ${formatMYR(it.unitPriceMYR)} | Pembekal: ${it.supplierName}`);
      if (it.location) lines.push(`   Lokasi Rak   : ${it.location}`);
      lines.push(``);
    });

    lines.push(`==================================================`);
    lines.push(`Sila semak sistem ChemLab Flow untuk mengemas kini stok atau menjana Borang Permohonan Pesanan (Purchase Request).`);
    lines.push(``);
    lines.push(`Sekian, terima kasih.`);
    lines.push(`Sistem Inventori Makmal ChemLab Flow`);

    return lines.join("\n");
  }, [alertItems, customNote]);

  // Toggle recipient selection
  const toggleRecipient = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedStaffIds(staffList.filter((s) => s.active).map((s) => s.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  // Dispatch Action: Open native mail client via mailto:
  const handleOpenMailto = () => {
    if (selectedRecipients.length === 0) {
      onShowToast("Sila pilih sekurang-kurangnya seorang staf penerima.", "error");
      return;
    }

    const toEmails = selectedRecipients.map((s) => s.email).join(",");
    const mailtoUrl = `mailto:${encodeURIComponent(toEmails)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBodyText)}`;

    window.open(mailtoUrl, "_blank");

    // Record log
    saveLogAndNotify();
  };

  // Copy Draft to Clipboard
  const handleCopyDraft = () => {
    const fullContent = `Subjek: ${emailSubject}\n\nPenerima: ${selectedRecipients
      .map((s) => s.email)
      .join(", ")}\n\n${emailBodyText}`;

    navigator.clipboard.writeText(fullContent).then(() => {
      setCopied(true);
      onShowToast("Draf notifikasi emel berjaya disalin ke papan keratan!", "success");
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Record log and show success toast
  const saveLogAndNotify = () => {
    const newLog: EmailDispatchLog = {
      id: `elog-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientEmails: selectedRecipients.map((s) => s.email),
      recipientNames: selectedRecipients.map((s) => s.name),
      subject: emailSubject,
      bodyPreview: emailBodyText.slice(0, 160) + "...",
      itemCount: alertItems.length,
      triggerType: triggerType === "ALL_CRITICAL" ? "CUSTOM" : triggerType,
    };

    const updated = recordEmailDispatch(newLog);
    onUpdateEmailLogs(updated);
    onShowToast(
      `Notifikasi emel telah dijana untuk ${selectedRecipients.length} staf berdaftar!`,
      "success"
    );
  };

  // Register new staff member
  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      onShowToast("Sila lengkapkan nama dan alamat emel staf.", "error");
      return;
    }

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      department: newStaffDept.trim(),
      receiveLowStockAlerts: newStaffLowStock,
      receiveExpiryAlerts: newStaffExpiry,
      receiveRestockPRAlerts: newStaffPR,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newStaff, ...staffList];
    onUpdateStaffList(updated);
    setSelectedStaffIds((prev) => [...prev, newStaff.id]);

    // Reset form
    setNewStaffName("");
    setNewStaffEmail("");
    onShowToast(`Staf "${newStaff.name}" (${newStaff.email}) berjaya didaftarkan!`, "success");
  };

  // Delete staff member
  const handleDeleteStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    if (!target) return;
    if (confirm(`Adakah anda pasti mahu memadamkan staf "${target.name}"?`)) {
      const updated = staffList.filter((s) => s.id !== id);
      onUpdateStaffList(updated);
      setSelectedStaffIds((prev) => prev.filter((sId) => sId !== id));
      onShowToast(`Staf "${target.name}" telah dikeluarkan.`, "success");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Pusat Notifikasi Emel Staf Makmal
              </h3>
              <p className="text-xs text-slate-400">
                Pemberitahuan amaran stok rendah, bahan luput, dan perancangan bajet kepada staf
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

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50 gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "compose"
                ? "border-slate-900 text-slate-900 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Hantar Notifikasi</span>
            <span className="text-slate-500 font-normal">
              ({alertItems.length} amaran)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "directory"
                ? "border-slate-900 text-slate-900 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Direktori Staf ({staffList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "border-slate-900 text-slate-900 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Sejarah ({emailLogs.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: COMPOSE & SEND NOTIFICATION */}
          {activeTab === "compose" && (
            <div className="space-y-4">
              {/* Trigger Filter Row */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Jenis Notifikasi:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTriggerType("ALL_CRITICAL")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        triggerType === "ALL_CRITICAL"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      Semua Amaran Kritikal
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriggerType("LOW_STOCK")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        triggerType === "LOW_STOCK"
                          ? "bg-rose-600 text-white"
                          : "bg-white text-rose-700 border border-slate-200"
                      }`}
                    >
                      Hanya Stok Rendah (≤ 3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriggerType("EXPIRY")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        triggerType === "EXPIRY"
                          ? "bg-amber-600 text-white"
                          : "bg-white text-amber-800 border border-slate-200"
                      }`}
                    >
                      Hanya Tarikh Luput (≤ 180h)
                    </button>
                  </div>
                </div>

                <div className="text-slate-500 font-medium">
                  <strong>{alertItems.length}</strong> bahan makmal memerlukan tindakan
                </div>
              </div>

              {/* Recipients Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-600" />
                      <span>Pilih Staf Penerima Notifikasi Emel ({selectedRecipients.length} Dipilih)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAdd((prev) => !prev)}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200 transition-all flex items-center gap-1"
                    >
                      <span>{showQuickAdd ? "Tutup Borang" : "+ Tambah Emel Staf"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      Pilih Semua
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="text-slate-500 hover:underline"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Collapsible Quick Add Staff Form */}
                {showQuickAdd && (
                  <form
                    onSubmit={(e) => {
                      handleAddNewStaff(e);
                      setShowQuickAdd(false);
                    }}
                    className="mb-3 p-3 rounded-xl bg-teal-50/80 border border-teal-200 space-y-2 animate-in fade-in text-xs"
                  >
                    <div className="font-bold text-teal-900 text-[11px] flex items-center justify-between">
                      <span>Daftar Emel Staf Baharu Serta-Merta</span>
                      <button
                        type="button"
                        onClick={() => setShowQuickAdd(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nama Penuh Staf"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Alamat Emel (cth: name@lab.gov.my)"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500"
                      />
                      <div className="flex gap-1.5">
                        <select
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value as any)}
                          className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        >
                          <option value="RA">RA</option>
                          <option value="LAB_MANAGER">Lab Manager</option>
                          <option value="PI">PI</option>
                          <option value="SAFETY_OFFICER">Safety</option>
                        </select>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow-xs shrink-0"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Staff Checkbox Grid with Delete Option */}
                {staffList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Tiada staf didaftarkan. Sila klik butang "+ Tambah Emel Staf" di atas untuk menambah staf makmal.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {staffList.map((staff) => {
                      const isChecked = selectedStaffIds.includes(staff.id);
                      return (
                        <div
                          key={staff.id}
                          onClick={() => toggleRecipient(staff.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 group ${
                            isChecked
                              ? "bg-teal-50/70 border-teal-300 ring-1 ring-teal-300"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent div
                              className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">{staff.name}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 shrink-0">
                                  {staff.role}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] truncate font-mono">
                                {staff.email}
                              </div>
                            </div>
                          </div>

                          {/* 1-Click Delete Button (Buang Emel Staf) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStaff(staff.id);
                            }}
                            className="opacity-60 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title={`Buang emel ${staff.name} (${staff.email})`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom Note input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota / Arahan Khas Pengurus Makmal (Disertakan dalam Emel)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Contoh: Sila periksa baki fizikal di rak B2 sebelum jam 3 petang ini."
                  className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Email Live Preview Box */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>Pratonton Kandungan Emel Staf</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Subjek: <strong className="text-slate-800">{emailSubject}</strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap selection:bg-teal-500">
                  {emailBodyText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {selectedRecipients.length > 0 ? (
                    <span>
                      Emel akan dihantar kepada{" "}
                      <strong className="text-slate-900">{selectedRecipients.length} staf</strong>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">Sila tandakan staf penerima di atas.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDraft}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Disalin!" : "Salin Draf"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedRecipients.length === 0 || alertItems.length === 0}
                    onClick={handleOpenMailto}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Buka Klien Emel (mailto:) & Hantar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED STAFF DIRECTORY */}
          {activeTab === "directory" && (
            <div className="space-y-6">
              {/* Add New Staff Form */}
              <form onSubmit={handleAddNewStaff} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  <span>Daftar Staf / Penyelidik Makmal Baharu</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Penuh *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="Contoh: Siti Aisyah"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Alamat Emel Rasmi *
                    </label>
                    <input
                      type="email"
                      required
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="Contoh: aisyah@chemlab.gov.my"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Peranan Makmal
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="RA">Pembantu Penyelidik (RA)</option>
                      <option value="LAB_MANAGER">Pengurus Makmal (Lab Manager)</option>
                      <option value="PI">Ketua Penyelidik (PI)</option>
                      <option value="SAFETY_OFFICER">Pegawai Keselamatan Makmal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Jabatan / Unit
                    </label>
                    <input
                      type="text"
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                      placeholder="Contoh: Unit Sintesis Kimia Makmal"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaffLowStock}
                        onChange={(e) => setNewStaffLowStock(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Amaran Stok</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaffExpiry}
                        onChange={(e) => setNewStaffExpiry(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Amaran Luput</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Staf</span>
                  </button>
                </div>
              </form>

              {/* Staff Directory Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4">Nama Staf</th>
                      <th className="py-2.5 px-3">Emel Rasmi</th>
                      <th className="py-2.5 px-2">Peranan</th>
                      <th className="py-2.5 px-3">Jabatan / Unit</th>
                      <th className="py-2.5 px-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{staff.name}</td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                          {staff.email}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">{staff.department}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Padam staf"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              {emailLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Tiada rekod penghantaran notifikasi emel sebelum ini.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-2.5 px-4">Tarikh & Masa</th>
                        <th className="py-2.5 px-3">Subjek</th>
                        <th className="py-2.5 px-3">Penerima Staf</th>
                        <th className="py-2.5 px-2 text-center">Bilangan Item</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString("ms-MY")}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{log.subject}</td>
                          <td className="py-3 px-3 text-slate-600 text-[11px]">
                            {log.recipientNames.join(", ")}
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-teal-700">
                            {log.itemCount} item
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            ChemLab Flow • Notifikasi Makmal
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
