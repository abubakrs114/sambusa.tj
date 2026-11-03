import path from "node:path";

/** Vercel Serverless — файловая система деплоя только для чтения. */
export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

export const STORE_FILE_LOCAL = path.join(process.cwd(), "data", "store.json");

export const STORE_FILE_TMP = path.join("/tmp", "store.json");

/** Локальный путь (dev / self-host). */
export const STORE_FILE = STORE_FILE_LOCAL;

export function getStoreWritePath(): string {
  return isVercelRuntime() ? STORE_FILE_TMP : STORE_FILE_LOCAL;
}

/** Порядок чтения: runtime-копия, затем файл из деплоя. */
export function getStoreReadPaths(): string[] {
  if (isVercelRuntime()) {
    return [STORE_FILE_TMP, STORE_FILE_LOCAL];
  }
  return [STORE_FILE_LOCAL, STORE_FILE_TMP];
}

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
