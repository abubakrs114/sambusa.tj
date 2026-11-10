import { connection } from "next/server";

import { jsonOk, requireAdmin } from "@/lib/admin-api";
import { readDataStore } from "@/lib/store/db";

export async function GET() {
  await connection();
  const denied = await requireAdmin();
  if (denied) return denied;
  const store = await readDataStore();
  return jsonOk(store);
}
