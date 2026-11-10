import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/admin-api";

export async function POST() {
  const response = jsonOk({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", adminCookieOptions(0));
  return response;
}
