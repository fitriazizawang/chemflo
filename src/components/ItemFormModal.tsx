import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  Flame,
  Skull,
  Shield,
  HelpCircle,
  Building2,
  Tag,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { InventoryItem, ItemCategory, HazardTag } from "../types/inventory";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  initialItem?: InventoryItem | null;
}

// Preset samples of real lab bottles for instant 1-click AI testing
const PRESET_LAB_SAMPLES = [
  {
    label: "Merck Ethanol 99.8% (Botol Kaca Koko)",
    brand: "Merck",
    spec: "500 mL Botol Kaca Gelap",
    category: "CHEMICAL" as ItemCategory,
    query: "Ethanol Absolute 99.8% AR Grade",
    imageUrl: "",
  },
  {
    label: "Fisher Hydrochloric Acid 37%",
    brand: "Fisher Scientific",
    spec: "1.0 L Botol Kaca Salutan PVC",
    category: "CHEMICAL" as ItemCategory,
    query: "Hydrochloric Acid 37% Fuming ACS",
    imageUrl: "",
  },
  {
    label: "Falcon 50 mL Centrifuge Tubes",
    brand: "Corning Falcon",
    spec: "Pek 500 unit (Sterile)",
    category: "CONSUMABLE" as ItemCategory,
    query: "Falcon 50 mL Conical Centrifuge Tubes",
    imageUrl: "",
  },
  {
    label: "Top Glove Sarung Tangan Nitril M",
    brand: "Top Glove",
    spec: "Kotak 100 keping (Size M)",
    category: "CONSUMABLE" as ItemCategory,
    query: "Nitrile Examination Gloves Powder-Free M",
    imageUrl: "",
  },
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState<string>(initialItem?.name || "");
  const [category, setCategory] = useState<ItemCategory>(initialItem?.category || "CHEMICAL");
  const [brand, setBrand] = useState<string>(initialItem?.brand || "Merck");
  const [specPackaging, setSpecPackaging] = useState<string>(initialItem?.specPackaging || "500 mL Botol Kaca Koko");
  const [currentQuantity, setCurrentQuantity] = useState<number>(initialItem?.currentQuantity ?? 5);
  const [minThreshold, setMinThreshold] = useState<number>(initialItem?.minThreshold ?? 3);
  const [expiryDate, setExpiryDate] = useState<string>(
    initialItem?.expiryDate || "2027-12-31"
  );
  const [supplierName, setSupplierName] = useState<string>(
    initialItem?.supplierName || "Merck Malaysia (Sigma-Aldrich)"
  );
  const [unitPriceMYR, setUnitPriceMYR] = useState<number>(initialItem?.unitPriceMYR ?? 185.0);
  const [hazardTag, setHazardTag] = useState<HazardTag>(initialItem?.hazardTag || "FLAMMABLE");
  const [location, setLocation] = useState<string>(initialItem?.location || "Kabinet Kimia Makmal Utama");
  const [safetyNote, setSafetyNote] = useState<string>(initialItem?.safetyNote || "");
  const [imageUrl, setImageUrl] = useState<string>(
    initialItem?.imageUrl || "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=60"
  );

  // AI Extraction State
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string>("");
  const [aiErrorMessage, setAiErrorMessage] = useState<string>("");

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setBrand(initialItem.brand);
      setSpecPackaging(initialItem.specPackaging);
      setCurrentQuantity(initialItem.currentQuantity);
      setMinThreshold(initialItem.minThreshold);
      setExpiryDate(initialItem.expiryDate);
      setSupplierName(initialItem.supplierName);
      setUnitPriceMYR(initialItem.unitPriceMYR);
      setHazardTag(initialItem.hazardTag);
      setLocation(initialItem.location || "");
      setSafetyNote(initialItem.safetyNote || "");
      setImageUrl(initialItem.imageUrl || "");
    }
  }, [initialItem]);

  // Handle image upload from user device camera or file
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImageBase64(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select a preset lab bottle
  const applyPresetSample = (sample: typeof PRESET_LAB_SAMPLES[0]) => {
    setBrand(sample.brand);
    setSpecPackaging(sample.spec);
    setCategory(sample.category);
    setName(sample.query);
    setImageUrl(sample.imageUrl);
    setAiSuccessMessage(`Contoh "${sample.label}" dipilih. Tekan "Cari Butiran & Harga Pembekal (AI)" untuk memproses.`);
  };

  // Call server-side Gemini API for AI Vision & Supplier Price Extraction
  const handleAiExtract = async () => {
    setIsAiLoading(true);
    setAiSuccessMessage("");
    setAiErrorMessage("");

    try {
      const response = await fetch("/api/ai/extract-chem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64 || undefined,
          brand,
          specPackaging,
          queryText: name || brand || "Laboratory reagent",
          category,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const d = resData.data;
        if (d.name) setName(d.name);
        if (d.category) setCategory(d.category);
        if (d.brand) setBrand(d.brand);
        if (d.specPackaging) setSpecPackaging(d.specPackaging);
        if (d.hazardTag) setHazardTag(d.hazardTag);
        if (d.supplierName) setSupplierName(d.supplierName);
        if (typeof d.unitPriceMYR === "number") setUnitPriceMYR(d.unitPriceMYR);
        if (d.safetyNote) setSafetyNote(d.safetyNote);

        setAiSuccessMessage(
          `Berjaya dikesan oleh AI! Pembekal: ${d.supplierName} • Anggaran Harga: RM ${d.unitPriceMYR.toFixed(
            2
          )} ${d.minPriceMYR ? `(Julat: RM${d.minPriceMYR} - RM${d.maxPriceMYR})` : ""}`
        );
      } else {
        setAiErrorMessage("AI tidak dapat mengekstrak maklumat. Sila lengkapkan borang secara manual.");
      }
    } catch (err: any) {
      console.error(err);
      setAiErrorMessage("Ralat sambungan AI. Anda boleh mengisi harga dan pembekal secara manual.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Sila masukkan nama item.");
      return;
    }

    const itemToSave: InventoryItem = {
      id: initialItem?.id || `item-${Date.now()}`,
      name: name.trim(),
      category,
      brand: brand.trim() || "Merck",
      specPackaging: specPackaging.trim() || "Piawai",
      currentQuantity: Number(currentQuantity) || 0,
      minThreshold: Number(minThreshold) || 3,
      expiryDate,
      supplierName: supplierName.trim() || "Pembekal Makmal Malaysia",
      unitPriceMYR: Number(unitPriceMYR) || 0,
      // For Consumables, hazard tag defaults to GENERAL_NON_HAZARDOUS as per AC-01
      hazardTag: category === "CHEMICAL" ? hazardTag : "GENERAL_NON_HAZARDOUS",
      location: location.trim(),
      safetyNote: safetyNote.trim(),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=60",
      createdAt: initialItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {initialItem ? "Sunting Rekod Inventori" : "Daftar Item Baharu Berbantu AI"}
              </h3>
              <p className="text-xs text-slate-400">
                Pengecaman Vision Gemini & Carian Harga Pembekal Malaysia (FR-002)
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* Section: AI Vision & Photo Upload Panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Pengecaman AI Vision & Carian Pembekal (FR-002)</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Google Gemini
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Ambil gambar botol/kotak atau pilih contoh makmal untuk mengekstrak nama kimia, pembekal Malaysia, dan harga anggaran seunit (RM).
            </p>

            {/* Photo Preview & Upload Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-emerald-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-emerald-400" />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white text-[10px] font-medium flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Ubah</span>
                </button>
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:border-emerald-400 text-emerald-800 text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Muat Naik Foto / Kamera</span>
                  </button>

                  <button
                    type="button"
                    disabled={isAiLoading}
                    onClick={handleAiExtract}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 hover:scale-[1.02]"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengekstrak AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Cari Butiran & Harga Pembekal (AI)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Lab Samples Quick Selector */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 font-medium mr-1.5">Contoh Pantas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {PRESET_LAB_SAMPLES.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPresetSample(s)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-emerald-100 text-slate-700 border border-slate-200 transition-colors"
                      >
                        {s.brand} {s.category === "CHEMICAL" ? "🧪" : "📦"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Success / Error Banner */}
            {aiSuccessMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}
            {aiErrorMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{aiErrorMessage}</span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 1: Category (Strict Dwi-Kategori) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kategori Item Makmal *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory("CHEMICAL")}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    category === "CHEMICAL"
                      ? "border-slate-900 bg-slate-50 text-slate-900 font-bold ring-1 ring-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <Flame className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Bahan Kimia (Reagen / Pelarut)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Reagen, pelarut AR, asid, garam</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory("CONSUMABLE")}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    category === "CONSUMABLE"
                      ? "border-slate-900 bg-slate-50 text-slate-900 font-bold ring-1 ring-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                    <Shield className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Consumables &amp; Alatan Makmal</div>
                    <div className="text-[10px] text-slate-500 font-normal">Sarung tangan, tips, tiub, turas</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Field 2: Item Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Item / Nama Kimia Saintifik *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ethanol Absolute 99.8% AR Grade"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900"
              />
            </div>

            {/* Field 3: Brand */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenama (Brand) *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Contoh: Merck, Sigma-Aldrich, Falcon"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Field 4: Specification & Packaging */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Spesifikasi / Saiz & Pakej *
              </label>
              <input
                type="text"
                required
                value={specPackaging}
                onChange={(e) => setSpecPackaging(e.target.value)}
                placeholder="Contoh: 500 mL Botol Kaca Koko, Kotak 100 pcs"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* AC-01: Conditional Hazard Tag (VISIBLE ONLY FOR CHEMICALS, HIDDEN FOR CONSUMABLES) */}
            {category === "CHEMICAL" && (
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 animate-in fade-in">
                <label className="block text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Pengelasan Keselamatan Bahan Kimia (Hazard Tag) *</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setHazardTag("FLAMMABLE")}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      hazardTag === "FLAMMABLE"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Mudah Terbakar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHazardTag("CORROSIVE")}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      hazardTag === "CORROSIVE"
                        ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Mengakis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHazardTag("TOXIC")}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      hazardTag === "TOXIC"
                        ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Skull className="w-3.5 h-3.5" />
                    <span>Toksik / Racun</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHazardTag("GENERAL_NON_HAZARDOUS")}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      hazardTag === "GENERAL_NON_HAZARDOUS"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Bukan Bahaya</span>
                  </button>
                </div>
              </div>
            )}

            {/* Field 5: Current Quantity & Min Threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kuantiti Semasa (Units on hand) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Had Minimum Amaran (Default: 3) *</span>
                <span className="text-[10px] text-slate-400">≤ had = amaran</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs font-bold px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Field 6: Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tarikh Luput (Expiry Date) *</span>
                <span className="text-[10px] text-slate-400">YYYY-MM-DD</span>
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Field 7: Unit Price (MYR) - AC-02 (Can be edited by user) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Harga Seunit Pasaran (RM) *</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Boleh disunting</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">RM</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitPriceMYR}
                  onChange={(e) => setUnitPriceMYR(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Field 8: Supplier Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Nama Pembekal / Pengedar *</span>
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Contoh: Merck Malaysia, Chemopharm Sdn Bhd"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Field 9: Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Simpanan Makmal
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Kabinet Pelarut A1, Rak Guna Habis B2"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Field 10: Safety notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nota Keselamatan & Pengendalian
              </label>
              <input
                type="text"
                value={safetyNote}
                onChange={(e) => setSafetyNote(e.target.value)}
                placeholder="Contoh: Cecair mudah terbakar. Gunakan di dalam kebuk wasap."
                className="w-full text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01]"
            >
              {initialItem ? "Simpan Perubahan" : "Daftar Item ke Inventori"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
