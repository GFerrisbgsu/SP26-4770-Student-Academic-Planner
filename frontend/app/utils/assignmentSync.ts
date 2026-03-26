export const ASSIGNMENTS_CHANGED_EVENT = 'sap:assignments-changed';
const ASSIGNMENTS_CHANGED_STORAGE_KEY = 'sap.assignments.changed';

export interface AssignmentsChangedPayload {
  courseId?: string;
  assignmentId?: number;
  timestamp?: number;
}

export function notifyAssignmentsChanged(payload: AssignmentsChangedPayload = {}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const detail: AssignmentsChangedPayload = {
    ...payload,
    timestamp: Date.now(),
  };

  window.dispatchEvent(new CustomEvent<AssignmentsChangedPayload>(ASSIGNMENTS_CHANGED_EVENT, { detail }));

  try {
    window.localStorage.setItem(ASSIGNMENTS_CHANGED_STORAGE_KEY, JSON.stringify(detail));
  } catch {
    // Ignore storage errors to avoid blocking UI updates.
  }
}

export function subscribeAssignmentsChanged(
  callback: (payload: AssignmentsChangedPayload) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent<AssignmentsChangedPayload>;
    callback(customEvent.detail || {});
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== ASSIGNMENTS_CHANGED_STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      const payload = JSON.parse(event.newValue) as AssignmentsChangedPayload;
      callback(payload);
    } catch {
      // Ignore malformed storage payloads.
    }
  };

  window.addEventListener(ASSIGNMENTS_CHANGED_EVENT, handleEvent as EventListener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(ASSIGNMENTS_CHANGED_EVENT, handleEvent as EventListener);
    window.removeEventListener('storage', handleStorage);
  };
}
