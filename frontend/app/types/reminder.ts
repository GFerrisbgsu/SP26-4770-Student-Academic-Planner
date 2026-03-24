/**
 * Types for notification scheduling
 */

export interface ScheduledReminder {
  id: string; // Unique identifier (eventId-minutesBefore)
  eventId: number;
  eventTitle: string;
  remindAt: Date; // When to send the notification
  minutesBefore: number; // For reference
  isSet: boolean; // Has the reminder been sent?
  createdAt: Date;
}

export interface RemindersData {
  reminders: ScheduledReminder[];
  lastChecked: number; // Timestamp of last check
}
