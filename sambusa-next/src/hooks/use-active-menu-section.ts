"use client";

import { useEffect, useState } from "react";

import type { MenuSectionId } from "@/types";

/** Высота шапки + липкой ленты разделов (px) для якоря и scroll-spy. */
export function getMenuScrollOffset(): number {
  if (typeof window === "undefined") return 160;
  const header = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  const headerPx = Number.parseFloat(header) || 88;
  return headerPx + 56;
}

function resolveActiveSection(sectionIds: MenuSectionId[]): MenuSectionId {
  const offset = getMenuScrollOffset() + 12;
  let active = sectionIds[0] ?? "sambusa";

  for (const id of sectionIds) {
    const element = document.getElementById(`section-${id}`);
    if (!element) continue;
    if (element.getBoundingClientRect().top <= offset) active = id;
  }

  return active;
}

/** Подсветка активного раздела при прокрутке меню. */
export function useActiveMenuSection(
  enabled: boolean,
  sectionIds: MenuSectionId[],
): MenuSectionId {
  const [active, setActive] = useState<MenuSectionId>(
    () => sectionIds[0] ?? "sambusa",
  );

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setActive(resolveActiveSection(sectionIds));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, sectionIds]);

  return active;
}

export function scrollToMenuSection(id: MenuSectionId): void {
  const element = document.getElementById(`section-${id}`);
  if (!element) return;

  const top =
    element.getBoundingClientRect().top + window.scrollY - getMenuScrollOffset();

  window.scrollTo({ top, behavior: "smooth" });
}
