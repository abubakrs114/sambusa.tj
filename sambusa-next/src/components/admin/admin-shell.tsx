"use client";

import {
  Gift,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  ScrollText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: Layers },
  { href: "/admin/promotions", label: "Акции", icon: Gift },
  { href: "/admin/banners", label: "Баннеры", icon: Megaphone },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
  { href: "/admin/orders", label: "Заказы", icon: ScrollText },
] as const;

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white p-5 md:flex md:flex-col">
          <div className="mb-8 flex items-center gap-2">
            <LayoutDashboard className="size-5 text-neutral-700" aria-hidden />
            <div>
              <p className="text-sm font-semibold">SAMBUSA.TJ</p>
              <p className="text-xs text-neutral-500">Панель управления</p>
            </div>
          </div>

          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 pt-6">
            <Link
              href="/"
              className="block rounded-xl px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
            >
              Открыть сайт
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              <LogOut className="size-4" aria-hidden />
              Выйти
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
              <div className="flex gap-2 md:hidden">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      pathname === item.href
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
