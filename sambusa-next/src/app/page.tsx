import { Suspense } from "react";

import { StoreProvider } from "@/context/store-context";
import { StorefrontView } from "@/components/storefront-view";
import { getStorefrontPayload } from "@/lib/store/public";

async function StorefrontPageContent() {
  const initial = await getStorefrontPayload();

  return (
    <StoreProvider initial={initial}>
      <StorefrontView />
    </StoreProvider>
  );
}

function StorefrontFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#FAF8F5] text-sm text-neutral-500">
      Загрузка меню…
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<StorefrontFallback />}>
      <StorefrontPageContent />
    </Suspense>
  );
}
