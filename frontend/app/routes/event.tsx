import type { Route } from "./+types/event";
import { useState, useEffect } from 'react';
import { EventPage } from '~/components/EventPage';
import { getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';
import type { CalendarEvent } from '~/utils/generateEvents';
import { deleteEvent, getUserEvents, updateEvent } from '~/services/eventService';
import { userService } from '~/services/userService';
import { getTagInfo } from '~/utils/tagUtils';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Event Details - Student Life" },
    { name: "description", content: "View and edit event details" },
  ];
}

// Helper to convert backend EventDTO to CalendarEvent
function convertBackendEventToCalendarEvent(backendEvent: any): CalendarEvent {
  // Parse date from backend (format: YYYY-MM-DD)
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
    startTime: backendEvent.startTime ?? null,
    endTime: backendEvent.endTime ?? null,
    color: backendEvent.color || 'bg-blue-500',
    location: backendEvent.location || undefined,
    type: (backendEvent.type as 'class' | 'event') || 'event',
    description: backendEvent.description || undefined,
    courseId: backendEvent.courseId || undefined,
    projectId: backendEvent.projectId || undefined,
    tag: backendEvent.tag || 'school',
    completed: backendEvent.completed || false,
  };
}

export default function Event() {
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [courseColors, setCourseColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Fetch enrolled courses and backend events
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = userService.getCurrentUser();
        
        if (!currentUser?.id) {
          console.warn('No user logged in');
          const courses = await getEnrolledCourses();
          const colors: Record<string, string> = {};
          courses.forEach(course => {
            colors[course.id] = course.color;
          });
          setCourseColors(colors);
          setLoading(false);
          return;
        }

        // Fetch courses and events in parallel
        const [courses, events] = await Promise.all([
          getEnrolledCourses(),
          getUserEvents(currentUser.id).catch(err => {
            console.error('Failed to load events:', err);
            return [];
          })
        ]);
        
        const colors: Record<string, string> = {};
        courses.forEach(course => {
          colors[course.id] = course.color;
        });
        setCourseColors(colors);

        // Convert backend events to CalendarEvent format
        const convertedEvents = events.map(convertBackendEventToCalendarEvent);
        setCustomEvents(convertedEvents);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toDateString = (date: Date | null): string | null => {
    if (!date) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toDisplayTime = (time: number | null): string | null => {
    if (time === null || Number.isNaN(time)) {
      return null;
    }

    const hour = Math.floor(time);
    const minute = Math.round((time - hour) * 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const resolveColorForTag = (tag: string, fallbackColor: string): string => {
    const tagInfo = getTagInfo(tag);
    if (!tagInfo) {
      return fallbackColor;
    }

    return `${tagInfo.lightColor} ${tagInfo.borderColor}`;
  };

  const handleUpdateEvent = async (
    eventId: string,
    updates: {
      title: string;
      date: Date | null;
      startTime: number | null;
      endTime: number | null;
      location: string;
      type: 'class' | 'event';
      description: string;
      tag: string;
      completed: boolean;
    }
  ): Promise<CalendarEvent | null> => {
    const existingEvent = customEvents.find(event => event.id === eventId);
    const numericEventId = Number(eventId);
    const isBackendEvent = Number.isInteger(numericEventId);

    const mergedEvent: CalendarEvent = {
      ...(existingEvent || {
        id: eventId,
        color: 'bg-blue-100 border-blue-500',
        courseId: undefined,
        projectId: undefined,
        todoListId: undefined,
      }),
      id: eventId,
      title: updates.title,
      date: updates.date,
      startTime: updates.startTime,
      endTime: updates.endTime,
      time: toDisplayTime(updates.startTime),
      location: updates.location || undefined,
      type: updates.type,
      description: updates.description || undefined,
      tag: updates.tag,
      completed: updates.completed,
      color: resolveColorForTag(updates.tag, existingEvent?.color || 'bg-blue-100 border-blue-500'),
    };

    if (!isBackendEvent) {
      return mergedEvent;
    }

    const eventPayload = {
      title: mergedEvent.title,
      date: toDateString(mergedEvent.date),
      time: mergedEvent.time,
      startTime: mergedEvent.startTime,
      endTime: mergedEvent.endTime,
      color: mergedEvent.color,
      type: mergedEvent.type,
      description: mergedEvent.description || null,
      location: mergedEvent.location || null,
      tag: mergedEvent.tag,
      courseId: mergedEvent.courseId || null,
      projectId: mergedEvent.projectId || null,
      todoListId: mergedEvent.todoListId || null,
    };

    try {
      const updatedFromBackend = await updateEvent(numericEventId, eventPayload);
      const converted = convertBackendEventToCalendarEvent(updatedFromBackend);

      setCustomEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, ...converted, id: eventId }
          : event
      ));

      return { ...converted, id: eventId };
    } catch (error) {
      console.error('Failed to update event:', error);
      return null;
    }
  };

  const handleDeleteEvent = async (eventId: string): Promise<boolean> => {
    const numericEventId = Number(eventId);
    if (!Number.isInteger(numericEventId)) {
      return false;
    }

    try {
      await deleteEvent(numericEventId);
      setCustomEvents(prev => prev.filter(event => event.id !== eventId));
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <EventPage
      customEvents={customEvents}
      courseColors={courseColors}
      onUpdateEvent={handleUpdateEvent}
      onDeleteEvent={handleDeleteEvent}
    />
  );
}
