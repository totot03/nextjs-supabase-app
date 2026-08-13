-- handle_new_user()는 auth.users INSERT 트리거 전용 함수다.
-- 트리거는 시스템이 내부적으로 실행하므로 EXECUTE 권한 여부와 무관하게 동작하지만,
-- SECURITY DEFINER + public 스키마 조합은 PostgREST가 이를 /rest/v1/rpc/handle_new_user
-- 로 자동 노출해 anon/authenticated가 직접 호출할 수 있게 만든다.
-- 트리거 용도로만 쓰이도록 직접 호출 경로를 명시적으로 차단한다.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
