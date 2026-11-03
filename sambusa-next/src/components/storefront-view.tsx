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
    <>
      <Header />
      <main id="top" className="flex-1">
        <Hero />
        <PromoCountdownBanner />
        <MenuSection />
      </main>
      <Footer />
      <MobileCartBar />
      <CheckoutDrawer />
      <OrderSentToast />
    </>
  );
}
