# `profiles` 테이블 생성 계획

## Context

이 프로젝트는 공식 Supabase Next.js 스타터 템플릿(`@supabase/ssr` 0.12.4, `@supabase/supabase-js` 2.112.3)을 기반으로 하며, 회원가입/로그인 흐름(`components/sign-up-form.tsx`, `components/login-form.tsx`)은 이미 동작하지만 가입한 사용자의 부가 정보(이름, 아바타, 소개 등)를 저장할 곳이 없다. `public` 스키마에는 예제용 `instruments` 테이블만 있고, `auth.users`는 Supabase가 관리하는 스키마라 클라이언트에서 직접 확장할 수 없다. 따라서 `auth.users`와 1:1로 연결되는 `public.profiles` 테이블을 만들어 사용자가 자신의 프로필 정보를 조회·수정할 수 있게 하는 것이 목표다.

현재 `supabase/migrations` 디렉토리 자체가 없어 지금까지의 스키마 변경(예: `instruments` 테이블)이 어떤 이력으로도 추적되지 않고 있다. 이번 작업을 계기로 마이그레이션을 파일로 남겨 git 이력에 편입시킨다.

가입 폼이 email/password만 받으므로, 신규가입 시 `profiles` row는 트리거로 자동 생성하되 `email` 외 필드는 사용자가 추후 직접 채우는 구조로 설계한다.

## 접근 방식

1개의 SQL 마이그레이션으로 테이블·RLS·트리거·backfill을 한 번에 적용한다 (Supabase 공식 "profiles table + auto-create trigger" 패턴).

### 1. 마이그레이션 SQL

`mcp__supabase__apply_migration`으로 원격에 적용할 SQL 전문:

```sql
-- =========================================================
-- profiles 테이블: 회원가입 사용자 정보 관리
-- =========================================================

-- 1. 테이블 생성
create table public.profiles (
  id uuid not null,
  email text not null,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id)
    references auth.users (id) on delete cascade,
  constraint profiles_username_key unique (username)
);

comment on table public.profiles is
  '회원가입 사용자의 프로필 정보. auth.users와 1:1 관계이며 id로 연결된다.';
comment on column public.profiles.id is 'auth.users.id 참조 (1:1)';
comment on column public.profiles.username is '선택 입력 항목. NULL 허용, 값이 있으면 유일해야 함';

-- 2. RLS 활성화
alter table public.profiles enable row level security;

-- 3. RLS 정책: 본인만 조회/수정 가능
create policy "users can view own profile"
on public.profiles
for select
to authenticated
using ( (select auth.uid()) = id );

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using ( (select auth.uid()) = id )
with check ( (select auth.uid()) = id );

-- INSERT/DELETE 정책은 의도적으로 만들지 않는다.
-- RLS는 매칭 정책이 없으면 기본 차단(deny-by-default)이므로
-- profiles row 생성은 아래 SECURITY DEFINER 트리거를 통해서만 이루어진다.

-- 4. updated_at 자동 갱신 (moddatetime 확장)
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at
before update on public.profiles
for each row
execute function extensions.moddatetime (updated_at);

-- 5. 신규 가입자 프로필 자동 생성 트리거
--    SECURITY DEFINER + search_path 고정으로 search_path 하이재킹 차단
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, created_at, updated_at)
  values (new.id, new.email, new.created_at, new.created_at)
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  '신규 auth.users insert 시 public.profiles에 1:1 row를 자동 생성. SECURITY DEFINER, search_path 고정.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- 6. 기존 가입자 backfill (이미 가입된 1명이 트리거 적용 이전이라 누락되므로)
insert into public.profiles (id, email, created_at, updated_at)
select id, email, created_at, created_at
from auth.users
on conflict (id) do nothing;
```

**주요 설계 결정**
- `updated_at` 자동 갱신은 커스텀 함수 대신 이미 프로젝트에서 쓸 수 있는 `moddatetime` 확장을 사용 (검증된 코드, 유지보수 부담 최소화)
- `handle_new_user`는 `SECURITY DEFINER` + `set search_path = ''` + 완전 스키마 한정(`public.profiles`)으로 작성해 search_path 하이재킹을 차단 (Supabase 보안 권장 패턴)
- `profiles.email`에는 UNIQUE를 걸지 않음 — 유일성의 원천은 `auth.users.email`이며, 이메일 변경 트랜잭션 중 경합으로 트리거가 실패할 리스크를 피함. `auth.users → profiles` 이메일 실시간 동기화도 현재 이를 필요로 하는 기능이 없어 범위에서 제외 (필요 시 별도 마이그레이션으로 추가 가능)
- `username`은 컬럼 레벨 `unique`이지만 NULL 허용 — Postgres는 NULL을 유일성 위반으로 보지 않으므로 값을 아직 정하지 않은 여러 사용자가 공존 가능
- INSERT/DELETE RLS 정책은 만들지 않음 (정책이 없으면 기본 차단되므로 별도 "deny" 정책 불필요) — profiles row는 오직 트리거를 통해서만 생성됨
- 정책 이름은 기존 `instruments` 테이블의 `"public can read instruments"` 네이밍 스타일(소문자, 서술형 문장)과 통일

