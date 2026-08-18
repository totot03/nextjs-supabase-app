# 모임 이벤트 관리 웹 MVP 기획

## Context

수영, 헬스, 친구 모임 등 소모임을 운영하는 주최자는 매번 공지 전달, 참여자 취합, 카풀 조율, 회비 정산을 각각 카카오톡·엑셀·수기 계산으로 따로 처리한다. 이 과정이 반복적이고 번거로워 주최자의 피로도가 높고, 정산 누락이나 참여자 확인 오류 같은 실수가 잦다. 이 프로젝트는 이 네 가지 반복 업무(공지/일정, 참여자 관리, 카풀, 정산)를 하나의 웹 서비스로 통합해 주최자의 운영 부담을 줄이는 것을 목표로 한다.

기존 저장소(Next.js 16 + Supabase 인증 스타터) 위에 확장하기로 결정했으며, 인증·`profiles` 테이블·shadcn/ui 기반은 이미 갖춰져 있어 도메인 기능(모임/이벤트/카풀/정산) 구현에 곧바로 집중할 수 있다.

## 제품 정의

### 타겟 사용자 (페르소나)

- **주최자 (Organizer)** — 정기 모임(수영 강습반, 헬스 크루, 친구 모임 등)을 운영하며 공지·인원 파악·카풀 조율·회비 정산을 도맡는 사람. 가장 많은 시간을 쓰고, 이 서비스의 핵심 페인포인트를 겪는 주 사용자.
- **참여자 (Member)** — 모임에 가입해 이벤트 공지를 받고, 참석 여부를 표시하고, 필요시 카풀을 신청/제공하고, 자신의 정산 몫을 확인·납부 체크하는 사람.

### 핵심 가치 제안

> "카톡방 + 엑셀 + 수기 정산"으로 흩어져 있던 모임 운영을 하나의 링크로 — 모임을 만들고, 이벤트를 공지하고, 누가 오는지·누가 태워주는지·누가 얼마를 내야 하는지 한눈에 확인한다.

### 서비스 구조

멀티 테넌트 플랫폼 — 누구나 가입해 여러 개의 독립된 모임(그룹)을 만들 수 있고, 각 모임은 자신의 멤버·이벤트·카풀·정산을 독립적으로 관리한다. 한 사용자는 여러 모임에 동시에 속할 수 있다 (예: 수영 모임의 참여자이면서 동시에 친구 모임의 주최자).

### MVP 기능 범위 (1차, 4개 전부 포함)

| # | 기능 | 핵심 동작 | 비고 |
|---|------|-----------|------|
| 1 | 공지/일정 관리 | 모임 생성, 이벤트(일시·장소) 등록/수정, 변경사항 확인 | 알림은 MVP에서 서비스 내 표시(뱃지/목록)까지만, 이메일·푸시 발송은 범위 밖 |
| 2 | 참여자 관리 | RSVP(참석/불참/미정) 취합, 정원 관리, 참여자 명단 | |
| 3 | 카풀 매칭 | 출발지 텍스트 기반 운전자 등록 → 좌석 신청/배정 | 지도 API 기반 자동 매칭 아님, 수동/반자동 매칭 |
| 4 | 정산/회비 관리 | 이벤트 비용 등록 → 1/N 자동 분배 → 참여자별 입금 여부 체크 | 실제 PG 결제 연동 없음, 기록/추적 전용 |

**MVP 범위 밖 (2차 이후 검토)**: PG 실결제 연동, 지도 기반 자동 카풀 매칭/경로 최적화, 이메일·푸시 알림 발송, 모임 검색/디스커버리(공개 모임 탐색), 반복 일정(recurring event) 자동 생성, 정산 내 부분 항목별 차등 분배(현재는 균등 1/N만).

### 핵심 유저 플로우 (요약 — 상세는 기술 설계 섹션 참고)

1. **모임 개설 플로우**: 회원가입/로그인 → 모임 생성(이름/설명) → 초대 링크 공유 → 멤버 가입
2. **이벤트 운영 플로우**: 이벤트 등록(일시/장소/정원) → 멤버 RSVP → 주최자가 참여자 명단 확인
3. **카풀 플로우**: 이벤트 상세에서 운전자가 출발지/좌석수 등록 → 참여자가 좌석 신청 → 매칭 확정
4. **정산 플로우**: 이벤트 종료 후 주최자가 비용 입력 → 참여 인원 기준 1/N 자동 계산 → 참여자별 입금 여부 체크 → 정산 마감

### 성공 지표 (MVP 검증 기준)

- 모임 1개 생성 후 실제 이벤트 1건을 끝까지 운영(공지→RSVP→카풀→정산 마감)하는 데 걸리는 시간과 이탈 지점
- 카톡/엑셀 대비 "주최자가 체감하는 운영 시간 단축" (정성 인터뷰 기준)
- 정산 완료율 (이벤트 종료 후 N일 내 입금 체크 100% 완료 비율)

