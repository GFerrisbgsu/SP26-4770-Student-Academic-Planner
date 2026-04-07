import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { GraduationCap, Calendar as CalendarIcon, BookOpen, User, 
  Lightbulb, List, Menu, X, ChevronLeft, ChevronRight} from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import { Avatar } from '~/components/Avatar';

export function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  //const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
      active 
        ? 'text-blue-600 bg-blue-50 font-medium' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <aside className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header Section with Logo and Toggle */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-3 flex-1">
            <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <h1 className="text-xl font-bold text-gray-900">Student Life</h1>
          </Link>
        )}
        {isCollapsed && (
          <Link to="/" className="flex justify-center w-full">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </Link>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          <Link 
            to="/" 
            className={navLinkClass('/')}
            title={isCollapsed ? 'Calendar' : ''}
          >
            <CalendarIcon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Calendar</span>}
          </Link>

          <Link 
            to="/courses" 
            className={navLinkClass('/courses')}
            title={isCollapsed ? 'Courses' : ''}
          >
            <List className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Courses</span>}
          </Link>

          <Link 
            to="/degree-progress" 
            className={navLinkClass('/degree-progress')}
            title={isCollapsed ? 'Progress' : ''}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Progress</span>}
          </Link>

          <Link 
            to="/personal" 
            className={navLinkClass('/personal')}
            title={isCollapsed ? 'Personal' : ''}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Personal</span>}
          </Link>

          <Link 
            to="/study" 
            className={navLinkClass('/study')}
            title={isCollapsed ? 'Study' : ''}
          >
            <Lightbulb className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Study</span>}
          </Link>
        </div>
      </nav>

      {/* Profile Section at Bottom */}
      <div className="border-t border-gray-200 p-4">
        <Link 
          to="/profile" 
          className={`${navLinkClass('/profile')} justify-center md:justify-start`}
          title={isCollapsed ? 'Profile' : ''}
        >
          {user ? (
            <Avatar 
              firstName={user.firstName} 
              lastName={user.lastName} 
              size="sm"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              ?
            </div>
          )}
          {!isCollapsed && user && <span>Profile</span>}
          {!isCollapsed && !user && <span>Sign In</span>}
        </Link>
      </div>
    </aside>
  );
}
