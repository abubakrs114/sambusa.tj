import { jsonError, jsonOk, newId, requireAdmin } from "@/lib/admin-api";
import { updateDataStore } from "@/lib/store/db";
import type { Promotion, PromotionTargetType } from "@/types/store";

function parsePromotion(body: Partial<Promotion>): Promotion | null {
  const title = String(body.title ?? "").trim();
  const targetType = String(body.targetType ?? "") as PromotionTargetType;
  const targetId = String(body.targetId ?? "").trim();
  const startsAt = String(body.startsAt ?? "");
  const endsAt = String(body.endsAt ?? "");
  const discountPercent =
    body.discountPercent !== undefined ? Number(body.discountPercent) : undefined;
  const fixedPrice = body.fixedPrice !== undefined ? Number(body.fixedPrice) : undefined;

  if (!title || !targetId || !startsAt || !endsAt) return null;
  if (targetType !== "product" && targetType !== "section") return null;
  if (discountPercent === undefined && fixedPrice === undefined) return null;

  return {
    id: String(body.id ?? newId("promo")),
    title,
    targetType,
    targetId,
    discountPercent,
    fixedPrice,
    startsAt,
    endsAt,
  };
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<Promotion>;
  try {
    body = (await request.json()) as Partial<Promotion>;
  } catch {
    return jsonError("Некорректный JSON");
  }

  const promotion = parsePromotion(body);
  if (!promotion) return jsonError("Проверьте поля акции");

  try {
    await updateDataStore((draft) => {
      draft.promotions.push(promotion);
    });
    return jsonOk(promotion, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось создать акцию",
      500,
    );
  }
}
