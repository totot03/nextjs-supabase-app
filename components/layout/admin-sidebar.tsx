"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarRange, LayoutDashboard, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

// 관리자 사이드바 메뉴 (PRD "메뉴 구조" - 관리자 대시보드 사이드바 기준)
const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드 메인", icon: LayoutDashboard },
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarRange },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-svh w-60 shrink-0 flex-col bg-gray-900 text-gray-100">
      <div className="flex h-16 items-center px-4 text-lg font-bold">
        Gather Admin
      </div>
      <nav className="flex-1 px-2">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-md px-4 text-sm",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-300 hover:bg-gray-800",
                  )}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
