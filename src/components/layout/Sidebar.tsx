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
  Building2,
  BarChart3,
  FileImage,
  Shield,
  GraduationCap,
} from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";
import type { UserRole } from "@/types/user";

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: React.ReactNode;
  roles?: UserRole[];
  hideForRoles?: UserRole[];
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/projects", labelKey: "nav.projects", icon: <FolderOpen className="h-5 w-5" />, hideForRoles: ["student"] },
  { href: "/projects/new", labelKey: "nav.newProject", icon: <Plus className="h-5 w-5" />, hideForRoles: ["student"] },
  { href: "/institutions", labelKey: "nav.institutions", icon: <Building2 className="h-5 w-5" />, roles: ["developer", "admin", "institution"] },
  { href: "/analytics", labelKey: "nav.analytics", icon: <BarChart3 className="h-5 w-5" />, roles: ["developer", "admin", "institution", "professor"] },
  { href: "/pdf-generator", labelKey: "nav.pdfGenerator", icon: <FileImage className="h-5 w-5" /> },
  { href: "/admin", labelKey: "nav.admin", icon: <Shield className="h-5 w-5" />, roles: ["developer", "admin"] },
  { href: "/student", labelKey: "nav.studentDashboard", icon: <GraduationCap className="h-5 w-5" />, roles: ["student"] },
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
    if (href === "/student") return pathname === "/student";
    if (href === "/admin") return pathname === "/admin";
    if (href === "/analytics") return pathname === "/analytics";
    if (href === "/pdf-generator") return pathname.startsWith("/pdf-generator");
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
        {mainNavItems
          .filter((item) => {
            const role = user?.role;
            if (!role) return !item.roles; // show non-restricted items when no user
            if (item.roles && !item.roles.includes(role)) return false;
            if (item.hideForRoles && item.hideForRoles.includes(role)) return false;
            return true;
          })
          .map((item) => {
            const displayLabel = t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? displayLabel : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{displayLabel}</span>}
              </Link>
            );
          })}
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
            title={isCollapsed ? t(item.labelKey!) : undefined}
          >
            {item.icon}
            {!isCollapsed && <span>{t(item.labelKey!)}</span>}
          </Link>
        ))}

        {!isCollapsed && user && (
          <div className="px-3 py-2 space-y-0.5">
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.full_name}
            </div>
            <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium uppercase">
              {t(`role.${user.role || "professor"}` as TranslationKey)}
            </div>
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
