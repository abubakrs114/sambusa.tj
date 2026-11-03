import { NextResponse } from "next/server";

import { jsonError, newId, requireAdmin } from "@/lib/admin-api";
import { normalizeProductImageUrl } from "@/lib/normalize-image-url";
import { updateDataStore } from "@/lib/store/db";
import type { MenuSectionId, ProductBadge, ProductPlaceholderKind } from "@/types";
import type { StopListMode, StoreProduct } from "@/types/store";

const SECTIONS = new Set<string>([
  "sambusa",
  "buns",
  "pies",
  "bread",
  "cakes",
  "sweets",
  "drinks",
]);

function parseProductBody(body: Partial<StoreProduct>): StoreProduct | null {
  const id = String(body.id ?? newId("product"));
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const section = String(body.section ?? "") as MenuSectionId;
  const price = Number(body.price);
  const unit = String(body.unit ?? "").trim();

  if (!name || !description || !unit) return null;
  if (!SECTIONS.has(section)) return null;
  if (!Number.isFinite(price) || price < 0) return null;

  const now = new Date().toISOString();
  const badge = body.badge as ProductBadge | undefined;
  const placeholder = body.placeholder as ProductPlaceholderKind | undefined;

  return {
    id,
    name,
    description,
    section,
    price,
    unit,
    image: body.image
      ? (normalizeProductImageUrl(String(body.image)) ?? undefined)
      : undefined,
    hoverImage: body.hoverImage
      ? (normalizeProductImageUrl(String(body.hoverImage)) ?? undefined)
      : undefined,
    drink: body.drink,
    placeholder,
    badge: badge || undefined,
    inStock: body.inStock !== false,
    stopListMode: (body.stopListMode as StopListMode) ?? "sold_out",
    createdAt: body.createdAt ?? now,
    updatedAt: now,
  };
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<StoreProduct>;
  try {
    body = (await request.json()) as Partial<StoreProduct>;
  } catch {
    return jsonError("Некорректный JSON");
  }

  const product = parseProductBody(body);
  if (!product) return jsonError("Проверьте поля товара");

  const store = await updateDataStore((draft) => {
    if (draft.products.some((item) => item.id === product.id)) {
      throw new Error("DUPLICATE");
    }
    draft.products.push(product);
  }).catch((error) => {
    if (error instanceof Error && error.message === "DUPLICATE") return null;
    throw error;
  });

  if (!store) return jsonError("Товар с таким ID уже есть");
  return NextResponse.json(product, { status: 201 });
}
