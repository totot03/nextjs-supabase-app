import Link from "next/link";

import type { EventStatus } from "@/types/domain";
import type { EventView } from "@/components/events/event-view-tabs";
import { eventStatusMap } from "@/lib/event-status";
import { buildEventsHref } from "@/lib/events-query";
import { cn } from "@/lib/utils";

interface EventStatusFilterProps {
  /** 현재 선택된 상태. undefined면 "전체"가 활성화된 상태다. */
  active?: EventStatus;
  /** 상태를 바꿔도 현재 탭(주최한/참여한)이 유지되도록 함께 받는다. */
  view: EventView;
}

const FILTERS: { value?: EventStatus; label: string }[] = [
  { value: undefined, label: "전체" },
  { value: "upcoming", label: eventStatusMap.upcoming.label },
  { value: "ongoing", label: eventStatusMap.ongoing.label },
  { value: "ended", label: eventStatusMap.ended.label },
];

/**
 * 내 이벤트 목록의 상태별 필터 탭 (F008).
 * 쿼리스트링(`?status=`) 기반이라 클라이언트 상태 없이 서버 컴포넌트로 구현했다 —
 * 필터를 바꿔도 자바스크립트 없이 서버에서 다시 렌더링된다.
 */
export function EventStatusFilter({ active, view }: EventStatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {FILTERS.map(({ value, label }) => {
        const isActive = value === active;

        return (
          <Link
            key={label}
            href={buildEventsHref(view, value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:bg-accent",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
