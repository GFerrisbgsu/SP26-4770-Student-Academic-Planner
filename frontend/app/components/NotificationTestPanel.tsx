import { useState } from 'react';
import { useNotifications } from '~/context/NotificationContext';
import { sendNotification, sendReminderNotification, canSendNotifications } from '~/services/notificationService';
import { scheduleReminder } from '~/services/reminderScheduler';
import type { Event } from '~/types/event';
import { Button } from '~/components/ui/button';
import { Bell, Send, Clock } from 'lucide-react';

/**
 * Notification Test Component - For testing and demoing notification functionality
 * Shows how to send different types of notifications
 */
export function NotificationTestPanel() {
  const { hasPermission, permitNotifications, isEnabled } = useNotifications();
  const [title, setTitle] = useState('Test Notification');
  const [body, setBody] = useState('This is a test notification from Student Life!');
  const [isSending, setIsSending] = useState(false);

  const handleSendSimple = async () => {
    if (!hasPermission) {
      alert('Please enable notifications first');
      return;
    }

    if (!isEnabled) {
      alert('Notifications are currently disabled. Please enable them in settings.');
      return;
    }

    setIsSending(true);
    try {
      await sendNotification({
        title,
        options: {
          body,
          icon: '/calendar-icon.png',
          tag: 'test-notification',
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReminder = async () => {
    if (!hasPermission) {
      alert('Please enable notifications first');
      return;
    }

    if (!isEnabled) {
      alert('Notifications are currently disabled. Please enable them in settings.');
      return;
    }

    setIsSending(true);
    try {
      await sendReminderNotification('CS 2010 - Data Structures', 15);
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert('Failed to send reminder');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Testing</h3>
        <p className="text-sm text-gray-600">Test sending notifications with different configurations</p>
      </div>

      {/* Permission Status */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
        <div>
          <p className="text-sm">
            <strong>Permission Status:</strong>{' '}
            <span className={hasPermission ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
              {hasPermission ? '✓ Granted' : '✗ Not Granted'}
            </span>
          </p>
          {!hasPermission && (
            <Button onClick={permitNotifications} variant="outline" size="sm" className="mt-2 gap-2">
              <Bell className="w-4 h-4" />
              Enable Notifications
            </Button>
          )}
        </div>

        {hasPermission && (
          <div>
            <p className="text-sm">
              <strong>Notifications:</strong>{' '}
              <span className={isEnabled ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {isEnabled ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </p>
            {!isEnabled && (
              <p className="text-xs text-red-600 mt-1">Test notifications will not be sent while disabled.</p>
            )}
          </div>
        )}
      </div>

      {/* Custom Notification Sender */}
      {hasPermission && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900">Send Custom Notification</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification message"
              rows={3}
            />
          </div>

          <Button
            onClick={handleSendSimple}
            disabled={isSending}
            className="w-full gap-2"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      )}

      {/* Predefined Notifications */}
      {hasPermission && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900">Quick Examples</h4>

          <Button
            onClick={handleSendReminder}
            disabled={isSending}
            variant="secondary"
            className="w-full gap-2"
          >
            <Clock className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Event Reminder (15 min)'}
          </Button>

          <Button
            onClick={async () => {
              if (!isEnabled) {
                alert('Notifications are currently disabled. Please enable them in settings.');
                return;
              }
              setIsSending(true);
              try {
                await sendNotification({
                  title: 'Assignment Due Soon!',
                  options: {
                    body: 'Your CS 3060 assignment is due in 3 hours',
                    icon: '/calendar-icon.png',
                    tag: 'assignment-reminder',
                    requireInteraction: true,
                  },
                });
              } finally {
                setIsSending(false);
              }
            }}
            disabled={isSending}
            variant="secondary"
            className="w-full gap-2"
          >
            <Bell className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Assignment Alert'}
          </Button>

          {/* Schedule a test reminder for 1 minute from now */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Schedule a test reminder for 1 minute from now:</p>
            <Button
              onClick={() => {
                const testEvent: Event = {
                  id: 999,
                  userId: 0,
                  title: 'Test Reminder Event',
                  date: new Date().toISOString().split('T')[0],
                  time: new Date(Date.now() + 60000).toTimeString().slice(0, 5),
                };
                try {
                  scheduleReminder(testEvent, 1);
                  alert('Test reminder scheduled for 1 minute from now!');
                } catch (error) {
                  console.error('Failed to schedule test reminder:', error);
                  alert('Failed to schedule reminder');
                }
              }}
              variant="secondary"
              className="w-full gap-2"
            >
              <Clock className="w-4 h-4" />
              Schedule Test Reminder (1m)
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <p className="font-medium mb-2">💡 Testing Tips:</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Notifications appear as native browser popups</li>
          <li>Check your system notification settings if you don't see anything</li>
          <li>Try sending a test notification to verify permissions work</li>
          <li>Notifications persist in your notification center</li>
        </ul>
      </div>
    </div>
  );
}
