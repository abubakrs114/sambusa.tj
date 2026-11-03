import { MENU_SECTIONS, PRODUCTS } from "@/data/catalog";
import { SITE } from "@/data/site";
import { sectionToCategory } from "@/lib/store/categories";
import type { DataStore, StoreProduct } from "@/types/store";

const NOW = new Date().toISOString();

function toStoreProduct(product: (typeof PRODUCTS)[number]): StoreProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    section: product.section,
    price: product.price,
    unit: product.unit,
    image: product.image,
    hoverImage: product.hoverImage,
    drink: product.drink,
    placeholder: product.placeholder,
    badge: product.badge,
    inStock: true,
    stopListMode: "sold_out",
    createdAt: NOW,
    updatedAt: NOW,
  };
}

/** Начальное содержимое store.json из текущего каталога. */
export function createSeedStore(): DataStore {
  const sections = MENU_SECTIONS.map((section) => ({
    ...section,
    showOnStorefront: section.id !== "drinks",
  }));
  const categories = sections.map((section, index) =>
    sectionToCategory(section, index + 1),
  );

  return {
    version: 1,
    sections,
    categories,
    products: PRODUCTS.map(toStoreProduct),
    promotions: [],
    banner: {
      enabled: false,
      title: "Скидка 15% на предзаказ к празднику",
      subtitle: "Оформите заказ заранее — заберите горячим из тандыра.",
      buttonText: "Смотреть меню",
      buttonHref: "#section-sambusa",
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    settings: {
      tandyrStatus: "hot",
      whatsappPhoneE164: SITE.whatsappPhoneE164,
      phoneDisplay: SITE.phoneDisplay,
      pickupAddress: SITE.pickupAddress,
      pickupMapUrl: SITE.pickupMapUrl,
      hours: SITE.hours,
      city: SITE.city,
      instagramHref: SITE.instagramHref,
    },
    orders: [],
  };
}
