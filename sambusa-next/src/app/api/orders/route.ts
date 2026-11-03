import { NextResponse } from "next/server";

import { newId } from "@/lib/admin-api";
import { PAYMENT_OPTIONS } from "@/data/catalog";
import { MAX_QUANTITY } from "@/lib/cart-store";
import { formatPickupTimeLabel } from "@/lib/pickup";
import { isValidPhone } from "@/lib/phone";
import { toStorefrontProduct } from "@/lib/store/pricing";
import { readDataStore, updateDataStore } from "@/lib/store/db";
import type { OrderLineRecord, OrderRecord } from "@/types/store";
import type { OrderRequest, OrderResponse, PickupTiming } from "@/types";

const PAYMENT_IDS = new Set<string>(PAYMENT_OPTIONS.map((option) => option.id));
const PICKUP_IDS = new Set<string>(["asap", "30min", "custom"]);

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Резервный API (основной канал — WhatsApp). */
export async function POST(request: Request) {
  let body: Partial<OrderRequest>;
  try {
    body = (await request.json()) as Partial<OrderRequest>;
  } catch {
    return badRequest("Некорректный JSON");
  }

  const { customer, paymentMethod, items } = body;

  if (!customer || typeof customer !== "object") return badRequest("Нет данных клиента");
  const name = String(customer.name ?? "").trim();
  const phone = String(customer.phone ?? "");
  const comment = String(customer.comment ?? "").trim().slice(0, 500);
  const pickupTiming = String(customer.pickupTiming ?? "") as PickupTiming;
  const pickupAtCustom = String(customer.pickupAtCustom ?? "").trim();

  if (name.length < 2) return badRequest("Укажите имя");
  if (!isValidPhone(phone) || !/^\d+$/.test(phone)) return badRequest("Некорректный телефон");
  if (!PICKUP_IDS.has(pickupTiming)) return badRequest("Укажите время самовыvоза");
  if (pickupTiming === "custom" && pickupAtCustom.length < 2) {
    return badRequest("Укажите время самовыvоза");
  }
  if (!paymentMethod || !PAYMENT_IDS.has(paymentMethod)) {
    return badRequest("Выберите способ оплаты");
  }
  if (!Array.isArray(items) || items.length === 0) return badRequest("Корзина пуста");

  const store = await readDataStore();
  const now = new Date();
  let total = 0;
  let itemsCount = 0;
  const orderLines: OrderLineRecord[] = [];

  for (const line of items) {
    const raw = store.products.find((product) => product.id === String(line?.productId));
    const quantity = Number(line?.quantity);
    if (!raw || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return badRequest("Некорректная позиция в заказе");
    }
    const display = toStorefrontProduct(raw, store.promotions, now);
    if (!display.inStock) return badRequest("Одна из позиций недоступна");
    orderLines.push({
      productId: raw.id,
      name: raw.name,
      quantity,
      unitPrice: display.price,
      lineTotal: display.price * quantity,
    });
    total += display.price * quantity;
    itemsCount += quantity;
  }

  const orderId = `ST-${Math.floor(10000 + Math.random() * 90000)}`;
  const pickupWhen = formatPickupTimeLabel(pickupTiming, pickupAtCustom);
  const paymentLabel =
    PAYMENT_OPTIONS.find((option) => option.id === paymentMethod)?.label ?? paymentMethod;

  const record: OrderRecord = {
    id: newId("order"),
    createdAt: now.toISOString(),
    customerName: name,
    customerPhone: phone,
    pickupLabel: pickupWhen,
    paymentLabel,
    comment,
    items: orderLines,
    total,
    channel: "api",
  };

  await updateDataStore((draft) => {
    draft.orders.unshift(record);
    draft.orders = draft.orders.slice(0, 200);
  });

  console.info("[order]", { orderId, record });

  const response: OrderResponse = { orderId, total, itemsCount };
  return NextResponse.json(response, { status: 201 });
}
