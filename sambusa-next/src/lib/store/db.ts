import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";

import { getStore, isDatabaseConfigured, setStore } from "@/lib/db";
import { normalizeProductImageUrl } from "@/lib/normalize-image-url";
import { normalizeDataStore } from "@/lib/store/categories";
import {
  getStoreReadPaths,
  getStoreWritePath,
  isVercelRuntime,
  STORE_FILE_TMP,
} from "@/lib/store/paths";
import { createSeedStore } from "@/lib/store/seed";
import type { DataStore } from "@/types/store";

function cloneStore(store: DataStore): DataStore {
  return structuredClone(store);
}

function sanitizeStoreImagePaths(store: DataStore): DataStore {
  for (const product of store.products) {
    if (product.image) {
      product.image = normalizeProductImageUrl(product.image) ?? undefined;
    }
    if (product.hoverImage) {
      product.hoverImage = normalizeProductImageUrl(product.hoverImage) ?? undefined;
    }
  }
  return store;
}

function prepareStore(store: DataStore): DataStore {
  return sanitizeStoreImagePaths(normalizeDataStore(store));
}

async function storeFileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseStoreJson(raw: string): DataStore | null {
  try {
    const parsed = JSON.parse(raw) as DataStore;
    if (parsed?.version !== 1) return null;
    return prepareStore(parsed);
  } catch {
    return null;
  }
}

/** Fallback: локальный /tmp или data/store.json. */
async function readStoreFromDisk(): Promise<DataStore | null> {
  for (const filePath of getStoreReadPaths()) {
    if (!(await storeFileExists(filePath))) continue;
    try {
      const raw = await readFile(filePath, "utf8");
      const store = parseStoreJson(raw);
      if (store) return store;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException)?.code;
      if (code === "ENOENT") continue;
      console.warn(`[store] skip ${filePath}:`, error);
    }
  }
  return null;
}

async function writeStoreToDisk(store: DataStore): Promise<void> {
  const targetFile = getStoreWritePath();
  const targetDir = path.dirname(targetFile);
  const payload = `${JSON.stringify(store, null, 2)}\n`;

  try {
    if (!isVercelRuntime()) {
      await mkdir(targetDir, { recursive: true });
    }
    await writeFile(targetFile, payload, "utf8");
  } catch (error) {
    if (isVercelRuntime()) {
      await writeFile(STORE_FILE_TMP, payload, "utf8");
      return;
    }
    throw error;
  }
}

export async function readDataStore(): Promise<DataStore> {
  await connection();

  if (isDatabaseConfigured()) {
    try {
      const fromDb = await getStore();
      return cloneStore(prepareStore(fromDb));
    } catch (error) {
      console.warn("[store] PostgreSQL read failed, fallback to file:", error);
    }
  }

  const fromDisk = await readStoreFromDisk();
  if (fromDisk) return cloneStore(fromDisk);

  const seed = createSeedStore();
  return cloneStore(prepareStore(seed));
}

export async function writeDataStore(store: DataStore): Promise<void> {
  const prepared = prepareStore(store);

  if (isDatabaseConfigured()) {
    try {
      await setStore(prepared);
      return;
    } catch (error) {
      console.error("[store] PostgreSQL write failed:", error);
      throw new Error(
        "Не удалось сохранить данные в PostgreSQL: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  try {
    await writeStoreToDisk(prepared);
  } catch (error) {
    console.error("[store] failed to write store.json:", error);
    throw new Error(
      "Не удалось сохранить store.json: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

export async function updateDataStore(
  mutator: (store: DataStore) => void | Promise<void>,
): Promise<DataStore> {
  const store = await readDataStore();
  await mutator(store);
  await writeDataStore(store);
  return cloneStore(prepareStore(store));
}
