import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with support for camera photo base64
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Initialize GoogleGenAI client with required header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// POST /api/ai/extract-chem
app.post("/api/ai/extract-chem", async (req, res) => {
  const { imageBase64, mimeType, brand, specPackaging, queryText, category } = req.body;

  try {
    if (!ai) {
      // Graceful fallback if no API key is configured yet
      return res.json({
        success: true,
        source: "fallback",
        data: generateFallbackData(queryText, brand, specPackaging, category),
        message: "Katalog dicadangkan secara anggaran makmal (Kunci API Gemini tidak dikesan). Anda boleh menyunting sebelum simpan.",
      });
    }

    const contents: any[] = [];
    const promptParts: any[] = [];

    // Multimodal image part if provided
    if (imageBase64) {
      // Clean base64 data header if included
      const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      promptParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const textPrompt = `You are an expert laboratory chemist and chemical inventory procurement specialist in Malaysia.
Analyze the provided laboratory product image (if provided) and user input:
- Brand input: "${brand || "Unspecified"}"
- Specification/Packaging input: "${specPackaging || "Unspecified"}"
- Item name or keywords: "${queryText || "Unspecified"}"
- Suspected Category: "${category || "CHEMICAL"}"

Task:
1. Extract or determine the exact chemical/consumable scientific or catalog name (e.g., "Ethanol Absolute 99.8% AR Grade", "Hydrochloric Acid 37% ACS Reagent", "Nitrile Examination Gloves Powder-Free (Medium)", "Falcon 50 mL Conical Centrifuge Tubes").
2. Validate the correct category: must be "CHEMICAL" or "CONSUMABLE".
3. Determine the hazard classification tag: "FLAMMABLE", "CORROSIVE", "TOXIC", or "GENERAL_NON_HAZARDOUS" (for consumables, usually GENERAL_NON_HAZARDOUS).
4. Identify 2-3 genuine laboratory suppliers/distributors active in Malaysia (e.g., "Merck Malaysia", "Sigma-Aldrich Malaysia", "Fisher Scientific (Thermo Fisher)", "Chemopharm", "VWR Malaysia", "Bumi Pharma", "Bio-Rad Malaysia", "Avantor").
5. Provide a realistic benchmark market unit price in Malaysian Ringgit (MYR / RM) for university/R&D laboratory procurement in Malaysia, along with a reasonable min/max price range in MYR.
6. Provide a concise 1-sentence safe handling or storage note (e.g. "Simpan dalam kabinet bahan mudah terbakar berventilasi baik.").

Return structured JSON.`;

    promptParts.push({ text: textPrompt });
    contents.push({ parts: promptParts });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "Full scientific/catalog name of the chemical or lab consumable.",
            },
            category: {
              type: Type.STRING,
              description: "Must be either CHEMICAL or CONSUMABLE.",
            },
            brand: {
              type: Type.STRING,
              description: "Identified or confirmed brand name (e.g. Merck, Sigma-Aldrich, Falcon, Fisher).",
            },
            specPackaging: {
              type: Type.STRING,
              description: "Packaging or volume specification, e.g. 500 mL Amber Bottle, Box of 100 pcs, 2.5 L Drum.",
            },
            hazardTag: {
              type: Type.STRING,
              description: "One of: FLAMMABLE, CORROSIVE, TOXIC, GENERAL_NON_HAZARDOUS.",
            },
            supplierName: {
              type: Type.STRING,
              description: "Primary recommended supplier in Malaysia (e.g. Merck Malaysia, Chemopharm Sdn Bhd).",
            },
            alternativeSuppliers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Alternative lab suppliers in Malaysia/ASEAN.",
            },
            unitPriceMYR: {
              type: Type.NUMBER,
              description: "Estimated realistic procurement unit price in Ringgit Malaysia (MYR).",
            },
            minPriceMYR: {
              type: Type.NUMBER,
              description: "Lower estimate of price range in MYR.",
            },
            maxPriceMYR: {
              type: Type.NUMBER,
              description: "Upper estimate of price range in MYR.",
            },
            safetyNote: {
              type: Type.STRING,
              description: "Brief lab safety and storage recommendation in Malay or English.",
            },
          },
          required: ["name", "category", "brand", "specPackaging", "hazardTag", "supplierName", "unitPriceMYR"],
        },
      },
    });

    const rawText = response.text || "{}";
    const parsed = JSON.parse(rawText);

    return res.json({
      success: true,
      source: "gemini",
      data: parsed,
    });
  } catch (error: any) {
    console.error("Gemini API Error in extract-chem:", error);
    // Graceful fallback on API error as per PRD requirement
    const fallback = generateFallbackData(queryText, brand, specPackaging, category);
    return res.json({
      success: true,
      source: "fallback",
      data: fallback,
      message: "Cadangan harga berasaskan anggaran pangkalan data makmal (Carian AI mengalami kelewatan).",
    });
  }
});

