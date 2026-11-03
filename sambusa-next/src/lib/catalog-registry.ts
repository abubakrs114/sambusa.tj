import type { StorefrontProduct } from "@/types/store";

let productsById = new Map<string, StorefrontProduct>();

export function setStorefrontCatalog(products: StorefrontProduct[]): void {
  productsById = new Map(products.map((product) => [product.id, product]));
}

export function getStorefrontProduct(id: string): StorefrontProduct | undefined {
  return productsById.get(id);
}

export function hasStorefrontProduct(id: string): boolean {
  return productsById.has(id);
}

export function getAllStorefrontProducts(): StorefrontProduct[] {
  return [...productsById.values()];
}
