# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js App Router + Supabase 인증/DB 연동 프로젝트. Vercel의 `with-supabase` 스타터 템플릿에서 시작했다.

- Next.js **16.3.0**, React 19.2.8, TypeScript strict, ESLint flat config (`next/core-web-vitals` + `next/typescript` + `eslint-config-prettier`)
- Tailwind CSS **v3.4.1** (`tailwindcss-animate` 플러그인, CSS 변수 기반 테마) — v4 아님
- shadcn/ui (`new-york` 스타일, `components.json` 기준), 아이콘은 lucide
- 패키지 매니저는 **npm** (`package-lock.json`만 존재)
- `src/` 디렉토리 없음 — `app/`, `components/`, `lib/`가 루트 바로 아래에 있음
- Prettier(+`prettier-plugin-tailwindcss`) + Husky/lint-staged로 커밋 시 자동 포맷/린트, GitHub Actions CI(`.github/workflows/ci.yml`)로 push/PR 시 재검증

## 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run format       # prettier --write .
npm run format:check # prettier --check .
npm run type-check   # tsc --noEmit
```

Git 훅(Husky)이 자동 검증을 수행한다: **pre-commit**은 staged 파일에 대해 lint-staged(`eslint --fix` + `prettier --write`)를 실행하고, **pre-push**는 전체 프로젝트 `type-check`를 실행한다. `main` 브랜치로의 push/PR에서는 GitHub Actions가 `lint` → `format:check` → `type-check` → `build`를 순서대로 실행한다. 훅과 CI가 있어도 커밋 전에 위 명령어를 직접 돌려보는 습관은 유지한다.

## 인증 아키텍처 (실수하기 쉬운 부분)

- **`middleware.ts`가 아니라 루트의 `proxy.ts`를 사용한다.** Next.js 16의 신규 Proxy 기능으로 기존 middleware를 대체한 것이므로, 세션 관련 로직을 추가할 때 middleware.ts를 새로 만들지 말고 `lib/supabase/proxy.ts`의 `updateSession()`을 수정한다.
- 인증 확인은 `supabase.auth.getUser()`가 아니라 **`supabase.auth.getClaims()`**를 사용한다 (`lib/supabase/proxy.ts`, `app/protected/page.tsx`).
- Supabase 서버 클라이언트(`lib/supabase/server.ts`)는 **함수 호출마다 새로 생성**해야 한다 — Fluid compute 대응을 위해 전역 변수에 캐싱하지 말 것. 클라이언트 컴포넌트는 `lib/supabase/client.ts`의 `createBrowserClient`를 사용한다.
- 로그인/회원가입은 Server Action이 아니라 클라이언트 컴포넌트(`components/login-form.tsx`, `components/sign-up-form.tsx`)에서 `supabase.auth.signInWithPassword` / `signUp`을 직접 호출하는 패턴이다.
- DB 레벨에서 `handle_new_user()` 트리거(SECURITY DEFINER)가 `auth.users` insert 시 `public.profiles` row를 자동 생성한다 (`supabase/migrations/`). 이 함수는 PostgREST RPC로 노출되지 않도록 `revoke execute`가 걸려 있으니, 클라이언트에서 직접 호출하려 하면 안 된다.

## 환경 변수

`.env.local`에 다음 두 값만 필요하다 (`.env.example` 파일은 저장소에 없음):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

키 이름이 **`PUBLISHABLE_KEY`**다 (예전 `ANON_KEY` 포맷이 아님). `lib/utils.ts`의 `hasEnvVars`로 env 미설정 상태를 감지해 여러 곳에서 `EnvVarWarning`을 띄우는 패턴을 따른다.

## docs/ 폴더 주의사항

`docs/` 하위 문서 중 일부(`component-patterns.md`, `forms-react-hook-form.md`, `project-structure.md`, `styling-guide.md`)는 **실제 프로젝트 상태와 다른 내용**을 담고 있다 (예: Next.js 15.5.3이라고 서술하지만 실제는 16.3.0, Tailwind v4라고 서술하지만 실제는 v3.4.1(`prettier-plugin-tailwindcss`는 v3.4.1 기준으로 실제 설치되어 있음), react-hook-form·zod가 설치됐다고 서술하지만 `package.json`엔 없음). 스택 버전이나 설치 여부를 확인할 때는 `docs/`가 아니라 `package.json`과 실제 설정 파일을 기준으로 판단한다.

## 데모/튜토리얼 코드

`app/instruments/`, `components/tutorial/*`, `components/deploy-button.tsx`는 Supabase 공식 튜토리얼의 데모 잔재이며 실제 제품 기능이 아니다. 삭제 여부는 아직 결정되지 않았으니 임의로 지우지 말 것 (`.claude/agents/dev/starter-cleaner.md`가 정리용으로 준비되어 있다).

## 코드 스타일

- 더블쿼트 + 세미콜론 사용 (일관됨)
- 조건부 className은 `lib/utils.ts`의 `cn()` (clsx + tailwind-merge)으로 병합
- `"use client"`는 폼/인터랙션 컴포넌트에만 명시적으로 붙이고, 나머지는 서버 컴포넌트가 기본
- import 순서 강제 규칙은 없지만 외부 라이브러리 → `@/` 별칭 → 상대경로 순서를 관례로 따름
