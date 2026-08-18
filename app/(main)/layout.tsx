import { Suspense } from "react";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileViewport } from "@/components/layout/mobile-viewport";

// 로그인 후 주최자/참여자 공용 모바일 레이아웃 골격
// 인증 가드는 lib/supabase/proxy.ts(Task 008)에서 처리하므로 여기서는 UI 뼈대만 구성한다
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileViewport className="flex flex-col">
      <main className="flex-1 pb-20">{children}</main>
      {/* usePathname()은 런타임에만 결정되므로 cacheComponents 프리렌더링을 막지 않도록 Suspense로 감싼다 */}
      <Suspense
        fallback={
          <div className="fixed inset-x-0 bottom-0 mx-auto h-16 w-full max-w-md" />
        }
      >
        <MobileBottomNav />
      </Suspense>
    </MobileViewport>
  );
}
