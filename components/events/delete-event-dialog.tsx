"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteEventDialogProps {
  eventTitle: string;
}

/**
 * 이벤트 삭제 확인 다이얼로그 (F006).
 * 실제 삭제 API가 아직 없으므로(Task 009 예정), 확인 시 목록 페이지로 이동만 시켜
 * 흐름을 시연한다.
 */
export function DeleteEventDialog({ eventTitle }: DeleteEventDialogProps) {
  const router = useRouter();

  function handleDelete() {
    // TODO(Task 009): Supabase delete 연결
    toast.info("이벤트가 삭제되었습니다.");
    router.push("/events");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="text-destructive">
          <Trash2 className="size-4" />
          이벤트 삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이벤트를 삭제할까요?</DialogTitle>
          <DialogDescription>
            &quot;{eventTitle}&quot; 이벤트와 참여자 정보가 모두 삭제되며, 이
            작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              취소
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
