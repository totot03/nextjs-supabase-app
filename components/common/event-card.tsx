import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ImageIcon, MapPin, Users } from "lucide-react";

import type { Event } from "@/types/domain";
import { eventStatusMap } from "@/lib/event-status";
import { formatEventDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventCardProps {
  event: Event;
  /** JOIN 결과로만 얻어지는 값이라 목록 API가 제공하지 않으면 표시하지 않는다. */
  participantCount?: number;
  className?: string;
}

/**
 * 이벤트 요약 카드. 내 이벤트 목록, 초대 링크 미리보기 등 여러 페이지에서 재사용한다.
 * 순수 표시용(상태/이벤트 핸들러 없음)이라 서버 컴포넌트로 구현했다.
 */
export function EventCard({
  event,
  participantCount,
  className,
}: EventCardProps) {
  const status = eventStatusMap[event.status];

  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card
        className={cn(
          "overflow-hidden transition-colors hover:bg-accent/50",
          className,
        )}
      >
        <div className="relative aspect-video w-full bg-muted">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardHeader>
          <Badge className={cn("w-fit", status.className)}>
            {status.label}
          </Badge>
          <CardTitle className="line-clamp-1">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{event.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" />
            {formatEventDate(event.event_date)}
          </span>
          {participantCount != null && (
            <span className="flex items-center gap-1.5">
              <Users className="size-4 shrink-0" />
              참여자 {participantCount}명
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
