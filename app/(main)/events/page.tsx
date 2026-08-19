import Link from "next/link";
import { CalendarX2, Plus } from "lucide-react";

import type { EventStatus } from "@/types/domain";
import {
  dummyCurrentUser,
  getEventsByCreator,
  getEventsByParticipant,
  getParticipantsByEvent,
} from "@/lib/dummy";
import { EmptyState } from "@/components/common/empty-state";
import { EventCard } from "@/components/common/event-card";
import { EventStatusFilter } from "@/components/events/event-status-filter";
import {
  EventViewTabs,
  type EventView,
} from "@/components/events/event-view-tabs";

interface EventsPageProps {
  searchParams: Promise<{ status?: string; view?: string }>;
}

const VALID_STATUSES: EventStatus[] = ["upcoming", "ongoing", "ended"];
const VALID_VIEWS: EventView[] = ["hosting", "joined"];

function isEventStatus(value: string | undefined): value is EventStatus {
  return VALID_STATUSES.includes(value as EventStatus);
}

function isEventView(value: string | undefined): value is EventView {
  return VALID_VIEWS.includes(value as EventView);
}

// cacheComponents 환경에서 searchParams는 요청 시점에만 정해지므로 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 내 이벤트 목록 페이지 - 주최자/참여자 통합 뷰 (F007, F008)
// role은 유저 전역 속성이 아니라 이벤트별 속성(ParticipantRole)이라 한 사용자가
// 주최한 이벤트와 참여한 이벤트를 동시에 가질 수 있다. 그래서 페이지를 분리하는 대신
// "주최한/참여한" 탭(EventViewTabs)으로 같은 사용자의 두 role을 모두 보여준다.
// TODO(Task 007/008): getEventsByCreator/getEventsByParticipant를 실제 세션 사용자 기반 쿼리로 교체
export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { status, view } = await searchParams;
  const activeStatus = isEventStatus(status) ? status : undefined;
  const activeView = isEventView(view) ? view : "hosting";

  const baseEvents =
    activeView === "hosting"
      ? getEventsByCreator(dummyCurrentUser.id)
      : getEventsByParticipant(dummyCurrentUser.id);
  const events = activeStatus
    ? baseEvents.filter((event) => event.status === activeStatus)
    : baseEvents;

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">내 이벤트</h1>

      <EventViewTabs active={activeView} status={activeStatus} />
      <EventStatusFilter active={activeStatus} view={activeView} />

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="size-6 text-muted-foreground" />}
          title={
            activeStatus
              ? "해당 상태의 이벤트가 없어요"
              : activeView === "hosting"
                ? "아직 만든 이벤트가 없어요"
                : "아직 참여한 이벤트가 없어요"
          }
          description={
            activeView === "hosting"
              ? "새 이벤트를 만들고 초대 링크를 공유해보세요."
              : "초대 링크를 받으면 이벤트에 참여할 수 있어요."
          }
          action={
            activeView === "hosting"
              ? { label: "이벤트 만들기", href: "/events/create" }
              : undefined
          }
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
