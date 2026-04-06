"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { getTranslation, type TranslationKey } from "@/lib/i18n";

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);

  const t = useCallback(
    (key: TranslationKey): string => getTranslation(language, key),
    [language]
  );

  return { t, language };
}
