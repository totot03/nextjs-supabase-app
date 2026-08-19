import { notFound } from "next/navigation";

import { dummyCurrentUser, getEventById } from "@/lib/dummy";
import { EventForm } from "@/components/events/event-form";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

// cacheComponents 환경에서 params는 요청 시점에만 정해지므로 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 이벤트 수정 페이지 (주최자 전용, F001, F006, F009)
export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = getEventById(id);

  // 존재하지 않거나 주최자가 아니면 접근 자체를 숨긴다(실제 RLS가 붙기 전까지의 UI 단 가드).
  if (!event || event.created_by !== dummyCurrentUser.id) {
    notFound();
  }

  return (
    <div>
      <h1 className="px-4 pt-6 text-2xl font-bold">이벤트 수정</h1>
      <EventForm mode="edit" defaultEvent={event} />
    </div>
  );
}
