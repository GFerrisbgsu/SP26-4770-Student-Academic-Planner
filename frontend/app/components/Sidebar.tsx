import { Link } from 'react-router';
import { BookOpen, User, AlertTriangle, X } from 'lucide-react';
import { getAllCourses, getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';
import { ColorPickerModal } from './ColorPickerModal';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  courseColors: Record<string, string>;
  onCourseColorChange: (courseId: string, newColor: string) => void;
  isWhatIfMode: boolean;
  whatIfCourseIds: string[];
  onClearWhatIf: () => void;
}

// Parse schedule to get time slots
function parseScheduleToTimeSlots(schedule: string): { days: string[], startTime: number, endTime: number } | null {
  const parts = schedule.split(' ');
  if (parts.length < 2) return null;

  const dayString = parts[0];
  const timeRange = parts[1];

  // Map day abbreviations
  const dayMap: { [key: string]: string } = {
    'Su': 'Su',
    'M': 'M',
    'Tu': 'Tu',
    'W': 'W',
    'Th': 'Th',
    'F': 'F',
    'Sa': 'Sa'
  };

  // Parse days
  const days: string[] = [];
  let i = 0;
  while (i < dayString.length) {
    if (i + 1 < dayString.length && dayString.substring(i, i + 2) in dayMap) {
      days.push(dayString.substring(i, i + 2));
      i += 2;
    } else if (dayString[i] in dayMap) {
      days.push(dayString[i]);
      i += 1;
    } else {
      i += 1;
    }
  }

  // Parse time range
  const [startStr, endStr] = timeRange.split('-');
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const startTime = parseTime(startStr);
  const endTime = parseTime(endStr);

  return { days, startTime, endTime };
}

// Check if two time slots conflict
function timeSlotsConflict(
  slot1: { days: string[], startTime: number, endTime: number },
  slot2: { days: string[], startTime: number, endTime: number }
): boolean {
  // Check if they share any days
  const sharedDays = slot1.days.some(day => slot2.days.includes(day));
  if (!sharedDays) return false;

  // Check if times overlap
  return slot1.startTime < slot2.endTime && slot1.endTime > slot2.startTime;
}

export function Sidebar({ 
  isCollapsed, 
  courseColors, 
  onCourseColorChange,
  isWhatIfMode,
  whatIfCourseIds,
  onClearWhatIf
}: SidebarProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses on mount
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const [enrolled, all] = await Promise.all([
          getEnrolledCourses(),
          getAllCourses()
        ]);
        setEnrolledCourses(enrolled);
        setAllCourses(all);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleColorCircleClick = (e: React.MouseEvent, course: Course) => {
    e.preventDefault(); // Prevent navigation to course page
    e.stopPropagation();
    setSelectedCourse(course);
    setColorPickerOpen(true);
  };

  // Get courses to display based on What If Mode
  const displayCourses = isWhatIfMode 
    ? allCourses.filter(course => whatIfCourseIds.includes(course.id))
    : enrolledCourses;

  // Detect conflicts between courses
  const getConflictingCourseIds = (): Set<string> => {
    const conflictingIds = new Set<string>();
    
    for (let i = 0; i < displayCourses.length; i++) {
      const course1 = displayCourses[i];
      const slot1 = parseScheduleToTimeSlots(course1.schedule);
      if (!slot1) continue;

      for (let j = i + 1; j < displayCourses.length; j++) {
        const course2 = displayCourses[j];
        const slot2 = parseScheduleToTimeSlots(course2.schedule);
        if (!slot2) continue;

        if (timeSlotsConflict(slot1, slot2)) {
          conflictingIds.add(course1.id);
          conflictingIds.add(course2.id);
        }
      }
    }
    
    return conflictingIds;
  };

  const conflictingCourseIds = getConflictingCourseIds();

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'w-0' : 'w-80'} bg-white border-r border-gray-200 h-screen overflow-hidden transition-all duration-300`}>
        <div className="p-6">
          <p className="text-gray-500">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isCollapsed ? 'w-0' : 'w-80'} bg-white border-r border-gray-200 h-screen overflow-hidden transition-all duration-300`}>
        <div className="p-6 overflow-y-auto h-full hide-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
                aria-label="View profile"
              >
                <User className="w-5 h-5 text-white" />
              </Link>
              <h2 className="text-xl font-semibold">My Courses</h2>
            </div>
            {isWhatIfMode && (
              <button
                onClick={onClearWhatIf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex-shrink-0"
                aria-label="Exit What If Mode"
              >
                <X className="w-4 h-4" />
                What If
              </button>
            )}
          </div>
          <div className="space-y-3">
            {displayCourses.map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => handleColorCircleClick(e, course)}
                    className={`${courseColors[course.id] || course.color} w-3 h-3 rounded-full flex-shrink-0 mt-0.5 hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 transition-all cursor-pointer`}
                    aria-label={`Change color for ${course.code}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-sm">{course.code}</span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1 line-clamp-2">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.instructor}</p>
                    <p className="text-xs text-gray-400 mt-1">{course.schedule}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {course.semesters.map(semester => (
                        <span 
                          key={semester}
                          className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {semester}
                        </span>
                      ))}
                    </div>
                    {conflictingCourseIds.has(course.id) && (
                      <div className="mt-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 inline-block mr-1" />
                        <span className="text-xs text-red-500">Conflicts with other courses</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {selectedCourse && (
        <ColorPickerModal
          isOpen={colorPickerOpen}
          onClose={() => setColorPickerOpen(false)}
          currentColor={courseColors[selectedCourse.id] || selectedCourse.color}
          onSelectColor={(newColor) => onCourseColorChange(selectedCourse.id, newColor)}
          courseName={selectedCourse.code}
        />
      )}
    </>
  );
}
