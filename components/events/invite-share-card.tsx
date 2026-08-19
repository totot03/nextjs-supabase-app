"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InviteShareCardProps {
  inviteCode: string;
}

/**
 * 초대 링크 표시 및 공유 카드 (F002, F003).
 * 클립보드 복사만 실제로 동작한다. 카카오톡/문자 공유는 별도 SDK 연동이 필요해
 * (Task 009 예정) 지금은 비활성화된 버튼으로 UI만 보여준다.
 */
export function InviteShareCard({ inviteCode }: InviteShareCardProps) {
  const [copied, setCopied] = useState(false);
  const invitePath = `/join/${inviteCode}`;

  async function handleCopy() {
    // window.location은 렌더링이 아니라 클릭 시점에만 읽어 SSR/CSR 불일치를 피한다.
    const url = `${window.location.origin}${invitePath}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("초대 링크가 복사되었습니다.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">초대 링크</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <code className="truncate rounded-md bg-muted px-3 py-2 text-sm">
          {invitePath}
        </code>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            복사
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="준비 중"
          >
            <MessageCircle className="size-4" />
            카카오톡
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="준비 중"
          >
            <Send className="size-4" />
            문자
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
