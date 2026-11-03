"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-x-clip bg-[#FAF8F5]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 size-[32rem] rounded-full bg-[#EFEAE2]/40 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-8 pb-10 sm:px-6 md:pt-14 md:pb-16 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pt-16 lg:pb-20">
        <div className="flex flex-col items-start">
          <p className="rounded-full border border-neutral-300/60 px-4 py-1 text-[11px] tracking-[0.14em] text-neutral-500">
            ARTISAN BAKERY &amp; PASTRY • DUSHANBE
          </p>

          <h1 className="font-serif mt-6 text-4xl leading-[1.15] font-normal tracking-tight text-[#1A1A1A] sm:text-[2.65rem] lg:text-5xl">
            Искусство свежей выпечки: от горячей самбусы до нежных десертов
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-relaxed font-light tracking-normal text-neutral-500 sm:text-[15px]">
            Хрустящая тандырная самбуса, золотистый чак-чак, праздничные торты и ароматные
            булочки. Оформите предзаказ — заберите свежим прямо из пекарни без очереди.
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href="#menu"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-7 py-3.5 text-xs font-medium tracking-wider text-white uppercase transition-all duration-300 hover:bg-neutral-800 sm:w-auto"
            >
              Выбрать в меню
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.5}
                aria-hidden
              />
            </a>
            <a
              href="#section-sweets"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-neutral-300 px-6 py-3.5 text-xs font-medium tracking-wider text-neutral-800 uppercase transition-colors hover:border-neutral-400 hover:bg-white/60 sm:w-auto"
            >
              Сладости и торты
            </a>
          </div>

          <p className="mt-10 text-[11px] font-light tracking-wide text-neutral-500 sm:text-xs">
            <span className="font-medium text-[#1A1A1A]">⭐ 4.9</span> рейтинг гостей
            <span aria-hidden className="mx-2 text-neutral-300">
              •
            </span>
            <span className="font-medium text-[#1A1A1A]">25 000+</span> заказов
            <span aria-hidden className="mx-2 text-neutral-300">
              •
            </span>
            <span className="font-medium text-[#1A1A1A]">⚡ от 15 мин</span> готовность
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="relative aspect-[4/3] max-h-[420px] w-full overflow-hidden rounded-3xl bg-[#FAF8F5] shadow-[0_20px_50px_rgba(0,0,0,0.06)] md:aspect-[16/10]">
              <Image
                src="/img/bannergl.png"
                alt="Свежая выпечка и десерты Sambusa.tj"
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
              />

              <div className="absolute top-4 left-4 rounded-full border border-white/60 bg-white/75 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-neutral-700 uppercase shadow-sm backdrop-blur-md">
                Хит продаж
              </div>
              <div className="absolute right-4 bottom-4 max-w-[85%] rounded-full border border-white/60 bg-white/75 px-3.5 py-1.5 text-[11px] font-light text-neutral-600 shadow-sm backdrop-blur-md">
                Свежая выпечка каждый день
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
