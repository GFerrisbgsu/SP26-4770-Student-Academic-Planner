import { useState, useEffect } from 'react';
import { Calendar } from './Calendar';
import { ToDoSidebar } from './ToDoSidebar';
import { AddEventModal } from './AddEventModal';
import { getAllEventsForMonth, assignmentEvents } from '~/utils/generateEvents';
import type { CalendarEvent, CourseForEvents } from '~/utils/generateEvents';
import { userService } from '~/services/userService';
import { getUserProjects } from '~/services/projectService';
import type { Project } from '~/services/projectService';

interface CalendarViewProps {
  customEvents: CalendarEvent[];
  assignmentTasks: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<boolean | { success: boolean; eventId?: number }>;
  onRemoveEvent: (eventId: string) => Promise<void>;
  courseColors: Record<string, string>;
  onCourseColorChange: (courseId: string, newColor: string) => void;
  isWhatIfMode: boolean;
  whatIfCourseIds: string[];
  onToggleWhatIfMode: () => void;
  onAddWhatIfCourse: (courseId: string) => void;
  onRemoveWhatIfCourse: (courseId: string) => void;
  onClearWhatIf: () => void;
  onEventUpdate?: () => Promise<void>; // Optional callback to notify parent of event changes (async to allow refetch)
  refreshKey?: number; // Optional key to trigger refresh from parent
  enrolledCourses: CourseForEvents[]; // Courses from API (enrolled)
  allCourses: CourseForEvents[]; // All courses from API (for What-If mode)
}

export function CalendarView({ 
  customEvents, 
  assignmentTasks,
  onAddEvent, 
  onRemoveEvent, 
  courseColors, 
  onCourseColorChange, 
  isWhatIfMode, 
  whatIfCourseIds,
  onToggleWhatIfMode,
  onAddWhatIfCourse,
  onRemoveWhatIfCourse,
  onClearWhatIf,
  onEventUpdate,
  refreshKey,
  enrolledCourses,
  allCourses
}: CalendarViewProps) {
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const currentUser = userService.getCurrentUser();
  const userId = currentUser?.id;

  // Fetch projects from backend
  useEffect(() => {
    async function fetchProjects() {
      try {
        if (userId) {
          const userProjects = await getUserProjects(userId);
          setProjects(userProjects);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    }
    if (userId) {
      fetchProjects();
    }
  }, [userId, refreshTrigger, refreshKey]);

  // Convert projects with deadlines to calendar events
  const projectDeadlineEvents: CalendarEvent[] = projects
    .filter(project => project.deadline && !project.completed)
    .map(project => {
      // Parse deadline date in local time to avoid timezone issues
      const [year, month, day] = project.deadline!.split('-').map(Number);
      const deadlineDate = new Date(year, month - 1, day);
      const [hours, minutes] = project.deadlineTime ? project.deadlineTime.split(':').map(Number) : [23, 59];
      const timeInMinutes = hours * 60 + minutes; // Convert to minutes from midnight
      
      return {
        id: `project-deadline-${project.id}`,
        title: `📁 ${project.name} Deadline`,
        date: deadlineDate,
        time: project.deadlineTime || '23:59',
        startTime: timeInMinutes,
        endTime: timeInMinutes + 30, // 30 minute duration for deadline events
        type: 'event' as const,
        tag: 'personal' as const,
        color: project.color,
        description: project.description || `Deadline for project: ${project.name}`,
        location: undefined,
        courseId: undefined,
        completed: false,
        projectId: undefined
      };
    });

  // Callback to trigger event refresh
  const handleEventUpdate = async () => {
    setRefreshTrigger(prev => prev + 1);
    if (onEventUpdate) {
      try {
        await onEventUpdate(); // Notify parent component
      } catch (err) {
        console.error('Error in onEventUpdate:', err);
      }
    }
  };

  // Get events for multiple months for proper conflict detection
  const currentDate = new Date();
  const existingEvents: CalendarEvent[] = [];
  
  // Get events for current month and next 12 months for conflict detection
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
    existingEvents.push(...getAllEventsForMonth(date.getFullYear(), date.getMonth(), enrolledCourses, courseColors));
  }
  
  // Add custom events from props (includes backend events converted from API)
  existingEvents.push(...customEvents);

  // Get predefined assignment events for all upcoming months and combine with custom events for ToDoSidebar
  const allPredefinedEvents: CalendarEvent[] = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
    const monthEvents = assignmentEvents.filter(event =>
      event.date && event.date.getFullYear() === date.getFullYear() &&
      event.date.getMonth() === date.getMonth()
    );
    allPredefinedEvents.push(...monthEvents);
  }

  // Filter events for ToDoSidebar - include custom events from backend
  const eventsForToDoList = isWhatIfMode 
    ? [
        // In What If Mode, exclude ALL predefined events
        // Only show custom events that have a courseId in whatIfCourseIds
        ...customEvents.filter(event => 
          event.courseId && whatIfCourseIds.includes(event.courseId)
        )
      ]
    : [...allPredefinedEvents, ...customEvents, ...assignmentTasks];

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Main Content Area - Side by Side */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Calendar Section - Left Side */}
        <div className="flex-1 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          <Calendar 
            customEvents={isWhatIfMode ? [] : [...customEvents, ...assignmentTasks, ...projectDeadlineEvents]}
            courseColors={courseColors} 
            onCourseColorChange={onCourseColorChange}
            whatIfCourseIds={isWhatIfMode ? whatIfCourseIds : undefined}
            onAddEvent={() => {setIsAddEventModalOpen(true);}}
            courses={isWhatIfMode && whatIfCourseIds
              ? allCourses.filter(c => whatIfCourseIds.includes(c.id))
              : enrolledCourses}
          />
        </div>

        {/* To-Do List Section - Right Side */}
        <div className="w-full lg:w-auto h-full bg-gray-50 overflow-hidden flex flex-col">
          <ToDoSidebar 
            events={eventsForToDoList} 
            onRemoveEvent={onRemoveEvent} 
            onAddEvent={onAddEvent}
            onEventUpdate={handleEventUpdate}
            isInline={window.innerWidth < 1024} // Show inline on small screens
            existingEvents={existingEvents}
          />

        </div>
      </div>

      <AddEventModal
      isOpen={isAddEventModalOpen}
      onClose={() => setIsAddEventModalOpen(false)}
      onAddEvent={async (event) => {
        const result = await onAddEvent(event);
        return typeof result === 'boolean' ? result : result.success;
      }}
      onEventUpdate={handleEventUpdate}
      existingEvents={existingEvents}
      />

    </div>
  );
}
