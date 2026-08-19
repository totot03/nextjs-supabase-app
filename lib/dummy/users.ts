import type { UserProfile } from "@/types/domain";

/**
 * 더미 사용자 프로필 목록.
 * user-01은 관리자(role: "admin"), 나머지는 일반 사용자(role: "user")다.
 * 실제 사용자 이메일은 섞지 않고 @gather.dummy 도메인의 임의 이메일만 사용한다.
 * avatar_url은 일부만 채워 ParticipantCard의 이니셜 폴백 케이스도 함께 검증할 수 있게 한다.
 */
export const dummyUsers: UserProfile[] = [
  {
    id: "user-01",
    email: "admin@gather.dummy",
    name: "박관리",
    avatar_url: null,
    role: "admin",
    created_at: "2026-01-05T09:00:00+09:00",
    updated_at: "2026-01-05T09:00:00+09:00",
  },
  {
    id: "user-02",
    email: "minjun.kim@gather.dummy",
    name: "김민준",
    avatar_url: "/dummy/avatar-1.png",
    role: "user",
    created_at: "2026-01-10T09:00:00+09:00",
    updated_at: "2026-01-10T09:00:00+09:00",
  },
  {
    id: "user-03",
    email: "seoyeon.lee@gather.dummy",
    name: "이서연",
    avatar_url: null,
    role: "user",
    created_at: "2026-01-12T09:00:00+09:00",
    updated_at: "2026-01-12T09:00:00+09:00",
  },
  {
    id: "user-04",
    email: "doyoon.park@gather.dummy",
    name: "박도윤",
    avatar_url: null,
    role: "user",
    created_at: "2026-01-15T09:00:00+09:00",
    updated_at: "2026-01-15T09:00:00+09:00",
  },
  {
    id: "user-05",
    email: "jiwoo.choi@gather.dummy",
    name: "최지우",
    avatar_url: "/dummy/avatar-2.png",
    role: "user",
    created_at: "2026-01-18T09:00:00+09:00",
    updated_at: "2026-01-18T09:00:00+09:00",
  },
  {
    id: "user-06",
    email: "haeun.jung@gather.dummy",
    name: "정하은",
    avatar_url: null,
    role: "user",
    created_at: "2026-02-01T09:00:00+09:00",
    updated_at: "2026-02-01T09:00:00+09:00",
  },
  {
    id: "user-07",
    email: "siwoo.kang@gather.dummy",
    name: "강시우",
    avatar_url: "/dummy/avatar-3.png",
    role: "user",
    created_at: "2026-02-05T09:00:00+09:00",
    updated_at: "2026-02-05T09:00:00+09:00",
  },
  {
    id: "user-08",
    email: "sua.jo@gather.dummy",
    name: "조수아",
    avatar_url: null,
    role: "user",
    created_at: "2026-02-10T09:00:00+09:00",
    updated_at: "2026-02-10T09:00:00+09:00",
  },
  {
    id: "user-09",
    email: "jiho.yoon@gather.dummy",
    name: "윤지호",
    avatar_url: "/dummy/avatar-4.png",
    role: "user",
    created_at: "2026-02-14T09:00:00+09:00",
    updated_at: "2026-02-14T09:00:00+09:00",
  },
  {
    id: "user-10",
    email: "yeeun.lim@gather.dummy",
    name: "임예은",
    avatar_url: null,
    role: "user",
    created_at: "2026-02-20T09:00:00+09:00",
    updated_at: "2026-02-20T09:00:00+09:00",
  },
];
