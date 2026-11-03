import type { MenuSectionId } from "@/types";
import type { DataStore, StoreCategory, StoreSection } from "@/types/store";

const TITLE_ICON =
  /^(\p{Extended_Pictographic}(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?)*)\s*/u;

function parseSectionTitle(title: string): { icon: string; heading: string } {
  const match = title.match(TITLE_ICON);
  if (!match) return { icon: "🥐", heading: title.trim() };
  return { icon: match[1], heading: title.slice(match[0].length).trim() };
}

export function sectionToCategory(section: StoreSection, order: number): StoreCategory {
  const { icon, heading } = parseSectionTitle(section.title);
  return {
    id: section.id,
    name: section.navLabel,
    description: section.description,
    icon,
    heading,
    order,
    isActive: section.showOnStorefront,
  };
}

export function categoriesToSections(categories: StoreCategory[]): StoreSection[] {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  return sorted.map((category, index) => ({
    id: category.id as MenuSectionId,
    navLabel: category.name,
    index: String(index + 1).padStart(2, "0"),
    title: `${category.icon} ${category.heading}`.trim(),
    description: category.description,
    showOnStorefront: category.isActive,
  }));
}

/** Миграция categories ↔ sections и дефолты заказов. */
export function normalizeDataStore(store: DataStore): DataStore {
  if (!store.categories?.length && store.sections?.length) {
    store.categories = store.sections.map((section, index) =>
      sectionToCategory(section, index + 1),
    );
  }

  if (store.categories?.length) {
    store.sections = categoriesToSections(store.categories);
  }

  for (const order of store.orders) {
    if (!order.status) order.status = "new";
  }

  if (!store.categories) store.categories = [];

  return store;
}
