"use client";

import { useEffect, useRef } from "react";

import { useStorefront } from "@/context/store-context";
import { scrollToMenuSection } from "@/hooks/use-active-menu-section";
import type { MenuSectionId } from "@/types";

interface SectionNavBarProps {
  active: MenuSectionId;
}

/** Липкая лента разделов с якорной прокруткой. */
export function SectionNavBar({ active }: SectionNavBarProps) {
  const { sections } = useStorefront();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const button = nav.querySelector<HTMLButtonElement>(`[data-section="${active}"]`);
    button?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div className="sticky top-[var(--header-h)] z-40 border-b border-[#EAE5DE] bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="relative mx-auto max-w-7xl">
        <nav
          ref={navRef}
          aria-label="Разделы меню"
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
        >
          {sections.map((section) => {
            const isActive = section.id === active;
            return (
              <button
                key={section.id}
                type="button"
                data-section={section.id}
                aria-current={isActive ? "true" : undefined}
                onClick={() => scrollToMenuSection(section.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 sm:px-5 ${
                  isActive
                    ? "border-transparent bg-[#1A1A1A] text-white shadow-sm"
                    : "border-[#EAE5DE] bg-white/60 text-neutral-600 hover:border-neutral-400 hover:text-[#1A1A1A]"
                }`}
              >
                {section.navLabel}
              </button>
            );
          })}
        </nav>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#FAF8F5] to-transparent lg:hidden"
        />
      </div>
    </div>
  );
}
