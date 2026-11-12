import * as XLSX from "xlsx";
import { InventoryItem, ItemCategory, HazardTag } from "../types/inventory";

// Sample rows pre-populated in the Excel template
export const EXCEL_SAMPLE_ROWS = [
  {
    "Nama Item": "Methanol 99.8% AR Grade",
    "Kategori": "Bahan Kimia",
    "Jenama": "Merck",
    "Spesifikasi_Pakej": "2.5 L Botol Kaca Koko",
    "Kuantiti_Semasa": 6,
    "Had_Minimum": 3,
    "Tarikh_Luput": "2027-11-30",
    "Pembekal": "Merck Malaysia (Sigma-Aldrich)",
    "Harga_Seunit_MYR": 165.0,
    "Hazard_Tag": "TOXIC",
    "Lokasi_Simpanan": "Kabinet Pelarut Mudah Terbakar A1",
    "Nota_Keselamatan": "Toksik dan mudah terbakar. Gunakan di dalam kebuk wasap.",
  },
  {
    "Nama Item": "Sulfuric Acid 95-98% ACS Reagent",
    "Kategori": "Bahan Kimia",
    "Jenama": "Fisher Scientific",
    "Spesifikasi_Pakej": "2.5 L Botol Kaca Bersalut",
    "Kuantiti_Semasa": 4,
    "Had_Minimum": 3,
    "Tarikh_Luput": "2028-05-15",
    "Pembekal": "Fisher Scientific Malaysia",
    "Harga_Seunit_MYR": 210.0,
    "Hazard_Tag": "CORROSIVE",
    "Lokasi_Simpanan": "Kabinet Asid Kakisan B1",
    "Nota_Keselamatan": "Asid mengakis kuat. Sentiasa tambah asid ke dalam air perlahan-lahan.",
  },
  {
    "Nama Item": "Nitrile Gloves Powder-Free (Large)",
    "Kategori": "Consumables",
    "Jenama": "Top Glove",
    "Spesifikasi_Pakej": "Kotak 100 keping (Size L)",
    "Kuantiti_Semasa": 10,
    "Had_Minimum": 3,
    "Tarikh_Luput": "2029-06-30",
    "Pembekal": "Labchem Supplies Malaysia",
    "Harga_Seunit_MYR": 48.0,
    "Hazard_Tag": "GENERAL_NON_HAZARDOUS",
    "Lokasi_Simpanan": "Rak Guna Habis Bilik Bersih",
    "Nota_Keselamatan": "Simpan di tempat kering terhindar dari cahaya matahari.",
  },
  {
    "Nama Item": "Cryovials 2.0 mL Internal Thread Sterile",
    "Kategori": "Consumables",
    "Jenama": "Corning",
    "Spesifikasi_Pakej": "Pek 500 unit (Bebas RNase/DNase)",
    "Kuantiti_Semasa": 5,
    "Had_Minimum": 3,
    "Tarikh_Luput": "2030-01-01",
    "Pembekal": "Chemopharm Sdn Bhd",
    "Harga_Seunit_MYR": 320.0,
    "Hazard_Tag": "GENERAL_NON_HAZARDOUS",
    "Lokasi_Simpanan": "Kabinet Biologi Molekular",
    "Nota_Keselamatan": "Sesuai untuk penyimpanan fasa wap nitrogen cecair (-196°C).",
  },
  {
    "Nama Item": "Potassium Hydroxide Pellets 85%",
    "Kategori": "Bahan Kimia",
    "Jenama": "Sigma-Aldrich",
    "Spesifikasi_Pakej": "1.0 kg Botol Plastik HDPE",
    "Kuantiti_Semasa": 2,
    "Had_Minimum": 3,
    "Tarikh_Luput": "2027-09-20",
    "Pembekal": "Bumi Pharma Sdn Bhd",
    "Harga_Seunit_MYR": 115.0,
    "Hazard_Tag": "CORROSIVE",
    "Lokasi_Simpanan": "Kabinet Bes B2",
    "Nota_Keselamatan": "Bahan bes mengakis dan higroskopik.",
  },
];

