import { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

import { Resizable } from 're-resizable';
import { Circle, CheckCircle2, Plus, Trash2, FolderOpen, ChevronDown, ChevronRight, Info, MapPin, FileText, Edit2, FolderPlus, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CalendarEvent } from '~/utils/generateEvents';
import { getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';
import { getTagInfo, getAllTags, useCustomTags, tagConfig } from '~/utils/tagUtils';
import type { EventTag } from '~/utils/tagUtils';
import { AddEventModal } from './AddEventModal';
import { AddProjectModal } from './AddProjectModal';
import { userService } from '~/services/userService';
import { getUserProjects, createProject, updateProject, deleteProject } from '~/services/projectService';
import type { Project, CreateProjectRequest } from '~/services/projectService';
import { getUserTodoLists, createTodoList, updateTodoList, deleteTodoList } from '~/services/todoListService';
import type { TodoList, CreateTodoListRequest } from '~/services/todoListService';
import { getUserPreference, upsertUserPreference } from '~/services/userPreferenceService';
import { deleteAssignment, updateAssignment } from '~/services/assignmentService';
import { notifyAssignmentsChanged } from '~/utils/assignmentSync';
import { Checkbox } from '~/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

const BUILT_IN_TAGS: EventTag[] = ['school', 'personal', 'work', 'meeting', 'fun'];
const PREF_SELECTED_TODO_LIST_ID = 'todo.selectedListId';
const PREF_PROJECT_ORDER = 'todo.projectOrder';
const PREF_PROJECT_TASK_ORDER = 'todo.projectTaskOrder';
const PREF_STANDALONE_TASK_ORDER = 'todo.standaloneTaskOrder';

interface SortableTodoListTabProps {
  list: TodoList;
  isSelected: boolean;
  onSelect: (listId: number) => void;
  onRename: (list: TodoList) => void;
  onDelete: (list: TodoList) => void;
}

function SortableTodoListTab({ list, isSelected, onSelect, onRename, onDelete }: SortableTodoListTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isSelected ? list.color : '#f3f4f6',
    color: isSelected ? 'white' : '#374151',
    borderColor: list.color,
    borderWidth: isSelected ? '0' : '2px',
    borderStyle: 'solid' as const,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isSelected ? 'ring-2 ring-offset-2 shadow-md' : 'hover:shadow-sm'
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(list.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(list.id);
        }
      }}
      aria-label={`Select list ${list.name}`}
    >
      <button
        type="button"
        className={`p-0.5 rounded transition-colors ${isSelected ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}
        aria-label={`Drag to reorder ${list.name}`}
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3" />
      </button>
      <span>{list.name}</span>
      {isSelected && (
        <div className="flex gap-1 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(list);
            }}
            className="p-0.5 hover:bg-white/20 rounded transition-colors"
            aria-label="Rename list"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(list);
            }}
            className="p-0.5 hover:bg-red-500/20 rounded transition-colors"
            aria-label="Delete list"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function DragHandleVisual({ label }: { label: string }) {
  return (
    <span
      className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded text-gray-300"
      aria-label={label}
      title="Drag handle"
    >
      <GripVertical className="h-3.5 w-3.5" />
    </span>
  );
}

function SortableProjectRow({
  projectId,
  children,
  handleLabel,
}: {
  projectId: number;
  children: React.ReactNode;
  handleLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: projectId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center p-3">
      <button
        type="button"
        className="rounded hover:bg-gray-100"
        aria-label={handleLabel}
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <DragHandleVisual label={handleLabel} />
      </button>
      {children}
    </div>
  );
}

function SortableTaskRow({
  taskId,
  children,
  handleLabel,
}: {
  taskId: string;
  children: React.ReactNode;
  handleLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: taskId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-3">
      <button
        type="button"
        className="rounded hover:bg-gray-100"
        aria-label={handleLabel}
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <DragHandleVisual label={handleLabel} />
      </button>
      {children}
    </div>
  );
}

interface ToDoSidebarProps {
  events: CalendarEvent[];
  onRemoveEvent: (eventId: string) => Promise<void>;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<boolean | { success: boolean; eventId?: number }>;
  isInline?: boolean; // New prop for inline mode
  onEventUpdate?: () => void; // Callback to refresh events from parent
  existingEvents?: CalendarEvent[]; // All events for conflict detection
}

const ResizableComponent = Resizable as any;

export function ToDoSidebar({ events, onRemoveEvent, onAddEvent, isInline = false, onEventUpdate, existingEvents }: ToDoSidebarProps) {
  const [selectedTags, setSelectedTags] = useState<Set<EventTag>>(new Set(getAllTags()));
  const { customTags } = useCustomTags();
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  // To-do list states
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isRenameListModalOpen, setIsRenameListModalOpen] = useState(false);
  const [listToRename, setListToRename] = useState<TodoList | null>(null);
  const [listToDelete, setListToDelete] = useState<TodoList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#3b82f6');

  const listTabSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    getEnrolledCourses().then(setEnrolledCourses).catch(() => setEnrolledCourses([]));
  }, []);

  useEffect(() => {
    const loadOrderPreferences = async () => {
      try {
        const user = userService.getCurrentUser();
        if (!user?.id) {
          setIsOrderPreferencesLoaded(true);
          return;
        }

        const [savedSelectedListId, savedProjectOrder, savedProjectTaskOrder, savedStandaloneTaskOrder] = await Promise.all([
          getUserPreference(user.id, PREF_SELECTED_TODO_LIST_ID),
          getUserPreference(user.id, PREF_PROJECT_ORDER),
          getUserPreference(user.id, PREF_PROJECT_TASK_ORDER),
          getUserPreference(user.id, PREF_STANDALONE_TASK_ORDER),
        ]);

        if (savedSelectedListId !== null && savedSelectedListId !== '') {
          const parsed = parseInt(savedSelectedListId, 10);
          if (!Number.isNaN(parsed)) {
            setSelectedListId(parsed);
          }
        }

        if (savedProjectOrder) {
          try {
            setProjectOrder(JSON.parse(savedProjectOrder) as number[]);
          } catch {
            setProjectOrder([]);
          }
        }

        if (savedProjectTaskOrder) {
          try {
            setProjectTaskOrder(JSON.parse(savedProjectTaskOrder) as Record<string, string[]>);
          } catch {
            setProjectTaskOrder({});
          }
        }

        if (savedStandaloneTaskOrder) {
          try {
            setStandaloneTaskOrder(JSON.parse(savedStandaloneTaskOrder) as Record<string, string[]>);
          } catch {
            setStandaloneTaskOrder({});
          }
        }
      } catch (error) {
        console.error('Error loading to-do order preferences:', error);
      } finally {
        setIsOrderPreferencesLoaded(true);
      }
    };

    loadOrderPreferences();
  }, []);

  // Fetch to-do lists on mount
  useEffect(() => {
    const fetchTodoLists = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user?.id) {
          const lists = await getUserTodoLists(user.id);
          setTodoLists(lists);
          // Don't auto-select a list - default to showing all tasks
        }
      } catch (error) {
        console.error('Error fetching to-do lists:', error);
      }
    };
    fetchTodoLists();
  }, []);

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<number>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [projectOrder, setProjectOrder] = useState<number[]>([]);
  const [projectTaskOrder, setProjectTaskOrder] = useState<Record<string, string[]>>({});
  const [standaloneTaskOrder, setStandaloneTaskOrder] = useState<Record<string, string[]>>({});
  const [isOrderPreferencesLoaded, setIsOrderPreferencesLoaded] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (user?.id) {
          const userProjects = await getUserProjects(user.id);
          setProjects(userProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!isOrderPreferencesLoaded) {
      return;
    }

    const persistOrderPreferences = async () => {
      try {
        const user = userService.getCurrentUser();
        if (!user?.id) {
          return;
        }

        await Promise.all([
          upsertUserPreference(user.id, PREF_SELECTED_TODO_LIST_ID, selectedListId === null ? '' : String(selectedListId)),
          upsertUserPreference(user.id, PREF_PROJECT_ORDER, JSON.stringify(projectOrder)),
          upsertUserPreference(user.id, PREF_PROJECT_TASK_ORDER, JSON.stringify(projectTaskOrder)),
          upsertUserPreference(user.id, PREF_STANDALONE_TASK_ORDER, JSON.stringify(standaloneTaskOrder)),
        ]);
      } catch (error) {
        console.error('Error saving to-do order preferences:', error);
      }
    };

    void persistOrderPreferences();
  }, [selectedListId, projectOrder, projectTaskOrder, standaloneTaskOrder, isOrderPreferencesLoaded]);

  useEffect(() => {
    if (projects.length === 0) {
      return;
    }

    setProjectOrder((prev) => {
      const projectIds = projects.map((project) => project.id);
      const retained = prev.filter((id) => projectIds.includes(id));
      const appended = projectIds.filter((id) => !retained.includes(id));
      return [...retained, ...appended];
    });
  }, [projects]);

  // Refresh projects when events are updated
  const handleEventUpdate = async () => {
    onEventUpdate?.();
    // Refresh projects to update task counts
    try {
      const user = await userService.getCurrentUser();
      if (user?.id) {
        const userProjects = await getUserProjects(user.id);
        setProjects(userProjects);
      }
    } catch (error) {
      console.error('Error refreshing projects:', error);
    }
  };

  // Check if event is from backend (has numeric id)
  const isAssignmentTask = (event: CalendarEvent): boolean => {
    return event.source === 'assignment' && typeof event.assignmentId === 'number';
  };

  const isBackendEvent = (event: CalendarEvent): boolean => {
    return !isAssignmentTask(event) && /^\d+$/.test(String(event.id));
  };

  // Get to-do list info by ID
  const getListInfo = (todoListId: number | null | undefined) => {
    if (!todoListId) return null;
    return todoLists.find(list => list.id === todoListId);
  };

  // Handle delete with confirmation
  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
  };

  // Handle project delete with confirmation
  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapse/expand when clicking delete
    setProjectToDelete(project);
  };

  const handleDeleteProjectConfirm = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      // Refresh projects and events
      const user = await userService.getCurrentUser();
      if (user?.id) {
        const userProjects = await getUserProjects(user.id);
        setProjects(userProjects);
      }
      handleEventUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    if (isAssignmentTask(eventToDelete)) {
      try {
        await deleteAssignment(eventToDelete.assignmentId!);
        notifyAssignmentsChanged({
          assignmentId: eventToDelete.assignmentId,
          courseId: eventToDelete.courseId,
        });
        handleEventUpdate();
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    } else if (isBackendEvent(eventToDelete)) {
      // Backend event - call delete API
      try {
        const response = await fetch(`${API_BASE_URL}/events/${eventToDelete.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (response.ok) {
          handleEventUpdate();
        } else {
          console.error('Failed to delete event', response.status);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    } else {
      // Predefined event - just remove from calendar
      onRemoveEvent(eventToDelete.id);
    }

    // Refresh to update UI
    handleEventUpdate();
    setEventToDelete(null);
  };

  const handleDeleteCancel = () => {
    setEventToDelete(null);
  };

  // Unified handler that toggles completion based on current state
  const handleToggleComplete = async (event: CalendarEvent, newCheckedState: boolean | "indeterminate") => {
    // Convert indeterminate to boolean
    const isChecked = newCheckedState === true;
    
    if (isAssignmentTask(event)) {
      try {
        await updateAssignment(event.assignmentId!, {
          status: isChecked ? 'completed' : 'todo',
        });
        notifyAssignmentsChanged({
          assignmentId: event.assignmentId,
          courseId: event.courseId,
        });
        handleEventUpdate();
      } catch (error) {
        console.error(`Error marking assignment as ${isChecked ? 'completed' : 'uncompleted'}:`, error);
      }
    } else if (isBackendEvent(event)) {
      // Backend event - call appropriate API
      try {
        const endpoint = isChecked ? 'complete' : 'uncomplete';
        
        const response = await fetch(`${API_BASE_URL}/events/${event.id}/${endpoint}`, {
          method: 'PUT',
          credentials: 'include', // Send HttpOnly cookies for authentication
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Trigger parent to refresh events
          handleEventUpdate();
        } else {
          console.error(`Failed to mark event as ${isChecked ? 'completed' : 'uncompleted'}`, response.status);
        }
      } catch (error) {
        console.error(`Error marking event as ${isChecked ? 'completed' : 'uncompleted'}:`, error);
      }
    } else {
      // Predefined event
      if (isChecked) {
        // Mark as complete - remove from calendar
        onRemoveEvent(event.id);
      } else {
        // Mark as incomplete - add back to calendar
        const eventWithoutId: Omit<CalendarEvent, 'id'> = {
          title: event.title,
          date: event.date,
          time: event.time,
          startTime: event.startTime,
          endTime: event.endTime,
          color: event.color,
          type: event.type,
          location: event.location,
          tag: event.tag
        };
        await onAddEvent(eventWithoutId);
      }
    }
  };

  // Sync selectedTags with all tags (predefined + custom) whenever:
  // 1. Custom tags are added/changed
  // 2. New events are added (which might use new custom tags from tagSelector)
  useEffect(() => {
    setSelectedTags(new Set(getAllTags()));
  }, [customTags, events]);

  // Handle adding event with auto-update
  const handleAddEventWithUpdate = async (event: Omit<CalendarEvent, 'id'>) => {
    const result = await onAddEvent(event);
    const success = typeof result === 'boolean' ? result : result.success;
    if (success && onEventUpdate) {
      onEventUpdate(); // Trigger parent to refresh
    }
    setIsAddEventModalOpen(false);
    return success;
  };

  // Handle editing event - open modal with event pre-filled
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsAddEventModalOpen(true);
  };

  // Project handlers
  const handleCreateProject = async (projectData: CreateProjectRequest) => {
    try {
      const user = await userService.getCurrentUser();
      if (user?.id) {
        const newProject = await createProject(user.id, projectData);
        setProjects([newProject, ...projects]);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const toggleProjectCollapse = (projectId: number) => {
    const newCollapsed = new Set(collapsedProjects);
    if (newCollapsed.has(projectId)) {
      newCollapsed.delete(projectId);
    } else {
      newCollapsed.add(projectId);
    }
    setCollapsedProjects(newCollapsed);
  };

  // Get course color from event color
  const getEventCourseInfo = (event: CalendarEvent): { courseCode: string; courseColor: string } => {
    // Prefer explicit course linkage when available (assignment tasks include courseId).
    if (event.courseId) {
      const linkedCourse = enrolledCourses.find(c => c.id === event.courseId);
      if (linkedCourse) {
        return { courseCode: linkedCourse.code, courseColor: linkedCourse.color };
      }
    }

    // Try to extract course code from title (e.g., "CS 101 - Assignment")
    const match = event.title.match(/^([A-Z]+\s+\d+)/);
    if (match) {
      const courseCode = match[1];
      const course = enrolledCourses.find(c => c.code === courseCode);
      if (course) {
        return { courseCode, courseColor: course.color };
      }
      // If no course found, extract color from event color
      const colorMatch = event.color.match(/border-(\w+)-/);
      if (colorMatch) {
        return { courseCode, courseColor: `bg-${colorMatch[1]}-500` };
      }
    }
    
    // Default for custom events
    return { courseCode: 'Custom', courseColor: 'bg-yellow-500' };
  };

  // Format date for display
  const formatDueDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Filter and sort events - only show event type for the selected list
  const allTaskEvents = events.filter(event => {
    return (event.type === 'event' || event.type === 'task') && 
      (selectedListId === null || event.todoListId === selectedListId);
  });
  
  // Separate undated tasks from dated tasks
  const undatedTasks = allTaskEvents.filter(event => !event.completed && event.date === null);
  const datedTasks = allTaskEvents.filter(event => !event.completed && event.date !== null);
  
  // Sort dated events by date
  const sortedEvents = datedTasks
    .sort((a, b) => {
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime();
      }
      return 0;
    });

  // Sort completed events by date (handle null dates)
  const sortedCompletedEvents = allTaskEvents
    .filter(event => event.completed)
    .sort((a, b) => {
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime();
      }
      if (a.date) return -1; // dated before undated
      if (b.date) return 1;
      return 0;
    });

  // Separate tasks by project vs standalone (from dated tasks)
  const projectTasks = sortedEvents.filter(event => event.projectId);
  const standaloneTasks = sortedEvents.filter(event => !event.projectId);

  // Separate undated tasks by project
  const undatedProjectTasks = undatedTasks.filter(event => event.projectId);
  const undatedStandaloneTasks = undatedTasks.filter(event => !event.projectId);

  // Group standalone events by tag
  const groupEventsByTag = () => {
    // initialize groups for every tag we know about
    const groups: Record<string, CalendarEvent[]> = {};
    getAllTags().forEach(tag => {
      groups[tag] = [];
    });

    // Filter by selected tags and group
    standaloneTasks.forEach(event => {
      if (selectedTags.has(event.tag) && groups[event.tag]) {
        groups[event.tag].push(event);
      }
    });

    return groups;
  };

  // Group undated standalone tasks by tag
  const groupUndatedEventsByTag = () => {
    const groups: Record<string, CalendarEvent[]> = {};

    getAllTags().forEach(tag => {
      groups[tag] = [];
    });

    undatedStandaloneTasks.forEach(event => {
      if (selectedTags.has(event.tag) && groups[event.tag]) {
        groups[event.tag].push(event);
      }
    });

    return groups;
  };

  const eventGroups = groupEventsByTag();
  const undatedEventGroups = groupUndatedEventsByTag();
  const orderedSchoolTasks = sortStandaloneTasksByOrder('standalone-school', eventGroups.school);
  const orderedPersonalTasks = sortStandaloneTasksByOrder('standalone-personal', eventGroups.personal);
  const orderedWorkTasks = sortStandaloneTasksByOrder('standalone-work', eventGroups.work);
  const orderedMeetingTasks = sortStandaloneTasksByOrder('standalone-meeting', eventGroups.meeting);
  const orderedFunTasks = sortStandaloneTasksByOrder('standalone-fun', eventGroups.fun);
  const orderedCompletedTasks = sortStandaloneTasksByOrder('standalone-completed', sortedCompletedEvents);
  const customStandaloneTagEntries = Object.entries(eventGroups).filter(
    ([tag, tagEvents]) => !BUILT_IN_TAGS.includes(tag as EventTag) && tagEvents.length > 0
  );

  // Helper function to determine which tag category a task belongs to
  const getTaskTagCategory = (taskId: string): string => {
    if (orderedSchoolTasks.some(t => String(t.id) === String(taskId))) return 'standalone-school';
    if (orderedPersonalTasks.some(t => String(t.id) === String(taskId))) return 'standalone-personal';
    if (orderedWorkTasks.some(t => String(t.id) === String(taskId))) return 'standalone-work';
    if (orderedMeetingTasks.some(t => String(t.id) === String(taskId))) return 'standalone-meeting';
    if (orderedFunTasks.some(t => String(t.id) === String(taskId))) return 'standalone-fun';
    if (orderedCompletedTasks.some(t => String(t.id) === String(taskId))) return 'standalone-completed';
    // Check custom tags
    for (const [tag] of customStandaloneTagEntries) {
      const orderedCustomTasks = sortStandaloneTasksByOrder(`standalone-${tag}`, eventGroups[tag]);
      if (orderedCustomTasks.some(t => String(t.id) === String(taskId))) return `standalone-${tag}`;
    }
    return 'standalone-personal';
  };

  // Combine all active tasks (dated, undated, excluding completed)
  const allOrderedTasks = useMemo(() => {
    // Collect all tasks with their categories
    const allTasks: any[] = [];
    allTasks.push(...orderedSchoolTasks.map(t => ({ ...t, tagCategory: 'school' })));
    allTasks.push(...orderedPersonalTasks.map(t => ({ ...t, tagCategory: 'personal' })));
    allTasks.push(...orderedWorkTasks.map(t => ({ ...t, tagCategory: 'work' })));
    allTasks.push(...orderedMeetingTasks.map(t => ({ ...t, tagCategory: 'meeting' })));
    allTasks.push(...orderedFunTasks.map(t => ({ ...t, tagCategory: 'fun' })));
    for (const [tag] of customStandaloneTagEntries) {
      const orderedCustomTasks = sortStandaloneTasksByOrder(`standalone-${tag}`, eventGroups[tag]);
      allTasks.push(...orderedCustomTasks.map(t => ({ ...t, tagCategory: tag })));
    }
    
    // Add undated tasks to unified list
    for (const [tag, tagEvents] of Object.entries(undatedEventGroups)) {
      if (tagEvents.length > 0) {
        allTasks.push(...tagEvents.map(t => ({ ...t, tagCategory: tag })));
      }
    }

    // Sort by unified order
    const unifiedOrder = standaloneTaskOrder['standalone-unified'] ?? [];
    return allTasks.sort((a, b) => {
      const aIndex = unifiedOrder.indexOf(String(a.id));
      const bIndex = unifiedOrder.indexOf(String(b.id));
      const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return safeAIndex - safeBIndex;
    });
  }, [orderedSchoolTasks, orderedPersonalTasks, orderedWorkTasks, orderedMeetingTasks, orderedFunTasks, customStandaloneTagEntries, eventGroups, undatedEventGroups, standaloneTaskOrder]);

  // Get all task IDs for unified drag context
  const allTaskIds = useMemo(() => allOrderedTasks.map(t => String(t.id)), [allOrderedTasks]);
  
  // Calculate total filtered events (standalone + project tasks + undated)
  const totalFilteredEvents = 
    Object.values(eventGroups).reduce((sum, arr) => sum + arr.length, 0) + 
    projectTasks.filter(event => selectedTags.has(event.tag)).length +
    Object.values(undatedEventGroups).reduce((sum, arr) => sum + arr.length, 0) +
    undatedProjectTasks.filter(event => selectedTags.has(event.tag)).length;

  // Calculate completion progress
  const totalTasks = sortedEvents.length + sortedCompletedEvents.length + undatedTasks.length;
  const completedTasks = sortedCompletedEvents.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Initialize unified task order on first load if not already set
  useEffect(() => {
    if (isOrderPreferencesLoaded && allTaskIds.length > 0 && !standaloneTaskOrder['standalone-unified']) {
      setStandaloneTaskOrder(prev => ({
        ...prev,
        ['standalone-unified']: allTaskIds,
      }));
    }
  }, [isOrderPreferencesLoaded, allTaskIds.length, standaloneTaskOrder]);

  const handleAddClick = () => {
    setIsAddEventModalOpen(true);
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const toggleProjectExpand = (projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleToggleProjectComplete = async (project: Project, completed: boolean) => {
    try {
      const updateData: CreateProjectRequest = {
        name: project.name,
        description: project.description,
        color: project.color,
        deadline: project.deadline,
        deadlineTime: project.deadlineTime,
        completed: completed
      };
      
      const updatedProject = await updateProject(project.id, updateData);
      
      // Update local state
      setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
    } catch (error) {
      console.error('Error updating project completion:', error);
    }
  };

  // To-do list handlers
  const handleCreateList = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (user?.id && newListName.trim()) {
        const request: CreateTodoListRequest = {
          name: newListName,
          color: newListColor,
          isDefault: false,
        };
        const newList = await createTodoList(user.id, request);
        setTodoLists([...todoLists, newList]);
        setSelectedListId(newList.id);
        setIsCreateListModalOpen(false);
        setNewListName('');
        setNewListColor('#3b82f6');
      }
    } catch (error) {
      console.error('Error creating to-do list:', error);
      alert('Failed to create list. Please try again.');
    }
  };

  const handleRenameList = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (user?.id && listToRename && newListName.trim()) {
        const request: CreateTodoListRequest = {
          name: newListName,
          color: newListColor,
        };
        const updatedList = await updateTodoList(user.id, listToRename.id, request);
        setTodoLists(todoLists.map(list => list.id === updatedList.id ? updatedList : list));
        setIsRenameListModalOpen(false);
        setListToRename(null);
        setNewListName('');
        setNewListColor('#3b82f6');
      }
    } catch (error) {
      console.error('Error renaming to-do list:', error);
      alert('Failed to rename list. Please try again.');
    }
  };

  const handleDeleteListClick = (list: TodoList) => {
    setListToDelete(list);
  };

  const handleDeleteListConfirm = async () => {
    try {
      const user = await userService.getCurrentUser();
      if (user?.id && listToDelete) {
        await deleteTodoList(user.id, listToDelete.id);
        const newLists = todoLists.filter(list => list.id !== listToDelete.id);
        setTodoLists(newLists);
        // Select first list if current list was deleted, or reset to All Tasks if no lists remain
        if (selectedListId === listToDelete.id) {
          if (newLists.length > 0) {
            setSelectedListId(newLists[0].id);
          } else {
            setSelectedListId(null); // Reset to All Tasks view
          }
        }
        setListToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting to-do list:', error);
      alert('Failed to delete list. Please try again.');
    }
  };

  const openRenameModal = (list: TodoList) => {
    setListToRename(list);
    setNewListName(list.name);
    setNewListColor(list.color);
    setIsRenameListModalOpen(true);
  };

  const sortProjectsByOrder = (sourceProjects: Project[]) => {
    return [...sourceProjects].sort((a, b) => {
      const aIndex = projectOrder.indexOf(a.id);
      const bIndex = projectOrder.indexOf(b.id);
      const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return safeAIndex - safeBIndex;
    });
  };

  const sortProjectTasksByOrder = (projectId: number, tasks: CalendarEvent[]) => {
    const key = String(projectId);
    const orderedIds = projectTaskOrder[key] ?? [];

    return [...tasks].sort((a, b) => {
      const aIndex = orderedIds.indexOf(String(a.id));
      const bIndex = orderedIds.indexOf(String(b.id));
      const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return safeAIndex - safeBIndex;
    });
  };

  function sortStandaloneTasksByOrder(sectionKey: string, tasks: CalendarEvent[]) {
    const orderedIds = standaloneTaskOrder[sectionKey] ?? [];

    return [...tasks].sort((a, b) => {
      const aIndex = orderedIds.indexOf(String(a.id));
      const bIndex = orderedIds.indexOf(String(b.id));
      const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return safeAIndex - safeBIndex;
    });
  }

  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = Number(active.id);
    const overId = Number(over.id);

    setProjectOrder((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleProjectTaskDragEnd = (projectId: number, taskIds: string[], event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    setProjectTaskOrder((prev) => {
      const key = String(projectId);
      const currentOrder = prev[key] ?? [];
      const normalized = [
        ...currentOrder.filter((id) => taskIds.includes(id)),
        ...taskIds.filter((id) => !currentOrder.includes(id)),
      ];

      const oldIndex = normalized.indexOf(activeId);
      const newIndex = normalized.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      return {
        ...prev,
        [key]: arrayMove(normalized, oldIndex, newIndex),
      };
    });
  };

  const handleStandaloneTaskDragEnd = (sectionKey: string, taskIds: string[], event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const normalizedTaskIds = taskIds.map(id => String(id));

    setStandaloneTaskOrder((prev) => {
      const currentOrder = prev[sectionKey] ?? [];
      const normalized = [
        ...currentOrder.filter((id) => normalizedTaskIds.includes(id)),
        ...normalizedTaskIds.filter((id) => !currentOrder.includes(id)),
      ];

      const oldIndex = normalized.indexOf(activeId);
      const newIndex = normalized.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      const newOrder = arrayMove(normalized, oldIndex, newIndex);

      return {
        ...prev,
        [sectionKey]: newOrder,
      };
    });
  };

  // Unified drag handler for all tasks in combined view - free reordering across categories
  const handleUnifiedTaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    
    // Update the unified order
    setStandaloneTaskOrder((prev) => {
      const currentOrder = prev['standalone-unified'] ?? allTaskIds;
      const normalized = [
        ...currentOrder.filter((id) => allTaskIds.includes(id)),
        ...allTaskIds.filter((id) => !currentOrder.includes(id)),
      ];

      const oldIndex = normalized.indexOf(activeId);
      const newIndex = normalized.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      const newOrder = arrayMove(normalized, oldIndex, newIndex);

      return {
        ...prev,
        ['standalone-unified']: newOrder,
      };
    });
  };


  const persistTodoListOrder = async (orderedLists: TodoList[]) => {
    try {
      const user = await userService.getCurrentUser();
      if (!user?.id) return;

      await Promise.all(
        orderedLists.map((list, index) =>
          updateTodoList(user.id, list.id, {
            name: list.name,
            description: list.description,
            color: list.color,
            isDefault: list.isDefault,
            listOrder: index,
          })
        )
      );
    } catch (error) {
      console.error('Error saving to-do list order:', error);
      try {
        const user = await userService.getCurrentUser();
        if (user?.id) {
          const lists = await getUserTodoLists(user.id);
          setTodoLists(lists);
        }
      } catch (fetchError) {
        console.error('Error refetching to-do lists after reorder failure:', fetchError);
      }
    }
  };

  const handleTodoListDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = Number(active.id);
    const overId = Number(over.id);

    setTodoLists((prev) => {
      const oldIndex = prev.findIndex((list) => list.id === activeId);
      const newIndex = prev.findIndex((list) => list.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      const reordered = arrayMove(prev, oldIndex, newIndex).map((list, index) => ({
        ...list,
        listOrder: index,
      }));

      void persistTodoListOrder(reordered);
      return reordered;
    });
  };


  return (
    <>
    <ResizableComponent
  defaultSize={{ width: 320, height: '100%' }}
  minWidth={200}
  maxWidth={600}
  enable={{ left: true, right: false, top: false, bottom: false }}
  handleStyles={{
    left: {
      width: 10,
      left: -5, // make it overlap a little on the page edge
      top: 0,
      bottom: 0,
      cursor: 'col-resize',
      backgroundColor: '#e5e7eb',
      position: 'absolute',
    }
  }}
  className="bg-white flex flex-col relative"
>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">To-Do List</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add new"
              >
                <Plus className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAddEventModalOpen(true)}>
                Add Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddProjectModalOpen(true)}>
                Add Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCreateListModalOpen(true)}>
                Create New List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Current List Display */}
        {todoLists.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Current View:</span>
              {selectedListId === null ? (
                <span className="px-2 py-1 rounded text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  All Tasks ({todoLists.reduce((sum, list) => sum + list.taskCount, 0)})
                </span>
              ) : (
                <span 
                  className="px-2 py-1 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: todoLists.find(l => l.id === selectedListId)?.color || '#3b82f6' }}
                >
                  {todoLists.find(l => l.id === selectedListId)?.name || 'Unknown'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* List Tabs */}
        {todoLists.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex gap-2 flex-wrap">
              {/* All Tasks Button */}
              <button
                onClick={() => setSelectedListId(null)}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedListId === null
                    ? 'ring-2 ring-offset-2 shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <span>All Tasks</span>
                <span className={`text-xs ${selectedListId === null ? 'text-white/80' : 'text-gray-500'}`}>
                  ({todoLists.reduce((sum, list) => sum + list.taskCount, 0)})
                </span>
              </button>
              {/* Individual List Buttons */}
              <DndContext
                sensors={listTabSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTodoListDragEnd}
              >
                <SortableContext
                  items={todoLists.map((list) => list.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {todoLists.map((list) => (
                    <SortableTodoListTab
                      key={list.id}
                      list={list}
                      isSelected={selectedListId === list.id}
                      onSelect={setSelectedListId}
                      onRename={openRenameModal}
                      onDelete={handleDeleteListClick}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            <p className="text-xs text-gray-500">Drag list handles to reorder.</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-3">{totalFilteredEvents} tasks remaining</p>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Progress</span>
            <span className="text-gray-600 font-semibold">{completedTasks}/{totalTasks} ({completionPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {completionPercentage === 100 && totalTasks > 0 && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All tasks completed! 🎉
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Tag Filter Buttons */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Filter by Tag</h3>
          <div className="flex flex-wrap gap-2">
            {getAllTags().map(tag => {
              const count = sortedEvents.filter(e => e.tag === tag).length + 
                            sortedCompletedEvents.filter(e => e.tag === tag).length +
                            undatedTasks.filter(e => e.tag === tag).length;
              const isSelected = selectedTags.has(tag);
              const info = getTagInfo(tag);
              if (!info) return null;
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
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    isSelected ? info?.activeClass : info?.inactiveClass
                  }`}
                >
                  {(info?.label || tag)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Section */}
        <DndContext
          sensors={listTabSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleProjectDragEnd}
        >
          <SortableContext
            items={sortProjectsByOrder(projects)
              .filter(project => selectedListId === null || project.todoListId === selectedListId)
              .map(project => project.id)}
            strategy={verticalListSortingStrategy}
          >
        {sortProjectsByOrder(projects)
          .filter(project => selectedListId === null || project.todoListId === selectedListId)
          .map(project => {
          // Combine both dated and undated tasks for this project (including completed)
          const datedProjectTasks = projectTasks.filter(e => e.projectId === project.id && selectedTags.has(e.tag));
          const undatedProjectTasks = undatedTasks.filter(e => e.projectId === project.id && selectedTags.has(e.tag));
          const projectCompletedTasks = sortedCompletedEvents.filter(e => e.projectId === project.id && selectedTags.has(e.tag));
          const projectTasksList = sortProjectTasksByOrder(project.id, [...datedProjectTasks, ...undatedProjectTasks, ...projectCompletedTasks]);
          
          const isCollapsed = collapsedProjects.has(project.id);
          const progressPercent = project.totalTasks > 0 
            ? Math.round((project.completedTasks / project.totalTasks) * 100) 
            : 0;
          const projectListInfo = getListInfo(project.todoListId);
            
          return (
            <div key={project.id} className="mb-6">
              {/* Project Header */}
              <div className="rounded-lg border border-gray-200 hover:bg-gray-50 transition-all mb-2">
                <SortableProjectRow projectId={project.id} handleLabel={`Drag handle for project ${project.name}`}>
                  {/* Project Completion Checkbox */}
                  <Checkbox
                    checked={project.completed ?? false}
                    onCheckedChange={(checked) => handleToggleProjectComplete(project, checked as boolean)}
                    className="mt-0.5 cursor-pointer flex-shrink-0 mr-3"
                    aria-label="Mark project as complete"
                  />
                  
                  {/* Collapse/Expand Tasks Button */}
                  <button
                    onClick={() => toggleProjectCollapse(project.id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    <FolderOpen className={`w-4 h-4 flex-shrink-0 ${project.color.replace('bg-', 'text-')}`} />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${project.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {project.name}
                        </span>
                        {projectListInfo && (
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: projectListInfo.color }}
                          >
                            {projectListInfo.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          ({project.completedTasks}/{project.totalTasks})
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-full rounded-full transition-all ${project.color}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                  
                  {/* Info Icon - Click to expand project details */}
                  {(project.description || project.deadline) && (
                    <button
                      onClick={() => toggleProjectExpand(project.id)}
                      className="p-1.5 hover:bg-blue-50 rounded transition-colors flex-shrink-0 ml-2"
                      aria-label="Toggle project details"
                    >
                      <Info className="w-4 h-4 text-blue-500" />
                    </button>
                  )}
                  
                  {/* Delete Project Button */}
                  <button
                    onClick={(e) => handleDeleteProject(project, e)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0 ml-1"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </SortableProjectRow>
                
                {/* Project Details (Description/Deadline) */}
                {expandedProjects.has(project.id) && (project.description || project.deadline) && (
                  <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2 bg-gray-50/50">
                    {project.description && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">{project.description}</p>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 mt-0.5 flex-shrink-0">📅</span>
                        <p className="text-xs text-gray-600">
                          Deadline: {new Date(project.deadline).toLocaleDateString()}
                          {project.deadlineTime && ` at ${project.deadlineTime}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="space-y-2 pl-7">
                  {projectTasksList.length === 0 ? (
                    <div className="text-sm text-gray-500 italic p-3">
                      No tasks yet. Click the + button to add tasks to this project.
                    </div>
                  ) : (
                    <DndContext
                      sensors={listTabSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleProjectTaskDragEnd(project.id, projectTasksList.map((task) => String(task.id)), event)}
                    >
                      <SortableContext
                        items={projectTasksList.map((task) => String(task.id))}
                        strategy={verticalListSortingStrategy}
                      >
                    {projectTasksList.map((event) => {
                    const { courseCode, courseColor } = getEventCourseInfo(event);
                    const isExpanded = expandedTasks.has(event.id);
                    const hasDetails = !!(event.description || event.location);
                    const listInfo = getListInfo(event.todoListId);
                    return (
                      <div
                        key={event.id}
                        className="rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="p-3">
                          <SortableTaskRow taskId={String(event.id)} handleLabel={`Drag handle for task ${event.title}`}>
                            <Checkbox
                              checked={event.completed ?? false}
                              onCheckedChange={(checked) => handleToggleComplete(event, checked)}
                              className="mt-1 cursor-pointer flex-shrink-0"
                              aria-label="Mark as complete"
                            />
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => hasDetails && toggleTaskExpand(event.id)}
                            >
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {/* Tag Badge */}
                                {event.tag && (
                                  <span 
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${getTagInfo(event.tag as EventTag)?.color || 'bg-gray-400'}`}
                                  >
                                    {getTagInfo(event.tag as EventTag)?.label || event.tag}
                                  </span>
                                )}
                                <p className={`text-sm font-medium ${event.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                  {event.title}
                                </p>
                                {listInfo && (
                                  <span 
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: listInfo.color }}
                                  >
                                    {listInfo.name}
                                  </span>
                                )}
                                {hasDetails && (
                                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className={`text-xs ${event.completed ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                {event.date ? `Due: ${formatDueDate(event.date)} at ${event.time}` : 'No due date'}
                              </p>
                            </div>
                            {!isAssignmentTask(event) && (
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                                aria-label="Edit task"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(event)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                              aria-label="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </SortableTaskRow>
                        </div>
                        {isExpanded && hasDetails && (
                          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100 bg-gray-50/50">
                            {event.location && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{event.location}</p>
                              </div>
                            )}
                            {event.description && (
                              <div className="flex items-start gap-2">
                                <FileText className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{event.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              )}
            </div>
          );
        })}
          </SortableContext>
        </DndContext>

        {/* Unified Task View - All Active Tasks */}
        {allOrderedTasks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              All Tasks ({allOrderedTasks.length})
            </h3>
            <div className="space-y-2">
              <DndContext
                sensors={listTabSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleUnifiedTaskDragEnd}
              >
                <SortableContext
                  items={allTaskIds}
                  strategy={verticalListSortingStrategy}
                >
                  {allOrderedTasks.map((event) => {
                    const { courseCode, courseColor } = getEventCourseInfo(event);
                    const isExpanded = expandedTasks.has(event.id);
                    const hasDetails = !!(event.description || event.location);
                    const listInfo = getListInfo(event.todoListId);
                    const categoryTagInfo = getTagInfo(event.tagCategory);
                    
                    return (
                      <div
                        key={event.id}
                        className="rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="p-3">
                          <SortableTaskRow taskId={String(event.id)} handleLabel={`Drag handle for task ${event.title}`}>
                            <Checkbox
                              checked={event.completed ?? false}
                              onCheckedChange={(checked) => handleToggleComplete(event, checked)}
                              className="mt-1 cursor-pointer flex-shrink-0"
                              aria-label="Mark as complete"
                            />
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => hasDetails && toggleTaskExpand(event.id)}
                            >
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {/* Category Tag Badge */}
                                {categoryTagInfo && (
                                  <span 
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${categoryTagInfo.color}`}
                                  >
                                    {categoryTagInfo.label}
                                  </span>
                                )}
                                {event.tagCategory === 'school' && (
                                  <>
                                    <div className={`${courseColor} w-2 h-2 rounded-full flex-shrink-0`}></div>
                                    <span className="text-xs font-medium text-gray-600">{courseCode}</span>
                                  </>
                                )}
                                {listInfo && (
                                  <span 
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: listInfo.color }}
                                  >
                                    {listInfo.name}
                                  </span>
                                )}
                                {hasDetails && (
                                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">{event.title}</p>
                              <p className="text-xs text-gray-500">
                                {event.date ? `Due: ${formatDueDate(event.date)} at ${event.time}` : 'No due date'}
                              </p>
                            </div>
                            {!isAssignmentTask(event) && (
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                                aria-label="Edit task"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(event)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                              aria-label="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </SortableTaskRow>
                        </div>
                        {isExpanded && hasDetails && (
                          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100 bg-gray-50/50">
                            {event.location && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{event.location}</p>
                              </div>
                            )}
                            {event.description && (
                              <div className="flex items-start gap-2">
                                <FileText className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{event.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}



        {/* Completed Tasks */}
        {orderedCompletedTasks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              Completed ({orderedCompletedTasks.length})
            </h3>
            <div className="space-y-2">
              <DndContext
                sensors={listTabSensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleStandaloneTaskDragEnd('standalone-completed', orderedCompletedTasks.map((task) => String(task.id)), event)}
              >
                <SortableContext
                  items={orderedCompletedTasks.map((task) => String(task.id))}
                  strategy={verticalListSortingStrategy}
                >
              {orderedCompletedTasks.map((event) => {
                const { courseCode, courseColor } = getEventCourseInfo(event);
                // For non-school events, show the tag label and color instead of "Custom"
                const displayLabel = event.tag === 'school' ? courseCode : tagConfig[event.tag]?.label || courseCode;
                const displayColor = event.tag === 'school' ? courseColor : tagConfig[event.tag]?.color || courseColor;
                const listInfo = getListInfo(event.todoListId);
                return (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                  >
                    <SortableTaskRow taskId={String(event.id)} handleLabel={`Drag handle for task ${event.title}`}>
                      <Checkbox
                        checked={event.completed ?? true}
                        onCheckedChange={(checked) => handleToggleComplete(event, checked)}
                        className="mt-1 cursor-pointer"
                        aria-label="Mark as incomplete"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className={`${displayColor} w-2 h-2 rounded-full flex-shrink-0`}></div>
                          <span className="text-xs text-gray-600">{displayLabel}</span>
                          {listInfo && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: listInfo.color }}
                            >
                              {listInfo.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-1 line-through">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {event.date ? `Due: ${formatDueDate(event.date)} at ${event.time}` : 'No due date'}
                        </p>
                      </div>
                      {!isAssignmentTask(event) && (
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                          aria-label="Edit task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(event)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </SortableTaskRow>
                  </div>
                );
              })}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}

        {sortedEvents.length === 0 && sortedCompletedEvents.length === 0 && (
          <div className="text-center py-12">
            <Circle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No tasks yet</p>
            <p className="text-xs text-gray-400 mt-1">Click the + button to add a task</p>
          </div>
        )}
      </div>
    </ResizableComponent>
      {isAddEventModalOpen && (
        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => {
            setIsAddEventModalOpen(false);
            setEditingEvent(null);
          }}
          onAddEvent={handleAddEventWithUpdate}
          onEventUpdate={onEventUpdate ? () => Promise.resolve(onEventUpdate()) : undefined}
          existingEvents={existingEvents || events}
          projects={projects}
          todoLists={todoLists}
          defaultListId={selectedListId || undefined}
          initialEvent={editingEvent || undefined}
        />
      )}

      {isAddProjectModalOpen && (
        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          onSave={handleCreateProject}
          todoLists={todoLists}
          defaultListId={selectedListId}
        />
      )}

      {/* Create List Modal */}
      <Dialog open={isCreateListModalOpen} onOpenChange={setIsCreateListModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new to-do list to organize your tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list-color">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewListColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newListColor === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateListModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} disabled={!newListName.trim()}>
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename List Modal */}
      <Dialog open={isRenameListModalOpen} onOpenChange={setIsRenameListModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename List</DialogTitle>
            <DialogDescription>
              Change the name and color of this list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-list-name">List Name</Label>
              <Input
                id="rename-list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rename-list-color">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewListColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newListColor === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameListModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameList} disabled={!newListName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
    {/* Delete Confirmation Dialog */}
    <AlertDialog open={eventToDelete !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Delete Project Confirmation Dialog */}
    <AlertDialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{projectToDelete?.name}" and all {projectToDelete?.totalTasks || 0} tasks inside it? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteProjectConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete Project & All Tasks
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Delete List Confirmation Dialog */}
    <AlertDialog open={listToDelete !== null} onOpenChange={(open) => !open && setListToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete List</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the list "{listToDelete?.name}"? Tasks in this list will not be deleted, but will become unassigned.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setListToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteListConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete List
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

