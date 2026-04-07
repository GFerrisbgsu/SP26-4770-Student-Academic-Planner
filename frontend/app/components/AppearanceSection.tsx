import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, GraduationCap, Check } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import { userSettingsService } from '~/services/userSettingsService';

type Theme = 'light' | 'dark' | 'system' | 'bgsu';

const THEMES: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" />, description: 'Clean and bright' },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" />, description: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: <Monitor className="w-5 h-5" />, description: 'Match device settings' },
  { value: 'bgsu', label: 'BGSU', icon: <GraduationCap className="w-5 h-5" />, description: 'Falcon pride 🟠🟤' },
];

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Remove all theme classes/attributes
  root.classList.remove('dark');
  root.removeAttribute('data-theme');

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    }
  } else if (theme === 'bgsu') {
    root.setAttribute('data-theme', 'bgsu');
  }
  // 'light' is the default — no class needed

  localStorage.setItem('theme', theme);
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'bgsu';
  return (localStorage.getItem('theme') as Theme) || 'bgsu';
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}

interface AppearanceSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppearanceSection({ open, onOpenChange }: AppearanceSectionProps) {
  const { user } = useAuth();
  const [current, setCurrent] = useState<Theme>(getStoredTheme());
  const [saving, setSaving] = useState(false);

  // Listen for system theme changes when 'system' is selected
  useEffect(() => {
    if (current !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [current]);

  const handleSelect = async (theme: Theme) => {
    setCurrent(theme);
    applyTheme(theme);

    // Persist to backend
    if (user) {
      setSaving(true);
      try {
        await userSettingsService.updateUserSettings(user.id, { themePreference: theme });
      } catch {
        // Theme is already applied locally, log but don't block
        console.error('Failed to save theme preference');
      } finally {
        setSaving(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Appearance</h3>
        <button
          onClick={() => onOpenChange(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map(({ value, label, icon, description }) => {
          const isSelected = current === value;
          return (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              disabled={saving}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-center transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } disabled:opacity-70`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div className={isSelected ? 'text-blue-600' : 'text-gray-500'}>{icon}</div>
              <div>
                <p className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