// Helper for fallback data matching PRD lab examples
function generateFallbackData(query?: string, brand?: string, spec?: string, cat?: string) {
  const text = (query || "").toLowerCase();
  const detectedCategory = cat === "CONSUMABLE" || text.includes("glove") || text.includes("tip") || text.includes("tube") || text.includes("falcon")
    ? "CONSUMABLE"
    : "CHEMICAL";

  if (text.includes("ethanol") || text.includes("etoh")) {
    return {
      name: "Ethanol Absolute 99.8% AR Grade",
      category: "CHEMICAL",
      brand: brand || "Merck",
      specPackaging: spec || "500 mL Botol Kaca Koko",
      hazardTag: "FLAMMABLE",
      supplierName: "Merck Malaysia (Sigma-Aldrich)",
      alternativeSuppliers: ["Chemopharm Sdn Bhd", "Fisher Scientific Malaysia"],
      unitPriceMYR: 185.0,
      minPriceMYR: 160.0,
      maxPriceMYR: 210.0,
      safetyNote: "Mudah terbakar. Simpan jauh daripada punca api dan haba.",
    };
  }

  if (text.includes("acetone")) {
    return {
      name: "Acetone AR Grade 99.5%",
      category: "CHEMICAL",
      brand: brand || "Merck",
      specPackaging: spec || "2.5 L Botol Kaca",
      hazardTag: "FLAMMABLE",
      supplierName: "Merck Malaysia",
      alternativeSuppliers: ["Chemiz Enterprise", "Fisher Scientific"],
      unitPriceMYR: 145.0,
      minPriceMYR: 130.0,
      maxPriceMYR: 170.0,
      safetyNote: "Mudah meruap dan terbakar. Gunakan di dalam kebuk wasap (fume hood).",
    };
  }

  if (text.includes("hydrochloric") || text.includes("hcl")) {
    return {
      name: "Hydrochloric Acid 37% Fuming AR Grade",
      category: "CHEMICAL",
      brand: brand || "Merck",
      specPackaging: spec || "1.0 L Botol Kaca",
      hazardTag: "CORROSIVE",
      supplierName: "Fisher Scientific Malaysia",
      alternativeSuppliers: ["Merck Malaysia", "Bumi Pharma"],
      unitPriceMYR: 120.0,
      minPriceMYR: 95.0,
      maxPriceMYR: 140.0,
      safetyNote: "Bahan mengakis kuat dan mengeluarkan wasap pedih. Wajib guna kebuk wasap dan sarung tangan tahan asid.",
    };
  }

  if (text.includes("glove") || text.includes("sarung")) {
    return {
      name: "Nitrile Examination Gloves Powder-Free",
      category: "CONSUMABLE",
      brand: brand || "Top Glove / Shield Scientific",
      specPackaging: spec || "Kotak 100 keping (Size M)",
      hazardTag: "GENERAL_NON_HAZARDOUS",
      supplierName: "Labchem Supplies Malaysia",
      alternativeSuppliers: ["SafetyCare Supplies", "Fisher Scientific"],
      unitPriceMYR: 48.0,
      minPriceMYR: 38.0,
      maxPriceMYR: 58.0,
      safetyNote: "Simpan di kawasan kering dan terhindar dari cahaya matahari terus.",
    };
  }

  if (text.includes("falcon") || text.includes("tube") || text.includes("tiub")) {
    return {
      name: "Falcon 50 mL Conical Centrifuge Tubes (Sterile)",
      category: "CONSUMABLE",
      brand: brand || "Corning Falcon",
      specPackaging: spec || "Pek 500 unit (20 beg x 25)",
      hazardTag: "GENERAL_NON_HAZARDOUS",
      supplierName: "Corning Life Sciences (M) Sdn Bhd",
      alternativeSuppliers: ["Chemopharm Sdn Bhd", "Merck Malaysia"],
      unitPriceMYR: 380.0,
      minPriceMYR: 350.0,
      maxPriceMYR: 420.0,
      safetyNote: "Bebas RNase/DNase, steril dan tidak pirogenik.",
    };
  }

  return {
    name: query || (detectedCategory === "CHEMICAL" ? "Bahan Kimia Makmal AR Grade" : "Lab Consumable Item"),
    category: detectedCategory,
    brand: brand || (detectedCategory === "CHEMICAL" ? "Merck" : "Thermo Scientific"),
    specPackaging: spec || (detectedCategory === "CHEMICAL" ? "500 mL Botol" : "Pek 100 pcs"),
    hazardTag: detectedCategory === "CHEMICAL" ? "GENERAL_NON_HAZARDOUS" : "GENERAL_NON_HAZARDOUS",
    supplierName: "Pembekal Makmal Malaysia (Katalog Berdaftar)",
    alternativeSuppliers: ["Merck Malaysia", "Chemopharm", "Fisher Scientific"],
    unitPriceMYR: detectedCategory === "CHEMICAL" ? 150.0 : 65.0,
    minPriceMYR: 120.0,
    maxPriceMYR: 200.0,
    safetyNote: "Semak SDS (Safety Data Sheet) sebelum penggunaan makmal.",
  };
}

// Vite middleware for dev or static serving for prod
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`ChemLab Flow server running on http://localhost:${PORT}`);
  });
}

startServer();
