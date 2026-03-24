import type { Route } from "./+types/degree-progress";
import { CourseMapPage } from '~/components/CourseMapPage';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Course Map - Student Life" },
    { name: "description", content: "Interactive degree course map and enrollment" },
  ];
}

export default function DegreeProgress() {
  return <CourseMapPage />;
}
