import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router';
import { ArrowLeft, BookOpen, Clock, User, MapPin, FileText, Calendar, GraduationCap, BookMarked, Tag, Edit2, Check, X } from 'lucide-react';
import { getCourseById } from '~/services/courseService';
import type { CourseDTO } from '~/types/course';
import canvasLogo from '~/assets/22343b487a124e74995e468c0388ab2b6ab33dd7.png';
import coursicleLogo from '~/assets/8a64e37773e95c0484d47cd65db7a39fb7ef7f7d.png';

interface CoursePageProps {
  courseColors: Record<string, string>;
}

export function CoursePage({ courseColors }: CoursePageProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const fromCatalog = location.search.includes('from=catalog');
  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedInstructor, setEditedInstructor] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      try {
        // Check if this is a custom course (ID starts with 'custom-')
        if (courseId.startsWith('custom-')) {
          const savedCustomCourses = localStorage.getItem('customCourses');
          if (savedCustomCourses) {
            try {
              const customCourses = JSON.parse(savedCustomCourses);
              const customCourse = customCourses.find((c: CourseDTO) => c.id === courseId);
              if (customCourse) {
                setCourse(customCourse);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error('Failed to parse custom courses:', e);
            }
          }
          setCourse(null);
          setLoading(false);
          return;
        }
        
        // Regular course from API
        const data = await getCourseById(courseId);
        setCourse(data);
        setEditedInstructor(data.instructor);
        setEditedLocation('');
      } catch (error) {
        console.error('Failed to load course:', error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading course...</h2>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Course not found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to calendar
          </Link>
        </div>
      </div>
    );
  }

  // Prerequisites come from the course's prerequisiteText field (from database)
  const prerequisiteText = course.prerequisiteText || 'None';

  // Use custom color if available
  const courseColor = courseColors[course.id] || course.color;

  return (
    <div className="flex min-h-screen bg-gray-50">

      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <Link
            to={fromCatalog ? "/course-list" : "/"}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {fromCatalog ? "Back to Course Catalog" : "Back to Calendar"}
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className={`${courseColor} h-2`}></div>
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className={`${courseColor} p-3 rounded-lg`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">{course.code}</div>
                  <h1 className="text-3xl font-semibold mb-4">{course.name}</h1>
                  
                  {isEditingDetails ? (
                    <div className="flex flex-col gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                        <input
                          type="text"
                          value={editedInstructor}
                          onChange={(e) => setEditedInstructor(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Instructor name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location/Room</label>
                        <input
                          type="text"
                          value={editedLocation}
                          onChange={(e) => setEditedLocation(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Room number or location"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingDetails(false)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          Done
                        </button>
                        <button
                          onClick={() => {
                            setEditedInstructor(course.instructor);
                            setEditedLocation('');
                            setIsEditingDetails(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {editedInstructor}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {course.schedule}
                      </div>
                      {editedLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {editedLocation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingDetails(true)}
                    className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Edit instructor and location"
                  >
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                  {course.enrolled && (
                    <a
                      href="https://www.instructure.com/canvas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      aria-label="View on Canvas"
                    >
                      <img src={canvasLogo} alt="Canvas" className="w-6 h-6" />
                    </a>
                  )}
                  <a
                    href="https://www.coursicle.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    aria-label="View on Coursicle"
                  >
                    <img src={coursicleLogo} alt="Coursicle" className="w-6 h-6" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">--</div>
                  <div className="text-sm text-gray-600">Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">--</div>
                  <div className="text-sm text-gray-600">Weeks Remaining</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Course Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookMarked className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700">Prerequisites</h3>
                </div>
                <p className="text-sm text-gray-600 pl-6">{prerequisiteText}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700">Credits</h3>
                </div>
                <p className="text-sm text-gray-600 pl-6">{course.credits || '--'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-700">Subject</h3>
                </div>
                <p className="text-sm text-gray-600 pl-6">{course.subject || 'General'}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Semester Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {(course.semesters || []).map(semester => (
                      <span 
                        key={semester}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium"
                      >
                        {semester}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Course History</h3>
                  <div className="space-y-1">
                    {(course.history || []).map((semester, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{semester}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Upcoming Assignments</h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto hide-scrollbar">
                <p className="text-sm text-gray-500">No upcoming assignments</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Course Materials</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto hide-scrollbar">
                <div className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                  <div className="font-medium text-sm">Syllabus</div>
                  <div className="text-xs text-gray-600">PDF • 245 KB</div>
                </div>
                <div className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                  <div className="font-medium text-sm">Lecture Slides</div>
                  <div className="text-xs text-gray-600">Folder • 15 files</div>
                </div>
                <div className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                  <div className="font-medium text-sm">Textbook Resources</div>
                  <div className="text-xs text-gray-600">Link</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
