import { Suspense } from "react";

import { AdminSidebar } from "@/components/layout/admin-sidebar";

// 관리자 전용 데스크톱 레이아웃 골격 (좌측 사이드바 240px + 메인 콘텐츠)
// 반응형 지원 없음(PRD: 데스크톱 전용) — role: admin 가드는 Task 008에서 추가
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full">
      {/* usePathname()은 런타임에만 결정되므로 cacheComponents 프리렌더링을 막지 않도록 Suspense로 감싼다 */}
      <Suspense fallback={<div className="h-svh w-60 shrink-0 bg-gray-900" />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
