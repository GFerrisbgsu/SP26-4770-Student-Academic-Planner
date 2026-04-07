import { useState } from 'react';
import { X, Trash2, Upload, Edit2, Copy, Calendar } from 'lucide-react';
import type { Preset } from '~/types/preset';
import { deletePreset, getUserPresets } from '~/utils/presetUtils';
import { DEFAULT_PRESET_TEMPLATES } from '~/types/preset';

interface PresetLibraryModalProps {
  onClose: () => void;
  onLoadPreset: (preset: Preset) => void;
  onEditPreset?: (preset: Preset) => void;
  userPresets: Preset[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PresetLibraryModal({
  onClose,
  onLoadPreset,
  onEditPreset,
  userPresets
}: PresetLibraryModalProps) {
  const [presets, setPresets] = useState(userPresets);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (presetId: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      if (deletePreset(presetId)) {
        setPresets(prev => prev.filter(p => p.id !== presetId));
      }
    }
  };

  const toggleExpanded = (presetId: string) => {
    setExpandedId(expandedId === presetId ? null : presetId);
  };

  const PresetCard = ({ preset, isTemplate }: { preset: Preset; isTemplate: boolean }) => {
    const isExpanded = expandedId === preset.id;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <button
          onClick={() => toggleExpanded(preset.id)}
          className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 hover:from-blue-100 hover:to-indigo-100 transition-colors text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">{preset.name}</h4>
                {isTemplate && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
                    Template
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {preset.daysOfWeek
                    .map(day => DAY_NAMES[day])
                    .join(', ')}
                </span>
              </div>
              {preset.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">{preset.description}</p>
              )}
            </div>
            <div className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded font-medium whitespace-nowrap">
              {preset.blocks.length} blocks
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
            {/* Blocks List */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Time Blocks</h5>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {preset.blocks.map((block, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 text-sm p-2 bg-white rounded border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{block.title}</div>
                      <div className="text-xs text-gray-600">
                        {formatTime(block.startTime)} - {formatTime(block.endTime)} ({block.tag})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Created: {new Date(preset.createdAt).toLocaleDateString()}</div>
              {preset.updatedAt !== preset.createdAt && (
                <div>Updated: {new Date(preset.updatedAt).toLocaleDateString()}</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onLoadPreset(preset)}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Load Preset
              </button>
              {!isTemplate && (
                <>
                  {onEditPreset && (
                    <button
                      onClick={() => onEditPreset(preset)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Preset Library</h2>
              <p className="text-sm text-gray-600 mt-1">
                {presets.length} custom preset{presets.length !== 1 ? 's' : ''} • {DEFAULT_PRESET_TEMPLATES.length} templates
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {/* Custom Presets */}
            {presets.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">My Presets</h3>
                <div className="space-y-3">
                  {presets.map(preset => (
                    <PresetCard key={preset.id} preset={preset} isTemplate={false} />
                  ))}
                </div>
              </div>
            )}

            {presets.length === 0 && (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">No custom presets saved yet.</p>
                <p className="text-sm text-gray-500 mt-1">Create a time block and save it as a preset to get started!</p>
              </div>
            )}

            {/* Templates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Templates</h3>
              <div className="space-y-3">
                {DEFAULT_PRESET_TEMPLATES.map(template => (
                  <PresetCard key={template.id} preset={template} isTemplate={true} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close Library
          </button>
        </div>
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
