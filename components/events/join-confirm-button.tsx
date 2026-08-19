"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface JoinConfirmButtonProps {
  eventId: string;
  eventTitle: string;
}

/**
 * 초대 참여 확인 버튼 (F004).
 * 더미 단계라 dummyParticipants를 실제로 mutate하지 않는다(정적 배열이라 반영되지 않고,
 * 새로고침 시 사라져 오히려 혼란을 줌). 성공 토스트 후 이벤트 상세로 이동시켜 흐름만
 * 시연하고, 실제 participants insert는 Task 010(참여자 관리)에서 서버 액션으로 구현한다.
 */
export function JoinConfirmButton({
  eventId,
  eventTitle,
}: JoinConfirmButtonProps) {
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  function handleJoin() {
    setIsJoining(true);
    toast.success(`"${eventTitle}"에 참여했습니다.`);
    router.push(`/events/${eventId}`);
  }

  return (
    <Button className="w-full" onClick={handleJoin} disabled={isJoining}>
      참여 확인
    </Button>
  );
}
