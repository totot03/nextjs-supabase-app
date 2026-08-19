import Link from "next/link";
import { CalendarPlus, Share2, Users } from "lucide-react";

import { MobileViewport } from "@/components/layout/mobile-viewport";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: CalendarPlus,
    title: "간편한 이벤트 생성",
    description: "제목, 날짜, 장소만 입력하면 3초 만에 이벤트가 만들어져요.",
  },
  {
    icon: Share2,
    title: "원클릭 초대 링크 공유",
    description: "자동 생성된 초대 링크 하나로 카카오톡, 문자 공유가 끝나요.",
  },
  {
    icon: Users,
    title: "실시간 참여자 확인",
    description: "누가 참여했는지 실시간으로 업데이트되는 목록을 확인하세요.",
  },
] as const;

// 비로그인 사용자를 위한 서비스 소개 및 로그인 유도 랜딩 페이지 (F001)
export default function Home() {
  return (
    <MobileViewport className="flex flex-col">
      <main className="flex flex-1 flex-col gap-10 px-4 py-10">
        <div className="space-y-3 pt-6 text-center">
          <h1 className="text-2xl font-bold">Gather</h1>
          <p className="text-muted-foreground">
            초대 링크 하나로 끝나는
            <br />
            소규모 모임 관리 플랫폼
          </p>
        </div>

        <div className="space-y-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="shrink-0 rounded-full bg-muted p-2">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href="/auth/login">Google로 시작하기</Link>
        </Button>
      </main>

      <footer className="flex items-center justify-between border-t px-4 py-4 text-xs text-muted-foreground">
        <span>© Gather</span>
        <ThemeSwitcher />
      </footer>
    </MobileViewport>
  );
}
