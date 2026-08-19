import { dummyCurrentUser } from "@/lib/dummy";
import { formatDate, getInitials } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";
import { ProfileNameForm } from "@/components/profile/profile-name-form";

// 프로필 페이지 (F011)
// TODO(Task 008): dummyCurrentUser를 실제 세션 사용자(SessionUser)로 교체
export default function ProfilePage() {
  const user = dummyCurrentUser;

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">프로필</h1>

      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {user.avatar_url && (
            <AvatarImage src={user.avatar_url} alt={user.name} />
          )}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <ProfileNameForm initialName={user.name} />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">이메일</span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">가입일</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(user.created_at)}
          </span>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
