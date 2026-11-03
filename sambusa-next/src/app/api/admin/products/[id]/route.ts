import { NextResponse } from "next/server";

import { jsonError, requireAdmin } from "@/lib/admin-api";
import { normalizeProductImageUrl } from "@/lib/normalize-image-url";
import { updateDataStore } from "@/lib/store/db";
import type { MenuSectionId, ProductBadge, ProductPlaceholderKind } from "@/types";
import type { StopListMode } from "@/types/store";

const SECTIONS = new Set<string>([
  "sambusa",
  "buns",
  "pies",
  "bread",
  "cakes",
  "sweets",
  "drinks",
]);

interface RouteContext {
  params: Promise<{ id: string }>;
}

function resolveImageField(
  bodyValue: unknown,
  current: string | undefined,
): string | undefined {
  if (bodyValue === null || bodyValue === "") return undefined;
  if (bodyValue !== undefined) {
    return normalizeProductImageUrl(String(bodyValue)) ?? undefined;
  }
  return current;
}

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Некорректный JSON");
  }

  let updated = false;
  const store = await updateDataStore((draft) => {
    const index = draft.products.findIndex((product) => product.id === id);
    if (index === -1) return;

    const current = draft.products[index];
    const section = String(body.section ?? current.section) as MenuSectionId;
    if (!SECTIONS.has(section)) throw new Error("BAD_SECTION");

    const price = body.price !== undefined ? Number(body.price) : current.price;
    if (!Number.isFinite(price) || price < 0) throw new Error("BAD_PRICE");

    draft.products[index] = {
      ...current,
      name: String(body.name ?? current.name).trim(),
      description: String(body.description ?? current.description).trim(),
      section,
      price,
      unit: String(body.unit ?? current.unit).trim(),
      image: resolveImageField(body.image, current.image),
      hoverImage: resolveImageField(body.hoverImage, current.hoverImage),
      drink: body.drink === null ? undefined : (body.drink as typeof current.drink) ?? current.drink,
      placeholder:
        body.placeholder === null
          ? undefined
          : ((body.placeholder as ProductPlaceholderKind | undefined) ?? current.placeholder),
      badge:
        body.badge === null
          ? undefined
          : ((body.badge as ProductBadge | undefined) ?? current.badge),
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : current.inStock,
      stopListMode:
        (body.stopListMode as StopListMode | undefined) ?? current.stopListMode,
      updatedAt: new Date().toISOString(),
    };
    updated = true;
  }).catch((error) => {
    if (error instanceof Error && error.message === "BAD_SECTION") return null;
    if (error instanceof Error && error.message === "BAD_PRICE") return null;
    throw error;
  });

  if (!store) return jsonError("Некорректные данные");
  if (!updated) return jsonError("Товар не найден", 404);

  const product = store.products.find((item) => item.id === id);
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  let removed = false;

  await updateDataStore((draft) => {
    const before = draft.products.length;
    draft.products = draft.products.filter((product) => product.id !== id);
    removed = draft.products.length < before;
  });

  if (!removed) return jsonError("Товар не найден", 404);
  return NextResponse.json({ ok: true });
}
