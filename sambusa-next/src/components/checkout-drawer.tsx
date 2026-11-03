"use client";

import {
  Banknote,
  Check,
  CreditCard,
  ExternalLink,
  MapPin,
  ShoppingBag,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useStorefront } from "@/context/store-context";
import { PAYMENT_OPTIONS } from "@/data/catalog";
import { useCartUi } from "@/context/cart-ui";
import { useCart } from "@/hooks/use-cart";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cartStore } from "@/lib/cart-store";
import { formatPrice, pluralize } from "@/lib/format";
import { formatPhoneDigits, isValidPhone, normalizePhoneDigits } from "@/lib/phone";
import { formatPickupTimeLabel, PICKUP_TIMING_OPTIONS } from "@/lib/pickup";
import { buildWhatsappOrderMessage, openWhatsappOrder } from "@/lib/whatsapp-order";
import type {
  CheckoutFormErrors,
  CheckoutFormState,
  PaymentMethod,
  PickupTiming,
} from "@/types";

const PAYMENT_ICONS: Record<PaymentMethod, LucideIcon> = {
  cash: Banknote,
  korti_milli: CreditCard,
  dc: Wallet,
};

const INITIAL_FORM: CheckoutFormState = {
  name: "",
  phone: "",
  comment: "",
  pickupTiming: "asap",
  pickupAtCustom: "",
  paymentMethod: "cash",
};

type SubmitStatus = "idle" | "error";

