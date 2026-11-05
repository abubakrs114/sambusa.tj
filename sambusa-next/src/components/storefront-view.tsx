"use client";

import { CheckoutDrawer } from "@/components/checkout-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { MenuSection } from "@/components/menu-section";
import { MobileCartBar } from "@/components/mobile-cart-bar";
import { OrderSentToast } from "@/components/order-sent-toast";
import { PromoCountdownBanner } from "@/components/promo-countdown-banner";

export function StorefrontView() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#FAF8F5]">
      <Header />
      <main id="top" className="w-full flex-1 bg-[#FAF8F5]">
        <Hero />
        <PromoCountdownBanner />
        <MenuSection />
      </main>
      <Footer />
      <MobileCartBar />
      <CheckoutDrawer />
      <OrderSentToast />
    </div>
  );
}
