import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Activity, Power, CheckCircle, AlertCircle } from 'lucide-react';
import { sendMessageToServiceWorker } from '~/hooks/useServiceWorkerRegistration';
import { scheduleReminder, loadReminders, getPendingReminders } from '~/services/reminderScheduler';
import type { Event } from '~/types/event';

/**
 * Service Worker testing and debugging component
 * Shows registration status and allows testing of background notifications
 */
export function ServiceWorkerTestPanel() {
  const [swRegistered, setSwRegistered] = useState(false);
  const [swStatus, setSwStatus] = useState<'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | 'unknown'>('unknown');
  const [reminderStats, setReminderStats] = useState({ total: 0, pending: 0 });
  const [testOutput, setTestOutput] = useState<string[]>([]);

  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  const checkServiceWorkerStatus = async () => {
    if (!navigator.serviceWorker) {
      addOutput('Service Worker API not available');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        setSwRegistered(true);
        addOutput('Service Worker registered: ' + registration.scope);
        
        // Check active worker
        if (registration.active) {
          setSwStatus('activated');
          addOutput('Service Worker is active');
        } else if (registration.installing) {
          setSwStatus('installing');
          addOutput('Service Worker is installing');
        } else if (registration.waiting) {
          setSwStatus('installed');
          addOutput('Service Worker is waiting');
        }
      } else {
        setSwRegistered(false);
        addOutput('No Service Worker registered');
      }
    } catch (error) {
      addOutput('Error checking SW status: ' + String(error));
    }

    // Update reminder stats
    const reminders = loadReminders();
    const pending = getPendingReminders();
    setReminderStats({ total: reminders.length, pending: pending.length });
  };

  const addOutput = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestOutput((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleTestReminder = async () => {
    addOutput('Creating test reminder...');

    const testEvent: Event = {
      id: 999,
      userId: 0,
      title: 'Test Event - Service Worker',
      date: new Date().toISOString().split('T')[0],
      time: new Date(Date.now() + 2 * 60000).toTimeString().split(' ')[0], // 2 minutes from now
      startTime: new Date(Date.now() + 2 * 60000).toTimeString().split(' ')[0],
      endTime: '23:59',
      description: 'This is a test event for service worker notifications',
      tag: 'personal' as any,
      courseId: undefined,
    };

    try {
      const reminder = scheduleReminder(testEvent, 1); // 1 minute before
      addOutput(`Test reminder scheduled: ${reminder.id}`);
      addOutput(`Will trigger at: ${reminder.remindAt.toLocaleTimeString()}`);
      
      // Update stats
      setTimeout(() => {
        const reminders = loadReminders();
        const pending = getPendingReminders();
        setReminderStats({ total: reminders.length, pending: pending.length });
        addOutput(`Stats updated: ${reminders.length} total, ${pending.length} pending`);
      }, 500);
    } catch (error) {
      addOutput('Error scheduling reminder: ' + String(error));
    }
  };

  const handleSendMessageToSW = () => {
    addOutput('Sending test message to service worker...');
    sendMessageToServiceWorker({
      type: 'START_REMINDER_CHECK',
    });
    addOutput('Message sent (check browser console for SW response)');
  };

  const handleClearOutput = () => {
    setTestOutput([]);
  };

  const statusColor = {
    'installed': 'text-yellow-600',
    'installing': 'text-blue-600',
    'activating': 'text-blue-600',
    'activated': 'text-green-600',
    'redundant': 'text-red-600',
    'unknown': 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Service Worker Testing Panel
        </h3>
        <p className="text-sm text-gray-600">Debug and test background notification system</p>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-600 uppercase mb-2">SW Registered</p>
          <div className="flex items-center gap-2">
            {swRegistered ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-mono text-sm text-green-600">Yes</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-mono text-sm text-red-600">No</span>
              </>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-600 uppercase mb-2">SW Status</p>
          <p className={`font-mono text-sm capitalize ${statusColor[swStatus]}`}>{swStatus}</p>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-600 uppercase mb-2">Total Reminders</p>
          <p className="font-mono text-2xl font-bold text-gray-900">{reminderStats.total}</p>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-600 uppercase mb-2">Pending</p>
          <p className="font-mono text-2xl font-bold text-blue-600">{reminderStats.pending}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={checkServiceWorkerStatus}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Power className="w-4 h-4" />
          Refresh Status
        </Button>

        <Button
          onClick={handleTestReminder}
          size="sm"
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Activity className="w-4 h-4" />
          Schedule Test Reminder
        </Button>

        <Button
          onClick={handleSendMessageToSW}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Activity className="w-4 h-4" />
          Send Test Message
        </Button>

        <Button
          onClick={handleClearOutput}
          variant="ghost"
          size="sm"
        >
          Clear Output
        </Button>
      </div>

      {/* Console Output */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Activity Log</h4>
        <div className="bg-gray-900 text-gray-100 font-mono text-xs p-4 rounded-lg h-64 overflow-y-auto space-y-1">
          {testOutput.length === 0 ? (
            <div className="text-gray-500">No activity yet...</div>
          ) : (
            testOutput.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-words">{line}</div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to Test</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click "Schedule Test Reminder" to create a test reminder (1 minute before now)</li>
          <li>Wait 1 minute for the notification to trigger</li>
          <li>Check browser notifications for "Reminder: Test Event - Service Worker"</li>
          <li>Open DevTools → Application → Service Workers to see worker status</li>
          <li>Check Console tab for detailed logs</li>
        </ol>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Service Worker requires HTTPS or localhost</li>
          <li>Notifications require user permission</li>
          <li>Service Worker persists independently of browser tabs</li>
          <li>Check IndexedDB ('StudentPlannerDB') for reminder storage</li>
        </ul>
      </div>
    </div>
  );
}
