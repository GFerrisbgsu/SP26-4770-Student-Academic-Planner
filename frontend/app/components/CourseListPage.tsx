import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Search, BookOpen, Plus, Minus } from 'lucide-react';
import { getAllCourses, getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';

interface CourseListPageProps {
  isWhatIfMode: boolean;
  whatIfCourseIds: string[];
  onToggleWhatIfMode: () => void;
  onAddWhatIfCourse: (courseId: string) => void;
  onRemoveWhatIfCourse: (courseId: string) => void;
  onClearWhatIf: () => void;
}

export function CourseListPage({ 
  isWhatIfMode, 
  whatIfCourseIds, 
  onToggleWhatIfMode,
  onAddWhatIfCourse,
  onRemoveWhatIfCourse,
  onClearWhatIf
}: CourseListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses on mount
  useEffect(() => {
    async function loadCourses() {
      try {
        const [all, enrolled] = await Promise.all([
          getAllCourses(),
          getEnrolledCourses()
        ]);
        setAllCourses(all);
        setEnrolledCourses(enrolled);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Get unique subjects
  const subjects = ['All', ...Array.from(new Set(allCourses.map(c => c.subject).filter(Boolean))).sort()];

  // Filter courses
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === 'All' || course.subject === selectedSubject;
    
    const courseNumber = course.number ? parseInt(course.number) : 0;
    const matchesLevel = 
      selectedLevel === 'All' ||
      (selectedLevel === '100-199' && courseNumber >= 100 && courseNumber < 200) ||
      (selectedLevel === '200-299' && courseNumber >= 200 && courseNumber < 300) ||
      (selectedLevel === '300-399' && courseNumber >= 300 && courseNumber < 400) ||
      (selectedLevel === '400+' && courseNumber >= 400);
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calendar
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Course Catalog</h1>
              <p className="text-gray-600">Browse and explore available courses</p>
            </div>
            <button
              onClick={onToggleWhatIfMode}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isWhatIfMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {isWhatIfMode ? 'Exit What If Mode' : 'What If Mode'}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by name, code, or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Levels</option>
                  <option value="100-199">100-199 (Introductory)</option>
                  <option value="200-299">200-299 (Intermediate)</option>
                  <option value="300-399">300-399 (Advanced)</option>
                  <option value="400+">400+ (Senior/Graduate)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
        </div>

        {/* Course List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map(course => {
            const isInWhatIfList = whatIfCourseIds.includes(course.id);
            const originallyEnrolled = enrolledCourses.some(c => c.id === course.id);
            
            if (isWhatIfMode) {
              // In What If Mode - show cards with +/- buttons, not clickable
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`${course.color} w-3 h-3 rounded-full flex-shrink-0 mt-1`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="font-medium text-sm">{course.code}</span>
                        {originallyEnrolled && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Enrolled
                          </span>
                        )}
                        {isInWhatIfList && !originallyEnrolled && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Added
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 mb-1 font-medium">{course.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{course.instructor}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                        <span>{course.schedule}</span>
                        <span>•</span>
                        <span>{course.credits} credits</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-600 font-medium">Offered:</span>
                        {course.semesters.map(semester => (
                          <span 
                            key={semester}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                          >
                            {semester}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        <span className="font-medium">History:</span> {course.history.slice(0, 3).join(', ')}
                        {course.history.length > 3 && ` +${course.history.length - 3} more`}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isInWhatIfList ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onRemoveWhatIfCourse(course.id);
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          aria-label="Remove course"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onAddWhatIfCourse(course.id);
                          }}
                          className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                          aria-label="Add course"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            
            // Normal mode - clickable cards
            return (
              <Link
                key={course.id}
                to={`/course/${course.id}?from=catalog`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`${course.color} w-3 h-3 rounded-full flex-shrink-0 mt-1`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-sm">{course.code}</span>
                      {course.enrolled && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Enrolled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 mb-1 font-medium">{course.name}</p>
                    <p className="text-xs text-gray-500 mb-1">{course.instructor}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                      <span>{course.schedule}</span>
                      <span>•</span>
                      <span>{course.credits} credits</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-gray-600 font-medium">Offered:</span>
                      {course.semesters.map(semester => (
                        <span 
                          key={semester}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                        >
                          {semester}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      <span className="font-medium">History:</span> {course.history.slice(0, 3).join(', ')}
                      {course.history.length > 3 && ` +${course.history.length - 3} more`}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
