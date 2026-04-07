import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Clock, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap, Save, LayoutGrid, Columns2, Library } from 'lucide-react';
import { getAllEventsForMonth } from '~/utils/generateEvents';
import type { CalendarEvent, CourseForEvents } from '~/utils/generateEvents';
import { getEnrolledCourses } from '~/services/courseService';
import { getTagInfo, getAllTags } from '~/utils/tagUtils';
import type { EventTag } from '~/utils/tagUtils';
import { SavePresetModal } from '~/components/SavePresetModal';
import { PresetLibraryModal } from '~/components/PresetLibraryModal';
import { EditPresetModal } from '~/components/EditPresetModal';
import type { Preset, PresetBlock, DayOfWeek } from '~/types/preset';
import { addPreset, getUserPresets, updatePreset } from '~/utils/presetUtils';

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

// Time blocking constants
const HOUR_HEIGHT = 80; // pixels per hour
const DEFAULT_VIEW_START_HOUR = 6; // 6 AM
const CONTAINER_HEIGHT = 600; // pixels
const SCROLL_OFFSET = 100; // offset for centering the default view

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
  

  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    try {
      const saved = localStorage.getItem('timeBlocks');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load time blocks from localStorage:', error);
      return [];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showEditPresetModal, setShowEditPresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);

  // Persist time blocks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timeBlocks', JSON.stringify(timeBlocks));
    } catch (error) {
      console.error('Failed to save time blocks to localStorage:', error);
    }
  }, [timeBlocks]);


  
  // Drag-to-create state
  const [dragStart, setDragStart] = useState<{ hour: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ hour: number; y: number } | null>(null);
  const [draggedDate, setDraggedDate] = useState<Date | null>(null);

  // Move/resize state
  const [moveState, setMoveState] = useState<{ blockId: string; startY: number; originalStart: number; originalEnd: number; date: string } | null>(null);
  const [resizeState, setResizeState] = useState<{ blockId: string; handle: 'top' | 'bottom'; startY: number; originalStart: number; originalEnd: number; date: string } | null>(null);

  // Helper to get consistent date string (without timezone issues)
  // MUST be defined before functions that use it to avoid temporal dead zone errors
  const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
        date: getDateString(date)
      }));
  };

  // Get blocks for a specific date
  const getBlocksForDate = (date: Date) => {
    const dateStr = getDateString(date);
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
  


  // Time slots from 12 AM to 11:59 PM (all 24 hours)
  // Default view shows 6 AM - 11 PM, but users can scroll to see earlier/later times
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

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
    const startOffset = block.startTime * HOUR_HEIGHT;
    const duration = block.endTime - block.startTime;
    const height = duration * HOUR_HEIGHT;
    return { top: startOffset, height };
  };

  const handleDeleteBlock = (id: string) => {
    if (confirm('Are you sure you want to delete this time block?')) {
      setTimeBlocks(prev => prev.filter(b => b.id !== id));
      setSelectedBlock(null);
    }
  };

  const handleCopyBlock = (targetDate: Date) => {
    if (!selectedBlock || selectedBlock.isCalendarEvent) {
      alert('Cannot copy calendar events');
      return;
    }

    const dateStr = getDateString(targetDate);
    const newBlock: TimeBlock = {
      ...selectedBlock,
      id: `block-${Date.now()}-${Math.random()}`,
      date: dateStr
    };

    setTimeBlocks(prev => [...prev, newBlock]);
    setShowCopyModal(false);
    setSelectedBlock(null);
    alert(`Block "${newBlock.title}" copied to ${targetDate.toLocaleDateString()}`);
  };

  const handleSavePreset = (preset: Omit<Preset, 'createdAt' | 'updatedAt'>) => {
    try {
      addPreset(preset);
      setShowSavePresetModal(false);
      setSelectedBlock(null);
      alert(`Preset "${preset.name}" saved successfully!`);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset');
    }
  };

  const handleLoadPreset = (preset: Preset) => {
    const dateStr = getDateString(selectedDate);
    
    // Convert preset blocks to time blocks with current date
    const newBlocks = preset.blocks.map((block, idx) => ({
      id: `block-${Date.now()}-${idx}-${Math.random()}`,
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      tag: block.tag,
      description: block.description,
      isCalendarEvent: false,
      date: dateStr
    }));

    setTimeBlocks(prev => [...prev, ...newBlocks]);
    setShowLibraryModal(false);
    alert(`Loaded "${preset.name}" with ${newBlocks.length} block${newBlocks.length !== 1 ? 's' : ''} to ${selectedDate.toLocaleDateString()}`);
  };

  const handleEditPreset = (updates: Partial<Preset>) => {
    if (!editingPreset) return;

    try {
      console.log('Updating preset:', editingPreset.id, updates);
      updatePreset(editingPreset.id, updates);
      setShowEditPresetModal(false);
      setEditingPreset(null);
      alert('Preset updated successfully!');
    } catch (error) {
      console.error('Failed to update preset:', error);
      alert('Failed to update preset');
    }
  };

  const getTotalTimeByTag = () => {
    // start with zero for every known tag
    const totals: Record<string, number> = {};
    getAllTags().forEach(tag => (totals[tag] = 0));

    const dateStr = getDateString(selectedDate);
    timeBlocks.filter(b => b.date === dateStr).forEach(block => {
      const duration = block.endTime - block.startTime;
      if (!(block.tag in totals)) {
        totals[block.tag] = 0;
      }
      totals[block.tag] += duration;
    });

    return totals;
  };

  // Convert pixel position to time in decimal hours
  const pixelToTime = (pixelY: number): number => {
    const offsetFromTop = pixelY;
    const hours = offsetFromTop / HOUR_HEIGHT;
    return DEFAULT_VIEW_START_HOUR + hours;
  };

  // Handle block move start
  const handleMoveStart = (e: React.MouseEvent, blockId: string, block: TimeBlock) => {
    e.stopPropagation(); // Prevent triggering drag-to-create
    if (e.button !== 0) return; // Only left click
    
    const dateStr = block.date || getDateString(selectedDate);
    const container = e.currentTarget.closest('[data-time-grid]');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    setMoveState({
      blockId,
      startY: y,
      originalStart: block.startTime,
      originalEnd: block.endTime,
      date: dateStr
    });
  };

  // Handle block resize start
  const handleResizeStart = (e: React.MouseEvent, blockId: string, handle: 'top' | 'bottom', block: TimeBlock) => {
    e.stopPropagation(); // Prevent triggering drag-to-create or move
    if (e.button !== 0) return; // Only left click
    
    const dateStr = block.date || getDateString(selectedDate);
    const container = e.currentTarget.closest('[data-time-grid]');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    setResizeState({
      blockId,
      handle,
      startY: y,
      originalStart: block.startTime,
      originalEnd: block.endTime,
      date: dateStr
    });
  };

  // Handle move/resize drag
  const handleMoveResizeDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeGrid = (e.currentTarget as HTMLElement).closest('[data-time-grid]');
    if (!timeGrid) return;
    
    const rect = timeGrid.getBoundingClientRect();
    const currentY = e.clientY - rect.top;

    if (moveState) {
      const deltaPixels = currentY - moveState.startY;
      const deltaHours = deltaPixels / HOUR_HEIGHT;
      const newStart = Math.max(0, Math.min(24, moveState.originalStart + deltaHours));
      const duration = moveState.originalEnd - moveState.originalStart;
      const newEnd = Math.min(24, newStart + duration);

      setTimeBlocks(prev => prev.map(b => 
        b.id === moveState.blockId && b.date === moveState.date
          ? { ...b, startTime: newStart, endTime: newEnd }
          : b
      ));
    } else if (resizeState) {
      const deltaPixels = currentY - resizeState.startY;
      const deltaHours = deltaPixels / HOUR_HEIGHT;

      if (resizeState.handle === 'top') {
        const newStart = Math.max(0, Math.min(resizeState.originalEnd - 0.25, resizeState.originalStart + deltaHours));
        setTimeBlocks(prev => prev.map(b => 
          b.id === resizeState.blockId && b.date === resizeState.date
            ? { ...b, startTime: newStart }
            : b
        ));
      } else {
        const newEnd = Math.max(resizeState.originalStart + 0.25, Math.min(24, resizeState.originalEnd + deltaHours));
        setTimeBlocks(prev => prev.map(b => 
          b.id === resizeState.blockId && b.date === resizeState.date
            ? { ...b, endTime: newEnd }
            : b
        ));
      }
    }
  };

  // Handle move/resize end
  const handleMoveResizeEnd = () => {
    setMoveState(null);
    setResizeState(null);
  };

  // Handle drag start in daily view
  const handleDragStartDaily = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    
    // Only trigger drag-to-create if clicking directly on the background (not on a block)
    if ((e.target as HTMLElement).closest('[data-time-grid] > div > div')) {
      return; // Clicked on something inside the grid, not background
    }
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const time = pixelToTime(y);
    
    setDragStart({ hour: time, y });
    setDragCurrent({ hour: time, y });
    setDraggedDate(selectedDate);
  };

  // Handle drag start in weekly view
  const handleDragStartWeekly = (e: React.MouseEvent<HTMLDivElement>, date: Date) => {
    if (e.button !== 0) return; // Only left mouse button
    
    // Only trigger drag-to-create if clicking directly on the background (not on a block)
    if ((e.target as HTMLElement).closest('[data-time-grid] > div')) {
      return; // Clicked on something inside the grid, not background
    }
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const time = pixelToTime(y);
    
    setDragStart({ hour: time, y });
    setDragCurrent({ hour: time, y });
    setDraggedDate(date);
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    
    const timeGrid = (e.currentTarget as HTMLElement).closest('[data-time-grid]');
    if (!timeGrid) return;
    
    const rect = timeGrid.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const time = pixelToTime(y);
    
    setDragCurrent({ hour: time, y });
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!dragStart || !dragCurrent || !draggedDate) {
      setDragStart(null);
      setDragCurrent(null);
      setDraggedDate(null);
      return;
    }

    const startTime = Math.min(dragStart.hour, dragCurrent.hour);
    const endTime = Math.max(dragStart.hour, dragCurrent.hour);
    
    // Minimum 15 minute blocks
    if (endTime - startTime < 0.25) {
      setDragStart(null);
      setDragCurrent(null);
      setDraggedDate(null);
      return;
    }

    // Open modal with pre-filled times
    setShowAddModal(true);
    
    // Store the drag info for the modal to use
    (window as any).__dragInfo = {
      startTime,
      endTime,
      date: draggedDate
    };

    setDragStart(null);
    setDragCurrent(null);
    setDraggedDate(null);
  };

  const timeTotals = getTotalTimeByTag();

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
                  onClick={() => setShowLibraryModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Library className="w-4 h-4" />
                  Preset Library
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
                dragStart={dragStart}
                dragCurrent={dragCurrent}
                onDragStart={handleDragStartDaily}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onMoveStart={handleMoveStart}
                onResizeStart={handleResizeStart}
                onMoveResizeDrag={handleMoveResizeDrag}
                onMoveResizeEnd={handleMoveResizeEnd}
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
                dragStart={dragStart}
                dragCurrent={dragCurrent}
                draggedDate={draggedDate}
                onDragStart={handleDragStartWeekly}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onMoveStart={handleMoveStart}
                onResizeStart={handleResizeStart}
                onMoveResizeDrag={handleMoveResizeDrag}
                onMoveResizeEnd={handleMoveResizeEnd}
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
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => setShowSavePresetModal(true)}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save as Preset
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCopyModal(true)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Copy to Another Day
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(selectedBlock.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Block
                    </button>
                  </div>
                </div>
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
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              
              setTimeBlocks(prev => [...prev, { ...block, id: `block-${Date.now()}`, date: dateStr }]);
              setShowAddModal(false);
              setDragStart(null);
              setDragCurrent(null);
              setDraggedDate(null);
            }}
            dragStart={dragStart}
            dragCurrent={dragCurrent}
          />
        )}

        {/* Copy Block Modal */}
        {showCopyModal && selectedBlock && (
          <CopyBlockModal
            block={selectedBlock}
            currentDate={selectedDate}
            onClose={() => setShowCopyModal(false)}
            onCopy={handleCopyBlock}
          />
        )}

        {/* Save Preset Modal */}
        {showSavePresetModal && selectedBlock && !selectedBlock.isCalendarEvent && (
          <SavePresetModal
            blocks={[
              {
                title: selectedBlock.title,
                startTime: selectedBlock.startTime,
                endTime: selectedBlock.endTime,
                tag: selectedBlock.tag,
                description: selectedBlock.description
              }
            ]}
            currentDate={selectedDate}
            onClose={() => setShowSavePresetModal(false)}
            onSave={handleSavePreset}
          />
        )}

        {/* Preset Library Modal */}
        {showLibraryModal && (
          <PresetLibraryModal
            userPresets={getUserPresets()}
            onClose={() => setShowLibraryModal(false)}
            onLoadPreset={handleLoadPreset}
            onEditPreset={(preset) => {
              setEditingPreset(preset);
              setShowEditPresetModal(true);
            }}
          />
        )}

        {/* Edit Preset Modal */}
        {showEditPresetModal && editingPreset && (
          <EditPresetModal
            preset={editingPreset}
            onClose={() => {
              setShowEditPresetModal(false);
              setEditingPreset(null);
            }}
            onSave={handleEditPreset}
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
  dragStart?: { hour: number; y: number } | null;
  dragCurrent?: { hour: number; y: number } | null;
  onDragStart?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  onMoveStart?: (e: React.MouseEvent, blockId: string, block: TimeBlock) => void;
  onResizeStart?: (e: React.MouseEvent, blockId: string, handle: 'top' | 'bottom', block: TimeBlock) => void;
  onMoveResizeDrag?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMoveResizeEnd?: () => void;
}

function DailyView({ 
  timeSlots, 
  displayedBlocks, 
  calculateBlockPosition, 
  formatTime, 
  onBlockClick,
  dragStart,
  dragCurrent,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMoveStart,
  onResizeStart,
  onMoveResizeDrag,
  onMoveResizeEnd
}: DailyViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to default view start time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = DEFAULT_VIEW_START_HOUR * HOUR_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPosition - SCROLL_OFFSET;
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Scrollable container for both time column and blocks */}
      <div 
        ref={scrollContainerRef}
        style={{ height: `${CONTAINER_HEIGHT}px` }}
        className="overflow-y-auto"
      >
        <div className="flex">
          {/* Time column - scrolls with blocks */}
          <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {timeSlots.map(hour => (
              <div key={hour} className="border-b border-gray-200 px-2 py-1 text-xs text-gray-600" style={{ height: `${HOUR_HEIGHT}px` }}>
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Blocks column */}
          <div 
            data-time-grid
            className="flex-1 relative bg-white border-l border-gray-200 select-none"
            onMouseDown={onDragStart}
            onMouseMove={(e) => {
              onDragMove?.(e);
              onMoveResizeDrag?.(e);
            }}
            onMouseUp={(e) => {
              onDragEnd?.();
              onMoveResizeEnd?.();
            }}
            onMouseLeave={(e) => {
              onDragEnd?.();
              onMoveResizeEnd?.();
            }}
          >
            {/* Grid lines */}
            {timeSlots.map(hour => (
              <div key={hour} className="border-b border-gray-200" style={{ height: `${HOUR_HEIGHT}px` }}></div>
            ))}

            {/* Time blocks */}
            {displayedBlocks.map(block => {
              const { top, height } = calculateBlockPosition(block);
              const config = getTagInfo(block.tag);
              if (!config) return null;
              
              return (
                <div
                  key={block.id}
                  className={`absolute left-2 right-2 rounded-lg overflow-hidden ${config.lightColor} ${config.borderColor} border-l-4 ${block.isCalendarEvent ? 'opacity-80' : ''}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: '40px'
                  }}
                >
                  {/* Top resize handle */}
                  {!block.isCalendarEvent && (
                    <div
                      onMouseDown={(e) => onResizeStart?.(e, block.id, 'top', block)}
                      className="absolute top-0 left-0 right-0 h-1 bg-gray-400 hover:bg-gray-600 cursor-ns-resize"
                      title="Drag to resize"
                    />
                  )}

                  {/* Block content - clickable and draggable */}
                  <div
                    onMouseDown={(e) => onMoveStart?.(e, block.id, block)}
                    onClick={() => onBlockClick(block)}
                    className={`w-full h-full p-3 cursor-move flex flex-col justify-between ${!block.isCalendarEvent ? 'hover:opacity-80' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 pointer-events-none">
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

                  {/* Bottom resize handle */}
                  {!block.isCalendarEvent && (
                    <div
                      onMouseDown={(e) => onResizeStart?.(e, block.id, 'bottom', block)}
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400 hover:bg-gray-600 cursor-ns-resize"
                      title="Drag to resize"
                    />
                  )}
                </div>
              );
            })}

            {/* Drag preview */}
            {dragStart && dragCurrent && (
              <div
                className="absolute left-2 right-2 rounded-lg bg-blue-400 border-2 border-blue-600 opacity-50 pointer-events-none"
                style={{
                  top: `${Math.min(dragStart.y, dragCurrent.y)}px`,
                  height: `${Math.abs(dragCurrent.y - dragStart.y)}px`,
                  minHeight: '2px'
                }}
              ></div>
            )}
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
  dragStart?: { hour: number; y: number } | null;
  dragCurrent?: { hour: number; y: number } | null;
  draggedDate?: Date | null;
  onDragStart?: (e: React.MouseEvent<HTMLDivElement>, date: Date) => void;
  onDragMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  onMoveStart?: (e: React.MouseEvent, blockId: string, block: TimeBlock) => void;
  onResizeStart?: (e: React.MouseEvent, blockId: string, handle: 'top' | 'bottom', block: TimeBlock) => void;
  onMoveResizeDrag?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMoveResizeEnd?: () => void;
}

function WeeklyView({ 
  weekDates, 
  getBlocksForDate, 
  timeSlots, 
  calculateBlockPosition, 
  formatTime, 
  onBlockClick, 
  onDateClick,
  dragStart,
  dragCurrent,
  draggedDate,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMoveStart,
  onResizeStart,
  onMoveResizeDrag,
  onMoveResizeEnd
}: WeeklyViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Auto-scroll to default view start time on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = DEFAULT_VIEW_START_HOUR * HOUR_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPosition - SCROLL_OFFSET;
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

        {/* Single scrollable container for time column and blocks */}
        <div 
          ref={scrollContainerRef}
          style={{ height: `${CONTAINER_HEIGHT}px` }}
          className="overflow-y-auto"
        >
          <div className="flex">
            {/* Time column - scrolls with blocks */}
            <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200">
              {timeSlots.map(hour => (
                <div key={hour} className="border-b border-gray-200 px-1 py-1 text-xs text-gray-600" style={{ height: `${HOUR_HEIGHT}px` }}>
                  {formatTime(hour)}
                </div>
              ))}
            </div>

            {/* Days columns */}
            <div className="flex flex-1">
              {weekDates.map((date, dayIndex) => {
                const blocks = getBlocksForDate(date);
                const isToday = date.getTime() === today.getTime();
                
                return (
                  <div 
                    key={dayIndex} 
                    data-time-grid
                    className="flex-1 border-l border-gray-200 relative select-none"
                    onMouseDown={(e) => onDragStart?.(e, date)}
                    onMouseMove={(e) => {
                      onDragMove?.(e);
                      onMoveResizeDrag?.(e);
                    }}
                    onMouseUp={(e) => {
                      onDragEnd?.();
                      onMoveResizeEnd?.();
                    }}
                    onMouseLeave={(e) => {
                      onDragEnd?.();
                      onMoveResizeEnd?.();
                    }}
                  >
                    {/* Grid lines */}
                    {timeSlots.map(hour => (
                      <div key={hour} className={`border-b border-gray-200 ${isToday ? 'bg-blue-50/30' : ''}`} style={{ height: `${HOUR_HEIGHT}px` }}></div>
                    ))}

                    {/* Time blocks */}
                    {blocks.map(block => {
                      const { top, height } = calculateBlockPosition(block);
                      const config = getTagInfo(block.tag);
                      if (!config) return null;
                      
                      return (
                        <div
                          key={block.id}
                          className={`absolute left-1 right-1 rounded overflow-hidden ${config.lightColor} ${config.borderColor} border-l-2 ${block.isCalendarEvent ? 'opacity-80' : ''}`}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            minHeight: '30px'
                          }}
                        >
                          {/* Top resize handle */}
                          {!block.isCalendarEvent && (
                            <div
                              onMouseDown={(e) => onResizeStart?.(e, block.id, 'top', block)}
                              className="absolute top-0 left-0 right-0 h-0.5 bg-gray-400 hover:bg-gray-600 cursor-ns-resize"
                            />
                          )}

                          {/* Block content - clickable and draggable */}
                          <div
                            onMouseDown={(e) => onMoveStart?.(e, block.id, block)}
                            onClick={() => onBlockClick(block)}
                            className={`w-full h-full p-1.5 cursor-move flex flex-col justify-between ${!block.isCalendarEvent ? 'hover:opacity-80' : ''}`}
                          >
                            <div className="flex items-start gap-1 pointer-events-none">
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

                          {/* Bottom resize handle */}
                          {!block.isCalendarEvent && (
                            <div
                              onMouseDown={(e) => onResizeStart?.(e, block.id, 'bottom', block)}
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 hover:bg-gray-600 cursor-ns-resize"
                            />
                          )}
                        </div>
                      );
                    })}

                    {/* Drag preview for weekly view */}
                    {dragStart && dragCurrent && draggedDate?.getTime() === date.getTime() && (
                      <div
                        className="absolute left-1 right-1 rounded bg-blue-400 border-2 border-blue-600 opacity-50 pointer-events-none"
                        style={{
                          top: `${Math.min(dragStart.y, dragCurrent.y)}px`,
                          height: `${Math.abs(dragCurrent.y - dragStart.y)}px`,
                          minHeight: '2px'
                        }}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
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
  dragStart?: { hour: number; y: number } | null;
  dragCurrent?: { hour: number; y: number } | null;
}

function AddBlockModal({ selectedDate, onClose, onAdd, dragStart, dragCurrent }: AddBlockModalProps) {
  // Helper to convert decimal hours to HH:MM format
  const decimalToTimeString = (decimal: number): string => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Determine initial times: use drag times if available, otherwise defaults
  const getInitialStartTime = (): string => {
    if (dragStart && dragCurrent) {
      return decimalToTimeString(Math.min(dragStart.hour, dragCurrent.hour));
    }
    return '09:00';
  };

  const getInitialEndTime = (): string => {
    if (dragStart && dragCurrent) {
      const startHour = Math.min(dragStart.hour, dragCurrent.hour);
      const endHour = Math.max(dragStart.hour, dragCurrent.hour);
      // Ensure at least 15 minutes (0.25 hours)
      return decimalToTimeString(Math.max(endHour, startHour + 0.25));
    }
    return '10:00';
  };

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<EventTag>('personal');
  const [startTime, setStartTime] = useState(getInitialStartTime());
  const [endTime, setEndTime] = useState(getInitialEndTime());
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

// Copy Block Modal Component
interface CopyBlockModalProps {
  block: TimeBlock;
  currentDate: Date;
  onClose: () => void;
  onCopy: (targetDate: Date) => void;
}

function CopyBlockModal({ block, currentDate, onClose, onCopy }: CopyBlockModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(currentDate));
  const [offsetDays, setOffsetDays] = useState(1);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
  };

  const handleQuickSelect = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatTimeLocal = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Copy Time Block</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Copy "{block.title}" to another day</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick select buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 7].map(days => (
                <button
                  key={days}
                  onClick={() => handleQuickSelect(days)}
                  className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {days === 1 ? 'Tomorrow' : days === 7 ? 'Next Week' : `+${days}d`}
                </button>
              ))}
            </div>
          </div>

          {/* Date picker */}
          <div>
            <label htmlFor="copyDate" className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              id="copyDate"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Block details preview */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Block Details</div>
            <div className="text-sm font-medium text-gray-900">{block.title}</div>
            <div className="text-xs text-gray-600 mt-1">
              Same time: {formatTimeLocal(block.startTime)} - {formatTimeLocal(block.endTime)}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onCopy(selectedDate)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

