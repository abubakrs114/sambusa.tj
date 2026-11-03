import { cookies } from "next/headers";

import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

export {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}
