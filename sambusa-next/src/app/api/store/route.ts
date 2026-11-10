import { NextResponse } from "next/server";
import { connection } from "next/server";

import { NO_STORE_HEADERS } from "@/lib/api-cache";
import { getStorefrontPayload } from "@/lib/store/public";

export async function GET() {
  await connection();
  const payload = await getStorefrontPayload();
  return NextResponse.json(payload, { headers: NO_STORE_HEADERS });
}
