"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface BadgeProps {
  status?: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ status, label, className, children }: BadgeProps) {
  const colorClass = status ? getStatusColor(status) : "bg-gray-100 text-gray-800";
  const displayLabel = label || (status ? getStatusLabel(status) : "");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {children || displayLabel}
    </span>
  );
}
