import type { Route } from "./+types/home";
import { useState, useEffect } from 'react';
import { CalendarView } from '~/components/CalendarView';
import { getEnrolledCourses, getAllCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';
import { getUserEvents } from '~/services/eventService';
import { getAssignmentsForCourses } from '~/services/assignmentService';
import { useAuth } from '~/context/AuthContext';
import type { CalendarEvent } from '~/utils/generateEvents';
import { addCustomTag, getAllTagConfigs } from '~/utils/tagUtils';
import { mapAssignmentsToCalendarTasks } from '~/utils/assignmentTasks';
import { subscribeAssignmentsChanged } from '~/utils/assignmentSync';

const fallbackTagColors = ['blue', 'green', 'orange', 'pink', 'indigo', 'emerald', 'amber', 'rose'];
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function getFallbackTagColor(tagKey: string): string {
  const hash = tagKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return fallbackTagColors[Math.abs(hash) % fallbackTagColors.length];
}

function prettifyTagLabel(tagKey: string): string {
  return tagKey
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function parseLocalDate(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Student Life - Smart Calendar" },
    { name: "description", content: "Your complete student life management platform" },
  ];
}

export default function Home() {
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [assignmentTasks, setAssignmentTasks] = useState<CalendarEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseColors, setCourseColors] = useState<Record<string, string>>({});

  // What If Mode state
  const [isWhatIfMode, setIsWhatIfMode] = useState(false);
  const [whatIfCourseIds, setWhatIfCourseIds] = useState<string[]>([]);

  const { user } = useAuth();
  const userId = user?.id;

  // Fetch enrolled courses
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const [courses, all] = await Promise.all([
          getEnrolledCourses(),
          getAllCourses()
        ]);
        
        // Load custom courses from localStorage and merge with API courses
        const savedCustomCourses = localStorage.getItem('customCourses');
        let customCourses: Course[] = [];
        if (savedCustomCourses) {
          try {
            customCourses = JSON.parse(savedCustomCourses);
          } catch (e) {
            console.error('Failed to parse custom courses:', e);
          }
        }
        
        // Merge API courses with custom courses
        const allEnrolledCourses = [...courses, ...customCourses];
        setEnrolledCourses(allEnrolledCourses);
        setAllCourses(all);

        const colors: Record<string, string> = {};
        allEnrolledCourses.forEach(course => {
          colors[course.id] = course.color;
        });
        setCourseColors(colors);
        setWhatIfCourseIds(courses.map(c => c.id));
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  // Fetch user events separately so course loading failures don't block events.
  useEffect(() => {
    if (!userId) {
      setCustomEvents([]);
      return;
    }
    const authenticatedUserId = userId;

    async function loadEvents() {
      try {
        const events = await getUserEvents(authenticatedUserId);

        // Rehydrate missing custom tags from persisted backend events.
        const existingTags = getAllTagConfigs();
        events.forEach((event: any) => {
          const tagKey = typeof event.tag === 'string' ? event.tag : '';
          if (!tagKey || existingTags[tagKey]) {
            return;
          }

          const backendLabel = event.tagObject?.name;
          addCustomTag(
            tagKey,
            typeof backendLabel === 'string' && backendLabel.trim() ? backendLabel : prettifyTagLabel(tagKey),
            getFallbackTagColor(tagKey)
          );

          existingTags[tagKey] = getAllTagConfigs()[tagKey];
        });

        const eventsWithDates = events.map((event: any) => ({
          ...event,
          date: parseLocalDate(event.date),
          startTime: event.startTime,
          endTime: event.endTime,
        }));

        setCustomEvents(eventsWithDates);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    }

    loadEvents();
  }, [userId, refreshKey]);

  // Fetch assignments and map them into calendar task cards.
  useEffect(() => {
    if (!userId || enrolledCourses.length === 0) {
      setAssignmentTasks([]);
      return;
    }

    let cancelled = false;

    async function loadAssignmentTasks() {
      try {
        const assignments = await getAssignmentsForCourses(enrolledCourses.map((course) => course.id));
        if (!cancelled) {
          setAssignmentTasks(mapAssignmentsToCalendarTasks(assignments));
        }
      } catch (error) {
        console.error('Failed to load assignments for calendar:', error);
        if (!cancelled) {
          setAssignmentTasks([]);
        }
      }
    }

    loadAssignmentTasks();

    return () => {
      cancelled = true;
    };
  }, [userId, enrolledCourses, refreshKey]);

  useEffect(() => {
    const unsubscribe = subscribeAssignmentsChanged(() => {
      setRefreshKey(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

 const handleAddEvent = async (event: Omit<CalendarEvent, 'id'>): Promise<boolean | { success: boolean; eventId?: number }> => {
  try {
    // Validate user is logged in
    if (!userId) {
      console.error("Cannot add event: User not logged in");
      alert("Please log in to add events");
      return { success: false };
    }

    // Format date as YYYY-MM-DD for backend LocalDate (or null if no date)
    const formattedDate = formatLocalDate(event.date);
    
    const eventPayload = {
      ...event,
      date: formattedDate  // Convert Date to string format or null
    };

    const res = await fetch(`${API_BASE_URL}/events/user/${userId}`, {
      method: 'POST',
      credentials: 'include', // Send HttpOnly cookies for authentication
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", res.status, errorText);
      if (res.status === 401) {
        alert("Please log in to add events");
      } else {
        alert(`Failed to add event: ${res.status} - ${errorText}`);
      }
      return { success: false };
    }

    const createdEvent = await res.json();
    console.log("Event created successfully:", createdEvent);
    // Parse date in local time to avoid timezone issues
    setCustomEvents(prev => [...prev, { 
      ...createdEvent, 
      date: parseLocalDate(createdEvent.date)
    }]);
    setRefreshKey(prev => prev + 1); // Trigger refresh in CalendarView
    
    // Return success with event ID for reminder scheduling
    return { success: true, eventId: createdEvent.id };
  } catch (err) {
    console.error("Failed to add event:", err);
    alert(`Error adding event: ${err}`);
    return { success: false };
  }
};

const handleRemoveEvent = async (eventId: string) => {
  try {
    console.log("Removing event:", eventId);

    const res = await fetch(`${API_BASE_URL}/events/${eventId}`, { 
      method: 'DELETE',
      credentials: 'include', // Use HttpOnly cookies for auth
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to delete event:", res.status, errorText);
      alert(`Failed to remove event: ${res.status}`);
      return;
    }

    console.log("Event removed successfully");

    setCustomEvents(prev => prev.filter(event => event.id !== eventId));
    setRefreshKey(prev => prev + 1); // Trigger refresh in CalendarView
  } catch (err) {
    console.error("Failed to remove event:", err);
    alert(`Error removing event: ${err}`);
  }
};

  const handleCourseColorChange = (courseId: string, newColor: string) => {
    setCourseColors(prev => ({
      ...prev,
      [courseId]: newColor
    }));
  };

  const handleToggleWhatIfMode = () => {
    if (isWhatIfMode) {
      // Exiting what-if mode - reset to enrolled courses
      setWhatIfCourseIds(enrolledCourses.map(course => course.id));
      setIsWhatIfMode(false);
    } else {
      // Entering what-if mode - start with enrolled courses
      setWhatIfCourseIds(enrolledCourses.map(course => course.id));
      setIsWhatIfMode(true);
    }
  };

  const handleAddWhatIfCourse = (courseId: string) => {
    setWhatIfCourseIds(prev => {
      if (!prev.includes(courseId)) {
        return [...prev, courseId];
      }
      return prev;
    });
  };

  const handleRemoveWhatIfCourse = (courseId: string) => {
    setWhatIfCourseIds(prev => prev.filter(id => id !== courseId));
  };

  const handleClearWhatIf = () => {
    setWhatIfCourseIds(enrolledCourses.map(course => course.id));
    setIsWhatIfMode(false);
  };

  const handleEventUpdate = async () => {
    // Refetch events from backend to get the latest updates (for edits)
    if (!userId) return;
    try {
      const events = await getUserEvents(userId);
      // Parse dates and rehydrate custom tags (same logic as initial load)
      const existingTags = getAllTagConfigs();
      events.forEach((event: any) => {
        const tagKey = typeof event.tag === 'string' ? event.tag : '';
        if (!tagKey || existingTags[tagKey]) {
          return;
        }
        const backendLabel = event.tagObject?.name;
        if (backendLabel && backendLabel.trim()) {
          addCustomTag(tagKey, backendLabel, event.tagObject?.color || getFallbackTagColor(tagKey));
        }
      });
      setCustomEvents(events.map((event: any) => ({
        ...event,
        date: parseLocalDate(event.date)
      })));
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refetch events after update:', error);
    }
  };

  return (
    <CalendarView 
      customEvents={customEvents}
      assignmentTasks={assignmentTasks}
      onAddEvent={handleAddEvent}
      onRemoveEvent={handleRemoveEvent}
      courseColors={courseColors} 
      onCourseColorChange={handleCourseColorChange}
      isWhatIfMode={isWhatIfMode}
      whatIfCourseIds={whatIfCourseIds}
      onToggleWhatIfMode={handleToggleWhatIfMode}
      onAddWhatIfCourse={handleAddWhatIfCourse}
      onRemoveWhatIfCourse={handleRemoveWhatIfCourse}
      onClearWhatIf={handleClearWhatIf}
      onEventUpdate={handleEventUpdate}
      refreshKey={refreshKey}
      enrolledCourses={enrolledCourses}
      allCourses={allCourses}
    />
  );
}
