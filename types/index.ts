/**
 * `types/` 디렉토리 barrel export.
 *
 * 이 디렉토리(domain.ts / api.ts / auth.ts) 전체는 실제 Supabase DB 스키마가
 * 확정되기 전까지 사용하는 임시 타입이다. `docs/PRD.md`의 데이터 모델을
 * 근거로 작성되었으며, Task 007(DB 스키마 확정 및 마이그레이션)에서
 * `lib/supabase/database.types.ts` 기반의 실제 생성 타입으로 점진 교체될
 * 예정이다. 교체 시점에도 이 barrel의 export 이름(Event, ApiResponse,
 * SessionUser 등)은 그대로 유지해, 이를 import하는 컴포넌트 쪽 코드는
 * 수정할 필요가 없도록 하는 것이 목표다.
 *
 * 사용 예: import type { Event, ApiResponse, SessionUser } from "@/types";
 */

export * from "./domain";
export * from "./api";
export * from "./auth";
