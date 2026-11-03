import { NextResponse } from "next/server";

import { getStorefrontPayload } from "@/lib/store/public";

export async function GET() {
  const payload = await getStorefrontPayload();
  return NextResponse.json(payload);
}
