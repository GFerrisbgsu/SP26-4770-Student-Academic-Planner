import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen, Edit2, Save, X, User, Trash2 } from 'lucide-react';
import { getAllEventsForMonth } from '~/utils/generateEvents';
import type { CalendarEvent, CourseForEvents } from '~/utils/generateEvents';
import { getAllCourses, getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/types/course';
import { getAllTagConfigs, getTagInfo } from '~/utils/tagUtils';
// ...existing code...

interface EventEditData {
  title: string;
  date: Date | null;
  startTime: number | null;
  endTime: number | null;
  location: string;
  type: 'class' | 'event';
  description: string;
  tag: string;
  completed: boolean;
}

interface EventPageProps {
  customEvents: CalendarEvent[];
  courseColors: Record<string, string>;
  onUpdateEvent: (eventId: string, updates: EventEditData) => Promise<CalendarEvent | null>;
  onDeleteEvent: (eventId: string) => Promise<boolean>;
}

function decimalHourToTimeInput(time: number | null): string {
  if (time === null || Number.isNaN(time)) {
    return '';
  }

  const hour = Math.floor(time);
  const minute = Math.round((time - hour) * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function timeInputToDecimal(value: string): number | null {
  if (!value) {
    return null;
  }

  const [hourString, minuteString] = value.split(':');
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour + (minute / 60);
}

function dateToInputValue(date: Date | null): string {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function inputValueToDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function createEditStateFromEvent(event: CalendarEvent): EventEditData {
  return {
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location || '',
    type: event.type === 'class' ? 'class' : 'event',
    description: event.description || '',
    tag: event.tag,
    completed: event.completed || false,
  };
}

export function EventPage({ customEvents, courseColors, onUpdateEvent, onDeleteEvent }: EventPageProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editData, setEditData] = useState<EventEditData | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function loadCourses() {
      try {
        const [courses, enrolled] = await Promise.all([
          getAllCourses(),
          getEnrolledCourses()
        ]);
        setAllCourses(courses);
        setEnrolledCourses(enrolled);
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    if (!eventId || enrolledCourses.length === 0) return;

    // Search for the event in all months and custom events
    let foundEvent: CalendarEvent | null = null;

    // Check custom events first
    const customEvent = customEvents.find(e => e.id === eventId);
    if (customEvent) {
      foundEvent = customEvent;
    } else {
      // Search through generated events (for a reasonable range)
      const currentDate = new Date();
      for (let i = -12; i < 24; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
        const monthEvents = getAllEventsForMonth(date.getFullYear(), date.getMonth(), enrolledCourses, courseColors);
        const matchingEvent = monthEvents.find(e => e.id === eventId);
        if (matchingEvent) {
          foundEvent = matchingEvent;
          break;
        }
      }
    }

    if (foundEvent) {
      setEvent(foundEvent);
      setEditData(createEditStateFromEvent(foundEvent));
    }
  }, [eventId, customEvents, courseColors, enrolledCourses]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Event not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    
    if (h === 23 && m === 59) {
      return '11:59 PM';
    }
    
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleSave = async () => {
    if (!event || !editData || isSaving) {
      return;
    }

    if (!editData.title.trim()) {
      setSaveError('Title is required.');
      return;
    }

    if (editData.startTime !== null && editData.endTime !== null && editData.endTime <= editData.startTime) {
      setSaveError('End time must be after start time.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      const updatedEvent = await onUpdateEvent(event.id, {
        ...editData,
        title: editData.title.trim(),
        location: editData.location.trim(),
        description: editData.description.trim(),
      });

      if (!updatedEvent) {
        setSaveError('Unable to update this event.');
        return;
      }

      setEvent(updatedEvent);
      setEditData(createEditStateFromEvent(updatedEvent));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save event:', error);
      setSaveError('Failed to save event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (isDeleting) {
      return;
    }

    if (event) {
      setEditData(createEditStateFromEvent(event));
    }
    setSaveError(null);
    setDeleteError(null);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!event || isDeleting || isSaving) {
      return;
    }

    const confirmed = window.confirm('Delete this event? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);
    try {
      const deleted = await onDeleteEvent(event.id);
      if (!deleted) {
        setDeleteError('Unable to delete this event.');
        return;
      }

      goBack();
    } catch (error) {
      console.error('Failed to delete event:', error);
      setDeleteError('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const goBack = () => {
    // Go back to the timeline page
    if (event.date) {
      const dateString = `${event.date.getFullYear()}-${event.date.getMonth() + 1}-${event.date.getDate()}`;
      navigate(`/timeline/${dateString}`);
    } else {
      navigate('/'); // Go to home if no date
    }
  };

  // Find related course if it exists
  const relatedCourse = event.courseId ? allCourses.find(c => c.id === event.courseId) : null;
  const courseColor = event.courseId && courseColors[event.courseId] 
    ? courseColors[event.courseId] 
    : relatedCourse?.color || 'bg-gray-500';
  const tagInfo = getTagInfo(event.tag);
  const eventIconColor = tagInfo?.color || 'bg-gray-500';
  const teacherName = event.type === 'class' ? (relatedCourse?.instructor || event.location) : undefined;
  const locationValue = event.type === 'class' ? undefined : event.location;
  const allTagConfigs = getAllTagConfigs();
  const availableTags = Object.entries(allTagConfigs).map(([key, value]) => ({ key, label: value.label }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation Bar */}
      {/* Side Navigation Bar handled by root layout */}
      
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Timeline
        </button>

        {/* Event Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Color bar */}
          <div className={`${eventIconColor} h-2`}></div>

          <div className="p-8">
            {/* Event Title */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`${eventIconColor} p-3 rounded-lg flex-shrink-0`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">
                  {event.type === 'class' ? 'Class' : 'Event'}
                </div>
                {/* tag badge in header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${tagInfo?.lightColor || ''} ${tagInfo?.textColor || ''}`}>
                    {tagInfo?.label || event.tag}
                  </span>
                </div>
                <h1 className="text-3xl font-semibold mb-2">{event.title}</h1>
                {relatedCourse && (
                  <p className="text-gray-600">{relatedCourse.name}</p>
                )}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Date */}
              {event.date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Date</div>
                    <div className="text-gray-900">{formatDate(event.date)}</div>
                  </div>
                </div>
              )}

              {/* Time */}
              {event.startTime !== null && event.endTime !== null && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Time</div>
                    <div className="text-gray-900">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {locationValue && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Location</div>
                    <div className="text-gray-900">{locationValue}</div>
                  </div>
                </div>
              )}

              {/* Teacher */}
              {teacherName && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Teacher</div>
                    <div className="text-gray-900">{teacherName}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Event Details</h2>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setEditData(createEditStateFromEvent(event));
                      setSaveError(null);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditing && editData ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, title: e.target.value } : prev)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Event title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                      <select
                        value={editData.tag}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, tag: e.target.value } : prev)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableTags.map(tag => (
                          <option key={tag.key} value={tag.key}>{tag.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={dateToInputValue(editData.date)}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, date: inputValueToDate(e.target.value) } : prev)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {editData.type === 'class' ? 'Teacher' : 'Location'}
                      </label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, location: e.target.value } : prev)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={editData.type === 'class' ? 'Teacher name' : 'Location'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                      <input
                        type="time"
                        value={decimalHourToTimeInput(editData.startTime)}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, startTime: timeInputToDecimal(e.target.value) } : prev)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                      <input
                        type="time"
                        value={decimalHourToTimeInput(editData.endTime)}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, endTime: timeInputToDecimal(e.target.value) } : prev)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description & Notes</label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => prev ? { ...prev, description: e.target.value } : prev)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[180px] resize-y"
                        placeholder="Add notes, context, or details about this event..."
                      />
                    </div>
                  </div>

                  {saveError && (
                    <p className="text-sm text-red-600">{saveError}</p>
                  )}

                  {deleteError && (
                    <p className="text-sm text-red-600">{deleteError}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isSaving || isDeleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting...' : 'Delete Event'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || isDeleting}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving || isDeleting}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  {event.description ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No description added yet. Click edit to add notes.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
