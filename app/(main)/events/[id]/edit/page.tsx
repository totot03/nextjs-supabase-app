interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

// cacheComponents 환경에서 params는 요청 시점에만 정해지므로 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 이벤트 수정 페이지 골격 (주최자 전용, Task 004에서 구현)
export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">이벤트 수정</h1>
      <p className="mt-2 text-muted-foreground">
        이벤트 ID: {id} (수정 폼은 Task 004에서 구현 예정)
      </p>
    </div>
  );
}
