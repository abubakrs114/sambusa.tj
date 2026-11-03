"use client";

import { useEffect, useState, type MouseEvent } from "react";

import { useStorefront } from "@/context/store-context";
import { useIsClient } from "@/hooks/use-is-client";
import { scrollToMenuSection } from "@/hooks/use-active-menu-section";
import type { MenuSectionId } from "@/types";

function getRemainingMs(endsAt: string): number {
  return Math.max(0, new Date(endsAt).getTime() - Date.now());
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function Unit({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[3.25rem] rounded-xl border border-[#EFEAE2] bg-white/80 px-2 py-2 text-center backdrop-blur-sm">
      <p className="text-lg font-medium tabular-nums text-[#1A1A1A]">
        {String(value).padStart(2, "0")}
      </p>
      <p className="text-[10px] tracking-wide text-neutral-500 uppercase">{label}</p>
    </div>
  );
}

function handleBannerLink(href: string, event: MouseEvent<HTMLAnchorElement>) {
  if (!href.startsWith("#")) return;
  event.preventDefault();
  if (href.startsWith("#section-")) {
    const id = href.replace("#section-", "") as MenuSectionId;
    scrollToMenuSection(id);
    return;
  }
  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PromoCountdownBanner() {
  const { banner } = useStorefront();
  const isClient = useIsClient();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!isClient || !banner?.enabled) return;

    const tick = () => setRemaining(getRemainingMs(banner.endsAt));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [isClient, banner]);

  if (!banner?.enabled) return null;
  if (isClient && remaining !== null && remaining <= 0) return null;

  const parts = remaining !== null ? formatCountdown(remaining) : null;
  const buttonHref =
    banner.buttonHref === "#menu" || !banner.buttonHref ? "#menu" : banner.buttonHref;

  return (
    <section className="my-8 border-y border-[#EFEAE2] bg-[#F3EFEB] sm:my-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-[11px] font-medium tracking-[0.18em] text-neutral-500 uppercase">
            Специальное предложение
          </p>
          <h2 className="font-serif mt-1 text-2xl font-normal text-[#1A1A1A] sm:text-[1.65rem]">
            {banner.title}
          </h2>
          <p className="mt-1 text-sm font-light text-neutral-600">{banner.subtitle}</p>
          <a
            href={buttonHref}
            onClick={(event) => handleBannerLink(buttonHref, event)}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#1A1A1A] px-6 text-xs font-medium tracking-wider text-white uppercase transition hover:bg-neutral-800"
          >
            {banner.buttonText}
          </a>
        </div>

        {isClient && parts ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Unit label="Дни" value={parts.days} />
            <span className="text-neutral-300">:</span>
            <Unit label="Часы" value={parts.hours} />
            <span className="text-neutral-300">:</span>
            <Unit label="Мин" value={parts.minutes} />
            <span className="text-neutral-300">:</span>
            <Unit label="Сек" value={parts.seconds} />
          </div>
        ) : (
          <div
            className="flex h-[4.25rem] min-w-[14rem] items-center justify-center rounded-xl border border-dashed border-[#E5DFD6] bg-white/40 text-xs tracking-wide text-neutral-400 uppercase"
            aria-hidden
          >
            Таймер загружается…
          </div>
        )}
      </div>
    </section>
  );
}
