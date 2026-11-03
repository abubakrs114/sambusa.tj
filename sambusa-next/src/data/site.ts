const PHONE_E164 = "992987441234";

export const SITE = {
  name: "SAMBUSA.TJ",
  city: "Dushanbe",
  phoneHref: `tel:+${PHONE_E164}`,
  phoneDisplay: "+992 987 44 1234",
  instagramHref: "https://instagram.com/chakchak.dushanbe",
  telegramHref: "https://t.me/chakchak_dushanbe",
  hours: "Ежедневно с 8:00 до 20:00",
  /** Адрес точки самовывоза (редактируйте под вашу пекарню). */
  pickupAddress: "г. Душанбе, ул. А. Джами 12 (ориентир: тандыр «SAMBUSA»)",
  pickupMapUrl:
    "https://www.google.com/maps/search/?api=1&query=38.5598,68.7870",
  corporateWhatsappHref: `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(
    "Здравствуйте! Хочу оформить предзаказ сетов самбусы для компании (самовывоз).",
  )}`,
  whatsappHref: `https://wa.me/${PHONE_E164}`,
  whatsappPhoneE164: PHONE_E164,
} as const;
