import { toStorefrontProduct } from "@/lib/store/pricing";
import { readDataStore } from "@/lib/store/db";
import type { StoreSection, StorefrontPayload, StorefrontProduct } from "@/types/store";

function buildIndexes(products: StorefrontProduct[]) {
  const productsById: Record<string, StorefrontProduct> = {};
  const productsBySection: Record<string, StorefrontProduct[]> = {};

  for (const product of products) {
    productsById[product.id] = product;
    if (!productsBySection[product.section]) {
      productsBySection[product.section] = [];
    }
    productsBySection[product.section].push(product);
  }

  return { productsById, productsBySection };
}

/** Публичные данные витрины (без напитков и скрытых позиций). */
export async function getStorefrontPayload(): Promise<StorefrontPayload> {
  const store = await readDataStore();
  const now = new Date();

  const visibleSectionIds = new Set(
    store.sections.filter((section) => section.showOnStorefront).map((section) => section.id),
  );

  const products = store.products
    .map((product) => toStorefrontProduct(product, store.promotions, now))
    .filter((product) => {
      if (!visibleSectionIds.has(product.section)) return false;
      const raw = store.products.find((item) => item.id === product.id);
      if (raw && !raw.inStock && raw.stopListMode === "hidden") return false;
      return true;
    });

  const { productsById, productsBySection } = buildIndexes(products);

  const sections: StoreSection[] = store.sections.filter(
    (section) =>
      section.showOnStorefront && (productsBySection[section.id]?.length ?? 0) > 0,
  );

  return {
    sections,
    products,
    productsById,
    productsBySection,
    banner: store.banner,
    settings: store.settings,
    generatedAt: now.toISOString(),
  };
}
