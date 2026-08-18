import { cn } from "@/lib/utils";

interface MobileViewportProps {
  children: React.ReactNode;
  className?: string;
}

// 관리자(/admin) 제외 사용자용 화면 전용 "모바일 웹" 레이아웃.
// 데스크톱에서도 콘텐츠 폭을 448px(max-w-md)로 제한해 중앙 배치하고,
// 바깥 여백은 bg-muted, 콘텐츠 컬럼은 bg-background로 구분한다.
export function MobileViewport({ children, className }: MobileViewportProps) {
  return (
    <div className="min-h-svh w-full bg-muted">
      <div
        className={cn(
          "mx-auto min-h-svh w-full max-w-md bg-background",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
