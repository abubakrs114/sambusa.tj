"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminStore } from "@/components/admin/use-admin-store";
import { ADMIN_SECTION_LABELS } from "@/lib/admin-section-labels";
import type { MenuSectionId } from "@/types";
import type { Promotion, PromotionTargetType } from "@/types/store";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fromLocalInput(value: string) {
  return new Date(value).toISOString();
}

export function PromotionsManager({ initial }: { initial?: import("@/types/store").DataStore }) {
  const { store, loading, reload } = useAdminStore(initial);
  const [draft, setDraft] = useState<Partial<Promotion>>(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      title: "",
      targetType: "product",
      targetId: "",
      discountPercent: 10,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
    };
  });

  async function createPromotion() {
    await fetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    await reload();
  }

  async function removePromotion(id: string) {
    if (!window.confirm("Удалить акцию?")) return;
    await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    await reload();
  }

  const products = store?.products ?? [];

  return (
    <AdminShell title="Скидки и акции">
      {loading && <p className="text-sm text-neutral-500">Загрузка…</p>}

      {store && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-medium">Новая акция</h2>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Название акции"
                value={draft.title ?? ""}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3"
              />
              <select
                value={draft.targetType}
                onChange={(e) =>
                  setDraft({ ...draft, targetType: e.target.value as PromotionTargetType })
                }
                className="h-11 w-full rounded-xl border border-neutral-200 px-3"
              >
                <option value="product">На товар</option>
                <option value="section">На категорию</option>
              </select>
              {draft.targetType === "product" ? (
                <select
                  value={draft.targetId}
                  onChange={(e) => setDraft({ ...draft, targetId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                >
                  <option value="">Выберите товар</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={draft.targetId}
                  onChange={(e) =>
                    setDraft({ ...draft, targetId: e.target.value as MenuSectionId })
                  }
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                >
                  <option value="">Выберите категорию</option>
                  {Object.entries(ADMIN_SECTION_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-neutral-500">Скидка, %</span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={draft.discountPercent ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        discountPercent: Number(e.target.value),
                        fixedPrice: undefined,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-neutral-500">Или цена по акции</span>
                  <input
                    type="number"
                    min={0}
                    value={draft.fixedPrice ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        fixedPrice: Number(e.target.value),
                        discountPercent: undefined,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs text-neutral-500">Начало</span>
                <input
                  type="datetime-local"
                  value={draft.startsAt ? toLocalInput(draft.startsAt) : ""}
                  onChange={(e) => setDraft({ ...draft, startsAt: fromLocalInput(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-neutral-500">Окончание</span>
                <input
                  type="datetime-local"
                  value={draft.endsAt ? toLocalInput(draft.endsAt) : ""}
                  onChange={(e) => setDraft({ ...draft, endsAt: fromLocalInput(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                />
              </label>
              <button
                type="button"
                onClick={() => void createPromotion()}
                className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                <Plus className="size-4" aria-hidden />
                Сохранить акцию
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-medium">Активные и запланированные</h2>
            <ul className="mt-4 divide-y divide-neutral-100">
              {store.promotions.map((promotion) => (
                <li key={promotion.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{promotion.title}</p>
                    <p className="text-xs text-neutral-500">
                      {promotion.targetType === "product" ? "Товар" : "Категория"}:{" "}
                      {promotion.targetId}
                      {promotion.discountPercent
                        ? ` · −${promotion.discountPercent}%`
                        : promotion.fixedPrice
                          ? ` · ${promotion.fixedPrice} TJS`
                          : ""}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(promotion.startsAt).toLocaleString("ru-RU")} —{" "}
                      {new Date(promotion.endsAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removePromotion(promotion.id)}
                    className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
              {store.promotions.length === 0 && (
                <li className="py-6 text-sm text-neutral-500">Пока нет акций</li>
              )}
            </ul>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
