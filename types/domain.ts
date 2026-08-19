/**
 * 임시 도메인 타입 정의 파일
 *
 * 이 파일은 실제 Supabase DB 스키마가 확정되기 전까지 사용하는 임시 타입이다.
 * `docs/PRD.md`의 "데이터 모델" 절(users/events/event_participants 테이블 스펙)을
 * 근거로 작성되었으며, Task 007(DB 스키마 확정 및 마이그레이션)에서
 * `lib/supabase/database.types.ts` 기반의 `Tables<'events'>` 등 실제 생성 타입으로
 * 교체될 예정이다.
 *
 * 필드명은 임의로 camelCase 변환하지 않고 PRD 스펙 그대로 snake_case를 유지한다.
 * (기존 `lib/supabase/database.types.ts`의 명명 관례와 통일하기 위함)
 */

/** 이벤트 진행 상태 */
export type EventStatus = "upcoming" | "ongoing" | "ended";

/** 이벤트 참여자 역할 */
export type ParticipantRole = "host" | "participant";

/** 사용자 권한 역할 */
export type UserRole = "user" | "admin";

/**
 * 이벤트 정보
 * PRD "데이터 모델 > events" 테이블 스펙 기준 임시 타입.
 * Task 007에서 `Tables<'events'>`로 교체될 예정.
 */
export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  cover_image_url: string | null;
  invite_code: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * 이벤트 참여자 정보
 * PRD "데이터 모델 > event_participants" 테이블 스펙 기준 임시 타입.
 * Task 007에서 `Tables<'event_participants'>`로 교체될 예정.
 */
export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
}

/**
 * 사용자 프로필 정보
 * PRD "데이터 모델 > users" 테이블 스펙 기준 임시 타입.
 * Task 007에서 `Tables<'profiles'>`로 교체될 예정.
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  // TODO(Task 007): 실제 profiles 테이블에는 아직 role 컬럼이 없음 — DB 스키마 확정 시 마이그레이션으로 추가 필요
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * 이벤트 생성 시 입력 타입
 * id/created_at/updated_at은 DB가 자동 생성하고,
 * invite_code는 서버에서 생성, status는 기본값(upcoming)으로 시작하므로 제외한다.
 */
export type EventInsert = Omit<
  Event,
  "id" | "created_at" | "updated_at" | "invite_code" | "status"
>;

/** 이벤트 수정 시 입력 타입 (모든 필드 선택적) */
export type EventUpdate = Partial<EventInsert>;

/**
 * 이벤트 참여자 생성 시 입력 타입
 * id/joined_at은 DB가 자동 생성하므로 제외한다.
 */
export type EventParticipantInsert = Omit<EventParticipant, "id" | "joined_at">;
