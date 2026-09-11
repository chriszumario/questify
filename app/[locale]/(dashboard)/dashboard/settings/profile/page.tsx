import { ProfileForm } from "./profile-form";
import { requireUser } from "@/lib/auth-session";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  return <ProfileForm user={{ name: user.name, email: user.email }} />;
}
