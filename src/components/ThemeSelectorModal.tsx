import React from "react";
import { Palette, Check, X, Sparkles } from "lucide-react";
import { ThemePalette } from "../types/theme";
import { THEME_PALETTES } from "../utils/theme";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemePalette;
  onSelectTheme: (theme: ThemePalette) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm leading-tight text-white">Palet Tema Makmal</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  (10 Pilihan Suasana)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih gaya visual dan warna instrumen makmal kegemaran anda
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

        {/* Palettes Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {THEME_PALETTES.map((palette, index) => {
            const isSelected = currentTheme.id === palette.id;

            return (
              <div
                key={palette.id}
                onClick={() => onSelectTheme(palette)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group hover:shadow-md ${
                  isSelected
                    ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Swatches & Checkmark */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full shadow-inner ring-1 ring-black/10"
                        style={{ backgroundColor: palette.primaryHex }}
                      />
                      <div
                        className="w-4 h-4 rounded-full shadow-inner ring-1 ring-black/10 -ml-1"
                        style={{ backgroundColor: palette.secondaryHex }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-inner ring-1 ring-black/10 -ml-1"
                        style={{ backgroundColor: palette.bgHex }}
                      />
                      <span className="text-[10px] font-bold text-slate-400 ml-1">
                        #{index + 1}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                        Klik untuk guna
                      </span>
                    )}
                  </div>

                  {/* Title & Category */}
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">{palette.name}</h4>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    {palette.category}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {palette.description}
                  </p>
                </div>

                {/* Mini Preview Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
                  <div
                    className="h-2 flex-1 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${palette.primaryHex}, ${palette.secondaryHex})`,
                    }}
                  />
                  <div
                    className="w-3 h-3 rounded-md"
                    style={{ backgroundColor: palette.primaryHex }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tema semasa: <strong className="text-slate-900">{currentTheme.name}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-xs hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
