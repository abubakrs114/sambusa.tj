import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { readDataStore } from "@/lib/store/db";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const store = await readDataStore();
  return NextResponse.json(store);
}
