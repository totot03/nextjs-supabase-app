import { MobileViewport } from "@/components/layout/mobile-viewport";

interface JoinPageProps {
  params: Promise<{ invite_code: string }>;
}

// cacheComponents 환경에서 params는 요청 시점에만 정해지므로 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 초대 링크 참여 페이지 골격 (F004: 비로그인 사용자도 미리보기가 보여야 함)
// 주의: proxy.ts가 이 경로를 인증 예외로 처리하지 않아, 현재는 비로그인 접근 시
// /auth/login으로 리다이렉트된다. 실제 비로그인 미리보기 허용은 Task 008에서 처리한다.
export default async function JoinPage({ params }: JoinPageProps) {
  const { invite_code: inviteCode } = await params;

  return (
    <MobileViewport className="flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold">이벤트 초대</h1>
        <p className="mt-2 text-muted-foreground">
          초대 코드: {inviteCode} (미리보기 UI는 Task 005에서 구현 예정)
        </p>
      </div>
    </MobileViewport>
  );
}
