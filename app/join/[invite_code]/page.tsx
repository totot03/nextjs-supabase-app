import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ImageIcon, MapPin, ShieldAlert } from "lucide-react";

import type { Event, EventStatus, UserProfile } from "@/types/domain";
import {
  dummyCurrentUser,
  getEventByInviteCode,
  getParticipantsByEvent,
  getUserProfileById,
} from "@/lib/dummy";
import { eventStatusMap } from "@/lib/event-status";
import { formatEventDate } from "@/lib/format";
import { MobileViewport } from "@/components/layout/mobile-viewport";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JoinConfirmButton } from "@/components/events/join-confirm-button";

interface JoinPageProps {
  params: Promise<{ invite_code: string }>;
}

// cacheComponents 환경에서 params는 요청 시점에만 정해지므로 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 더미 단계에는 실제 세션이 없어 (main) 그룹 전체와 동일하게 dummyCurrentUser를 로그인
// 사용자로 간주한다. 아래 "비로그인 유도" 분기는 UI만 만들어 두고 실제로는 도달하지
// 않는다. 실제 세션 확인은 Task 008(인증)에서 이 값을 세션 기반 값으로 교체하며 연결한다.
const isLoggedIn = true;

// 초대 링크 참여 페이지 (F004)
// lib/supabase/proxy.ts의 PUBLIC_PATH_PREFIXES에 "/join"이 등록되어 있어
// 비로그인 사용자도 이 경로에 접근할 수 있다. 무효 코드 / 비로그인 / 이미 참여 / 참여
// 확인 4가지 분기를 처리한다. 실제 participants insert는 Task 010에서 구현한다.
export default async function JoinPage({ params }: JoinPageProps) {
  const { invite_code: inviteCode } = await params;
  const event = getEventByInviteCode(inviteCode);

  // 1) 무효한 초대 코드
  if (!event) {
    return (
      <MobileViewport className="flex items-center justify-center p-6">
        <EmptyState
          icon={<ShieldAlert className="size-6 text-muted-foreground" />}
          title="유효하지 않은 초대 링크예요"
          description="초대 코드가 잘못됐거나 만료됐어요. 주최자에게 새 링크를 요청해주세요."
        />
      </MobileViewport>
    );
  }

  const status = eventStatusMap[event.status];
  const host = getUserProfileById(event.created_by);

  // 2) 비로그인 유도 (더미 단계에서는 isLoggedIn이 항상 true라 도달하지 않는 분기)
  if (!isLoggedIn) {
    return (
      <MobileViewport className="flex flex-col gap-6 p-6">
        <EventPreview event={event} status={status} host={host} />
        <EmptyState
          title="로그인하고 참여하기"
          description="이벤트에 참여하려면 먼저 로그인해주세요."
          action={{
            label: "로그인하러 가기",
            href: `/auth/login?next=/join/${inviteCode}`,
          }}
        />
      </MobileViewport>
    );
  }

  // 3) 이미 참여한 경우 (주최자 본인이 자신의 초대 링크로 들어온 경우도 포함)
  const alreadyJoined = getParticipantsByEvent(event.id).some(
    (participant) => participant.user_id === dummyCurrentUser.id,
  );

  return (
    <MobileViewport className="flex flex-col gap-6 p-6">
      <EventPreview event={event} status={status} host={host} />

      {alreadyJoined ? (
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            이미 참여 중인 이벤트예요
          </Badge>
          <Button asChild className="w-full">
            <Link href={`/events/${event.id}`}>이벤트로 이동</Link>
          </Button>
        </div>
      ) : (
        <JoinConfirmButton eventId={event.id} eventTitle={event.title} />
      )}
    </MobileViewport>
  );
}

interface EventPreviewProps {
  event: Event;
  status: (typeof eventStatusMap)[EventStatus];
  host?: UserProfile;
}

/**
 * 초대 미리보기 (F004). [id]/page.tsx의 헤더 블록(이미지 → 상태 배지 → 제목 → 날짜/장소)과
 * 같은 순서로 구성하되, 주최자 이름 줄을 추가한다. EventCard를 재사용하지 않는 이유는
 * EventCard가 카드 전체를 /events/{id} 링크로 감싸고 있어 참여 전에 상세 페이지로
 * 이동시켜버리기 때문이다(F004는 "미리보기 → 참여 확인" 순서를 요구한다).
 */
function EventPreview({ event, status, host }: EventPreviewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            sizes="448px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <Badge className={status.className}>{status.label}</Badge>
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4 shrink-0" />
          {formatEventDate(event.event_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0" />
          {event.location}
        </span>
        {host && <span>주최자: {host.name}</span>}
      </div>
    </div>
  );
}
