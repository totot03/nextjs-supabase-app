import type { EventParticipant, UserProfile } from "@/types/domain";
import { formatEventDate, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ParticipantCardProps {
  participant: EventParticipant;
  /** participant.user_id === profile.id로 이미 조인된 상태로 넘겨받는다. */
  profile: UserProfile;
  className?: string;
}

/**
 * 이벤트 참여자 프로필 카드. 이벤트 상세 페이지의 참여자 목록 등에서 재사용한다.
 * 순수 표시용(상태/이벤트 핸들러 없음)이라 서버 컴포넌트로 구현했다.
 * 참여자-프로필 조인 로직은 갖지 않고 이미 조인된 두 객체를 props로 받는다.
 */
export function ParticipantCard({
  participant,
  profile,
  className,
}: ParticipantCardProps) {
  return (
    <Card className={cn("flex items-center gap-3 p-4", className)}>
      <Avatar>
        {profile.avatar_url && (
          <AvatarImage src={profile.avatar_url} alt={profile.name} />
        )}
        <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{profile.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {profile.email}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatEventDate(participant.joined_at)} 참여
        </p>
      </div>
      <Badge variant={participant.role === "host" ? "default" : "secondary"}>
        {participant.role === "host" ? "주최자" : "참여자"}
      </Badge>
    </Card>
  );
}
