import Image from "next/image";

import { DrinkVisual } from "@/components/ui/drink-visual";
import { ProductPlaceholder } from "@/components/ui/product-placeholder";
import type { Product } from "@/types";

interface ProductImageProps {
  product: Pick<Product, "name" | "image" | "drink" | "placeholder">;
  sizes: string;
  priority?: boolean;
  variant?: "card" | "thumb";
  /** Доп. классы для <Image> (например, hover-zoom). */
  className?: string;
}

/**
 * Медиа товара: фото из /public/img, напиток, декоративная плашка или fallback.
 * Родитель должен быть `relative`.
 */
export function ProductImage({
  product,
  sizes,
  priority,
  variant = "card",
  className = "",
}: ProductImageProps) {
  if (product.drink) {
    return <DrinkVisual drink={product.drink} alt={product.name} variant={variant} />;
  }

  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  if (product.placeholder) {
    return (
      <ProductPlaceholder kind={product.placeholder} alt={product.name} variant={variant} />
    );
  }

  return (
    <ProductPlaceholder kind="sweet" alt={product.name} variant={variant} />
  );
}