## 기술 설계

### 설계 원칙

- `profiles`의 **deny-by-default RLS** 철학을 그대로 유지한다 — 정책 없는 작업(주로 INSERT)은 기본 차단하고, 통제된 쓰기는 `SECURITY DEFINER`(`search_path=''`) 함수/트리거로만 연다. 실제 `supabase/migrations/20260813074205_create_profiles_table.sql`에서 확인된 패턴을 그대로 복제한다.
- 멀티테넌시 핵심은 그룹 멤버십 확인이다. `group_members`를 스스로 참조하는 RLS는 재귀 성능 문제를 일으키기 쉬우므로, `is_group_member()` / `is_group_admin()` 같은 `SECURITY DEFINER stable` 헬퍼 함수를 만들어 하위 테이블 전체가 재사용한다.
- 금액은 `numeric` 대신 원 단위 `integer`(`check (amount >= 0)`)로 다룬다.
- 모든 신규 테이블은 기존에 이미 설치된 `extensions.moddatetime` 트리거를 재사용해 `updated_at`을 자동 관리한다.
- Next.js 16 동적 라우트의 `params`는 `Promise`이므로 서버 컴포넌트/서버 액션에서 `await params` 패턴을 유지한다.

### DB 스키마

| 테이블 | 역할 | 핵심 컬럼 |
|---|---|---|
| `groups` | 모임 | `name`, `description`, `owner_id → profiles`, `invite_code unique`, `max_members` |
| `group_members` | 멤버십 | `group_id`, `user_id`, `role(owner\|admin\|member)`, `status(active\|left\|removed)`, `unique(group_id,user_id)` |
| `events` | 이벤트=공지 겸 일정 | `group_id`, `title`, `description`, `location`, `start_at`, `end_at`, `capacity`, `rsvp_deadline`, `status` |
| `event_participants` | RSVP | `event_id`, `user_id`, `rsvp_status(attending\|not_attending\|pending\|waitlisted)`, `guest_count`, `unique(event_id,user_id)` |
| `carpool_rides` | 운전자 제공 좌석 | `event_id`, `driver_id`, `departure_point`, `departure_time`, `total_seats`, `status` |
| `carpool_ride_passengers` | 탑승 신청/승인 | `ride_id`, `passenger_id`, `seats_reserved`, `status(requested\|confirmed\|declined\|cancelled)`, `unique(ride_id,passenger_id)` |
| `settlements` | 정산 건 | `group_id`, `event_id?`, `title`, `total_amount(int)`, `split_method(equal\|custom)`, `payment_info`, `status(open\|closed)` |
| `settlement_items` | 인원별 분배/입금 체크 | `settlement_id`, `user_id`, `amount_due(int)`, `paid(bool)`, `paid_at`, `unique(settlement_id,user_id)` |

잔여 카풀 좌석은 저장 컬럼이 아니라 `carpool_ride_passengers`의 `confirmed` 집계로 쿼리 시점에 계산한다(정합성 버그 방지). 정원 초과 시 `waitlisted` 처리는 DB 트리거가 아니라 서버 액션에서 카운트 후 판단한다(MVP 단순화, v2에서 트리거화 검토).

### RLS 정책 방향 (역할 기반)

공통 헬퍼 `is_group_member(group_id)` / `is_group_admin(group_id)` (`SECURITY DEFINER stable search_path=''`, `authenticated`에만 execute grant):

| 테이블 | SELECT | INSERT | UPDATE/DELETE |
|---|---|---|---|
| `groups` | `is_group_member(id)` | 인증 사용자 누구나(본인이 owner_id) | `is_group_admin(id)` / owner만 삭제 |
| `group_members` | `is_group_member(group_id)` | **정책 없음** — 트리거·RPC 전용 | admin(역할변경/추방) 또는 본인(탈퇴) |
| `events` | `is_group_member` | `is_group_admin` | `is_group_admin` |
| `event_participants` | `is_group_member` | 본인 & `is_group_member` | 본인 또는 `is_group_admin` |
| `carpool_rides` | `is_group_member` | 본인(driver) & `is_group_member` | driver 본인 또는 `is_group_admin` |
| `carpool_ride_passengers` | `is_group_member` | 본인(passenger) & `is_group_member` | driver(승인/거절), 본인(취소), 또는 admin |
| `settlements` / `settlement_items` | `is_group_member` (투명성 위해 그룹원 전체 열람) | `is_group_admin` | `is_group_admin` |

