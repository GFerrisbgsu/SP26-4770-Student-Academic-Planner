import { useState, useEffect } from 'react';
import { Phone, Globe, CalendarDays, Loader2 } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import { userSettingsService } from '~/services/userSettingsService';
import type { UserSettingsDTO } from '~/types/userSettings';

const TIME_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
];

const CALENDAR_VIEWS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'day', label: 'Day' },
];

export function UserSettingsSection() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [defaultCalendarView, setDefaultCalendarView] = useState('week');

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      try {
        const data = await userSettingsService.getUserSettings(user!.id);
        if (!active) return;
        setSettings(data);
        setPhoneNumber(data.phoneNumber || '');
        setTimeZone(data.timeZone || 'America/New_York');
        setDefaultCalendarView(data.defaultCalendarView || 'week');
      } catch {
        console.error('Failed to load user settings');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const updated = await userSettingsService.updateUserSettings(user.id, {
        phoneNumber: phoneNumber || undefined,
        timeZone,
        defaultCalendarView,
      });
      setSettings(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    phoneNumber !== (settings?.phoneNumber || '') ||
    timeZone !== (settings?.timeZone || 'America/New_York') ||
    defaultCalendarView !== (settings?.defaultCalendarView || 'week');

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Phone Number */}
      <div className="p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <label htmlFor="settings-phone" className="text-sm font-medium text-gray-900">Phone Number</label>
        </div>
        <input
          id="settings-phone"
          type="tel"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="(555) 123-4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Time Zone */}
      <div className="p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <label htmlFor="settings-tz" className="text-sm font-medium text-gray-900">Time Zone</label>
        </div>
        <select
          id="settings-tz"
          value={timeZone}
          onChange={e => setTimeZone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {TIME_ZONES.map(tz => (
            <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Default Calendar View */}
      <div className="p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="w-4 h-4 text-gray-500" />
          <label htmlFor="settings-cal-view" className="text-sm font-medium text-gray-900">Default Calendar View</label>
        </div>
        <select
          id="settings-cal-view"
          value={defaultCalendarView}
          onChange={e => setDefaultCalendarView(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {CALENDAR_VIEWS.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {hasChanges && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}
