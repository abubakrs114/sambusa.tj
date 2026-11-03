import type { OrderRecord, OrderStatus } from "@/types/store";

export type OrderPeriod = "today" | "7d" | "30d" | "all";

export interface OrderKpi {
  revenue: number;
  orderCount: number;
  averageCheck: number;
  unitsSold: number;
}

export interface BestSellerRow {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

function periodStart(period: OrderPeriod, now = new Date()): Date | null {
  if (period === "all") return null;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === "7d") {
    start.setDate(start.getDate() - 6);
    return start;
  }
  if (period === "30d") {
    start.setDate(start.getDate() - 29);
    return start;
  }
  return start;
}

export function filterOrdersByPeriod(
  orders: OrderRecord[],
  period: OrderPeriod,
  now = new Date(),
): OrderRecord[] {
  const start = periodStart(period, now);
  if (!start) return [...orders];
  const t0 = start.getTime();
  return orders.filter((order) => new Date(order.createdAt).getTime() >= t0);
}

function effectiveStatus(status: OrderStatus | undefined): OrderStatus {
  return status ?? "new";
}

export function computeOrderKpi(orders: OrderRecord[]): OrderKpi {
  const counted = orders.filter((o) => effectiveStatus(o.status) !== "cancelled");
  const revenue = counted.reduce((sum, o) => sum + o.total, 0);
  const orderCount = counted.length;
  const unitsSold = counted.reduce(
    (sum, o) => sum + o.items.reduce((s, line) => s + line.quantity, 0),
    0,
  );
  return {
    revenue,
    orderCount,
    averageCheck: orderCount > 0 ? revenue / orderCount : 0,
    unitsSold,
  };
}

export function computeBestSellers(orders: OrderRecord[], limit = 8): BestSellerRow[] {
  const map = new Map<string, BestSellerRow>();
  for (const order of orders) {
    if (effectiveStatus(order.status) === "cancelled") continue;
    for (const line of order.items) {
      const existing = map.get(line.productId);
      if (existing) {
        existing.quantity += line.quantity;
        existing.revenue += line.lineTotal;
      } else {
        map.set(line.productId, {
          productId: line.productId,
          name: line.name,
          quantity: line.quantity,
          revenue: line.lineTotal,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

export const ORDER_PERIOD_LABELS: Record<OrderPeriod, string> = {
  today: "Сегодня",
  "7d": "За 7 дней",
  "30d": "За месяц",
  all: "Все время",
};

export function orderStatusLabel(status: OrderStatus | undefined): string {
  switch (effectiveStatus(status)) {
    case "completed":
      return "Выдан";
    case "cancelled":
      return "Отменён";
    default:
      return "Новый";
  }
}
