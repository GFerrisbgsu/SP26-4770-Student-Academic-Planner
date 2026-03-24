import { getTagLabel, getTagInfo, getAllTags, useCustomTags, predefinedTagConfig } from '~/utils/tagUtils';
import type { EventTag } from '~/utils/tagUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface TagSelectorProps {
  value: EventTag;
  onValueChange: (tag: EventTag) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  disabledTags?: string[];
}

export function TagSelector({
  value,
  onValueChange,
  label = 'Category',
  required = false,
  disabled = false,
  disabledTags = [],
}: TagSelectorProps) {
  const { customTags, addTag, deleteTag } = useCustomTags();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');

  // gather combined tag list (predefined + custom)
  const tags = getAllTags();

  const handleSelect = (v: string) => {
    if (v === '__new') {
      setShowCreateDialog(true);
    } else if (v === '__manage') {
      setShowManageDialog(true);
    } else {
      onValueChange(v as EventTag);
    }
  };

  const handleCreate = () => {
    const key = newTagName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!key) {
      alert('Tag name cannot be empty');
      return;
    }
    if (tags.includes(key)) {
      alert('A tag with that name already exists');
      return;
    }
    addTag(key, newTagName, newTagColor);
    onValueChange(key);
    setNewTagName('');
    setNewTagColor('blue');
    setShowCreateDialog(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select value={value} onValueChange={handleSelect} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tags.map((tag) => (
            <SelectItem key={tag} value={tag} disabled={disabledTags.includes(tag)}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getTagInfo(tag)?.color || ''}`} />
                <span>{getTagLabel(tag)}</span>
                {disabledTags.includes(tag) && (
                  <span className="text-xs text-gray-400 ml-1">(no enrolled courses)</span>
                )}
              </div>
            </SelectItem>
          ))}
          <SelectItem key="__new" value="__new">
            <div className="text-blue-600">+ Create new tag...</div>
          </SelectItem>
          {Object.keys(customTags).length > 0 && (
            <SelectItem key="__manage" value="__manage">
              <div className="text-gray-600">⚙️ Manage tags...</div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Dialog for creating a custom tag */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create custom tag</DialogTitle>
            <DialogDescription>Give the tag a name and pick a color.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['blue','green','purple','orange','pink','red','yellow','teal','indigo','gray'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for managing custom tags */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Custom Tags</DialogTitle>
            <DialogDescription>Delete custom tags you no longer need.</DialogDescription>
          </DialogHeader>
          {Object.keys(customTags).length === 0 ? (
            <p className="text-gray-500 text-sm">No custom tags yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(customTags).map(([key, config]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete tag "${config.label}"? Events using this tag will keep the tag name but lose styling.`)) {
                        deleteTag(key);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete tag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
