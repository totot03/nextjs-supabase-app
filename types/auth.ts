/**
 * 전역 세션 사용자 타입 정의 파일
 *
 * 이 프로젝트는 Zustand/Redux 같은 클라이언트 전역 상태 라이브러리를 쓰지 않고,
 * RSC(React Server Component) + Supabase 세션 기반 아키텍처를 따른다.
 * 따라서 "전역 상태"는 별도 스토어가 아니라, 서버 컴포넌트가
 * `supabase.auth.getClaims()`(`app/protected/page.tsx` 패턴)로 얻은 세션 정보와
 * `profiles` 테이블 조회 결과를 조합해 만든 뒤 하위 컴포넌트에 props로
 * 내려주는 이 `SessionUser` 타입으로 표현한다. 이번 Task는 순수 타입 정의만
 * 다루며, 실제 페이지에 적용하는 것은 Task 008(인증 시스템)의 범위다.
 */

import type { UserRole } from "./domain";

/** 로그인한 사용자의 세션 정보 — 서버 컴포넌트 → 클라이언트 컴포넌트로 props 전달 용도 */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
}
