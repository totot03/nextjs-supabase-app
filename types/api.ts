/**
 * API 응답 타입 정의 파일
 *
 * `docs/PRD.md`의 기능 명세(F001~F015) 중 Task 009(이벤트 CRUD/초대),
 * Task 010(참여자 관리), Task 011(관리자 대시보드 백엔드)에서 구현할
 * API/Server Action의 응답 형태를 미리 정의한다.
 *
 * `types/domain.ts`의 임시 도메인 타입을 조합해 만든 것이므로, 이 파일 역시
 * Task 007(DB 스키마 확정) 이후 domain.ts가 실제 DB 타입으로 교체되면
 * 자동으로 함께 갱신된다(별도 수정 불필요).
 */

import type { Event, EventParticipant, UserProfile } from "./domain";

/**
 * 모든 API 응답을 감싸는 공통 래퍼.
 * 성공 시 data만, 실패 시 error만 채워지는 discriminated union이라
 * 호출부에서 `if (res.error) { ... }` 형태로 안전하게 분기할 수 있다.
 */
export type ApiResponse<T> =
  { data: T; error: null } | { data: null; error: { message: string } };

/** 내 이벤트 목록 조회 응답 (F007, F008) */
export interface EventListResponse {
  events: Event[];
}

/** 이벤트 상세 조회 응답 — 참여자 목록 포함 (F001, F002, F005, F006, F009) */
export interface EventDetailResponse {
  event: Event;
  participants: EventParticipant[];
}

/** 관리자 대시보드 메인 지표 카드 응답 (F012) */
export interface AdminDashboardMetrics {
  events_today: number;
  events_this_week: number;
  events_this_month: number;
  events_total: number;
  users_today: number;
  users_this_week: number;
  users_total: number;
}

/** 관리자 테이블 페이지네이션 공통 래퍼 (F013, F014) */
export interface Paginated<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

/**
 * 관리자 이벤트 관리 테이블 응답 (F013)
 * host_name/participant_count는 domain.ts의 Event에는 없는 JOIN 결과이므로
 * 교차 타입(&)으로 확장한다.
 */
export type AdminEventsTableResponse = Paginated<
  Event & { host_name: string; participant_count: number }
>;

/**
 * 관리자 사용자 관리 테이블 응답 (F014)
 * events_created_count/events_joined_count는 domain.ts의 UserProfile에는
 * 없는 집계 결과이므로 교차 타입(&)으로 확장한다.
 */
export type AdminUsersTableResponse = Paginated<
  UserProfile & { events_created_count: number; events_joined_count: number }
>;

/** 통계 분석 그래프의 날짜별 데이터 포인트 (F015) */
export interface AnalyticsTrendPoint {
  date: string;
  count: number;
}

/** 관리자 통계 분석 페이지 응답 — 이벤트/사용자 증가 추이 (F015) */
export interface AnalyticsTrendResponse {
  events_trend: AnalyticsTrendPoint[];
  users_trend: AnalyticsTrendPoint[];
}