### 2. 로컬 마이그레이션 파일

- `supabase/` 디렉토리가 프로젝트에 없으므로 `supabase/migrations/` 폴더만 최소 구성으로 새로 만든다 (`supabase init`으로 인한 `config.toml` 등 전체 초기화는 이번 범위 밖).
- `apply_migration` 실행 후 `list_migrations`로 실제 기록된 `version`(타임스탬프)을 확인하고, 그 값을 파일명에 맞춰 `supabase/migrations/<version>_create_profiles_table.sql`로 저장한다. 내용은 위 SQL 전문과 동일.

### 3. TypeScript 타입 반영

- `mcp__supabase__generate_typescript_types`로 타입을 생성해 `lib/supabase/database.types.ts`로 저장 (수동 편집 금지 파일로 취급).
- `lib/supabase/client.ts`, `lib/supabase/server.ts`에 `Database` 제네릭 적용:
  ```diff
  -  return createBrowserClient(
  +  return createBrowserClient<Database>(
  ```
  ```diff
  -  return createServerClient(
  +  return createServerClient<Database>(
  ```
- `lib/supabase/proxy.ts`도 동일 패턴으로 `createServerClient`를 사용하므로 일관성을 위해 `Database` 제네릭을 함께 적용한다 (세션 갱신에만 쓰여 필수는 아니지만, 세 파일 모두 같은 타입을 참조하는 편이 향후 유지보수에 안전함).

## 실행 순서

1. `list_tables` / `list_extensions`로 적용 직전 스키마 드리프트 재확인
2. `apply_migration` (name: `create_profiles_table`)으로 원격 DB에 SQL 적용
3. `list_migrations`로 기록된 version 확인 → 로컬 `supabase/migrations/<version>_create_profiles_table.sql` 파일 생성
4. `get_advisors(type: "security")`로 RLS 누락, search_path 경고 등 확인
5. `execute_sql`로 정책/트리거/backfill 결과 검증 (아래 검증 섹션)
6. `generate_typescript_types` 실행 → `lib/supabase/database.types.ts` 저장
7. `lib/supabase/client.ts`, `server.ts`, `proxy.ts`에 `Database` 제네릭 적용
8. `get_advisors(type: "security")`, `get_advisors(type: "performance")` 재실행으로 최종 확인

## 대상 파일

- `supabase/migrations/<version>_create_profiles_table.sql` (신규)
- `lib/supabase/database.types.ts` (신규)
- `lib/supabase/client.ts` (수정: `Database` 제네릭 추가)
- `lib/supabase/server.ts` (수정: `Database` 제네릭 추가)
- `lib/supabase/proxy.ts` (수정: `Database` 제네릭 추가)

## 검증

**보안 (`get_advisors(type: "security")`)**
- `profiles` 테이블에 "RLS enabled but no policies" 경고가 없어야 함
- `handle_new_user` 함수에 "Function Search Path Mutable" 경고가 없어야 함 (이미 고정했으므로)

**SQL 검증 (`execute_sql`)**
```sql
-- 정책 2개(select, update)만 존재해야 함
select polname, cmd, roles from pg_policies where tablename = 'profiles';

-- 트리거 확인 (handle_updated_at, on_auth_user_created)
select tgname, tgrelid::regclass
from pg_trigger
where tgrelid in ('public.profiles'::regclass, 'auth.users'::regclass)
  and not tgisinternal;

-- backfill 정합성: auth.users 건수 == profiles 건수 (현재 1건씩)
select
  (select count(*) from auth.users) as auth_users_count,
  (select count(*) from public.profiles) as profiles_count;
```

**타입 검증**
- `generate_typescript_types` 출력에 `profiles` 테이블·컬럼 타입이 정확히 반영됐는지 확인
- `npm run lint` 또는 `npx tsc --noEmit`으로 `client.ts`/`server.ts`/`proxy.ts`에 제네릭 적용 후 타입 에러가 없는지 확인

**기능 검증**
- 새 계정으로 회원가입 후 `execute_sql`로 `select * from public.profiles where email = '<새 이메일>'` 실행 시 row가 1건 자동 생성되어 있는지 확인 (트리거 동작 확인)
