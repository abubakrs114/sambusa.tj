import type { MenuSectionId } from "@/types";

export const ADMIN_SECTION_LABELS: Record<MenuSectionId, string> = {
  sambusa: "Самбуса",
  buns: "Булочки",
  pies: "Пироги",
  bread: "Фатир и хлеб",
  cakes: "Торты",
  sweets: "Сладости",
  drinks: "Напитки",
};

export const ADMIN_PLACEHOLDER_OPTIONS = [
  { id: "", label: "Без плашки (есть фото)" },
  { id: "sambusa", label: "Тандыр / самбуса" },
  { id: "bun", label: "Булочки" },
  { id: "pie", label: "Пирог" },
  { id: "bread", label: "Хлеб" },
  { id: "cake", label: "Торт" },
  { id: "sweet", label: "Сладости" },
] as const;
