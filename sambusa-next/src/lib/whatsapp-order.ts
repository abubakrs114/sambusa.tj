import { PAYMENT_OPTIONS } from "@/data/catalog";
import { SITE } from "@/data/site";
import { WA_ICONS, WA_RULE } from "@/lib/whatsapp-icons";
import { formatPickupTimeLabel } from "@/lib/pickup";
import { formatPhoneDigits } from "@/lib/phone";
import type { CartItem, CheckoutFormState } from "@/types";

const L = {
  title: "\u041d\u041e\u0412\u042b\u0419 \u041f\u0420\u0415\u0414\u0417\u0410\u041a\u0410\u0417 \u2014 SAMBUSA.TJ",
  name: "\u0418\u043c\u044f",
  phone: "\u0422\u0435\u043b\u0435\u0444\u043e\u043d",
  pickup: "\u0421\u0430\u043c\u043e\u0432\u044b\u0432\u043e\u0437 \u043a",
  point: "\u0422\u043e\u0447\u043a\u0430",
  comment: "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439",
  noComment: "\u0411\u0435\u0437 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u044f",
  payment: "\u041e\u043f\u043b\u0430\u0442\u0430",
  items: "\u0421\u043e\u0441\u0442\u0430\u0432 \u0437\u0430\u043a\u0430\u0437\u0430",
  total: "\u0418\u0422\u041e\u0413\u041e \u041a \u041e\u041f\u041b\u0410\u0422\u0415",
  defaultPoint:
    "\u0433. \u0414\u0443\u0448\u0430\u043d\u0431\u0435, \u0443\u043b. \u0410. \u0414\u0436\u0430\u043c\u0438 12 (\u0442\u0430\u043d\u0434\u044b\u0440 \u00abSAMBUSA\u00bb)",
  pcs: "\u0448\u0442.",
} as const;

export interface WhatsappOrderInput {
  form: CheckoutFormState;
  items: readonly CartItem[];
  totalPrice: number;
  pickupAddress?: string;
}

/** Текст предзаказа для WhatsApp (*жирный* через markdown WA). */
export function buildWhatsappOrderMessage({
  form,
  items,
  totalPrice,
  pickupAddress,
}: WhatsappOrderInput): string {
  const paymentMethod =
    PAYMENT_OPTIONS.find((option) => option.id === form.paymentMethod)?.label ??
    form.paymentMethod;

  const customerName = form.name.trim();
  const customerPhone = `+992 ${formatPhoneDigits(form.phone)}`;
  const pickupTime = formatPickupTimeLabel(form.pickupTiming, form.pickupAtCustom);
  const commentRaw = form.comment.trim();
  const comment = commentRaw || L.noComment;
  const pickupPoint = pickupAddress?.trim() || L.defaultPoint;

  const lines = [
    `${WA_ICONS.fire} *${L.title}*`,
    WA_RULE,
    `${WA_ICONS.user} *${L.name}:* ${customerName}`,
    `${WA_ICONS.phone} *${L.phone}:* ${customerPhone}`,
    `${WA_ICONS.clock} *${L.pickup}:* ${pickupTime}`,
    `${WA_ICONS.pin} *${L.point}:* ${pickupPoint}`,
    `${WA_ICONS.comment} *${L.comment}:* ${comment}`,
    `${WA_ICONS.card} *${L.payment}:* ${paymentMethod}`,
    WA_RULE,
    `${WA_ICONS.box} *${L.items}:*`,
    ...items.map(
      ({ product, quantity, lineTotal }) =>
        `\u2022 ${product.name} \u00d7 ${quantity} ${L.pcs} \u2014 ${lineTotal} TJS`,
    ),
    WA_RULE,
    `${WA_ICONS.money} *${L.total}: ${totalPrice} TJS*`,
  ];

  return lines.join("\n");
}

export function buildWhatsappOrderUrl(
  messageText: string,
  phoneE164: string = SITE.whatsappPhoneE164,
): string {
  const cleanNumber = phoneE164.replace(/\D/g, "");
  const encoded = encodeURIComponent(messageText);
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
}

/** Открывает чат WhatsApp с уже закодированным текстом (надёжнее, чем window.open). */
export function openWhatsappOrder(messageText: string, phoneE164: string): boolean {
  if (typeof document === "undefined") return false;

  const url = buildWhatsappOrderUrl(messageText, phoneE164);
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}
