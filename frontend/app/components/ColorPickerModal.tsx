import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  courseName: string;
}

const availableColors = [
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Teal', class: 'bg-teal-500' },
  { name: 'Pink', class: 'bg-pink-500' },
  { name: 'Yellow', class: 'bg-yellow-600' },
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Gray', class: 'bg-gray-600' },
  { name: 'Lime', class: 'bg-lime-600' },
];

export function ColorPickerModal({ isOpen, onClose, currentColor, onSelectColor, courseName }: ColorPickerModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleColorSelect = (color: string) => {
    onSelectColor(color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Change Course Color</h2>
            <p className="text-sm text-gray-500 mt-1">{courseName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Color grid */}
        <div className="grid grid-cols-4 gap-3">
          {availableColors.map((color) => (
            <button
              key={color.class}
              onClick={() => handleColorSelect(color.class)}
              className={`
                relative aspect-square rounded-lg transition-all
                ${color.class}
                ${currentColor === color.class ? 'ring-4 ring-offset-2 ring-gray-400 scale-105' : 'hover:scale-110'}
              `}
              aria-label={`Select ${color.name}`}
            >
              {/* Checkmark for selected color */}
              {currentColor === color.class && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Color name labels */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Click a color to apply it to all {courseName} events
          </p>
        </div>
      </div>
    </div>
  );
}
