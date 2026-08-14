# 커밋 계획: 대기 중인 변경사항 정리

## Context

`/init` 실행으로 `CLAUDE.md`와 `.claude/settings.json`(ESLint 자동수정 훅)이 새로 생겼고, 그 외에도 세션 시작 전부터 스테이지되지 않은 변경사항들(`.mcp.json` 수정, `.claude/agents/`, `.claude/commands/`, `.claude/hooks/`, `docs/`, `shrimp_data/`)이 쌓여 있었다. `/git:commit`을 실행하려던 시점에 사용자가 개입해 플랜 모드로 전환했으므로, 실행 전에 커밋 단위를 먼저 정리한다.

`git status` 확인 결과 스테이지된 파일은 없고, 다음이 전부 미반영 상태다:
- 수정됨: `.mcp.json`
- 추적 안 됨: `.claude/agents/`, `.claude/commands/`, `.claude/hooks/`, `.claude/settings.json`, `CLAUDE.md`, `docs/`, `shrimp_data/`

(`.claude/settings.local.json`은 사용자의 전역 gitignore(`**/.claude/settings.local.json`)에 걸려 있어 커밋 대상에서 자동 제외됨 — 별도 처리 불필요.)

사용자는 위 항목들을 **7개의 원자적 커밋**으로 나누고, `shrimp_data/`도 그대로 커밋하기로 결정했다.

## 접근 방식

각 커밋은 `git add <경로>` 후 `git commit -m "<이모지> <타입>: <설명>"` 형태로 순서대로 실행한다. Claude 서명은 추가하지 않는다(사용자 프로젝트 규칙).

1. **📝 docs: CLAUDE.md 프로젝트 가이드 추가**
   - `git add CLAUDE.md`
   - 스택 버전, `proxy.ts` 기반 인증 아키텍처, 환경변수 키 이름, `docs/` 신뢰 경고, 데모 코드 표시, 코드 스타일 관례를 담은 신규 CLAUDE.md.

2. **🔧 chore: ESLint 자동 수정 PostToolUse 훅 추가**
   - `git add .claude/settings.json`
   - `Write|Edit` 후 `.ts/.tsx/.js/.jsx` 파일에 `eslint --fix`를 실행하는 훅. 이번 세션에서 라이브로 동작 확인 완료.

3. **🔧 chore: MCP 서버 설정 추가**
   - `git add .mcp.json`
   - `playwright`, `context7`, `sequential-thinking`, `shadcn`, `shrimp-task-manager` MCP 서버 등록 (기존 `supabase`는 유지).

4. **🔧 chore: Claude Code 서브에이전트 및 슬래시 커맨드 추가**
   - `git add .claude/agents/ .claude/commands/`
   - 에이전트 8개(`dev/code-reviewer`, `dev/development-planner`, `dev/nextjs-app-developer`, `dev/starter-cleaner`, `dev/ui-markup-specialist`, `docs/prd-generator`, `docs/prd-validator`, `notion-api-database-expert`)와 슬래시 커맨드 5개(`docs/update-roadmap`, `git/branch`, `git/commit`, `git/merge`, `git/pr`).

5. **🔧 chore: Slack 알림 훅 스크립트 추가**
   - `git add .claude/hooks/`
   - `notification-hook.sh`, `stop-hook.sh`. 현재 `settings.json`에 등록되지 않았고 필요한 `SLACK_WEBHOOK_URL`(`.env`)도 없어 미완성 상태이지만, 파일 자체는 그대로 커밋.

6. **📝 docs: Next.js/Tailwind/폼 관련 프로젝트 문서 추가**
   - `git add docs/`
   - `nextjs-16.md`, `component-patterns.md`, `forms-react-hook-form.md`, `project-structure.md`, `styling-guide.md`. 일부 문서는 실제 상태(Next 16.3.0, Tailwind v3 등)와 다른 내용을 담고 있음 — 이미 `CLAUDE.md`에 경고를 남겨뒀으므로 내용 수정 없이 커밋만 진행.

7. **🔧 chore: shrimp-task-manager 데이터 디렉토리 추가**
   - `git add shrimp_data/`
   - `shrimp_data/WebGUI.md`.

커밋 순서는 위 번호 순서를 따른다(파일 간 의존관계는 없으므로 순서 자체가 결과에 영향을 주진 않지만, 이번 세션 작업물 → 기존 설정 → 문서 → 데이터 순으로 진행해 리뷰하기 쉽게 정리).

## 검증

- 각 커밋 후 `git status`로 의도한 파일만 스테이지/커밋되었는지 확인.
- 전체 완료 후 `git log --oneline -7`로 7개 커밋이 순서대로 쌓였는지 확인.
- 마지막에 `git status`가 클린한지(추적 안 된 대상 파일이 남지 않았는지) 확인.
