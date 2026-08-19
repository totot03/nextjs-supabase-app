# Development Guidelines (AI Agent 전용)

이 문서는 AI Agent가 이 리포지토리에서 코드를 작성/수정할 때 **반드시** 지켜야 할 프로젝트 고유 규칙만 담는다. 일반적인 Next.js/React/TypeScript 지식은 다루지 않는다. 아키텍처 배경 설명은 `CLAUDE.md`를 참조하고, 이 문서는 그 규칙을 실행 가능한 지시로 변환한 것이다.

## 프로젝트 개요

- **Gather**: 5-30명 규모 일회성 이벤트(모임)를 위한 모바일 퍼스트 관리 플랫폼. 초대 링크 공유, 참여자 관리, 관리자 대시보드가 핵심.
- Next.js 16 App Router + Supabase(Auth/DB/Realtime) 스타터 위에서 신규 기능(Gather PRD)을 구축 중.
- 스펙 소스는 `docs/PRD.md`, `docs/LEANCANVAS.md`, 작업 순서는 `docs/ROADMAP.md`.

## 인증/DB 아키텍처 — 위반 시 세션이 깨지거나 보안 홀이 생김

- 세션 관련 로직은 **`proxy.ts`**(루트) + `lib/supabase/proxy.ts`의 `updateSession()`에만 추가한다. `middleware.ts`를 새로 만들지 않는다.
- 인증 여부 확인은 반드시 `supabase.auth.getClaims()`를 사용한다. `supabase.auth.getUser()`로 대체하지 않는다 (`lib/supabase/proxy.ts:48`, `app/protected/page.tsx` 참조).
- `lib/supabase/proxy.ts`의 `createServerClient` 호출과 `getClaims()` 호출 사이에 다른 코드를 넣지 않는다 (세션 동기화 깨짐).
- 서버 컴포넌트/Route Handler에서 Supabase 클라이언트가 필요하면 `lib/supabase/server.ts`의 함수를 **호출할 때마다** 새로 생성해서 쓴다. 전역 변수/모듈 스코프 캐싱 금지.
- 클라이언트 컴포넌트에서는 `lib/supabase/client.ts`의 `createBrowserClient`만 사용한다.
- 로그인/회원가입 기능을 추가/수정할 때는 Server Action을 만들지 말고, `components/login-form.tsx` / `components/sign-up-form.tsx`처럼 `"use client"` 컴포넌트에서 `supabase.auth.signInWithPassword` / `signUp`을 직접 호출하는 기존 패턴을 따른다.
- `public.profiles` row는 `handle_new_user()` DB 트리거(SECURITY DEFINER, `supabase/migrations/20260813074205_create_profiles_table.sql`)가 `auth.users` insert 시 자동 생성한다. 이 함수를 PostgREST RPC로 호출하는 클라이언트 코드를 작성하지 않는다(권한이 revoke되어 있어 실패한다).
- 새 테이블을 추가할 때는 `supabase/migrations/20260813074205_create_profiles_table.sql`을 템플릿으로 따른다: RLS 반드시 활성화, `to authenticated` + `(select auth.uid())` 패턴으로 정책 작성, INSERT를 트리거로만 허용해야 하는 테이블은 별도 INSERT 정책을 만들지 않는다(주석으로 이유 명시), `security definer` 함수에는 `set search_path = ''`를 반드시 넣는다.

## 환경 변수

- `.env.local` 키 이름은 `NEXT_PUBLIC_SUPABASE_URL`, **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** 두 개뿐이다. `ANON_KEY`라는 이름을 되살리지 않는다.
- env 미설정 상태 감지는 새로 구현하지 말고 `lib/utils.ts`의 `hasEnvVars`를 재사용하고, UI 경고는 `components/env-var-warning.tsx`(`EnvVarWarning`)를 재사용한다.

## docs/ 폴더 신뢰도 — 반드시 확인 후 사용

- `docs/component-patterns.md`, `docs/forms-react-hook-form.md`, `docs/project-structure.md`, `docs/styling-guide.md` **4개 파일은 실제 상태와 다르다** (예: Next.js 15.5.3/Tailwind v4/react-hook-form·zod 설치됨이라고 서술하지만 실제는 각각 16.3.0/v3.4.1/미설치). 이 4개 파일의 버전·의존성 서술을 근거로 코드를 작성하지 않는다.
- 스택 버전, 설치 여부 판단은 항상 `package.json`과 실제 설정 파일(`tailwind.config.ts`, `eslint.config.mjs` 등)을 직접 읽어 확인한다.
- `docs/PRD.md`, `docs/LEANCANVAS.md`, `docs/ROADMAP.md`, `docs/nextjs-16.md`는 최신 상태이므로 기능 스펙/로드맵 판단 시 신뢰해도 된다.

