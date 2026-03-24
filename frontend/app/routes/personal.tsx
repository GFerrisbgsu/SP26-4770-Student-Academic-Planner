import type { Route } from "./+types/personal";
import { PersonalPage } from '~/components/PersonalPage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Personal - Student Life" },
    { name: "description", content: "Access your personal tools and settings" },
  ];
}

export default function Personal() {
  return <PersonalPage />;
}
