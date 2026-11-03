import { PromotionsManager } from "@/components/admin/promotions-manager";
import { readDataStore } from "@/lib/store/db";

export default async function AdminPromotionsPage() {
  const initial = await readDataStore();
  return <PromotionsManager initial={initial} />;
}
