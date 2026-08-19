import type { EventParticipant } from "@/types/domain";

/**
 * 더미 이벤트 참여자 목록.
 * event_id/user_id는 반드시 각각 dummy/events.ts, dummy/users.ts의 id와 일치해야 한다.
 * 이벤트마다 host(주최자, events.ts의 created_by와 동일 인물) 1명과
 * participant(참여자) 여러 명으로 구성했다.
 */
export const dummyParticipants: EventParticipant[] = [
  // event-01 (host: user-02) — 총 4명
  {
    id: "participant-001",
    event_id: "event-01",
    user_id: "user-02",
    role: "host",
    joined_at: "2026-08-01T10:00:00+09:00",
  },
  {
    id: "participant-002",
    event_id: "event-01",
    user_id: "user-03",
    role: "participant",
    joined_at: "2026-08-02T11:00:00+09:00",
  },
  {
    id: "participant-003",
    event_id: "event-01",
    user_id: "user-05",
    role: "participant",
    joined_at: "2026-08-03T09:30:00+09:00",
  },
  {
    id: "participant-004",
    event_id: "event-01",
    user_id: "user-08",
    role: "participant",
    joined_at: "2026-08-04T20:00:00+09:00",
  },

  // event-02 (host: user-03) — 총 3명
  {
    id: "participant-005",
    event_id: "event-02",
    user_id: "user-03",
    role: "host",
    joined_at: "2026-08-05T10:00:00+09:00",
  },
  {
    id: "participant-006",
    event_id: "event-02",
    user_id: "user-02",
    role: "participant",
    joined_at: "2026-08-06T13:00:00+09:00",
  },
  {
    id: "participant-007",
    event_id: "event-02",
    user_id: "user-06",
    role: "participant",
    joined_at: "2026-08-07T18:00:00+09:00",
  },

  // event-03 (host: user-04) — 총 5명
  {
    id: "participant-008",
    event_id: "event-03",
    user_id: "user-04",
    role: "host",
    joined_at: "2026-08-01T10:00:00+09:00",
  },
  {
    id: "participant-009",
    event_id: "event-03",
    user_id: "user-02",
    role: "participant",
    joined_at: "2026-08-02T09:00:00+09:00",
  },
  {
    id: "participant-010",
    event_id: "event-03",
    user_id: "user-05",
    role: "participant",
    joined_at: "2026-08-03T09:00:00+09:00",
  },
  {
    id: "participant-011",
    event_id: "event-03",
    user_id: "user-07",
    role: "participant",
    joined_at: "2026-08-04T09:00:00+09:00",
  },
  {
    id: "participant-012",
    event_id: "event-03",
    user_id: "user-09",
    role: "participant",
    joined_at: "2026-08-05T09:00:00+09:00",
  },

  // event-04 (host: user-05) — 총 2명
  {
    id: "participant-013",
    event_id: "event-04",
    user_id: "user-05",
    role: "host",
    joined_at: "2026-08-02T10:00:00+09:00",
  },
  {
    id: "participant-014",
    event_id: "event-04",
    user_id: "user-10",
    role: "participant",
    joined_at: "2026-08-03T15:00:00+09:00",
  },

  // event-05 (host: user-06) — 총 4명
  {
    id: "participant-015",
    event_id: "event-05",
    user_id: "user-06",
    role: "host",
    joined_at: "2026-07-10T10:00:00+09:00",
  },
  {
    id: "participant-016",
    event_id: "event-05",
    user_id: "user-02",
    role: "participant",
    joined_at: "2026-07-12T11:00:00+09:00",
  },
  {
    id: "participant-017",
    event_id: "event-05",
    user_id: "user-04",
    role: "participant",
    joined_at: "2026-07-13T11:00:00+09:00",
  },
  {
    id: "participant-018",
    event_id: "event-05",
    user_id: "user-07",
    role: "participant",
    joined_at: "2026-07-14T11:00:00+09:00",
  },

  // event-06 (host: user-07) — 총 3명
  {
    id: "participant-019",
    event_id: "event-06",
    user_id: "user-07",
    role: "host",
    joined_at: "2026-06-01T10:00:00+09:00",
  },
  {
    id: "participant-020",
    event_id: "event-06",
    user_id: "user-03",
    role: "participant",
    joined_at: "2026-06-03T11:00:00+09:00",
  },
  {
    id: "participant-021",
    event_id: "event-06",
    user_id: "user-09",
    role: "participant",
    joined_at: "2026-06-04T11:00:00+09:00",
  },

  // event-07 (host: user-02) — 총 6명
  {
    id: "participant-022",
    event_id: "event-07",
    user_id: "user-02",
    role: "host",
    joined_at: "2026-08-10T10:00:00+09:00",
  },
  {
    id: "participant-023",
    event_id: "event-07",
    user_id: "user-04",
    role: "participant",
    joined_at: "2026-08-11T11:00:00+09:00",
  },
  {
    id: "participant-024",
    event_id: "event-07",
    user_id: "user-05",
    role: "participant",
    joined_at: "2026-08-11T12:00:00+09:00",
  },
  {
    id: "participant-025",
    event_id: "event-07",
    user_id: "user-06",
    role: "participant",
    joined_at: "2026-08-12T09:00:00+09:00",
  },
  {
    id: "participant-026",
    event_id: "event-07",
    user_id: "user-08",
    role: "participant",
    joined_at: "2026-08-12T10:00:00+09:00",
  },
  {
    id: "participant-027",
    event_id: "event-07",
    user_id: "user-10",
    role: "participant",
    joined_at: "2026-08-13T14:00:00+09:00",
  },
];
