import { NextResponse } from "next/server";

import { NO_STORE_HEADERS } from "@/lib/api-cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json(
      { error: "Требуется вход в админ-панель" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }
  return null;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: NO_STORE_HEADERS });
}

export function jsonOk<T>(data: T, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: NO_STORE_HEADERS,
  });
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
