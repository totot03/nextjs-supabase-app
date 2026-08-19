import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Eye, ImageIcon, MapPin, Users } from "lucide-react";

import {
  dummyCurrentUser,
  getEventDetailResponse,
  getUserProfileById,
} from "@/lib/dummy";
import { eventStatusMap } from "@/lib/event-status";
import { formatEventDate } from "@/lib/format";
import { ParticipantCard } from "@/components/common/participant-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteEventDialog } from "@/components/events/delete-event-dialog";
import { InviteShareCard } from "@/components/events/invite-share-card";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

// cacheComponents 환경에서 params는 요청 시점에만 정해지므로, 이벤트 ID별로
// 항상 다른 콘텐츠를 보여줄 이 라우트는 정적 프리렌더링 대신 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 이벤트 상세 페이지 - 주최자/참여자 통합 뷰 (F002, F003, F005, F006)
// isHost(role은 이벤트별 속성)에 따라 초대 공유·수정·삭제는 주최자에게만,
// 읽기 전용 안내는 참여자에게만 보여준다.
export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const detail = getEventDetailResponse(id);

  if (!detail) {
    notFound();
  }

  const { event, participants } = detail;
  const status = eventStatusMap[event.status];
  const isHost = event.created_by === dummyCurrentUser.id;

  // 참여자 목록에서 주최자가 맨 위에 오도록 정렬한다.
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.role === b.role) return 0;
    return a.role === "host" ? -1 : 1;
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="relative aspect-video w-full bg-muted">
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

      <div className="flex flex-col gap-3 px-4">
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
          <span className="flex items-center gap-1.5">
            <Users className="size-4 shrink-0" />
            참여자 {participants.length}명
          </span>
        </div>

        {event.description && (
          <p className="whitespace-pre-wrap text-sm">{event.description}</p>
        )}
      </div>

      {isHost ? (
        <div className="px-4">
          <InviteShareCard inviteCode={event.invite_code} />
        </div>
      ) : (
        <div className="px-4">
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
              <Eye className="size-4 shrink-0" />
              <p>
                참여자로 보고 있어요. 정보 수정, 삭제, 초대 링크 공유는 주최자만
                할 수 있어요.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4">
        <h2 className="text-lg font-semibold">
          참여자 {participants.length}명
        </h2>
        <div className="flex flex-col gap-2">
          {sortedParticipants.map((participant) => {
            const profile = getUserProfileById(participant.user_id);
            if (!profile) return null;

            return (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                profile={profile}
              />
            );
          })}
        </div>
      </div>

      {isHost && (
        <div className="flex flex-col gap-2 px-4">
          <Button asChild variant="outline">
            <Link href={`/events/${event.id}/edit`}>이벤트 수정</Link>
          </Button>
          <DeleteEventDialog eventTitle={event.title} />
        </div>
      )}
    </div>
  );
}
