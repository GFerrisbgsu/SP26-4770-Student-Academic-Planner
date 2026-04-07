import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Preset, DayOfWeek } from '~/types/preset';

interface EditPresetModalProps {
  preset: Preset;
  onClose: () => void;
  onSave: (updates: Partial<Preset>) => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EditPresetModal({ preset, onClose, onSave }: EditPresetModalProps) {
  const [name, setName] = useState(preset.name);
  const [description, setDescription] = useState(preset.description || '');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(preset.daysOfWeek);
  const [error, setError] = useState('');

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort() as DayOfWeek[]
    );
  };

  const selectWeekdays = () => {
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const selectWeekend = () => {
    setSelectedDays([0, 6]);
  };

  const selectAll = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Preset name cannot be empty');
      return;
    }

    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      daysOfWeek: selectedDays
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Edit Preset</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Preset Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Preset Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Weekday Study Schedule"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a note about this preset..."
              rows={2}
            />
          </div>

          {/* Quick Select Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply to Days (Quick Select)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectWeekdays}
                className="flex-1 px-2 py-1.5 text-xs font-medium bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={selectWeekend}
                className="flex-1 px-2 py-1.5 text-xs font-medium bg-purple-50 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Weekend
              </button>
              <button
                type="button"
                onClick={selectAll}
                className="flex-1 px-2 py-1.5 text-xs font-medium bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                All Days
              </button>
            </div>
          </div>

          {/* Day Selection Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Days *
            </label>
            <div className="grid grid-cols-7 gap-1">
              {DAY_ABBREVIATIONS.map((abbreviation, index) => {
                const dayOfWeek = index as DayOfWeek;
                const isSelected = selectedDays.includes(dayOfWeek);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(dayOfWeek)}
                    className={`py-2 text-xs font-medium rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                    title={DAY_NAMES[index]}
                  >
                    {abbreviation}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blocks Info (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blocks in Preset (Read-only)
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <ul className="space-y-2 text-sm">
                {preset.blocks.map((block, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="text-gray-500 text-xs">•</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{block.title}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(block.startTime)} - {formatTime(block.endTime)} ({block.tag})
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(time: number): string {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
