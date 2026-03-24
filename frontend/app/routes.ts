import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("cs-map-preview", "routes/cs-map-preview.tsx"),
  route("se-map-preview", "routes/se-map-preview.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("verify-email", "routes/verify-email.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("", "routes/protected.tsx", [
    index("routes/home.tsx"),
    route("course/:courseId", "routes/course.tsx"),
    route("courses", "routes/courses.tsx"),
    route("timeline/:date", "routes/timeline.tsx"),
    route("event/:eventId", "routes/event.tsx"),
    route("profile", "routes/profile.tsx"),
    route("budget-planner", "routes/budget-planner.tsx"),
    route("time-blocking", "routes/time-blocking.tsx"),
    route("personal", "routes/personal.tsx"),
    route("degree-progress", "routes/degree-progress.tsx"),
    route("study", "routes/study.tsx"),
  route("test-sync", "routes/test-sync.tsx"), // Testing page for persistence infrastructure
  ]),
] satisfies RouteConfig;
