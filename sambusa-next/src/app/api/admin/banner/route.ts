import { NextResponse } from "next/server";

import { jsonError, requireAdmin } from "@/lib/admin-api";
import { updateDataStore } from "@/lib/store/db";
import type { PromoBanner } from "@/types/store";

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<PromoBanner>;
  try {
    body = (await request.json()) as Partial<PromoBanner>;
  } catch {
    return jsonError("Некорректный JSON");
  }

  const store = await updateDataStore((draft) => {
    draft.banner = {
      enabled: Boolean(body.enabled),
      title: String(body.title ?? "").trim(),
      subtitle: String(body.subtitle ?? "").trim(),
      buttonText: String(body.buttonText ?? "").trim(),
      buttonHref: String(body.buttonHref ?? "#menu").trim(),
      endsAt: String(body.endsAt ?? new Date().toISOString()),
    };
  });

  return NextResponse.json(store.banner);
}
