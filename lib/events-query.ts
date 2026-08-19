import type { EventStatus } from "@/types/domain";
import type { EventView } from "@/components/events/event-view-tabs";

/**
 * /events 목록의 view(주최/참여 탭)/status(상태 필터) 쿼리스트링을 조합한다.
 * 탭과 상태 필터가 서로 독립된 컴포넌트(EventViewTabs, EventStatusFilter)이면서도
 * 상대방의 현재 선택값을 잃지 않도록, URL 조합 로직을 한 곳에 모아 공유한다.
 * 기본값(hosting 탭 / 전체 상태)은 URL을 짧게 유지하기 위해 생략한다.
 */
export function buildEventsHref(view: EventView, status?: EventStatus): string {
  const params = new URLSearchParams();
  if (view !== "hosting") params.set("view", view);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}
