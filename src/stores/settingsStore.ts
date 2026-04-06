import { create } from "zustand";

interface SettingsState {
  darkMode: boolean;
  language: "es" | "en";
  notifications: boolean;
  autoGrade: boolean;
  confirmBeforeGrade: boolean;
  setDarkMode: (value: boolean) => void;
  setLanguage: (value: "es" | "en") => void;
  setNotifications: (value: boolean) => void;
  setAutoGrade: (value: boolean) => void;
  setConfirmBeforeGrade: (value: boolean) => void;
  initialize: () => void;
}

const STORAGE_KEY = "calificame_settings";

function loadSettings(): Partial<SettingsState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettings(state: Partial<SettingsState>) {
  if (typeof window === "undefined") return;
  const { darkMode, language, notifications, autoGrade, confirmBeforeGrade } =
    state as SettingsState;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ darkMode, language, notifications, autoGrade, confirmBeforeGrade })
  );
}

function applyDarkMode(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", enabled);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  darkMode: false,
  language: "es",
  notifications: true,
  autoGrade: true,
  confirmBeforeGrade: true,

  initialize: () => {
    const saved = loadSettings();
    const merged = { ...get(), ...saved };
    set(merged);
    applyDarkMode(merged.darkMode);
  },

  setDarkMode: (value) => {
    set({ darkMode: value });
    applyDarkMode(value);
    saveSettings({ ...get(), darkMode: value });
  },

  setLanguage: (value) => {
    set({ language: value });
    saveSettings({ ...get(), language: value });
  },

  setNotifications: (value) => {
    set({ notifications: value });
    saveSettings({ ...get(), notifications: value });
  },

  setAutoGrade: (value) => {
    set({ autoGrade: value });
    saveSettings({ ...get(), autoGrade: value });
  },

  setConfirmBeforeGrade: (value) => {
    set({ confirmBeforeGrade: value });
    saveSettings({ ...get(), confirmBeforeGrade: value });
  },
}));
