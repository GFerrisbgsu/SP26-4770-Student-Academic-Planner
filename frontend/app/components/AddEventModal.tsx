import { EditTaskForm } from '~/components/EditTaskForm';
import type { CalendarEvent } from '~/utils/generateEvents';
import type { Project } from '~/services/projectService';
import type { TodoList } from '~/services/todoListService';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<boolean>;
  onEventUpdate?: () => Promise<void>; // Callback to refetch events after creation
  existingEvents: CalendarEvent[];
  projects?: Project[]; // Optional projects list
  todoLists?: TodoList[]; // Optional todo lists
  defaultListId?: number; // Default selected list ID
  initialEvent?: CalendarEvent; // For edit mode - pre-fills form with existing task data
}

export function AddEventModal({ isOpen, onClose, onAddEvent, onEventUpdate, existingEvents, projects = [], todoLists = [], defaultListId, initialEvent }: AddEventModalProps) {
  const handleSave = async (event: any) => {
    // EditTaskForm has already created the event on backend, so just trigger a refetch
    if (onEventUpdate) {
      try {
        await onEventUpdate();
      } catch (err) {
        console.error('Error refreshing events after creation:', err);
      }
    }
    onClose();
  };

  const mode = initialEvent ? 'edit' : 'create';

  return (
    <EditTaskForm
      mode={mode}
      isOpen={isOpen}
      onOpenChange={onClose}
      onSave={handleSave}
      initialEvent={initialEvent}
      existingEvents={existingEvents}
      projects={projects}
      todoLists={todoLists}
      defaultListId={defaultListId}
    />
  );
}
