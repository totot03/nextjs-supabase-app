import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ParticipantCard의 로딩 스켈레톤. Avatar 기본 크기(size-8)를 포함해
 * ParticipantCard와 동일한 치수를 유지한다.
 */
export function ParticipantCardSkeleton() {
  return (
    <Card className="flex items-center gap-3 p-4">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-14 shrink-0" />
    </Card>
  );
}
