import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Clock, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap, Save, Upload, LayoutGrid, Columns2 } from 'lucide-react';
import { getAllEventsForMonth } from '~/utils/generateEvents';
import type { CalendarEvent, CourseForEvents } from '~/utils/generateEvents';
import { getEnrolledCourses } from '~/services/courseService';
import { tagConfig, getTagInfo, getAllTags } from '~/utils/tagUtils';
import type { EventTag } from '~/utils/tagUtils';
// ...existing code...

interface TimeBlock {
  id: string;
  title: string;
  startTime: number; // 0-24 in decimal (e.g., 9.5 = 9:30am)
  endTime: number;
  tag: EventTag;
  description?: string;
  isCalendarEvent?: boolean; // Flag to identify calendar events
  calendarEventId?: string; // Reference to original calendar event
  date?: string; // ISO date string for organizing blocks by date
}

type ViewMode = 'daily' | 'weekly';
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday

interface TimeBlockingProps {
  customEvents?: CalendarEvent[];
  courseColors?: Record<string, string>;
}

export function TimeBlocking({ customEvents = [], courseColors = {} }: TimeBlockingProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [showCalendarEvents, setShowCalendarEvents] = useState(true);
  const [courses, setCourses] = useState<CourseForEvents[]>([]);

  // Fetch enrolled courses for event generation
  useEffect(() => {
    async function loadCourses() {
      try {
        const enrolled = await getEnrolledCourses();
        setCourses(enrolled);
      } catch (error) {
        console.error('Failed to load courses for time blocking:', error);
      }
    }
    loadCourses();
  }, []);
  
  // Store presets by day of week (0-6)
  const [presets, setPresets] = useState<Record<number, Omit<TimeBlock, 'id' | 'date' | 'isCalendarEvent' | 'calendarEventId'>[]>>({
    1: [ // Monday preset example
      {
        title: 'Morning Routine',
        startTime: 7,
        endTime: 8,
        tag: 'personal',
        description: 'Breakfast, shower, get ready'
      }
    ]
  });
  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    {
      id: '1',
      title: 'Morning Routine',
      startTime: 7,
      endTime: 8,
      tag: 'personal',
      description: 'Breakfast, shower, get ready',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      title: 'Study Session',
      startTime: 11,
      endTime: 13,
      tag: 'school',
      description: 'Review lecture notes and work on assignments',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '3',
      title: 'Lunch Break',
      startTime: 13,
      endTime: 14,
      tag: 'personal',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '4',
      title: 'Work Shift',
      startTime: 15,
      endTime: 19,
      tag: 'work',
      description: 'Part-time job at library',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '5',
      title: 'Gym',
      startTime: 19.5,
      endTime: 21,
      tag: 'fun',
      date: new Date().toISOString().split('T')[0]
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);

  // Convert calendar events to time blocks
  const getCalendarEventsForDate = (date: Date): TimeBlock[] => {
    // Get all calendar events for the selected month
    const allCalendarEvents = getAllEventsForMonth(
      date.getFullYear(),
      date.getMonth(),
      courses,
      courseColors
    );
    
    // Combine with custom events
    const combinedEvents = [...allCalendarEvents, ...customEvents];
    
    // Filter events for the selected date and convert to TimeBlocks
    return combinedEvents
      .filter(event => {
        const eventDate = event.date;
        return (
          eventDate && eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate() &&
          event.startTime !== null && event.endTime !== null // Only include events with times
        );
      })
      .map(event => ({
        id: `calendar-${event.id}`,
        title: event.title,
        startTime: event.startTime!,
        endTime: event.endTime!,
        tag: event.tag,
        description: event.description,
        isCalendarEvent: true,
        calendarEventId: event.id,
        date: date.toISOString().split('T')[0]
      }));
  };

  // Get blocks for a specific date
  const getBlocksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayBlocks = timeBlocks.filter(b => b.date === dateStr);
    
    if (showCalendarEvents) {
      return [...dayBlocks, ...getCalendarEventsForDate(date)];
    }
    return dayBlocks;
  };

  // Combine time blocks with calendar events if toggle is on
  const displayedBlocks = getBlocksForDate(selectedDate);
  
  // Get the week start date (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };
  
  // Get array of dates for the week
  const getWeekDates = () => {
    const weekStart = getWeekStart(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  };
  
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };
  
  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };
  
  // Preset management functions
  const savePresetForDay = (dayOfWeek: DayOfWeek) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayBlocks = timeBlocks.filter(b => b.date === dateStr && !b.isCalendarEvent);
    
    const presetBlocks = dayBlocks.map(({ id, date, isCalendarEvent, calendarEventId, ...rest }) => rest);
    
    setPresets(prev => ({
      ...prev,
      [dayOfWeek]: presetBlocks
    }));
    
    alert(`Preset saved for ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}!`);
  };
  
  const loadPresetForDay = (dayOfWeek: DayOfWeek) => {
    const preset = presets[dayOfWeek];
    if (!preset || preset.length === 0) {
      alert('No preset found for this day of the week.');
      return;
    }
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Convert preset blocks to time blocks with current date
    const newBlocks = preset.map(block => ({
      ...block,
      id: `block-${Date.now()}-${Math.random()}`,
      date: dateStr
    }));
    
    setTimeBlocks(prev => [...prev, ...newBlocks]);
    alert(`Loaded ${newBlocks.length} blocks from ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]} preset!`);
    setShowPresetModal(false);
  };

  // Time slots from 6 AM to 11 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  const formatTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDateHeader = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const calculateBlockPosition = (block: TimeBlock) => {
    const startOffset = (block.startTime - 6) * 80; // 80px per hour
    const duration = block.endTime - block.startTime;
    const height = duration * 80;
    return { top: startOffset, height };
  };

  const handleDeleteBlock = (id: string) => {
    if (confirm('Are you sure you want to delete this time block?')) {
      setTimeBlocks(prev => prev.filter(b => b.id !== id));
      setSelectedBlock(null);
    }
  };

  const getTotalTimeByTag = () => {
    // start with zero for every known tag
    const totals: Record<string, number> = {};
    getAllTags().forEach(tag => (totals[tag] = 0));

    const dateStr = selectedDate.toISOString().split('T')[0];
    timeBlocks.filter(b => b.date === dateStr).forEach(block => {
      const duration = block.endTime - block.startTime;
      if (!(block.tag in totals)) {
        totals[block.tag] = 0;
      }
      totals[block.tag] += duration;
    });

    return totals;
  };

  const timeTotals = getTotalTimeByTag();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Side Navigation Bar */}
      {/* Side Navigation Bar handled by root layout */}

      <div className="flex-1 overflow-hidden flex">
        {/* Main Time Blocking Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Blocking</h1>
              <p className="text-gray-600">Plan your day in focused time blocks</p>
            </div>

            {/* Date Navigation */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Columns2 className="w-4 h-4" />
                  Daily View
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Weekly View
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={viewMode === 'daily' ? goToPreviousDay : goToPreviousWeek}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {viewMode === 'daily' ? formatDateHeader() : `Week of ${getWeekStart(selectedDate).toLocaleDateString()}`}
                  </h2>
                </div>

                <button
                  onClick={viewMode === 'daily' ? goToNextDay : goToNextWeek}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setShowCalendarEvents(!showCalendarEvents)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${showCalendarEvents ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {showCalendarEvents ? 'Hide' : 'Show'} Calendar Events
                </button>
                <button
                  onClick={() => setShowPresetModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Presets
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Block
                </button>
              </div>
            </div>

            {/* Time Grid or Weekly View */}
            {viewMode === 'daily' ? (
              <DailyView 
                timeSlots={timeSlots}
                displayedBlocks={displayedBlocks}
                calculateBlockPosition={calculateBlockPosition}
                formatTime={formatTime}
                onBlockClick={setSelectedBlock}
              />
            ) : (
              <WeeklyView 
                weekDates={getWeekDates()}
                getBlocksForDate={getBlocksForDate}
                timeSlots={timeSlots}
                calculateBlockPosition={calculateBlockPosition}
                formatTime={formatTime}
                onBlockClick={setSelectedBlock}
                onDateClick={setSelectedDate}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - Time Analysis */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Analysis</h3>
          
          <div className="space-y-4 mb-6">
            {getAllTags().map(tag => {
              const hours = timeTotals[tag] || 0;
              if (hours === 0) return null;
              
              const config = getTagInfo(tag);
              const totalHours = Object.values(timeTotals).reduce((sum, h) => sum + h, 0);
              const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;

              return (
                <div key={tag}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${config?.color || ''}`}></div>
                      <span className="text-sm font-medium text-gray-700">{config?.label || tag}</span>
                    </div>
                    <span className="text-sm text-gray-600">{hours.toFixed(1)}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${config?.color || ''}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}</div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Blocking Tips
            </h4>
            <ul className="text-xs text-blue-800 space-y-2">
              <li>• Schedule your most important tasks during peak energy hours</li>
              <li>• Include buffer time between blocks</li>
              <li>• Don't forget breaks and meals</li>
              <li>• Be realistic about task duration</li>
              <li>• Review and adjust at end of day</li>
            </ul>
          </div>

          {/* Selected Block Details */}
          {selectedBlock && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Block Details</h4>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <p className="font-medium text-gray-900 flex items-center gap-2 mt-1">
                    {selectedBlock.isCalendarEvent ? (
                      <>
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        Calendar Event
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-purple-600" />
                        Time Block
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Title:</span>
                  <p className="font-medium text-gray-900">{selectedBlock.title}</p>
                </div>
                <div>
                  <span className="text-gray-600">Time:</span>
                  <p className="text-gray-900">
                    {formatTime(selectedBlock.startTime)} - {formatTime(selectedBlock.endTime)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="text-gray-900">
                    {(selectedBlock.endTime - selectedBlock.startTime).toFixed(1)} hours
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="text-gray-900">{getTagInfo(selectedBlock.tag)?.label || selectedBlock.tag}</p>
                </div>
                {selectedBlock.description && (
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <p className="text-gray-900">{selectedBlock.description}</p>
                  </div>
                )}
              </div>

              {!selectedBlock.isCalendarEvent && (
                <button
                  onClick={() => handleDeleteBlock(selectedBlock.id)}
                  className="mt-4 w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete Block
                </button>
              )}
              
              {selectedBlock.isCalendarEvent && (
                <div className="mt-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 text-center">
                  Calendar events cannot be deleted here
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Block Modal */}
        {showAddModal && (
          <AddBlockModal
            selectedDate={selectedDate}
            onClose={() => setShowAddModal(false)}
            onAdd={(block) => {
              setTimeBlocks(prev => [...prev, { ...block, id: `block-${Date.now()}`, date: selectedDate.toISOString().split('T')[0] }]);
              setShowAddModal(false);
            }}
          />
        )}

        {/* Preset Modal */}
        {showPresetModal && (
          <PresetModal
            selectedDate={selectedDate}
            presets={presets}
            onClose={() => setShowPresetModal(false)}
            onSave={savePresetForDay}
            onLoad={loadPresetForDay}
          />
        )}
      </div>
    </div>
  );
}

// Daily View Component
interface DailyViewProps {
  timeSlots: number[];
  displayedBlocks: TimeBlock[];
  calculateBlockPosition: (block: TimeBlock) => { top: number; height: number };
  formatTime: (time: number) => string;
  onBlockClick: (block: TimeBlock) => void;
}

function DailyView({ timeSlots, displayedBlocks, calculateBlockPosition, formatTime, onBlockClick }: DailyViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {timeSlots.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-200 px-2 py-1 text-xs text-gray-600">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Blocks column */}
          <div className="flex-1 relative">
            {/* Grid lines */}
            {timeSlots.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-200"></div>
            ))}

            {/* Time blocks */}
            {displayedBlocks.map(block => {
              const { top, height } = calculateBlockPosition(block);
              const config = getTagInfo(block.tag);
              if (!config) return null;
              
              return (
                <div
                  key={block.id}
                  onClick={() => onBlockClick(block)}
                  className={`absolute left-2 right-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${config.lightColor} ${config.borderColor} border-l-4 p-3 ${block.isCalendarEvent ? 'opacity-80' : ''}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: '40px'
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 mb-1 flex items-center gap-2">
                        {block.isCalendarEvent ? (
                          <CalendarIcon className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        ) : (
                          <Zap className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        )}
                        <span className="line-clamp-1">{block.title}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                      </div>
                      {block.description && height > 60 && (
                        <div className="text-xs text-gray-500 mt-2 line-clamp-2">{block.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Weekly View Component
interface WeeklyViewProps {
  weekDates: Date[];
  getBlocksForDate: (date: Date) => TimeBlock[];
  timeSlots: number[];
  calculateBlockPosition: (block: TimeBlock) => { top: number; height: number };
  formatTime: (time: number) => string;
  onBlockClick: (block: TimeBlock) => void;
  onDateClick: (date: Date) => void;
}

function WeeklyView({ weekDates, getBlocksForDate, timeSlots, calculateBlockPosition, formatTime, onBlockClick, onDateClick }: WeeklyViewProps) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Week header */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <div className="w-16 flex-shrink-0"></div>
          {weekDates.map((date, i) => {
            const isToday = date.getTime() === today.getTime();
            return (
              <div 
                key={i} 
                className={`flex-1 text-center py-3 border-l border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${isToday ? 'bg-blue-50' : ''}`}
                onClick={() => onDateClick(date)}
              >
                <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{dayNames[i]}</div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{date.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Week grid */}
        <div className="flex relative">
          {/* Time column */}
          <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {timeSlots.map(hour => (
              <div key={hour} className="h-20 border-b border-gray-200 px-1 py-1 text-xs text-gray-600">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDates.map((date, dayIndex) => {
            const blocks = getBlocksForDate(date);
            const isToday = date.getTime() === today.getTime();
            
            return (
              <div key={dayIndex} className="flex-1 border-l border-gray-200 relative">
                {/* Grid lines */}
                {timeSlots.map(hour => (
                  <div key={hour} className={`h-20 border-b border-gray-200 ${isToday ? 'bg-blue-50/30' : ''}`}></div>
                ))}

                {/* Time blocks */}
                <div className="absolute inset-0 pointer-events-none">
                  {blocks.map(block => {
                    const { top, height } = calculateBlockPosition(block);
                    const config = getTagInfo(block.tag);
                    if (!config) return null;
                    
                    return (
                      <div
                        key={block.id}
                        onClick={() => onBlockClick(block)}
                        className={`absolute left-1 right-1 rounded cursor-pointer transition-all hover:shadow-md ${config.lightColor} ${config.borderColor} border-l-2 p-1.5 pointer-events-auto ${block.isCalendarEvent ? 'opacity-80' : ''}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          minHeight: '30px'
                        }}
                      >
                        <div className="flex items-start gap-1">
                          {block.isCalendarEvent ? (
                            <CalendarIcon className="w-2.5 h-2.5 text-gray-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Zap className="w-2.5 h-2.5 text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 line-clamp-1">{block.title}</div>
                            {height > 40 && (
                              <div className="text-xs text-gray-600">{formatTime(block.startTime)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Add Block Modal Component
interface AddBlockModalProps {
  selectedDate: Date;
  onClose: () => void;
  onAdd: (block: Omit<TimeBlock, 'id' | 'date'>) => void;
}

function AddBlockModal({ selectedDate, onClose, onAdd }: AddBlockModalProps) {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<EventTag>('personal');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');

  const timeToDecimal = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    const start = timeToDecimal(startTime);
    const end = timeToDecimal(endTime);

    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    onAdd({
      title,
      tag,
      startTime: start,
      endTime: end,
      description: description || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add Time Block</h2>
          <p className="text-sm text-gray-600 mt-1">{selectedDate.toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What will you work on?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {getAllTags().map((t) => {
                const tagInfo = getTagInfo(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${tag === t ? `${tagInfo?.color || ''} text-white shadow-md` : `${tagInfo?.lightColor || ''} ${tagInfo?.textColor || ''} hover:shadow-sm`}`}
                  >
                    {tagInfo?.label || t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Preset Modal Component
interface PresetModalProps {
  selectedDate: Date;
  presets: Record<number, Omit<TimeBlock, 'id' | 'date' | 'isCalendarEvent' | 'calendarEventId'>[]>;
  onClose: () => void;
  onSave: (dayOfWeek: DayOfWeek) => void;
  onLoad: (dayOfWeek: DayOfWeek) => void;
}

function PresetModal({ selectedDate, presets, onClose, onSave, onLoad }: PresetModalProps) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayOfWeek = selectedDate.getDay() as DayOfWeek;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Preset Management</h2>
              <p className="text-sm text-gray-600 mt-1">Save or load time blocks for specific days of the week</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Save Current Day */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Current Day Blocks as Preset
            </h3>
            <p className="text-sm text-green-800 mb-3">
              Save today's time blocks ({selectedDate.toLocaleDateString()}) as a preset for:
            </p>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  onClick={() => onSave(index as DayOfWeek)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors ${index === currentDayOfWeek ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Load Presets */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Load Preset to Current Day
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Load a saved preset and add those blocks to {selectedDate.toLocaleDateString()} ({dayNames[currentDayOfWeek]}):
            </p>
            <div className="space-y-2">
              {dayNames.map((day, index) => {
                const preset = presets[index];
                const hasPreset = preset && preset.length > 0;
                const isMatchingDay = index === currentDayOfWeek;
                const canLoad = hasPreset && isMatchingDay;

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                    <div>
                      <div className={`font-medium ${isMatchingDay ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day} {isMatchingDay && '(Today)'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {hasPreset ? `${preset.length} blocks saved` : 'No preset'}
                      </div>
                    </div>
                    <button
                      onClick={() => canLoad && onLoad(index as DayOfWeek)}
                      disabled={!canLoad}
                      title={!isMatchingDay ? 'Can only load presets matching the current day of week' : !hasPreset ? 'No preset saved for this day' : 'Click to load preset'}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${canLoad ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      Load
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