`group_members` INSERT를 정책으로 열지 않는 이유는 `profiles`와 동일 — 대신 두 개의 통제된 진입점만 둔다:
- 그룹 생성 시: `after insert on groups` 트리거 → `handle_new_group()`(`SECURITY DEFINER`, execute는 public/anon/authenticated에서 revoke, 트리거 전용)가 owner를 `group_members`에 자동 등록
- 초대 코드 가입 시: `join_group_by_code(p_code text)` RPC(`SECURITY DEFINER`, `authenticated`에 execute grant)가 코드 검증 후 insert
- 비멤버가 초대 랜딩에서 그룹명을 미리 봐야 하는 chicken-and-egg 문제는 `get_group_preview_by_code(p_code text)` 최소정보 조회 RPC로 별도 해결

### 마이그레이션 분할 (기능 도메인당 1파일, FK 의존 순서와 동일)

1. `create_groups_and_members.sql` — `groups`, `group_members`, 헬퍼 함수 2개, `handle_new_group` 트리거, `join_group_by_code`/`get_group_preview_by_code` RPC, moddatetime
2. `create_events_and_participants.sql` — `events`, `event_participants`, moddatetime (1에만 의존)
3. `create_carpool.sql` — `carpool_rides`, `carpool_ride_passengers`, moddatetime (1, 2에 의존)
4. `create_settlements.sql` — `settlements`, `settlement_items`, moddatetime (1, 2에 의존, 3과는 독립 → 병렬 진행 가능)

각 마이그레이션 적용 후 `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts`를 재생성한다.

### 라우트 구조 (`app/protected/` 하위 확장)

```
app/protected/
  groups/
    page.tsx                 내 모임 목록 + 빈 상태(모임 만들기/초대코드 참여 CTA)
    new/page.tsx              모임 생성 폼
    join/page.tsx             초대 코드 참여 (?code= 쿼리)
    [groupId]/
      layout.tsx               is_group_member 검증(비멤버 notFound) + 탭 네비(공지·멤버·카풀·정산)
      page.tsx                 그룹 대시보드
      settings/page.tsx        그룹 설정 — admin 전용
      members/page.tsx         멤버 목록/역할변경/추방 — admin 전용
      events/
        page.tsx / new/page.tsx
        [eventId]/
          page.tsx / edit/page.tsx / participants/page.tsx
          carpool/  page.tsx / new/page.tsx / [rideId]/page.tsx
      settlements/
        page.tsx / new/page.tsx / [settlementId]/page.tsx
```

`[groupId]/layout.tsx`가 멤버십 체크와 공용 탭만 담당하고, 하위 각 page가 필요한 데이터를 서버 컴포넌트에서 다시 조회한다(RLS가 이중 방어하므로 Context로 데이터를 끌고 다니는 복잡도보다 App Router 관례에 맞음). 기존 `app/protected/page.tsx`(튜토리얼 잔재)는 삭제 대신 `/protected/groups`로 유도하는 안내만 가볍게 추가한다(CLAUDE.md에 따라 임의 삭제 금지).

### 신규 shadcn/ui 컴포넌트

`select`, `textarea`, `dialog`, `alert-dialog`(파괴적 액션 확인), `table`, `tabs`, `avatar`, `separator`, `popover`+`calendar`(날짜 선택), `form`(react-hook-form 연동) — `npx shadcn@latest add ...`로 추가. 기존 `button`/`card`/`input`/`label`/`checkbox`(RSVP 체크)/`dropdown-menu`/`badge`(role·RSVP·정산상태 pill)는 그대로 재사용.

### 폼 처리 방식: react-hook-form + zod 신규 도입 (신규 폼에 한정)

기존 인증 폼(`login-form.tsx` 등)은 필드 2~3개라 `useState`로 충분했지만, 이벤트/정산/카풀 생성 폼은 필드가 많고 상호 검증(종료일시 > 시작일시, 금액 > 0, 분배대상 1명 이상 등)이 필요해 6개 이상의 복잡한 폼이 예상된다. `lib/validations/{groups,events,carpool,settlements}.ts`에 zod 스키마를 정의해 클라이언트(RHF resolver)와 서버 액션 양쪽에서 재사용한다.

- **기존 인증 폼은 그대로 유지** (동작 검증된 코드 불필요하게 건드리지 않음), **신규 도메인 폼만** RHF+zod+shadcn `form` 사용
- `package.json`에 `react-hook-form`, `zod`, `@hookform/resolvers` 추가 필요
- 뮤테이션은 Server Actions(`"use server"`, 라우트 세그먼트별 `actions.ts`)로 처리, `lib/supabase/server.ts`의 `createClient()`를 함수 내부에서 매번 새로 생성, 성공 시 `revalidatePath()`

### 핵심 유저 플로우 (상세)

