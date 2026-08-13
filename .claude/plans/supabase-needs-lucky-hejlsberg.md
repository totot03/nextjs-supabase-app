# Supabase MCP 인증 처리

## Context
`.mcp.json`에 등록된 `supabase` MCP 서버(`https://mcp.supabase.com/mcp?project_ref=nlruxstiqwnueepebtnj...`)가 `△ needs authentication` 상태로 표시되고 있습니다. 이는 Supabase MCP 서버가 원격 HTTP 서버이고 OAuth 인가 코드 흐름으로 인증하도록 되어 있는데, 아직 이 세션에서 OAuth 인가를 완료하지 않았기 때문입니다. 코드 변경 사항은 없으며, 인증 플로우만 완료하면 `docs`, `account`, `database`, `debugging`, `development` 관련 Supabase MCP 도구들을 정상적으로 사용할 수 있게 됩니다.

## 처리 단계
1. `mcp__supabase__authenticate` 도구를 호출해 OAuth 인가 URL을 발급받는다.
2. 발급된 인가 URL을 사용자에게 전달하고, 사용자는 브라우저에서 해당 URL을 열어 Supabase 계정으로 로그인 및 프로젝트(`nlruxstiqwnueepebtnj`) 접근을 승인한다.
3. 승인 후 브라우저가 `http://localhost:<port>/callback?code=...&state=...` 형태의 URL로 리다이렉트된다. (로컬 세션에서는 페이지가 정상적으로 로드됨 — 주소창의 콜백 URL을 그대로 사용)
4. 사용자가 최종 콜백 URL(주소창 전체)을 전달하면, `mcp__supabase__complete_authentication`에 `callback_url` 파라미터로 전달하여 인증을 완료한다.
5. 인증이 완료되면 supabase MCP 서버의 실제 도구 목록(테이블 조회, SQL 실행, 로그 확인 등)이 자동으로 활성화된다.

## 검증
- 인증 완료 후 supabase MCP 도구(예: 프로젝트/테이블 목록 조회 도구)를 호출해 정상적으로 응답이 오는지 확인한다.
