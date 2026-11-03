import { SITE } from "@/data/site";
import type { PickupTiming } from "@/types";

export const PICKUP_TIMING_OPTIONS: readonly {
  id: PickupTiming;
  label: string;
}[] = [
  { id: "asap", label: "Как можно скорее (~15 мин)" },
  { id: "30min", label: "Через 30 мин" },
  { id: "custom", label: "Ко времени (указать)" },
];

/** Человекочитаемое время самовывоза для WhatsApp и UI. */
export function formatPickupTimeLabel(
  timing: PickupTiming,
  customTime: string,
): string {
  switch (timing) {
    case "asap":
      return "Как можно скорее (~15 мин)";
    case "30min":
      return "Через 30 мин";
    case "custom": {
      const trimmed = customTime.trim();
      return trimmed ? `Ко времени: ${trimmed}` : "Ко времени (не указано)";
    }
  }
}

export function getPickupLocationLine(): string {
  return SITE.pickupAddress;
}
