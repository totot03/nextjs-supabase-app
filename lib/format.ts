/**
 * 이벤트/참여자 카드 등 여러 컴포넌트에서 공통으로 쓰는 포맷 유틸리티.
 */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * ISO 날짜 문자열을 "2026.09.15 (화) 19:00" 형태로 포맷한다.
 * Intl.DateTimeFormat의 로케일별 구두점 차이에 의존하지 않도록 직접 조합한다.
 */
export function formatEventDate(iso: string): string {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[date.getDay()];
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd} (${weekday}) ${hh}:${min}`;
}

/**
 * ISO 날짜 문자열을 "2026.08.19" 형태(시간 없이)로 포맷한다.
 * 프로필 페이지의 가입일처럼 요일/시각이 필요 없는 날짜 전용 표시에 사용한다.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd}`;
}

/**
 * 이름에서 Avatar 폴백용 이니셜을 추출한다.
 * 한글 이름은 첫 글자 하나, 영문 등은 공백으로 구분된 단어의 첫 글자를 최대 2개 조합한다.
 * (예: "김민재" -> "김", "Jane Doe" -> "JD")
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "?";

  if (/^[가-힣]/.test(trimmed)) {
    return trimmed.slice(0, 1);
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return initials || trimmed.slice(0, 2).toUpperCase();
}
