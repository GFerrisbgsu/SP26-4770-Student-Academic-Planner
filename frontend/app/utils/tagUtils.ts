// Tag type definitions
export type PredefinedEventTag = 'school' | 'work' | 'personal' | 'meeting' | 'fun';
/**
 * EventTag can be one of the predefined categories or any custom
 * string created by the user. Using a union with `string` allows
 * the compiler to accept runtime tag names while still providing
 * autocomplete for the built-ins.
 */
export type EventTag = PredefinedEventTag | string;

// Core configuration for the five built‑in tags.  Additional custom
// tags are stored separately (usually in localStorage) and merged at
// runtime via helper functions below.
interface TagInfo {
  label: string;
  color: string;
  lightColor: string;
  borderColor: string;
  textColor: string;
  hoverColor: string;
  activeClass: string;
  inactiveClass: string;
}

export const predefinedTagConfig: Record<PredefinedEventTag, TagInfo> = {
  school: {
    label: 'School',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    hoverColor: 'hover:bg-blue-600',
    activeClass: 'bg-blue-100 text-blue-700 font-medium',
    inactiveClass: 'bg-gray-100 text-gray-600',
  },
  work: {
    label: 'Work',
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    hoverColor: 'hover:bg-green-600',
    activeClass: 'bg-green-100 text-green-700 font-medium',
    inactiveClass: 'bg-gray-100 text-gray-600',
  },
  personal: {
    label: 'Personal',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
    hoverColor: 'hover:bg-purple-600',
    activeClass: 'bg-purple-100 text-purple-700 font-medium',
    inactiveClass: 'bg-gray-100 text-gray-600',
  },
  meeting: {
    label: 'Meeting',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-700',
    hoverColor: 'hover:bg-orange-600',
    activeClass: 'bg-orange-100 text-orange-700 font-medium',
    inactiveClass: 'bg-gray-100 text-gray-600',
  },
  fun: {
    label: 'Fun',
    color: 'bg-pink-500',
    lightColor: 'bg-pink-100',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-700',
    hoverColor: 'hover:bg-pink-600',
    activeClass: 'bg-pink-100 text-pink-700 font-medium',
    inactiveClass: 'bg-gray-100 text-gray-600',
  },
};

// Export a mutable view for compatibility with existing imports.
// Other modules can still reference `tagConfig`, which is seeded
// with predefined tags and then augmented with any previously
// saved custom tags.  The getters above will always merge again if
// needed, but mutating this object ensures synchronous access when
// components read directly (e.g. event pages).
export const tagConfig: Record<string, TagInfo> = { ...predefinedTagConfig };

// immediately merge any saved custom tags so that an immediate
// lookup (before a hook fires) will succeed for previously created
// tags.  When this module is executed on the server there is no
// window/localStorage, so loadCustomTags() returns {}.  We also
// perform the merge again on the client so that hydration or a
// fresh page load will pick up user-defined tags stored in
// localStorage.
if (typeof window !== 'undefined') {
  Object.assign(tagConfig, loadCustomTags());
}

// Get tag info - always fresh from configs (never stale from global tagConfig)
export function getTagInfo(tag: EventTag): TagInfo | undefined {
  const configs = getAllTagConfigs();
  return configs[tag];
}

// Get color for tag (handles custom tags as well)
export function getTagColor(tag: EventTag): string {
  const info = getTagInfo(tag);
  if (info) {
    return `${info.lightColor} ${info.borderColor}`;
  }
  return ''; // fallback if tag not found
}

// Get tag label (falls back to raw string for unknown tags)
export function getTagLabel(tag: EventTag): string {
  return getTagInfo(tag)?.label || tag;
}

