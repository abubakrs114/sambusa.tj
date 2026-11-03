"use client";

import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminStore } from "@/components/admin/use-admin-store";
import { formatPrice } from "@/lib/format";
import {
  ORDER_PERIOD_LABELS,
  computeBestSellers,
  computeOrderKpi,
  filterOrdersByPeriod,
  orderStatusLabel,
  type OrderPeriod,
} from "@/lib/order-analytics";
import type { OrderRecord, OrderStatus } from "@/types/store";

function StatusBadge({ status }: { status: OrderStatus | undefined }) {
  const value = status ?? "new";
  const styles =
    value === "completed"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : value === "cancelled"
        ? "bg-neutral-100 text-neutral-500 ring-neutral-200"
        : "bg-amber-50 text-amber-900 ring-amber-200";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles}`}>
      {orderStatusLabel(value)}
    </span>
  );
}

function KpiCard({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-neutral-500">
        <span aria-hidden>{emoji}</span> {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-neutral-900 md:text-2xl">
        {value}
      </p>
    </div>
  );
}

export function OrdersManager({ initial }: { initial?: import("@/types/store").DataStore }) {
  const { store, loading, setStore } = useAdminStore(initial);
  const [period, setPeriod] = useState<OrderPeriod>("7d");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (store ? filterOrdersByPeriod(store.orders, period) : []),
    [store, period],
  );

  const kpi = useMemo(() => computeOrderKpi(filtered), [filtered]);
  const bestSellers = useMemo(() => computeBestSellers(filtered), [filtered]);

  async function setOrderStatus(orderId: string, status: OrderStatus) {
    setSavingId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return;
      const updated = (await response.json()) as OrderRecord;
      setStore((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orders: prev.orders.map((order) => (order.id === updated.id ? updated : order)),
        };
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminShell title="Заказы и аналитика">
      {loading && <p className="text-sm text-neutral-500">Загрузка…</p>}
      {store && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ORDER_PERIOD_LABELS) as OrderPeriod[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  period === key
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {ORDER_PERIOD_LABELS[key]}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard emoji="💰" label="Общая выручка (TJS)" value={formatPrice(kpi.revenue)} />
            <KpiCard emoji="📦" label="Всего заказов" value={String(kpi.orderCount)} />
            <KpiCard
              emoji="📊"
              label="Средний чек (TJS)"
              value={formatPrice(Math.round(kpi.averageCheck))}
            />
            <KpiCard emoji="🥟" label="Продано единиц" value={String(kpi.unitsSold)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-neutral-100 bg-neutral-50/80 text-xs text-neutral-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Статус</th>
                      <th className="px-4 py-3 font-medium">Дата</th>
                      <th className="px-4 py-3 font-medium">Клиент</th>
                      <th className="px-4 py-3 font-medium">Состав</th>
                      <th className="px-4 py-3 font-medium text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filtered.map((order) => (
                      <tr key={order.id} className="align-top">
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                          <select
                            className="mt-2 block w-full max-w-[8.5rem] rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
                            value={order.status ?? "new"}
                            disabled={savingId === order.id}
                            onChange={(event) =>
                              void setOrderStatus(order.id, event.target.value as OrderStatus)
                            }
                            aria-label="Изменить статус заказа"
                          >
                            <option value="new">Новый</option>
                            <option value="completed">Выдан</option>
                            <option value="cancelled">Отменён</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500 tabular-nums">
                          {new Date(order.createdAt).toLocaleString("ru-RU")}
                          <span className="mt-1 block">{order.pickupLabel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.customerName || "Без имени"}</p>
                          <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          <ul className="space-y-0.5">
                            {order.items.map((item) => (
                              <li key={`${order.id}-${item.productId}`}>
                                {item.name} × {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-neutral-100 md:hidden">
                {filtered.map((order) => (
                  <li key={order.id} className="space-y-2 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge status={order.status} />
                      <span className="font-semibold tabular-nums">{formatPrice(order.total)}</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleString("ru-RU")}
                    </p>
                    <p className="font-medium">{order.customerName || "Без имени"}</p>
                    <ul className="text-sm text-neutral-700">
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.productId}`}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                    <select
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      value={order.status ?? "new"}
                      disabled={savingId === order.id}
                      onChange={(event) =>
                        void setOrderStatus(order.id, event.target.value as OrderStatus)
                      }
                    >
                      <option value="new">Новый</option>
                      <option value="completed">Выдан</option>
                      <option value="cancelled">Отменён</option>
                    </select>
                  </li>
                ))}
              </ul>

              {filtered.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-neutral-500">
                  За выбранный период заказов нет. Они появятся после предзаказов через WhatsApp.
                </p>
              )}
            </div>

            <aside className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-neutral-900">Топ продаж</h2>
              <p className="mt-0.5 text-xs text-neutral-500">По количеству за период</p>
              <ol className="mt-4 space-y-3">
                {bestSellers.map((row, index) => (
                  <li key={row.productId} className="flex gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-neutral-800">{row.name}</p>
                      <p className="text-xs text-neutral-500">
                        {row.quantity} шт. · {formatPrice(row.revenue)}
                      </p>
                    </div>
                  </li>
                ))}
                {bestSellers.length === 0 && (
                  <li className="text-sm text-neutral-500">Нет данных за период</li>
                )}
              </ol>
            </aside>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
