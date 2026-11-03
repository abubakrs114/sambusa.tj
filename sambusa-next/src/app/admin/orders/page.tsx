import { OrdersManager } from "@/components/admin/orders-manager";
import { readDataStore } from "@/lib/store/db";

export default async function AdminOrdersPage() {
  const initial = await readDataStore();
  return <OrdersManager initial={initial} />;
}
