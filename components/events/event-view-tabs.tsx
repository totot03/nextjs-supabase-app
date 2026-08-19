import Link from "next/link";

import type { EventStatus } from "@/types/domain";
import { buildEventsHref } from "@/lib/events-query";
import { cn } from "@/lib/utils";

export type EventView = "hosting" | "joined";

interface EventViewTabsProps {
  active: EventView;
  /** 탭을 전환해도 현재 상태 필터가 유지되도록 함께 받는다. */
  status?: EventStatus;
}

const TABS: { value: EventView; label: string }[] = [
  { value: "hosting", label: "주최한 이벤트" },
  { value: "joined", label: "참여한 이벤트" },
];

/**
 * 내 이벤트 목록의 "주최한/참여한" 탭 (F007).
 * EventStatusFilter와 동일하게 쿼리스트링(`?view=`) 기반 서버 컴포넌트로 구현해
 * 자바스크립트 없이도 서버에서 다시 렌더링되도록 한다. role은 유저 전역 속성이 아니라
 * 이벤트별 속성이라(types/domain.ts의 ParticipantRole) 한 사용자가 두 탭 모두에
 * 이벤트를 가질 수 있으므로, 페르소나를 나누는 대신 탭으로 두 role을 함께 보여준다.
 */
export function EventViewTabs({ active, status }: EventViewTabsProps) {
  return (
    <div
      role="tablist"
      className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1"
    >
      {TABS.map(({ value, label }) => {
        const isActive = value === active;
        return (
          <Link
            key={value}
            href={buildEventsHref(value, status)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "rounded-md py-2 text-center text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
