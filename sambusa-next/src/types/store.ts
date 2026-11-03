import type {
  DrinkInfo,
  MenuSectionId,
  ProductBadge,
  ProductPlaceholderKind,
} from "@/types";

export type TandyrStatus = "hot" | "baking" | "closed";

export type StopListMode = "sold_out" | "hidden";

export interface StoreSection {
  id: MenuSectionId;
  navLabel: string;
  index: string;
  title: string;
  description: string;
  /** Показывать на главной витрине. */
  showOnStorefront: boolean;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  section: MenuSectionId;
  price: number;
  unit: string;
  image?: string;
  hoverImage?: string;
  drink?: DrinkInfo;
  placeholder?: ProductPlaceholderKind;
  badge?: ProductBadge;
  inStock: boolean;
  stopListMode: StopListMode;
  createdAt: string;
  updatedAt: string;
}

export type PromotionTargetType = "product" | "section";

export interface Promotion {
  id: string;
  title: string;
  targetType: PromotionTargetType;
  targetId: string;
  discountPercent?: number;
  fixedPrice?: number;
  startsAt: string;
  endsAt: string;
}

export interface PromoBanner {
  enabled: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  endsAt: string;
}

export interface BakerySettings {
  tandyrStatus: TandyrStatus;
  whatsappPhoneE164: string;
  phoneDisplay: string;
  pickupAddress: string;
  pickupMapUrl: string;
  hours: string;
  city: string;
  instagramHref: string;
}

export interface OrderLineRecord {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type OrderStatus = "new" | "completed" | "cancelled";

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  pickupLabel: string;
  paymentLabel: string;
  comment: string;
  items: OrderLineRecord[];
  total: number;
  channel: "whatsapp" | "api";
  status?: OrderStatus;
}

/** Раздел меню для админки и витрины (store.json). */
export interface StoreCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  /** Заголовок блока на витрине (без emoji). */
  heading: string;
}

export interface DataStore {
  version: 1;
  sections: StoreSection[];
  categories: StoreCategory[];
  products: StoreProduct[];
  promotions: Promotion[];
  banner: PromoBanner | null;
  settings: BakerySettings;
  orders: OrderRecord[];
}

/** Товар для витрины с учётом акций. */
export interface StorefrontProduct {
  id: string;
  name: string;
  description: string;
  section: MenuSectionId;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  unit: string;
  image?: string;
  hoverImage?: string;
  drink?: DrinkInfo;
  placeholder?: ProductPlaceholderKind;
  badge?: ProductBadge;
  inStock: boolean;
  soldOutVisible: boolean;
}

export interface StorefrontPayload {
  sections: StoreSection[];
  products: StorefrontProduct[];
  productsById: Record<string, StorefrontProduct>;
  productsBySection: Record<string, StorefrontProduct[]>;
  banner: PromoBanner | null;
  settings: BakerySettings;
  generatedAt: string;
}
