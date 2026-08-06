// src/utils/categoryColors.ts
import { categoryThemeMap, themeColors } from "../theme/colors";

export interface CategoryColorPair {
  fill: string;
  track: string;
}

export interface PastelCategoryTheme {
  primary: string;
  bg: string;
  border: string;
  fill: string;
  track: string;
}

export const PASTEL_PALETTE_LIST: PastelCategoryTheme[] = [
  { primary: "#6366F1", bg: "#EEF2FF", border: "#E0E7FF", fill: "#6366F1", track: "#F1F1F8" }, // Indigo
  { primary: "#06B6D4", bg: "#ECFEFF", border: "#CFFAFE", fill: "#06B6D4", track: "#F1F1F8" }, // Cyan
  { primary: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", fill: "#8B5CF6", track: "#F1F1F8" }, // Violet
  { primary: "#F59E0B", bg: "#FFFBEB", border: "#FEF3C7", fill: "#F59E0B", track: "#F1F1F8" }, // Amber
  { primary: "#3B82F6", bg: "#EFF6FF", border: "#DBEAFE", fill: "#3B82F6", track: "#F1F1F8" }, // Sky Blue
  { primary: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8", fill: "#EC4899", track: "#F1F1F8" }, // Pink
  { primary: "#10B981", bg: "#ECFDF5", border: "#D1FAE5", fill: "#10B981", track: "#F1F1F8" }, // Emerald
];

export const PASTEL_COLOR_MAP: Record<string, PastelCategoryTheme> = {
  Bills: { primary: "#6366F1", bg: "#EEF2FF", border: "#E0E7FF", fill: "#6366F1", track: "#F1F1F8" },
  Medical: { primary: "#06B6D4", bg: "#ECFEFF", border: "#CFFAFE", fill: "#06B6D4", track: "#F1F1F8" },
  Food: { primary: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", fill: "#8B5CF6", track: "#F1F1F8" },
  Entertainment: { primary: "#F59E0B", bg: "#FFFBEB", border: "#FEF3C7", fill: "#F59E0B", track: "#F1F1F8" },
  Transport: { primary: "#3B82F6", bg: "#EFF6FF", border: "#DBEAFE", fill: "#3B82F6", track: "#F1F1F8" },
  Shopping: { primary: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8", fill: "#EC4899", track: "#F1F1F8" },
  Education: { primary: "#10B981", bg: "#ECFDF5", border: "#D1FAE5", fill: "#10B981", track: "#F1F1F8" },
  Salary: { primary: "#10B981", bg: "#ECFDF5", border: "#D1FAE5", fill: "#10B981", track: "#F1F1F8" },
  Income: { primary: "#10B981", bg: "#ECFDF5", border: "#D1FAE5", fill: "#10B981", track: "#F1F1F8" },
  Investment: { primary: "#6366F1", bg: "#EEF2FF", border: "#E0E7FF", fill: "#6366F1", track: "#F1F1F8" },
  Other: { primary: "#64748B", bg: "#F8FAFC", border: "#E2E8F0", fill: "#64748B", track: "#F1F1F8" },
};


export function getPastelCategoryColors(categoryName?: string, index: number = 0): PastelCategoryTheme {
  const safeIdx = Math.abs(Math.floor(Number(index) || 0));
  const fallback = PASTEL_PALETTE_LIST[safeIdx % PASTEL_PALETTE_LIST.length] || PASTEL_PALETTE_LIST[0];
  if (!categoryName) return fallback;
  const name = String(categoryName).trim();
  if (PASTEL_COLOR_MAP[name]) return PASTEL_COLOR_MAP[name];
  const foundKey = Object.keys(PASTEL_COLOR_MAP).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );
  return (foundKey && PASTEL_COLOR_MAP[foundKey]) ? PASTEL_COLOR_MAP[foundKey] : fallback;
}

/**
 * Modern Finance UI Category Color Map & Helper Utilities
 */
export const FINANCE_CATEGORY_COLORS: Record<string, CategoryColorPair> = categoryThemeMap;
export const GROWW_CATEGORY_COLORS = FINANCE_CATEGORY_COLORS;

export const DEFAULT_FINANCE_COLORS: CategoryColorPair = { 
  fill: themeColors.primaryAccent, 
  track: "rgba(62, 195, 213, 0.15)" 
};
export const DEFAULT_GROWW_COLORS = DEFAULT_FINANCE_COLORS;

/**
 * Get fill and track colors for a category name
 */
export function getGrowwCategoryColors(categoryName?: string): CategoryColorPair {
  if (!categoryName) return DEFAULT_FINANCE_COLORS;
  const name = String(categoryName).trim();

  if (FINANCE_CATEGORY_COLORS[name]) {
    return FINANCE_CATEGORY_COLORS[name];
  }

  // Case-insensitive match
  const foundKey = Object.keys(FINANCE_CATEGORY_COLORS).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  );

  return foundKey ? FINANCE_CATEGORY_COLORS[foundKey] : DEFAULT_FINANCE_COLORS;
}
