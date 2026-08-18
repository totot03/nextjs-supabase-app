interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

// cacheComponents 환경에서 params는 요청 시점에만 정해지므로, 이벤트 ID별로
// 항상 다른 콘텐츠를 보여줄 이 라우트는 정적 프리렌더링 대신 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 이벤트 상세 페이지 골격 (Task 004/005에서 주최자/참여자 역할별 UI로 교체)
export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">이벤트 상세</h1>
      <p className="mt-2 text-muted-foreground">
        이벤트 ID: {id} (상세 UI는 Task 004/005에서 구현 예정)
      </p>
    </div>
  );
}
