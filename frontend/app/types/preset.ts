import type { EventTag } from '~/utils/tagUtils';

/**
 * Represents a single preset time block (without id, date, calendar fields)
 */
export interface PresetBlock {
  title: string;
  startTime: number; // 0-24 in decimal (e.g., 9.5 = 9:30am)
  endTime: number;
  tag: EventTag;
  description?: string;
}

/**
 * Day of week: 0 = Sunday, 6 = Saturday
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Represents a named preset with configuration
 */
export interface Preset {
  id: string; // Unique identifier (e.g., "preset-123456789")
  name: string; // User-friendly name (e.g., "Weekday Study Schedule")
  description?: string; // Optional description
  daysOfWeek: DayOfWeek[]; // Days this preset applies to (e.g., [1, 2, 3, 4, 5] for weekdays)
  blocks: PresetBlock[]; // Time blocks in the preset
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  isTemplate?: boolean; // Whether this is a built-in template
  theme?: string; // Optional theme/category name
}

/**
 * Preset library stored in localStorage
 */
export interface PresetLibrary {
  presets: Preset[];
  defaultPresetId?: string; // Optional: default preset to use
}

/**
 * Default preset templates users can choose from
 */
export const DEFAULT_PRESET_TEMPLATES: Preset[] = [
  {
    id: 'template-standard-weekday',
    name: 'Standard Weekday',
    description: 'Typical weekday with classes, study, and breaks',
    daysOfWeek: [1, 2, 3, 4, 5],
    blocks: [
      { title: 'Morning Routine', startTime: 7, endTime: 8, tag: 'personal' },
      { title: 'Classes', startTime: 9, endTime: 12, tag: 'school' },
      { title: 'Lunch Break', startTime: 12, endTime: 13, tag: 'personal' },
      { title: 'Study Session', startTime: 14, endTime: 16, tag: 'school' },
      { title: 'Work/Project', startTime: 16, endTime: 18, tag: 'work' },
      { title: 'Dinner', startTime: 18, endTime: 19, tag: 'personal' },
      { title: 'Free Time', startTime: 19, endTime: 21, tag: 'personal' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemplate: true
  },
  {
    id: 'template-relaxed-weekend',
    name: 'Relaxed Weekend',
    description: 'Flexible weekend schedule with personal time',
    daysOfWeek: [0, 6],
    blocks: [
      { title: 'Sleep In', startTime: 8, endTime: 10, tag: 'personal' },
      { title: 'Brunch', startTime: 10, endTime: 11, tag: 'personal' },
      { title: 'Exercise', startTime: 11, endTime: 12, tag: 'personal' },
      { title: 'Catch-up Work', startTime: 14, endTime: 16, tag: 'work' },
      { title: 'Social Time', startTime: 18, endTime: 22, tag: 'fun' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemplate: true
  },
  {
    id: 'template-exam-prep',
    name: 'Exam Prep Day',
    description: 'Intensive study schedule for exam preparation',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    blocks: [
      { title: 'Morning Study', startTime: 8, endTime: 11, tag: 'school', description: 'Focus on weak areas' },
      { title: 'Break', startTime: 11, endTime: 12, tag: 'personal' },
      { title: 'Review Session', startTime: 12, endTime: 15, tag: 'school', description: 'Practice problems' },
      { title: 'Lunch', startTime: 15, endTime: 16, tag: 'personal' },
      { title: 'Intense Study', startTime: 16, endTime: 19, tag: 'school', description: 'Final review' },
      { title: 'Rest', startTime: 19, endTime: 21, tag: 'personal' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isTemplate: true
  }
];
