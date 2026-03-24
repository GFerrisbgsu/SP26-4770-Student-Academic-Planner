import { useState } from 'react';
import type { Event } from '~/types/event';
import { scheduleReminder, removeReminder, getEventReminders } from '~/services/reminderScheduler';
import { Button } from '~/components/ui/button';
import { Clock, X, Plus } from 'lucide-react';

export interface ReminderSchedulerProps {
  event: Event;
  onRemindersChanged?: (reminders: any[]) => void;
}

/**
 * Component for managing reminders for a specific event
 * Shows scheduled reminders and allows scheduling new ones
 */
export function ReminderScheduler({ event, onRemindersChanged }: ReminderSchedulerProps) {
  const [reminders, setReminders] = useState(() => getEventReminders(event.id));
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(15);

  const handleAddReminder = () => {
    if (isAdding) {
      return;
    }

    try {
      const reminder = scheduleReminder(event, selectedMinutes);
      const updated = getEventReminders(event.id);
      setReminders(updated);
      onRemindersChanged?.(updated);
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  };

  const handleRemoveReminder = (reminderId: string) => {
    try {
      removeReminder(reminderId);
      const updated = getEventReminders(event.id);
      setReminders(updated);
      onRemindersChanged?.(updated);
    } catch (error) {
      console.error('Failed to remove reminder:', error);
    }
  };

  const commonMinutes = [5, 10, 15, 30, 60];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Event Reminders
        </h4>

        {/* Scheduled Reminders List */}
        {reminders.length > 0 ? (
          <div className="space-y-2 mb-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-900">
                    {reminder.minutesBefore} minute{reminder.minutesBefore !== 1 ? 's' : ''} before
                  </span>
                  {reminder.isSet && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      ✓ Sent
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveReminder(reminder.id)}
                  className="p-1 text-blue-600 hover:bg-blue-200 rounded transition-colors"
                  title="Remove reminder"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No reminders scheduled yet</p>
        )}

        {/* Add New Reminder */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Add reminder:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {commonMinutes.map((minutes) => (
              <button
                key={minutes}
                onClick={() => setSelectedMinutes(minutes)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  selectedMinutes === minutes
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>

          <Button
            onClick={handleAddReminder}
            size="sm"
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule {selectedMinutes}m Reminder
          </Button>
        </div>
      </div>
    </div>
  );
}
