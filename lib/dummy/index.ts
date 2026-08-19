import type {
  Event,
  EventParticipant,
  EventStatus,
  UserProfile,
} from "@/types/domain";
import type { EventDetailResponse, EventListResponse } from "@/types/api";
import { dummyUsers } from "./users";
import { dummyEvents } from "./events";
import { dummyParticipants } from "./participants";

export { dummyUsers, dummyEvents, dummyParticipants };

/**
 * 더미 단계의 "로그인한 사용자".
 * Task 007/008(DB 스키마 확정, 인증 시스템)이 붙기 전까지, 주최자 뷰를 시연하기 위해
 * dummyUsers 중 이벤트를 2개 소유한 user-02(김민준)로 고정한다. 실제 세션이 연결되면
 * `supabase.auth.getClaims()` + profiles 조회 결과(`types/auth.ts`의 SessionUser)로
 * 교체될 예정이며, 이 값을 참조하는 모든 곳(목록/상세/프로필 페이지)은 이 상수 하나만
 * 바꾸면 되도록 설계했다.
 */
export const dummyCurrentUser: UserProfile = dummyUsers[1];

/** id로 이벤트를 조회한다. 존재하지 않으면 undefined를 반환한다. */
export function getEventById(id: string): Event | undefined {
  return dummyEvents.find((event) => event.id === id);
}

/** 특정 상태(EventStatus)의 이벤트만 필터링한다. */
export function getEventsByStatus(status: EventStatus): Event[] {
  return dummyEvents.filter((event) => event.status === status);
}

/** 특정 사용자가 주최한(created_by) 이벤트 목록을 조회한다. */
export function getEventsByCreator(userId: string): Event[] {
  return dummyEvents.filter((event) => event.created_by === userId);
}

/** 특정 이벤트에 속한 참여자 목록을 조회한다. */
export function getParticipantsByEvent(eventId: string): EventParticipant[] {
  return dummyParticipants.filter(
    (participant) => participant.event_id === eventId,
  );
}

/** id로 사용자 프로필을 조회한다. 존재하지 않으면 undefined를 반환한다. */
export function getUserProfileById(id: string): UserProfile | undefined {
  return dummyUsers.find((user) => user.id === id);
}

/**
 * 내 이벤트 목록 조회 API(F007, F008)의 더미 응답.
 * types/api.ts의 EventListResponse 형태로 감싸, Task 007에서 실제 서버
 * 함수(예: getEvents(): Promise<EventListResponse>)로 교체할 때 호출부의
 * 타입 시그니처가 유지되도록 한다.
 */
export function getEventListResponse(): EventListResponse {
  return { events: dummyEvents };
}

/**
 * 이벤트 상세 조회 API(F001, F002, F005, F006, F009)의 더미 응답.
 * 이벤트가 존재하지 않으면 undefined를 반환한다(실제 API의 404/에러 케이스에 대응).
 */
export function getEventDetailResponse(
  eventId: string,
): EventDetailResponse | undefined {
  const event = getEventById(eventId);
  if (!event) return undefined;

  return { event, participants: getParticipantsByEvent(eventId) };
}
