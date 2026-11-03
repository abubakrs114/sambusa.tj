"use client";

import { ArrowDown, ArrowUp, Layers, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminStore } from "@/components/admin/use-admin-store";
import type { StoreCategory } from "@/types/store";

function emptyCategory(order: number): StoreCategory {
  return {
    id: `cat-${Date.now().toString(36)}`,
    name: "Новый раздел",
    heading: "Новый раздел",
    description: "",
    icon: "🥐",
    order,
    isActive: true,
  };
}

export function CategoriesManager({ initial }: { initial?: import("@/types/store").DataStore }) {
  const { store, loading, reload } = useAdminStore(initial);
  const [categories, setCategories] = useState<StoreCategory[]>(() => initial?.categories ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (store?.categories?.length) {
      setCategories([...store.categories].sort((a, b) => a.order - b.order));
    }
  }, [store]);

  function updateAt(index: number, patch: Partial<StoreCategory>) {
    setCategories((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function updateIcon(index: number, raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      updateAt(index, { icon: "" });
      return;
    }
    const segments = [...trimmed];
    updateAt(index, { icon: segments.slice(-2).join("") || segments[0]! });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    setCategories((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = categories.map((item, index) => ({ ...item, order: index + 1 }));
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: payload }),
      });
      if (!response.ok) {
        setMessage("Не удалось сохранить");
        return;
      }
      const saved = (await response.json()) as StoreCategory[];
      setCategories(saved);
      await reload();
      setMessage("Сохранено — порядок и названия обновлены на витрине");
    } catch {
      setMessage("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Категории меню">
      {loading && <p className="text-sm text-neutral-500">Загрузка…</p>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <Layers className="size-4" aria-hidden />
          Порядок и названия разделов на главной
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCategories((prev) => [...prev, emptyCategory(prev.length + 1)])}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Plus className="size-4" aria-hidden />
            Добавить категорию
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            <Save className="size-4" aria-hidden />
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
      {message && <p className="mb-4 text-sm text-neutral-600">{message}</p>}

      <ul className="space-y-3">
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start gap-3">
              <div className="shrink-0">
                <span
                  id={`category-icon-label-${category.id}`}
                  className="mb-1 block text-xs text-neutral-500"
                >
                  Emoji
                </span>
                <input
                  id={`category-icon-${category.id}`}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  aria-labelledby={`category-icon-label-${category.id}`}
                  value={category.icon}
                  onChange={(event) => updateIcon(index, event.target.value)}
                  className="box-border h-10 w-16 rounded-lg border border-neutral-200 bg-white px-1 text-center text-xl leading-none text-neutral-900 caret-neutral-900 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300"
                  maxLength={8}
                />
              </div>
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs text-neutral-500">
                  Название в навигации
                  <input
                    value={category.name}
                    onChange={(event) => updateAt(index, { name: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs text-neutral-500">
                  Заголовок секции
                  <input
                    value={category.heading}
                    onChange={(event) => updateAt(index, { heading: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs text-neutral-500 sm:col-span-2">
                  Описание
                  <textarea
                    value={category.description}
                    onChange={(event) => updateAt(index, { description: event.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={category.isActive}
                    onChange={(event) => updateAt(index, { isActive: event.target.checked })}
                    className="size-4 rounded border-neutral-300"
                  />
                  На витрине
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Выше"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded-lg border border-neutral-200 p-2 disabled:opacity-40"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Ниже"
                    disabled={index === categories.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded-lg border border-neutral-200 p-2 disabled:opacity-40"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-neutral-400">ID: {category.id}</p>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
