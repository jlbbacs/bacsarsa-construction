import type { BusinessHours, DayHours, SiteSettings } from "../types";

const DAY_ORDER: (keyof BusinessHours)[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DAY_LABELS: Record<keyof BusinessHours, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function formatTime(value: string): string {
  const [hourStr, minuteStr = "00"] = value.split(":");
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minuteStr === "00" ? `${displayHour} ${period}` : `${displayHour}:${minuteStr} ${period}`;
}

/** Composes a display address from the structured fields, falling back to the legacy free-text `address` if they're all blank. */
export function formatAddress(settings: SiteSettings): string {
  const { address_street, address_city, address_state, address_postal_code } = settings;
  const hasStructured = [address_street, address_city, address_state, address_postal_code].some((v) => v?.trim());
  if (!hasStructured) return settings.address;

  const cityStateZip = [address_city, [address_state, address_postal_code].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [address_street, cityStateZip].filter(Boolean).join(", ");
}

/** Groups consecutive open days that share the same hours into display rows, e.g. "Mon - Fri: 7 AM - 5 PM". */
export function formatBusinessHours(hours: BusinessHours): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  let i = 0;

  while (i < DAY_ORDER.length) {
    const day = DAY_ORDER[i];
    const entry = hours[day];
    const value = entry.closed ? "Closed" : `${formatTime(entry.open)} - ${formatTime(entry.close)}`;

    let j = i;
    while (
      j + 1 < DAY_ORDER.length &&
      hours[DAY_ORDER[j + 1]].closed === entry.closed &&
      hours[DAY_ORDER[j + 1]].open === entry.open &&
      hours[DAY_ORDER[j + 1]].close === entry.close
    ) {
      j++;
    }

    const label = j > i ? `${DAY_LABELS[day].slice(0, 3)} - ${DAY_LABELS[DAY_ORDER[j]].slice(0, 3)}` : DAY_LABELS[day];
    rows.push({ label, value });
    i = j + 1;
  }

  return rows;
}

/** Builds a schema.org PostalAddress from the structured fields (raw values, not a formatted display string). */
export function toPostalAddressSchema(settings: SiteSettings): Record<string, unknown> {
  return {
    "@type": "PostalAddress",
    streetAddress: settings.address_street || undefined,
    addressLocality: settings.address_city || undefined,
    addressRegion: settings.address_state || undefined,
    postalCode: settings.address_postal_code || undefined,
    addressCountry: settings.address_country || undefined,
  };
}

/** Builds schema.org OpeningHoursSpecification entries for the open days only. */
export function toOpeningHoursSpecification(hours: BusinessHours): Record<string, unknown>[] {
  return DAY_ORDER.filter((day) => !hours[day].closed).map((day) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${DAY_LABELS[day]}`,
    opens: hours[day].open,
    closes: hours[day].close,
  }));
}

export function defaultDayHours(): DayHours {
  return { open: "07:00", close: "17:00", closed: false };
}

export const BUSINESS_DAYS: (keyof BusinessHours)[] = DAY_ORDER;
export const BUSINESS_DAY_LABELS = DAY_LABELS;
