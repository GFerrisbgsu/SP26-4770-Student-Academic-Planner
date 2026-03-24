import type { Route } from "./+types/profile";
import { ProfilePage } from '~/components/ProfilePage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - Student Life" },
    { name: "description", content: "Manage your profile settings" },
  ];
}

export default function Profile() {
  return <ProfilePage />;
}
