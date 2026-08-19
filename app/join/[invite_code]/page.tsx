import { MobileViewport } from "@/components/layout/mobile-viewport";

interface JoinPageProps {
  params: Promise<{ invite_code: string }>;
}

// cacheComponents 환경에서 params는 요청 시점에만 정해지므로 온디맨드 렌더링으로 명시한다.
export const instant = false;

// 초대 링크 참여 페이지 골격 (F004: 비로그인 사용자도 미리보기가 보여야 함)
// lib/supabase/proxy.ts의 PUBLIC_PATH_PREFIXES에 "/join"이 등록되어 있어
// 비로그인 사용자도 이 경로에 접근 가능하다. 로그인 후 자동 참여 처리 로직은
// Task 010(참여자 관리)에서 구현한다.
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
