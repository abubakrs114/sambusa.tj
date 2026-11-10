import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { jsonError, jsonOk, requireAdmin } from "@/lib/admin-api";
import { isVercelRuntime, UPLOADS_DIR } from "@/lib/store/paths";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (isVercelRuntime()) {
    return jsonError(
      "Загрузка файлов на Vercel недоступна (read-only FS). Укажите URL картинки вручную (/img/...) или подключите Vercel Blob.",
      503,
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Файл не передан");
  }

  if (!ALLOWED.has(file.type)) {
    return jsonError("Допустимы JPG, PNG, WebP или GIF");
  }
  if (file.size > MAX_BYTES) {
    return jsonError("Файл больше 5 МБ");
  }

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
  const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;

  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOADS_DIR, filename), buffer);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Не удалось сохранить файл",
      500,
    );
  }

  return jsonOk({ url: `/uploads/${filename}` });
}
