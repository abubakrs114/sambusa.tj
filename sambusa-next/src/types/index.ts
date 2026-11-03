/** Разделы меню (якорная навигация). */
export type MenuSectionId =
  | "sambusa"
  | "buns"
  | "pies"
  | "bread"
  | "cakes"
  | "sweets"
  | "drinks";

export interface MenuSection {
  id: MenuSectionId;
  /** Короткая подпись в липкой ленте. */
  navLabel: string;
  /** Номер блока: 01, 02… */
  index: string;
  /** Заголовок секции на странице. */
  title: string;
  /** Одна строка атмосферы под заголовком. */
  description: string;
}

export type ProductBadge = "hit" | "new" | "set";

export type DrinkKind = "tea" | "ayran" | "compote";

/** Мягкая плашка, когда нет фото в /public/img. */
export type ProductPlaceholderKind =
  | "sambusa"
  | "bun"
  | "pie"
  | "bread"
  | "cake"
  | "sweet";

/** Оформление карточки напитка (когда нет фото): тип, подпись объёма. */
export interface DrinkInfo {
  kind: DrinkKind;
  /** Бейдж объёма, например "0.5 L". */
  volume: string;
}

export interface Product {
  id: string;
  name: string;
  /** Краткий аппетитный состав. */
  description: string;
  section: MenuSectionId;
  /** Цена в сомони (TJS). */
  price: number;
  /** Например: "1 шт • 120 г". */
  unit: string;
  /** Путь до локального изображения в /public/img. */
  image?: string;
  /** Второе фото — cross-fade при наведении на карточку. */
  hoverImage?: string;
  /** Для напитков: стилизованная плашка с иконкой и бейджем объёма. */
  drink?: DrinkInfo;
  /** Декоративная плашка без фото. */
  placeholder?: ProductPlaceholderKind;
  badge?: ProductBadge;
}

/** Строка корзины — хранится только id и количество, остальное берём из каталога. */
export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: number;
}

/** Когда клиент заберёт заказ из пекарни. */
export type PickupTiming = "asap" | "30min" | "custom";

export type PaymentMethod = "cash" | "korti_milli" | "dc";

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  hint: string;
}

export interface CheckoutCustomer {
  name: string;
  /** Только 9 цифр после +992. */
  phone: string;
  comment: string;
  pickupTiming: PickupTiming;
  /** Заполняется, если pickupTiming === "custom". */
  pickupAtCustom: string;
}

export interface CheckoutFormState extends CheckoutCustomer {
  paymentMethod: PaymentMethod;
}

export type CheckoutFormErrors = Partial<
  Record<"name" | "phone" | "pickupAtCustom", string>
>;

export interface OrderRequest {
  customer: CheckoutCustomer;
  paymentMethod: PaymentMethod;
  items: CartLine[];
}

export interface OrderResponse {
  orderId: string;
  total: number;
  itemsCount: number;
}
