"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /**
   * 이미 렌더링된 아이콘 엘리먼트를 받는다(예: `<CalendarX2 className="size-6" />`).
   * 컴포넌트 함수(LucideIcon) 자체를 prop으로 받으면 서버 컴포넌트에서 이
   * 클라이언트 컴포넌트로 넘길 때 "함수는 직렬화할 수 없다"는 RSC 에러가
   * 나기 때문에, 반드시 호출부에서 JSX로 만들어 넘기도록 타입을 제한한다.
   */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * 범용 빈 상태 UI. 여러 페이지에서 아이콘/문구/CTA만 바꿔 재사용한다.
 * action.href(페이지 이동)와 action.onClick(핸들러 호출) 두 방식을 모두
 * 지원해야 해서 "use client"로 만들었다(href 전용이면 서버 컴포넌트도 가능).
 */
export function EmptyState({
  icon = <Inbox className="size-6 text-muted-foreground" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-10 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-muted p-4">{icon}</div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action &&
        (action.href ? (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        ))}
    </div>
  );
}
