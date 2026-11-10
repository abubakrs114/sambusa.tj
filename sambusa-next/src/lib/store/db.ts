import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";

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

/** Кэш в памяти процесса (один warm serverless-инстанс на Vercel). */
let memoryStore: DataStore | null = null;

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
    return sanitizeStoreImagePaths(normalizeDataStore(parsed));
  } catch {
    return null;
  }
}

/** Чтение без mkdir — безопасно для Vercel read-only. */
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

export async function readDataStore(): Promise<DataStore> {
  await connection();

  if (memoryStore) {
    return cloneStore(memoryStore);
  }

  const existing = await readStoreFromDisk();
  if (existing) {
    memoryStore = cloneStore(existing);
    return cloneStore(existing);
  }

  const seed = createSeedStore();
  memoryStore = cloneStore(seed);

  if (!isVercelRuntime()) {
    try {
      await writeDataStore(seed);
    } catch (error) {
      console.warn("[store] could not seed local store.json:", error);
    }
  }

  return cloneStore(seed);
}

export async function writeDataStore(store: DataStore): Promise<void> {
  normalizeDataStore(store);
  sanitizeStoreImagePaths(store);

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
      try {
        await writeFile(STORE_FILE_TMP, payload, "utf8");
      } catch (retryError) {
        console.error("[store] failed to write /tmp/store.json:", retryError);
        throw new Error(
          "Не удалось сохранить данные на сервере (файловая система Vercel). Ошибка: " +
            (retryError instanceof Error ? retryError.message : String(retryError)),
        );
      }
    } else {
      console.error("[store] failed to write store:", error);
      throw new Error(
        "Не удалось сохранить store.json: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  memoryStore = cloneStore(store);
}

export async function updateDataStore(
  mutator: (store: DataStore) => void | Promise<void>,
): Promise<DataStore> {
  const store = await readDataStore();
  await mutator(store);
  await writeDataStore(store);
  return cloneStore(store);
}
