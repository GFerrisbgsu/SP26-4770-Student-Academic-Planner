import { useState, useMemo } from 'react';
import { X, Calendar, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import type { Course } from '~/types/course';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onConfirm: (schedule: string) => void;
  enrolledCourses?: Course[];
}

/** Day abbreviation to full name map */
const DAY_LABELS: Record<string, string> = { Su: 'Sun', M: 'Mon', Tu: 'Tue', W: 'Wed', Th: 'Thu', F: 'Fri', Sa: 'Sat' };

/** Parse a schedule string like "MWF 10:00-11:00" into structured data */
function parseScheduleForConflict(schedule: string): { days: string[], start: number, end: number } | null {
  if (!schedule) return null;
  const parts = schedule.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const dayString = parts[0];
  const timeMatch = parts[1].match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
  if (!timeMatch) return null;

  const days: string[] = [];
  const validDays = ['Su', 'Sa', 'Th', 'Tu', 'M', 'W', 'F'];
  let i = 0;
  while (i < dayString.length) {
    let found = false;
    for (const d of validDays) {
      if (dayString.substring(i, i + d.length) === d) {
        days.push(d);
        i += d.length;
        found = true;
        break;
      }
    }
    if (!found) i++;
  }

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  return { days, start: toMinutes(timeMatch[1]), end: toMinutes(timeMatch[2]) };
}

interface ConflictInfo {
  courseCode: string;
  courseName: string;
  day: string;
  schedule: string;
}

const DAY_OPTIONS = [
  { label: 'Mon', value: 'M' },
  { label: 'Tue', value: 'Tu' },
  { label: 'Wed', value: 'W' },
  { label: 'Thu', value: 'Th' },
  { label: 'Fri', value: 'F' },
  { label: 'Sat', value: 'Sa' },
  { label: 'Sun', value: 'Su' },
];

/**
 * Checks whether a schedule string has enough info to generate calendar events.
 * Requires both day abbreviations AND a time range (e.g., "MWF 10:00-11:00").
 */
export function hasValidSchedule(schedule: string | undefined | null): boolean {
  if (!schedule || schedule.trim() === '') return false;

  const parts = schedule.trim().split(/\s+/);
  if (parts.length < 2) return false;

  const dayString = parts[0];
  const timeRange = parts[1];

  // Check days - must contain at least one valid day abbreviation
  const dayPattern = /^(Su|Sa|Th|Tu|M|W|F)+$/;
  if (!dayPattern.test(dayString)) return false;

  // Check time range - must be HH:MM-HH:MM
  const timePattern = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
  if (!timePattern.test(timeRange)) return false;

  return true;
}

/**
 * Extracts whatever partial info exists in a schedule string.
 * Returns days and/or time components if found, even if incomplete.
 */
function parsePartialSchedule(schedule: string): { days: string[], startTime: string, endTime: string } {
  const result = { days: [] as string[], startTime: '', endTime: '' };
  if (!schedule) return result;

  const parts = schedule.trim().split(/\s+/);
  
  // Try to extract days from first part
  if (parts.length >= 1) {
    const dayString = parts[0];
    let i = 0;
    const validDays = ['Su', 'Sa', 'Th', 'Tu', 'M', 'W', 'F'];
    while (i < dayString.length) {
      let found = false;
      for (const d of validDays) {
        if (dayString.substring(i, i + d.length) === d) {
          result.days.push(d);
          i += d.length;
          found = true;
          break;
        }
      }
      if (!found) i++;
    }
  }

  // Try to extract time from second part or fallback
  const timeCandidate = parts.length >= 2 ? parts[1] : parts[0];
  const timeMatch = timeCandidate.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
  if (timeMatch) {
    result.startTime = timeMatch[1];
    result.endTime = timeMatch[2];
  }

  return result;
}

export function ScheduleModal({ isOpen, onClose, course, onConfirm, enrolledCourses = [] }: ScheduleModalProps) {
  // Pre-fill from any partial schedule data
  const partial = parsePartialSchedule(course.schedule || '');
  
  const [selectedDays, setSelectedDays] = useState<string[]>(partial.days);
  const [startTime, setStartTime] = useState(partial.startTime || '09:00');
  const [endTime, setEndTime] = useState(partial.endTime || '10:00');
  const [error, setError] = useState<string | null>(null);

  // Detect conflicts with enrolled course schedules
  const conflicts = useMemo<ConflictInfo[]>(() => {
    if (selectedDays.length === 0 || !startTime || !endTime || startTime >= endTime) return [];

    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);

    const found: ConflictInfo[] = [];

    for (const ec of enrolledCourses) {
      if (ec.id === course.id) continue; // skip self
      const parsed = parseScheduleForConflict(ec.schedule);
      if (!parsed) continue;

      // Check if any selected day overlaps with this course's days AND times overlap
      for (const day of selectedDays) {
        if (parsed.days.includes(day) && newStart < parsed.end && newEnd > parsed.start) {
          found.push({
            courseCode: ec.code,
            courseName: ec.name,
            day,
            schedule: ec.schedule,
          });
        }
      }
    }
    return found;
  }, [selectedDays, startTime, endTime, enrolledCourses, course.id]);

  if (!isOpen) return null;

  const toggleDay = (dayValue: string) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
    setError(null);
  };

  const handleSubmit = () => {
    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }
    if (!startTime || !endTime) {
      setError('Please set both start and end times');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    // Build schedule string in format "MWF 10:00-11:00"
    // Sort days in standard order
    const dayOrder = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
    const sortedDays = [...selectedDays].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    const schedule = `${sortedDays.join('')} ${startTime}-${endTime}`;
    
    onConfirm(schedule);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Set Course Schedule</h2>
            <p className="text-sm text-gray-500 mt-0.5">{course.code} — {course.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              This course doesn't have a complete schedule yet. Please enter the days and times so it can appear on your calendar.
            </p>
          </div>

          {/* Current Schedule Info */}
          {course.schedule && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Current info:</span> {course.schedule}
            </div>
          )}

          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Class Days
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAY_OPTIONS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays.includes(day.value)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Class Time
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setError(null); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-gray-400 mt-5">—</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setError(null); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Schedule conflict detected</p>
                  <ul className="mt-1 space-y-0.5">
                    {conflicts.map((c, i) => (
                      <li key={i} className="text-sm text-amber-700">
                        {c.courseCode} on {DAY_LABELS[c.day] || c.day} ({c.schedule})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedDays.length > 0 && startTime && endTime && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Schedule preview:</span>{' '}
                {(() => {
                  const dayOrder = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
                  const sorted = [...selectedDays].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
                  return sorted.map(d => DAY_LABELS[d]).join(', ');
                })()}{' '}
                {startTime}–{endTime}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Set Schedule & Enroll
          </button>
        </div>
      </div>
    </div>
  );
}
