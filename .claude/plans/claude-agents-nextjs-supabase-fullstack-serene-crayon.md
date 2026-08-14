# 구글 소셜 로그인(OAuth) 추가

## Context

현재 이 프로젝트는 이메일/비밀번호(`signInWithPassword`, `signUp`) 인증만 지원한다. 사용자가 구글 계정으로 바로 로그인/회원가입할 수 있도록 Supabase Auth의 Google OAuth Provider(PKCE 플로우)를 붙인다. 프로젝트 전체를 검색한 결과 `signInWithOAuth` 등 OAuth 관련 코드는 전혀 존재하지 않으므로 신규 구현이며, 로그인(`/auth/login`)과 회원가입(`/auth/sign-up`) 양쪽 페이지에 "Continue with Google" 버튼을 추가하기로 확정했다(사용자 확인 완료). 콜백 처리 방식은 Supabase 공식 문서의 Next.js PKCE 패턴을 따르되, 라우트 이름과 리다이렉트 방식은 이 프로젝트의 기존 관례(`app/auth/confirm/route.ts`의 `redirect()` 스타일)에 맞춘다.

**주의: Google Cloud Console / Supabase 대시보드 설정은 코드 작업이 아니므로 내가 대신 할 수 없다.** 사용자가 아직 이 설정을 하지 않았으므로, 구현 단계에서 외부 설정 안내를 함께 제공하고, Provider가 비활성 상태에서도 검증 가능한 부분(콜백 라우트 방어 로직, `signInWithOAuth`의 "provider not enabled" 클라이언트 에러 처리)까지 확인한 뒤 완료로 본다.

## 아키텍처 흐름

```
LoginForm / SignUpForm (client)
  → GoogleSignInButton.onClick → supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })
    → 브라우저가 자동으로 Google 동의 화면으로 이동
      → Google → https://<project-ref>.supabase.co/auth/v1/callback (Supabase 대시보드에 등록되는 값, 앱 코드와 무관)
        → Supabase가 PKCE code를 붙여 우리 앱으로 리다이렉트
          → app/auth/oauth/route.ts (신규) → exchangeCodeForSession(code)
            → 성공: redirect(next ?? "/protected")
            → 실패: redirect(`/auth/error?error=...`)
```

기존 `app/auth/confirm/route.ts`는 이메일 OTP(`verifyOtp`) 전용이라 API가 달라 재사용할 수 없으므로 건드리지 않고, PKCE 코드 교환 전용 라우트를 새로 만든다. `lib/supabase/proxy.ts`의 미인증 리다이렉트 가드는 `/auth/*` 전체를 이미 예외 처리하고 있어 새 라우트 추가에 따른 `proxy.ts` 수정은 불필요(확인 완료).

## 구현 내용

### 1. `components/google-sign-in-button.tsx` (신규, client component)

로그인 폼과 회원가입 폼에서 완전히 동일한 로직(provider 지정, `redirectTo` 구성, 로딩 state, 에러 추출)이 반복되므로 공용 컴포넌트로 뺀다. 각 폼에 인라인으로 중복 작성하지 않는다.

