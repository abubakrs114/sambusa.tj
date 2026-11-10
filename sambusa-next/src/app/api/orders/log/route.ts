import { NextResponse } from "next/server";

import { newId } from "@/lib/admin-api";
import { NO_STORE_HEADERS } from "@/lib/api-cache";
import { toStorefrontProduct } from "@/lib/store/pricing";
import { readDataStore, updateDataStore } from "@/lib/store/db";
import type { OrderLineRecord, OrderRecord } from "@/types/store";

interface LogBody {
  customerName?: string;
  customerPhone?: string;
  pickupLabel?: string;
  paymentLabel?: string;
  comment?: string;
  items?: { productId: string; quantity: number }[];
  channel?: "whatsapp" | "api";
}

export async function POST(request: Request) {
  let body: LogBody;
  try {
    body = (await request.json()) as LogBody;
  } catch {
    return NextResponse.json(
      { error: "Некорректный JSON" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const store = await readDataStore();
  const now = new Date();
  const lines: OrderLineRecord[] = [];

  for (const line of body.items ?? []) {
    const raw = store.products.find((product) => product.id === line.productId);
    if (!raw || !Number.isInteger(line.quantity) || line.quantity < 1) continue;
    const display = toStorefrontProduct(raw, store.promotions, now);
    lines.push({
      productId: raw.id,
      name: raw.name,
      quantity: line.quantity,
      unitPrice: display.price,
      lineTotal: display.price * line.quantity,
    });
  }

  if (lines.length === 0) {
    return NextResponse.json(
      { error: "Пустой заказ" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const record: OrderRecord = {
    id: newId("order"),
    createdAt: now.toISOString(),
    customerName: String(body.customerName ?? "").trim(),
    customerPhone: String(body.customerPhone ?? "").trim(),
    pickupLabel: String(body.pickupLabel ?? "").trim(),
    paymentLabel: String(body.paymentLabel ?? "").trim(),
    comment: String(body.comment ?? "").trim(),
    items: lines,
    total,
    channel: body.channel === "api" ? "api" : "whatsapp",
    status: "new",
  };

  await updateDataStore((draft) => {
    draft.orders.unshift(record);
    draft.orders = draft.orders.slice(0, 200);
  });

  return NextResponse.json(
    { ok: true, orderId: record.id },
    { headers: NO_STORE_HEADERS },
  );
}
