"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { ProductImage } from "@/components/ui/product-image";
import type { StorefrontProduct } from "@/types/store";

interface ProductCardMediaProps {
  product: StorefrontProduct;
  priority?: boolean;
  sizes: string;
  soldOut: boolean;
}

/** Основное и hover-фото с cross-fade; на touch — переключение по тапу. */
export function ProductCardMedia({
  product,
  priority,
  sizes,
  soldOut,
}: ProductCardMediaProps) {
  const hasHover = Boolean(product.image && product.hoverImage);
  const [showAlt, setShowAlt] = useState(false);

  const toggleAlt = useCallback(() => {
    if (!hasHover || soldOut) return;
    setShowAlt((prev) => !prev);
  }, [hasHover, soldOut]);

  if (!hasHover) {
    return (
      <ProductImage
        product={product}
        priority={priority}
        sizes={sizes}
        className={`transition-transform duration-500 ease-out ${
          soldOut ? "" : "group-hover:scale-105"
        }`}
      />
    );
  }

  const primaryVisible = !showAlt;

  return (
    <>
      <Image
        src={product.image!}
        alt={product.name}
        fill
        priority={priority}
        sizes={sizes}
        className={`absolute inset-0 object-cover transition-opacity duration-500 ease-out ${
          primaryVisible ? "opacity-100" : "opacity-0"
        } ${!soldOut && primaryVisible ? "md:group-hover:opacity-0" : ""}`}
      />
      <Image
        src={product.hoverImage!}
        alt={`${product.name} — дополнительный вид`}
        fill
        sizes={sizes}
        className={`absolute inset-0 object-cover transition-all duration-700 ease-out ${
          primaryVisible ? "scale-100 opacity-0" : "scale-105 opacity-100"
        } ${!soldOut ? "md:scale-100 md:opacity-0 md:group-hover:scale-105 md:group-hover:opacity-100" : ""}`}
      />

      <button
        type="button"
        aria-label={showAlt ? "Показать основное фото" : "Показать второе фото"}
        onClick={toggleAlt}
        className="absolute inset-0 z-[1] md:pointer-events-none"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-2.5 z-[2] flex justify-center gap-1.5 md:hidden"
        aria-hidden
      >
        <span
          className={`size-1.5 rounded-full shadow-sm transition-colors ${
            primaryVisible ? "bg-white" : "bg-white/45"
          }`}
        />
        <span
          className={`size-1.5 rounded-full shadow-sm transition-colors ${
            !primaryVisible ? "bg-white" : "bg-white/45"
          }`}
        />
      </div>
    </>
  );
}
