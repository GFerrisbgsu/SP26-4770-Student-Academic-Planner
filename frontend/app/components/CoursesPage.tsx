import { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Search, Award, Calendar, CheckCircle, Circle, Clock, List, Minus, Sparkles } from 'lucide-react';
import { getAllCourses, getEnrolledCourses, getDegreeProgress, getRequirementCategories } from '~/services/courseService';
import { enrollmentService } from '~/services/enrollmentService';
import type { Course, CourseDTO, DegreeProgressDTO, RequirementCategoryDTO } from '~/types/course';
import type { EnrollCourseRequest } from '~/types/program';
import { Link } from 'react-router';
import { ScheduleModal, hasValidSchedule } from '~/components/ScheduleModal';
import { AddCourseModal } from '~/components/AddCourseModal';
import courseMapImage from '~/assets/dbf8c6581607b795f932fe8663f3060e21f1fdc9.png';

export function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'catalog' | 'degree-progress'>('my-courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [customCourses, setCustomCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);
  const [scheduleModalCourse, setScheduleModalCourse] = useState<Course | null>(null);
  const [addCourseModalOpen, setAddCourseModalOpen] = useState(false);
  const [requirementCategories, setRequirementCategories] = useState<RequirementCategoryDTO[]>([]);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const [all, enrolled, requirements] = await Promise.all([
          getAllCourses(),
          getEnrolledCourses(),
          getRequirementCategories()
        ]);
        setAllCourses(all);

        // Load custom courses from localStorage
        let customCoursesToLoad: Course[] = [];
        const savedCustomCourses = localStorage.getItem('customCourses');
        if (savedCustomCourses) {
          try {
            customCoursesToLoad = JSON.parse(savedCustomCourses);
            setCustomCourses(customCoursesToLoad);
          } catch (e) {
            console.error('Failed to parse custom courses:', e);
          }
        }

        // Merge enrolled courses from API with custom courses
        const mergedEnrolled = [...enrolled, ...customCoursesToLoad];
        setEnrolledCourses(mergedEnrolled);
        setRequirementCategories(requirements);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);



  // Mock degree data
  const degreeInfo = {
    program: "Bachelor of Science in Computer Science",
    expectedGraduation: "May 2028",
    totalCreditsRequired: 122,
    creditsCompleted: 45,
    creditsInProgress: 15,
    currentGPA: 3.67,
    cumulativeGPA: 3.72
  };

  const creditsRemaining = degreeInfo.totalCreditsRequired - degreeInfo.creditsCompleted - degreeInfo.creditsInProgress;
  const completionPercentage = ((degreeInfo.creditsCompleted + degreeInfo.creditsInProgress) / degreeInfo.totalCreditsRequired) * 100;

  // Calculate total enrolled credits
  const MAX_CREDITS = 18;
  const totalEnrolledCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits ?? 0), 0);

  // Get unique subjects for filter
  const subjects = ['all', ...new Set([...allCourses, ...customCourses].map(c => c.subject).filter(Boolean))];

  // Filter and sort courses for catalog (include both database and custom courses)
  const filteredCourses = [...allCourses, ...customCourses]
    .filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || course.subject === filterSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      const subjectCmp = (a.subject ?? '').localeCompare(b.subject ?? '');
      if (subjectCmp !== 0) return subjectCmp;
      return (a.code ?? '').localeCompare(b.code ?? '');
    });

  // Reload courses from the API
  const reloadCourses = async () => {
    try {
      const [all, enrolled] = await Promise.all([
        getAllCourses(),
        getEnrolledCourses()
      ]);
      setAllCourses(all);
      
      // Load custom courses from localStorage and merge
      const savedCustomCourses = localStorage.getItem('customCourses');
      let customCoursesToMerge: Course[] = [];
      if (savedCustomCourses) {
        try {
          customCoursesToMerge = JSON.parse(savedCustomCourses);
        } catch (e) {
          console.error('Failed to parse custom courses:', e);
        }
      }
      
      // Merge enrolled courses with custom courses
      const mergedEnrolled = [...enrolled, ...customCoursesToMerge];
      setEnrolledCourses(mergedEnrolled);
    } catch (error) {
      console.error('Failed to reload courses:', error);
    }
  };

  // Handle creating a custom course
  const handleCreateCustomCourse = async (courseData: Partial<Course>) => {
    try {
      const newCourse: Course = {
        id: courseData.id || `custom-${Date.now()}`,
        name: courseData.name || '',
        code: courseData.code || '',
        subject: courseData.subject || 'Custom',
        color: courseData.color || 'bg-blue-500',
        instructor: courseData.instructor || '',
        schedule: courseData.schedule || '',
        credits: courseData.credits || 3,
        semesters: courseData.semesters || [],
        history: courseData.history || [],
        description: courseData.description,
        enrolled: true,
      };

      // Add to custom courses and save to localStorage
      const updatedCustomCourses = [...customCourses, newCourse];
      setCustomCourses(updatedCustomCourses);
      localStorage.setItem('customCourses', JSON.stringify(updatedCustomCourses));

      // Automatically enroll the user in the custom course
      setEnrolledCourses([...enrolledCourses, newCourse]);
    } catch (error) {
      console.error('Failed to create custom course:', error);
      throw error;
    }
  };

  // Handle enrolling in a course
  const handleEnroll = async (course: Course, schedule?: string) => {
    setEnrollingId(course.id);
    try {
      // Create enrollment request - TODO: Get actual current semester ID
      // For now, using hardcoded semester ID (should be fetched from current semester context)
      const enrollRequest: EnrollCourseRequest = {
        courseId: course.id,
        semesterId: 1 // TODO: Get current semester ID dynamically
      };
      
      // If schedule provided, update the course before enrolling
      if (schedule) {
        course.schedule = schedule;
      }
      await enrollmentService.enrollCourse(enrollRequest);
      await reloadCourses();
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setEnrollingId(null);
    }
  };

  // Handle unenrolling from a course
  const handleUnenroll = async (courseId: string) => {
    setUnenrollingId(courseId);
    try {
      // Check if this is a custom course
      const isCustomCourse = customCourses.some(c => c.id === courseId);
      if (isCustomCourse) {
        // Remove from custom courses localStorage
        const updatedCustomCourses = customCourses.filter(c => c.id !== courseId);
        setCustomCourses(updatedCustomCourses);
        localStorage.setItem('customCourses', JSON.stringify(updatedCustomCourses));
      } else {
        // Only call backend API for non-custom courses
        await enrollmentService.unenrollCourse(courseId);
      }
      
      await reloadCourses();
    } catch (error) {
      console.error('Failed to unenroll:', error);
    } finally {
      setUnenrollingId(null);
    }
  };

  // Called when user clicks "+" on a catalog course
  const handleEnrollClick = (course: Course) => {
    const courseCredits = course.credits ?? 0;
    if (totalEnrolledCredits + courseCredits > MAX_CREDITS) {
      alert(`Cannot enroll: adding ${course.code} (${courseCredits} credits) would exceed the ${MAX_CREDITS} credit hour limit. You currently have ${totalEnrolledCredits} credits enrolled.`);
      return;
    }
    if (hasValidSchedule(course.schedule)) {
      // Schedule is complete, enroll directly
      handleEnroll(course);
    } else {
      // Schedule is missing/incomplete, show modal
      setScheduleModalCourse(course);
    }
  };

  // Called when user confirms schedule in modal
  const handleScheduleConfirm = (schedule: string) => {
    if (scheduleModalCourse) {
      handleEnroll(scheduleModalCourse, schedule);
      setScheduleModalCourse(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inProgress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="flex min-h-full bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold">Courses</h1>
              <p className="text-sm text-gray-600">Manage your academic journey</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('my-courses')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'my-courses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4" />
                My Courses
              </div>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'catalog'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course Catalog
              </div>
            </button>
            <button
              onClick={() => setActiveTab('degree-progress')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'degree-progress'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Degree Progress
              </div>
            </button>
          </div>
        </div>
      

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Enrolled Courses</h2>
              <p className="text-sm text-gray-600">
                Currently taking {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}{' '}
                <span className={`font-medium ${totalEnrolledCredits >= MAX_CREDITS ? 'text-red-600' : totalEnrolledCredits >= MAX_CREDITS - 3 ? 'text-amber-600' : 'text-gray-600'}`}>
                  ({totalEnrolledCredits}/{MAX_CREDITS} credit hours)
                </span>
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-500">Loading your courses...</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Enrolled Courses</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Browse the course catalog to find and enroll in courses.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Browse Catalog
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative group"
                >
                  <div className={`${course.color} h-1 w-full rounded-full mb-4`}></div>
                  <div className="mb-2">
                    <div className="text-sm text-gray-600 mb-1">{course.code}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{course.name}</h3>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3" />
                      {course.schedule || 'No schedule set'}
                    </div>
                    <div>{course.instructor}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{course.credits} credits</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnenroll(course.id); }}
                      disabled={unenrollingId === course.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Unenroll from course"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      {unenrollingId === course.id ? 'Removing...' : 'Unenroll'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Course Catalog Tab */}
        {activeTab === 'catalog' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Course Catalog</h2>
              <p className="text-sm text-gray-600">Browse available courses</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setAddCourseModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap shadow-sm"
                title="Add a custom course"
              >
                <Sparkles className="w-4 h-4" />
                Add Course
              </button>
            </div>

            {/* Course List */}
            <div className="space-y-3">
              {filteredCourses.map(course => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}?from=catalog`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`${course.color} px-3 py-1 rounded text-white text-sm font-medium`}>
                          {course.code}
                        </div>
                        {course.enrolled && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Enrolled
                          </span>
                        )}
                        {customCourses.some(c => c.id === course.id) && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            <Sparkles className="w-3 h-3" />
                            Custom
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                      {course.description && (
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{course.credits} credits</span>
                        <span>•</span>
                        <span>{course.instructor}</span>
                        <span>•</span>
                        <span>{(course.semesters ?? []).join(', ')}</span>
                      </div>
                    </div>
                    <span className="px-4 py-2 text-sm text-blue-600 ml-4 shrink-0">
                      View Details
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Degree Progress Tab */}
        {activeTab === 'degree-progress' && (
          degreeInfo ? (
          <div>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-600">Total Credits</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{degreeInfo.creditsCompleted + degreeInfo.creditsInProgress}</p>
                <p className="text-sm text-gray-500 mt-1">of {degreeInfo.totalCreditsRequired} required</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{degreeInfo.creditsCompleted}</p>
                <p className="text-sm text-gray-500 mt-1">credits earned</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-medium text-gray-600">Graduation</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{degreeInfo.expectedGraduation}</p>
                <p className="text-sm text-gray-500 mt-1">Expected date</p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
              <h2 className="text-lg font-semibold mb-4">Overall Degree Progress</h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Status</span>
                  <span className="text-sm font-semibold text-blue-600">{completionPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className="flex h-full">
                    <div 
                      className="bg-green-500 transition-all duration-500"
                      style={{ width: `${(degreeInfo.creditsCompleted / degreeInfo.totalCreditsRequired) * 100}%` }}
                    />
                    <div 
                      className="bg-blue-400 transition-all duration-500"
                      style={{ width: `${(degreeInfo.creditsInProgress / degreeInfo.totalCreditsRequired) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{degreeInfo.creditsCompleted}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{degreeInfo.creditsInProgress}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{creditsRemaining}</p>
                </div>
              </div>
            </div>

            {/* Course Map Visualization */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
              <h2 className="text-lg font-semibold mb-4">BS in Computer Science Course Map</h2>
              <p className="text-sm text-gray-600 mb-4">
                Map shows typical course sequences for BS/CS majors. Core CS courses require a grade of C or higher to advance to the next course.
              </p>
              <div className="overflow-x-auto">
                <img 
                  src={courseMapImage} 
                  alt="BS in CS Course Map" 
                  className="w-full max-w-5xl mx-auto rounded-lg border border-gray-300"
                />
              </div>
            </div>

            {/* Requirements Breakdown */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Requirements by Category</h2>
              
              {requirementCategories.map((category) => {
                const categoryPercentage = ((category.completed + category.inProgress) / category.required) * 100;
                const remaining = category.required - category.completed - category.inProgress;
                
                return (
                  <div key={category.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {category.completed + category.inProgress} of {category.required} credits
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{categoryPercentage.toFixed(0)}%</p>
                          <p className="text-xs text-gray-500">{remaining} credits remaining</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-6">
                        <div className="flex h-full">
                          <div 
                            className="bg-green-500 transition-all duration-500"
                            style={{ width: `${(category.completed / category.required) * 100}%` }}
                          />
                          <div 
                            className="bg-blue-400 transition-all duration-500"
                            style={{ width: `${(category.inProgress / category.required) * 100}%` }}
                          />
                        </div>
                      </div>

                      {category.courses.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Courses</h4>
                          {category.courses.map((course) => (
                            <div key={course.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3 flex-1">
                                {getStatusIcon(course.status)}
                                <div>
                                  <p className="font-medium text-gray-900">{course.code}</p>
                                  <p className="text-sm text-gray-600">{course.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">{course.credits} credits</span>
                                {course.status === 'inProgress' && (
                                  <span className="px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-50">
                                    In Progress
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading degree progress...</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Schedule Modal - shown when enrolling in a course without a complete schedule */}
      {scheduleModalCourse && (
        <ScheduleModal
          isOpen={true}
          onClose={() => setScheduleModalCourse(null)}
          course={scheduleModalCourse}
          onConfirm={handleScheduleConfirm}
          enrolledCourses={enrolledCourses}
        />
      )}

      {/* Add Course Modal - shown when user clicks "Add Course" button */}
      <AddCourseModal
        isOpen={addCourseModalOpen}
        onClose={() => setAddCourseModalOpen(false)}
        onConfirm={handleCreateCustomCourse}
      />
    </div>
  );
}
