import { mkdir, readFile, writeFile } from "node:fs/promises";
import { connection } from "next/server";

import { normalizeProductImageUrl } from "@/lib/normalize-image-url";
import { normalizeDataStore } from "@/lib/store/categories";
import { STORE_FILE } from "@/lib/store/paths";
import { createSeedStore } from "@/lib/store/seed";
import type { DataStore } from "@/types/store";

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

async function ensureStoreDir(): Promise<void> {
  await mkdir(STORE_FILE.replace(/[/\\][^/\\]+$/, ""), { recursive: true });
}

export async function readDataStore(): Promise<DataStore> {
  await connection();
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as DataStore;
    if (parsed?.version !== 1) throw new Error("Unsupported store version");
    return sanitizeStoreImagePaths(normalizeDataStore(parsed));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT") throw error;
    const seed = createSeedStore();
    await writeDataStore(seed);
    return seed;
  }
}

export async function writeDataStore(store: DataStore): Promise<void> {
  await ensureStoreDir();
  normalizeDataStore(store);
  sanitizeStoreImagePaths(store);
  await writeFile(STORE_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function updateDataStore(
  mutator: (store: DataStore) => void | Promise<void>,
): Promise<DataStore> {
  const store = await readDataStore();
  await mutator(store);
  await writeDataStore(store);
  return store;
}
