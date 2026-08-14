# 구글 로그인 "invalid_client" 오류 해결

## Context

사용자가 구글 로그인 버튼을 눌렀더니 Google 측에서 다음 오류를 반환했다:

> 액세스 차단됨: 승인 오류 — The OAuth client was not found. 401 오류: invalid_client

이 오류는 **Google 서버가 인증 요청에 실린 `client_id` 자체를 자기 시스템에서 찾지 못했다**는 뜻이다. 즉 앱이 브라우저를 구글 로그인 페이지로 정상적으로 보내는 데는 성공했지만, 그 요청에 담긴 클라이언트 ID가 구글 쪽에 존재하지 않거나 잘못된 값이라는 의미다.

## 코드 조사 결과 (원인 아님으로 확인됨)

Explore 에이전트로 관련 코드를 전수 확인했고, **애플리케이션 코드에는 문제가 없다**:

- `components/google-sign-in-button.tsx`: `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ... } })` — 표준 패턴, `provider: "google"` 오타 없음. Client ID/Secret을 다루는 코드가 애초에 없음(정상 — Supabase가 서버 측에서 대신 처리하는 구조).
- `app/auth/oauth/route.ts`: `exchangeCodeForSession(code)` 기반 표준 PKCE 콜백 핸들러. 문제없음.
- `lib/supabase/client.ts` / `server.ts` / `proxy.ts`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만 사용. Google 관련 로직 없음.
- `.env.local`: 위 두 키만 존재하고 `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` 같은 키는 없음 — 이는 **정상**이다. Supabase의 소셜 로그인 아키텍처에서 Google Client ID/Secret은 앱의 `.env`가 아니라 **Supabase 대시보드**에 등록하는 값이기 때문이다.
- `supabase/config.toml` 없음 → 이 프로젝트는 로컬 CLI 설정 파일이 아니라 **원격 Supabase 대시보드에서 직접 Provider를 설정하는 방식**을 쓰고 있다.
- 이 기능을 구현했던 이전 계획 문서(`.claude/plans/claude-agents-nextjs-supabase-fullstack-serene-crayon.md`)에도 "Google Cloud Console / Supabase 대시보드 설정은 코드 작업이 아니므로 대신 할 수 없다"는 메모가 남아 있었다 — 즉 애초에 **이 대시보드 설정 단계가 완료되지 않은 채** 코드만 먼저 구현되었을 가능성이 높다.

## 결론: 코드 수정이 아니라 대시보드 설정 문제

이번 건은 **수정할 코드가 없다**. 원인은 다음 중 하나이며, Google Cloud Console과 Supabase 대시보드에서 직접 확인/수정해야 한다 (둘 다 브라우저 로그인이 필요한 외부 대시보드라 내가 대신 실행할 수 없음):

1. Supabase 대시보드(Authentication → Providers → Google)에 Client ID가 **아예 입력되지 않았거나**, 복사 과정에서 **오타/공백/일부 누락**이 있음 (가장 유력).
2. Google Cloud Console에서 만든 OAuth 클라이언트가 **삭제되었거나**, 엉뚱한 GCP 프로젝트에서 만든 Client ID를 잘못 붙여넣음.
3. Client ID와 Client Secret 필드가 **서로 뒤바뀌어** 입력됨.

## 해결 절차 (사용자가 직접 수행)

프로젝트 정보(`mcp__supabase__get_project_url`로 확인):
- Supabase 프로젝트 URL: `https://nlruxstiqwnueepebtnj.supabase.co`
- **Google에 등록해야 할 정확한 리디렉션 URI**: `https://nlruxstiqwnueepebtnj.supabase.co/auth/v1/callback`

### 1단계 — Google Cloud Console 확인
1. https://console.cloud.google.com/apis/credentials 접속 (mnbvcnara@gmail.com 계정, 스크린샷과 동일 계정으로 로그인된 상태여야 함)
2. 상단에서 **올바른 GCP 프로젝트**가 선택되어 있는지 확인 (다른 프로젝트를 보고 있으면 Client ID를 못 찾는 게 당연함)
3. "OAuth 2.0 클라이언트 ID" 목록에 애플리케이션용 클라이언트가 있는지 확인
   - 없다면 새로 생성: 애플리케이션 유형 **웹 애플리케이션**
   - **승인된 자바스크립트 원본**: `http://localhost:3000` (개발용), 배포 도메인 있으면 그것도 추가
   - **승인된 리디렉션 URI**: `https://nlruxstiqwnueepebtnj.supabase.co/auth/v1/callback` (위 URI를 정확히, 오타 없이)
4. OAuth 동의 화면(OAuth consent screen)이 "테스트" 상태라면 로그인 시도하는 구글 계정이 테스트 사용자 목록에 있는지도 확인 (다만 이번 오류는 동의 화면 문제가 아니라 client_id 자체를 못 찾는 문제라 이 항목의 우선순위는 낮음)
5. 클라이언트의 **클라이언트 ID**와 **클라이언트 보안 비밀(Client Secret)**을 복사

### 2단계 — Supabase 대시보드 확인
1. https://supabase.com/dashboard/project/nlruxstiqwnueepebtnj/auth/providers 접속
2. Google 항목을 열어 **Enabled** 토글 확인
3. **Client ID (for OAuth)**와 **Client Secret (for OAuth)** 필드에 1단계에서 복사한 값을 다시 붙여넣기 (기존 값 삭제 후 재입력 — 앞뒤 공백이나 줄바꿈이 섞여 들어가는 경우가 흔한 실수 원인)
4. Save

### 3단계 — 재검증
1. 브라우저 캐시/쿠키 영향을 피하기 위해 시크릿 창에서 앱 접속
2. 구글 로그인 버튼 클릭 → 정상적으로 구글 계정 선택 화면이 뜨는지 확인 (더 이상 "invalid_client" 안 뜨면 성공)
3. 로그인 완료 후 `/auth/oauth` 콜백을 거쳐 `/protected`로 정상 리디렉션되는지 확인

## 참고: 이 작업에서 실제로 변경되는 파일

없음. 위 절차는 전부 Google Cloud Console과 Supabase 대시보드에서 이루어지는 설정 변경이며, 저장소 내 코드는 수정하지 않는다. (별도로, `git status`에 revert 충돌 중간 상태와 여러 untracked 파일이 남아 있는데, 이는 이번 OAuth 오류와는 무관한 별개 사안이라 이 플랜에서는 다루지 않는다.)
