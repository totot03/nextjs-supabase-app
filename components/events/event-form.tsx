"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Event } from "@/types/domain";
import { eventFormSchema, type EventFormValues } from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EventFormProps {
  mode: "create" | "edit";
  /** 수정 모드일 때 기존 값을 채워 넣기 위해 전달한다. */
  defaultEvent?: Event;
}

/** ISO 날짜 문자열을 <input type="datetime-local"> value 형식("YYYY-MM-DDTHH:mm")으로 변환한다. */
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/**
 * 이벤트 생성/수정 공용 폼 (F001, F006, F009).
 * 실제 insert/update API가 아직 없으므로(Task 009 예정), 제출 시 토스트 + 목록 페이지
 * 이동으로 흐름만 시연한다. 커버 이미지도 로컬 미리보기만 지원하고 실제 업로드는 하지 않는다.
 */
export function EventForm({ mode, defaultEvent }: EventFormProps) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultEvent?.cover_image_url ?? null,
  );

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultEvent?.title ?? "",
      description: defaultEvent?.description ?? "",
      location: defaultEvent?.location ?? "",
      event_date: defaultEvent
        ? toDatetimeLocalValue(defaultEvent.event_date)
        : "",
    },
  });

  // blob: URL은 컴포넌트가 사라질 때 명시적으로 해제하지 않으면 메모리에 남는다.
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  }

  function onSubmit(values: EventFormValues) {
    // TODO(Task 009): Supabase insert/update + Storage 업로드로 교체
    void values;
    toast.success(
      mode === "create"
        ? "이벤트가 생성되었습니다."
        : "이벤트가 수정되었습니다.",
    );
    router.push("/events");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 px-4 py-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">커버 이미지</label>
          <label className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted">
            {previewUrl ? (
              // blob: 미리보기 URL은 next/image의 최적화 프록시가 처리할 수 없어 <img>를 그대로 쓴다.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="커버 이미지 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageIcon className="size-6" />
                <span className="text-sm">이미지를 선택해주세요</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleCoverImageChange}
            />
          </label>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input
                  placeholder="예) 가을 소풍 모임"
                  maxLength={50}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이벤트에 대해 간단히 소개해주세요."
                  maxLength={500}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>날짜 및 시간</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input
                  placeholder="예) 서울숲 공원"
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full">
          {mode === "create" ? "이벤트 생성" : "수정 완료"}
        </Button>
      </form>
    </Form>
  );
}
