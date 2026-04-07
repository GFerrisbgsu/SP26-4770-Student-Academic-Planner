import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ChevronLeft, ChevronRight, AlertTriangle, Briefcase, Filter } from 'lucide-react';
import { getAllEventsForMonth } from '~/utils/generateEvents';
import type { CalendarEvent, CourseForEvents } from '~/utils/generateEvents';
import { getTagInfo, tagConfig } from '~/utils/tagUtils';
import type { Project } from '~/services/projectService';
// ...existing code...

interface TimelinePageProps {
  customEvents: CalendarEvent[];
  courseColors: Record<string, string>;
  isWhatIfMode?: boolean;
  whatIfCourseIds?: string[];
  courses: CourseForEvents[]; // Courses from API (enrolled courses)
  projects?: Project[]; // User projects for displaying project badges
}

export function TimelinePage({ customEvents, courseColors, isWhatIfMode, whatIfCourseIds, courses, projects = [] }: TimelinePageProps) {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | 'all'>('all');

  if (!date) {
    return <div>Invalid date</div>;
  }

  const [year, month, day] = date.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);

  // Helper to get project by ID
  const getProjectById = (projectId: number): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };
  
  // Get all events for the month and filter for this specific day
  // Pass whatIfCourseIds if in What If Mode to filter events
  const allEvents = getAllEventsForMonth(
    year, 
    month - 1, 
    courses,
    courseColors, 
    isWhatIfMode
  );
  
  // Include custom events for this day only if not in What If Mode
  const relevantCustomEvents = isWhatIfMode 
    ? [] 
    : customEvents.filter(event => 
        event.date && event.date.getFullYear() === year &&
        event.date.getMonth() === month - 1 &&
        event.date.getDate() === day
      );
  
  // Combine and filter events for this day
  let events = [...allEvents, ...relevantCustomEvents].filter(event => 
    event.date && event.date.getDate() === day &&
    event.date.getMonth() === month - 1 &&
    event.date.getFullYear() === year
  );

  // Apply project filter if a specific project is selected
  if (selectedProjectFilter !== 'all') {
    events = events.filter(event => event.projectId === selectedProjectFilter);
  }

  const compareEventsByTime = (a: CalendarEvent, b: CalendarEvent): number => {
    const aStart = a.startTime ?? Number.POSITIVE_INFINITY;
    const bStart = b.startTime ?? Number.POSITIVE_INFINITY;
    if (aStart !== bStart) {
      return aStart - bStart;
    }

    const aEnd = a.endTime ?? Number.POSITIVE_INFINITY;
    const bEnd = b.endTime ?? Number.POSITIVE_INFINITY;
    if (aEnd !== bEnd) {
      return aEnd - bEnd;
    }

    const titleCompare = a.title.localeCompare(b.title);
    if (titleCompare !== 0) {
      return titleCompare;
    }

    return String(a.id).localeCompare(String(b.id));
  };

  events = [...events].sort(compareEventsByTime);

  // Check if two events have overlapping times
  const eventsConflict = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
    // Events without times cannot conflict
    if (event1.startTime === null || event1.endTime === null || 
        event2.startTime === null || event2.endTime === null) {
      return false;
    }
    return (event1.startTime < event2.endTime && event1.endTime > event2.startTime);
  };

  // Find conflicting events for this day
  const getConflictingEventIds = (): Set<string> => {
    const conflictingIds = new Set<string>();
    
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (eventsConflict(events[i], events[j])) {
          conflictingIds.add(events[i].id);
          conflictingIds.add(events[j].id);
        }
      }
    }
    
    return conflictingIds;
  };

  const conflictingEventIds = getConflictingEventIds();
  const hasConflicts = conflictingEventIds.size > 0;

  // Compute column layout for overlapping events
  const eventLayout = (() => {
    const layout = new Map<string, { column: number; totalColumns: number }>();
    // Group events that mutually overlap into clusters
    const clusters: CalendarEvent[][] = [];
    const assigned = new Set<string>();

    for (const event of events) {
      if (assigned.has(event.id) || event.startTime === null) continue;
      const cluster = [event];
      assigned.add(event.id);
      // Find all events that transitively overlap with this cluster
      let changed = true;
      while (changed) {
        changed = false;
        for (const other of events) {
          if (assigned.has(other.id) || other.startTime === null) continue;
          if (cluster.some(c => eventsConflict(c, other))) {
            cluster.push(other);
            assigned.add(other.id);
            changed = true;
          }
        }
      }
      clusters.push(cluster);
    }

    for (const cluster of clusters) {
      if (cluster.length <= 1) {
        if (cluster.length === 1) layout.set(cluster[0].id, { column: 0, totalColumns: 1 });
        continue;
      }
      // Sort cluster events deterministically so overlap columns remain stable after edits.
      cluster.sort(compareEventsByTime);
      const columns: CalendarEvent[] = []; // tracks last event in each column
      for (const ev of cluster) {
        let placed = false;
        for (let col = 0; col < columns.length; col++) {
          if (!eventsConflict(columns[col], ev)) {
            columns[col] = ev;
            layout.set(ev.id, { column: col, totalColumns: 0 }); // totalColumns set later
            placed = true;
            break;
          }
        }
        if (!placed) {
          layout.set(ev.id, { column: columns.length, totalColumns: 0 });
          columns.push(ev);
        }
      }
      // Set totalColumns for all events in this cluster
      const totalCols = columns.length;
      for (const ev of cluster) {
        const l = layout.get(ev.id)!;
        l.totalColumns = totalCols;
      }
    }
    return layout;
  })();

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const navigateDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    const newDateString = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`;
    navigate(`/timeline/${newDateString}`);
  };

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    
    // Special handling for 11:59 PM
    if (h === 23 && m === 59) {
      return '11:59 PM';
    }
    
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  // Generate hours from 6 AM to 11 PM (includes the 11 PM hour which goes to 11:59 PM)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Top Navigation */}
      {/* Side Navigation Bar handled by root layout */}
      
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold mb-1">Day Schedule</h1>
              <p className="text-gray-600">{formatDate(selectedDate)}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigateDay(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateDay(1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Project Filter */}
          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label htmlFor="project-filter" className="text-sm font-medium text-gray-700">
                Filter by Project:
              </label>
              <select
                id="project-filter"
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {selectedProjectFilter !== 'all' && (
                <button
                  onClick={() => setSelectedProjectFilter('all')}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative">
            {hours.map((hour) => {
              // Get all events starting in this hour
              const hourEvents = events.filter(event => 
                event.startTime !== null && event.endTime !== null && Math.floor(event.startTime) === hour
              );

              // Calculate columns for overlapping events
              const getEventColumns = (eventsInHour: CalendarEvent[]) => {
                const columns: CalendarEvent[][] = [];
                
                eventsInHour.forEach(event => {
                  // Find first column where this event doesn't overlap
                  let placed = false;
                  for (let col of columns) {
                    const overlaps = col.some(e => 
                      e.startTime! < event.endTime! && e.endTime! > event.startTime!
                    );
                    if (!overlaps) {
                      col.push(event);
                      placed = true;
                      break;
                    }
                  }
                  // If no column found, create new one
                  if (!placed) {
                    columns.push([event]);
                  }
                });
                
                return columns;
              };

              const columns = getEventColumns(hourEvents);
              const numColumns = columns.length;

              return (
                <div key={hour} className="flex border-b border-gray-100 last:border-b-0">
                  {/* Time label */}
                  <div className="w-24 flex-shrink-0 p-4 text-sm text-gray-500 border-r border-gray-200">
                    {formatTime(hour)}
                  </div>
                  
                  {/* Event area */}
                  <div className="flex-1 relative min-h-[80px]">
                    {columns.map((column, colIndex) => 
                      column.map(event => {
                        const duration = event.endTime! - event.startTime!;
                        const height = duration * 80; // 80px per hour
                        const minutesFromHourStart = (event.startTime! - Math.floor(event.startTime!)) * 60;
                        const topOffset = (minutesFromHourStart / 60) * 80; // Convert minutes to pixels
                        const isConflicting = conflictingEventIds.has(event.id);
                        const isAssignmentTask = event.source === 'assignment' || event.type === 'task';
                        const associatedProject = event.projectId ? getProjectById(event.projectId) : undefined;
                        const destination = isAssignmentTask && event.courseId
                          ? `/course/${event.courseId}?tab=assignments`
                          : `/event/${event.id}`;
                        
                        // Calculate position based on column
                        const widthPercent = 100 / numColumns;
                        const leftPercent = (colIndex * widthPercent);
                        
                        return (
                          <Link
                            key={event.id}
                            to={destination}
                            className={`absolute rounded-lg border-l-4 px-3 py-2 cursor-pointer hover:shadow-md transition-shadow ${
                              isConflicting ? 'bg-red-50 border-red-500' : event.color
                            }`}
                            style={{ 
                              height: `${height}px`, 
                              top: `${topOffset}px`,
                              left: `calc(${leftPercent}% + 8px)`,
                              width: `calc(${widthPercent}% - 16px)`
                            }}
                          >
                            <div className={`font-semibold flex items-center gap-2 text-sm`}>
                              {isConflicting && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                              {associatedProject && <Briefcase className="w-4 h-4 flex-shrink-0" />}
                              <span className="flex-1 truncate">{event.title}</span>
                            </div>
                            {associatedProject && (
                              <div className={`text-xs flex items-center gap-1 mt-1 ${
                                isConflicting ? 'text-red-600' : 'opacity-70'
                              }`}>
                                <span className="font-medium">Project:</span>
                                <span className="truncate">{associatedProject.name}</span>
                              </div>
                            )}
                            <div className={`text-sm ${isConflicting ? 'text-red-600' : 'opacity-80'}`}>
                              {isAssignmentTask
                                ? `Due ${formatTime(event.startTime!)}`
                                : `${formatTime(event.startTime!)} - ${formatTime(event.endTime!)}`}
                            </div>
                            {event.location && (
                              <div className={`text-sm truncate ${isConflicting ? 'text-red-600' : 'opacity-70'}`}>{event.location}</div>
                            )}
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {events.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            No events scheduled for this day
          </div>
        )}
        
        {hasConflicts && (
          <div className="mt-4 text-center text-red-500">
            <AlertTriangle className="w-5 h-5 inline-block mr-2" />
            There are conflicting events on this day
          </div>
        )}
      </div>
    </div>
  );
}
