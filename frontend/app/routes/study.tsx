import type { Route } from "./+types/study";
import { Timer, CircleDot, BookOpen } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Study Tools - Student Life" },
    { name: "description", content: "Access study tools and focus aids" },
  ];
}

export default function Study() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Study Tools</h1>
          <p className="text-sm text-gray-500">Focus aids and productivity tools</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Focus Timer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Timer className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Focus Timer</h2>
                <p className="text-sm text-gray-500">Pomodoro technique timer</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Stay focused with timed study sessions and breaks. Uses the proven Pomodoro technique.
            </p>
            <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Start Timer
            </button>
          </div>

          {/* Picker Wheel Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CircleDot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Picker Wheel</h2>
                <p className="text-sm text-gray-500">Random decision maker</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Can't decide what to study? Let the wheel choose for you from your courses or tasks.
            </p>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Spin the Wheel
            </button>
          </div>

          {/* Flashcards Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Flashcards</h2>
                <p className="text-sm text-gray-500">Review and memorize</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Create and review flashcards to help memorize key concepts for your courses.
            </p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
