import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Mail,
  Palette,
} from "lucide-react";
import { ThemePalette } from "../types/theme";

interface HeaderProps {
  activeTab: "dashboard" | "inventory" | "restock" | "audit";
  setActiveTab: (tab: "dashboard" | "inventory" | "restock" | "audit") => void;
  userRole: "RA" | "PI";
  setUserRole: (role: "RA" | "PI") => void;
  onResetData: () => void;
  onOpenStaffEmail: () => void;
  staffCount: number;
  criticalCount: number;
  currentTheme: ThemePalette;
  onOpenThemeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onResetData,
  onOpenStaffEmail,
  staffCount,
  criticalCount,
  currentTheme,
  onOpenThemeModal,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("ms-MY", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-slate-800/90 text-slate-100 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between py-3 gap-4 border-b border-slate-800/50">
          {/* Zone 1: Institutional Brand Lockup */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
              style={{ backgroundColor: currentTheme.primaryHex }}
            >
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-mono">
                  ChemLab<span style={{ color: currentTheme.vars["--color-accent"] }}>Flow</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  · R&D Inventory & Restock
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Lembaga Getah Malaysia (LGM) · Makmal Penyelidikan
              </p>
            </div>
          </div>

          {/* Zone 3: Functional Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Live Clock: Subdued Monospace Readout */}
            <span className="hidden lg:inline text-[11px] font-mono text-slate-400 tabular-nums">
              {currentDateTime}
            </span>

            {/* Role Switcher: Precision Segmented Control */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setUserRole("RA")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  userRole === "RA"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Mod Pembantu Penyelidik (Lab Bench)"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>RA Makmal</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole("PI")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  userRole === "PI"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Mod Pengurus Makmal / PI (Kelulusan & Bajet)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Pengurus / PI</span>
              </button>
            </div>

            {/* Staff Email Dispatch Trigger */}
            <button
              type="button"
              onClick={onOpenStaffEmail}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Pusat Notifikasi Emel Staf Makmal"
            >
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Staf</span>
              <span className="text-[10px] font-mono text-slate-400">({staffCount})</span>
            </button>

            {/* Theme Selector Trigger */}
            <button
              type="button"
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Tukar Palet Tema (10 Pilihan)"
            >
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: currentTheme.primaryHex }}
              />
              <span className="hidden sm:inline text-xs">Tema</span>
              <Palette className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Reset Demo Data: Quiet Ghost Action */}
            <button
              type="button"
              onClick={onResetData}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title="Set Semula Data Contoh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Toolbar (Disciplined Underline Tabs) */}
        <nav className="flex space-x-1 sm:space-x-4 pt-1 overflow-x-auto scrollbar-none text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "border-emerald-400 text-white font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            style={{
              borderColor: activeTab === "dashboard" ? currentTheme.vars["--color-accent"] : "transparent",
            }}
          >
            Dashboard & Amaran
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`py-2 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "inventory"
                ? "border-emerald-400 text-white font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            style={{
              borderColor: activeTab === "inventory" ? currentTheme.vars["--color-accent"] : "transparent",
            }}
          >
            Inventori Bahan & Guna Habis
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("restock")}
            className={`py-2 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === "restock"
                ? "border-emerald-400 text-white font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            style={{
              borderColor: activeTab === "restock" ? currentTheme.vars["--color-accent"] : "transparent",
            }}
          >
            <span>Perancang Bajet & Restock</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {criticalCount} kritikal
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`py-2 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-emerald-400 text-white font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            style={{
              borderColor: activeTab === "audit" ? currentTheme.vars["--color-accent"] : "transparent",
            }}
          >
            Jejak Audit Geran
          </button>
        </nav>
      </div>
    </header>
  );
};
