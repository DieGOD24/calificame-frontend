"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/projects", labelKey: "nav.projects", icon: <FolderOpen className="h-5 w-5" /> },
  { href: "/projects/new", labelKey: "nav.newProject", icon: <Plus className="h-5 w-5" /> },
];

const bottomNavItems: NavItem[] = [
  { href: "/settings", labelKey: "nav.settings", icon: <Settings className="h-5 w-5" /> },
  { href: "/profile", labelKey: "nav.profile", icon: <User className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/projects/new") return pathname === "/projects/new";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
      aria-label="Menu lateral"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Calificame
            </span>
          </Link>
        )}
        <button
          onClick={toggle}
          className={cn(
            "p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expandir menu" : "Colapsar menu"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <Link
            key={item.labelKey}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? t(item.labelKey) : undefined}
          >
            {item.icon}
            {!isCollapsed && <span>{t(item.labelKey)}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.labelKey}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? t(item.labelKey) : undefined}
          >
            {item.icon}
            {!isCollapsed && <span>{t(item.labelKey)}</span>}
          </Link>
        ))}

        {!isCollapsed && user && (
          <div className="px-3 py-2 text-xs text-gray-400 truncate">
            {user.full_name}
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? t("nav.logout") : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>{t("nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
