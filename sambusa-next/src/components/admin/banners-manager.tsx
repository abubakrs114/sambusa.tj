"use client";

import { useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminStore } from "@/components/admin/use-admin-store";
import type { PromoBanner } from "@/types/store";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fromLocalInput(value: string) {
  return new Date(value).toISOString();
}

export function BannersManager({ initial }: { initial?: import("@/types/store").DataStore }) {
  const { store, loading, reload } = useAdminStore(initial);
  const [draft, setDraft] = useState<PromoBanner | null>(null);
  const [saving, setSaving] = useState(false);
  const banner = draft ?? store?.banner ?? null;

  async function save() {
    if (!banner) return;
    setSaving(true);
    await fetch("/api/admin/banner", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    });
    setSaving(false);
    setDraft(null);
    await reload();
  }

  return (
    <AdminShell title="Промо-баннеры">
      {loading && <p className="text-sm text-neutral-500">Загрузка…</p>}
      {banner && (
        <section className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5">
          <label className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={banner.enabled}
              onChange={(e) => setDraft({ ...banner, enabled: e.target.checked })}
            />
            <span className="text-sm font-medium">Показывать баннер на главной</span>
          </label>

          <div className="space-y-3">
            <input
              value={banner.title}
              onChange={(e) => setDraft({ ...banner, title: e.target.value })}
              placeholder="Заголовок акции"
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
            <textarea
              rows={3}
              value={banner.subtitle}
              onChange={(e) => setDraft({ ...banner, subtitle: e.target.value })}
              placeholder="Подзаголовок"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2"
            />
            <input
              value={banner.buttonText}
              onChange={(e) => setDraft({ ...banner, buttonText: e.target.value })}
              placeholder="Текст кнопки"
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
            <input
              value={banner.buttonHref}
              onChange={(e) => setDraft({ ...banner, buttonHref: e.target.value })}
              placeholder="Ссылка (например #section-sambusa)"
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
            <label className="block">
              <span className="mb-1 block text-xs text-neutral-500">
                Дата и время окончания (таймер)
              </span>
              <input
                type="datetime-local"
                value={toLocalInput(banner.endsAt)}
                onChange={(e) => setDraft({ ...banner, endsAt: fromLocalInput(e.target.value) })}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="mt-5 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Сохранение…" : "Сохранить баннер"}
          </button>
        </section>
      )}
    </AdminShell>
  );
}