**A. 모임 생성 → 초대 → 이벤트 → RSVP**: `/protected/groups/new` 제출 → `groups` insert(트리거로 owner 자동 등록) → 대시보드에서 초대링크 공유(`invite_code`) → 상대가 `/protected/groups/join?code=...`에서 `join_group_by_code` RPC 호출 → 주최자가 `events/new`에서 이벤트 등록 → 멤버들이 상세 페이지에서 참석 버튼 클릭(`event_participants` upsert) → 주최자가 `participants` 탭에서 정원 대비 현황 확인

**B. 카풀**: RSVP "참석" 멤버가 카풀 탭 진입 → 운전자가 출발지/시각/좌석수 등록(`carpool_rides`) → 탑승 희망자가 "탑승 신청"(`carpool_ride_passengers`, status=requested) → 운전자가 승인/거절 → 잔여좌석은 confirmed 집계로 실시간 반영

**C. 정산**: 이벤트 종료 후 주최자가 `settlements/new`에서 총액/분배대상/`equal` 방식으로 생성 → 서버 액션이 인원수로 나눠 `settlement_items` 일괄 생성 → 상세 페이지에서 멤버별 금액+송금 안내(`payment_info`) 노출 → 실제 송금은 앱 밖(카카오페이 등)에서 이뤄지고, 주최자가 입금 확인분을 "입금완료"로 체크 → 전원 완료 시 status를 `closed`로 전환

### 단계적 구현 순서

**Phase 1 — 기반** (선행 필수, 병렬화 불가): 마이그레이션 1(`groups`/`group_members`/헬퍼함수/RPC) → 타입 재생성 → `/protected/groups` 관련 라우트 전체 → shadcn `select`/`textarea`/`dialog`/`alert-dialog`/`table`/`tabs`/`avatar`/`form` 설치 + RHF/zod 도입

**Phase 2 — 이벤트/RSVP** (Phase 1에만 의존): 마이그레이션 2 → `events`/`participants` 라우트 → shadcn `popover`+`calendar` 추가

**Phase 3 — 카풀 & 정산** (Phase 1·2에 의존, 서로는 독립이라 병렬 진행 가능): 3a 마이그레이션 3 + 카풀 라우트, 3b 마이그레이션 4 + 정산 라우트

**Phase 4 — 스트레치** (MVP 확정 스코프 밖): "변경사항 알림"을 위한 경량 `notifications` 테이블 + 그룹 내 벨 아이콘(이메일/푸시 SDK 없이 in-app만). PG 연동은 스코프에서 명시적으로 제외.

각 Phase 내부는 항상 **마이그레이션 → 타입 재생성 → zod 스키마 → 서버 액션 → UI** 순서를 따른다.

### 참고할 기존 파일 (패턴 원본)

- `supabase/migrations/20260813074205_create_profiles_table.sql`, `20260813074310_harden_handle_new_user_function.sql` — RLS/트리거/하드닝 패턴 원본
- `app/protected/layout.tsx` — 신규 라우트 트리의 부모 셸 (인증 체크 없는 얇은 nav+footer 구조, 확인 완료)
- `components/login-form.tsx`, `sign-up-form.tsx` — 기존 폼 컨벤션 대조군
- `lib/supabase/server.ts` / `client.ts`, `lib/supabase/database.types.ts` — 서버/클라이언트 생성 방식 및 타입 재생성 대상
- `components.json` — shadcn 컴포넌트 추가 시 설정 기준

## 검증 방법

1. **마이그레이션 적용**: `mcp__supabase__apply_migration`으로 4개 마이그레이션 순차 적용 후 `mcp__supabase__get_advisors`로 RLS 누락/보안 경고 확인
2. **타입 재생성**: `mcp__supabase__generate_typescript_types` 실행 후 `lib/supabase/database.types.ts` diff 확인
3. **정적 검증**: `npm run lint`, `npm run type-check`, `npm run build` 순차 통과
4. **End-to-end 플로우 확인** (`npm run dev` 후 Playwright MCP로 브라우저 조작):
   - 계정 A로 모임 생성 → 초대코드 확인 → 계정 B로 로그인 후 초대코드로 가입 → 두 계정 모두 그룹 페이지에서 서로를 멤버로 확인
   - 계정 A(admin)가 이벤트 생성 → 계정 B가 RSVP "참석" → A가 participants 탭에서 B 확인
   - B가 카풀 등록(driver) → A가 탑승 신청 → B가 승인 → 잔여좌석 감소 확인
   - A가 정산 생성(총액 20000원, 2명 분배) → 각 10000원으로 자동 분배됐는지 확인 → B의 항목을 입금완료 체크 → 정산 status 전환 확인
5. **RLS 회귀 확인**: 그룹에 속하지 않은 제3의 계정으로 로그인해 다른 그룹의 `groups`/`events`/`settlements` URL에 직접 접근 시 데이터가 보이지 않는지(notFound 또는 빈 결과) 확인
