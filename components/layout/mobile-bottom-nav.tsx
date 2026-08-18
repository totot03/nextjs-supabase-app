"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CirclePlus, User } from "lucide-react";

import { cn } from "@/lib/utils";

// 로그인 후 메인 내비게이션 (PRD "메뉴 구조" 기준 3개 탭)
// TODO(Task 004/005): 주최자/참여자 역할별 분기, 정밀한 활성 탭 로직은 UI 완성 단계에서 보강
const NAV_ITEMS = [
  { href: "/events", label: "내 이벤트", icon: CalendarDays },
  { href: "/events/create", label: "새 이벤트", icon: CirclePlus },
  { href: "/profile", label: "프로필", icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto h-16 w-full max-w-md border-t bg-background">
      <ul className="flex h-full items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/events"
              ? pathname.startsWith("/events") &&
                !pathname.startsWith("/events/create")
              : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 text-xs",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon size={22} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
