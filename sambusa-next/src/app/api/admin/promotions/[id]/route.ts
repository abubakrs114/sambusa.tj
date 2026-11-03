import { NextResponse } from "next/server";

import { jsonError, requireAdmin } from "@/lib/admin-api";
import { updateDataStore } from "@/lib/store/db";
import type { Promotion, PromotionTargetType } from "@/types/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  let body: Partial<Promotion>;
  try {
    body = (await request.json()) as Partial<Promotion>;
  } catch {
    return jsonError("Некорректный JSON");
  }

  let found = false;
  const store = await updateDataStore((draft) => {
    const index = draft.promotions.findIndex((item) => item.id === id);
    if (index === -1) return;
    const current = draft.promotions[index];
    draft.promotions[index] = {
      ...current,
      title: String(body.title ?? current.title).trim(),
      targetType: (body.targetType ?? current.targetType) as PromotionTargetType,
      targetId: String(body.targetId ?? current.targetId).trim(),
      discountPercent:
        body.discountPercent !== undefined
          ? Number(body.discountPercent)
          : current.discountPercent,
      fixedPrice:
        body.fixedPrice !== undefined ? Number(body.fixedPrice) : current.fixedPrice,
      startsAt: String(body.startsAt ?? current.startsAt),
      endsAt: String(body.endsAt ?? current.endsAt),
    };
    found = true;
  });

  if (!found) return jsonError("Акция не найдена", 404);
  const promotion = store.promotions.find((item) => item.id === id);
  return NextResponse.json(promotion);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  let removed = false;
  await updateDataStore((draft) => {
    const before = draft.promotions.length;
    draft.promotions = draft.promotions.filter((item) => item.id !== id);
    removed = draft.promotions.length < before;
  });

  if (!removed) return jsonError("Акция не найдена", 404);
  return NextResponse.json({ ok: true });
}
