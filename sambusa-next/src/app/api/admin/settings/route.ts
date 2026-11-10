import { jsonError, jsonOk, requireAdmin } from "@/lib/admin-api";
import { updateDataStore } from "@/lib/store/db";
import type { BakerySettings, TandyrStatus } from "@/types/store";

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<BakerySettings>;
  try {
    body = (await request.json()) as Partial<BakerySettings>;
  } catch {
    return jsonError("Некорректный JSON");
  }

  try {
    const store = await updateDataStore((draft) => {
      draft.settings = {
        ...draft.settings,
        tandyrStatus: (body.tandyrStatus ?? draft.settings.tandyrStatus) as TandyrStatus,
        whatsappPhoneE164: String(
          body.whatsappPhoneE164 ?? draft.settings.whatsappPhoneE164,
        ).replace(/\D/g, ""),
        phoneDisplay: String(body.phoneDisplay ?? draft.settings.phoneDisplay).trim(),
        pickupAddress: String(body.pickupAddress ?? draft.settings.pickupAddress).trim(),
        pickupMapUrl: String(body.pickupMapUrl ?? draft.settings.pickupMapUrl).trim(),
        hours: String(body.hours ?? draft.settings.hours).trim(),
        city: String(body.city ?? draft.settings.city).trim(),
        instagramHref: String(body.instagramHref ?? draft.settings.instagramHref).trim(),
      };
    });
    return jsonOk(store.settings);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось сохранить настройки",
      500,
    );
  }
}
