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

-- 6. 기존 가입자 backfill (이미 가입된 사용자가 트리거 적용 이전이라 누락되므로)
insert into public.profiles (id, email, created_at, updated_at)
select id, email, created_at, created_at
from auth.users
on conflict (id) do nothing;
