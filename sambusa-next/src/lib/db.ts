import { readFile } from "node:fs/promises";

import { neon } from "@neondatabase/serverless";

import { STORE_FILE_LOCAL } from "@/lib/store/paths";
import { createSeedStore } from "@/lib/store/seed";
import { normalizeDataStore } from "@/lib/store/categories";
import type { DataStore } from "@/types/store";

const STORE_ROW_ID = "main";

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let ensureReady: Promise<void> | null = null;

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.NEON_DATABASE_URL?.trim() ||
    undefined
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

function getSql(): SqlClient {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL не задан");
  }
  if (!sqlClient) {
    sqlClient = neon(url);
  }
  return sqlClient;
}

async function loadSeedPayload(): Promise<DataStore> {
  try {
    const raw = await readFile(STORE_FILE_LOCAL, "utf8");
    const parsed = JSON.parse(raw) as DataStore;
    if (parsed?.version === 1) {
      return normalizeDataStore(parsed);
    }
  } catch {
    /* no local store.json */
  }
  return createSeedStore();
}

/** Создаёт таблицу и seed-строку id=main при первом обращении. */
export async function ensureAppStore(): Promise<void> {
  if (!ensureReady) {
    ensureReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS app_store (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      const existing = (await sql`
        SELECT id FROM app_store WHERE id = ${STORE_ROW_ID} LIMIT 1
      `) as Array<{ id: string }>;

      if (existing.length === 0) {
        const seed = await loadSeedPayload();
        const seedJson = JSON.stringify(seed);
        await sql`
          INSERT INTO app_store (id, data, updated_at)
          VALUES (${STORE_ROW_ID}, CAST(${seedJson} AS jsonb), NOW())
          ON CONFLICT (id) DO NOTHING
        `;
      }
    })().catch((error) => {
      ensureReady = null;
      throw error;
    });
  }
  await ensureReady;
}

export async function getStore(): Promise<DataStore> {
  await ensureAppStore();
  const sql = getSql();
  const rows = (await sql`
    SELECT data FROM app_store WHERE id = ${STORE_ROW_ID} LIMIT 1
  `) as Array<{ data: unknown }>;

  if (!rows[0]?.data) {
    const seed = await loadSeedPayload();
    await setStore(seed);
    return seed;
  }

  const raw = rows[0].data;
  const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as DataStore;
  if (parsed?.version !== 1) {
    throw new Error("Некорректная версия store в PostgreSQL");
  }
  return normalizeDataStore(parsed);
}

export async function setStore(data: DataStore): Promise<void> {
  await ensureAppStore();
  const sql = getSql();
  const payload = JSON.stringify(data);
  await sql`
    INSERT INTO app_store (id, data, updated_at)
    VALUES (${STORE_ROW_ID}, CAST(${payload} AS jsonb), NOW())
    ON CONFLICT (id) DO UPDATE
    SET data = EXCLUDED.data, updated_at = NOW()
  `;
}
