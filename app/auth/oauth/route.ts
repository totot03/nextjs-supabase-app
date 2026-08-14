import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// 구글 등 OAuth(PKCE) 로그인 콜백 전용 라우트.
// app/auth/confirm/route.ts는 이메일 OTP(verifyOtp) 전용이라 API가 달라 재사용할 수 없다.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/protected";
  if (!next.startsWith("/")) {
    // next 값을 신뢰하지 않고 상대경로만 허용 (open redirect 방지)
    next = "/protected";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
  }

  // code 파라미터가 없는 경우: 사용자가 URL을 직접 조작했거나,
  // 구글이 동의 거부 등으로 error 파라미터만 붙여 리다이렉트한 경우
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");
  redirect(
    `/auth/error?error=${encodeURIComponent(oauthError ?? "No code provided")}`,
  );
}
