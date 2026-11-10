"use client";

import { useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminStore } from "@/components/admin/use-admin-store";
import { adminFetch } from "@/lib/admin-fetch";
import type { BakerySettings, TandyrStatus } from "@/types/store";

export function SettingsManager({ initial }: { initial?: import("@/types/store").DataStore }) {
  const { store, loading, setStore } = useAdminStore(initial);
  const [draft, setDraft] = useState<BakerySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const settings = draft ?? store?.settings ?? null;

  async function save() {
    if (!settings) return;
    setSaving(true);
    setSaveError(null);
    try {
      const response = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const saved = (await response.json()) as BakerySettings;
      setStore((prev) => (prev ? { ...prev, settings: saved } : prev));
      setDraft(saved);
      window.alert("Настройки сохранены");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось сохранить настройки";
      setSaveError(message);
      window.alert(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Настройки пекарни">
      {loading && <p className="text-sm text-neutral-500">Загрузка…</p>}
      {saveError && <p className="mb-3 text-sm text-red-600">{saveError}</p>}
      {settings && (
        <section className="max-w-2xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Статус тандыра в шапке</span>
            <select
              value={settings.tandyrStatus}
              onChange={(e) =>
                setDraft({ ...settings, tandyrStatus: e.target.value as TandyrStatus })
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            >
              <option value="hot">Тандыр горячий • готовность 15–20 мин</option>
              <option value="baking">Печём свежую партию</option>
              <option value="closed">Пекарня закрыта</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">WhatsApp (только цифры, 992…)</span>
            <input
              value={settings.whatsappPhoneE164}
              onChange={(e) =>
                setDraft({ ...settings, whatsappPhoneE164: e.target.value.replace(/\D/g, "") })
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Телефон для сайта</span>
            <input
              value={settings.phoneDisplay}
              onChange={(e) => setDraft({ ...settings, phoneDisplay: e.target.value })}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Адрес самовывоза</span>
            <textarea
              rows={2}
              value={settings.pickupAddress}
              onChange={(e) => setDraft({ ...settings, pickupAddress: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Ссылка на карту</span>
            <input
              value={settings.pickupMapUrl}
              onChange={(e) => setDraft({ ...settings, pickupMapUrl: e.target.value })}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Часы работы</span>
            <input
              value={settings.hours}
              onChange={(e) => setDraft({ ...settings, hours: e.target.value })}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Город в шапке</span>
            <input
              value={settings.city}
              onChange={(e) => setDraft({ ...settings, city: e.target.value })}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3"
            />
          </label>

          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Сохранение…" : "Сохранить настройки"}
          </button>
        </section>
      )}
    </AdminShell>
  );
}
