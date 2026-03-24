import { useNotifications } from '~/context/NotificationContext';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { Bell, BellOff, AlertCircle } from 'lucide-react';

export interface NotificationPermissionButtonProps {
  variant?: 'default' | 'compact';
}

/**
 * Button component for requesting notification permissions and toggling notifications
 * Variants:
 * - default: Full button with text and toggle switch (for profile page)
 * - compact: Icon only (for topbar/header)
 */
export function NotificationPermissionButton({ variant = 'default' }: NotificationPermissionButtonProps) {
  const { permission, isSupported, permitNotifications, hasPermission, isEnabled, toggleNotificationsEnabled } = useNotifications();

  if (!isSupported) {
    if (variant === 'compact') {
      return (
        <div title="Notifications not supported" className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 cursor-not-allowed">
          <BellOff className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Notifications are not supported in your browser.</span>
      </div>
    );
  }

  if (permission === 'denied') {
    if (variant === 'compact') {
      return (
        <div title="Notifications denied. Enable in browser settings" className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 cursor-not-allowed">
          <BellOff className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Notification permissions have been denied. You can re-enable them in your browser settings.</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={permitNotifications}
        title={hasPermission && isEnabled ? 'Notifications enabled' : 'Click to enable notifications'}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          hasPermission && isEnabled
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  // Default variant with toggle switch
  return (
    <div className="space-y-4">
      <div>
        <Button
          onClick={permitNotifications}
          variant={hasPermission ? 'secondary' : 'default'}
          className="gap-2 w-full justify-start"
        >
          {hasPermission ? (
            <>
              <Bell className="w-4 h-4" />
              Notifications Enabled
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4" />
              Enable Notifications
            </>
          )}
        </Button>
      </div>

      {hasPermission && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 text-sm">Notifications</p>
            <p className="text-xs text-gray-600 mt-1">
              {isEnabled ? 'You will receive reminders' : 'Reminders are muted'}
            </p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={() => toggleNotificationsEnabled()} />
        </div>
      )}
    </div>
  );
}
