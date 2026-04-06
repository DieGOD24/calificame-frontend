"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TaskProgressProps {
  progress: number;
  status: "pending" | "processing" | "completed" | "failed";
  currentStep?: string | null;
  errorMessage?: string | null;
}

export function TaskProgress({
  progress,
  status,
  currentStep,
  errorMessage,
}: TaskProgressProps) {
  const isComplete = status === "completed";
  const isFailed = status === "failed";
  const isActive = status === "processing" || status === "pending";

  return (
    <div className="w-full space-y-3">
      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isFailed
              ? "bg-red-500"
              : isComplete
                ? "bg-green-500"
                : "bg-indigo-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Status info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isActive && (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          )}
          {isComplete && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {isFailed && <XCircle className="h-4 w-4 text-red-500" />}

          <span className="text-gray-600 dark:text-gray-400">
            {currentStep || (isActive ? "Procesando..." : "")}
            {isFailed && errorMessage && (
              <span className="text-red-500">{errorMessage}</span>
            )}
            {isComplete && !currentStep && "Completado"}
          </span>
        </div>

        <motion.span
          className="font-mono font-semibold text-gray-900 dark:text-gray-100"
          key={Math.round(progress)}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
}
