import { MobileViewport } from "@/components/layout/mobile-viewport";

// 인증 페이지 공통 레이아웃: 기존 개별 페이지의 중앙 정렬 패턴을 유지하면서
// 모바일 폭(448px) 제약을 추가한다.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileViewport className="flex items-center justify-center p-6 md:p-10">
      {children}
    </MobileViewport>
  );
}
