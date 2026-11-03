import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { UPLOADS_DIR } from "@/lib/store/paths";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Допустимы JPG, PNG, WebP или GIF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл больше 5 МБ" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
  const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;

  await mkdir(UPLOADS_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
