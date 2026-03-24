import type { Route } from "./+types/courses";
import { CoursesPage } from '~/components/CoursesPage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Course Catalog - Student Life" },
    { name: "description", content: "Browse available courses and plan your schedule" },
  ];
}

export default function Courses() {
  return <CoursesPage />;
}
