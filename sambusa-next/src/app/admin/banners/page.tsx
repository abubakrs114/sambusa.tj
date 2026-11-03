import { BannersManager } from "@/components/admin/banners-manager";
import { readDataStore } from "@/lib/store/db";

export default async function AdminBannersPage() {
  const initial = await readDataStore();
  return <BannersManager initial={initial} />;
}
