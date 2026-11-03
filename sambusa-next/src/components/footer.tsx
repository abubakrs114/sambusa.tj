"use client";

import { Clock, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { LucideProps } from "lucide-react";

function InstagramIcon({ className, ...props }: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

import { SITE } from "@/data/site";
import { useStorefront } from "@/context/store-context";

export function Footer() {
  const { settings } = useStorefront();
  const whatsappHref = `https://wa.me/${settings.whatsappPhoneE164}`;
  const phoneHref = `tel:+${settings.whatsappPhoneE164}`;
  const instagramHref = settings.instagramHref || SITE.instagramHref;

  const social = [
    {
      label: "Instagram",
      href: instagramHref,
      icon: InstagramIcon,
    },
    {
      label: "Telegram",
      href: SITE.telegramHref,
      icon: Send,
    },
    {
      label: "WhatsApp",
      href: whatsappHref,
      icon: MessageCircle,
    },
  ] as const;

  return (
    <footer className="mt-auto border-t border-[#EFEAE2] bg-[#1A1A1A] text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-10 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-serif text-xl font-medium tracking-tight text-[#FAF8F5]">
              SAMBUSA<span className="text-neutral-500">.TJ</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed font-light text-neutral-400">
              Традиционная выпечка и восточные сладости в Душанбе. Оформите предзаказ на
              {"сайте — заберите с пылу с жару точно ко времени."}
            </p>

            <p className="mt-5 text-xs font-medium tracking-wider text-neutral-400 uppercase">
              Следите за нами в соцсетях
            </p>
            <div className="my-4 flex gap-3">
              {social.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 transition-all duration-200 hover:bg-neutral-700 hover:text-white"
                >
                  <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <ul className="space-y-3 text-sm font-light">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden />
              <span>{settings.pickupAddress}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="size-4 text-neutral-500" aria-hidden />
              {settings.hours}
            </li>
            <li>
              <a
                href={phoneHref}
                className="flex items-center gap-2.5 transition-colors hover:text-[#FAF8F5]"
              >
                <Phone className="size-4 text-neutral-500" aria-hidden />
                {settings.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-8 border-t border-white/10 pt-5 text-xs font-light text-neutral-500">
          © SAMBUSA.TJ · Душанбе, Таджикистан
        </p>
      </div>
    </footer>
  );
}
