import { useState, useRef } from 'react';
import { Pencil, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import { userService } from '~/services/userService';
import { Avatar } from '~/components/Avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function EditProfileModal() {
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    if (user) {
      setUsername(user.username);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
    setError('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) resetForm();
  };

  const isFieldEmpty = (value: string) => !value.trim();

  const handleSave = async () => {
    if (!user) return;

    const errors: string[] = [];
    if (isFieldEmpty(username)) errors.push('Username');
    if (isFieldEmpty(firstName)) errors.push('First Name');
    if (isFieldEmpty(lastName)) errors.push('Last Name');
    if (isFieldEmpty(email)) errors.push('Email');

    if (errors.length > 0) {
      setError(`${errors.join(', ')} cannot be empty`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await userService.updateUser(user.id, { username: username.trim(), firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      await refreshUser();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setError('');
    try {
      await userService.uploadAvatar(user.id, file);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    if (!user) return;
    setUploadingAvatar(true);
    setError('');
    try {
      await userService.deleteAvatar(user.id);
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null;

  const avatarUrl = user.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL.replace('/api', '')}${user.avatarUrl}`)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <Pencil className="w-4 h-4" />
          Edit Profile
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar
              firstName={firstName || user.firstName}
              lastName={lastName || user.lastName}
              imageUrl={avatarUrl}
              size="lg"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadingAvatar ? 'Uploading...' : 'Upload'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="edit-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${error && isFieldEmpty(username) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
            </div>
            <div>
              <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="edit-firstName"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${error && isFieldEmpty(firstName) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
            </div>
            <div>
              <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="edit-lastName"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${error && isFieldEmpty(lastName) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${error && isFieldEmpty(email) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
