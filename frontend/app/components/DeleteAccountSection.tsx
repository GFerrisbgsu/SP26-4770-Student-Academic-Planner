import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { userService } from '~/services/userService';
import { userSettingsService } from '~/services/userSettingsService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';

export function DeleteAccountSection() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleClearData = async () => {
    setDeleting(true);
    setError('');
    try {
      // Clear data resets settings + avatar but keeps the account
      await userService.deleteAvatar(user.id).catch(() => {});
      await userSettingsService.updateUserSettings(user.id, {
        phoneNumber: '',
        timeZone: 'America/New_York',
        defaultCalendarView: 'week',
      }).catch(() => {});
      await refreshUser();
      setShowClearDialog(false);
      // Reload to refresh all settings components
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== user.username) return;
    setDeleting(true);
    setError('');
    try {
      await userService.deleteUser(user.id);
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
      <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-4">Danger Zone</h2>
      
      <div className="space-y-3">
        {/* Clear Data */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">Clear Profile Data</p>
            <p className="text-xs text-gray-500">Remove your avatar and reset settings. Your account stays active.</p>
          </div>
          <button
            onClick={() => setShowClearDialog(true)}
            className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
          >
            Clear Data
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
          <div>
            <p className="text-sm font-medium text-red-700">Delete Account</p>
            <p className="text-xs text-red-500">Permanently delete your account and all associated data.</p>
          </div>
          <button
            onClick={() => { setShowDeleteDialog(true); setConfirmText(''); setError(''); }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-1.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Clear Data Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Profile Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your avatar and reset your settings to defaults. Your account, courses, and events will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              disabled={deleting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {deleting ? 'Clearing...' : 'Clear Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Delete Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This action <strong>cannot be undone</strong>. This will permanently delete your account, settings, events, and all associated data.</p>
                <div>
                  <label htmlFor="confirm-delete" className="block text-sm font-medium text-gray-700 mb-1">
                    Type <strong>{user.username}</strong> to confirm:
                  </label>
                  <input
                    id="confirm-delete"
                    type="text"
                    value={confirmText}
                    onChange={e => setConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={user.username}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting || confirmText !== user.username}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
