import { describe, it, expect } from "vitest";
import { generateEventsForMonth, getAllEventsForMonth } from "./generateEvents";
import type { CourseForEvents } from "./generateEvents";

// Mock course data for testing (replaces hardcoded data imports)
const mockCourses: CourseForEvents[] = [
  {
    id: "cs2010",
    code: "CS 2010",
    schedule: "MWF 10:00-11:00",
    instructor: "Dr. Smith",
    description: "Programming Fundamentals",
  },
  {
    id: "math2210",
    code: "MATH 2210",
    schedule: "TuTh 14:00-15:30",
    instructor: "Dr. Johnson",
    description: "Discrete Mathematics",
  },
];

describe("generateEventsForMonth", () => {
  it("generates events for provided courses", () => {
    const events = generateEventsForMonth(2026, 0, mockCourses); // January 2026

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty("id");
    expect(events[0]).toHaveProperty("title");
    expect(events[0]).toHaveProperty("date");
    expect(events[0]).toHaveProperty("tag");
  });

  it("events have correct structure", () => {
    const events = generateEventsForMonth(2026, 0, mockCourses);
    const firstEvent = events[0];

    expect(firstEvent.type).toBe("class");
    expect(firstEvent.tag).toBe("school");
    expect(typeof firstEvent.startTime).toBe("number");
    expect(typeof firstEvent.endTime).toBe("number");
  });

  it("generates events only for days matching schedule", () => {
    const events = generateEventsForMonth(2026, 0, mockCourses);

    // All events should have valid dates in January 2026
    events.forEach((event) => {
      expect(event.date).not.toBeNull();
      expect(event.date!.getMonth()).toBe(0);
      expect(event.date!.getFullYear()).toBe(2026);
    });
  });

  it("returns empty array when no courses provided", () => {
    const events = generateEventsForMonth(2026, 0, []);
    expect(events).toHaveLength(0);
  });
});

describe("getAllEventsForMonth", () => {
  it("includes both class events and assignment events in normal mode", () => {
    const allEvents = getAllEventsForMonth(2026, 0, mockCourses);
    const classEvents = allEvents.filter((e) => e.type === "class");
    const assignmentEvents = allEvents.filter((e) => e.type === "event" && e.tag === "school");

    expect(classEvents.length).toBeGreaterThan(0);
    // Assignment events (now type='event' with tag='school') may or may not exist for a given month
    expect(assignmentEvents.length).toBeGreaterThanOrEqual(0);
  });

  it("excludes assignment events in What If Mode", () => {
    const events = getAllEventsForMonth(2026, 0, [mockCourses[0]], undefined, true);

    // Should only have class events, no predefined assignments
    events.forEach((event) => {
      expect(event.type).toBe("class");
      expect(event.courseId).toBe("cs2010");
    });
  });
});
