import type { Promotion, StoreProduct, StorefrontProduct } from "@/types/store";

function isPromotionActive(promotion: Promotion, now: Date): boolean {
  const start = new Date(promotion.startsAt).getTime();
  const end = new Date(promotion.endsAt).getTime();
  const ts = now.getTime();
  return ts >= start && ts <= end;
}

function applyPromotionPrice(basePrice: number, promotion: Promotion): number {
  if (typeof promotion.fixedPrice === "number" && promotion.fixedPrice >= 0) {
    return promotion.fixedPrice;
  }
  if (typeof promotion.discountPercent === "number" && promotion.discountPercent > 0) {
    const discounted = basePrice * (1 - promotion.discountPercent / 100);
    return Math.max(0, Math.round(discounted * 100) / 100);
  }
  return basePrice;
}

function pickBestPromotion(
  product: StoreProduct,
  promotions: Promotion[],
  now: Date,
): Promotion | null {
  const active = promotions.filter((p) => isPromotionActive(p, now));
  let best: { promotion: Promotion; price: number } | null = null;

  for (const promotion of active) {
    const matches =
      (promotion.targetType === "product" && promotion.targetId === product.id) ||
      (promotion.targetType === "section" && promotion.targetId === product.section);
    if (!matches) continue;

    const nextPrice = applyPromotionPrice(product.price, promotion);
    if (!best || nextPrice < best.price) {
      best = { promotion, price: nextPrice };
    }
  }

  return best?.promotion ?? null;
}

export function toStorefrontProduct(
  product: StoreProduct,
  promotions: Promotion[],
  now = new Date(),
): StorefrontProduct {
  const promotion = pickBestPromotion(product, promotions, now);
  const effectivePrice = promotion
    ? applyPromotionPrice(product.price, promotion)
    : product.price;

  const soldOutVisible = !product.inStock && product.stopListMode === "sold_out";

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    section: product.section,
    price: effectivePrice,
    originalPrice:
      promotion && effectivePrice < product.price ? product.price : undefined,
    discountPercent:
      promotion?.discountPercent && effectivePrice < product.price
        ? promotion.discountPercent
        : undefined,
    unit: product.unit,
    image: product.image,
    hoverImage: product.hoverImage,
    drink: product.drink,
    placeholder: product.placeholder,
    badge: product.badge,
    inStock: product.inStock,
    soldOutVisible,
  };
}

export function isPromotionActiveNow(promotion: Promotion, now = new Date()): boolean {
  return isPromotionActive(promotion, now);
}
