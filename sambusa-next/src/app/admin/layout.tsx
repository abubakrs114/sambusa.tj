import { Suspense, type ReactNode } from "react";

function AdminFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-neutral-500">
      Загрузка панели…
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AdminFallback />}>{children}</Suspense>;
}
