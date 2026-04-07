import type { Preset, PresetLibrary } from '~/types/preset';

const PRESET_STORAGE_KEY = 'timeBlockingPresets';
const LEGACY_PRESET_STORAGE_KEY = 'timeBlockingPresets_legacy'; // For old day-of-week storage

/**
 * Load presets from localStorage (new format)
 * Also handles migration from old day-of-week format
 */
export function loadPresetsLibrary(): PresetLibrary {
  try {
    const saved = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!saved) {
      return { presets: [] };
    }

    const parsed = JSON.parse(saved);

    // Check if this is the old format (object with numeric keys for days)
    if (!Array.isArray(parsed) && !parsed.presets && typeof parsed === 'object') {
      // Old format detected: { 0: [...], 1: [...], etc. }
      // Initialize with new format and clear old data
      console.warn('Old preset format detected, clearing invalid data');
      return { presets: [] };
    }

    // If it's an array, wrap it in new format
    if (Array.isArray(parsed)) {
      return { presets: parsed };
    }

    // If it has presets property and it's an array, use it
    if (parsed.presets && Array.isArray(parsed.presets)) {
      return parsed;
    }

    // Otherwise, return empty library
    console.warn('Invalid preset format, returning empty library');
    return { presets: [] };
  } catch (error) {
    console.error('Failed to load presets library:', error);
    return { presets: [] };
  }
}

/**
 * Save presets to localStorage (new format)
 */
export function savePresetsLibrary(library: PresetLibrary): boolean {
  try {
    if (!library.presets || !Array.isArray(library.presets)) {
      throw new Error('Invalid preset library structure');
    }
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(library));
    return true;
  } catch (error) {
    console.error('Failed to save presets library:', error);
    return false;
  }
}

/**
 * Add a new preset to the library
 */
export function addPreset(preset: Omit<Preset, 'createdAt' | 'updatedAt'>): Preset {
  if (!preset.name || preset.name.trim().length === 0) {
    throw new Error('Preset name is required');
  }

  if (!preset.blocks || preset.blocks.length === 0) {
    throw new Error('Preset must contain at least one block');
  }

  if (!preset.daysOfWeek || preset.daysOfWeek.length === 0) {
    throw new Error('Preset must be assigned to at least one day');
  }

  const library = loadPresetsLibrary();
  
  const presetWithTimestamps: Preset = {
    ...preset,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  library.presets.push(presetWithTimestamps);
  
  if (!savePresetsLibrary(library)) {
    throw new Error('Failed to save preset to storage');
  }

  return presetWithTimestamps;
}

/**
 * Delete a preset by ID
 */
export function deletePreset(presetId: string): boolean {
  const library = loadPresetsLibrary();
  const initialLength = library.presets.length;
  
  library.presets = library.presets.filter(p => p.id !== presetId);
  
  if (library.presets.length < initialLength) {
    return savePresetsLibrary(library);
  }
  
  return false;
}

/**
 * Get a preset by ID
 */
export function getPreset(presetId: string): Preset | null {
  const library = loadPresetsLibrary();
  return library.presets.find(p => p.id === presetId) || null;
}

/**
 * Get all presets (excluding templates)
 */
export function getUserPresets(): Preset[] {
  const library = loadPresetsLibrary();
  return library.presets.filter(p => !p.isTemplate);
}

/**
 * Get presets for specific days
 */
export function getPresetsForDays(daysOfWeek: number[]): Preset[] {
  const library = loadPresetsLibrary();
  return library.presets.filter(p => 
    daysOfWeek.some(day => p.daysOfWeek.includes(day as any))
  );
}

/**
 * Update a preset
 */
export function updatePreset(presetId: string, updates: Partial<Preset>): Preset | null {
  const library = loadPresetsLibrary();
  const presetIndex = library.presets.findIndex(p => p.id === presetId);
  
  if (presetIndex === -1) {
    return null;
  }

  const updated: Preset = {
    ...library.presets[presetIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  library.presets[presetIndex] = updated;
  savePresetsLibrary(library);

  return updated;
}

/**
 * Get presets by tag
 */
export function getPresetsByTag(tag: string): Preset[] {
  const library = loadPresetsLibrary();
  return library.presets.filter(p => 
    p.blocks.some(block => block.tag === tag)
  );
}

/**
 * Clear all presets (for migration/reset)
 */
export function clearAllPresets(): boolean {
  try {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify({ presets: [] }));
    return true;
  } catch (error) {
    console.error('Failed to clear presets:', error);
    return false;
  }
}
