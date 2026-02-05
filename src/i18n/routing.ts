import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en", "fr", "es", "it"],
  defaultLocale: "de",
  localePrefix: "as-needed", // URLs ohne Präfix für Default-Sprache (de)
});

export type Locale = (typeof routing.locales)[number];
