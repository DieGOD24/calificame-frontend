"use client";

import { useSidebarStore } from "@/stores/sidebarStore";

export function useSidebar() {
  const { isCollapsed, toggle, collapse, expand } = useSidebarStore();

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
  };
}