const FIELD_IDS = {
  name: "checkout-name",
  phone: "checkout-phone",
  pickupAtCustom: "checkout-pickup-custom",
} as const;

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-white px-4 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-neutral-200 focus:border-neutral-800 focus:ring-neutral-100"
  }`;

function validate(form: CheckoutFormState): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};
  if (form.name.trim().length < 2) errors.name = "Укажите, как к вам обращаться";
  if (!isValidPhone(form.phone)) errors.phone = "Введите 9 цифр номера после +992";
  if (
    form.pickupTiming === "custom" &&
    form.pickupAtCustom.trim().length < 2
  ) {
    errors.pickupAtCustom = "Укажите время, к которому подготовить заказ";
  }
  return errors;
}

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-neutral-800">
        {label}
        {optional && <span className="text-xs font-normal text-neutral-400">необязательно</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ step, children }: { step: number; children: ReactNode }) {
  return (
    <h3 className="font-serif mb-3 flex items-center gap-2 text-[15px] font-medium text-[#1A1A1A]">
      <span className="grid size-6 place-items-center rounded-full border border-[#EFEAE2] bg-[#FAF8F5] text-xs font-medium text-[#1A1A1A]">
        {step}
      </span>
      {children}
    </h3>
  );
}

export function CheckoutDrawer() {
  const { settings } = useStorefront();
  const { isOpen, close, notifyOrderSent } = useCartUi();
  const { items, totalCount, totalPrice } = useCart();
  // sm и выше — панель справа; ниже sm — нижняя шторка
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const dragControls = useDragControls();

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Блокировка прокрутки страницы, Esc и возврат фокуса
  useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus?.();
    };
  }, [isOpen, close]);

  function resetAfterClose() {
    if (status === "error") setStatus("idle");
  }

  function updateField<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    updateField("phone", normalizePhoneDigits(event.target.value));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    const firstInvalid = (["name", "phone", "pickupAtCustom"] as const).find(
      (key) => nextErrors[key],
    );
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    const paymentLabel =
      PAYMENT_OPTIONS.find((option) => option.id === form.paymentMethod)?.label ??
      form.paymentMethod;
    const pickupWhen = formatPickupTimeLabel(form.pickupTiming, form.pickupAtCustom);

    const message = buildWhatsappOrderMessage({
      form,
      items,
      totalPrice,
      pickupAddress: settings.pickupAddress,
    });
    const opened = openWhatsappOrder(message, settings.whatsappPhoneE164);
    if (!opened) {
      setStatus("error");
      return;
    }

    void fetch("/api/orders/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.name,
        customerPhone: form.phone,
        pickupLabel: pickupWhen,
        paymentLabel,
        comment: form.comment,
        channel: "whatsapp",
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }),
    });

    cartStore.clear();
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
    close();
    notifyOrderSent();
  }

  const isEmpty = items.length === 0;

  const slide = isDesktop ? { x: "100%" } : { y: "100%" };
  const slideIn = isDesktop ? { x: 0 } : { y: 0 };

  return (
    <AnimatePresence onExitComplete={resetAfterClose}>
      {isOpen && (
        // Контейнер = fixed inset-0, а панель ограничена в % от него (а не в vh/dvh):
        // так шторка никогда не вылезает за видимую область, даже в мобильных
        // браузерах с «прыгающей» адресной строкой и без поддержки dvh.
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-stretch sm:justify-end"
          key="checkout-root"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            tabIndex={-1}
            initial={slide}
            animate={slideIn}
            exit={slide}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            // Свайп вниз закрывает шторку (только на мобильных, только за шапку)
            drag={isDesktop ? false : "y"}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) close();
            }}
            className="relative z-10 flex max-h-[92%] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:h-full sm:max-h-full sm:w-[28rem] sm:rounded-t-none sm:rounded-l-3xl"
          >
            {/* Шапка модалки (за неё же тянем шторку вниз) */}
            <div
              onPointerDown={(event) => {
                if (!isDesktop && !(event.target as HTMLElement).closest("button")) {
                  dragControls.start(event);
                }
              }}
              className="shrink-0 touch-none px-5 pt-2 pb-3 sm:touch-auto sm:pt-5"
            >
              <div
                aria-hidden
                className="mx-auto mb-3 h-1.5 w-11 cursor-grab rounded-full bg-neutral-300 sm:hidden"
              />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="checkout-title"
                    className="font-serif text-xl font-medium tracking-tight text-[#1A1A1A]"
                  >
                    Оформление заказа
                  </h2>
                  {!isEmpty && (
                    <p className="text-sm text-neutral-500">Без регистрации — заказ уйдёт в WhatsApp</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Закрыть"
                  className="grid size-11 place-items-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 active:scale-95"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            {/* Контент */}
            {isEmpty ? (
              <EmptyView onClose={close} />
            ) : (
              <>
                <form
                  id="checkout-form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain border-t border-neutral-100 px-5 py-5"
                >
                  {/* Состав заказа */}
                  <section aria-label="Ваш заказ">
                    <ul className="divide-y divide-neutral-100">
                      <AnimatePresence initial={false}>
                        {items.map(({ product, quantity, lineTotal }) => (
                          <motion.li
                            key={product.id}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center gap-3 py-3">
                              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#FAF8F5] ring-1 ring-[#EFEAE2]">
                                <ProductImage product={product} variant="thumb" sizes="56px" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm leading-snug font-semibold text-neutral-900">
                                  {product.name}
                                </p>
                                <p className="mt-0.5 text-xs text-neutral-500">
                                  {formatPrice(product.price)} · {product.unit}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <QuantityStepper
                                    size="sm"
                                    trashAtOne
                                    value={quantity}
                                    label={product.name}
                                    onIncrement={() => cartStore.increment(product.id)}
                                    onDecrement={() => cartStore.decrement(product.id)}
                                  />
                                  <p className="text-sm font-extrabold whitespace-nowrap text-neutral-900 tabular-nums">
                                    {formatPrice(lineTotal)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </section>

                  {/* 1–2. Контакты */}
                  <section className="space-y-4">
                    <SectionTitle step={1}>Контакты</SectionTitle>
                    <Field id={FIELD_IDS.name} label="Имя" error={errors.name}>
                      <input
                        id={FIELD_IDS.name}
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Как вас зовут?"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? `${FIELD_IDS.name}-error` : undefined}
                        className={`h-12 ${inputClass(Boolean(errors.name))}`}
                      />
                    </Field>

                    <Field id={FIELD_IDS.phone} label="Номер телефона" error={errors.phone}>
                      <div
                        className={`flex h-12 items-center overflow-hidden rounded-xl border bg-white transition focus-within:ring-4 ${
                          errors.phone
                            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-100"
                            : "border-neutral-200 focus-within:border-neutral-800 focus-within:ring-neutral-100"
                        }`}
                      >
                        <span className="flex h-full items-center border-r border-neutral-200 bg-neutral-50 px-3.5 text-base font-semibold text-neutral-700">
                          +992
                        </span>
                        <input
                          id={FIELD_IDS.phone}
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="98 744 12 34"
                          value={formatPhoneDigits(form.phone)}
                          onChange={handlePhoneChange}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? `${FIELD_IDS.phone}-error` : undefined}
                          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-base text-neutral-900 tabular-nums outline-none placeholder:text-neutral-400"
                        />
                      </div>
                    </Field>
                  </section>

                  {/* 2. Самовывоз */}
                  <section className="space-y-4">
                    <SectionTitle step={2}>Самовывоз</SectionTitle>

                    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4">
                      <div className="flex gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FAF8F5] text-[#1A1A1A] ring-1 ring-[#EFEAE2]">
                          <MapPin className="size-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-neutral-900">Точка самовывоза</p>
                          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                            {settings.pickupAddress}
                          </p>
                          <a
                            href={settings.pickupMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] underline-offset-4 hover:underline"
                          >
                            Показать на карте
                            <ExternalLink className="size-3.5" aria-hidden />
                          </a>
                        </div>
                      </div>
                    </div>

                    <fieldset>
                      <legend className="mb-2.5 text-sm font-semibold text-neutral-800">
                        Когда будете забирать?
                      </legend>
                      <div className="flex flex-col gap-2">
                        {PICKUP_TIMING_OPTIONS.map((option) => {
                          const selected = form.pickupTiming === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                updateField("pickupTiming", option.id as PickupTiming);
                                if (option.id !== "custom") {
                                  updateField("pickupAtCustom", "");
                                }
                              }}
                              className={`rounded-full border px-4 py-2.5 text-left text-sm font-light transition-all ${
                                selected
                                  ? "border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm"
                                  : "border-[#EAE5DE] bg-white text-neutral-600 hover:border-neutral-400 hover:text-[#1A1A1A]"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {form.pickupTiming === "custom" && (
                      <Field
                        id={FIELD_IDS.pickupAtCustom}
                        label="Укажите время"
                        error={errors.pickupAtCustom}
                      >
                        <input
                          id={FIELD_IDS.pickupAtCustom}
                          name="pickupAtCustom"
                          type="text"
                          placeholder="Например: сегодня в 18:30"
                          value={form.pickupAtCustom}
                          onChange={(event) =>
                            updateField("pickupAtCustom", event.target.value)
                          }
                          aria-invalid={Boolean(errors.pickupAtCustom)}
                          aria-describedby={
                            errors.pickupAtCustom
                              ? `${FIELD_IDS.pickupAtCustom}-error`
                              : undefined
                          }
                          className={`h-12 ${inputClass(Boolean(errors.pickupAtCustom))}`}
                        />
                      </Field>
                    )}

                    <Field id="checkout-comment" label="Комментарий к заказу" optional>
                      <textarea
                        id="checkout-comment"
                        name="comment"
                        rows={2}
                        maxLength={500}
                        placeholder="Пожелания к заказу, упаковке…"
                        value={form.comment}
                        onChange={(event) => updateField("comment", event.target.value)}
                        className={`resize-none py-3 ${inputClass(false)}`}
                      />
                    </Field>
                  </section>

                  {/* 4. Оплата */}
                  <fieldset>
                    <legend className="mb-3 w-full">
                      <SectionTitle step={3}>Способ оплаты</SectionTitle>
                    </legend>
                    <div className="grid gap-2">
                      {PAYMENT_OPTIONS.map((option) => {
                        const Icon = PAYMENT_ICONS[option.id];
                        return (
                          <label key={option.id} className="relative block cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={option.id}
                              checked={form.paymentMethod === option.id}
                              onChange={() => updateField("paymentMethod", option.id)}
                              className="peer sr-only"
                            />
                            <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#EFEAE2] bg-white px-3.5 py-2.5 transition peer-checked:border-[#1A1A1A] peer-checked:bg-[#FAF8F5] peer-checked:ring-1 peer-checked:ring-[#1A1A1A]/20 peer-focus-visible:ring-4 peer-focus-visible:ring-neutral-200">
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-600">
                                <Icon className="size-5" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1 leading-tight">
                                <span className="block text-[15px] font-bold text-neutral-900">
                                  {option.label}
                                </span>
                                <span className="block text-xs text-neutral-500">{option.hint}</span>
                              </span>
                              <span
                                aria-hidden
                                className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${
                                  form.paymentMethod === option.id
                                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                                    : "border-neutral-300"
                                }`}
                              >
                                {form.paymentMethod === option.id && (
                                  <Check className="size-3" strokeWidth={3.5} />
                                )}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </form>

                {/* Нижняя панель: всегда внизу, не скроллится и не обрезается */}
                <div className="sticky bottom-0 z-20 shrink-0 border-t border-neutral-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.18)]">
                  {status === "error" && (
                    <p role="alert" className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                      Браузер заблокировал окно WhatsApp. Разрешите всплывающие окна и попробуйте снова.
                    </p>
                  )}
                  <div className="mb-2.5 flex items-baseline justify-between">
                    <span className="text-sm text-neutral-600">
                      Итого · {totalCount} {pluralize(totalCount, ["товар", "товара", "товаров"])}
                    </span>
                    <span className="text-2xl font-extrabold text-neutral-900 tabular-nums">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    form="checkout-form"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1A1A1A] text-xs font-medium tracking-wider text-white uppercase transition-all hover:bg-neutral-800 active:scale-[0.98]"
                  >
                    Подтвердить заказ в WhatsApp
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function EmptyView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 border-t border-neutral-100 px-8 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full border border-[#EFEAE2] bg-[#FAF8F5] text-[#1A1A1A]">
        <ShoppingBag className="size-8" aria-hidden />
      </span>
      <p className="text-lg font-extrabold text-neutral-900">Корзина пуста</p>
      <p className="text-sm text-neutral-500">
        Добавьте самбусу из меню — соберём заказ к вашему приезду за 15–20 минут.
      </p>
      <a
        href="#menu"
        onClick={onClose}
        className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-[#1A1A1A] px-7 text-xs font-medium tracking-wider text-white uppercase transition-colors hover:bg-neutral-800"
      >
        Перейти к меню
      </a>
    </div>
  );
}
