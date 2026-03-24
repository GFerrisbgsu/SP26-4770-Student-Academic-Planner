import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Award, Calendar, CheckCircle, Circle, Clock } from 'lucide-react';
import { getDegreeProgress, getRequirementCategories } from '~/services/courseService';
import type { DegreeProgressDTO, RequirementCategoryDTO } from '~/types/course';

export function DegreeProgressPage() {
  const navigate = useNavigate();
  const [degreeInfo, setDegreeInfo] = useState<DegreeProgressDTO | null>(null);
  const [requirementCategories, setRequirementCategories] = useState<RequirementCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch degree progress and requirements on component mount
  useEffect(() => {
    async function loadDegreeData() {
      try {
        const [progress, requirements] = await Promise.all([
          getDegreeProgress(),
          getRequirementCategories()
        ]);
        setDegreeInfo(progress);
        setRequirementCategories(requirements);
        setError(null);
      } catch (err) {
        console.error('Failed to load degree progress:', err);
        setError(err instanceof Error ? err.message : 'Failed to load degree progress');
      } finally {
        setLoading(false);
      }
    }
    loadDegreeData();
  }, []);

  // Return loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading degree progress...</p>
        </div>
      </div>
    );
  }

  // Return error state
  if (error || !degreeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Degree Progress</h2>
          <p className="text-gray-600 mb-6">{error || 'No degree progress data found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const creditsRemaining = degreeInfo.totalCreditsRequired - degreeInfo.creditsCompleted - degreeInfo.creditsInProgress;
  const completionPercentage = ((degreeInfo.creditsCompleted + degreeInfo.creditsInProgress) / degreeInfo.totalCreditsRequired) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inProgress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'notStarted':
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation Bar */}
      {/* Side Navigation Bar handled by root layout */}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold">Degree Progress</h1>
              <p className="text-sm text-gray-600">{degreeInfo.program}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
              <Award className="w-5 h-5 text-purple-600" />
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
                            {course.status === 'completed' && (
                              <span className="px-3 py-1 rounded-full text-sm font-medium text-green-700 bg-green-50">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {category.courses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Circle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No courses taken yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
