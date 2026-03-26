import type { Route } from "./+types/timeline";
import { useState, useEffect } from 'react';
import { TimelinePage } from '~/components/TimelinePage';
import { getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';
import { getUserEvents } from '~/services/eventService';
import { getAssignmentsForCourses } from '~/services/assignmentService';
import { userService } from '~/services/userService';
import type { CalendarEvent } from '~/utils/generateEvents';
import { getUserProjects } from '~/services/projectService';
import type { Project } from '~/services/projectService';
import { mapAssignmentsToCalendarTasks } from '~/utils/assignmentTasks';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Timeline - Student Life" },
    { name: "description", content: "View your daily timeline" },
  ];
}

// Helper to convert backend EventDTO to CalendarEvent
function convertBackendEventToCalendarEvent(backendEvent: any): CalendarEvent {
  // Parse date from backend (format: YYYY-MM-DD)
  // Create date in local timezone at start of day
  let eventDate = null;
  if (backendEvent.date) {
    const [year, month, day] = backendEvent.date.split('-').map(Number);
    eventDate = new Date(year, month - 1, day);
  }

  return {
    id: backendEvent.id?.toString() || `event-${Date.now()}`,
    title: backendEvent.title,
    date: eventDate,
    time: backendEvent.time || null,
    startTime: backendEvent.startTime,
    endTime: backendEvent.endTime,
    color: backendEvent.color || 'bg-blue-500',
    location: backendEvent.location,
    type: (backendEvent.type as 'class' | 'event') || 'event',
    description: backendEvent.description,
    courseId: backendEvent.courseId,
    projectId: backendEvent.projectId,
    tag: backendEvent.tag || 'school',
    completed: backendEvent.completed || false,
  };
}

export default function Timeline() {
  const [backendEvents, setBackendEvents] = useState<CalendarEvent[]>([]);
  const [courseColors, setCourseColors] = useState<Record<string, string>>({});
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isWhatIfMode] = useState(false);
  const [whatIfCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch enrolled courses, backend events, and projects
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = userService.getCurrentUser();
        if (!currentUser?.id) {
          console.warn('No user logged in');
          setLoading(false);
          return;
        }

        const [courses, events, userProjects] = await Promise.all([
          getEnrolledCourses(),
          getUserEvents(currentUser.id).catch(err => {
            console.error('Failed to load events:', err);
            return [];
          }),
          getUserProjects(currentUser.id).catch(err => {
            console.error('Failed to load projects:', err);
            return [];
          })
        ]);

        const assignments = await getAssignmentsForCourses(courses.map((course) => course.id));

        setEnrolledCourses(courses);
        setProjects(userProjects);
        
        // Build course colors map
        const colors: Record<string, string> = {};
        courses.forEach(course => {
          colors[course.id] = course.color;
        });
        setCourseColors(colors);

        // Convert backend events to CalendarEvent format
        const convertedEvents = events.map(convertBackendEventToCalendarEvent);
        const assignmentTasks = mapAssignmentsToCalendarTasks(assignments);
        setBackendEvents([...convertedEvents, ...assignmentTasks]);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <TimelinePage
      customEvents={backendEvents}
      courseColors={courseColors}
      isWhatIfMode={isWhatIfMode}
      whatIfCourseIds={whatIfCourseIds}
      courses={enrolledCourses}
      projects={projects}
    />
  );
}
