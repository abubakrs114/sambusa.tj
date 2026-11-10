import { jsonError, jsonOk, requireAdmin } from "@/lib/admin-api";
import { updateDataStore } from "@/lib/store/db";
import type { OrderStatus } from "@/types/store";

const STATUSES: OrderStatus[] = ["new", "completed", "cancelled"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await context.params;
  let body: { status?: OrderStatus };
  try {
    body = (await request.json()) as { status?: OrderStatus };
  } catch {
    return jsonError("Некорректный JSON");
  }

  if (!body.status || !STATUSES.includes(body.status)) {
    return jsonError("Укажите статус: new, completed или cancelled");
  }

  let found = false;
  try {
    const store = await updateDataStore((draft) => {
      const order = draft.orders.find((item) => item.id === id);
      if (!order) return;
      order.status = body.status;
      found = true;
    });

    if (!found) return jsonError("Заказ не найден", 404);
    const updated = store.orders.find((item) => item.id === id);
    return jsonOk(updated);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось обновить заказ",
      500,
    );
  }
}
