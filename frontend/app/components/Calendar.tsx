import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { getAllEventsForMonth } from '~/utils/generateEvents';
import type { CalendarEvent, CourseForEvents } from '~/utils/generateEvents';
import { getAllTags, getTagInfo, useCustomTags, tagConfig } from '~/utils/tagUtils';
import type { EventTag } from '~/utils/tagUtils';

interface CalendarProps {
  customEvents: CalendarEvent[];
  courseColors: Record<string, string>;
  onCourseColorChange: (courseId: string, newColor: string) => void;
  whatIfCourseIds?: string[];
  onAddEvent?: () => void;
  courses: CourseForEvents[]; // Courses to generate calendar events from (already filtered for mode)
}

export function Calendar({ customEvents, courseColors, whatIfCourseIds, onAddEvent, courses }: CalendarProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedTags, setSelectedTags] = useState<Set<EventTag>>(new Set(getAllTags()));
  const { customTags } = useCustomTags();
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set()); // tracks collapsed state per date-project
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const yearPickerRef = useRef<HTMLDivElement>(null);
  
  // Check if there are month/year params from URL
  const urlMonth = searchParams.get('month');
  const urlYear = searchParams.get('year');
  
  // Initialize with URL params if available, otherwise default to January 2026
  const initialDate = (urlMonth && urlYear) 
    ? new Date(parseInt(urlYear), parseInt(urlMonth), 1)
    : new Date();
    
  const [currentDate, setCurrentDate] = useState(initialDate);
  
  // Update current date when URL params change
  useEffect(() => {
    if (urlMonth && urlYear) {
      setCurrentDate(new Date(parseInt(urlYear), parseInt(urlMonth), 1));
    }
  }, [urlMonth, urlYear]);

  // Sync selectedTags with all tags (predefined + custom) whenever:
  // 1. Custom tags are added/changed in this component
  // 2. New events are added (which might use new custom tags from tagSelector)
  useEffect(() => {
    setSelectedTags(new Set(getAllTags()));
  }, [customTags, customEvents]);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
      if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
        setShowYearPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the start of the current week (Sunday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (day: Date) => {
    const allEvents = getAllEventsForMonth(day.getFullYear(), day.getMonth(), courses, courseColors, !!whatIfCourseIds);
    
    // Filter custom events for this month
    const relevantCustomEvents = customEvents.filter(event => 
      event.date && event.date.getFullYear() === day.getFullYear() &&
      event.date.getMonth() === day.getMonth()
    );
    
    // Combine, filter for the specific day and selected tags, then sort by start time.
    return [...allEvents, ...relevantCustomEvents]
      .filter(event => 
      event.date && event.date.getDate() === day.getDate() &&
      event.date.getMonth() === day.getMonth() &&
      event.date.getFullYear() === day.getFullYear() &&
      selectedTags.has(event.tag) // Filter by selected tags
      )
      .sort((a, b) => {
        // Timed events come first, untimed events go to the end of the day.
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
      });
  };



  // Helper to extract projectId from project deadline event
  const getProjectIdFromDeadline = (eventId: string | number): number | null => {
    const idStr = String(eventId);
    const match = idStr.match(/^project-deadline-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Organize events by project and standalone
  const organizeEventsByProject = (events: CalendarEvent[], date: Date) => {
    const projectDeadlines: CalendarEvent[] = [];
    const projectTasks: Map<number, CalendarEvent[]> = new Map();
    const standaloneEvents: CalendarEvent[] = [];

    // First, identify which projects have deadlines on this date
    const projectIdsWithDeadlines = new Set<number>();
    events.forEach(event => {
      const eventId = String(event.id);
      if (eventId.startsWith('project-deadline-')) {
        projectDeadlines.push(event);
        const projectId = getProjectIdFromDeadline(eventId);
        if (projectId) {
          projectIdsWithDeadlines.add(projectId);
        }
      }
    });

    // Now organize other events
    events.forEach(event => {
      const eventId = String(event.id);
      if (eventId.startsWith('project-deadline-')) {
        // Already handled above
        return;
      }
      
      // Only group under project if the project deadline is also on this date
      if (event.projectId && projectIdsWithDeadlines.has(event.projectId)) {
        const tasks = projectTasks.get(event.projectId) || [];
        tasks.push(event);
        projectTasks.set(event.projectId, tasks);
      } else {
        // Task has a different date than project deadline, or no project association
        standaloneEvents.push(event);
      }
    });

    return { projectDeadlines, projectTasks, standaloneEvents };
  };

  // Toggle project collapse state
  const toggleProjectCollapse = (date: Date, projectId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const key = `${date.toDateString()}-${projectId}`;
    setCollapsedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isProjectCollapsed = (date: Date, projectId: number): boolean => {
    const key = `${date.toDateString()}-${projectId}`;
    return collapsedProjects.has(key);
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  };

  // Generate week view
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekDates.push(date);
  }

  // Format date range for header
  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {viewMode === 'week' ? formatWeekRange() : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {viewMode === 'week' ? 'Week View' : 'Month View'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              {/* Month Picker */}
              <div className="relative" ref={monthPickerRef}>
                <button
                  onClick={() => {
                    setShowMonthPicker(!showMonthPicker);
                    setShowYearPicker(false);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Select month"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {monthNames[currentDate.getMonth()]}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showMonthPicker && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 grid grid-cols-3 gap-1 p-2 w-80">
                    {monthNames.map((month, index) => (
                      <button
                        key={month}
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setMonth(index);
                          setCurrentDate(newDate);
                          setShowMonthPicker(false);
                        }}
                        className={`px-2 py-2 text-sm rounded hover:bg-blue-50 transition-colors whitespace-nowrap ${
                          currentDate.getMonth() === index ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Picker */}
              <div className="relative" ref={yearPickerRef}>
                <button
                  onClick={() => {
                    setShowYearPicker(!showYearPicker);
                    setShowMonthPicker(false);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Select year"
                >
                  {currentDate.getFullYear()}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showYearPicker && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-1 p-2 w-64">
                      {Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i).map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setFullYear(year);
                            setCurrentDate(newDate);
                            setShowYearPicker(false);
                          }}
                          className={`px-3 py-2 text-sm rounded hover:bg-blue-50 transition-colors ${
                            currentDate.getFullYear() === year ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium"
                aria-label="Toggle view mode"
              >
                {viewMode === 'week' ? 'Month' : 'Week'}
              </button>
              {viewMode === 'week' && (
                <>
                  <button
                    onClick={previousWeek}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextWeek}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Next week"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}
              {viewMode === 'month' && (
                <>
                  <button
                    onClick={() => {
                      const prevMonth = new Date(currentDate);
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      setCurrentDate(prevMonth);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      const nextMonth = new Date(currentDate);
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setCurrentDate(nextMonth);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}
            </div>
            {onAddEvent && (
              <button
                onClick={onAddEvent}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        </div>
        {/* Tag Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Filter:</span>
          {getAllTags().map(tag => {
            const isSelected = selectedTags.has(tag);
            const info = getTagInfo(tag);
            return (
              <button
                key={tag}
                onClick={() => {
                  const newTags = new Set(selectedTags);
                  if (newTags.has(tag)) {
                    newTags.delete(tag);
                  } else {
                    newTags.add(tag);
                  }
                  setSelectedTags(newTags);
                }}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  isSelected ? info?.activeClass : info?.inactiveClass
                }`}
              >
                {info?.label || tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'week' ? (
          <>
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {weekDates.map((date, index) => {
                const today = isToday(date);
                return (
                  <Link
                    key={index}
                    to={`/timeline/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
                    className={`p-3 text-center border-r border-gray-200 last:border-r-0 hover:bg-gray-100 transition-colors cursor-pointer ${
                      today ? 'bg-blue-50' : ''
                    }`}
                    title={`View timeline for ${monthNames[date.getMonth()]} ${date.getDate()}`}
                  >
                    <div className="text-xs text-gray-500 uppercase">{weekDays[date.getDay()]}</div>
                    <div className={`text-lg font-semibold mt-1 ${today ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* Event Grid */}
            <div className="grid grid-cols-7">
              {weekDates.map((date, index) => {
                const events = getEventsForDate(date);
                const { projectDeadlines, projectTasks, standaloneEvents } = organizeEventsByProject(events, date);
                const today = isToday(date);
                const timelinePath = `/timeline/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                
                // Calculate display limit
                const maxDisplayItems = 5;
                let displayedCount = 0;
                
                return (
                  <div
                    key={index}
                    className={`min-h-[200px] p-3 border-r border-b border-gray-200 last:border-r-0 ${
                      today ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                    onClick={() => navigate(timelinePath)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(timelinePath);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={`View timeline for ${monthNames[date.getMonth()]} ${date.getDate()}`}
                  >
                    <div className="h-full space-y-2">
                        {/* Render project deadlines with their tasks */}
                        {projectDeadlines.map(projectDeadline => {
                          const projectId = getProjectIdFromDeadline(projectDeadline.id);
                          if (!projectId) return null;
                          
                          const isCollapsed = isProjectCollapsed(date, projectId);
                          const tasksForProject = projectTasks.get(projectId) || [];
                          
                          if (displayedCount >= maxDisplayItems) return null;
                          displayedCount++;
                          
                          return (
                            <div key={projectDeadline.id} className="space-y-1">
                              {/* Project Deadline */}
                              <Link
                                to={`/event/${projectDeadline.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // If clicking the chevron, toggle collapse instead of navigating
                                  const target = e.target as HTMLElement;
                                  if (target.closest('.chevron-toggle')) {
                                    e.preventDefault();
                                    toggleProjectCollapse(date, projectId, e);
                                  }
                                }}
                                className={`block text-xs p-2 rounded-lg border-l-4 hover:shadow-md transition-all ${projectDeadline.color} bg-opacity-20`}
                              >
                                <div className="flex items-center gap-1">
                                  <button
                                    className="chevron-toggle hover:bg-black/5 rounded p-0.5"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleProjectCollapse(date, projectId, e);
                                    }}
                                  >
                                    <ChevronDown 
                                      className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                                    />
                                  </button>
                                  <div className="font-semibold truncate flex-1">{projectDeadline.title}</div>
                                  {tasksForProject.length > 0 && (
                                    <span className="text-xs text-gray-500">({tasksForProject.length})</span>
                                  )}
                                </div>
                                <div className="mt-1 ml-4 text-gray-600">
                                  {projectDeadline.time}
                                </div>
                              </Link>
                              
                              {/* Project Tasks (collapsible) */}
                              {!isCollapsed && tasksForProject.map(task => {
                                if (displayedCount >= maxDisplayItems) return null;
                                displayedCount++;
                                return (
                                  <Link
                                    key={task.id}
                                    to={`/event/${task.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`block text-xs p-2 rounded-lg border-l-4 ml-4 hover:shadow-md transition-all ${task.color} bg-opacity-20`}
                                  >
                                    <div className="font-medium truncate">{task.title}</div>
                                    <div className="mt-1 text-gray-600">
                                      {task.time}
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          );
                        })}
                        
                        {/* Render standalone events */}
                        {standaloneEvents.slice(0, maxDisplayItems - displayedCount).map(event => {
                          const tagInfo = getTagInfo(event.tag);
                          return (
                            <Link
                              key={event.id}
                              to={`/event/${event.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className={`block text-xs p-2 rounded-lg border-l-4 hover:shadow-md transition-all ${event.color} bg-opacity-20`}
                            >
                              {/* tag badge */}
                              <div className="flex items-center gap-1 mb-1">
                                <span className={`text-[10px] px-1 py-0.5 rounded ${tagInfo?.lightColor || ''} ${tagInfo?.textColor || ''}`}> 
                                  {tagInfo?.label || event.tag}
                                </span>
                              </div>
                              <div className="font-semibold truncate">{event.title}</div>
                              <div className="mt-1 text-gray-600">
                                {event.time}
                              </div>
                            </Link>
                          );
                        })}
                        
                      {events.length > maxDisplayItems && (
                        <Link
                          to={timelinePath}
                          onClick={(e) => e.stopPropagation()}
                          className="block text-xs text-blue-600 hover:text-blue-800 px-2 py-1 hover:underline"
                        >
                          + {events.length - maxDisplayItems} more
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Month View Grid */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {weekDays.map((day, idx) => (
                <div key={idx} className="p-3 text-center border-r border-gray-200 last:border-r-0 text-xs text-gray-500 uppercase">
                  {day}
                </div>
              ))}
            </div>
            {/* Month Days Grid */}
            <div className="grid grid-cols-7">
              {(() => {
                const days: React.ReactElement[] = [];
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startWeekDay = firstDay.getDay();
                const totalDays = lastDay.getDate();
                // Fill empty days before first day
                for (let i = 0; i < startWeekDay; i++) {
                  days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border-r border-b border-gray-200 last:border-r-0" />);
                }
                // Fill actual days
                for (let d = 1; d <= totalDays; d++) {
                  const date = new Date(year, month, d);
                  const events = getEventsForDate(date);
                  const { projectDeadlines, projectTasks, standaloneEvents } = organizeEventsByProject(events, date);
                  const today = isToday(date);
                  
                  // Calculate display limit
                  const maxDisplayItems = 3;
                  let displayedCount = 0;
                  
                  days.push(
                    <div
                      key={d}
                      className={`min-h-[120px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                        today ? 'bg-blue-50/50' : 'bg-white'
                      }`}
                    >
                      <Link
                        to={`/timeline/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
                        className="block h-full hover:bg-gray-50 transition-colors cursor-pointer"
                        title={`View timeline for ${monthNames[month]} ${d}`}
                      >
                        <div className="space-y-1">
                          <div className={`text-xs font-semibold ${today ? 'text-blue-600' : 'text-gray-900'}`}>{d}</div>
                          
                          {/* Render project deadlines with their tasks */}
                          {projectDeadlines.map(projectDeadline => {
                            const projectId = getProjectIdFromDeadline(projectDeadline.id);
                            if (!projectId) return null;
                            
                            const isCollapsed = isProjectCollapsed(date, projectId);
                            const tasksForProject = projectTasks.get(projectId) || [];
                            
                            if (displayedCount >= maxDisplayItems) return null;
                            displayedCount++;
                            
                            return (
                              <div key={projectDeadline.id} className="space-y-1">
                                {/* Project Deadline */}
                                <div
                                  onClick={(e) => toggleProjectCollapse(date, projectId, e)}
                                  className={`text-xs p-1 rounded border-l-4 flex items-center gap-1 cursor-pointer hover:shadow-sm transition-all ${projectDeadline.color} bg-opacity-20`}
                                  title={`${projectDeadline.title} (${projectDeadline.time})\n${projectDeadline.tag ? tagConfig[projectDeadline.tag]?.label : ''}`}
                                >
                                  <ChevronDown 
                                    className={`w-3 h-3 flex-shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                                  />
                                  {projectDeadline.courseId && (
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: courseColors[projectDeadline.courseId] || projectDeadline.color }} />
                                  )}
                                  <div className="truncate flex-1" style={{ maxWidth: 80 }}>{projectDeadline.title}</div>
                                  {tasksForProject.length > 0 && (
                                    <span className="text-[10px] text-gray-500 flex-shrink-0">({tasksForProject.length})</span>
                                  )}
                                  <div className="ml-auto text-[10px] flex-shrink-0 text-gray-600">{projectDeadline.time}</div>
                                </div>
                                
                                {/* Project Tasks (collapsible) */}
                                {!isCollapsed && tasksForProject.map(task => {
                                  if (displayedCount >= maxDisplayItems) return null;
                                  displayedCount++;
                                  return (
                                    <div
                                      key={task.id}
                                      className={`text-xs p-1 rounded border-l-4 flex items-center gap-1 ml-4 ${task.color} bg-opacity-20`}
                                      title={`${task.title} (${task.time})\n${task.tag ? tagConfig[task.tag]?.label : ''}`}
                                    >
                                      {task.courseId && (
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: courseColors[task.courseId] || task.color }} />
                                      )}
                                      <div className="truncate" style={{ maxWidth: 60 }}>{task.title}</div>
                                      <div className="ml-auto text-[10px] text-gray-600">{task.time}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                          
                          {/* Render standalone events */}
                          {standaloneEvents.slice(0, maxDisplayItems - displayedCount).map(event => {
                            return (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded border-l-4 flex items-center gap-1 ${event.color} bg-opacity-20`}
                                title={`${event.title} (${event.time})\n${event.tag ? tagConfig[event.tag]?.label : ''}`}
                              >
                                {event.courseId && (
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: courseColors[event.courseId] || event.color }} />
                                )}
                                <div className="truncate" style={{ maxWidth: 80 }}>{event.title}</div>
                                <div className="ml-auto text-[10px] text-gray-600">{event.time}</div>
                              </div>
                            );
                          })}
                          
                          {events.length > maxDisplayItems && (
                            <div className="text-xs text-blue-600 px-2 py-1">
                              + {events.length - maxDisplayItems} more
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                }
                // Fill empty days after last day
                const totalCells = startWeekDay + totalDays;
                const extraCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                for (let i = 0; i < extraCells; i++) {
                  days.push(<div key={`empty-end-${i}`} className="min-h-[120px] bg-gray-50 border-r border-b border-gray-200 last:border-r-0" />);
                }
                return days;
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
