"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

export function SettingsInitializer() {
  const initialize = useSettingsStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
