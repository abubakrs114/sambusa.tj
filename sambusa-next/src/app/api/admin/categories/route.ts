import { jsonError, jsonOk, newId, requireAdmin } from "@/lib/admin-api";
import { categoriesToSections } from "@/lib/store/categories";
import { updateDataStore } from "@/lib/store/db";
import type { StoreCategory } from "@/types/store";

function parseCategory(raw: unknown, index: number): StoreCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<StoreCategory>;
  const id = String(item.id ?? "").trim() || newId("cat");
  const name = String(item.name ?? "").trim();
  const heading = String(item.heading ?? name).trim();
  if (!name) return null;
  return {
    id,
    name,
    heading,
    description: String(item.description ?? "").trim(),
    icon: String(item.icon ?? "🥐").trim() || "🥐",
    order: Number.isFinite(item.order) ? Number(item.order) : index + 1,
    isActive: item.isActive !== false,
  };
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { categories?: unknown[] };
  try {
    body = (await request.json()) as { categories?: unknown[] };
  } catch {
    return jsonError("Некорректный JSON");
  }

  if (!Array.isArray(body.categories)) {
    return jsonError("Ожидается массив categories");
  }

  const parsed: StoreCategory[] = [];
  for (let i = 0; i < body.categories.length; i++) {
    const category = parseCategory(body.categories[i], i);
    if (category) parsed.push(category);
  }

  parsed.sort((a, b) => a.order - b.order);
  parsed.forEach((category, index) => {
    category.order = index + 1;
  });

  try {
    const store = await updateDataStore((draft) => {
      draft.categories = parsed;
      draft.sections = categoriesToSections(parsed);
    });
    return jsonOk(store.categories);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось сохранить категории",
      500,
    );
  }
}
