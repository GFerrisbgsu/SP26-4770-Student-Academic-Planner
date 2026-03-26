import type { Assignment } from '~/services/assignmentService';
import type { CalendarEvent } from '~/utils/generateEvents';

function formatDueTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function mapAssignmentsToCalendarTasks(assignments: Assignment[]): CalendarEvent[] {
  return assignments.map((assignment) => {
    const dueDateTime = new Date(assignment.dueDate);
    const dueDate = new Date(
      dueDateTime.getFullYear(),
      dueDateTime.getMonth(),
      dueDateTime.getDate()
    );
    const dueStartTime = dueDateTime.getHours() + dueDateTime.getMinutes() / 60;

    return {
      id: `assignment-${assignment.id}`,
      assignmentId: assignment.id,
      source: 'assignment',
      title: assignment.title,
      date: dueDate,
      time: formatDueTime(dueDateTime),
      startTime: dueStartTime,
      endTime: dueStartTime + 0.5,
      color: 'bg-blue-100 border-blue-500',
      type: 'task',
      description: assignment.description,
      courseId: assignment.courseId,
      tag: 'school',
      completed: assignment.status === 'completed',
    };
  });
}