- `signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/oauth?next=${encodeURIComponent(next)}` } })` 호출 — `sign-up-form.tsx`의 `${window.location.origin}` 관례를 그대로 따름.
- `onError: (message: string | null) => void` prop으로 부모 폼의 기존 `setError` state를 그대로 전달받아, 새 에러 UI를 만들지 않고 기존 `{error && <p className="text-sm text-red-500">{error}</p>}` 블록을 재사용한다. (`setError`의 타입 `Dispatch<SetStateAction<string | null>>`은 구조적으로 이 prop 타입에 그대로 대입 가능.)
- 리다이렉트가 성공하면 페이지 자체가 이동하므로 아래 로직은 "리다이렉트가 아예 안 된 경우"(네트워크 에러, provider 미설정 등)에만 실행된다.
- 버튼: `Button variant="outline" className="w-full"` (기존 `auth-button.tsx`에서도 쓰는 outline variant와 통일), 내부에 구글 4색 "G" 로고 SVG를 로컬 함수로 정의(`components/next-logo.tsx` 선례를 따라 인라인 SVG 방식, `aria-hidden="true"`로 장식용 처리 — 버튼 텍스트가 이미 의미를 전달하므로). `Button`의 `buttonVariants`에 이미 `[&_svg]:size-4`가 걸려 있어 별도 크기 지정 불필요.

### 2. `app/auth/oauth/route.ts` (신규)

이름을 `callback`이 아닌 `oauth`로 지어 기존 `auth/confirm`(OTP 확인)과 목적이 명확히 구분되도록 한다.

```ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/protected";
  if (!next.startsWith("/")) next = "/protected"; // open redirect 방지

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");
  redirect(`/auth/error?error=${encodeURIComponent(oauthError ?? "No code provided")}`);
}
```

기존 `confirm/route.ts`와 동일하게 `next/navigation`의 `redirect()`(상대경로)를 사용한다 — Supabase 공식 예제의 `NextResponse.redirect` + `x-forwarded-host` 절대경로 조립 방식은 이 프로젝트 관례와 어긋나므로 채택하지 않는다.

### 3. `components/login-form.tsx`, `components/sign-up-form.tsx` (수정)

각 폼의 `<Button type="submit">` 아래(폼 하단, "Don't have an account?" 링크 위)에:
- 구분선: 새 shadcn `separator` 패키지를 설치하지 않고 순수 Tailwind로 처리 — `border-border`/`bg-card`/`text-muted-foreground`가 이미 `tailwind.config.ts`에 정의돼 있어 바로 사용 가능.
  ```tsx
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
    </div>
  </div>
  ```
- `<GoogleSignInButton onError={setError} next="/protected" />` — 로그인/회원가입 모두 동일하게 `/protected`로 이동(OAuth는 신규/기존 가입자를 Supabase가 자동으로 구분하므로 폼별로 분기할 필요 없음).

기존 `handleLogin`/`handleSignUp`, state, JSX 구조는 변경하지 않는다.

### 변경하지 않는 파일 (확인 완료)

- `app/auth/confirm/route.ts`, `app/auth/error/page.tsx` — 그대로 재사용
- `lib/supabase/proxy.ts`, 루트 `proxy.ts` — `/auth/*` 예외 처리에 이미 포함되어 수정 불필요
- `lib/supabase/client.ts`, `lib/supabase/server.ts` — 기존 `createClient()` 그대로 사용
- `types/database.types.ts` — 스키마 변경 없음. `handle_new_user()` 트리거(`supabase/migrations/20260813074205_create_profiles_table.sql`)는 `new.id`/`new.email`/`new.created_at`만 사용하므로 OAuth 신규가입에도 그대로 동작
- `package.json` — 새 의존성 설치 없음 (separator를 CSS로 대체)

## 외부 설정 단계 (사용자가 직접 수행)

구현 완료 후 실제 로그인 테스트를 하려면 아래를 사용자가 직접 진행해야 한다 (코드로 대신 불가):

1. **Google Cloud Console**: OAuth 동의 화면 구성 → 웹 애플리케이션용 OAuth 클라이언트 ID 생성 → "승인된 자바스크립트 원본"에 `http://localhost:3000` 및 배포 도메인 추가 → "승인된 리디렉션 URI"에 **Supabase 대시보드(Authentication > Providers > Google)에 표시된 `https://<project-ref>.supabase.co/auth/v1/callback` 값**을 등록(앱의 `/auth/oauth` 경로가 아님에 주의).
2. **Supabase 대시보드**: Authentication > Providers > Google 활성화, 위에서 발급받은 Client ID/Secret 입력 후 저장.
3. `.env.local`은 기존 `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만으로 충분 — OAuth 자격증명은 Supabase 프로젝트 설정에서 관리되므로 앱 쪽 env var 추가 불필요.

## 검증 방법

**Provider 설정 여부와 무관하게 지금 확인 가능:**
1. `npm run type-check`, `npm run lint`, `npm run build` 순서로 실행 (CLAUDE.md 기준 명령어).
2. `npm run dev` 후 `http://localhost:3000/auth/oauth`를 code 파라미터 없이 직접 접속 → `/auth/error?error=No%20code%20provided`로 리다이렉트되는지 확인.
3. `http://localhost:3000/auth/oauth?code=invalid-code` 접속 → `exchangeCodeForSession`이 실패를 반환하고 `/auth/error?error=...`로 리다이렉트되는지 확인.
4. 로그인/회원가입 페이지에서 "Continue with Google" 클릭 시(Provider가 아직 비활성 상태라면) `supabase.auth.signInWithOAuth`가 즉시 에러를 반환하며 리다이렉트 없이 폼의 기존 에러 문구가 뜨는지 확인 — 이 케이스는 Google Cloud Console 설정 없이 Supabase 프로젝트만 있어도 재현 가능.

**사용자가 외부 설정을 완료한 뒤 전체 플로우 검증:**
5. `/auth/login`에서 "Continue with Google" 클릭 → Google 동의 화면 → 승인 → `/auth/oauth?code=...` → `/protected`로 최종 이동 확인.
6. Supabase 대시보드 Authentication > Users에 신규 유저 생성 확인 및 `mcp__supabase__execute_sql`로 `public.profiles`에 해당 row가 트리거로 자동 생성됐는지 확인.
7. 필요 시 `mcp__playwright__*`로 로그인 페이지 → 구글 동의 화면 리다이렉트까지의 브라우저 동작을 직접 확인.

## Critical Files

- `components/google-sign-in-button.tsx` (신규)
- `app/auth/oauth/route.ts` (신규)
- `components/login-form.tsx` (수정)
- `components/sign-up-form.tsx` (수정)
- 참조용(수정 없음): `app/auth/confirm/route.ts`, `app/auth/error/page.tsx`, `lib/supabase/proxy.ts`