// Auto-suggest tag based on event properties
export function suggestTag(title: string, time?: number, isWeekend?: boolean): EventTag {
  const lowerTitle = title.toLowerCase();
  
  // School patterns
  if (
    lowerTitle.match(/cs|math|eng|lecture|class|study|assignment|exam|homework|project/) ||
    (time !== undefined && time >= 8 && time <= 17)
  ) {
    return 'school';
  }
  
  // Work patterns
  if (lowerTitle.match(/shift|work|job|internship/)) {
    return 'work';
  }
  
  // Meeting patterns
  if (lowerTitle.match(/meeting|appointment|with|office hours|advising/)) {
    return 'meeting';
  }
  
  // Fun patterns
  if ((time !== undefined && time >= 18) || isWeekend) {
    if (lowerTitle.match(/movie|game|party|concert|dinner|hang|fun|club/)) {
      return 'fun';
    }
  }
  
  // Default to personal
  return 'personal';
}

// -----------------------------------------------------------------------------
// Custom tag persistence / helpers
// -----------------------------------------------------------------------------

const CUSTOM_TAGS_KEY = 'customTags';

function loadCustomTags(): Record<string, TagInfo> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(CUSTOM_TAGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCustomTags(tags: Record<string, TagInfo>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_TAGS_KEY, JSON.stringify(tags));
}

function createCustomTagConfig(label: string, baseColor: string): TagInfo {
  return {
    label,
    color: `bg-${baseColor}-500`,
    lightColor: `bg-${baseColor}-100`,
    borderColor: `border-${baseColor}-500`,
    textColor: `text-${baseColor}-700`,
    hoverColor: `hover:bg-${baseColor}-600`,
    activeClass: `bg-${baseColor}-100 text-${baseColor}-700 font-medium`,
    inactiveClass: 'bg-gray-100 text-gray-600',
  };
}

/**
 * Return a merged view of predefined + custom tags.  This is the
 * authoritative source for anything that iterates over tags.
 */
export function getAllTagConfigs(): Record<string, TagInfo> {
  const custom = loadCustomTags();
  return { ...predefinedTagConfig, ...custom };
}

/**
 * Convenience helper for callers that just need the list of tag keys.
 */
export function getAllTags(): EventTag[] {
  return Object.keys(getAllTagConfigs()) as EventTag[];
}

/**
 * Adds a new custom tag with the given key (should be lowercase
 * identifier).  Will silently overwrite if a tag with the same key
 * exists, so callers should validate beforehand.
 */
export function addCustomTag(key: string, label: string, baseColor: string) {
  const current = loadCustomTags();
  const cfg = createCustomTagConfig(label, baseColor);
  current[key] = cfg;
  saveCustomTags(current);
  // also mutate global tagConfig so existing consumers see the new tag
  tagConfig[key] = cfg;
}

/**
 * Deletes a custom tag, removing it from storage and the global config.
 * Events that used this tag will still display the tag name but won't find
 * color/label info for it.
 */
export function deleteCustomTag(key: string) {
  const current = loadCustomTags();
  delete current[key];
  saveCustomTags(current);
  // also remove from global tagConfig
  delete tagConfig[key];
}

/**
 * React hook that provides a stateful view of the custom tags so that
 * components can re-render when new tags are added.  The hook-syncs
 * with localStorage automatically.
 */
import { useState, useEffect } from 'react';

export function useCustomTags() {
  const [customTags, setCustomTags] = useState<Record<string, TagInfo>>(() => {
    const loaded = loadCustomTags();
    // merge immediately so that any consumer rendering before hook runs
    // still has colour info for stored tags
    Object.assign(tagConfig, loaded);
    return loaded;
  });

  const addTag = (key: string, label: string, baseColor: string) => {
    const cfg = createCustomTagConfig(label, baseColor);
    const newTags = { ...customTags, [key]: cfg };
    setCustomTags(newTags);
    saveCustomTags(newTags);
    // also update the shared config so outside consumers (which
    // might not re-render) see the new entry immediately
    tagConfig[key] = cfg;
  };

  const deleteTag = (key: string) => {
    const newTags = { ...customTags };
    delete newTags[key];
    setCustomTags(newTags);
    saveCustomTags(newTags);
    // also remove from global tagConfig
    delete tagConfig[key];
  };

  // keep state synced if something else modifies localStorage
  useEffect(() => {
    const handler = () => {
      const loaded = loadCustomTags();
      setCustomTags(loaded);
      Object.assign(tagConfig, loaded);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { customTags, addTag, deleteTag };
}
