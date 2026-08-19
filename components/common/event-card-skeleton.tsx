import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * EventCard의 로딩 스켈레톤. EventCard와 동일한 DOM 구조/치수를 유지해
 * 로딩 -> 콘텐츠 전환 시 레이아웃 시프트가 생기지 않도록 한다.
 */
export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}
