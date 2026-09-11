import { requireUser } from "@/lib/auth-session";
import { ProfileForm } from "./profile/profile-form";

export default async function SettingsPage() {
  const user = await requireUser();

  return <ProfileForm user={{ name: user.name, email: user.email }} />;
}
