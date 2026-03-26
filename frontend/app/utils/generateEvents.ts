/**
 * Minimal course shape needed for event generation.
 * Compatible with both services/courseService.Course and types/course.CourseDTO.
 */
export interface CourseForEvents {
  id: string;
  code: string;
  schedule: string;
  instructor: string;
  description?: string;
}

import type { EventTag } from '~/utils/tagUtils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date | null;
  time: string | null;
  startTime: number | null;
  endTime: number | null;
  color: string;
  location?: string;
  type: 'class' | 'event' | 'task';
  description?: string;
  courseId?: string;
  projectId?: number;
  todoListId?: number;
  assignmentId?: number;
  source?: 'event' | 'assignment' | 'predefined';
  tag: EventTag; // NEW: Tag system
  completed?: boolean; // NEW: Track completion status
}

// Parse schedule string like "MWF 10:00-11:00" or "TuTh 14:00-15:30"
function parseSchedule(schedule: string): { days: number[], startTime: number, endTime: number } | null {
  if (!schedule) return null;
  const parts = schedule.split(' ');
  if (parts.length < 2) return null;

  const dayString = parts[0];
  const timeRange = parts[1];

  // Map day abbreviations to day numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap: { [key: string]: number } = {
    'Su': 0,
    'M': 1,
    'Tu': 2,
    'W': 3,
    'Th': 4,
    'F': 5,
    'Sa': 6
  };

  // Parse days
  const days: number[] = [];
  let i = 0;
  while (i < dayString.length) {
    if (i + 1 < dayString.length && dayString.substring(i, i + 2) in dayMap) {
      days.push(dayMap[dayString.substring(i, i + 2)]);
      i += 2;
    } else if (dayString[i] in dayMap) {
      days.push(dayMap[dayString[i]]);
      i += 1;
    } else {
      i += 1;
    }
  }

  // Parse time range
  const [startStr, endStr] = timeRange.split('-');
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const startTime = parseTime(startStr);
  const endTime = parseTime(endStr);

  return { days, startTime, endTime };
}

// Format time from number to string
function formatTime(time: number): string {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Generate events for a specific month
export function generateEventsForMonth(
  year: number, 
  month: number, 
  courses: CourseForEvents[],
  courseColors?: Record<string, string>
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Color mapping to ensure Tailwind includes these classes
  const colorMap: { [key: string]: string } = {
    'bg-blue-500': 'bg-blue-100 border-blue-500',
    'bg-green-500': 'bg-green-100 border-green-500',
    'bg-purple-500': 'bg-purple-100 border-purple-500',
    'bg-orange-500': 'bg-orange-100 border-orange-500',
    'bg-red-500': 'bg-red-100 border-red-500',
    'bg-teal-500': 'bg-teal-100 border-teal-500',
    'bg-pink-500': 'bg-pink-100 border-pink-500',
    'bg-yellow-600': 'bg-yellow-100 border-yellow-600',
    'bg-indigo-500': 'bg-indigo-100 border-indigo-500',
    'bg-gray-600': 'bg-gray-100 border-gray-600',
    'bg-lime-600': 'bg-lime-100 border-lime-600',
  };

  // Use the courses provided by the caller
  // (caller is responsible for passing enrolled courses or filtered what-if courses)

  // Generate class events for each course
  courses.forEach(course => {
    if (!course.schedule) return;
    const scheduleInfo = parseSchedule(course.schedule);
    if (!scheduleInfo) return;

    const { days, startTime, endTime } = scheduleInfo;

    // Generate events for each day of the month that matches the schedule
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();

      if (days.includes(dayOfWeek)) {
        // All class events use school tag blue color
        const eventColor = 'bg-blue-100 border-blue-500';

        events.push({
          id: `${course.id}-${year}-${month}-${day}`,
          title: `${course.code} - Lecture`,
          date: date,
          time: formatTime(startTime),
          startTime: startTime,
          endTime: endTime,
          color: eventColor,
          location: `${course.instructor}`,
          type: 'class',
          description: course.description,
          courseId: course.id,
          tag: 'school' // NEW: Tag system
        });
      }
    }
  });

  return events;
}

// Predefined assignment events
export const assignmentEvents: CalendarEvent[] = [
  {
    id: 'assign-1',
    title: 'MATH 202 - Exam',
    date: new Date(2026, 0, 23),
    time: '2:00 PM',
    startTime: 14,
    endTime: 16,
    color: 'bg-blue-100 border-blue-500',
    location: 'Math Hall Room 105',
    type: 'event',
    courseId: '2',
    tag: 'school'
  },
  {
    id: 'assign-2',
    title: 'Study Group Meeting',
    date: new Date(2026, 0, 23),
    time: '4:00 PM',
    startTime: 16,
    endTime: 17.5,
    color: 'bg-purple-100 border-purple-500',
    location: 'Library Study Room 3',
    type: 'event',
    tag: 'personal'
  },
  {
    id: 'assign-3',
    title: 'ENG 250 - Essay Due',
    date: new Date(2026, 0, 27),
    time: '11:59 PM',
    startTime: 23,
    endTime: 23.983333,
    color: 'bg-blue-100 border-blue-500',
    type: 'event',
    courseId: '3',
    tag: 'school'
  }
];

// Get all events for a specific month
export function getAllEventsForMonth(
  year: number, 
  month: number, 
  courses: CourseForEvents[],
  courseColors?: Record<string, string>,
  isWhatIfMode?: boolean
): CalendarEvent[] {
  const classEvents = generateEventsForMonth(year, month, courses, courseColors);
  
  // If in What If Mode, exclude all predefined assignment events
  // What If Mode should only show class times, not assignments/events
  if (isWhatIfMode) {
    return classEvents;
  }
  
  // Normal mode: include predefined assignments for the month
  const relevantAssignments = assignmentEvents.filter(event => 
    event.date && event.date.getFullYear() === year && event.date.getMonth() === month
  );
  
  return [...classEvents, ...relevantAssignments];
}