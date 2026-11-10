import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/admin-api";
import { NO_STORE_HEADERS } from "@/lib/api-cache";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return jsonError("ADMIN_PASSWORD не задан на сервере", 503);
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return jsonError("Некорректный JSON");
  }

  const password = String(body.password ?? "");
  if (!verifyAdminPassword(password)) {
    return jsonError("Неверный пароль", 401);
  }

  const token = await createAdminSessionToken();
  const response = jsonOk({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions(7 * 24 * 60 * 60));
  for (const [key, value] of Object.entries(NO_STORE_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
