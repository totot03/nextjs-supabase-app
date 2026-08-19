import { z } from "zod";

/**
 * 이벤트 생성/수정 폼 검증 스키마.
 * `docs/PRD.md` "4. 이벤트 생성 페이지" 절의 필드 제약을 그대로 반영한다.
 * 필드명은 `types/domain.ts`의 `EventInsert`와 일치시켜, Task 009에서 실제
 * insert/update 함수로 교체할 때 폼 값을 변환 없이 그대로 넘길 수 있게 한다.
 */
export const eventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "이벤트 제목을 입력해주세요.")
    .max(50, "제목은 최대 50자까지 입력할 수 있습니다."),
  description: z
    .string()
    .trim()
    .max(500, "설명은 최대 500자까지 입력할 수 있습니다.")
    .optional(),
  location: z
    .string()
    .trim()
    .min(1, "장소를 입력해주세요.")
    .max(100, "장소는 최대 100자까지 입력할 수 있습니다."),
  // <input type="datetime-local">의 value는 "YYYY-MM-DDTHH:mm" 형태의 문자열이다.
  event_date: z.string().min(1, "이벤트 날짜와 시간을 선택해주세요."),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