## 데모/튜토리얼 코드 — 임의 삭제 금지

- `app/instruments/`, `components/tutorial/*`, `components/deploy-button.tsx`는 Supabase 공식 튜토리얼 잔재다. 실제 제품 기능(Gather)과 무관하지만 삭제 여부가 미결정이므로 사용자 지시 없이 삭제하거나 리팩터링하지 않는다.
- 이 코드를 정리해야 한다는 지시를 받으면 직접 손대지 말고 `.claude/agents/dev/starter-cleaner.md` 에이전트 사용을 제안한다.

## Gather 기능 개발 순서

- 신규 기능 구현 전 `docs/ROADMAP.md`에서 현재 Task 번호와 상태(✅ 여부)를 확인하고, 로드맵에 명시된 순서를 벗어나 다음 Phase 작업에 먼저 착수하지 않는다.
- Task를 완료하면 `docs/ROADMAP.md`의 해당 항목을 ✅로 표시한다(직접 편집하거나 `docs:update-roadmap` skill 사용).
- API/비즈니스 로직 작업에는 Playwright MCP E2E 테스트 시나리오를 작업 파일에 포함하고, 구현 후 실제로 Playwright MCP로 테스트를 수행한다(`docs/ROADMAP.md`의 "개발 워크플로우" 절 참조).
- 기능 요구사항이 모호하면 `docs/PRD.md`(기능 ID: F001, F002 등)를 근거로 판단하고, 임의로 요구사항을 확장하지 않는다.

## 멀티파일 동시 수정 매핑

| 변경 대상                                            | 함께 확인/수정해야 할 파일                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 새 DB 테이블/컬럼 추가 (`supabase/migrations/*.sql`) | `lib/supabase/database.types.ts` (mcp__supabase__generate_typescript_types로 재생성)                |
| `lib/supabase/proxy.ts`의 인증 필요 경로 목록 수정   | `proxy.ts`(루트, matcher 설정) 동시 확인                                                            |
| 새 shadcn/ui 컴포넌트 추가                           | `components.json`의 aliases(`@/components`, `@/lib`, `@/components/ui`, `@/hooks`) 규칙을 따라 배치 |
| `docs/ROADMAP.md`의 Task 상태 변경                   | 관련 PRD 섹션(`docs/PRD.md`) 및 완료된 실제 코드 경로 일치 여부 확인                                |
| `.env.local` 키 추가/변경                            | `lib/utils.ts`의 `hasEnvVars` 로직도 함께 갱신                                                      |

## 코드 스타일 (프로젝트 특유 사항만)

- 더블쿼트 + 세미콜론 (Prettier 강제, 직접 스타일 판단하지 않음).
- 조건부 className은 반드시 `lib/utils.ts`의 `cn()`(clsx + tailwind-merge)을 사용한다. 직접 문자열 결합이나 별도 유틸을 새로 만들지 않는다.
- `"use client"`는 폼/인터랙션 컴포넌트에만 명시적으로 붙인다. 서버 컴포넌트가 기본값이므로 필요 없는 곳에 붙이지 않는다.
- import 순서: 외부 라이브러리 → `@/` 별칭 → 상대경로. 이 순서를 강제하는 lint 규칙은 없지만 기존 파일 관례를 따른다.

## 금지 행위

- `middleware.ts` 파일을 새로 생성하는 것 — 반드시 `proxy.ts` + `lib/supabase/proxy.ts`를 사용한다.
- `supabase.auth.getUser()`로 인증 확인 로직을 작성하는 것.
- Supabase 서버 클라이언트를 모듈 top-level 변수에 캐싱하는 것.
- `public.handle_new_user()`를 클라이언트에서 RPC로 호출하는 것.
- `docs/component-patterns.md`, `docs/forms-react-hook-form.md`, `docs/project-structure.md`, `docs/styling-guide.md`의 버전/의존성 정보를 그대로 인용해 의사결정하는 것.
- `app/instruments/`, `components/tutorial/*`, `components/deploy-button.tsx`를 지시 없이 삭제/수정하는 것.
- 새 테이블에 RLS를 활성화하지 않거나, `security definer` 함수에 `search_path`를 고정하지 않는 것.
- `docs/ROADMAP.md`의 우선순위를 무시하고 임의 순서로 Task를 구현하는 것.
