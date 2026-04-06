import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getTranslation, type Language, type TranslationKey } from "./i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, lang: Language = "es") {
  return new Date(date).toLocaleDateString(lang === "en" ? "en-US" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPercentage(value: number | null) {
  if (value === null) return "N/A";
  return `${value.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    configuring: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    answer_key_uploaded: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    answer_key_processed: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    confirmed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    grading: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    uploaded: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    graded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string, lang: Language = "es"): string {
  const key = `status.${status}` as TranslationKey;
  return getTranslation(lang, key);
}
