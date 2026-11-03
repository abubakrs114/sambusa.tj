/**
 * Сессия админки на Web Crypto — совместимо с Edge (middleware) и Node (API).
 */

export const ADMIN_COOKIE = "sambusa_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string | null {
  return process.env.ADMIN_PASSWORD ?? null;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function signHmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");

  const payload = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })),
  );
  const signature = await signHmac(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await signHmac(payload, secret);
  const a = base64UrlDecode(signature);
  const b = base64UrlDecode(expected);
  if (!timingSafeEqualBytes(a, b)) return false;

  try {
    const json = new TextDecoder().decode(base64UrlDecode(payload));
    const data = JSON.parse(json) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const configured = getSecret();
  if (!configured) return false;
  return timingSafeEqualString(password, configured);
}

export function adminCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
