import { Link, useNavigate } from 'react-router';
import { DollarSign, Clock, Calendar } from 'lucide-react';
// ...existing code...

export function PersonalPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation Bar */}
      {/* Side Navigation Bar handled by root layout */}
      
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Personal Tools</h1>
          <p className="text-gray-600 mt-2">Manage your budget, time, and personal life</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Planner Card */}
          <Link 
            to="/budget-planner"
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Budget Planner</h2>
                <p className="text-sm text-gray-500">Track expenses & income</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Keep track of your income, expenses, and budgets across different categories. 
              Visualize your spending and stay on top of your finances.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                Income Tracking
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                Expense Categories
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                Visual Charts
              </span>
            </div>
          </Link>

          {/* Time Blocking Card */}
          <div 
            onClick={() => navigate('/time-blocking')}
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Time Blocking</h2>
                <p className="text-sm text-gray-500">Plan your day visually</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Plan your day in focused time blocks. Allocate time for school, work, personal activities, 
              and see how you're spending your hours.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                Daily Planning
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                Time Analysis
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                Category Tracking
              </span>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 rounded-xl p-6 opacity-60">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Habit Tracker</h3>
              <p className="text-sm text-gray-600">Build and track daily habits</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 opacity-60">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Goal Planner</h3>
              <p className="text-sm text-gray-600">Set and achieve your goals</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-6 opacity-60">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Wellness Log</h3>
              <p className="text-sm text-gray-600">Track sleep, exercise, and mood</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
