import { EventForm } from "@/components/events/event-form";

// 이벤트 생성 페이지 (F001, F009)
export default function CreateEventPage() {
  return (
    <div>
      <h1 className="px-4 pt-6 text-2xl font-bold">이벤트 만들기</h1>
      <EventForm mode="create" />
    </div>
  );
}
