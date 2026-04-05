import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
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
    draft: "bg-gray-100 text-gray-800",
    configuring: "bg-blue-100 text-blue-800",
    answer_key_uploaded: "bg-yellow-100 text-yellow-800",
    answer_key_processed: "bg-orange-100 text-orange-800",
    confirmed: "bg-indigo-100 text-indigo-800",
    grading: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    uploaded: "bg-gray-100 text-gray-800",
    processing: "bg-blue-100 text-blue-800",
    graded: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Borrador",
    configuring: "Configurando",
    answer_key_uploaded: "Solucionario Subido",
    answer_key_processed: "Solucionario Procesado",
    confirmed: "Confirmado",
    grading: "Calificando",
    completed: "Completado",
    uploaded: "Subido",
    processing: "Procesando",
    graded: "Calificado",
    error: "Error",
  };
  return labels[status] || status;
}
