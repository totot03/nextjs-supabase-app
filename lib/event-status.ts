import type { EventStatus } from "@/types/domain";

/**
 * 이벤트 상태별 배지 라벨/색상 매핑.
 * neutral 팔레트만으로는 3가지 상태를 구분하기 어려워 Tailwind 색상 유틸을
 * 직접 지정한다(라이트/다크 모드 모두 대응). EventCard와 Task 006 관리자
 * 이벤트 관리 테이블이 함께 재사용할 수 있도록 공용 파일로 분리했다.
 */
export const eventStatusMap: Record<
  EventStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: "예정",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  ongoing: {
    label: "진행 중",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  ended: {
    label: "종료",
    className: "bg-muted text-muted-foreground",
  },
};
