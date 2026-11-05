import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sambusa.tj"),
  title: "SAMBUSA.TJ — предзаказ самбусы из тандыра, самовывоз в Душанбе",
  description:
    "Хрустящая, сочная самбуса с пылу с жару из тандыра. Предзаказ на сайте — самовывоз за 15–20 минут. Традиционная рецептура и свежее мясо.",
  openGraph: {
    title: "SAMBUSA.TJ — тандырная самбуса, самовывоз",
    description:
      "Настоящая тандырная самбуса, фатир и чак-чак. Оформите предзаказ — заберите горячим из пекарни.",
    images: ["/img/sambusa.png"],
    locale: "ru_RU",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF8F5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${cormorant.variable} h-full min-h-dvh bg-[#FAF8F5] antialiased`}
    >
      <body className="flex min-h-dvh w-full flex-col bg-[#FAF8F5] text-[#1A1A1A]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
