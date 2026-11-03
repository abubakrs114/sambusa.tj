import { ProductsManager } from "@/components/admin/products-manager";
import { readDataStore } from "@/lib/store/db";

export default async function AdminProductsPage() {
  const initial = await readDataStore();
  return <ProductsManager initial={initial} />;
}
