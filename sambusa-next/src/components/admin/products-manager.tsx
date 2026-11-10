"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductImageField } from "@/components/admin/product-image-field";
import { useAdminStore } from "@/components/admin/use-admin-store";
import { adminFetch, readApiError } from "@/lib/admin-fetch";
import {
  ADMIN_PLACEHOLDER_OPTIONS,
  ADMIN_SECTION_LABELS,
} from "@/lib/admin-section-labels";
import {
  isValidProductImageUrl,
  normalizeProductImageUrl,
} from "@/lib/normalize-image-url";
import type { MenuSectionId, ProductBadge } from "@/types";
import type { StopListMode, StoreProduct } from "@/types/store";

type ProductDraft = Omit<StoreProduct, "createdAt" | "updatedAt"> & {
  createdAt?: string;
  updatedAt?: string;
};

const EMPTY_DRAFT: ProductDraft = {
  id: "",
  name: "",
  description: "",
  section: "sambusa",
  price: 0,
  unit: "1 шт • 120 г",
  inStock: true,
  stopListMode: "sold_out",
};

export function ProductsManager({ initial }: { initial?: import("@/types/store").DataStore }) {
  const { store, loading, error, reload, setStore } = useAdminStore(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingHover, setUploadingHover] = useState(false);

  const products = useMemo(() => store?.products ?? [], [store]);

  function openCreate() {
    setIsNew(true);
    setDraft({ ...EMPTY_DRAFT, id: `product-${Date.now().toString(36)}` });
    setModalOpen(true);
  }

  function openEdit(product: StoreProduct) {
    setIsNew(false);
    setDraft({
      ...product,
      image: normalizeProductImageUrl(product.image),
      hoverImage: normalizeProductImageUrl(product.hoverImage),
    });
    setModalOpen(true);
  }

  async function uploadToField(
    file: File,
    field: "image" | "hoverImage",
    setBusy: (value: boolean) => void,
  ) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    setBusy(false);
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    const data = (await response.json()) as { url: string };
    setDraft((prev) => {
      if (field === "image") {
        return {
          ...prev,
          image: data.url,
          placeholder: undefined,
          drink: undefined,
        };
      }
      return { ...prev, hoverImage: data.url };
    });
  }

  async function saveProduct() {
    setSaving(true);
    setSaveError(null);
    const payload = { ...draft };
    if (payload.image) {
      delete payload.placeholder;
      delete payload.drink;
    }
    if (!payload.placeholder) delete payload.placeholder;
    if (!payload.badge) delete payload.badge;
    if (!payload.image) delete payload.image;
    if (!payload.hoverImage) delete payload.hoverImage;
    if (payload.image) {
      payload.image = normalizeProductImageUrl(payload.image);
      if (!payload.image) delete payload.image;
    }
    if (payload.hoverImage) {
      payload.hoverImage = normalizeProductImageUrl(payload.hoverImage);
      if (!payload.hoverImage) delete payload.hoverImage;
    }

    try {
      const response = await adminFetch(
        isNew ? "/api/admin/products" : `/api/admin/products/${draft.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const saved = (await response.json()) as StoreProduct;
      setStore((prev) => {
        if (!prev) return prev;
        if (isNew) {
          return { ...prev, products: [...prev.products, saved] };
        }
        return {
          ...prev,
          products: prev.products.map((item) => (item.id === saved.id ? saved : item)),
        };
      });
      setModalOpen(false);
      try {
        await reload();
      } catch {
        /* локальный стейт уже обновлён ответом API */
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось сохранить товар";
      setSaveError(message);
      window.alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Удалить товар?")) return;
    try {
      await adminFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setStore((prev) =>
        prev ? { ...prev, products: prev.products.filter((item) => item.id !== id) } : prev,
      );
      try {
        await reload();
      } catch {
        /* keep local state */
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Не удалось удалить товар");
    }
  }

  return (
    <AdminShell title="Управление товарами">
      {loading && <p className="text-sm text-neutral-500">Загрузка…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saveError && <p className="mb-3 text-sm text-red-600">{saveError}</p>}

      {!loading && store && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus className="size-4" aria-hidden />
              Добавить товар
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="hidden grid-cols-[72px_1.2fr_120px_120px_120px_100px] gap-3 border-b border-neutral-100 px-4 py-3 text-xs font-medium tracking-wide text-neutral-500 uppercase md:grid">
              <span>Фото</span>
              <span>Название</span>
              <span>Категория</span>
              <span>Цена</span>
              <span>Статус</span>
              <span />
            </div>

            <ul className="divide-y divide-neutral-100">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="grid gap-3 px-4 py-3 md:grid-cols-[72px_1.2fr_120px_120px_120px_100px] md:items-center"
                >
                  <div className="relative size-14 overflow-hidden rounded-lg bg-neutral-100">
                    {isValidProductImageUrl(normalizeProductImageUrl(product.image)) ? (
                      <Image
                        src={normalizeProductImageUrl(product.image)!}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-[10px] text-neutral-400">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{product.name}</p>
                    <p className="line-clamp-1 text-xs text-neutral-500">{product.unit}</p>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {ADMIN_SECTION_LABELS[product.section]}
                  </p>
                  <p className="text-sm font-semibold tabular-nums">{product.price} TJS</p>
                  <p className="text-sm">
                    {product.inStock ? (
                      <span className="text-emerald-700">В наличии</span>
                    ) : product.stopListMode === "hidden" ? (
                      <span className="text-neutral-500">Скрыт</span>
                    ) : (
                      <span className="text-amber-700">Стоп-лист</span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="grid size-9 place-items-center rounded-lg border border-neutral-200"
                      aria-label="Редактировать"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600"
                      aria-label="Удалить"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-4 sm:place-items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold">
              {isNew ? "Новый товар" : "Редактирование товара"}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Название</span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Категория</span>
                <select
                  value={draft.section}
                  onChange={(e) =>
                    setDraft({ ...draft, section: e.target.value as MenuSectionId })
                  }
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                >
                  {Object.entries(ADMIN_SECTION_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Цена (TJS)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Состав / описание</span>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Вес / порция</span>
                <input
                  value={draft.unit}
                  onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Бейдж</span>
                <select
                  value={draft.badge ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      badge: (e.target.value || undefined) as ProductBadge | undefined,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                >
                  <option value="">Без бейджа</option>
                  <option value="hit">Хит</option>
                  <option value="new">Новинка</option>
                  <option value="set">Сет</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Плашка без фото</span>
                <select
                  value={draft.placeholder ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      placeholder: e.target.value
                        ? (e.target.value as ProductDraft["placeholder"])
                        : undefined,
                      image: e.target.value ? undefined : draft.image,
                    })
                  }
                  disabled={Boolean(draft.image)}
                  className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                >
                  {ADMIN_PLACEHOLDER_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <ProductImageField
                imageUrl={draft.image}
                uploading={uploading}
                onUpload={(file) => uploadToField(file, "image", setUploading)}
                onChangeUrl={(url) =>
                  setDraft((prev) => ({
                    ...prev,
                    image: url || undefined,
                    placeholder: url ? undefined : prev.placeholder,
                    drink: url ? undefined : prev.drink,
                  }))
                }
                onRemove={() =>
                  setDraft((prev) => ({
                    ...prev,
                    image: undefined,
                  }))
                }
              />

              <ProductImageField
                title="Вторая фотография (при наведении / в разрезе)"
                hint="Показывается при наведении курсора на карточку (например: начинка в разрезе, вид сверху или процесс выпечки)."
                imageUrl={draft.hoverImage}
                uploading={uploadingHover}
                onUpload={(file) => uploadToField(file, "hoverImage", setUploadingHover)}
                onChangeUrl={(url) =>
                  setDraft((prev) => ({
                    ...prev,
                    hoverImage: url || undefined,
                  }))
                }
                onRemove={() =>
                  setDraft((prev) => ({
                    ...prev,
                    hoverImage: undefined,
                  }))
                }
              />

              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.inStock}
                  onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })}
                />
                <span className="text-sm">В наличии</span>
              </label>

              {!draft.inStock && (
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Если нет в наличии</span>
                  <select
                    value={draft.stopListMode}
                    onChange={(e) =>
                      setDraft({ ...draft, stopListMode: e.target.value as StopListMode })
                    }
                    className="h-11 w-full rounded-xl border border-neutral-200 px-3"
                  >
                    <option value="sold_out">Показать «Разобрали»</option>
                    <option value="hidden">Скрыть с витрины</option>
                  </select>
                </label>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveProduct()}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
