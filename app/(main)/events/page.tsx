import Link from "next/link";
import { CalendarX2, Plus } from "lucide-react";

import type { EventStatus } from "@/types/domain";
import {
  dummyCurrentUser,
  getEventsByCreator,
  getParticipantsByEvent,
} from "@/lib/dummy";
import { EmptyState } from "@/components/common/empty-state";
import { EventCard } from "@/components/common/event-card";
import { EventStatusFilter } from "@/components/events/event-status-filter";

interface EventsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const VALID_STATUSES: EventStatus[] = ["upcoming", "ongoing", "ended"];

function isEventStatus(value: string | undefined): value is EventStatus {
  return VALID_STATUSES.includes(value as EventStatus);
}

// cacheComponents 환경에서 searchParams는 요청 시점에만 정해지므로 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 내 이벤트 목록 페이지 - 주최자 뷰 (F007, F008)
// TODO(Task 007/008): getEventsByCreator(dummyCurrentUser.id)를 실제 세션 사용자 기반 쿼리로 교체
export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { status } = await searchParams;
  const activeStatus = isEventStatus(status) ? status : undefined;

  const myEvents = getEventsByCreator(dummyCurrentUser.id);
  const events = activeStatus
    ? myEvents.filter((event) => event.status === activeStatus)
    : myEvents;

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">내 이벤트</h1>

      <EventStatusFilter active={activeStatus} />

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="size-6 text-muted-foreground" />}
          title={
            activeStatus
              ? "해당 상태의 이벤트가 없어요"
              : "아직 만든 이벤트가 없어요"
          }
          description="새 이벤트를 만들고 초대 링크를 공유해보세요."
          action={{ label: "이벤트 만들기", href: "/events/create" }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              participantCount={getParticipantsByEvent(event.id).length}
            />
          ))}
        </div>
      )}

      {/* 플로팅 "+ 이벤트 만들기" 버튼. mobile-bottom-nav.tsx와 동일한 기법(inset-x-0 + mx-auto
          + max-w-md)으로 448px 콘텐츠 컬럼 안쪽에 정렬되도록 만들어, 데스크톱 폭에서도
          화면 맨 우측이 아닌 콘텐츠 컬럼의 우측 하단에 붙는다. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto w-full max-w-md">
        <div className="flex justify-end px-4">
          <Link
            href="/events/create"
            aria-label="새 이벤트 만들기"
            className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          >
            <Plus className="size-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
