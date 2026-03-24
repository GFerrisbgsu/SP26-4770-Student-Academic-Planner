import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Course } from '~/types/course';

const COLOR_OPTIONS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Teal', value: 'bg-teal-500' },
];

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (courseData: Partial<Course>) => Promise<void>;
}

/**
 * Modal for users to manually add custom courses
 * when they can't find a course in the database
 */
export function AddCourseModal({ isOpen, onClose, onConfirm }: AddCourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    subject: '',
    instructor: '',
    credits: 3,
    schedule: '',
    color: 'bg-blue-500',
    semesters: [] as string[],
    history: [] as string[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) : value
    }));
  };

  const handleSemesterToggle = (semester: string) => {
    setFormData(prev => ({
      ...prev,
      semesters: prev.semesters.includes(semester)
        ? prev.semesters.filter(s => s !== semester)
        : [...prev.semesters, semester]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.code.trim()) {
      setError('Course code is required');
      return;
    }
    if (!formData.name.trim()) {
      setError('Course name is required');
      return;
    }
    if (!formData.instructor.trim()) {
      setError('Instructor name is required');
      return;
    }
    if (!formData.schedule.trim()) {
      setError('Schedule is required (e.g., "MWF 10:00-11:00")');
      return;
    }
    
    // Validate schedule format (basic check: should have day abbreviations and time with colon)
    const hasValidTimeFormat = /\d{1,2}:\d{2}-\d{1,2}:\d{2}/.test(formData.schedule.trim());
    const hasDays = formData.schedule.trim().split(' ')[0];
    if (!hasValidTimeFormat || !hasDays) {
      setError('Invalid schedule format. Use day abbreviations (M, Tu, W, Th, F, Sa, Su) followed by time (e.g., "MWF 10:00-11:00")');
      return;
    }

    setLoading(true);
    try {
      // Generate unique ID for custom course
      const customId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await onConfirm({
        id: customId,
        code: formData.code,
        name: formData.name,
        subject: formData.subject || 'Custom',
        instructor: formData.instructor,
        credits: formData.credits,
        schedule: formData.schedule,
        color: formData.color,
        semesters: formData.semesters.length > 0 ? formData.semesters : ['Custom'],
        history: [],
        enrolled: false,
      });

      // Reset form
      setFormData({
        code: '',
        name: '',
        subject: '',
        instructor: '',
        credits: 3,
        schedule: '',
        color: 'bg-blue-500',
        semesters: [],
        history: [],
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between p-6 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Custom Course</h2>
            <p className="text-sm text-gray-600 mt-1">Create a course that's not in the database</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Course Code and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CS 4000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g., CS, MATH"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Advanced Algorithms"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Instructor and Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor *
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits
              </label>
              <select
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule * <span className="text-gray-500 text-sm font-normal">(Required for calendar display)</span>
            </label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              placeholder="e.g., MWF 10:00-11:00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              <strong>Format:</strong> Day abbreviations (M, Tu, W, Th, F, Sa, Su) + start time - end time
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <strong>Examples:</strong> "MWF 9:00-10:00" or "TuTh 14:30-16:00"
            </p>
          </div>

          {/* Semesters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Semesters <span className="text-gray-500 text-sm font-normal">(Optional)</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Fall', 'Spring', 'Summer', 'Winter'].map(semester => (
                <label key={semester} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.semesters.includes(semester)}
                    onChange={() => handleSemesterToggle(semester)}
                    className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{semester}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {COLOR_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                  className={`w-10 h-10 ${option.value} rounded-lg transition-all border-2 ${
                    formData.color === option.value
                      ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
