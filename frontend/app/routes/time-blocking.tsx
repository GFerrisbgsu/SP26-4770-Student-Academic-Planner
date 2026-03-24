import type { Route } from "./+types/time-blocking";
import { TimeBlocking } from '~/components/TimeBlocking';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Time Blocking - Student Life" },
    { name: "description", content: "Manage your time blocks and productivity" },
  ];
}

export default function TimeBlockingRoute() {
  return <TimeBlocking />;
}
