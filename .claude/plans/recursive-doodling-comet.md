# main 브랜치로 정리 + 단일 브랜치화

## Context

직전 작업(개발 도구 설정)은 `dev/개발도구-설정` 브랜치에서 4개 커밋으로 완료했다. 조사 결과 **`main`이 이미 그 4개 커밋을 전부 포함**하고 있다(`git rev-list --left-right --count main...dev/개발도구-설정` → `0 0`, 완전히 동일한 커밋). 즉 "메인에 커밋"해야 할 새 작업 내용은 없고, 남은 일은 (1) 이제 쓸모없어진 `dev/개발도구-설정` 브랜치를 지워 브랜치를 `main` 하나만 남기는 것과, (2) 조사 중 발견된 3가지 미커밋 항목을 사용자 확인을 거쳐 정리하는 것이다.

## 사용자 결정 사항 (확정)

1. **`shrimp_data/WebGUI.md`**: 현재 diff는 로컬 Task Manager 포트 번호 1줄(`56120` → `50164`)뿐, 의미 없는 런타임 값. → 이번 변경은 버리고(`git checkout --`), 앞으로 같은 소음이 반복되지 않도록 `.gitignore`에 추가.
2. **`docs/guides/`**: `docs/*.md` 5개 파일과 내용이 100% 동일한 미추적 중복본(git 이력에도 없음, 출처 불명). → 삭제.
3. **`.claude/plans/*.md`** (`recursive-doodling-comet.md`, `magical-doodling-kurzweil.md`): 이 프로젝트는 과거에 plan 파일 2개(`supabase-needs-lucky-hejlsberg.md`, `supabase-next-js-majestic-rabin.md`)를 커밋한 전례가 있음(커밋 `9b2f717`). → 같은 관례로 커밋.

## 실행 순서

1. **`shrimp_data/WebGUI.md` 변경 취소**: `git checkout -- shrimp_data/WebGUI.md`
2. **`.gitignore`에 `shrimp_data/` 추가** (파일 맨 아래, 짧은 한글 주석과 함께 — 로컬 Task Manager 런타임 데이터라 커밋 대상이 아님을 명시). `shrimp_data/WebGUI.md`는 이미 git이 추적 중인 파일이므로, `.gitignore` 추가만으로는 앞으로도 계속 diff가 잡힌다 — `git rm --cached -r shrimp_data`로 인덱스에서 제거해야 실질적으로 무시되기 시작한다. (작업 디렉터리의 실제 파일은 삭제하지 않음, `--cached`만 사용)
3. **`docs/guides/` 삭제**: `rm -rf docs/guides` (미추적 상태라 git 이력 손실 없음)
4. **커밋 1** — `.gitignore` 변경 + `shrimp_data` 추적 해제:
   `git add .gitignore && git rm -r --cached shrimp_data && git commit -m "🙈 chore: shrimp_data를 .gitignore에 추가 (로컬 Task Manager 런타임 데이터)"`
5. **커밋 2** — plan 파일 2개 추가:
   `git add .claude/plans/recursive-doodling-comet.md .claude/plans/magical-doodling-kurzweil.md && git commit -m "📝 docs: 개발 도구 설정 및 커밋 정리 plan 파일 추가"`
   (단, `recursive-doodling-comet.md`는 지금 이 plan 내용 자체이므로 최종 실행 결과까지 반영해 커밋 직전에 다시 확인)
6. **`docs/guides/` 삭제는 커밋 대상이 아님** (애초에 git이 몰랐던 미추적 디렉터리이므로 `rm -rf`만 하면 되고 별도 커밋 불필요 — working tree에서만 사라짐)
7. **브랜치 정리**: `git branch -d dev/개발도구-설정` (main과 완전히 동일한 커밋을 가리키므로 `-d`로 안전하게 삭제 가능, `-D` 불필요)
8. **최종 확인**: `git branch -a` → `main`(및 `remotes/origin/main`, `remotes/origin/HEAD`)만 남는지 확인. `git status --short` → 깨끗한지 확인.

## 주의사항

- `dev/개발도구-설정` 브랜치는 로컬에만 존재했고 원격(`origin`)에는 push된 적이 없으므로, 원격 브랜치 삭제는 필요 없다.
- `shrimp_data`를 통째로 `git rm --cached`하면 `WebGUI.md` 외에 다른 파일이 더 있을 경우 함께 추적 해제된다 — 실행 전 `git ls-files shrimp_data/`로 실제 대상 파일 목록을 먼저 확인한다.
- 이번 정리 작업은 커밋 메시지에 Claude 서명을 추가하지 않는다 (`git:commit` 스킬/프로젝트 규칙).

## 검증

```powershell
git status --short   # 비어 있어야 함
git branch -a         # main (+ remotes/origin/main, remotes/origin/HEAD)만 남아야 함
git log --oneline -8  # 새 정리 커밋 2개가 잘 얹혔는지 확인
```
