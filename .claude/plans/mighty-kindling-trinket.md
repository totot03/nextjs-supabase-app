# 미커밋 변경사항 정리 커밋

## Context

`/git:commit` 요청으로 현재 작업 트리의 모든 변경사항을 커밋하려 했으나, 조사 결과 저장소가 **`git revert` 충돌로 중단된 mid-operation 상태**임이 확인됐다. 커밋 `bfdcedd`(plan 파일 2개 추가)를 되돌리는 revert가 실행됐다가, 그중 `recursive-doodling-comet.md`가 이후 커밋(`f8199e8`)에서 완전히 다른 내용(구글 로그인 push 실패 → OAuth workflow scope 문제 해결 plan)으로 덮어써지는 바람에 삭제 충돌이 났다. 이 상태를 먼저 해소하지 않으면 이후 어떤 커밋을 쌓아도 나중에 `revert --continue`/`--abort` 실행 시 의도치 않게 파일이 사라지거나 되살아날 위험이 있다.

나머지 변경사항은 크게 세 갈래다: (1) 구글 소셜 로그인(OAuth) 기능 구현 및 관련 plan 문서, (2) 신규 서브에이전트 정의 2종, (3) `.playwright-mcp/` 디버그 로그와 `image.png`처럼 저장소에 남으면 안 되는 산출물. 사용자 확인을 거쳐 아래와 같이 정리하기로 했다.

## 실행 순서

### 0. Revert 충돌 해결 (사용자 결정: 부분 완료)
`recursive-doodling-comet.md`는 현재 내용(push 실패 해결 plan)을 그대로 유지하고, `magical-doodling-kurzweil.md`는 이미 stage된 삭제 상태 그대로 두어 revert를 마무리한다.

```bash
git add .claude/plans/recursive-doodling-comet.md
GIT_EDITOR=true git revert --continue
```
(`GIT_EDITOR=true`로 에디터 실행을 건너뛰고 자동 생성된 revert 커밋 메시지를 그대로 사용 — 비대화형 환경에서 에디터가 열려 멈추는 것을 방지)

검증: `git status`에 "currently reverting" 문구가 사라지고 `.claude/plans/magical-doodling-kurzweil.md`만 삭제, `recursive-doodling-comet.md`는 현재 내용 그대로 유지되는지 확인.

### 1. 구글 소셜 로그인(OAuth) 기능 — `✨ feat`
```bash
git add components/google-sign-in-button.tsx app/auth/oauth/route.ts components/login-form.tsx components/sign-up-form.tsx
git commit -m "✨ feat: 구글 소셜 로그인(OAuth) 추가"
```
- `components/google-sign-in-button.tsx`(신규): `signInWithOAuth` 호출 버튼
- `app/auth/oauth/route.ts`(신규): PKCE 콜백 핸들러 (`exchangeCodeForSession`)
- `login-form.tsx`, `sign-up-form.tsx`: 위 버튼 삽입

### 2. 관련 plan 문서 — `📝 docs`
```bash
git add .claude/plans/claude-agents-nextjs-supabase-fullstack-serene-crayon.md .claude/plans/image-png-tranquil-meteor.md
git commit -m "📝 docs: 구글 로그인 구현 및 invalid_client 오류 해결 plan 파일 추가"
```

### 3. 신규 서브에이전트 정의 — `🧑‍💻 dx`
```bash
git add .claude/agents/nextjs-supabase-expert.md .claude/agents/nextjs-supabase-fullstack-developer.md
git commit -m "🧑‍💻 dx: Next.js/Supabase 전용 서브에이전트 2종 추가"
```

### 4. 디버그 산출물 정리 (사용자 결정: gitignore 추가 + image.png 삭제) — `🙈 chore`
```bash
# .gitignore 맨 아래에 추가 (shrimp_data/ 항목과 같은 패턴, 짧은 한글 주석 포함)
#   
#   # Playwright MCP 디버그 로그(콘솔 로그·페이지 스냅샷)
#   .playwright-mcp/
rm image.png
git add .gitignore
git commit -m "🙈 chore: .playwright-mcp 디버그 로그를 .gitignore에 추가"
```
`image.png`는 애초에 미추적 파일이었으므로 그냥 삭제만 하고 커밋 대상에 포함하지 않는다. `.playwright-mcp/` 안의 기존 3개 파일도 `.gitignore` 추가만으로 커밋 대상에서 빠진다(별도 `git rm --cached` 불필요 — 애초에 tracked였던 적이 없음).

## 주의사항
- 각 단계는 `git add <구체적 경로>`만 사용하고 `git add .` / `git add -A`는 쓰지 않는다 — `.playwright-mcp/`나 `image.png`가 실수로 딸려 들어가는 것을 방지.
- 커밋 메시지에 Claude 서명을 추가하지 않는다 (`/git:commit` 스킬 규칙).
- **push는 이번 범위에 포함하지 않는다.** `recursive-doodling-comet.md`에 기록된 대로 이전에 `workflow` 스코프 문제로 push가 거부된 이력이 있어, 커밋만 완료한 뒤 push 여부는 별도로 사용자에게 확인한다.

## 검증
```bash
git status --short   # 정리 후 깨끗한지 확인 (untracked 없음)
git log --oneline -6  # revert 커밋 1개 + feat/docs/dx/chore 커밋 4개, 총 5개가 순서대로 쌓였는지 확인
git diff HEAD~5 --stat  # 전체 변경 내역이 의도한 파일들과 일치하는지 확인
```