// Generate and trigger download of official Excel Template (.xlsx)
export function downloadExcelTemplate(): void {
  const ws = XLSX.utils.json_to_sheet(EXCEL_SAMPLE_ROWS);

  // Set column widths for clean Excel layout
  ws["!cols"] = [
    { wch: 35 }, // Nama Item
    { wch: 16 }, // Kategori
    { wch: 18 }, // Jenama
    { wch: 28 }, // Spesifikasi_Pakej
    { wch: 16 }, // Kuantiti_Semasa
    { wch: 14 }, // Had_Minimum
    { wch: 15 }, // Tarikh_Luput
    { wch: 30 }, // Pembekal
    { wch: 18 }, // Harga_Seunit_MYR
    { wch: 22 }, // Hazard_Tag
    { wch: 30 }, // Lokasi_Simpanan
    { wch: 40 }, // Nota_Keselamatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Templat_Inventori");

  // Write and trigger download
  XLSX.writeFile(wb, "ChemLab_Templat_Daftar_Inventori.xlsx");
}

export interface ParsedExcelRow {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
  item: Partial<InventoryItem>;
  raw: Record<string, any>;
}

// Map flexible Excel column names in Malay / English to InventoryItem properties
export function parseExcelRows(rawRows: Record<string, any>[]): ParsedExcelRow[] {
  return rawRows.map((row, index) => {
    const errors: string[] = [];

    // Flexible key finders
    const findValue = (possibleKeys: string[]): any => {
      for (const key of possibleKeys) {
        // Direct match
        if (row[key] !== undefined && row[key] !== null) return row[key];
        // Case-insensitive match
        const found = Object.keys(row).find(
          (k) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === key.toLowerCase().replace(/[^a-z0-9]/g, "")
        );
        if (found && row[found] !== undefined && row[found] !== null) return row[found];
      }
      return undefined;
    };

    const nameVal = findValue(["Nama Item", "Nama", "Item Name", "Name", "Chemical Name", "Bahan"]);
    const categoryVal = findValue(["Kategori", "Category", "Jenis", "Type"]);
    const brandVal = findValue(["Jenama", "Brand", "Manufacturer", "Pengeluar"]);
    const specVal = findValue(["Spesifikasi_Pakej", "Spesifikasi", "Pakej", "Packaging", "Spec", "Size", "Saiz"]);
    const qtyVal = findValue(["Kuantiti_Semasa", "Kuantiti", "Quantity", "Baki", "Stok", "Units"]);
    const minVal = findValue(["Had_Minimum", "Had Minimum", "Min Threshold", "Threshold", "Min"]);
    const expiryVal = findValue(["Tarikh_Luput", "Tarikh Luput", "Expiry Date", "Expiry", "Luput"]);
    const supplierVal = findValue(["Pembekal", "Supplier", "Vendor", "Pengedar"]);
    const priceVal = findValue(["Harga_Seunit_MYR", "Harga Seunit", "Harga", "Unit Price", "Price", "Cost"]);
    const hazardVal = findValue(["Hazard_Tag", "Hazard Tag", "Hazard", "Bahaya", "Tag"]);
    const locationVal = findValue(["Lokasi_Simpanan", "Lokasi", "Location", "Rak", "Kabinet"]);
    const safetyVal = findValue(["Nota_Keselamatan", "Nota", "Safety Notes", "Safety"]);

    // Validation
    const name = typeof nameVal === "string" ? nameVal.trim() : String(nameVal || "").trim();
    if (!name) {
      errors.push("Nama item tidak boleh kosong");
    }

    // Category mapping
    let category: ItemCategory = "CHEMICAL";
    const catStr = String(categoryVal || "").toLowerCase();
    if (catStr.includes("consumable") || catStr.includes("pakai buang") || catStr.includes("guna habis")) {
      category = "CONSUMABLE";
    } else {
      category = "CHEMICAL";
    }

    // Hazard tag mapping
    let hazardTag: HazardTag = "GENERAL_NON_HAZARDOUS";
    if (category === "CHEMICAL") {
      const hazStr = String(hazardVal || "").toUpperCase();
      if (hazStr.includes("FLAM") || hazStr.includes("TERBAKAR")) hazardTag = "FLAMMABLE";
      else if (hazStr.includes("CORR") || hazStr.includes("KAKIS") || hazStr.includes("ASID")) hazardTag = "CORROSIVE";
      else if (hazStr.includes("TOX") || hazStr.includes("RACUN")) hazardTag = "TOXIC";
      else hazardTag = "GENERAL_NON_HAZARDOUS";
    }

    // Quantity validation
    let currentQuantity = parseInt(String(qtyVal), 10);
    if (isNaN(currentQuantity) || currentQuantity < 0) {
      currentQuantity = 0;
    }

    let minThreshold = parseInt(String(minVal), 10);
    if (isNaN(minThreshold) || minThreshold < 1) {
      minThreshold = 3;
    }

    // Price validation
    let unitPriceMYR = parseFloat(String(priceVal));
    if (isNaN(unitPriceMYR) || unitPriceMYR < 0) {
      unitPriceMYR = 50.0;
    }

    // Expiry date format check (supports Excel serial date number or string)
    let expiryDate = "2027-12-31";
    if (typeof expiryVal === "number") {
      // Excel serial date format conversion
      try {
        const dateObj = XLSX.SSF.parse_date_code(expiryVal);
        if (dateObj) {
          const y = dateObj.y;
          const m = String(dateObj.m).padStart(2, "0");
          const d = String(dateObj.d).padStart(2, "0");
          expiryDate = `${y}-${m}-${d}`;
        }
      } catch {
        expiryDate = "2027-12-31";
      }
    } else if (expiryVal) {
      const expStr = String(expiryVal).trim();
      // Handle standard YYYY-MM-DD or DD/MM/YYYY
      if (/^\d{4}-\d{2}-\d{2}$/.test(expStr)) {
        expiryDate = expStr;
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(expStr)) {
        const parts = expStr.split("/");
        expiryDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      } else {
        expiryDate = expStr;
      }
    }

    const item: Partial<InventoryItem> = {
      name,
      category,
      brand: String(brandVal || "Merck").trim(),
      specPackaging: String(specVal || (category === "CHEMICAL" ? "500 mL Botol" : "Pek Piawai")).trim(),
      currentQuantity,
      minThreshold,
      expiryDate,
      supplierName: String(supplierVal || "Pembekal Makmal Malaysia").trim(),
      unitPriceMYR,
      hazardTag,
      location: String(locationVal || "Rak Makmal Utama").trim(),
      safetyNote: String(safetyVal || "").trim(),
      imageUrl:
        category === "CHEMICAL"
          ? "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=60"
          : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60",
    };

    return {
      rowIndex: index + 2, // 1-based index considering Excel header row
      isValid: errors.length === 0,
      errors,
      item,
      raw: row,
    };
  });
}
