import { isAdminAuthenticated } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/admin-api";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return jsonOk({ authenticated });
}
