import { useRemindersData } from '~/hooks/useReminderScheduler';
import { Button } from '~/components/ui/button';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { clearAllReminders } from '~/services/reminderScheduler';
import { useState } from 'react';

/**
 * Component showing stats and management options for all scheduled reminders
 */
export function ReminderDashboard() {
  const { pending, stats } = useRemindersData();
  const [cleared, setCleared] = useState(false);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all reminders? This cannot be undone.')) {
      clearAllReminders();
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Reminder Scheduler Dashboard
        </h3>
        <p className="text-sm text-gray-600">View and manage your scheduled event reminders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Total Reminders</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Sent</p>
          <p className="text-2xl font-bold text-green-900">{stats.sent}</p>
        </div>
      </div>

      {/* Next Reminder */}
      {stats.nextReminder && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900 mb-1">Next Reminder</p>
              <p className="text-sm text-indigo-800 mb-1 font-mono">
                {stats.nextReminder.eventTitle}
              </p>
              <p className="text-xs text-indigo-700">
                {formatDate(stats.nextReminder.remindAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Reminders List */}
      {pending.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Pending Reminders</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pending.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{reminder.eventTitle}</p>
                  <p className="text-xs text-gray-600">
                    {reminder.minutesBefore}m before • {formatDate(reminder.remindAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No reminders scheduled yet</p>
          <p className="text-xs text-gray-500 mt-1">Create events and schedule reminders to get started</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {stats.total > 0 && (
          <Button
            onClick={handleClearAll}
            variant="outline"
            className="flex-1 text-destructive"
          >
            Clear All Reminders
          </Button>
        )}

        {cleared && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            <CheckCircle className="w-4 h-4" />
            Reminders cleared!
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-2">ℹ️ How reminders work:</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Reminders are checked every 30 seconds</li>
          <li>Notifications are sent when the time arrives</li>
          <li>Reminders persist across browser sessions</li>
          <li>Browser notifications must be enabled</li>
          <li>App must be open or in an active tab to receive notifications (until service workers are enabled)</li>
        </ul>
      </div>
    </div>
  );
}
