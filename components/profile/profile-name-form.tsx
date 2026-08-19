"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileNameFormProps {
  initialName: string;
}

/**
 * 프로필 이름 수정 폼 (F011).
 * 필드가 하나뿐이라 react-hook-form 없이 로컬 state로 구현했다. 실제 프로필 업데이트
 * API가 아직 없으므로(Task 008 예정) 저장해도 새로고침하면 원래 값으로 돌아간다.
 */
export function ProfileNameForm({ initialName }: ProfileNameFormProps) {
  const [name, setName] = useState(initialName);
  const [isDirty, setIsDirty] = useState(false);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    // TODO(Task 008): profiles 테이블 update로 교체
    toast.success("이름이 저장되었습니다.");
    setIsDirty(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="profile-name">이름</Label>
      <div className="flex gap-2">
        <Input
          id="profile-name"
          value={name}
          maxLength={50}
          onChange={(e) => {
            setName(e.target.value);
            setIsDirty(true);
          }}
        />
        <Button type="button" onClick={handleSave} disabled={!isDirty}>
          저장
        </Button>
      </div>
    </div>
  );
}
