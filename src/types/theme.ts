export type ThemeId =
  | "emerald-lab"
  | "sapphire-clinical"
  | "cyber-violet"
  | "amber-chem"
  | "crimson-safety"
  | "nordic-frost"
  | "forest-botany"
  | "amethyst-genetics"
  | "midnight-pi"
  | "teal-polymer";

export interface ThemePalette {
  id: ThemeId;
  name: string;
  category: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  bgHex: string;
  // CSS variables injected into root
  vars: {
    "--color-primary": string;
    "--color-primary-hover": string;
    "--color-primary-light": string;
    "--color-primary-border": string;
    "--color-primary-text": string;
    "--color-header-from": string;
    "--color-header-via": string;
    "--color-header-to": string;
    "--color-accent": string;
  };
  // Pre-configured Tailwind class tokens
  classes: {
    headerGradient: string;
    primaryButton: string;
    primaryText: string;
    primaryBorder: string;
    primaryBadge: string;
    activeTab: string;
    glowRing: string;
  };
}
