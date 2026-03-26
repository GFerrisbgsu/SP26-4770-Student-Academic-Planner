import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  isPredefined: boolean;
}

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
  onDelete: (categoryId: number) => Promise<void>;
  isLoading?: boolean;
}

const COLOR_PRESETS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#0ea5e9', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

export function EditCategoryModal({
  open,
  onOpenChange,
  category,
  onSubmit,
  onDelete,
  isLoading,
}: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0ea5e9');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when modal opens or category changes
  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setColor(category.color);
      setError('');
      setIsDeleting(false);
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await onSubmit({ name: name.trim(), color });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update category'
      );
    }
  };

  const handleDelete = async () => {
    if (!category || !window.confirm(`Delete "${category.name}"? This cannot be undone.`)) {
      return;
    }

    setError('');
    setIsDeleting(true);

    try {
      await onDelete(category.id);
      onOpenChange(false);
    } catch (err) {
      setIsDeleting(false);
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the name and color of your budget category
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category Name */}
          <div className="space-y-2">
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-900">
              Category Name
            </label>
            <Input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              disabled={isLoading || isDeleting}
              className="w-full"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              Category Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  disabled={isLoading || isDeleting}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === preset ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: preset }}
                  aria-label={`Select color ${preset}`}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isLoading || isDeleting}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isLoading || isDeleting}
                placeholder="#0ea5e9"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <p className="text-sm text-gray-700">{name || 'Preview'}</p>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex gap-2 justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="mr-auto"
            >
              {isDeleting ? 'Deleting...' : 'Delete Category'}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isDeleting}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
