import { SettingsManager } from "@/components/admin/settings-manager";
import { readDataStore } from "@/lib/store/db";

export default async function AdminSettingsPage() {
  const initial = await readDataStore();
  return <SettingsManager initial={initial} />;
}
