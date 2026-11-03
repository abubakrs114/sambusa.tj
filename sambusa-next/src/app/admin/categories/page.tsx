import { CategoriesManager } from "@/components/admin/categories-manager";
import { readDataStore } from "@/lib/store/db";

export default async function AdminCategoriesPage() {
  const initial = await readDataStore();
  return <CategoriesManager initial={initial} />;
}
