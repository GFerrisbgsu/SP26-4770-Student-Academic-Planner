import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';
import type { CalendarEvent } from '~/utils/generateEvents';
import { getTagColor, suggestTag } from '~/utils/tagUtils';
import type { EventTag } from '~/utils/tagUtils';
import { TagSelector } from '~/components/TagSelector';
import type { Project } from '~/services/projectService';
import type { TodoList } from '~/services/todoListService';
import { updateEvent, createEvent } from '~/services/eventService';
import { userService } from '~/services/userService';

interface EditTaskFormProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: CalendarEvent) => Promise<void>; // Called after successful save with the event data
  initialEvent?: CalendarEvent; // For edit mode
  existingEvents: CalendarEvent[];
  projects?: Project[];
  todoLists?: TodoList[];
  defaultListId?: number;
}

export function EditTaskForm({
  mode,
  isOpen,
  onOpenChange,
  onSave,
  initialEvent,
  existingEvents,
  projects = [],
  todoLists = [],
  defaultListId,
}: EditTaskFormProps) {
  const [title, setTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState<EventTag>('personal');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>(defaultListId?.toString() || '');
  const [hasDueDate, setHasDueDate] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch enrolled courses when modal opens
  useEffect(() => {
    if (isOpen) {
      async function loadCourses() {
        try {
          const courses = await getEnrolledCourses();
          setEnrolledCourses(courses);
        } catch (error) {
          console.error('Failed to load enrolled courses:', error);
        }
      }
      loadCourses();
    }
  }, [isOpen]);

  // Initialize form with event data for edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialEvent) {
      setTitle(initialEvent.title);
      setSelectedTag(initialEvent.tag);
      setDescription(initialEvent.description || '');
      setLocation(initialEvent.location || '');
      setSelectedProject(initialEvent.projectId?.toString() || '');
      setSelectedListId(initialEvent.todoListId?.toString() || '');
      setDuration('60');

      if (initialEvent.date) {
        setHasDueDate(true);
        const dateStr = initialEvent.date instanceof Date
          ? initialEvent.date.toISOString().split('T')[0]
          : new Date(initialEvent.date).toISOString().split('T')[0];
        setDueDate(dateStr);

        if (initialEvent.startTime !== null && initialEvent.startTime !== undefined) {
          const hours = Math.floor(initialEvent.startTime);
          const minutes = Math.round((initialEvent.startTime - hours) * 60);
          setDueTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);

          // Calculate duration from start and end times
          if (initialEvent.endTime !== null && initialEvent.endTime !== undefined) {
            const durationHours = initialEvent.endTime - initialEvent.startTime;
            setDuration(Math.round(durationHours * 60).toString());
          }
        }
      } else {
        setHasDueDate(false);
        setDueDate('');
        setDueTime('');
      }

      // Extract course from title if it's a school event
      if (initialEvent.tag === 'school' && initialEvent.courseId) {
        setSelectedCourse(initialEvent.courseId);
      }
    } else if (isOpen && mode === 'create') {
      // Reset form for create mode
      setTitle('');
      setSelectedTag('personal');
      setSelectedCourse('');
      setSelectedProject('');
      setSelectedListId(defaultListId?.toString() || '');
      setHasDueDate(true);
      setDueDate('');
      setDueTime('');
      setDuration('60');
      setDescription('');
      setLocation('');
      setHasConflict(false);
      setConflictMessage('');
    }
  }, [isOpen, mode, initialEvent, defaultListId]);

  // Auto-fill due date when project with deadline is selected
  useEffect(() => {
    if (selectedProject && mode === 'create') {
      const project = projects.find(p => p.id === parseInt(selectedProject));
      if (project?.deadline) {
        setHasDueDate(true);
        setDueDate(project.deadline);
        if (project.deadlineTime) {
          setDueTime(project.deadlineTime);
        }
      }
    }
  }, [selectedProject, projects, mode]);

  if (!isOpen) return null;

  const checkForConflicts = (eventDate: Date, startTime: number, endTime: number): boolean => {
    // For edit mode, exclude the current event from conflict check
    const eventsToCheck =
      mode === 'edit' && initialEvent
        ? existingEvents.filter(e => e.id !== initialEvent.id)
        : existingEvents;

    const conflictingEvents = eventsToCheck.filter(event => {
      if (!event.date) return false;

      const existingDate = event.date instanceof Date ? event.date : new Date(event.date);

      if (
        existingDate.getDate() === eventDate.getDate() &&
        existingDate.getMonth() === eventDate.getMonth() &&
        existingDate.getFullYear() === eventDate.getFullYear()
      ) {
        return (
          event.startTime !== null &&
          event.endTime !== null &&
          startTime < event.endTime &&
          endTime > event.startTime
        );
      }
      return false;
    });

    if (conflictingEvents.length > 0) {
      const conflictNames = conflictingEvents.map(e => e.title).join(', ');
      setConflictMessage(`Time conflict with: ${conflictNames}`);
      return true;
    }

    return false;
  };

  const handleTimeChange = (newDate: string, newTime: string, newDuration: string) => {
    if (newDate && newTime) {
      const [year, month, day] = newDate.split('-').map(Number);
      const [hours, minutes] = newTime.split(':').map(Number);
      const eventDate = new Date(year, month - 1, day);
      const startTime = hours + minutes / 60;
      const durationHours = parseInt(newDuration) / 60;
      let endTime = startTime + durationHours;

      if (endTime > 23.983333) {
        endTime = 23.983333;
      }

      const conflict = checkForConflicts(eventDate, startTime, endTime);
      setHasConflict(conflict);
    } else {
      setHasConflict(false);
      setConflictMessage('');
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);

    if (dueTime) {
      const [hours] = dueTime.split(':').map(Number);
      const startTime = hours + 0;
      const isWeekend = dueDate ? new Date(dueDate).getDay() % 6 === 0 : false;
      const suggested = suggestTag(newTitle, startTime, isWeekend);
      setSelectedTag(suggested);
    }
  };

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    if (dueDate && dueTime) {
      handleTimeChange(dueDate, dueTime, newDuration);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert('Please enter a task title');
      return;
    }

    if (hasDueDate && (!dueDate || !dueTime)) {
      alert('Please enter both a date and time for the task');
      return;
    }

    if (selectedTag === 'school' && (!selectedCourse || selectedCourse === 'none')) {
      alert('Please select a course for school events');
      return;
    }

    const color = getTagColor(selectedTag);
    let eventData: Omit<CalendarEvent, 'id'>;

    if (hasDueDate && dueDate && dueTime) {
      const [year, month, day] = dueDate.split('-').map(Number);
      const [hours, minutes] = dueTime.split(':').map(Number);
      const eventDate = new Date(year, month - 1, day);
      const startTime = hours + minutes / 60;
      const durationHours = parseInt(duration) / 60;
      let endTime = startTime + durationHours;

      if (endTime > 23.983333) {
        endTime = 23.983333;
      }

      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

      const conflict = checkForConflicts(eventDate, startTime, endTime);

      if (conflict) {
        const proceed = window.confirm(
          `${conflictMessage}\n\nDo you want to add this event anyway?`
        );
        if (!proceed) return;
      }

      eventData = {
        title:
          selectedTag === 'school' && selectedCourse !== 'none' && selectedCourse
            ? `${enrolledCourses.find(c => c.id === selectedCourse)?.code} - ${title}`
            : title,
        date: eventDate,
        time: timeString,
        startTime: startTime,
        endTime: endTime,
        color: color,
        type: 'event',
        description: description,
        location: location || undefined,
        courseId:
          selectedTag === 'school' && selectedCourse && selectedCourse !== 'none'
            ? selectedCourse
            : undefined,
        projectId: selectedProject ? parseInt(selectedProject) : undefined,
        todoListId: selectedListId ? parseInt(selectedListId) : undefined,
        tag: selectedTag,
      };
    } else {
      eventData = {
        title:
          selectedTag === 'school' && selectedCourse !== 'none' && selectedCourse
            ? `${enrolledCourses.find(c => c.id === selectedCourse)?.code} - ${title}`
            : title,
        date: null,
        time: null,
        startTime: null,
        endTime: null,
        color: color,
        type: 'event',
        description: description,
        location: location || undefined,
        courseId:
          selectedTag === 'school' && selectedCourse && selectedCourse !== 'none'
            ? selectedCourse
            : undefined,
        projectId: selectedProject ? parseInt(selectedProject) : undefined,
        todoListId: selectedListId ? parseInt(selectedListId) : undefined,
        tag: selectedTag,
      };
    }

    try {
      setIsSaving(true);
      let createdOrUpdatedEvent: any;
      if (mode === 'edit' && initialEvent && 'id' in initialEvent) {
        // Update existing event
        const response = await updateEvent(parseInt(initialEvent.id as string), eventData);
        createdOrUpdatedEvent = { ...response, date: response.date ? new Date(response.date) : null };
      } else {
        // Create new event
        const user = await userService.getCurrentUser();
        if (user?.id) {
          const response = await createEvent(user.id, eventData);
          createdOrUpdatedEvent = { ...response, date: response.date ? new Date(response.date) : null };
        } else {
          throw new Error('User not authenticated');
        }
      }
      await onSave(createdOrUpdatedEvent);
      handleClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} event:`, error);
      alert(`Failed to ${mode === 'edit' ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const minDate = `${currentYear}-01-01`;

  const buttonText = mode === 'edit' ? 'Save Changes' : 'Add Event';
  const titleText = mode === 'edit' ? 'Edit Task' : 'Add Event';

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">{titleText}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title"
              required
            />
          </div>

          <TagSelector
            value={selectedTag}
            onValueChange={setSelectedTag}
            label="Category"
            required
            disabledTags={enrolledCourses.length === 0 ? ['school'] : []}
          />

          {selectedTag === 'school' && (
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a course...</option>
                {enrolledCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">School events must be associated with a course</p>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                Project (Optional)
              </label>
              <select
                id="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No project (standalone task)</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Assign this task to a project for better organization</p>
            </div>
          )}

          {todoLists.length > 0 && (
            <div>
              <label htmlFor="todoList" className="block text-sm font-medium text-gray-700 mb-1">
                To-Do List (Optional)
              </label>
              <select
                id="todoList"
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No list</option>
                {todoLists.map(list => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.taskCount} tasks)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Organize tasks by adding them to a list</p>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="hasDueDate"
              checked={hasDueDate}
              onChange={(e) => setHasDueDate(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="hasDueDate"
              className="text-sm font-medium text-gray-700 cursor-pointer select-none"
            >
              This task has a specific due date and time
            </label>
          </div>

          {hasDueDate && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      handleTimeChange(e.target.value, dueTime, duration);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={minDate}
                  />
                </div>

                <div>
                  <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    id="dueTime"
                    value={dueTime}
                    onChange={(e) => {
                      setDueTime(e.target.value);
                      handleTimeChange(dueDate, e.target.value, duration);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Optional)
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="300">5 hours</option>
                  <option value="360">6 hours</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How long will this event take?</p>
              </div>
            </>
          )}

          {!hasDueDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📌 This task can be completed anytime (e.g., "do laundry", "clean room")
              </p>
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a location (optional)"
            />
          </div>

          {hasConflict && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <div className="font-medium">Time Conflict Detected</div>
                <div className="text-red-600 mt-1">{conflictMessage}</div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
