import { ThemeId, ThemePalette } from "../types/theme";

export const THEME_PALETTES: ThemePalette[] = [
  // 1. Emerald Lab (Default)
  {
    id: "emerald-lab",
    name: "Emerald Lab (Lalai)",
    category: "Makmal R&D Piawai",
    description: "Tema hijau zamrud dan teal makmal penyelidikan yang bersih dan tenang.",
    primaryHex: "#059669",
    secondaryHex: "#0d9488",
    bgHex: "#0f172a",
    vars: {
      "--color-primary": "#059669",
      "--color-primary-hover": "#047857",
      "--color-primary-light": "#ecfdf5",
      "--color-primary-border": "#a7f3d0",
      "--color-primary-text": "#065f46",
      "--color-header-from": "#0f172a",
      "--color-header-via": "#1e293b",
      "--color-header-to": "#042f2e",
      "--color-accent": "#34d399",
    },
    classes: {
      headerGradient: "from-slate-900 via-slate-800 to-teal-950",
      primaryButton: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20",
      primaryText: "text-emerald-700",
      primaryBorder: "border-emerald-300",
      primaryBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      activeTab: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      glowRing: "ring-emerald-500/30",
    },
  },

  // 2. Sapphire Bio-Clinical
  {
    id: "sapphire-clinical",
    name: "Sapphire Bio-Clinical",
    category: "Bioteknologi Klinikal",
    description: "Warna biru kobalt dan nilam laut untuk makmal klinikal dan diagnostik perubatan.",
    primaryHex: "#2563eb",
    secondaryHex: "#0284c7",
    bgHex: "#0f172a",
    vars: {
      "--color-primary": "#2563eb",
      "--color-primary-hover": "#1d4ed8",
      "--color-primary-light": "#eff6ff",
      "--color-primary-border": "#bfdbfe",
      "--color-primary-text": "#1e40af",
      "--color-header-from": "#0f172a",
      "--color-header-via": "#1e293b",
      "--color-header-to": "#172554",
      "--color-accent": "#60a5fa",
    },
    classes: {
      headerGradient: "from-slate-900 via-slate-800 to-blue-950",
      primaryButton: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20",
      primaryText: "text-blue-700",
      primaryBorder: "border-blue-300",
      primaryBadge: "bg-blue-100 text-blue-800 border-blue-200",
      activeTab: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      glowRing: "ring-blue-500/30",
    },
  },

  // 3. Cyberpunk Neon Lab
  {
    id: "cyber-violet",
    name: "Cyber Violet & Neon",
    category: "Futuristik & Nanoteknologi",
    description: "Palet berteknologi tinggi dengan ungu pendarfluor dan biru firus nano.",
    primaryHex: "#7c3aed",
    secondaryHex: "#06b6d4",
    bgHex: "#180928",
    vars: {
      "--color-primary": "#7c3aed",
      "--color-primary-hover": "#6d28d9",
      "--color-primary-light": "#f5f3ff",
      "--color-primary-border": "#ddd6fe",
      "--color-primary-text": "#5b21b6",
      "--color-header-from": "#180828",
      "--color-header-via": "#2e1065",
      "--color-header-to": "#164e63",
      "--color-accent": "#a78bfa",
    },
    classes: {
      headerGradient: "from-slate-950 via-purple-950 to-cyan-950",
      primaryButton: "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25",
      primaryText: "text-violet-700",
      primaryBorder: "border-violet-300",
      primaryBadge: "bg-violet-100 text-violet-800 border-violet-200",
      activeTab: "bg-violet-500/20 text-violet-300 border-violet-500/40",
      glowRing: "ring-violet-500/30",
    },
  },

  // 4. Amber Industrial Chemistry
  {
    id: "amber-chem",
    name: "Amber Industrial Chemistry",
    category: "Kimia Sintesis & Industri",
    description: "Warna ambar keemasan dan tembaga hangat bagi makmal tindak balas haba dan organik.",
    primaryHex: "#d97706",
    secondaryHex: "#ea580c",
    bgHex: "#1c1917",
    vars: {
      "--color-primary": "#d97706",
      "--color-primary-hover": "#b45309",
      "--color-primary-light": "#fffbeb",
      "--color-primary-border": "#fde68a",
      "--color-primary-text": "#92400e",
      "--color-header-from": "#1c1917",
      "--color-header-via": "#292524",
      "--color-header-to": "#451a03",
      "--color-accent": "#fbbf24",
    },
    classes: {
      headerGradient: "from-stone-900 via-stone-800 to-amber-950",
      primaryButton: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20",
      primaryText: "text-amber-800",
      primaryBorder: "border-amber-300",
      primaryBadge: "bg-amber-100 text-amber-900 border-amber-200",
      activeTab: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      glowRing: "ring-amber-500/30",
    },
  },

  // 5. Crimson Safety & Biohazard
  {
    id: "crimson-safety",
    name: "Crimson Safety Biohazard",
    category: "Keselamatan & Kawalan Bahaya",
    description: "Tema merah kirmizi dengan kontras tinggi khusus untuk pematuhan keselamatan biosafety.",
    primaryHex: "#e11d48",
    secondaryHex: "#be123c",
    bgHex: "#18181b",
    vars: {
      "--color-primary": "#e11d48",
      "--color-primary-hover": "#be123c",
      "--color-primary-light": "#fff1f2",
      "--color-primary-border": "#fecdd3",
      "--color-primary-text": "#9f1239",
      "--color-header-from": "#18181b",
      "--color-header-via": "#27272a",
      "--color-header-to": "#4c0519",
      "--color-accent": "#fb7185",
    },
    classes: {
      headerGradient: "from-zinc-900 via-zinc-800 to-rose-950",
      primaryButton: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20",
      primaryText: "text-rose-700",
      primaryBorder: "border-rose-300",
      primaryBadge: "bg-rose-100 text-rose-800 border-rose-200",
      activeTab: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      glowRing: "ring-rose-500/30",
    },
  },

  // 6. Nordic Frost Cleanroom
  {
    id: "nordic-frost",
    name: "Nordic Frost Cleanroom",
    category: "Bilik Bersih (Cleanroom)",
    description: "Tema fros nordik yang segar dengan tona ais sian dan kelabu platinum.",
    primaryHex: "#0284c7",
    secondaryHex: "#06b6d4",
    bgHex: "#082f49",
    vars: {
      "--color-primary": "#0284c7",
      "--color-primary-hover": "#0369a1",
      "--color-primary-light": "#f0f9ff",
      "--color-primary-border": "#bae6fd",
      "--color-primary-text": "#075985",
      "--color-header-from": "#0f172a",
      "--color-header-via": "#1e293b",
      "--color-header-to": "#082f49",
      "--color-accent": "#38bdf8",
    },
    classes: {
      headerGradient: "from-slate-900 via-slate-800 to-sky-950",
      primaryButton: "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20",
      primaryText: "text-sky-700",
      primaryBorder: "border-sky-300",
      primaryBadge: "bg-sky-100 text-sky-800 border-sky-200",
      activeTab: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      glowRing: "ring-sky-500/30",
    },
  },

  // 7. Forest Botany & Agro-Lab
  {
    id: "forest-botany",
    name: "Forest Botany & Agro-Lab",
    category: "Botani & Biotek Pertanian",
    description: "Hijau rimba dan daun semulajadi bagi makmal pertanian, tisu tumbuhan, dan agronomi.",
    primaryHex: "#15803d",
    secondaryHex: "#166534",
    bgHex: "#052e16",
    vars: {
      "--color-primary": "#15803d",
      "--color-primary-hover": "#166534",
      "--color-primary-light": "#f0fdf4",
      "--color-primary-border": "#bbf7d0",
      "--color-primary-text": "#14532d",
      "--color-header-from": "#022c22",
      "--color-header-via": "#064e3b",
      "--color-header-to": "#052e16",
      "--color-accent": "#4ade80",
    },
    classes: {
      headerGradient: "from-slate-900 via-slate-800 to-emerald-950",
      primaryButton: "bg-green-700 hover:bg-green-600 text-white shadow-green-700/20",
      primaryText: "text-green-800",
      primaryBorder: "border-green-300",
      primaryBadge: "bg-green-100 text-green-900 border-green-200",
      activeTab: "bg-green-600/20 text-green-300 border-green-600/40",
      glowRing: "ring-green-500/30",
    },
  },

  // 8. Amethyst Molecular Genetics
  {
    id: "amethyst-genetics",
    name: "Amethyst Molecular Genetics",
    category: "Genetik & Biologi Molekular",
    description: "Ungu ametis diraja dan lavender untuk penjujukan genom, PCR, dan mikrobiologi.",
    primaryHex: "#9333ea",
    secondaryHex: "#c026d3",
    bgHex: "#2e1065",
    vars: {
      "--color-primary": "#9333ea",
      "--color-primary-hover": "#7e22ce",
      "--color-primary-light": "#faf5ff",
      "--color-primary-border": "#e9d5ff",
      "--color-primary-text": "#6b21a8",
      "--color-header-from": "#1e1b4b",
      "--color-header-via": "#2e1065",
      "--color-header-to": "#3b0764",
      "--color-accent": "#c084fc",
    },
    classes: {
      headerGradient: "from-slate-900 via-indigo-950 to-purple-950",
      primaryButton: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25",
      primaryText: "text-purple-700",
      primaryBorder: "border-purple-300",
      primaryBadge: "bg-purple-100 text-purple-800 border-purple-200",
      activeTab: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      glowRing: "ring-purple-500/30",
    },
  },

  // 9. Midnight Executive PI
  {
    id: "midnight-pi",
    name: "Midnight Executive PI",
    category: "Pengurusan Eksekutif & Geran",
    description: "Arang obsidian dan aksen emas elegan untuk pengurus makmal dan ketua penyelidik.",
    primaryHex: "#334155",
    secondaryHex: "#d97706",
    bgHex: "#020617",
    vars: {
      "--color-primary": "#0f172a",
      "--color-primary-hover": "#1e293b",
      "--color-primary-light": "#f8fafc",
      "--color-primary-border": "#cbd5e1",
      "--color-primary-text": "#0f172a",
      "--color-header-from": "#020617",
      "--color-header-via": "#0f172a",
      "--color-header-to": "#1e293b",
      "--color-accent": "#f59e0b",
    },
    classes: {
      headerGradient: "from-black via-slate-950 to-slate-900",
      primaryButton: "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20",
      primaryText: "text-slate-900",
      primaryBorder: "border-slate-400",
      primaryBadge: "bg-slate-200 text-slate-800 border-slate-300",
      activeTab: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      glowRing: "ring-slate-500/30",
    },
  },

  // 10. Teal Petrochem & Polymer
  {
    id: "teal-polymer",
    name: "Teal Petrochem & Polymer",
    category: "Polimer & Sains Bahan",
    description: "Biru firus dan kelabu ferum bagi sains bahan termaju, polimer, dan petrokimia.",
    primaryHex: "#0d9488",
    secondaryHex: "#0891b2",
    bgHex: "#042f2e",
    vars: {
      "--color-primary": "#0d9488",
      "--color-primary-hover": "#0f766e",
      "--color-primary-light": "#f0fdfa",
      "--color-primary-border": "#99f6e4",
      "--color-primary-text": "#115e59",
      "--color-header-from": "#0f172a",
      "--color-header-via": "#134e4a",
      "--color-header-to": "#042f2e",
      "--color-accent": "#2dd4bf",
    },
    classes: {
      headerGradient: "from-slate-900 via-teal-950 to-cyan-950",
      primaryButton: "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20",
      primaryText: "text-teal-700",
      primaryBorder: "border-teal-300",
      primaryBadge: "bg-teal-100 text-teal-800 border-teal-200",
      activeTab: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      glowRing: "ring-teal-500/30",
    },
  },
];

const THEME_STORAGE_KEY = "chemlab_active_theme_palette_v1";

export function getThemeById(id: ThemeId): ThemePalette {
  return THEME_PALETTES.find((t) => t.id === id) || THEME_PALETTES[0];
}

export function loadSavedTheme(): ThemePalette {
  try {
    const savedId = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (savedId) {
      const found = THEME_PALETTES.find((t) => t.id === savedId);
      if (found) return found;
    }
  } catch (err) {
    console.error("Error loading theme:", err);
  }
  return THEME_PALETTES[0]; // Default: emerald-lab
}

export function saveTheme(theme: ThemePalette): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    applyThemeVariables(theme);
  } catch (err) {
    console.error("Error saving theme:", err);
  }
}

export function applyThemeVariables(theme: ThemePalette): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
