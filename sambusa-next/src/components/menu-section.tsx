"use client";

import { useMemo } from "react";

import { SectionNavBar } from "@/components/section-nav-bar";
import { ProductCard } from "@/components/product-card";
import { useStorefront } from "@/context/store-context";
import { useActiveMenuSection } from "@/hooks/use-active-menu-section";
import type { MenuSectionId } from "@/types";

function MenuSectionBlock({
  index,
  title,
  description,
  sectionId,
  productOffset,
}: {
  index: string;
  title: string;
  description: string;
  sectionId: MenuSectionId;
  productOffset: number;
}) {
  const { productsBySection } = useStorefront();
  const products = productsBySection[sectionId] ?? [];

  if (products.length === 0) return null;

  return (
    <section
      id={`section-${sectionId}`}
      aria-labelledby={`heading-${sectionId}`}
      className="scroll-mt-24 border-t border-[#EFEAE2]/80 first:border-t-0"
    >
      <header className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <p className="text-[11px] font-medium tracking-[0.22em] text-neutral-400 uppercase">
          {index}
        </p>
        <h2
          id={`heading-${sectionId}`}
          className="font-serif mt-2 text-2xl font-normal tracking-tight text-[#1A1A1A] sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm font-light text-neutral-500 sm:text-[15px]">
          {description}
        </p>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, indexInSection) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                index={productOffset + indexInSection}
                animateIn={false}
                priority={productOffset + indexInSection < 4}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function MenuSection() {
  const { sections, productsBySection } = useStorefront();
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeSection = useActiveMenuSection(true, sectionIds);

  const sectionOffsets = useMemo(() => {
    const offsets: number[] = [];
    let total = 0;
    for (const section of sections) {
      offsets.push(total);
      total += productsBySection[section.id]?.length ?? 0;
    }
    return offsets;
  }, [sections, productsBySection]);

  return (
    <div id="menu" className="scroll-mt-[var(--header-h)] bg-[#FAF8F5]">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-2 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-normal tracking-tight text-[#1A1A1A] sm:text-4xl">
          Меню
        </h2>
        <p className="mt-2 max-w-xl text-sm font-light tracking-normal text-neutral-500 sm:text-[15px]">
          Полный ассортимент пекарни. Оформите предзаказ — заберите свежую выпечку к вашему приезду.
        </p>
      </div>

      <SectionNavBar active={activeSection} />

      {sections.map((section, sectionIndex) => (
        <MenuSectionBlock
          key={section.id}
          index={section.index}
          title={section.title}
          description={section.description}
          sectionId={section.id}
          productOffset={sectionOffsets[sectionIndex] ?? 0}
        />
      ))}
    </div>
  );
}
