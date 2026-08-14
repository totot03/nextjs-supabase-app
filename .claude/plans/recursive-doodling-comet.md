# Push 실패(OAuth workflow 스코프) 해결

## Context

`git push origin main`이 매번 다음 오류로 거부된다:
```
! [remote rejected] main -> main (refusing to allow an OAuth App to create or update workflow `.github/workflows/ci.yml` without `workflow` scope)
```
이는 코드나 커밋 내용의 문제가 아니라 **GitHub의 정책**이다: OAuth App(현재는 Windows Git Credential Manager, `git config credential.helper` = `manager`)이 발급한 토큰으로 `.github/workflows/*.yml` 파일을 생성/수정하는 push를 하려면 그 토큰에 `workflow` 스코프가 있어야 하는데, 현재 캐시된 토큰에는 이 스코프가 없다. `gh auth status` 확인 결과 `gh` CLI 자체는 로그인되어 있지 않고, push가 인증 단계는 통과하고(즉 어떤 유효한 토큰은 있음) GitHub 서버의 스코프 검사에서만 막히는 상태다. 사용자가 재시도해도 동일한 오류가 재현됨을 확인했다.

Pre-push 훅(`type-check`)은 매번 정상 통과하고 있어 로컬 검증에는 문제가 없다 — 순수하게 원격 인증 스코프 문제다.

## 사용자 결정 사항 (확정)

`gh` CLI로 `workflow` 스코프를 포함해 재로그인하는 방식을 사용한다 (SSH 전환이나 Credential Manager 토큰 삭제 방식은 사용하지 않음).

## 해결 절차

이 문제는 브라우저 기반 인증이 필요해 **사용자가 직접 실행**해야 한다. 나는 명령어를 안내하고, 완료 후 결과를 검증한 뒤 push를 대신 재시도한다.

1. **사용자 실행 (터미널에 `!` 접두사로 입력)**:
   ```
   ! gh auth login --scopes workflow
   ```
   - Git provider: `GitHub.com`
   - 프로토콜: `HTTPS`
   - 인증 방식: 브라우저로 로그인 (기기 코드 방식 권장)
   - 이 과정에서 `workflow` 스코프가 포함된 새 토큰이 발급된다.

2. **사용자 실행**:
   ```
   ! gh auth setup-git
   ```
   git이 github.com에 대해 `gh`가 발급한 토큰을 credential helper로 사용하도록 설정한다.

3. **내가 검증(읽기 전용)**:
   - `gh auth status` — `workflow` 스코프 포함 여부와 로그인 상태 확인
   - `git config --list --show-origin | grep credential` — `gh`의 credential helper가 기존 `manager` 설정보다 우선 적용되는지 확인. (Git은 여러 `credential.helper`가 설정된 경우 등록된 순서대로 시도하며, 보통 나중에 등록된 것이 우선 순위를 갖거나 각 helper가 순차적으로 값을 채운다. `gh auth setup-git`은 `credential.https://github.com.helper`를 github.com에 한정해 등록하므로 전역 `manager` 설정보다 더 구체적인 스코프로 우선 적용된다 — 정상적으로는 추가 설정 없이 해결되어야 한다.)

4. **내가 재시도**: `git push origin main`

5. **문제가 지속될 경우의 대체 경로** (2번까지 진행했는데도 동일 오류가 나올 때만):
   - `git config --get-all credential.helper`로 helper 우선순위 확인 후, 필요하면 `git config --unset-all credential.helper && git config credential.helper manager` 재등록 순서 조정 — 단, 이 단계는 실제로 3번 검증에서 문제가 확인된 경우에만 사용자 동의 하에 진행한다 (자격 증명 설정을 함부로 변경하지 않음).

## 검증

```powershell
gh auth status              # workflow 스코프 포함 확인
git push origin main         # 성공해야 함 (2869005..bfdcedd main -> main 형태로 반영)
```
push 성공 후, GitHub 저장소의 Actions 탭에서 `ci.yml` 워크플로우가 인식되고 정상적으로 트리거되는지 사용자에게 확인 요청.
