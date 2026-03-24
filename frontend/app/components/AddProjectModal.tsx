import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import type { CreateProjectRequest, Project } from '~/services/projectService';
import type { TodoList } from '~/services/todoListService';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: CreateProjectRequest) => Promise<void>;
  existingProject?: Project; // For editing mode
  todoLists: TodoList[];
  defaultListId?: number | null;
}

const PROJECT_COLORS = [
  { name: 'Blue', value: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Purple', value: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Green', value: 'bg-green-500', hex: '#22c55e' },
  { name: 'Orange', value: 'bg-orange-500', hex: '#f97316' },
  { name: 'Pink', value: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Red', value: 'bg-red-500', hex: '#ef4444' },
  { name: 'Yellow', value: 'bg-yellow-500', hex: '#eab308' },
  { name: 'Indigo', value: 'bg-indigo-500', hex: '#6366f1' },
  { name: 'Teal', value: 'bg-teal-500', hex: '#14b8a6' },
  { name: 'Cyan', value: 'bg-cyan-500', hex: '#06b6d4' },
];

export function AddProjectModal({ isOpen, onClose, onSave, existingProject, todoLists, defaultListId }: AddProjectModalProps) {
  const [name, setName] = useState(existingProject?.name || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [selectedColor, setSelectedColor] = useState(existingProject?.color || PROJECT_COLORS[0].value);
  const [selectedListId, setSelectedListId] = useState<number | null>(existingProject?.todoListId ?? defaultListId ?? null);
  const [hasDeadline, setHasDeadline] = useState(!!(existingProject?.deadline));
  const [deadline, setDeadline] = useState(existingProject?.deadline || '');
  const [deadlineTime, setDeadlineTime] = useState(existingProject?.deadlineTime || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        todoListId: selectedListId ?? undefined,
        deadline: hasDeadline && deadline ? deadline : undefined,
        deadlineTime: hasDeadline && deadlineTime ? deadlineTime : undefined
      });
      
      // Reset form and close
      setName('');
      setDescription('');
      setSelectedColor(PROJECT_COLORS[0].value);
      setSelectedListId(defaultListId ?? null);
      setHasDeadline(false);
      setDeadline('');
      setDeadlineTime('');
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setName(existingProject?.name || '');
    setDescription(existingProject?.description || '');
    setSelectedColor(existingProject?.color || PROJECT_COLORS[0].value);
    setSelectedListId(existingProject?.todoListId ?? defaultListId ?? null);
    setHasDeadline(!!(existingProject?.deadline));
    setDeadline(existingProject?.deadline || '');
    setDeadlineTime(existingProject?.deadlineTime || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingProject ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Final Project, Research Paper"
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Project Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-full aspect-square rounded-lg ${color.value} transition-all hover:scale-110 ${
                    selectedColor === color.value 
                      ? 'ring-4 ring-gray-400 ring-offset-2' 
                      : 'ring-1 ring-gray-200'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-list">To-Do List (optional)</Label>
            <select
              id="project-list"
              value={selectedListId ?? ''}
              onChange={(e) => setSelectedListId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">No list (standalone project)</option>
              {todoLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              💡 Assign to a list to organize related projects together
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has-deadline"
                checked={hasDeadline}
                onChange={(e) => setHasDeadline(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="has-deadline" className="cursor-pointer text-sm font-normal">
                This project has a deadline
              </Label>
            </div>

            {hasDeadline && (
              <div className="pl-6 space-y-3 animate-in fade-in duration-200">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="project-deadline">Deadline Date</Label>
                    <Input
                      id="project-deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="project-deadline-time">Time</Label>
                    <Input
                      id="project-deadline-time"
                      type="time"
                      value={deadlineTime}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  📅 The deadline will appear on the calendar and auto-fill for new tasks in this project
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : existingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
