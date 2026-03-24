import { useState } from 'react';
import { User, Mail, Phone, LogOut, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { PasskeyManagement } from '~/components/PasskeyManagement';
import { ChangePasswordSection } from '~/components/ChangePasswordSection';
import { Avatar } from '~/components/Avatar';
import { NotificationPermissionButton } from '~/components/NotificationPermissionButton';
import { NotificationTestPanel } from '~/components/NotificationTestPanel';
import { ReminderDashboard } from '~/components/ReminderDashboard';

export function ProfilePage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle case where user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }

    setIsLoggingOut(true);
    try {
      // Call backend logout endpoint
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // If logout endpoint doesn't exist, continue with client-side cleanup
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear client-side authentication state
      logout();

      // Redirect to login page
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation Bar */}
      {/* Side Navigation Bar handled by root layout */}

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header Section */}
          <div className="bg-linear-to-br from-blue-500 to-blue-600 h-32"></div>
          
          <div className="px-8 pb-8">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  <Avatar 
                    firstName={user.firstName} 
                    lastName={user.lastName} 
                    size="xl"
                    className="border-0 shadow-none"
                  />
                </div>
                <button
                  className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>

              {/* Info Cards */}
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Username */}
                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Username</p>
                    <p className="text-sm text-gray-900 font-medium">{user.username}</p>
                  </div>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Account</h2>
                
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-red-200 transition-colors">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-red-600">{isLoggingOut ? 'Logging out...' : 'Log Out'}</p>
                    <p className="text-xs text-red-500">{isLoggingOut ? 'Please wait...' : 'Sign out of your account'}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Section - Passkeys */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PasskeyManagement />
        </div>

        {/* Password Management Section */}
        <div className="mt-6">
          <ChangePasswordSection />
        </div>

        {/* Notification Testing Section */}
        <div className="mt-6">
          <NotificationTestPanel />
        </div>

        {/* Reminder Dashboard */}
        <div className="mt-6">
          <ReminderDashboard />
        </div>

        {/* Additional Settings Cards (Optional) */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Preferences</h2>
          <div className="space-y-3">
            {/* Notifications */}
            <div className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Browser Notifications</p>
                  <p className="text-xs text-gray-500">Receive reminders and alerts</p>
                </div>
              </div>
              <NotificationPermissionButton />
            </div>
            
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">Privacy & Security</p>
                <p className="text-xs text-gray-500">Control your data and security settings</p>
              </div>
              <div className="text-gray-400">â€º</div>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div>
                <p className="text-sm font-medium text-gray-900">Appearance</p>
                <p className="text-xs text-gray-500">Customize theme and display options</p>
              </div>
              <div className="text-gray-400">â€º</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
